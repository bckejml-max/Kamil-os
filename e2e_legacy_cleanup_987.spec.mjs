import {test,expect} from '@playwright/test';

test('OS987 blocks physical retirement before observation window',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_LEGACY_CLEANUP987__?.version||''),{timeout:20000}).toBe('987.0.0');
 const state=await page.evaluate(()=>window.__KAMIL_LEGACY_CLEANUP987__.readiness());
 expect(state.window.ready).toBe(false);
 expect(state.candidates.length).toBe(0);
 const input=page.locator('#commandInput');
 await input.fill('/cleanup');await input.press('Enter');
 await expect(page.getByText('Legacy Cleanup Control · OS987')).toBeVisible();
 await expect(page.getByText(/Fyzické mazání je zablokované/)).toBeVisible();
 await expect(page.getByText(/OS987 nic nemaže/)).toBeVisible();
});

test('OS987 can mark only low-medium dependency modules as candidates after 30 days',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>localStorage.setItem('kamil.oneos.usage.975',JSON.stringify([{feature:'today',surface:'oneos',at:new Date(Date.now()-31*86400000).toISOString()}])));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_LEGACY_CLEANUP987__?.version||''),{timeout:20000}).toBe('987.0.0');
 const state=await page.evaluate(()=>window.__KAMIL_LEGACY_CLEANUP987__.readiness());
 expect(state.window.ready).toBe(true);
 expect(state.candidates.length).toBeGreaterThan(0);
 expect(state.candidates.every(x=>['LOW','MEDIUM'].includes(x.risk))).toBe(true);
 expect(state.keep.some(x=>x.risk==='CRITICAL')).toBe(true);
 expect(state.keep.some(x=>x.risk==='HIGH')).toBe(true);
});
