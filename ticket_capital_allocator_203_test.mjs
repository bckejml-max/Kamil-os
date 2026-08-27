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
for(const row of plan.rows){
 assert.ok(row.allocation.qty<=row.allocation.maxQty);
 assert.ok(row.allocation.capital<=row.allocation.maxBudget);
}
assert.equal(strong.allocation.qty,5);
assert.equal(medium.allocation.qty,4);
assert.equal(weak.allocation.qty,3);
assert.equal(plan.allocated,12000);
assert.equal(plan.remaining,2000);

const scarce=allocateTicketCapital203({...riskDesk,capital:{total:10000,invested:7000}},{reservePct:10});
assert.equal(scarce.available,2000);
assert.ok(scarce.allocated<=2000);
assert.ok(scarce.rows.reduce((s,r)=>s+r.allocation.qty,0)<=2);
console.log('OS 203 TICKET CAPITAL ALLOCATOR PASS');
