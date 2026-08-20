import {buildPersonalToday} from './js/personalToday26.js';
import {decisionExplain30} from './js/decisionExplain30.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const ref=new Date('2026-08-20T10:00:00+02:00');
const s={
 financePlan:{currency:'CZK',cashNow:200000,reserveFloor:50000,cashflow:[]},
 tasks:[
  {id:'over',title:'A po termínu',area:'Osobní',status:'UDĚLAT',due:'2026-08-19'},
  {id:'today',title:'B dnes',area:'Osobní',status:'UDĚLAT',due:'2026-08-20'},
  {id:'soon-a',title:'C brzy',area:'Osobní',status:'UDĚLAT',due:'2026-08-21'},
  {id:'soon-b',title:'D brzy',area:'Osobní',status:'UDĚLAT',due:'2026-08-21'},
  {id:'done',title:'Hotovo',area:'Osobní',status:'HOTOVO',due:'2026-08-19'},
  {id:'work',title:'Práce',area:'Práce',status:'UDĚLAT',due:'2026-08-19'}
 ],
 personalAdmin:{items:[]},familyHome:{members:[]},assetBook:{items:[]},emergencyFile:{contacts:[],assets:[]},ticketBook:{items:[{id:'sold',name:'Prodáno',workflow:'SOLD',date:'2026-08-20',buy:1000,sell:1500}],watchlist:[]},calendar:{events:[]},debtBook:{items:[]},xtbHub:{accounts:{}},xtbStrategy:{closedTickers:{}},audit:[]
};
const before=JSON.stringify(s),d=buildPersonalToday(s,ref);assert(JSON.stringify(s)===before,'30.3 must not mutate source state');assert(d.length<=5,'Top decisions max 5');assert(d.every((x,i)=>i===0||d[i-1].priority>=x.priority),'decisions sorted descending');assert(d.every(x=>Number.isFinite(x.priority)&&x.priority>=0&&x.priority<=100),'priority bounded 0-100');assert(!d.some(x=>x.title==='Hotovo'||x.title==='Práce'||x.title.includes('Prodáno')),'inactive/work/sold entities excluded');
const overdue=d.find(x=>x.title==='A po termínu');assert(overdue?.priority===96,'overdue personal task priority');assert(overdue.explain?.rule.includes('po termínu')&&overdue.explain.facts.some(x=>x.includes('1 dní po termínu')),'overdue explanation must match actual rule');
const today=d.find(x=>x.title==='B dnes');assert(today?.priority===90&&today.explain?.rule.includes('dnes'), 'today explanation');
const soon=d.filter(x=>['C brzy','D brzy'].includes(x.title));assert(soon.length===2&&soon.every(x=>x.priority===82&&x.explain?.rule.includes('1–7 dní')),'near task explanation');assert(soon[0].title==='C brzy'&&soon[1].title==='D brzy','deterministic tie ordering');
for(const x of d){const e=decisionExplain30(x);assert(e.score===x.priority,'explain score must equal decision score');assert(e.rule&&e.engine,'every decision has explain engine/rule');assert(Array.isArray(e.facts),'facts array');}
const fallback=decisionExplain30({priority:137,reason:'Skutečný důvod'});assert(fallback.score===100&&fallback.source===null&&fallback.confidence===null,'fallback clamp and no fake metadata');assert(fallback.facts[0]==='Skutečný důvod','fallback uses actual reason');assert(!fallback.rule.toLowerCase().includes('termín'),'fallback must not invent due-date reason');
const malformed=decisionExplain30({priority:'NaN'});assert(malformed.score===0&&!malformed.facts.length,'malformed score safe without invented facts');
const meta=decisionExplain30({priority:70,reason:'x',source:'ULOŽENÁ DATA',confidence:'HIGH'});assert(meta.source==='ULOŽENÁ DATA'&&meta.confidence==='HIGH','real source/confidence preserved');
console.log('DECISION EXPLAINABILITY 30.3 TEST PASS');
