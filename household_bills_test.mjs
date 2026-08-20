import assert from 'node:assert/strict';
import {householdBills,nextBillDue} from './js/householdBills25.js';

const now=new Date('2026-08-20T12:00:00');
const state={personalAdmin:{items:[
 {id:'a',title:'Elektřina',category:'UTILITY',amount:3000,currency:'CZK',cadence:'MONTHLY',nextDue:'2026-08-22',autoPay:false,status:'ACTIVE'},
 {id:'b',title:'Netflix',category:'SUBSCRIPTION',amount:15,currency:'EUR',cadence:'MONTHLY',nextDue:'2026-08-30',autoPay:true,status:'ACTIVE'},
 {id:'c',title:'Hypotéka',category:'LOAN',amount:18000,currency:'CZK',cadence:'MONTHLY',nextDue:'2026-08-19',autoPay:true,status:'ACTIVE'},
 {id:'d',title:'Pojistka',category:'INSURANCE',amount:5000,currency:'CZK',cadence:'YEARLY',nextDue:'2026-09-01',status:'ACTIVE'}
]}};
const a=householdBills(state,now);
assert.equal(a.total,3,'insurance must stay outside Household Bills');
assert.equal(a.overdue,1);
assert.equal(a.due7,1);
assert.equal(a.manualDue7,1);
assert.equal(a.costs.CZK.monthly,21000);
assert.equal(a.costs.EUR.monthly,15);
assert.equal(a.costs.USD,undefined,'currencies must never be converted or merged implicitly');
assert.equal(nextBillDue('2026-01-31','MONTHLY'),'2026-02-28','month-end must advance safely');
assert.equal(nextBillDue('2024-02-29','YEARLY'),'2025-02-28','leap date must advance safely');
assert.equal(nextBillDue('2026-08-20','ONCE'),null,'one-off payments have no invented next date');
console.log('HOUSEHOLD BILLS OK');
