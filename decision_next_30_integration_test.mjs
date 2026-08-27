import {buildPersonalToday} from './js/personalToday26.js';
import {decisionNext30} from './js/decisionNext30.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const now=new Date('2026-08-20T10:00:00+02:00');
const s={
 financePlan:{currency:'CZK',cashNow:200000,reserveFloor:50000,cashflow:[]},
 tasks:[{id:'personal',title:'Osobní úkol',area:'Osobní',status:'UDĚLAT',due:'2026-08-21'}],
 personalAdmin:{items:[]},familyHome:{members:[]},assetBook:{items:[]},emergencyFile:{contacts:[],assets:[]},calendar:{events:[]},debtBook:{items:[]},audit:[],
 xtbHub:{asOf:'2026-08-20T08:00:00Z',accounts:{czk:{currency:'CZK',value:100000,positions:[{ticker:'WDAY',name:'Workday',category:'STOCK',value:10000,net_profit_pct:45}]}}},
 xtbStrategy:{closedTickers:{},overrides:{}},
 ticketBook:{items:[{id:'ticket-1',name:'Test koncert',workflow:'LISTED',date:'2026-08-21',qty:1,buy:1000,listPrice:1800,floorPrice:1200}],watchlist:[]}
};
const before=JSON.stringify(s),rows=buildPersonalToday(s,now);assert(JSON.stringify(s)===before,'30.4 integration must not mutate source state');
const xtb=rows.find(x=>x.id==='WDAY'),personal=rows.find(x=>x.id==='task:personal'||x.title==='Osobní úkol');
// OS148+ safety lives in the decision verdict: incomplete data must not be actionable.
// Next Trigger is read-only and may still display explanatory BUY/SELL rules already present on the source decision.
if(xtb){
 const action=String(xtb.action||'').toUpperCase();
 assert(!['BUY','TRIM','SELL'].includes(action),'incomplete XTB data must be blocked from actionable decision');
 const xn=decisionNext30(xtb);
 assert(xn.action===xtb.action,'Next Trigger must preserve the safety-gated source action');
 assert(!xn.rows.some(x=>x.label==='Provést obchod'),'Next Trigger must not invent an execution instruction');
}
assert(personal,'personal task included');const pn=decisionNext30(personal);assert(!pn.hasStructuredTrigger&&pn.rows.length===0,'personal decision without structured trading rules must not get fake trigger');
const explicit={action:'HOLD',when:'Po potvrzení dat',buyRule:'Přikoupit jen pod explicitním limitem',sellRule:'Snížit jen při explicitním pravidle'};
const en=decisionNext30(explicit);assert(en.hasStructuredTrigger&&en.rows.some(x=>x.kind==='BUY')&&en.rows.some(x=>x.kind==='SELL'),'explicit source rules must still be rendered');
console.log('NEXT TRIGGER 30.4 INTEGRATION SAFETY PASS');
