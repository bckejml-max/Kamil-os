import {cashflow90} from './js/cashflow25.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const now=new Date('2026-08-20T12:00:00Z');
const state={financePlan:{cashNow:100000,reserveFloor:50000,currency:'CZK',cashflow:[
 {id:'salary',label:'Příjem',amount:30000,date:'2026-08-25',cadence:'monthly',active:true},
 {id:'rent',label:'Fixní výdaj',amount:-25000,date:'2026-08-26',cadence:'monthly',active:true}
]},debtBook:{items:[{id:'d1',person:'A',amount:10000,paid:2000,dueDate:'2026-09-01',status:'OPEN'}]}};
const cf=cashflow90(state,now);
assert(cf.days===90,'90-day horizon');
assert(cf.inflow===98000,'monthly income plus dated receivable');
assert(cf.outflow===75000,'monthly expense occurrences');
assert(cf.endBalance===123000,'ending balance');
assert(cf.receivables===1,'dated receivable included');
assert(cf.manualEntries===2,'manual entries counted');
assert(cf.personalObligations===0,'no personal obligations invented');
assert(cf.status==='OK','reserve remains safe');

const personal=cashflow90({financePlan:{cashNow:150000,reserveFloor:50000,currency:'CZK'},debtBook:{items:[]},personalAdmin:{items:[
 {id:'mortgage',title:'Hypotéka',category:'LOAN',amount:18000,currency:'CZK',cadence:'MONTHLY',nextDue:'2026-08-25',status:'ACTIVE'},
 {id:'insurance',title:'Pojištění domu',category:'INSURANCE',amount:12000,currency:'CZK',cadence:'YEARLY',nextDue:'2026-09-10',status:'ACTIVE'},
 {id:'eur',title:'Cloud EUR',category:'SUBSCRIPTION',amount:10,currency:'EUR',cadence:'MONTHLY',nextDue:'2026-08-22',status:'ACTIVE'},
 {id:'missing',title:'Neznámá platba',category:'PAYMENT',amount:null,currency:'CZK',cadence:'MONTHLY',nextDue:'2026-08-23',status:'ACTIVE'}
]}},now);
assert(personal.personalObligations===2,'eligible personal obligations counted');
assert(personal.personalIgnoredCurrency===1,'foreign currency ignored without FX');
assert(personal.personalMissingAmount===1,'missing amount surfaced');
assert(personal.outflow===66000,'three mortgage payments plus yearly insurance included');
assert(personal.endBalance===84000,'personal obligations reduce projected cash');
assert(personal.next.some(x=>x.source==='PERSONAL_ADMIN'&&x.label==='Hypotéka'),'personal obligation visible in timeline');

const overdue=cashflow90({financePlan:{cashNow:50000,reserveFloor:30000,currency:'CZK'},debtBook:{items:[]},personalAdmin:{items:[
 {id:'late',title:'Po termínu',category:'PAYMENT',amount:5000,currency:'CZK',cadence:'ONCE',nextDue:'2026-08-10',status:'ACTIVE'}
]}},now);
assert(overdue.next[0].overdue===true,'overdue obligation is conservatively counted today');
assert(overdue.endBalance===45000,'overdue obligation reduces cash immediately');

const sparse=cashflow90({financePlan:{cashNow:40000,reserveFloor:50000},debtBook:{items:[]}},now);
assert(sparse.events===0,'no invented flows');
assert(sparse.endBalance===40000,'no invented balance movement');
assert(sparse.status==='RISK','starting below reserve is risk');
console.log('cashflow 90 engine OK');
