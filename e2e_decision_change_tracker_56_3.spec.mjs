import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const fresh=()=>new Date().toISOString();
const seed=()=>{const now=fresh(),event=new Date(Date.now()+9*86400000).toISOString().slice(0,10);return{meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:now,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:25,net_profit:20000,currency:'CZK'}]}}},xtbReport:{asOf:now,czkValue:100000,czkProfit:20000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:20000,weightPct:9}]},ticketBook:{items:[{id:'t1',name:'Koncert A',workflow:'LISTED',date:event,sellBy:event,qty:4,buy:8000,listPrice:3000,marketPrice:2800,marketCheckedAt:now,marketSourceUrl:'https://example.com/market',floorPrice:2300,transferStatus:'READY',feeRate:.12}]}}};

test('Decision Change Tracker 56.3 detects verdict and material changes against manual baseline',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const result=await page.evaluate(async()=>{const m=await import('./js/decisionChangeTracker563.js'),s=JSON.parse(localStorage.getItem('kamil-os-state')),snap=m.buildDecisionSnapshot563(s),baseline=JSON.parse(JSON.stringify(snap));baseline.at=new Date(Date.now()-86400000).toISOString();baseline.rows[0]={...baseline.rows[0],verdict:baseline.rows[0].verdict==='HOLD'?'SELL':'HOLD',confidence:Math.max(0,baseline.rows[0].confidence-15),market:baseline.rows[0].market?baseline.rows[0].market*.9:null};s.marketDecisionHistory={snapshots:[baseline]};return m.decisionChangeTracker563(s)});
 expect(result.needsBaseline).toBe(false);expect(result.changes.length).toBeGreaterThan(0);expect(result.material.length).toBeGreaterThan(0);expect(result.changes.some(x=>x.verdictChanged)).toBe(true);expect(result.changes.some(x=>x.details.some(d=>d.includes('→')))).toBe(true);
 const diag=await page.evaluate(()=>window.__KAMIL_CHANGE_TRACKER_563_LAST__);expect(diag.ms).toBeLessThan(500);
});

test('Decision Change Tracker stays lazy and baseline write requires explicit confirmation',async({page})=>{
 const state=seed();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 expect(await page.evaluate(()=>window.__KAMIL_CHANGE_TRACKER_563_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Akční fronta'}).first().click();
 await page.getByRole('button',{name:'Exact Today Plan 56.1'}).click();
 await page.getByRole('button',{name:'Recheck Triggers 56.2'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Recheck Triggers 56.2'})).toBeVisible();
 expect(await page.evaluate(()=>window.__KAMIL_CHANGE_TRACKER_563_LAST__||null)).toBeNull();
 await page.getByRole('button',{name:'Decision Changes 56.3'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Decision Changes 56.3'})).toBeVisible();
 await expect(page.locator('#modalHost')).toContainText('DECISION CHANGE TRACKER 56.3');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')).marketDecisionHistory||null)).toBeNull();
 await page.getByRole('button',{name:'Uložit první baseline'}).click();
 await expect(page.getByRole('heading',{name:'Potvrdit market baseline'})).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')).marketDecisionHistory||null)).toBeNull();
 await page.getByRole('button',{name:'Ano, uložit baseline'}).click();
 await expect(page.getByRole('heading',{name:'XTB + vstupenky / Decision Changes 56.3'})).toBeVisible();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')).marketDecisionHistory?.snapshots||[]);expect(saved.length).toBe(1);expect(saved[0].rows.length).toBeGreaterThan(0);
 const undo=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-41-undo')||'[]'));expect(undo.length).toBeGreaterThan(0);
 expect(await page.evaluate(()=>!!document.querySelector('#platform43'))).toBe(false);
});
