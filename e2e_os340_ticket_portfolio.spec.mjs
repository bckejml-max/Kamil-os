import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const AUTH_KEY='sb-tswqfbkmxywxxczsoddr-auth-token';
const inventory=[
 {id:'active-1',event_name:'OS340 Active Event',event_date:'2026-10-10',section:'115',qty:2,buy_each_czk:1000,buy_total_czk:2000,ask_each_czk:1450,market_status:'LISTED',stubhub_url:'https://www.stubhub.com/test/event/1'},
 {id:'sold-pending',event_name:'OS340 Sold Pending',event_date:'2026-07-20',section:'C11',qty:2,buy_each_czk:1000,buy_total_czk:2000,sell_each_czk:1500,sell_total_czk:3000,market_status:'SOLD_WAITING_PAYMENT'},
 {id:'sold-paid',event_name:'OS340 Sold Paid',event_date:'2026-06-15',section:'A1',qty:1,buy_each_czk:1000,buy_total_czk:1000,sell_each_czk:1500,sell_total_czk:1500,market_status:'PAYOUT_RECEIVED'}
];
const snapshots=[
 {ticket_id:'active-1',checked_at:new Date().toISOString(),market_price_czk:1400,confidence:'high',recommendation_code:'LIST',recommendation_label:'PRODAT',recommendation_reason:'Trh podporuje listing.',recommended_ask_czk:1500,same_section_count:3,competitor_count:4,resolved_url:'https://www.viagogo.com/test'}
];
const fakeSdk=`(()=>{const data={ticket_inventory:${JSON.stringify(inventory)},ticket_market_snapshots:${JSON.stringify(snapshots)},ticket_market_alerts:[]};function q(name){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},single:async()=>({data:null,error:null}),maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:data[name]||[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os340-test'}}}})},from:q})}})();`;
async function boot(page){
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_OS333__?.version),{timeout:10000}).toBe(333);
 await page.evaluate(key=>localStorage.setItem(key,'os340-test-session'),AUTH_KEY);
 await page.evaluate(()=>document.querySelector('#mainNav [data-view="tickets"]')?.click());
 await expect(page.locator('#view-tickets')).toHaveClass(/on/,{timeout:5000});
 await expect(page.locator('[data-os340-ticket-portfolio]')).toBeVisible({timeout:10000});
}

test('OS340 separates Inventory and Sold with correct P/L',async({page})=>{await boot(page);const state=await page.evaluate(()=>window.__KAMIL_TICKET_DESK331__);expect(state.portfolioVersion).toBe(340);expect(state.inventory).toBe(1);expect(state.sold).toBe(2);expect(state.actions).toBe(1);expect(state.potentialProfit).toBe(1000);expect(state.realizedProfit).toBe(1500);expect(state.pendingPayout).toBe(3000);await expect(page.locator('[data-td-pane="inventory"]')).toBeVisible();await expect(page.locator('[data-inventory-card]')).toHaveCount(1);await page.locator('[data-td-mode="sold"]').click();await expect(page.locator('[data-td-pane="sold"]')).toBeVisible();await expect(page.locator('[data-sold-card]')).toHaveCount(2);await expect(page.getByText('OS340 Sold Pending')).toBeVisible();await expect(page.getByText('OS340 Sold Paid')).toBeVisible();await expect(page.locator('[data-sold-card][data-payout="pending"]')).toHaveCount(1);await expect(page.locator('[data-sold-card][data-payout="paid"]')).toHaveCount(1)});

test('OS340 stays inside mobile viewport',async({page})=>{await page.setViewportSize({width:390,height:844});await boot(page);await page.locator('[data-td-mode="sold"]').click();const dims=await page.locator('[data-os340-ticket-portfolio]').evaluate(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right,width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}});expect(dims.left).toBeGreaterThanOrEqual(-1);expect(dims.right).toBeLessThanOrEqual(dims.width+1);expect(dims.scroll).toBeLessThanOrEqual(dims.width+1)});
