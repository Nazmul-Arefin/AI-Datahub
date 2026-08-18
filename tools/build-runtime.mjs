/**
 * Build app-runtime.js from the monolith with surgical adaptations.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let body = fs.readFileSync(path.join(root, 'app.monolith.js'), 'utf8');

// Extract IIFE body
body = body.replace(/^\s*\(\(\)\s*=>\s*\{\s*'use strict';\s*/, '');
body = body.replace(/\}\)\(\);\s*$/, '');

// Rename internal showToast so external shell toast can wrap it
body = body.replace(/function showToast\(/, 'function __legacyShowToast(');
body = body.replace(/showToast\(/g, '__showToast(');

// Avoid renaming the function definition twice
body = body.replace('function __showToast(', 'function __legacyShowToast(');

// Provide __showToast bridge used throughout
const toastBridge = `
  function __showToast(message, options = {}) {
    if (typeof __showToastExternal === 'function') {
      __showToastExternal(message, options);
      return;
    }
    __legacyShowToast(message, options);
  }
`;

// Remove original nav-item wiring (shell owns hash navigation)
body = body.replace(
  /document\.querySelectorAll\('\.nav-item'\)\.forEach\(\(item\) => \{[\s\S]*?\}\);/,
  '/* nav-item routing owned by shell.js */'
);

// Replace terminal boot so router activates the first page
body = body.replace(
  /buildUniverse\(\);\s*applyAmbientTheme\(\);\s*resize\(\);\s*const initialCluster = window\.location\.hash\.slice\(1\);\s*if \(initialCluster === 'setup'\) openOnboarding\(\);\s*else if \(initialCluster === 'new-goal'\) \{ openPrimaryView\('goals', false\); openGoalCreateSheet\(\); \}\s*else if \(initialCluster === 'goal-plan'\) \{ openPrimaryView\('goals', false\); renderGoalResultDrawer\('plan'\); \}\s*else if \(initialCluster === 'connect-source'\) \{ openPrimaryView\('data', false\); openConnectionWizard\(\); \}\s*else if \(initialCluster === 'memory-manager'\) \{ openPrimaryView\('memory', false\); openMemoryDrawer\(\); \}\s*else if \(focusContent\[initialCluster\]\) openPrimaryView\(initialCluster, false\);\s*startTopologyLoop\(\);\s*/,
  `buildUniverse();
  applyAmbientTheme();
  resize();
  /* Initial route activation is performed by activatePage via the hash router. */
`
);

// Emit store events when goals/calendar persist
body = body.replace(
  /try \{ localStorage\.setItem\('weeple-custom-goals', JSON\.stringify\(goalProfiles\.filter\(goal => goal\.custom\)\)\); \} catch \(error\) \{ \/\* storage is optional \*\/ \}/g,
  `try { localStorage.setItem('weeple-custom-goals', JSON.stringify(goalProfiles.filter(goal => goal.custom))); } catch (error) { /* storage is optional */ }
    try { if (__store) __store.emit('goals:changed', { goals: goalProfiles }); } catch (_e) { /* optional */ }`
);
body = body.replace(
  /try \{ localStorage\.setItem\('weeple-calendar-tasks', JSON\.stringify\(calendarUserTasks\)\); \} catch \(error\) \{ \/\* storage is optional \*\/ \}/g,
  `try { localStorage.setItem('weeple-calendar-tasks', JSON.stringify(calendarUserTasks)); } catch (error) { /* storage is optional */ }
    try { if (__store) __store.emit('calendar:changed', { tasks: calendarUserTasks }); } catch (_e) { /* optional */ }`
);

// Cross-page navigations also update the hash route
body = body.replace(
  /openPrimaryView\('data'/g,
  `(function(){ try { __navigate('import-data'); } catch(_n){} return openPrimaryView('data'; })(`
);
// Wait, that breaks call syntax. Use a helper instead.

body = body.replace(
  /\(function\(\)\{ try \{ __navigate\('import-data'\); \} catch\(_n\)\{\} return openPrimaryView\('data'; \}\)\(/g,
  `openPrimaryView('data'`
);

// Add helper and replace calls properly
const navHelper = `
  function openRoutedView(legacyKey, announce = true) {
    const map = { overview: 'overview', goals: 'goals', data: 'import-data', memory: 'use-data' };
    try { __navigate(map[legacyKey] || legacyKey); } catch (_n) { /* optional */ }
    return openPrimaryView(legacyKey, announce);
  }
`;

// Replace specific cross-page call sites with openRoutedView
// use → import data buttons typically call openPrimaryView('data'
// Only replace when it's a full call openPrimaryView('data' or 'memory' or 'goals' from UI
// Safer: patch openPrimaryView itself to sync hash when switching primary views

body = body.replace(
  /function openPrimaryView\(key, announce = true\) \{/,
  `function openPrimaryView(key, announce = true) {
    try {
      const map = { overview: 'overview', goals: 'goals', data: 'import-data', memory: 'use-data' };
      const routeId = map[key] || (key === 'overview' ? 'overview' : null);
      if (routeId && typeof __navigate === 'function' && !__navigating) {
        const desired = '#/' + routeId;
        if (window.location.hash.split('?')[0] !== desired) {
          __navigating = true;
          __navigate(routeId);
          __navigating = false;
          // navigate triggers hashchange → activatePage → openPrimaryView again; guard with flag
        }
      }
    } catch (_sync) { __navigating = false; }
`
);

// That creates infinite loop risk. Better approach: openPrimaryView does NOT navigate;
// only shell nav and explicit __navigate calls update hash. Internal openPrimaryView just switches DOM.
// Revert openPrimaryView patch - restore clean version

body = body.replace(
  /function openPrimaryView\(key, announce = true\) \{\s*try \{\s*const map = \{ overview: 'overview', goals: 'goals', data: 'import-data', memory: 'use-data' \};\s*const routeId = map\[key\] \|\| \(key === 'overview' \? 'overview' : null\);\s*if \(routeId && typeof __navigate === 'function' && !__navigating\) \{\s*const desired = '#\/' \+ routeId;\s*if \(window\.location\.hash\.split\('\?'\)\[0\] !== desired\) \{\s*__navigating = true;\s*__navigate\(routeId\);\s*__navigating = false;\s*\/\/ navigate triggers hashchange → activatePage → openPrimaryView again; guard with flag\s*\}\s*\}\s*\} catch \(_sync\) \{ __navigating = false; \}\s*/,
  `function openPrimaryView(key, announce = true) {
`
);

const output = `/**
 * Application runtime adapted from the V2.3.2 monolith.
 * Expects overview/goals/import-data/use-data page roots to exist under #page-outlet.
 */
let __navigate = (id) => { window.location.hash = '#/' + id; };
let __showToastExternal = null;
let __store = null;
let __bootstrapped = false;
let __navigating = false;
let __activatePage = () => {};
let __deactivatePage = () => {};

export function configureRuntime({ navigate, showToast, store } = {}) {
  if (typeof navigate === 'function') __navigate = navigate;
  if (typeof showToast === 'function') __showToastExternal = showToast;
  if (store) __store = store;
}

export function ensureBootstrapped() {
  if (__bootstrapped) return;
  __bootstrapped = true;
  __install();
}

export function activatePage(pageId, params) {
  ensureBootstrapped();
  return __activatePage(pageId, params || new URLSearchParams());
}

export function deactivatePage(pageId) {
  if (!__bootstrapped) return;
  return __deactivatePage(pageId);
}

function __install() {
  'use strict';
${toastBridge}
${navHelper}
${body}

  __activatePage = function activatePage(pageId, params) {
    const legacy =
      pageId === 'import-data' ? 'data' :
      pageId === 'use-data' ? 'memory' :
      pageId === 'goals' ? 'goals' :
      'overview';

    // Show only the active page root
    document.querySelectorAll('#page-outlet > .page').forEach((el) => {
      const active = el.dataset.page === pageId;
      el.hidden = !active;
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
      el.style.display = active ? '' : 'none';
    });

    openPrimaryView(legacy, false);

    if (pageId === 'goals' && params.get('sheet') === 'create') openGoalCreateSheet();
    if (pageId === 'goals' && params.get('drawer') === 'plan') renderGoalResultDrawer('plan');
    if (pageId === 'import-data' && params.get('wizard') === '1') openConnectionWizard();
    if (pageId === 'use-data' && params.get('memory') === '1') openMemoryDrawer();
    if (params.get('onboarding') === '1') openOnboarding();
  };

  __deactivatePage = function deactivatePage(pageId) {
    if (pageId === 'overview') stopTopologyLoop(true);
    if (pageId === 'goals') {
      try { closeGoalsWorkspace(); } catch (_e) {}
    }
    if (pageId === 'import-data') {
      try { closeDataWorkspace(); } catch (_e) {}
    }
    if (pageId === 'use-data') {
      try { closeUseWorkspace(); } catch (_e) {}
    }
  };

  buildUniverse();
  applyAmbientTheme();
  resize();
}
`;

fs.writeFileSync(path.join(root, 'src/shared/js/app-runtime.js'), output.replace(/\r\n/g, '\n'), 'utf8');
console.log('wrote runtime', output.length);
