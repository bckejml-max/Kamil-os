import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('65.6 Ticket Market Watch uses current colour-state inventory and never auto-sells',async({page})=>{
 await page.route('**/api/ticket-market-watch',async route=>{
  const req=route.request(),body=req.postDataJSON?.()||{},items=body.items||[];
  const results=items.filter(x=>['LISTED','NOT_LISTED'].includes(x.status)).map(x=>({...x,market:x.viagogoUrl?{price:150,currency:'USD',priceCzk:3200,confidence:'section',checkedAt:new Date().toISOString()}:null,source:x.viagogoUrl?{status:'ok',message:'Cena nalezena pro sekci.'}:{status:'missing',message:'Chybí Viagogo URL'},recommendation:x.viagogoUrl?{code:'HOLD',label:'DRŽET',reason:'Test market.'}:{code:'SOURCE_MISSING',label:'DOPLNIT VIAGOGO ODKAZ',reason:'Přidej konkrétní event stránku.'}}));
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,version:'65.6',checkedAt:new Date().toISOString(),summary:{listed:22,notListed:24},results})});
 });
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Více'}).first().click();
 await page.getByRole('button',{name:'Ticket Market Watch'}).click();
 const modal=page.locator('#modalHost');
 await expect(modal).toContainText('Viagogo trh bez automatického prodeje');
 await expect(modal).toContainText('Nabízíš22 ks');
 await expect(modal).toContainText('Nenabízíš24 ks');
 await expect(modal).toContainText('Davis Cup - CZE vs USA - 405');
 await expect(modal).toContainText('Česko - Chorvatsko - 115');
 await expect(modal).toContainText('Prodáno / nedoručeno');
 await expect(modal).toContainText('Čekáš na peníze');
 await expect(modal).not.toContainText('AUTO SELL');
});
