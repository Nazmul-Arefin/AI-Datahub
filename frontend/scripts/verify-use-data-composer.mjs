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
  await page.waitForSelector('#missionPromptInput', { timeout: 15000 });
  await page.evaluate(() => {
    try { localStorage.setItem('weeple-use-goal-string-hidden', '0'); } catch (_error) { /* optional */ }
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#missionPromptInput', { timeout: 15000 });

  check((await page.locator('.use-experts').count()) === 0, 'AI experts section is not in the page');
  check((await page.locator('#useExpertsCollapse').count()) === 0, 'AI experts Show/Hide control is gone');

  await page.fill('#missionPromptInput', 'Summarize my Gmail inbox for today in 3 bullets.');
  await page.click('#missionPromptSend');
  await page.waitForTimeout(700);

  const afterSubmit = await page.evaluate(() => {
    const input = document.querySelector('#missionPromptInput');
    const send = document.querySelector('#missionPromptSend');
    const goalMap = document.querySelector('.use-goal-map');
    const band = document.querySelector('.use-goal-string-band');
    const style = input ? getComputedStyle(input) : null;
    input?.focus();
    input.value = 'follow-up note while the first request is running';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return {
      experts: document.querySelectorAll('.use-experts').length,
      hidden: goalMap?.classList.contains('goal-string-hidden') || false,
      bandHidden: band?.getAttribute('aria-hidden') === 'true',
      inputDisabled: Boolean(input?.disabled || input?.readOnly),
      inputPointer: style?.pointerEvents || '',
      typed: input?.value || '',
      sendBusy: send?.classList.contains('is-busy') || send?.getAttribute('aria-busy') === 'true',
      spinner: Boolean(send?.querySelector('.use-send-spinner')),
    };
  });

  check(afterSubmit.hidden && afterSubmit.bandHidden, 'Goal string collapses after a custom prompt');
  check(afterSubmit.experts === 0, 'AI experts stay removed after submit');
  check(!afterSubmit.inputDisabled && afterSubmit.inputPointer !== 'none', 'Prompt input stays enabled');
  check(afterSubmit.typed.includes('follow-up note'), 'User can type a new prompt while the first run is in progress');
  check(afterSubmit.sendBusy && afterSubmit.spinner, 'Send button shows a processing spinner after submit');

  const stillBusy = await page.locator('#missionPromptSend.is-busy').count();
  if (stillBusy) {
    await page.waitForSelector('#missionPromptSend:not(.is-busy)', { timeout: 180000 });
  }
  check((await page.locator('#missionPromptSend.is-busy').count()) === 0, 'Send spinner clears when the task completes');
  check((await page.locator('#missionPromptInput').isEnabled()), 'Input is still enabled after the task completes');
  check((await page.locator('.use-experts').count()) === 0, 'AI experts remain removed after the task completes');
} catch (error) {
  console.error(error);
  failures.push(error.message);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\n${failures.length} composer check(s) failed`);
  process.exit(1);
}
console.log('\nOK: Use Data composer, goal string, and experts checks passed');
