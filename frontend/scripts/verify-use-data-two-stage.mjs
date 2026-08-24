#!/usr/bin/env node
import { chromium } from 'playwright';

const base = process.env.WEEPLE_UI || 'http://localhost:3000';
const plannedRun = {
  runId: 'run-two-stage-ui',
  status: 'executing',
  stage: 'executing',
  sessionId: 'sess-plan',
  planningSessionId: 'sess-plan',
  phase: 4,
  progress: 0.45,
  summary: null,
  workPlan: [
    { title: 'Read Gmail', detail: 'Use the live inbox snapshot' },
    { title: 'Rank unanswered mail', detail: 'Separate urgent from later' },
  ],
  guidelinePlan: [
    { title: 'No invention', detail: 'Use only authorized synced facts' },
    { title: 'State gaps', detail: 'Say what is missing' },
  ],
  sourcesUsed: ['gmail'],
  headline: 'Inbox plan',
  events: [{ type: 'stage', text: 'Planning complete. Main agent is following the plan.' }],
};
const completedRun = {
  ...plannedRun,
  status: 'completed',
  stage: 'completed',
  executionSessionId: 'sess-exec',
  phase: 8,
  progress: 1,
  summary: '# Inbox\n\n3 unread messages need a reply today.',
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const failures = [];
const check = (ok, message) => {
  if (ok) console.log(`PASS: ${message}`);
  else {
    console.error(`FAIL: ${message}`);
    failures.push(message);
  }
};

try {
  let polls = 0;
  await page.route('**/api/v1/agents/runs**', async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(plannedRun),
      });
    }
    polls += 1;
    const payload = polls < 2 ? plannedRun : completedRun;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });
  });

  await page.goto(`${base}/#/use-data`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#missionPromptInput', { timeout: 15000 });
  await page.fill('#missionPromptInput', 'Summarize my Gmail inbox for today.');
  await page.click('#missionPromptSend');

  await page.waitForFunction(() => {
    const tasks = document.querySelector('[data-od-id="use-data-tasks-panel"]');
    return Boolean(tasks && /Read Gmail/i.test(tasks.textContent || ''));
  }, { timeout: 15000 });

  const afterPlan = await page.evaluate(() => {
    const tasks = document.querySelector('[data-od-id="use-data-tasks-panel"]')?.textContent || '';
    const guides = document.querySelector('[data-od-id="use-data-guidelines-panel"]')?.textContent || '';
    const results = document.querySelector('[data-od-id="use-data-results-panel"]')?.textContent || '';
    return { tasks, guides, results };
  });

  check(/Read Gmail/i.test(afterPlan.tasks), 'Live work shows the planning-agent tasks');
  check(/No invention/i.test(afterPlan.guides), 'Guidelines show the planning-agent rules');
  check(!/3 unread messages/i.test(afterPlan.results), 'Results stay empty until the main agent finishes');
  check(/preparing|following the plan/i.test(afterPlan.results), 'Results show a preparing state during execution');

  await page.waitForFunction(() => {
    const results = document.querySelector('[data-od-id="use-data-results-panel"]');
    return Boolean(results && /3 unread messages/i.test(results.textContent || ''));
  }, { timeout: 15000 });

  const afterDone = await page.evaluate(() => {
    const results = document.querySelector('[data-od-id="use-data-results-panel"]')?.textContent || '';
    const busy = document.querySelector('#missionPromptSend')?.classList.contains('is-busy');
    return { results, busy };
  });
  check(/3 unread messages/i.test(afterDone.results), 'Results snapshot appears after the main agent finishes');
  check(!afterDone.busy, 'Send spinner clears after the two-stage run completes');
} catch (error) {
  console.error(error);
  failures.push(error.message);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\n${failures.length} two-stage check(s) failed`);
  process.exit(1);
}
console.log('\nOK: Use Data two-stage plan-then-result checks passed');
