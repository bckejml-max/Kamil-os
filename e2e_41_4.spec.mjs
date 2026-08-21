import {test,expect} from '@playwright/test';

const BASE='http://127.0.0.1:4173';
const APP_TITLE=/^Kamil OS \d+\.\d+(?:\.\d+)?$/;

test('Kamil OS 41.4 keeps rendered views mounted on revisit',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page).toHaveTitle(APP_TITLE);
  await expect(page.locator('#appView')).toBeVisible();
  await expect(page.locator('#todayView')).toHaveAttribute('data-view-ready','1');

  await page.locator('#mainNav').getByRole('button',{name:'Peníze'}).click();
  await expect(page.locator('#view-money')).toBeVisible();
  await expect(page.locator('#moneyView')).toHaveAttribute('data-view-ready','1');
  await expect(page.locator('#moneyView')).not.toContainText('Načítám modul');

  await page.locator('#mainNav').getByRole('button',{name:'Vstupenky'}).click();
  await expect(page.locator('#view-tickets')).toBeVisible();
  await expect(page.locator('#ticketsView')).toHaveAttribute('data-view-ready','1');

  await page.locator('#mainNav').getByRole('button',{name:'Peníze'}).click();
  await expect(page.locator('#view-money')).toBeVisible();
  await expect(page.locator('#moneyView')).toHaveAttribute('data-view-ready','1');
  await expect(page.locator('#moneyView')).not.toContainText('Načítám modul');
});

test('Kamil OS 41.4 prefetch warms a view without opening it',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page.locator('#appView')).toBeVisible();
  await page.locator('#mainNav').getByRole('button',{name:'Peníze'}).hover();
  const warmed=await page.evaluate(async()=>{
    const runtime=await import('./js/viewRuntime41.js');
    const renderer=await runtime.prefetchView41('money');
    return typeof renderer==='function';
  });
  expect(warmed).toBe(true);
  await expect(page.locator('#view-today')).toBeVisible();
});
