#!/usr/bin/env node
import { chromium } from 'playwright';

const base = process.env.WEEPLE_UI || 'http://localhost:3000';
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
  await page.goto(`${base}/#/use-data`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#useWorkspace, #missionPromptInput', { timeout: 15000 });
  const hasScroll = await page.locator('.use-result-scroll-body').count();
  if (!hasScroll) {
    await page.evaluate(() => { window.location.hash = '#/use-data'; });
    await page.waitForTimeout(800);
  }
  if (!(await page.locator('.use-result-scroll-body').count())) {
    await page.fill('#missionPromptInput', 'Show a compact results snapshot.');
    await page.click('#missionPromptSend');
  }
  await page.waitForSelector('.use-result-scroll-body', { timeout: 20000 });

  const metrics = await page.evaluate(() => {
    const body = document.querySelector('.use-result-scroll-body');
    if (!body) return null;
    const style = getComputedStyle(body);
    const before = {
      overflowY: style.overflowY,
      scrollbarWidth: style.scrollbarWidth,
      scrollHeight: body.scrollHeight,
      clientHeight: body.clientHeight,
      offsetWidth: body.offsetWidth,
    };
    const pad = document.createElement('div');
    pad.setAttribute('data-scroll-probe', '1');
    pad.style.height = '1400px';
    pad.textContent = 'scroll probe';
    body.appendChild(pad);
    body.scrollTop = 400;
    const after = {
      scrollTop: body.scrollTop,
      scrollHeight: body.scrollHeight,
      clientHeight: body.clientHeight,
      offsetWidth: body.offsetWidth,
      clientWidth: body.clientWidth,
      overflowY: getComputedStyle(body).overflowY,
      scrollbarWidth: getComputedStyle(body).scrollbarWidth,
    };
    pad.remove();
    return { before, after };
  });

  check(Boolean(metrics), 'Result scroll body is present');
  check(['auto', 'scroll', 'overlay'].includes(metrics?.after?.overflowY), `overflow-y is scrollable (${metrics?.after?.overflowY})`);
  check(metrics?.after?.scrollbarWidth === 'none', `scrollbar-width is none (${metrics?.after?.scrollbarWidth})`);
  check((metrics?.after?.offsetWidth - metrics?.after?.clientWidth) === 0, `no visible scrollbar gutter (${metrics?.after?.offsetWidth - metrics?.after?.clientWidth}px)`);
  check(metrics?.after?.scrollTop >= 300, `wheel-less programmatic scroll works (scrollTop=${metrics?.after?.scrollTop})`);
  check(metrics?.after?.scrollHeight > metrics?.after?.clientHeight, 'tall content overflows inside the result body');
} catch (error) {
  console.error(error);
  failures.push(error.message);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\n${failures.length} scroll check(s) failed`);
  process.exit(1);
}
console.log('\nOK: Result section scrolls without a visible scrollbar');
