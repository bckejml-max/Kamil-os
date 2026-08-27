import assert from 'node:assert/strict';
import {allocateTicketCapital203,TICKET_CAPITAL_ALLOCATOR_VERSION_203} from './js/ticketCapitalAllocatorModel203.js';

const riskDesk={
 capital:{total:20000,invested:4000},
 buy:[
  {id:'strong',name:'Strong event',score:90,upsidePct:100,riskBudget:{buyPrice:1000,maxQty:5,allowedBudget:5000,verdict:'BUY'}},
  {id:'medium',name:'Medium event',score:75,upsidePct:60,riskBudget:{buyPrice:1000,maxQty:4,allowedBudget:4000,verdict:'BUY'}},
  {id:'weak',name:'Weak event',score:69,upsidePct:45,riskBudget:{buyPrice:1000,maxQty:3,allowedBudget:3000,verdict:'BUY'}}
 ]
};
const plan=allocateTicketCapital203(riskDesk,{reservePct:10});
assert.equal(plan.version,TICKET_CAPITAL_ALLOCATOR_VERSION_203);
assert.equal(plan.reserve,2000);
assert.equal(plan.available,14000);
assert.ok(plan.allocated<=plan.available);
const strong=plan.rows.find(x=>x.id==='strong'),medium=plan.rows.find(x=>x.id==='medium'),weak=plan.rows.find(x=>x.id==='weak');
assert.ok(strong.allocation.capital>=medium.allocation.capital);
assert.ok(medium.allocation.capital>=weak.allocation.capital);
for(const row of plan.rows){assert.ok(row.allocation.qty<=row.allocation.maxQty);assert.ok(row.allocation.capital<=row.allocation.maxBudget)}
assert.equal(strong.allocation.qty,5);
assert.equal(medium.allocation.qty,4);
assert.equal(weak.allocation.qty,3);
assert.equal(plan.allocated,12000);
assert.equal(plan.remaining,2000);

const scarce=allocateTicketCapital203({...riskDesk,capital:{total:10000,invested:7000}},{reservePct:10});
assert.equal(scarce.available,2000);
assert.ok(scarce.allocated<=2000);
assert.ok(scarce.rows.reduce((s,r)=>s+r.allocation.qty,0)<=2);

const sharedGuard=(event,date)=>({limits:[
 {dimension:'event',key:event,remaining:4000,applies:true},
 {dimension:'group',key:'sparta',remaining:1500,applies:true},
 {dimension:'date',key:date,remaining:1500,applies:true},
 {dimension:'category',key:'football',remaining:9000,applies:true}
]});
const shared=allocateTicketCapital203({capital:{total:20000,invested:0},buy:[
 {id:'sparta-a',score:90,upsidePct:90,riskBudget:{buyPrice:625,maxQty:2,allowedBudget:1500,guard:sharedGuard('sparta-a','2026-09-12')}},
 {id:'sparta-b',score:85,upsidePct:80,riskBudget:{buyPrice:625,maxQty:2,allowedBudget:1500,guard:sharedGuard('sparta-b','2026-09-12')}}
]},{reservePct:10});
const sharedAllocated=shared.rows.reduce((s,r)=>s+r.allocation.capital,0);
assert.ok(sharedAllocated<=1500,'shared Sparta/date allocation must stay within aggregate remaining exposure');
assert.ok(shared.rows.reduce((s,r)=>s+r.allocation.qty,0)<=2,'two candidates must not each consume the same remaining exposure');
assert.equal(shared.exposureRemaining['group:sparta'],1500-sharedAllocated);
assert.equal(shared.exposureRemaining['date:2026-09-12'],1500-sharedAllocated);

const sharedDateOnly=allocateTicketCapital203({capital:{total:20000,invested:0},buy:[
 {id:'a',score:90,riskBudget:{buyPrice:700,maxQty:3,allowedBudget:2100,guard:{limits:[{dimension:'group',key:'a',remaining:5000,applies:true},{dimension:'date',key:'2026-10-01',remaining:1400,applies:true}]} }},
 {id:'b',score:80,riskBudget:{buyPrice:700,maxQty:3,allowedBudget:2100,guard:{limits:[{dimension:'group',key:'b',remaining:5000,applies:true},{dimension:'date',key:'2026-10-01',remaining:1400,applies:true}]} }}
]},{reservePct:0});
assert.ok(sharedDateOnly.allocated<=1400,'shared date cap must aggregate across different groups');
console.log('OS 203 TICKET CAPITAL ALLOCATOR PASS');
