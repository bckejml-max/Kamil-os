import {test,expect} from '@playwright/test';

test('OS1047 exposes a health ribbon and practical Operations center',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_CONTROL_OPERATIONS1047__?.version||''),{timeout:25000}).toBe('1047.0.0');
 const health=page.locator('[data-os-health-1046]');
 await expect(health).toBeVisible();
 await expect.poll(()=>health.getAttribute('data-score')).not.toBeNull();
 const input=page.locator('#commandInput');
 await input.fill('/ops');await input.press('Enter');
 await expect(page.getByText('Control Plane Operations · OS1047')).toBeVisible();
 await expect(page.getByText('OPERATIONS')).toBeVisible();
 await expect(page.getByRole('button',{name:'Watch pravidla'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Snapshot / Restore'})).toBeVisible();
});

test('OS1047 snapshot, watch, automation and conflict operations stay safe',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_CONTROL_OPERATIONS1047__?.version||''),{timeout:25000}).toBe('1047.0.0');
 const result=await page.evaluate(async()=>{
  const op=await import('/js/controlOperations1047.js');
  const cp=await import('/js/controlPlane1037.js');
  const snap=cp.automaticBackupSnapshot998('e2e-1047');
  cp.actionExecutionFramework1015({type:'CREATE_TASK',title:'OS1047 changed task'},{confirmed:true});
  const diff=op.snapshotDiff1039(snap.id);
  const blockedRestore=op.confirmedRestore1040(snap.id,'NOPE');
  const watch=op.createWatch1041({kind:'MONEY',field:'free',subject:'E2E cash watch'});
  const watchOff=watch.ok?op.setWatchEnabled1042(watch.row.id,false):{ok:false};
  const automation=op.createAutomation1043({name:'E2E health rule',condition:'HEALTH_BELOW',value:101,action:'CREATE_INBOX_ITEM',title:'E2E health inbox'});
  const automationInitiallyDisabled=automation.ok?automation.row.enabled===false:false;
  const automationOn=automation.ok?op.setAutomationEnabled1043(automation.row.id,true):{ok:false};
  const run=op.runAutomations1044();
  const conflict=cp.syncConflictCenter1011({id:'e2e-conflict',title:'local'},{id:'e2e-conflict',title:'remote'});
  const resolved=conflict.conflict?op.resolveConflict1045(conflict.row.id,'KEEP_LOCAL'):{ok:false};
  const overview=op.operationsOverview1038();
  return{
   diffOk:diff.ok,taskDelta:diff.domains.find(x=>x.domain==='tasks')?.delta||0,
   restoreBlocked:blockedRestore.needsConfirmation===true&&blockedRestore.applied===false,
   watchOk:watch.ok&&watchOff.ok,automationOk:automation.ok&&automationInitiallyDisabled&&automationOn.ok,
   runCount:run.results.length,history:op.automationHistory1044().length,
   conflictSafe:resolved.ok&&resolved.row.applied===false&&!op.conflictQueue1045().some(x=>x.id===resolved.row.id),
   features:window.__KAMIL_CONTROL_OPERATIONS1047__?.features?.length||0,overview
  };
 });
 expect(result.diffOk).toBe(true);
 expect(result.taskDelta).toBeGreaterThanOrEqual(1);
 expect(result.restoreBlocked).toBe(true);
 expect(result.watchOk).toBe(true);
 expect(result.automationOk).toBe(true);
 expect(result.runCount).toBeGreaterThanOrEqual(1);
 expect(result.history).toBeGreaterThanOrEqual(1);
 expect(result.conflictSafe).toBe(true);
 expect(result.features).toBe(10);
 expect(result.overview.policy.financialExecution).toBe(false);
 expect(result.overview.policy.bettingExecution).toBe(false);
});
