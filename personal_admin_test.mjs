import assert from 'node:assert/strict';
import {personalAdmin,personalAdminItem,annualize} from './js/personalAdmin25.js';

const now=new Date('2026-08-20T10:00:00+02:00');
assert.equal(annualize(1000,'MONTHLY'),12000);
assert.equal(annualize(null,'MONTHLY'),null);

const overdue=personalAdminItem({id:'a',title:'Pojistka',category:'INSURANCE',amount:1200,currency:'CZK',cadence:'YEARLY',nextDue:'2026-08-19'},now);
assert.equal(overdue.status,'URGENT');
assert.ok(overdue.issues.some(x=>x.includes('po termínu')));

const a=personalAdmin({personalAdmin:{items:[
 {id:'1',title:'Hypotéka',category:'LOAN',amount:18000,currency:'CZK',cadence:'MONTHLY',nextDue:'2026-08-25',status:'ACTIVE'},
 {id:'2',title:'Cloud',category:'SUBSCRIPTION',amount:10,currency:'EUR',cadence:'MONTHLY',nextDue:'2026-09-05',status:'ACTIVE'},
 {id:'3',title:'Občanka',category:'DOCUMENT',amount:null,currency:'CZK',cadence:'ONCE',renewalDate:'2026-08-30',status:'ACTIVE'},
 {id:'4',title:'Stará služba',category:'PAYMENT',amount:999,currency:'CZK',cadence:'MONTHLY',status:'ARCHIVED'}
]}},now);
assert.equal(a.total,3);
assert.equal(a.costsByCurrency.CZK.monthly,18000);
assert.equal(a.costsByCurrency.EUR.monthly,10);
assert.ok(!('USD' in a.costsByCurrency));
assert.equal(a.due30,2);
assert.equal(a.insurance,0);
assert.ok(a.items.some(x=>x.title==='Občanka'&&x.status!=='OK'));
console.log('PERSONAL ADMIN OK');
