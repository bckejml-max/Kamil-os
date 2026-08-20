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
const xtb=rows.find(x=>x.id==='WDAY'),ticket=rows.find(x=>x.id==='ticket-1'),personal=rows.find(x=>x.id==='task:personal'||x.title==='Osobní úkol');
assert(xtb&&xtb.kind==='XTB'&&xtb.action==='TRIM','XTB decision included');
assert(xtb.when&&xtb.buyRule&&xtb.sellRule,'XTB timing rules propagated to Today decision');
const xn=decisionNext30(xtb);assert(xn.hasStructuredTrigger&&xn.rows.some(x=>x.kind==='BUY')&&xn.rows.some(x=>x.kind==='SELL'),'XTB Next Trigger renders buy and sell rules');
assert(ticket&&ticket.kind==='Vstupenky'&&ticket.action==='SELL','ticket decision included');
assert(ticket.when&&ticket.buyRule&&ticket.sellRule,'ticket timing rules propagated to Today decision');
const tn=decisionNext30(ticket);assert(tn.hasStructuredTrigger&&tn.rows[0].value===ticket.when,'ticket Next Trigger uses actual engine timing');
assert(personal,'personal task included');const pn=decisionNext30(personal);assert(!pn.hasStructuredTrigger&&pn.rows.length===0,'personal decision without structured trading rules must not get fake trigger');
console.log('NEXT TRIGGER 30.4 INTEGRATION TEST PASS');
