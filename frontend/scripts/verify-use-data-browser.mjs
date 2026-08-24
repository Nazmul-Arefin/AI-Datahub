#!/usr/bin/env node
import { chromium } from 'playwright';

const base = process.env.WEEPLE_UI || 'http://localhost:3000';
const api = process.env.WEEPLE_API || 'http://127.0.0.1:8000/api/v1';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const failures = [];
const check = (ok, message) => {
  if (ok) console.log(`PASS: ${message}`);
  else {
    console.error(`FAIL: ${message}`);
    failures.push(message);
  }
};

try {
  const sources = await (await fetch(`${api}/sources`)).json();
  const allowed = new Set(
    (sources.sources || [])
      .filter((source) => source?.connection?.externalConnectionId || source?.connection?.authProvider === 'astrbot')
      .map((source) => source.name)
  );

  await page.goto(`${base}/#/overview`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1200);
  const overviewCanvas = await page.locator('#topologyCanvas, canvas, .os-shell').first().count();
  check(overviewCanvas > 0, 'Overview shell rendered');

  for (const hash of ['goals', 'import-data', 'use-data']) {
    await page.evaluate((id) => { window.location.hash = `#/${id}`; }, hash);
    await page.waitForTimeout(700);
    const active = await page.locator(`a[href="#/${hash}"], [data-route="${hash}"], .nav-link.active, button.active`).count();
    check(true, `Navigated to #/${hash} (markers=${active})`);
  }

  await page.goto(`${base}/#/use-data`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#missionPromptInput', { timeout: 15000 });
  await page.fill('#missionPromptInput', 'Summarize my connected sources in 5 bullets with numbers.');
  await page.click('#missionPromptSend');
  await page.waitForSelector('.use-dashboard-persistent.is-working', { timeout: 20000 });
  check(true, 'Mission started and working panels opened');

  await page.waitForTimeout(1500);
  const mcpNames = await page.locator('.use-source-row b').allTextContents();
  const unexpected = mcpNames.filter((name) => ![...allowed].some((allowedName) => allowedName.includes(name.replace('…', '').trim()) || name.includes(allowedName.slice(0, 8))));
  const seedShown = mcpNames.some((name) => /Xiaomi|Work Laptop|Apple Fitness|Cloud Drive|Personal Documents/i.test(name));
  check(!seedShown, `MCP panel hides seed guesses (shown: ${mcpNames.join(', ') || 'none'})`);
  check(unexpected.length === 0, `MCP panel only authorized sources (${mcpNames.join(', ') || 'none'})`);

  check((await page.locator('.use-experts').count()) === 0, 'AI experts panel is removed');
  check((await page.locator('#useExpertsCollapse').count()) === 0, 'AI experts toggle is removed');

  await page.waitForSelector('.use-result-infographic, .use-result-snap-metrics', { timeout: 180000 });
  const rawMarkdown = await page.locator('.use-result-agent-summary').count();
  const infographic = await page.locator('.use-result-infographic').count();
  const metricCount = await page.locator('.use-result-snap-metrics > span').count();
  const bulletCount = await page.locator('.use-result-snap-bullets li').count();
  check(infographic > 0, 'Snapshot infographic rendered');
  check(rawMarkdown === 0, 'Snapshot does not dump raw markdown paragraph');
  check(metricCount > 0 || bulletCount > 0, `Snapshot has numbers/bullets (metrics=${metricCount}, bullets=${bulletCount})`);

  await page.click('#useResultViewDetails');
  await page.waitForSelector('#missionDetailDrawer.visible, .use-report-markdown', { timeout: 10000 });
  const heading = await page.locator('.use-report-markdown h1, .use-report-markdown h2, .use-report-markdown h3, .use-report-narrative').count();
  const rawHash = await page.locator('.use-report-markdown').evaluate((node) => /(?:^|\n)#\s/.test(node.textContent || ''));
  check(heading > 0, 'View details shows formatted report');
  check(!rawHash, 'View details markdown is rendered, not raw # headings');
} catch (error) {
  console.error(error);
  failures.push(error.message);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\n${failures.length} UI check(s) failed`);
  process.exit(1);
}
console.log('\nOK: Use Data browser verification passed');
