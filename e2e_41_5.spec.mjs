import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Kamil OS 41.5 imports legacy data helpers without mutating state',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('kamil-os-state',JSON.stringify({meta:{schemaVersion:80},tasks:[],ticketBook:{items:[],watchlist:[],history:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},tradeJournal:{trades:[]},investmentBook:{history:[]},importCenter:{history:[]}})));
 await page.goto(BASE,{waitUntil:'networkidle'});
 const snapshot=()=>page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');return {tickets:(s.ticketBook?.items||[]).length,investments:(s.netWorthBook?.items||[]).filter(x=>x.externalInvestmentKey).length,ticketSnapshot:s.meta?.currentTicketSnapshot||null,investmentSnapshot:s.meta?.externalInvestmentSnapshot||null}});
 const before=await snapshot();
 await page.evaluate(async()=>{await import('./js/currentTickets33.js');await import('./js/externalInvestments33.js')});
 expect(await snapshot()).toEqual(before);
 await page.evaluate(async()=>{const tickets=await import('./js/currentTickets33.js');const investments=await import('./js/externalInvestments33.js');tickets.ensureCurrentTicketSnapshot33();investments.ensureExternalInvestments33()});
 const after=await snapshot();
 expect(after.tickets).toBe(12);
 expect(after.investments).toBe(2);
 expect(after.ticketSnapshot).toBe('tickets-2026-08-21');
 expect(after.investmentSnapshot).toBe('external-investments-2026-07-24');
});
