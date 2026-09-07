import {test,expect} from '@playwright/test';

test('OS1037 boots and opens the primary Control Plane',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_CONTROL_PLANE1037__?.version||''),{timeout:25000}).toBe('1037.0.0');
 const input=page.locator('#commandInput');
 await input.fill('/control');await input.press('Enter');
 await expect(page.getByText('Kamil OS Control Plane · OS1037')).toBeVisible();
 await expect(page.getByText('SYSTEM HEALTH')).toBeVisible();
 await expect(page.getByText('Externí live data se nikdy nevymýšlí.')).toBeVisible();
 await page.getByRole('button',{name:'Zavřít'}).last().click();
 await page.locator('[data-personal-more]:visible').click();
 await expect(page.getByRole('button',{name:'Kamil OS Control Plane'})).toBeVisible();
});

test('OS1037 backup, adapter and action safety contracts work in Chromium',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_CONTROL_PLANE1037__?.version||''),{timeout:25000}).toBe('1037.0.0');
 const result=await page.evaluate(async()=>{
  const m=await import('/js/controlPlane1037.js');
  const before=m.backupSnapshotList998().length;
  const snap=m.automaticBackupSnapshot998('e2e');
  const dry=m.restoreCenter999(snap.id);
  const blocked=m.actionExecutionFramework1015({type:'TRANSFER',amount:1000},{confirmed:true});
  const gmail=m.gmailActionBridge1021();
  const created=m.actionExecutionFramework1015({type:'CREATE_TASK',title:'OS1037 E2E task'},{confirmed:true});
  return{before,after:m.backupSnapshotList998().length,dryMode:dry.mode,blocked:blocked.blocked,gmail:gmail.status,created:created.ok,features:window.__KAMIL_CONTROL_PLANE1037__?.features?.length||0,health:m.systemHealth988().score};
 });
 expect(result.after).toBeGreaterThan(result.before);
 expect(result.dryMode).toBe('DRY_RUN');
 expect(result.blocked).toBe(true);
 expect(result.gmail).toBe('ADAPTER_REQUIRED');
 expect(result.created).toBe(true);
 expect(result.features).toBe(50);
 expect(result.health).toBeGreaterThanOrEqual(0);
 expect(result.health).toBeLessThanOrEqual(100);
});
