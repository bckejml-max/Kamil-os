import {cashflow90} from './js/cashflow25.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const now=new Date('2026-08-20T12:00:00Z');
const state={financePlan:{cashNow:100000,reserveFloor:50000,cashflow:[
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
assert(cf.status==='OK','reserve remains safe');
const sparse=cashflow90({financePlan:{cashNow:40000,reserveFloor:50000},debtBook:{items:[]}},now);
assert(sparse.events===0,'no invented flows');
assert(sparse.endBalance===40000,'no invented balance movement');
assert(sparse.status==='RISK','starting below reserve is risk');
console.log('cashflow 90 engine OK');
