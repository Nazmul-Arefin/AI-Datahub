/**
 * Extract page view fragments and write a slim shell index.html from the monolith.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function between(startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start < 0) throw new Error(`Missing start: ${startMarker.slice(0, 60)}`);
  const end = html.indexOf(endMarker, start);
  if (end < 0) throw new Error(`Missing end after: ${startMarker.slice(0, 60)}`);
  return html.slice(start, end);
}

function betweenInclusive(startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start < 0) throw new Error(`Missing start: ${startMarker.slice(0, 60)}`);
  const end = html.indexOf(endMarker, start);
  if (end < 0) throw new Error(`Missing end after: ${startMarker.slice(0, 60)}`);
  return html.slice(start, end + endMarker.length);
}

// Overview: universe section content through notification panel (inside .universe),
 // plus calendar task modal which sits as sibling before goals in original.
const universeStart = html.indexOf('<section class="universe"');
const goalsStart = html.indexOf('<section class="goals-workspace"');
const overviewInner = html.slice(universeStart, goalsStart).trim();

// calendar task modal is inside overviewInner already (before goals). Good.

// But universe wraps goals/data/use in original! Looking at structure:
 // <section class="universe">
 //   canvas, calendar, calendarTaskModal,
 //   goalsWorkspace, dataWorkspace, useWorkspace,
 //   topology-meta, hints, focus, tooltip, command, notification
 // </section>

const dataStart = html.indexOf('<section class="data-workspace"');
const useStart = html.indexOf('<section class="use-workspace');
const topologyMetaStart = html.indexOf('<div class="topology-meta"');
const universeClose = html.indexOf('</section>\n\n    <section class="activity-dock"');

const beforeGoals = html.slice(universeStart, goalsStart);
// Strip opening <section class="universe"...> tag only — keep children before goals
const universeOpenEnd = beforeGoals.indexOf('>') + 1;
const overviewTop = beforeGoals.slice(universeOpenEnd).trim();

const goalsHtml = html.slice(goalsStart, dataStart).trim();
const dataHtml = html.slice(dataStart, useStart).trim();
const useHtml = html.slice(useStart, topologyMetaStart).trim();
const overviewBottom = html.slice(topologyMetaStart, universeClose).trim();

const overviewView = `<!-- Overview page fragment -->
<div class="universe" aria-label="Personal AI universe and calendar">
${overviewTop}

${overviewBottom}
</div>
`;

const goalsView = `<!-- Goals page fragment -->
${goalsHtml}
`;

const importView = `<!-- Import Data page fragment -->
${dataHtml}
`;

const useView = `<!-- Use Data page fragment -->
${useHtml}
`;

const pages = {
  'src/pages/overview/view.html': overviewView,
  'src/pages/goals/view.html': goalsView,
  'src/pages/import-data/view.html': importView,
  'src/pages/use-data/view.html': useView,
};

for (const [rel, content] of Object.entries(pages)) {
  const out = path.join(root, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content.replace(/\r\n/g, '\n'), 'utf8');
  console.log('wrote', rel, content.length);
}

// Extract shell pieces
const headMatch = html.match(/<head>[\s\S]*?<\/head>/)[0];
const ambient = html.match(/<div class="ambient ambient-one"><\/div>\s*<div class="ambient ambient-two"><\/div>/)[0];
const topbar = betweenInclusive('<header class="topbar">', '</header>');
const activity = betweenInclusive('<section class="activity-dock"', '</section>\n  </main>').replace(/\n  <\/main>$/, '');
const onboarding = betweenInclusive('<section class="onboarding-overlay"', '</section>');
const toast = html.match(/<div class="toast"[\s\S]*?<\/div>/)[0];

const shellIndex = `<!doctype html>
<html lang="en">
${headMatch.replace(
  /<link rel="stylesheet" href="styles\.css[^"]*">/,
  `<link rel="stylesheet" href="src/shared/styles/tokens.css">
  <link rel="stylesheet" href="src/shared/styles/base.css">
  <link rel="stylesheet" href="src/shared/styles/shell.css">`
)}
<body>
  ${ambient}

  <main class="os-shell">
    ${topbar.replace(/data-view="overview"/, 'data-route="overview"')
      .replace(/data-view="goals"/, 'data-route="goals"')
      .replace(/data-view="data"/, 'data-route="import-data"')
      .replace(/data-view="memory"/, 'data-route="use-data"')}

    <div id="page-outlet" class="page-outlet" aria-live="polite"></div>

    ${activity}
  </main>

  ${onboarding}

  ${toast}
  <script type="module" src="src/app/bootstrap.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'index.html'), shellIndex.replace(/\r\n/g, '\n'), 'utf8');
console.log('wrote slim index.html');
