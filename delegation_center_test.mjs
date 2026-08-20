import {delegationCenter} from './js/delegation25.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const now=new Date('2026-08-20T12:00:00Z');
const s={delegations:[
 {id:'late',title:'Dodavatel cena',person:'Dodavatel',status:'WAITING',followUpAt:'2026-08-17T09:00:00Z',createdAt:'2026-08-10T09:00:00Z'},
 {id:'today',title:'PKS potvrzení',person:'PKS',status:'WAITING',followUpAt:'2026-08-20T09:00:00Z',createdAt:'2026-08-18T09:00:00Z'},
 {id:'stale',title:'Bez termínu',person:'Technik',status:'WAITING',createdAt:'2026-08-01T09:00:00Z'},
 {id:'fresh',title:'Čerstvé čekání',person:'PM',status:'WAITING',followUpAt:'2026-08-25T09:00:00Z',createdAt:'2026-08-19T09:00:00Z'},
 {id:'contacted',title:'Kontakt dnes',person:'CPI',status:'WAITING',followUpAt:'2026-08-19T09:00:00Z',createdAt:'2026-08-12T09:00:00Z',lastContactAt:'2026-08-20T08:00:00Z'},
 {id:'done',title:'Vyřešené',person:'Firma',status:'DONE',followUpAt:'2026-08-01T09:00:00Z',createdAt:'2026-07-01T09:00:00Z'}
]};
const d=delegationCenter(s,now);
assert(d.total===5,'done delegation must be excluded');
assert(d.overdue===2,'two overdue active delegations expected');
assert(d.due===1,'one follow-up due today expected');
assert(d.stale===1,'one stale delegation without follow-up expected');
assert(d.rows[0].id==='late','oldest overdue item should lead priority queue');
assert(d.rows.find(x=>x.id==='late')?.action==='FOLLOW-UP','overdue item must recommend follow-up');
assert(d.rows.find(x=>x.id==='stale')?.action==='NAPLÁNOVAT','stale item without follow-up must ask for planning');
assert(d.rows.find(x=>x.id==='fresh')?.action==='ČEKAT','future follow-up must not be escalated');
assert(d.contactedToday===1,'today contact must be counted');
assert(d.rows.find(x=>x.id==='contacted').priority<d.rows.find(x=>x.id==='late').priority,'same-day contact should reduce repeated escalation priority');
assert(!d.rows.some(x=>x.id==='done'),'resolved item must never return to active queue');
console.log('DELEGATION CENTER QA PASS');
