import { access, readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { routeFromHash, routes } from '../src/app/routes.js';

const root = process.cwd();
const expectedRoutes = ['overview', 'goals', 'import-data', 'use-memory'];

if (routes.map((route) => route.id).join(',') !== expectedRoutes.join(',')) {
  throw new Error(`Unexpected route registry: ${routes.map((route) => route.id).join(', ')}`);
}

for (const id of expectedRoutes) {
  if (routeFromHash(`#/${id}`).id !== id) throw new Error(`Hash route #/${id} does not resolve.`);
}
if (routeFromHash('#/not-a-route').id !== 'overview') throw new Error('Unknown hashes must fall back to Overview.');

for (const route of routes) {
  const pageDirectory = join(root, 'src', 'pages', route.id);
  await Promise.all(['view.html', 'page.css', 'page.js'].map((file) => access(join(pageDirectory, file))));
  const view = await readFile(join(pageDirectory, 'view.html'), 'utf8');
  route.fragments.forEach((fragment) => {
    if (!view.includes(`data-page-fragment="${fragment}"`)) {
      throw new Error(`${route.id}/view.html is missing fragment ${fragment}.`);
    }
  });
  const pageModule = await readFile(join(pageDirectory, 'page.js'), 'utf8');
  if (!pageModule.includes('export async function mount')) throw new Error(`${route.id}/page.js must export mount().`);
  if (!pageModule.includes('export async function unmount')) throw new Error(`${route.id}/page.js must export unmount().`);
}

async function collectJavaScript(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = join(directory, entry.name);
    return entry.isDirectory() ? collectJavaScript(target) : target.endsWith('.js') ? [target] : [];
  }));
  return nested.flat();
}

const javaScriptFiles = await collectJavaScript(join(root, 'src'));
for (const file of javaScriptFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${relative(root, file)} failed syntax validation:\n${result.stderr}`);
}

console.log(`Validated ${routes.length} routes and ${javaScriptFiles.length} JavaScript modules.`);
