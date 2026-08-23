#!/usr/bin/env node
/**
 * Guardrail: app-runtime.js must parse as ESM (node --check is not enough).
 * Run after any edit to frontend/src/shared/js/app-runtime.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const runtimePath = path.resolve(
  process.argv[2] || path.join(import.meta.dirname, '../src/shared/js/app-runtime.js')
);
const source = fs.readFileSync(runtimePath, 'utf8');

let braceBalance = 0;
for (const char of source) {
  if (char === '{') braceBalance += 1;
  if (char === '}') braceBalance -= 1;
}
if (braceBalance !== 0) {
  console.error(`FAIL: brace balance ${braceBalance} (expected 0) in ${runtimePath}`);
  process.exit(1);
}

try {
  await import(pathToFileURL(runtimePath).href);
} catch (error) {
  console.error(`FAIL: ESM import failed for ${runtimePath}`);
  console.error(error);
  process.exit(1);
}

console.log('OK: app-runtime.js validates');
