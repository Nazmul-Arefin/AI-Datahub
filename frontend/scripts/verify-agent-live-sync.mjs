#!/usr/bin/env node
const api = process.env.WEEPLE_API || 'http://127.0.0.1:8000/api/v1';

const json = async (url, options) => {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  if (!response.ok) {
    throw new Error(`${options?.method || 'GET'} ${url} -> ${response.status} ${text.slice(0, 400)}`);
  }
  return body;
};

const before = await json(`${api}/sources/gmail/synced-assets?limit=3`);
const beforeStamp = before.items?.[0]?.syncedAt || '';
console.log(`BEFORE gmail syncedAt=${beforeStamp} total=${before.total}`);

const started = Date.now();
const run = await json(`${api}/agents/runs`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mission: 'Summarize my Gmail inbox for today. Name the newest message date you see in the live synced data.' }),
});
console.log(`Agent run ${run.runId} status=${run.status} refreshed=${JSON.stringify(run.refreshedSourceIds || [])} elapsed=${Math.round((Date.now() - started) / 1000)}s`);

const after = await json(`${api}/sources/gmail/synced-assets?limit=3`);
const afterStamp = after.items?.[0]?.syncedAt || '';
console.log(`AFTER gmail syncedAt=${afterStamp} total=${after.total}`);

const refreshed = (run.refreshedSourceIds || []).map((id) => String(id).toLowerCase());
if (!refreshed.includes('gmail')) {
  console.error('FAIL: agent run did not report gmail in refreshedSourceIds');
  process.exit(1);
}
const afterMs = Date.parse(afterStamp);
const beforeMs = Date.parse(beforeStamp);
const recent = Number.isFinite(afterMs) && Date.now() - afterMs < 15 * 60 * 1000;
const advanced = Number.isFinite(afterMs) && (!Number.isFinite(beforeMs) || afterMs >= beforeMs);
if (!afterStamp || !recent || !advanced) {
  console.error(`FAIL: gmail syncedAt is not a fresh live sync (${beforeStamp} -> ${afterStamp})`);
  process.exit(1);
}
console.log('OK: agent live-synced Gmail before answering');
