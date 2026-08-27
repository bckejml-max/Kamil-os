import {buildPersonalToday} from './js/personalToday26.js';
import {decisionSnapshot30,decisionDelta30} from './js/decisionDelta30.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const now=new Date('2026-08-20T10:00:00+02:00');

// Keep one real integration invariant: building Today decisions must stay read-only.
const state={financePlan:{currency:'CZK',cashNow:200000,reserveFloor:50000,cashflow:[]},tasks:[],personalAdmin:{items:[]},familyHome:{members:[]},assetBook:{items:[]},emergencyFile:{contacts:[],assets:[]},calendar:{events:[]},debtBook:{items:[]},audit:[],xtbStrategy:{closedTickers:{},overrides:{}},ticketBook:{items:[],watchlist:[]},xtbHub:{asOf:'2026-08-20T08:00:00Z',accounts:{czk:{currency:'CZK',value:100000,positions:[{ticker:'WDAY',name:'Workday',category:'STOCK',value:10000,net_profit_pct:30}]}}}};
const state0=JSON.stringify(state);buildPersonalToday(state,now);assert(JSON.stringify(state)===state0,'decision build must not mutate integration state');

// Decision Delta is tested against explicit decision outputs, not obsolete market heuristics.
// REVIEW -> HOLD is safe and still proves stable-ID action transition detection.
const before=[
 {domain:'money',id:'WDAY',title:'Workday',priority:82,action:'REVIEW',reason:'Data nejsou kompletní',when:'Po potvrzení dat'},
 {domain:'tickets',id:'ticket-1',title:'Test koncert',priority:78,action:'WATCH',reason:'Čeká na čerstvý market'}
];
const current=[
 {domain:'money',id:'WDAY',title:'Workday',priority:88,action:'HOLD',reason:'Data potvrzena, bez akčního obchodu',when:'Další kontrola při nové ceně'},
 {domain:'tickets',id:'ticket-1',title:'Test koncert',priority:91,action:'VERIFY_DATA',reason:'Market zdroje jsou v konfliktu'}
];
const baseline=decisionSnapshot30(before,now),delta=decisionDelta30(current,baseline,new Date('2026-08-20T12:00:00+02:00'));
const xd=delta.items.find(x=>x.key==='money|WDAY'),td=delta.items.find(x=>x.key==='tickets|ticket-1');
assert(xd?.type==='ACTION'&&xd.detail.includes('REVIEW → HOLD'),'XTB safe action delta missing');
assert(td?.type==='ACTION'&&td.detail.includes('WATCH → VERIFY_DATA'),'ticket safety action delta missing');
assert(delta.attention>=2,'material action changes must require attention');
assert(!delta.items.some(x=>x.type==='OUT'&&(x.key==='money|WDAY'||x.key==='tickets|ticket-1')),'same stable IDs must not become false OUT changes');
assert(JSON.stringify(before).includes('REVIEW')&&JSON.stringify(current).includes('VERIFY_DATA'),'fixture must preserve explicit safety-gated decisions');
console.log('DECISION DELTA 30.5 INTEGRATION SAFETY PASS');
