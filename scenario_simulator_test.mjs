const assert=(x,m)=>{if(!x)throw new Error(m)};
const {simulateScenario}=await import('./js/scenarioSimulator26.js');
const now=new Date('2026-08-20T10:00:00+02:00'),fresh=new Date().toISOString();
const base=()=>({
 financePlan:{currency:'CZK',cashNow:100000,reserveFloor:40000,plannedInvestment:0,cashflow:[]},
 personalAdmin:{items:[]},familyHome:{members:[]},debtBook:{items:[]},
 ticketBook:{items:[],watchlist:[],history:[],review:[]},
 xtbReport:{asOf:fresh},xtbHub:{asOf:fresh,accounts:{czk:{currency:'CZK',value:100000,positions:[]}}},xtbStrategy:{overrides:{}},tradeJournal:{trades:[]}
});

let s=base(),before=JSON.stringify(s),r=simulateScenario(s,{type:'EXPENSE',amount:20000,date:'2026-08-20',currency:'CZK'},now);
assert(r.ok&&r.verdict==='OK','20k expense stays safe');
assert(r.sim.cashflow.minBalance===80000,'expense lowers minimum by 20k');
assert(r.delta.minBalance===-20000,'expense delta');
assert(r.sim.allocation.safeBeforePlan===40000,'safe headroom falls to 40k');
assert(JSON.stringify(s)===before,'scenario must not mutate state');

s=base();r=simulateScenario(s,{type:'INVEST',amount:70000,date:'2026-08-20'},now);
assert(r.ok&&r.verdict==='BLOCK','70k investment must be blocked by reserve');
assert(r.sim.cashflow.status==='RISK','investment breaches reserve');
assert(r.sim.cashflow.belowReserveDate==='2026-08-20','breach date visible');

s=base();r=simulateScenario(s,{type:'INCOME',amount:20000,date:'2026-08-20'},now);
assert(r.ok&&r.verdict==='OK','income remains safe');
assert(r.delta.minBalance===20000&&r.sim.cashflow.endBalance===120000,'income improves liquidity');

s=base();s.financePlan.plannedInvestment=50000;r=simulateScenario(s,{type:'EXPENSE',amount:30000,date:'2026-08-20'},now);
assert(r.verdict==='BLOCK','expense that makes existing plan unfunded is blocked');
assert(r.sim.allocation.unfundedPlan===20000,'unfunded planned investment detected');

s=base();r=simulateScenario(s,{type:'EXPENSE',amount:1000,date:'2026-08-20',currency:'EUR'},now);
assert(!r.ok&&r.code==='FX_UNSUPPORTED','foreign currency is not invented through FX');

s=base();r=simulateScenario(s,{type:'EXPENSE',amount:10000,date:'2026-12-01'},now);
assert(r.ok&&r.verdict==='OUTSIDE_HORIZON'&&!r.withinHorizon,'outside 90d horizon is explicit');
assert(r.delta.minBalance===0,'outside horizon does not fake 90d impact');

s=base();r=simulateScenario(s,{type:'EXPENSE',amount:10000,date:'2026-08-19'},now);
assert(!r.ok&&r.code==='PAST_DATE','past scenario date rejected');

console.log('SCENARIO SIMULATOR QA PASS');
