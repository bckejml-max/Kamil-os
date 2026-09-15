import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
async function boot(page){
 await page.goto(BASE);
 await expect(page.locator('[data-os2-today]')).toBeVisible();
 await expect(page.locator('#syncStatus')).toHaveAttribute('role','button');
}

test('cloud entry offers a usable form and local data remains accessible',async({page})=>{
 await boot(page);
 await page.locator('#syncStatus').click();
 await expect(page.getByLabel('E-mail cloudového účtu')).toBeVisible();
 await expect(page.getByRole('button',{name:'Poslat přihlašovací odkaz'})).toBeVisible();
 await page.getByText('Přihlásit se heslem',{exact:true}).click();
 await expect(page.getByLabel('Heslo',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Zpět do Kamil OS'}).click();
 await expect(page.locator('[data-os2-today]')).toBeVisible();
});

test('Today respects captured due dates and opens a task that can be completed',async({page})=>{
 await boot(page);
 await page.locator('#quickAddBtn').click();
 await page.getByLabel('Název',{exact:true}).fill('Ověřovací úkol');
 await page.getByLabel('Termín / platnost').fill('2020-01-15');
 await page.getByRole('button',{name:'Přidat',exact:true}).click();
 await expect(page.locator('.os2-now h2')).toHaveText('Ověřovací úkol');
 await expect(page.locator('.os2-kpis')).toContainText('1 po termínu');
 await expect(page.locator('.os2-row').filter({hasText:'Ověřovací úkol'})).not.toContainText('bez termínu');
 await page.locator('.os2-now').getByRole('button',{name:'Otevřít',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('Ověřovací úkol');
 await page.getByRole('button',{name:'Hotovo',exact:true}).click();
 await expect(page.locator('#todayView')).not.toContainText('Ověřovací úkol');
 await page.reload();
 await expect(page.locator('[data-os2-today]')).toBeVisible();
 await expect(page.locator('#todayView')).not.toContainText('Ověřovací úkol');
});

test('signed-out tickets explain the missing session instead of displaying a broken desk',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="tickets"]').click();
 await expect(page.getByRole('heading',{name:'Připoj své portfolio vstupenek'})).toBeVisible();
 await expect(page.locator('#ticketIntelView')).not.toContainText('SYSTÉM READY');
 await expect(page.locator('#ticketIntelView')).not.toContainText('čekám na model');
 await page.screenshot({path:'test-results/tickets-signed-out.png'});
 await page.getByRole('button',{name:'Připojit cloudový účet'}).click();
 await expect(page.getByLabel('E-mail cloudového účtu')).toBeVisible();
});

test('money has one overview and optional analytics stay collapsed',async({page})=>{
 await boot(page);
 await page.locator('#mainNav [data-view="money"]').click();
 await expect(page.locator('#moneyView h1')).toHaveCount(1);
 await expect(page.locator('#moneyView h1')).toHaveText('Peníze');
 await expect(page.locator('[data-money-analysis]')).not.toHaveAttribute('open','');
 await expect(page.locator('.wealth69-card.cash')).toContainText('—');
 await page.screenshot({path:'test-results/money-overview.png',fullPage:true});
 await page.getByText('Investice, historie a podrobné analýzy',{exact:true}).click();
 await expect(page.locator('[data-money-analysis]')).toContainText('Vývoj čistého jmění',{timeout:15000});
 await page.getByText('Investice, historie a podrobné analýzy',{exact:true}).click();
 await expect(page.getByRole('heading',{name:'Vývoj čistého jmění'})).not.toBeVisible();
});

test('all sections are reachable on a phone',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 for(const [name,view] of [['Rodina','family'],['Domov','home'],['Dokumenty','more']]){
  await page.getByRole('button',{name:'Všechny sekce',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name,exact:true}).click();
  await expect(page.locator(`#view-${view}`)).toHaveClass(/\bon\b/);
  await expect(page.locator(`#view-${view} h1`)).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 }
 await page.screenshot({path:'test-results/mobile-documents.png'});
});
