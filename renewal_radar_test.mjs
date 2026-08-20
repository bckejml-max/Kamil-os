import {renewalRadar} from './js/renewalRadar26.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const now=new Date('2026-08-20T10:00:00+02:00');
const s={personalAdmin:{items:[
 {id:'sub1',title:'Streaming',category:'SUBSCRIPTION',provider:'MediaCo',amount:300,currency:'CZK',cadence:'MONTHLY',noticeDate:'2026-08-30',renewalDate:'2026-09-15',autoPay:true,status:'ACTIVE'},
 {id:'sub2',title:'Cloud',category:'SUBSCRIPTION',provider:'MediaCo',amount:100,currency:'CZK',cadence:'MONTHLY',status:'ACTIVE'},
 {id:'ins1',title:'Pojištění domu',category:'INSURANCE',provider:'Insurer',amount:12000,currency:'CZK',cadence:'YEARLY',noticeDate:'2026-08-19',renewalDate:'2026-09-20',status:'ACTIVE'},
 {id:'eur1',title:'EU software',category:'SUBSCRIPTION',provider:'EuroSoft',amount:10,currency:'EUR',cadence:'MONTHLY',renewalDate:'2026-10-01',status:'ACTIVE'},
 {id:'once',title:'Jednorázová platba',category:'FEE',provider:'Office',amount:1000,currency:'CZK',cadence:'ONCE',status:'ACTIVE'}
]}};
const r=renewalRadar(s,now);
const missed=r.rows.find(x=>x.id==='ins1'),auto=r.rows.find(x=>x.id==='sub1'),gap=r.rows.find(x=>x.id==='sub2');
assert(missed.state==='MISSED_NOTICE'&&missed.priority>=95,'missed notice must be urgent');
assert(auto.priority>=90&&auto.reasons.some(x=>/automatick/i.test(x)),'autopay near renewal must be surfaced');
assert(gap.state==='DATA_GAP'&&gap.missingWindow===true,'recurring subscription without window must request data');
assert(auto.providerCount===2&&gap.providerCount===2,'same provider obligations must be flagged for review, not assumed duplicate');
assert(!r.rows.some(x=>x.id==='once'),'one-time fee without renewal window must stay out');
assert(Math.round(r.reviewSpendByCurrency.CZK)===16800,'CZK review spend annualized from stored amounts');
assert(Math.round(r.reviewSpendByCurrency.EUR)===120,'EUR review spend kept separate');
assert(!('totalMixed' in r),'currencies must never be mixed');
assert(/není odhad úspory/i.test(r.note),'note must distinguish spend from savings');
assert(/nic automaticky neruší/i.test(r.note),'radar must never auto-cancel');
console.log('RENEWAL RADAR QA PASS');
