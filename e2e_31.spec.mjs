import {test,expect} from '@playwright/test';

const BASE='http://127.0.0.1:4173';

test('Kamil OS 31 local-first critical flow',async({page})=>{
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page).toHaveTitle(/Kamil OS 31\.4/);
  await expect(page.locator('#appView')).toBeVisible();
  await expect(page.locator('#syncStatus')).toContainText('Jen toto zařízení');
  expect(requests.some(u=>u.includes('@supabase/supabase-js'))).toBeFalsy();

  await expect(page.getByRole('heading',{name:'Tvoje data nejsou na tomto zařízení.'})).toBeVisible();
  await page.getByRole('button',{name:'Připojit moje data'}).click();
  await expect(page.locator('#authView')).toBeVisible();
  await expect(page.getByRole('button',{name:'Poslat přihlašovací odkaz bez hesla'})).toBeVisible();
  expect(requests.some(u=>u.includes('@supabase/supabase-js'))).toBeFalsy();
  await page.getByRole('button',{name:'Zpět do Kamil OS bez přihlášení'}).click();
  await expect(page.locator('#appView')).toBeVisible();

  for(const name of ['Peníze','Vstupenky','Domov','Více','Dnes']){
    await page.locator('#mainNav').getByRole('button',{name}).click();
    await expect(page.locator('.view.on')).toBeVisible();
  }

  await expect(page.locator('#decisionJournal31Button')).toBeVisible();
  await page.locator('#decisionJournal31Button').click();
  await expect(page.getByRole('heading',{name:'Decision Journal 31.1'})).toBeVisible();
  await page.getByRole('button',{name:'Zavřít'}).click();

  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').tasks?.length||0);
  await page.locator('#commandInput').fill('naprosto neznámá instrukce xyz 31');
  await page.locator('#commandGo').click();
  await expect(page.getByRole('heading',{name:'Tomuhle příkazu zatím nerozumím'})).toBeVisible();
  await page.getByRole('button',{name:'Zrušit'}).click();
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('kamil-os-state')||'{}').tasks?.length||0);
  expect(after).toBe(before);

  await page.locator('#mainNav').getByRole('button',{name:'Více'}).click();
  await page.getByRole('button',{name:/Systém/}).click();
  await expect(page.getByRole('heading',{name:/Health score/})).toBeVisible();
  await expect(page.getByRole('heading',{name:'IndexedDB history mirror'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Item-level shadow sync'})).toBeVisible();
});

test('Kamil OS 31.3 mirrors selected history into IndexedDB',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:42},financePlan:{cashNow:1,expectedIncome:0,reserveFloor:0,plannedInvestment:0},tasks:[],decisionJournal:{items:[{id:'e2e-decision',at:'2026-08-20T10:00:00Z',domain:'money',title:'E2E decision',action:'HOLD',priority:50}]}}));
  });
  await page.goto(BASE,{waitUntil:'networkidle'});
  await expect(page).toHaveTitle(/Kamil OS 31\.4/);
  await page.waitForFunction(()=>new Promise(resolve=>{const r=indexedDB.open('kamil-os-data-v2');r.onerror=()=>resolve(false);r.onsuccess=()=>{const db=r.result;if(!db.objectStoreNames.contains('history')){db.close();resolve(false);return}const tx=db.transaction('history','readonly'),q=tx.objectStore('history').get('decision|e2e-decision');q.onsuccess=()=>{const ok=q.result?.payload?.action==='HOLD';db.close();resolve(ok)};q.onerror=()=>{db.close();resolve(false)}}}),null,{timeout:10000});
  const record=await page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('kamil-os-data-v2');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('history','readonly'),q=tx.objectStore('history').get('decision|e2e-decision');q.onsuccess=()=>{resolve(q.result);db.close()};q.onerror=()=>{reject(q.error);db.close()}}}));
  expect(record.bucket).toBe('decision');expect(record.payload.action).toBe('HOLD');
});

test('Kamil OS 31.4 creates a safe local item-level outbox operation',async({page})=>{
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.addInitScript(()=>{
    localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:42},financePlan:{cashNow:1,expectedIncome:0,reserveFloor:0,plannedInvestment:0},tasks:[{id:'smart-task',title:'Před změnou',status:'OPEN',token:'NEULOZIT'}],personalAdmin:{items:[]},ticketBook:{items:[],watchlist:[]},debtBook:{items:[]},personalGoals:{items:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},assetBook:{items:[]},personalInbox:{items:[]}}));
  });
  await page.goto(BASE,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>new Promise(resolve=>{const r=indexedDB.open('kamil-os-data-v2');r.onerror=()=>resolve(false);r.onsuccess=()=>{const db=r.result;if(!db.objectStoreNames.contains('meta')){db.close();resolve(false);return}const q=db.transaction('meta','readonly').objectStore('meta').get('smart-sync');q.onsuccess=()=>{const ok=!!q.result?.baseline;db.close();resolve(ok)};q.onerror=()=>{db.close();resolve(false)}}}),null,{timeout:10000});
  await page.evaluate(async()=>{const {store}=await import('./js/state.js');store.mutate('E2E Smart Sync',s=>{s.tasks[0].title='Po změně'})});
  await page.waitForFunction(()=>new Promise(resolve=>{const r=indexedDB.open('kamil-os-data-v2');r.onerror=()=>resolve(false);r.onsuccess=()=>{const db=r.result;if(!db.objectStoreNames.contains('sync_ops')){db.close();resolve(false);return}const q=db.transaction('sync_ops','readonly').objectStore('sync_ops').getAll();q.onsuccess=()=>{const ok=(q.result||[]).some(x=>x.domain==='tasks'&&x.entityId==='smart-task'&&x.op==='UPSERT'&&x.status==='PENDING'&&x.payload?.title==='Po změně'&&!('token'in(x.payload||{})));db.close();resolve(ok)};q.onerror=()=>{db.close();resolve(false)}}}),null,{timeout:10000});
  const op=await page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('kamil-os-data-v2');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,q=db.transaction('sync_ops','readonly').objectStore('sync_ops').getAll();q.onsuccess=()=>{resolve((q.result||[]).find(x=>x.entityId==='smart-task'));db.close()};q.onerror=()=>{reject(q.error);db.close()}}}));
  expect(op.op).toBe('UPSERT');expect(op.status).toBe('PENDING');expect(op.payload.title).toBe('Po změně');expect(op.payload.token).toBeUndefined();expect(requests.some(u=>u.includes('@supabase/supabase-js'))).toBeFalsy();
});
