#!/usr/bin/env node
/**
 * DEPRECATED — do not run without manual review.
 *
 * Bulk-splicing app-runtime.js between v3.2 and v3.0 has twice broken bootstrap
 * (blank overview, dead navbar). Use Data + DSH changes must be ported in a
 * separate module or hand-reviewed surgical diff.
 *
 * This script now only validates the live v3.0 runtime and exits.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const validateScript = path.join(root, 'v3.2/frontend/scripts/validate-app-runtime.mjs');
const liveRuntime = path.join(root, 'v3.0 -Backend/AI-Datahub/frontend/src/shared/js/app-runtime.js');

console.error('sync-use-data-frontend.mjs: bulk sync disabled to protect bootstrap.');
console.error('Validate live runtime manually after any app-runtime.js edit.');

const result = spawnSync(process.execPath, [validateScript, liveRuntime], {
  cwd: path.join(root, 'v3.0 -Backend/AI-Datahub/frontend'),
  env: { ...process.env },
  stdio: 'inherit',
});

if (result.status !== 0) {
  console.error(`Live runtime failed validation: ${liveRuntime}`);
  process.exit(result.status || 1);
}

console.log('Live v3.0 app-runtime.js passed validation.');
