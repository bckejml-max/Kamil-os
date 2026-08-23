import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';
const staleState=()=>{const stale=new Date(Date.now()-90*3600000).toISOString();return{meta:{schemaVersion:80},financePlan:{plannedInvestment:25000},xtbHub:{asOf:stale,accounts:{CZK:{currency:'CZK',value:100000,positions:[{ticker:'WDAY.US',name:'Workday',category:'STOCK',value:100000,volume:10,net_profit_pct:55,net_profit:38000,currency:'CZK'}]}}},xtbReport:{asOf:stale,czkValue:100000,czkProfit:38000,positions:[{ticker:'WDAY.US',name:'Workday',valueCZK:100000,profitCZK:38000,weightPct:18}]},ticketBook:{items:[]}}};

test('59.7 explains the shortest manual path for an unchanged blocker',async({page})=>{
 const state=staleState();await page.addInitScript(s=>localStorage.setItem('kamil-os-state',JSON.stringify(s)),state);await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const result=await page.evaluate(async()=>{const a=await import('./js/commanderFixRerun596.js');const g=await import('./js/commanderGuidedResolution597.js');const snap=a.armFixRerun596();return g.commanderGuidedResolution597(undefined,snap)});
 expect(result.status).toBe('SAME');expect(result.guide.kind).toBe('XTB_DATA');expect(result.guide.next).toMatch(/XTB export|XTB import/i);expect(result.guide.target).toBe('recheck');
 expect(await page.evaluate(()=>window.__KAMIL_GUIDED_597_LAST__?.kind)).toBe('XTB_DATA');
});
