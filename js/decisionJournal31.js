const clean=(v,max=700)=>String(v??'').trim().slice(0,max);
const num=v=>v===null||v===undefined||v===''||!Number.isFinite(Number(v))?null:Number(v);
const keyOf=d=>`${clean(d?.domain,80)}|${clean(d?.id||d?.title,180)}`;
const isoOf=now=>{const d=new Date(now);return Number.isFinite(d.getTime())?d.toISOString():new Date().toISOString()};
const signature=x=>[x.key,x.action,x.priority,x.when,x.buyRule,x.sellRule,JSON.stringify(x.observed||{})].join('|');
const OBSERVED_KEYS=new Set(['pnlPct','weightPct','value','currency','status','minBalance','reserve','days','type','action','workflow','buyPer','list','market','floor','saleAt','date','maxBuyPrice','targetResale']);
const safeObserved=o=>{if(!o||typeof o!=='object'||Array.isArray(o))return{};const out={};for(const [k,v] of Object.entries(o)){if(!OBSERVED_KEYS.has(k))continue;if(typeof v==='number'&&Number.isFinite(v))out[k]=v;else if(typeof v==='string'||typeof v==='boolean')out[k]=clean(v,160);else if(v===null)out[k]=null}return out};

export function decisionJournalEntry(decision={},now=new Date(),changeType='SNAPSHOT'){
 const at=isoOf(now),key=keyOf(decision);if(key==='|')return null;
 return {id:`decision|${at}|${key}`.slice(0,280),at,key,domain:clean(decision.domain,80),entityId:clean(decision.id,180)||null,title:clean(decision.title,180)||'Rozhodnutí',kind:clean(decision.kind,100)||null,action:clean(decision.action,40)||null,priority:Math.max(0,Math.min(100,Number(decision.priority)||0)),reason:clean(decision.reason,500)||null,when:clean(decision.when,500)||null,buyRule:clean(decision.buyRule,700)||null,sellRule:clean(decision.sellRule,700)||null,source:clean(decision.source,100)||null,confidence:num(decision.confidence),observed:safeObserved(decision.observed),changeType:clean(changeType,40)||'SNAPSHOT'};
}

export function appendDecisionJournal(existing=[],decisions=[],now=new Date(),changeTypes={}){
 const out=(Array.isArray(existing)?existing:[]).filter(x=>x&&typeof x==='object').slice(0,250),latest=new Map();for(const x of out)if(x.key&&!latest.has(x.key))latest.set(x.key,x);
 let added=0;
 for(const d of Array.isArray(decisions)?decisions:[]){const key=keyOf(d),entry=decisionJournalEntry(d,now,changeTypes[key]||d?.journalChange||'SNAPSHOT');if(!entry)continue;const prev=latest.get(key);if(prev&&signature(prev)===signature(entry))continue;out.unshift(entry);latest.set(key,entry);added++}
 out.sort((a,b)=>new Date(b.at||0)-new Date(a.at||0));return {items:out.slice(0,250),added};
}

export function decisionJournalReview(state={},currentDecisions=[],now=new Date()){
 const rows=Array.isArray(state.decisionJournal?.items)?state.decisionJournal.items:[],current=new Map((Array.isArray(currentDecisions)?currentDecisions:[]).map(x=>[keyOf(x),x])),latest=new Map();for(const x of rows)if(x?.key&&!latest.has(x.key))latest.set(x.key,x);
 const items=[...latest.values()].map(x=>{const c=current.get(x.key),ageDays=Math.max(0,Math.floor((new Date(now)-new Date(x.at||0))/86400000)),actionChanged=!!c&&clean(c.action,40)!==clean(x.action,40),priorityDelta=c?Math.round((Number(c.priority)||0)-(Number(x.priority)||0)):null;let observedShift=null;
  if(c?.observed&&x.observed){const before=num(x.observed.pnlPct),after=num(c.observed.pnlPct);if(before!==null&&after!==null)observedShift={kind:'PNL_SHIFT',before,after,delta:after-before};else if(x.domain==='tickets'&&x.observed.workflow&&c.observed.workflow&&x.observed.workflow!==c.observed.workflow)observedShift={kind:'WORKFLOW',before:x.observed.workflow,after:c.observed.workflow}}
  return {...x,ageDays,current:c||null,currentAction:c?.action||null,currentPriority:c?.priority??null,actionChanged,priorityDelta,observedShift};
 }).sort((a,b)=>Number(b.actionChanged)-Number(a.actionChanged)||Math.abs(b.priorityDelta||0)-Math.abs(a.priorityDelta||0)||new Date(b.at)-new Date(a.at));
 const byDomain={};for(const x of rows)byDomain[x.domain]=(byDomain[x.domain]||0)+1;
 return {items,total:rows.length,tracked:latest.size,changed:items.filter(x=>x.actionChanged).length,byDomain,note:'Decision Journal ukládá pouze rozhodovací snapshot a tehdy pozorované hodnoty. Změna P/L nebo workflow není sama o sobě důkaz, že doporučení bylo správné nebo špatné; jde o auditní stopu, ne o zpětně dopočítanou investiční výkonnost.'};
}

export const decisionJournal31Note='Decision Journal je verzovaná auditní stopa doporučení. Neukládá raw dokumenty, hesla ani nové tržní údaje; zaznamená jen to, co Kamil OS skutečně věděl v okamžiku snapshotu.';
