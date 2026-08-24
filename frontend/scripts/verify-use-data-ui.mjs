#!/usr/bin/env node
/**
 * Verify Use Data MCP filter + snapshot infographic helpers against the live API.
 */
import { isAuthorizedLiveSource, extractSnapshotInfographic } from '../src/shared/js/use-data-harness.js';

const api = process.env.WEEPLE_API || 'http://127.0.0.1:8000/api/v1';
const response = await fetch(`${api}/sources`);
if (!response.ok) {
  console.error(`FAIL: sources API ${response.status}`);
  process.exit(1);
}
const payload = await response.json();
const sources = payload.sources || [];
const authorized = sources.filter(isAuthorizedLiveSource);
const rejected = sources.filter((source) => !isAuthorizedLiveSource(source));

console.log('Authorized MCP connections:');
authorized.forEach((source) => {
  console.log(`  - ${source.name} [${source.id}] ${source.connection?.authProvider || ''} ${source.connection?.externalConnectionId || ''}`);
});
console.log(`Authorized count: ${authorized.length}`);
console.log('Rejected (seed / disconnected / guess):');
rejected.forEach((source) => {
  console.log(`  - ${source.name} [${source.id}] status=${source.statusType} ext=${source.connection?.externalConnectionId || '-'}`);
});

const fakeGuess = { id: 'guess', name: 'Random MCP', statusType: 'connected', assets: '42 pages', isCatalogOnly: false };
if (isAuthorizedLiveSource(fakeGuess)) {
  console.error('FAIL: guessed source without provider link was accepted');
  process.exit(1);
}

const snapshot = extractSnapshotInfographic({
  headline: 'Your Gmail — today\'s email summary',
  summary: '# Your Gmail\n\nHeads-up: **23 emails** reviewed.\n\n- 4 urgent replies\n- 2 calendar conflicts\n- 1 invoice to pay',
  findings: [['Inbox load', '23 messages in the current snapshot']],
  metrics: [['Sources', 2], ['Work tasks', 5]],
});
if (!snapshot.metrics.length || !snapshot.bullets.length) {
  console.error('FAIL: snapshot missing numbers or bullets', snapshot);
  process.exit(1);
}
if (/# Your Gmail/.test(snapshot.headline) === false && !snapshot.headline) {
  console.error('FAIL: snapshot headline empty');
  process.exit(1);
}
console.log('Snapshot:', snapshot);
console.log('OK: Use Data helper checks passed');
