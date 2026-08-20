const assert=(x,m)=>{if(!x)throw new Error(m)};
const {capitalAllocation}=await import('./js/capitalAllocation25.js');

const fresh=new Date().toISOString();
const base=()=>({
 financePlan:{cashNow:100000,reserveFloor:40000,plannedInvestment:20000,cashflow:[{id:'rent',label:'Známý výdaj',amount:-10000,date:'2026-08-25',cadence:'once',active:true}]},
 debtBook:{items:[]},
 ticketBook:{items:[],watchlist:[],history:[],review:[]},
 xtbReport:{asOf:fresh},
 xtbHub:{asOf:fresh,accounts:{czk:{currency:'CZK',value:100000,positions:[
  {ticker:'CORE',name:'Global broad ETF',category:'ETF',value:30000,net_profit_pct:0},
  {ticker:'STOCK',name:'Single Stock',category:'STOCK',value:70000,net_profit_pct:0}
 ]}}},
 xtbStrategy:{overrides:{}},tradeJournal:{trades:[]}
});

let s=base();
let a=capitalAllocation(s,new Date('2026-08-20T10:00:00'));
assert(a.safeBeforePlan===50000,'uses lower 90d headroom');
assert(a.newCapital===30000,'subtracts already planned investment');
assert(a.rows.find(x=>x.key==='xtb').amount===30000,'fresh under-allocated XTB receives residual');
assert(a.rows.find(x=>x.key==='tickets').amount===0,'no live BUY means no ticket budget');

s=base();s.xtbHub.asOf='2020-01-01';s.xtbReport.asOf='2020-01-01';
a=capitalAllocation(s,new Date('2026-08-20T10:00:00'));
assert(a.rows.find(x=>x.key==='xtb').amount===0,'stale XTB import blocks XTB allocation');
assert(a.cashHold===30000,'stale XTB allocation stays in cash');

s=base();s.ticketBook.watchlist=[{id:'live-buy',name:'Concert opportunity',saleAt:'2026-08-21',date:'2026-12-01',maxBuyPrice:5000,targetResale:7500}];
s.ticketBook.intelligenceAsOf=fresh;s.ticketBook.intelligence={opportunities:{'live-buy':{action:'BUY',priority:96,confidence:91,reason:'Verified live opportunity',sourceUrls:['https://example.com/ticket-market/live-buy']}}};
a=capitalAllocation(s,new Date('2026-08-20T10:00:00'));
assert(a.rows.find(x=>x.key==='tickets').amount===4500,'source-backed live ticket BUY is capped at 15 percent of new capital');
assert(a.ticket?.source==='ŽIVĚ · OVĚŘENÉ','ticket allocation keeps verified live provenance');
assert(a.rows.find(x=>x.key==='xtb').amount===25500,'remaining capital can still rebalance XTB');

s=base();s.ticketBook.watchlist=[{id:'live-buy',name:'Concert opportunity',saleAt:'2026-08-21',date:'2026-12-01',maxBuyPrice:5000,targetResale:7500}];
s.ticketBook.items=[{id:'urgent',name:'Urgent existing ticket',workflow:'LISTED',qty:2,buy:6000,date:new Date(Date.now()+2*86400000).toISOString().slice(0,10),listPrice:3500}];
s.ticketBook.intelligenceAsOf=fresh;s.ticketBook.intelligence={opportunities:{'live-buy':{action:'BUY',priority:96,confidence:91,reason:'Verified live opportunity',sourceUrls:['https://example.com/ticket-market/live-buy']}}};
a=capitalAllocation(s,new Date('2026-08-20T10:00:00'));
assert(a.cockpit.urgent>0,'urgent ticket inventory detected');
assert(a.rows.find(x=>x.key==='tickets').amount===0,'urgent inventory blocks new ticket budget');

console.log('CAPITAL ALLOCATION QA PASS');
