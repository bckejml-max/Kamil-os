import assert from 'node:assert/strict';
import {insuranceCenter,insurancePolicy} from './js/insurance25.js';
const now=new Date('2026-08-20T12:00:00+02:00');
const s={personalAdmin:{items:[
 {id:'a',title:'Dům',category:'INSURANCE',amount:12000,currency:'CZK',cadence:'YEARLY',renewalDate:'2026-08-28',noticeDate:'2026-08-22',status:'ACTIVE',insurance:{kind:'PROPERTY',insured:'Dům',coverageAmount:8000000,deductible:5000}},
 {id:'b',title:'Cestovní',category:'INSURANCE',amount:120,currency:'EUR',cadence:'YEARLY',renewalDate:'2027-06-01',status:'ACTIVE',insurance:{kind:'TRAVEL',insured:'Rodina'}},
 {id:'c',title:'Stará',category:'INSURANCE',amount:5000,currency:'CZK',cadence:'YEARLY',status:'ARCHIVED',insurance:{kind:'OTHER',insured:'X'}}
]}};
const a=insuranceCenter(s,now);
assert.equal(a.total,2);
assert.equal(a.urgent,1,'notice within 14 days must be urgent');
assert.equal(a.costs.CZK.annual,12000);
assert.equal(a.costs.EUR.annual,120);
assert.equal(Object.keys(a.costs).length,2,'currencies must stay separated');
const p=insurancePolicy({id:'x',category:'INSURANCE',status:'ACTIVE',amount:null,cadence:'YEARLY',insurance:{}},now);
assert.ok(p.issues.includes('Chybí pojištěná osoba / majetek'));
assert.ok(p.issues.includes('Chybí výročí / expirace'));
assert.equal(p.status,'REVIEW');
console.log('insurance center OK');
