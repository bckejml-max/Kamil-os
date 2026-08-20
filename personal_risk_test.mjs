import assert from 'node:assert/strict';
import {personalRiskCenter} from './js/personalRisk25.js';

const now=new Date('2026-08-20T12:00:00');
const state={personalAdmin:{items:[
 {id:'bill1',title:'Elektřina',category:'UTILITY',amount:3000,currency:'CZK',cadence:'MONTHLY',nextDue:'2026-08-19',autoPay:false,status:'ACTIVE'},
 {id:'doc1',title:'Pas',category:'DOCUMENT',status:'ACTIVE',document:{kind:'PASSPORT',holder:'Kamil',expiryDate:'2026-08-25'}},
 {id:'home1',title:'Revize domu',category:'HOME',amount:1500,currency:'CZK',cadence:'YEARLY',nextDue:'2026-08-22',status:'ACTIVE'},
 {id:'ok1',title:'Internet',category:'UTILITY',amount:500,currency:'CZK',cadence:'MONTHLY',nextDue:'2026-10-20',autoPay:true,status:'ACTIVE'}
]}};
const a=personalRiskCenter(state,now);
assert.equal(a.items[0].key,'admin:bill1','overdue bill must be first');
assert.equal(a.critical,2,'overdue bill and near-expiry document are critical');
assert.equal(a.items.filter(x=>x.key==='admin:home1').length,1,'HOME item must be deduplicated across bills and home radar');
assert.ok(a.items.find(x=>x.key==='admin:home1').domains.length>=2,'deduplicated HOME item should preserve source domains');
assert.ok(!a.items.some(x=>x.key==='admin:ok1'),'low-risk future autopay must stay out of risk queue');
assert.ok(a.score>=0&&a.score<=100,'risk score must stay in 0..100');
console.log('personal risk center OK');
