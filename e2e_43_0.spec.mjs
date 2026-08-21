import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Kamil OS 43 exposes all 60 roadmap capabilities and top-3 autopilot',async({page})=>{
  await page.goto(BASE,{waitUntil:'networkidle'});
  const result=await page.evaluate(async()=>{
    const p=await import('./js/platform43.js');
    const state={
      tasks:[{id:'t1',title:'Urgentní termín',status:'OPEN',due:new Date(Date.now()-86400000).toISOString()},{id:'t2',title:'Běžný úkol',status:'OPEN'}],
      directorBook:{waiting:[{id:'w1',title:'Čekám na dodavatele',status:'OPEN',createdAt:new Date(Date.now()-5*86400000).toISOString()}]},
      ticketBook:{items:[{id:'x1',title:'Test zápas',workflow:'LISTED',eventDate:new Date(Date.now()+5*86400000).toISOString(),buyPrice:1000,askPrice:1500,qty:2}]},
      receivables:[{id:'r1',title:'Faktura',status:'OPEN',amount:25000,due:new Date(Date.now()-2*86400000).toISOString()}]
    };
    const inbox=p.universalInbox43(state),auto=p.dailyAutopilot43(state),tickets=p.tickets43(state);
    p.setSafeMode43(true);const safe=p.safeMode43();p.setSafeMode43(false);
    return {features:p.ROADMAP43.length,top:auto.top.length,first:inbox[0]?.title,safe,ticketWindow:tickets.rows[0]?.window};
  });
  expect(result.features).toBe(60);
  expect(result.top).toBeGreaterThan(0);
  expect(result.top).toBeLessThanOrEqual(3);
  expect(result.first).toBe('Urgentní termín');
  expect(result.safe).toBe(true);
  expect(result.ticketWindow).toContain('sell window');
});
