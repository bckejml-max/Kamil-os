import {test,expect} from '@playwright/test';

const BASE='http://127.0.0.1:4173';

test('43.1 keeps the 60-feature detail collapsed until requested',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page.locator('#appView')).toBeVisible();
  await page.waitForFunction(()=>document.querySelector('#platform43'));
  await expect(page.getByText('Dnes udělej tyhle 3 věci')).toBeVisible();
  await expect(page.locator('#platform431Details')).toHaveCount(0);
  await page.getByRole('button',{name:'Otevřít detail platformy'}).click();
  await expect(page.locator('#platform431Details')).toBeVisible();
  await expect(page.getByText('60-FEATURE MAP')).toBeVisible();
});

test('43.1 stability guard is loaded lazily with the platform',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('#platform43'));
  const summary=await page.evaluate(async()=>{const m=await import('./js/platform431Stability.js');return m.guardSummary431()});
  expect(Array.isArray(summary.events)).toBe(true);
  expect(Array.isArray(summary.trips)).toBe(true);
});
