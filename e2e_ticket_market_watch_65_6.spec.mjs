import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('65.6 Ticket Market Watch reads private ticketBook states and never auto-sells',async({page})=>{
 const state={meta:{schemaVersion:80},tasks:[],personalAdmin:{items:[]},delegations:[],calendar:{events:[]},ticketBook:{history:[],watchlist:[],review:[],items:[
  {id:'listed-a',name:'Test Concert A - S10',eventName:'Test Concert A',date:'2026-09-01',section:'S10',qty:3,buy:3000,listPrice:1500,workflow:'LISTED',marketStatus:'LISTED',viagogoUrl:'https://www.viagogo.com/E-1'},
  {id:'hold-b',name:'Test Sport B - B2',eventName:'Test Sport B',date:'2026-10-01',section:'B2',qty:4,buy:4000,workflow:'HOLD',marketStatus:'NOT_LISTED'},
  {id:'sold-c',name:'Test Show C',eventName:'Test Show C',date:'2026-09-10',section:'Floor',qty:2,buy:2000,sell:3600,workflow:'SOLD',marketStatus:'SOLD_UNDELIVERED',transferStatus:'PENDING'},
  {id:'payout-d',name:'Test Show D',eventName:'Test Show D',date:'2026-09-12',section:'Floor',qty:1,buy:1000,sell:1800,workflow:'PAYOUT WAIT',marketStatus:'SOLD_WAITING_PAYMENT'}
 ]}};
 await page.addInitScript(state=>localStorage.setItem('kamil-os-state',JSON.stringify(state)),state);
 await page.route('**/api/ticket-market-watch',async route=>{const body=route.request().postDataJSON?.()||{},items=body.items||[],results=items.filter(x=>['LISTED','NOT_LISTED'].includes(x.status)).map(x=>({...x,market:x.viagogoUrl?{price:150,currency:'USD',priceCzk:3200,confidence:'section',checkedAt:new Date().toISOString()}:null,source:x.viagogoUrl?{status:'ok',message:'Cena nalezena pro sekci.'}:{status:'missing',message:'Chybí Viagogo URL'},recommendation:x.viagogoUrl?{code:'HOLD',label:'DRŽET',reason:'Test market.'}:{code:'SOURCE_MISSING',label:'DOPLNIT VIAGOGO ODKAZ',reason:'Přidej konkrétní event stránku.'}}));await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,version:'65.6',checkedAt:new Date().toISOString(),summary:{listed:3,notListed:4},results})})});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#commandGo')).toHaveText('Najít / zeptat se',{timeout:10000});
 await page.locator('#mainNav [data-personal-more]').click();
 await expect(page.locator('#modalHost')).toContainText('Osobní přehled a nastavení');
 await page.locator('#modalHost').getByRole('button',{name:'Ticket Market Watch'}).click();
 const modal=page.locator('#modalHost');
 await expect(modal).toContainText('Viagogo trh bez automatického prodeje');
 await expect(modal).toContainText('Nabízíš3 ks');
 await expect(modal).toContainText('Nenabízíš4 ks');
 await expect(modal).toContainText('Test Concert A - S10');
 await expect(modal).toContainText('Test Sport B - B2');
 await expect(modal).toContainText('Prodáno / nedoručeno');
 await expect(modal).toContainText('Čekáš na peníze');
 await expect(modal).not.toContainText('AUTO SELL');
});
