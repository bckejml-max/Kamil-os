const assert=(x,m)=>{if(!x)throw new Error(m)};
const {nextMonthPlan}=await import('./js/nextMonthPlanner29.js');
const ref=new Date('2026-08-20T10:00:00+02:00');
const s={
 financePlan:{currency:'CZK',cashNow:100000,reserveFloor:50000,plannedInvestment:0,cashflow:[
  {id:'salary',label:'Příjem',amount:30000,date:'2026-08-25',cadence:'monthly',active:true},
  {id:'rent',label:'Nájem',amount:-25000,date:'2026-08-26',cadence:'monthly',active:true}
 ]},
 personalAdmin:{items:[
  {id:'ins',title:'Pojištění domu',category:'INSURANCE',amount:12000,currency:'CZK',cadence:'YEARLY',nextDue:'2026-09-10',status:'ACTIVE'},
  {id:'eur',title:'Cloud EUR',category:'SUBSCRIPTION',amount:10,currency:'EUR',cadence:'MONTHLY',nextDue:'2026-08-28',status:'ACTIVE'},
  {id:'doc',title:'Cestovní pas',category:'DOCUMENT',status:'ACTIVE',document:{expiryDate:'2026-09-05'}}
 ]},
 personalGoals:{items:[{id:'g1',title:'Dovolená',type:'TRAVEL',targetAmount:60000,savedAmount:30000,currency:'CZK',targetDate:'2026-12-20',monthlyContribution:5000,status:'ACTIVE'}]},
 ticketBook:{items:[{id:'tk1',name:'Sparta Praha',workflow:'HOLD',qty:2,buy:4000,currency:'CZK',date:'2026-09-15'}]},
 assetBook:{items:[]},familyHome:{members:[]},calendar:{events:[]},tasks:[],debtBook:{items:[]}
};
const p=nextMonthPlan(s,ref);
assert(p.period.key==='2026-09'&&p.period.from==='2026-09-01'&&p.period.toExclusive==='2026-10-01','next calendar month');
assert(p.cashflow.inflow===30000,'September salary included');
assert(p.cashflow.outflow===37000,'September rent and insurance included');
assert(p.cashflow.startBalance===105000&&p.cashflow.endBalance===98000,'known balances bridge current month into next');
assert(p.cashflow.minBalance===93000&&p.cashflow.status==='OK','next month reserve check');
assert(p.cashflow.ignoredCurrencyCount===1,'foreign currency gap surfaced without FX');
assert(p.deadlines.items.some(x=>x.title==='Cestovní pas'),'document deadline included');
assert(p.goals.byCurrency.CZK.planned===5000,'stored goal plan kept in CZK');
assert(p.goals.items[0].required>p.goals.items[0].planned&&p.goals.items[0].gap>0,'goal pace gap calculated');
assert(!('total' in p.goals.byCurrency),'goal currencies never mixed');
assert(p.tickets.positions===1&&p.tickets.qty===2&&p.tickets.capitalByCurrency.CZK===4000,'next month ticket exposure');
assert(p.attention.some(x=>x.key==='fx-gap'),'FX omission becomes explicit planning item');
assert(p.attention.some(x=>x.key==='ticket:tk1'),'ticket event becomes preparation item');
console.log('NEXT MONTH PLANNER 29.2 QA PASS');
