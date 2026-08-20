import {test,expect} from '@playwright/test';

const BASE='http://127.0.0.1:4173';

test('Kamil OS 31 local-first critical flow',async({page})=>{
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page).toHaveTitle(/Kamil OS 31\.2/);
  await expect(page.locator('#appView')).toBeVisible();
  await expect(page.locator('#syncStatus')).toContainText('Jen toto zařízení');
  expect(requests.some(u=>u.includes('@supabase/supabase-js'))).toBeFalsy();

  await expect(page.getByRole('heading',{name:'Tvoje data nejsou na tomto zařízení.'})).toBeVisible();
  await page.getByRole('button',{name:'Připojit moje data'}).click();
  await expect(page.locator('#authView')).toBeVisible();
  await expect(page.getByRole('button',{name:'Poslat přihlašovací odkaz bez hesla'})).toBeVisible();
  expect(requests.some(u=>u.includes('@supabase/supabase-js'))).toBeFalsy();
  await page.getByRole('button',{name:'Zpět do Kamil OS bez přihlášení'}).click();
  await expect(page.locator('#appView')).toBeVisible();

  for(const name of ['Peníze','Vstupenky','Domov','Více','Dnes']){
    await page.locator('#mainNav').getByRole('button',{name}).click();
    await expect(page.locator('.view.on')).toBeVisible();
  }

  await expect(page.locator('#decisionJournal31Button')).toBeVisible();
  await page.locator('#decisionJournal31Button').click();
  await expect(page.getByRole('heading',{name:'Decision Journal 31.1'})).toBeVisible();
  await page.getByRole('button',{name:'Zavřít'}).click();

  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').tasks?.length||0);
  await page.locator('#commandInput').fill('naprosto neznámá instrukce xyz 31');
  await page.locator('#commandGo').click();
  await expect(page.getByRole('heading',{name:'Tomuhle příkazu zatím nerozumím'})).toBeVisible();
  await page.getByRole('button',{name:'Zrušit'}).click();
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').tasks?.length||0);
  expect(after).toBe(before);

  await page.locator('#mainNav').getByRole('button',{name:'Více'}).click();
  await page.getByRole('button',{name:/Systém/}).click();
  await expect(page.getByRole('heading',{name:/Health score/})).toBeVisible();
});
