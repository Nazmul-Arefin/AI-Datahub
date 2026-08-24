#!/usr/bin/env node
import { chromium } from 'playwright';

const base = process.env.WEEPLE_UI || 'http://localhost:3000';
const api = process.env.WEEPLE_API || 'http://127.0.0.1:8000/api/v1';
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
  const goalsRes = await fetch(`${api}/goals`);
  const goalsPayload = goalsRes.ok ? await goalsRes.json() : { goals: [] };
  const apiTitles = (goalsPayload.goals || goalsPayload.items || [])
    .map((goal) => String(goal.title || '').trim())
    .filter(Boolean);

  let postedMission = null;
  await page.route('**/api/v1/agents/runs**', async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON() || {};
      postedMission = String(body.mission || '');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          runId: 'run-goal-card',
          status: 'executing',
          stage: 'executing',
          workPlan: [{ title: 'Read authorized sources', detail: 'From the planning agent' }],
          guidelinePlan: [{ title: 'Use only authorized data', detail: 'Do not invent facts' }],
          sourcesUsed: ['gmail'],
          summary: null,
          events: [{ type: 'stage', text: 'Planning complete. Main agent is following the plan.' }],
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        runId: 'run-goal-card',
        status: 'executing',
        stage: 'executing',
        workPlan: [{ title: 'Read authorized sources', detail: 'From the planning agent' }],
        guidelinePlan: [{ title: 'Use only authorized data', detail: 'Do not invent facts' }],
        sourcesUsed: ['gmail'],
        summary: null,
      }),
    });
  });

  await page.goto(`${base}/#/goals`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1200);
  const goalPageTitles = await page.evaluate(() => (
    [...document.querySelectorAll('[data-goal-select], [data-goal-plan-select], .goal-rail button, .goal-collection-card b, .goal-focus-title, #goalFocusTitle, #goalCommandTitle')]
      .map((node) => String(node.textContent || '').trim())
      .filter((text) => text && text.length > 2 && text.length < 80)
  ));

  await page.goto(`${base}/#/use-data`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#missionPromptInput', { timeout: 15000 });
  await page.waitForTimeout(800);

  const cards = await page.evaluate(() => (
    [...document.querySelectorAll('[data-use-goal] .use-goal-card b')]
      .map((node) => String(node.textContent || '').trim())
      .filter(Boolean)
  ));

  check(cards.length > 0, `Use Data shows ${cards.length} goal-string card(s)`);
  check(!cards.includes('Find investors for my startup') || apiTitles.includes('Find investors for my startup') || goalPageTitles.includes('Find investors for my startup'), 'Demo investor card is not shown unless that goal exists on Goals');
  if (apiTitles.length) {
    const overlap = cards.filter((title) => apiTitles.includes(title));
    check(overlap.length > 0, 'Goal-string cards include Goals-page / API titles');
  }

  const firstCard = page.locator('[data-use-goal]').first();
  if (await firstCard.count()) {
    await firstCard.click();
    const filled = await page.locator('#missionPromptInput').inputValue();
    check(filled.startsWith('Help me make progress on: '), `Click fills progress prompt: ${filled}`);
    check(cards[0] && filled.includes(cards[0]), 'Filled prompt uses the clicked card title');

    await page.click('#missionPromptSend');
    await page.waitForTimeout(900);
    check(Boolean(postedMission), 'Send posts a DSH agent run');
    check(postedMission === filled, 'Posted mission is the filled progress prompt');

    const panels = await page.evaluate(() => ({
      tasks: document.querySelector('[data-od-id="use-data-tasks-panel"]')?.textContent || '',
      guides: document.querySelector('[data-od-id="use-data-guidelines-panel"]')?.textContent || '',
    }));
    check(!/Find relevant contacts/i.test(panels.tasks), 'Live work does not show the hardcoded investor tasks');
    check(!/Identify suitable investors/i.test(panels.guides), 'Guidelines do not show the hardcoded investor rules');
  }
} catch (error) {
  console.error(error);
  failures.push(error.message);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\n${failures.length} goal-string check(s) failed`);
  process.exit(1);
}
console.log('\nOK: Goal-string cards match Goals and Send starts DSH');
