import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const AUTH_KEY='sb-tswqfbkmxywxxczsoddr-auth-token';
const active=Array.from({length:45},(_,i)=>({id:`os361-active-${i}`,event_name:`OS361 Long Event ${String(i+1).padStart(2,'0')}`,event_date:`2026-10-${String((i%28)+1).padStart(2,'0')}`,section:`S${(i%12)+1}`,qty:2,buy_each_czk:900+i*5,buy_total_czk:(900+i*5)*2,ask_each_czk:1350+i*8,market_status:'LISTED',stubhub_url:`https://www.stubhub.com/test/event/${1000+i}`}));
const sold=Array.from({length:6},(_,i)=>({id:`os361-sold-${i}`,event_name:`OS361 Sold ${i+1}`,event_date:`2026-07-${String((i%28)+1).padStart(2,'0')}`,section:`C${i+1}`,qty:1,buy_each_czk:1000,buy_total_czk:1000,sell_each_czk:1450+i*20,sell_total_czk:1450+i*20,market_status:i%2?'PAYOUT_RECEIVED':'SOLD_WAITING_PAYMENT'}));
const inventory=[...active,...sold];
const snapshots=active.map((r,i)=>({ticket_id:r.id,checked_at:new Date().toISOString(),market_price_czk:1325+i*8,confidence:'high',recommendation_code:i%4===0?'LOWER':'LIST',recommendation_label:i%4===0?'ZLEVNIT':'PRODAT',recommendation_reason:'OS361 long-list market signal.',recommended_ask_czk:1375+i*8,same_section_count:3,competitor_count:5,resolved_url:'https://www.viagogo.com/test'}));
const fakeSdk=`(()=>{const data={ticket_inventory:${JSON.stringify(inventory)},ticket_market_snapshots:${JSON.stringify(snapshots)},ticket_market_alerts:[]};function q(name){const api={select(){return api},order(){return api},limit(){return api},is(){return api},eq(){return api},in(){return api},update(){return api},upsert(){return api},delete(){return api},single:async()=>({data:null,error:null}),maybeSingle:async()=>({data:null,error:null}),then(resolve,reject){return Promise.resolve({data:data[name]||[],error:null}).then(resolve,reject)}};return api}window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'os361-test'}}}})},from:q})}})();`;
async function boot(page){
 await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',r=>r.fulfill({status:200,contentType:'application/javascript',body:fakeSdk}));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_OS333__?.version),{timeout:10000}).toBe(333);
 await page.evaluate(key=>localStorage.setItem(key,'os361-test-session'),AUTH_KEY);
 await page.evaluate(()=>window.__KAMIL_NAVIGATION342__?.navigate?.('tickets')||window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'tickets'})));
 await expect(page.locator('#view-tickets')).toHaveClass(/on/,{timeout:5000});
 await expect(page.locator('[data-os340-ticket-portfolio]')).toBeVisible({timeout:10000});
 await expect(page.locator('[data-inventory-card]')).toHaveCount(45);
}
async function scrollState(page){return page.locator('#ticketIntelView').evaluate(host=>{const candidates=[host,...Array.from(host.parentElement?function*(){let x=host.parentElement;while(x){yield x;x=x.parentElement}}():[])];let owner=candidates.find(x=>{const s=getComputedStyle(x);return /(auto|scroll)/.test(s.overflowY)&&x.scrollHeight>x.clientHeight+20});if(!owner)owner=document.scrollingElement;return{ownerId:owner?.id||owner?.tagName||'document',scrollHeight:owner?.scrollHeight||0,clientHeight:owner?.clientHeight||0,scrollTop:owner?.scrollTop||0}})}

test('OS361 long Ticket Desk remains scrollable and stable',async({page})=>{
 await boot(page);
 const before=await scrollState(page);expect(before.scrollHeight).toBeGreaterThan(before.clientHeight+250);
 const mutationCount=await page.locator('#ticketIntelView').evaluate(async host=>{let count=0;const obs=new MutationObserver(rows=>{for(const r of rows)if(r.type==='childList')count+=r.addedNodes.length+r.removedNodes.length});obs.observe(host,{childList:true,subtree:true});let x=host;let owner=null;while(x){const s=getComputedStyle(x);if(/(auto|scroll)/.test(s.overflowY)&&x.scrollHeight>x.clientHeight+20){owner=x;break}x=x.parentElement}owner=owner||document.scrollingElement;owner.scrollTop=Math.min(900,Math.max(300,owner.scrollHeight-owner.clientHeight));owner.dispatchEvent(new Event('scroll',{bubbles:true}));await new Promise(r=>setTimeout(r,900));obs.disconnect();return count});
 const after=await scrollState(page);expect(after.scrollTop).toBeGreaterThan(150);expect(mutationCount).toBeLessThanOrEqual(2);await expect(page.locator('[data-inventory-card]')).toHaveCount(45);await expect(page.getByRole('heading',{name:'OS361 Long Event 45',exact:true})).toBeAttached();
});

test('OS361 long Ticket Desk stays mobile-safe while scrolling',async({page})=>{
 await page.setViewportSize({width:390,height:844});await boot(page);
 const dims=await page.locator('[data-os340-ticket-portfolio]').evaluate(el=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,right:el.getBoundingClientRect().right}));expect(dims.scroll).toBeLessThanOrEqual(dims.client+1);expect(dims.right).toBeLessThanOrEqual(dims.client+1);
 await page.locator('#ticketIntelView').evaluate(host=>{let x=host;let owner=null;while(x){const s=getComputedStyle(x);if(/(auto|scroll)/.test(s.overflowY)&&x.scrollHeight>x.clientHeight+20){owner=x;break}x=x.parentElement}owner=owner||document.scrollingElement;owner.scrollTop=Math.min(700,owner.scrollHeight-owner.clientHeight);owner.dispatchEvent(new Event('scroll',{bubbles:true}))});
 await page.waitForTimeout(250);const after=await scrollState(page);expect(after.scrollTop).toBeGreaterThan(100);await expect(page.locator('[data-td-mode="inventory"]')).toBeVisible();
});
