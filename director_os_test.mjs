import {directorOS} from './js/director25.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const now=new Date('2026-08-20T12:00:00Z');
const s={
 tasks:[
  {id:'a',title:'Delegovaný skluz',status:'UDĚLAT',priority:'HIGH',owner:'Technik',due:'2026-08-18T09:00:00Z'},
  {id:'b',title:'Bez vlastníka',status:'UDĚLAT',priority:'HIGH',owner:'',due:'2026-08-21T09:00:00Z'},
  {id:'done',title:'Hotovo',status:'HOTOVO',priority:'HIGH',due:'2026-08-01T09:00:00Z'}
 ],
 projects:[
  {id:'p1',name:'Riziková zakázka',status:'Aktivní',risk:'HIGH',next:'',owner:'PM',deadline:'2026-08-25'},
  {id:'p2',name:'Blízký termín',status:'Aktivní',risk:'LOW',next:'Předat',owner:'PM',deadline:'2026-08-23'}
 ],
 delegations:[{id:'w1',title:'Potvrzení ceny',person:'Dodavatel',status:'WAITING',followUpAt:'2026-08-19T09:00:00Z'}]
};
const d=directorOS(s,now);
assert(d.items.length>0,'director queue exists');
const delegated=d.items.find(x=>x.id==='task:a');
assert(delegated?.action==='ESKALOVAT','delegated overdue must escalate, not be taken back');
const unowned=d.items.find(x=>x.id==='task:b');
assert(unowned?.action==='ROZHODNOUT','high priority unowned task needs ownership decision');
assert(d.items.some(x=>x.id==='project-risk:p1'&&x.priority>=95),'high-risk project must be critical');
assert(d.items.some(x=>x.id==='project-next:p1'),'project without next step must be flagged');
assert(d.items.some(x=>x.id==='wait:w1'&&x.action==='FOLLOW-UP'),'overdue waiting item must create follow-up');
assert(!d.items.some(x=>x.id==='task:done'),'completed task must never enter director queue');
assert(d.items.every((x,i,a)=>i===0||a[i-1].priority>=x.priority),'queue must be priority sorted');
console.log('DIRECTOR OS QA PASS');
