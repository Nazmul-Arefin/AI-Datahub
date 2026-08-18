import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, channel: 'msedge' });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
});
page.on('requestfailed', (r) => errors.push(`fail: ${r.url()} ${r.failure()?.errorText || ''}`));
page.on('response', (r) => {
  if (r.status() >= 400) errors.push(`${r.status()}: ${r.url()}`);
});

await page.goto('http://localhost:3456/#/overview', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3500);

const result = {
  pages: await page.locator('#page-outlet > .page').count(),
  canvas: await page.locator('#topologyCanvas').count(),
  hash1: await page.evaluate(() => location.hash),
};

await page.click('[data-route="goals"]');
await page.waitForTimeout(1500);
result.hashGoals = await page.evaluate(() => location.hash);
result.goalsState = await page.evaluate(() => ({
  display: document.querySelector('.page--goals')?.style.display,
  shell: document.querySelector('.os-shell')?.className,
}));

await page.click('[data-route="import-data"]');
await page.waitForTimeout(1000);
result.hashImport = await page.evaluate(() => location.hash);

await page.click('[data-route="use-data"]');
await page.waitForTimeout(1000);
result.hashUse = await page.evaluate(() => location.hash);

await page.click('[data-route="overview"]');
await page.waitForTimeout(1000);
result.hashOverview = await page.evaluate(() => location.hash);

result.errors = errors.filter((e) => !/favicon/i.test(e) && !/^console: Failed to load resource: the server responded with a status of 404/.test(e));
console.log(JSON.stringify(result, null, 2));
await browser.close();
const failed = result.errors.length || result.pages < 4 || result.hashGoals !== '#/goals';
process.exit(failed ? 1 : 0);
