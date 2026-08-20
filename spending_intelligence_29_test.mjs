import {spendingIntelligence} from './js/spendingIntelligence29.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const ref=new Date('2026-08-20T10:00:00+02:00');
const s={personalSpending:{transactions:[
 {id:'j1',date:'2026-06-05',description:'Lidl',amount:-600,currency:'CZK',category:'JÍDLO'},
 {id:'j2',date:'2026-06-10',description:'Netflix',amount:-300,currency:'CZK',category:'PŘEDPLATNÉ'},
 {id:'j3',date:'2026-07-05',description:'Lidl',amount:-700,currency:'CZK',category:'JÍDLO'},
 {id:'j4',date:'2026-07-10',description:'Netflix',amount:-300,currency:'CZK',category:'PŘEDPLATNÉ'},
 {id:'j5',date:'2026-07-15',description:'Shell',amount:-500,currency:'CZK',category:'DOPRAVA'},
 {id:'j6',date:'2026-07-25',description:'Pozdní červenec',amount:-900,currency:'CZK',category:'OSTATNÍ'},
 {id:'a1',date:'2026-08-05',description:'Lidl',amount:-1100,currency:'CZK',category:'JÍDLO'},
 {id:'a2',date:'2026-08-10',description:'Netflix',amount:-305,currency:'CZK',category:'PŘEDPLATNÉ'},
 {id:'a3',date:'2026-08-15',description:'Neznámý obchod',amount:-400,currency:'CZK',category:'NEZAŘAZENO'},
 {id:'a4',date:'2026-08-16',description:'Převod na spoření',amount:-5000,currency:'CZK',category:'PŘEVOD'},
 {id:'a5',date:'2026-08-18',description:'Výplata',amount:30000,currency:'CZK',category:'PŘÍJEM'},
 {id:'e1',date:'2026-07-08',description:'EU cloud',amount:-10,currency:'EUR',category:'PŘEDPLATNÉ'},
 {id:'e2',date:'2026-08-08',description:'EU cloud',amount:-12,currency:'EUR',category:'PŘEDPLATNÉ'}
]}};
const r=spendingIntelligence(s,ref);assert(r.period.current==='2026-08'&&r.period.previous==='2026-07','month window');assert(r.currencies.includes('CZK')&&r.currencies.includes('EUR'),'currencies discovered separately');
const czk=r.byCurrency.CZK;assert(czk.spentMtd===1805,'transfers excluded from spending');assert(czk.incomeMtd===30000,'income separate');assert(czk.transferVolume===5000,'transfer volume visible');assert(czk.previousComparable===1500,'previous month compares same first 20 days');assert(czk.previousFull===2400,'full previous month retained separately');assert(Math.round(czk.delta)===305&&Math.round(czk.pct)===20,'MTD delta');assert(czk.monthlyAverage===1650,'completed-month average from June and July only');assert(czk.unknownAmount===400&&czk.unknownShare>20,'uncategorized coverage surfaced');assert(czk.recurring.some(x=>x.merchant==='Netflix'&&x.months===3),'recurring candidate from real repeated charges');assert(czk.categories.find(x=>x.category==='JÍDLO').current===1100,'category aggregation');
const eur=r.byCurrency.EUR;assert(eur.spentMtd===12&&eur.previousComparable===10,'EUR stays separate');assert(!('total' in r.byCurrency)&&!('totalMixed' in r),'no mixed-currency aggregate');assert(r.insights.some(x=>x.type==='SPEND_UP'&&x.currency==='CZK'),'spend increase insight');assert(r.insights.some(x=>x.type==='RECURRING'),'recurring insight');
console.log('SPENDING INTELLIGENCE 29.5 TEST PASS');