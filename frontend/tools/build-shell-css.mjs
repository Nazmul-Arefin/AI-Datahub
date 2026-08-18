/**
 * Build modular CSS + slim shell index from monolith backups.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.monolith.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.monolith.css'), 'utf8');

function extractBlock(startNeedle, endNeedle) {
  const start = html.indexOf(startNeedle);
  if (start < 0) throw new Error('missing ' + startNeedle);
  const end = html.indexOf(endNeedle, start);
  if (end < 0) throw new Error('missing end ' + endNeedle);
  return html.slice(start, end).trimEnd();
}

function extractThroughClose(startNeedle, closeTag = '</section>') {
  const start = html.indexOf(startNeedle);
  if (start < 0) throw new Error('missing ' + startNeedle);
  const end = html.indexOf(closeTag, start);
  if (end < 0) throw new Error('missing close');
  return html.slice(start, end + closeTag.length);
}

const topbar = extractThroughClose('<header class="topbar">', '</header>');
const activity = extractThroughClose('<section class="activity-dock"', '</section>');
const onboarding = extractThroughClose('<section class="onboarding-overlay"', '</section>');
const toast = html.match(/<div class="toast"[\s\S]*?<\/div>/)[0].trim();

// Command + notification live in shell (global chrome)
const commandPanel = extractThroughClose('<section class="command-panel"', '</section>');
const notificationPanel = extractThroughClose('<aside class="notification-panel"', '</aside>');

let overview = fs.readFileSync(path.join(root, 'src/pages/overview/view.html'), 'utf8');
// Remove command/notification from overview if present (they move to shell)
overview = overview
  .replace(commandPanel, '')
  .replace(notificationPanel, '')
  .replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(path.join(root, 'src/pages/overview/view.html'), overview.replace(/\r\n/g, '\n'));

// Make page workspaces visible by default when mounted (router shows one page at a time)
function prepareWorkspace(rel, idClass) {
  let v = fs.readFileSync(path.join(root, rel), 'utf8');
  v = v
    .replace(/ aria-hidden="true"/, ' aria-hidden="false"')
    .replace(`class="${idClass}"`, `class="${idClass} visible"`)
    .replace(`class="${idClass} `, `class="${idClass} visible `);
  // use-workspace has two classes
  if (idClass === 'use-workspace') {
    v = v.replace('class="use-workspace use-mission-workspace"', 'class="use-workspace use-mission-workspace visible"');
  }
  fs.writeFileSync(path.join(root, rel), v.replace(/\r\n/g, '\n'));
}
prepareWorkspace('src/pages/goals/view.html', 'goals-workspace');
prepareWorkspace('src/pages/import-data/view.html', 'data-workspace');
prepareWorkspace('src/pages/use-data/view.html', 'use-workspace');

const navTopbar = topbar
  .replace(/data-view="overview"/g, 'data-route="overview"')
  .replace(/data-view="goals"/g, 'data-route="goals"')
  .replace(/data-view="data"/g, 'data-route="import-data"')
  .replace(/data-view="memory"/g, 'data-route="use-data"');

const shellIndex = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover">
  <meta name="theme-color" content="#f7f7f5">
  <title>Weeple AI OS — Your Personal Universe</title>
  <link rel="stylesheet" href="src/shared/styles/tokens.css">
  <link rel="stylesheet" href="src/shared/styles/base.css">
  <link rel="stylesheet" href="src/shared/styles/shell.css">
</head>
<body>
  <div class="ambient ambient-one"></div>
  <div class="ambient ambient-two"></div>

  <main class="os-shell">
${navTopbar}

    <div id="page-outlet" class="page-outlet" aria-live="polite"></div>

${commandPanel}

${notificationPanel}

${activity}
  </main>

${onboarding}

  ${toast}
  <script type="module" src="src/app/bootstrap.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'index.html'), shellIndex.replace(/\r\n/g, '\n'));
console.log('wrote index.html');

// --- CSS split ---
function classifyRule(selectorBlock) {
  const s = selectorBlock.toLowerCase();
  if (s.includes(':root') || s.trim() === ':root') return 'tokens';
  if (/^(\*|html|body|button|input)\b/.test(s.trim()) || s.includes('.ambient')) return 'base';
  if (
    s.includes('.topbar') || s.includes('.brand') || s.includes('.primary-nav') || s.includes('.nav-item') ||
    s.includes('.system-actions') || s.includes('.device-clock') || s.includes('.weather') ||
    s.includes('.online-pill') || s.includes('.icon-button') || s.includes('.example-profile') ||
    s.includes('.toast') || s.includes('.activity-') || s.includes('.onboarding') ||
    s.includes('.os-shell') || s.includes('.command-panel') || s.includes('.notification-panel') ||
    s.includes('.notice-') || s.includes('.page-outlet') || s.includes('.page--')
  ) return 'shell';
  if (
    s.includes('.goals-workspace') || s.includes('.goal-') || s.includes('.reasoning-') ||
    s.includes('.consent-') || s.includes('.collaboration') || s.includes('goals-page') ||
    s.includes('.plan-') && s.includes('goal')
  ) return 'goals';
  if (
    s.includes('.data-workspace') || s.includes('.data-') || s.includes('.source-') ||
    s.includes('.connection-wizard') || s.includes('.wizard-') || s.includes('data-page') ||
    s.includes('.import')
  ) return 'import';
  if (
    s.includes('.use-workspace') || s.includes('.use-') || s.includes('.mission-') ||
    s.includes('.memory-') || s.includes('.assistant-') || s.includes('.conversation-') ||
    s.includes('use-page') || s.includes('.ai-context') || s.includes('.legacy-use')
  ) return 'use';
  if (
    s.includes('.universe') || s.includes('.calendar') || s.includes('.topology') ||
    s.includes('.canvas') || s.includes('.focus-mode') || s.includes('.node-tooltip') ||
    s.includes('.interaction-hint') || s.includes('.side-day') || s.includes('.month-') ||
    s.includes('#topology') || s.includes('.tooltip')
  ) return 'overview';
  // page-hiding rules tied to shell page classes
  if (s.includes('goals-page') || s.includes('data-page') || s.includes('use-page')) return 'shell';
  return 'shell';
}

// Parse CSS into rule chunks (rough but effective for this file)
const buckets = {
  tokens: [],
  base: [],
  shell: [],
  overview: [],
  goals: [],
  import: [],
  use: [],
};

let i = 0;
const len = css.length;
while (i < len) {
  // skip whitespace
  while (i < len && /\s/.test(css[i])) i++;
  if (i >= len) break;
  // comment
  if (css.startsWith('/*', i)) {
    const end = css.indexOf('*/', i);
    const comment = css.slice(i, end < 0 ? len : end + 2);
    // attach comment to following rule by holding
    let j = end + 2;
    while (j < len && /\s/.test(css[j])) j++;
    // find next rule brace
    const brace = css.indexOf('{', j);
    if (brace < 0) { i = len; break; }
    let depth = 0;
    let k = brace;
    for (; k < len; k++) {
      if (css[k] === '{') depth++;
      else if (css[k] === '}') {
        depth--;
        if (depth === 0) { k++; break; }
      }
    }
    const block = css.slice(i, k);
    const selector = css.slice(j, brace);
    const bucket = classifyRule(selector);
    buckets[bucket].push(block);
    i = k;
    continue;
  }
  const brace = css.indexOf('{', i);
  if (brace < 0) break;
  let depth = 0;
  let k = brace;
  for (; k < len; k++) {
    if (css[k] === '{') depth++;
    else if (css[k] === '}') {
      depth--;
      if (depth === 0) { k++; break; }
    }
  }
  const block = css.slice(i, k);
  const selector = css.slice(i, brace);
  const bucket = classifyRule(selector);
  buckets[bucket].push(block);
  i = k;
}

function wrapPage(cssText, pageClass) {
  // Keep original selectors; add a page-root note. Scoping every selector is fragile for this size.
  // Router wraps content in .page.page--X; we prefix a small scope helper and keep monolith selectors.
  return `/* Scoped under .${pageClass} via page outlet root */\n.${pageClass} { position: relative; width: 100%; height: 100%; }\n\n` + cssText;
}

const outMap = {
  'src/shared/styles/tokens.css': buckets.tokens.join('\n\n') + '\n',
  'src/shared/styles/base.css': buckets.base.join('\n\n') + '\n',
  'src/shared/styles/shell.css': buckets.shell.join('\n\n') + `\n\n.page-outlet {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n.page {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n}\n`,
  'src/pages/overview/page.css': wrapPage(buckets.overview.join('\n\n'), 'page--overview'),
  'src/pages/goals/page.css': wrapPage(buckets.goals.join('\n\n'), 'page--goals'),
  'src/pages/import-data/page.css': wrapPage(buckets.import.join('\n\n'), 'page--import-data'),
  'src/pages/use-data/page.css': wrapPage(buckets.use.join('\n\n'), 'page--use-data'),
};

for (const [rel, content] of Object.entries(outMap)) {
  fs.writeFileSync(path.join(root, rel), content.replace(/\r\n/g, '\n'), 'utf8');
  console.log(rel, content.length);
}

console.log('CSS bucket sizes', Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])));
