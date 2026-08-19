import {LOCAL_KEY,META_KEY,QUEUE_KEY,SCHEMA_VERSION,MAX_UNDO} from './config.js';
import {clone,uid} from './utils.js';

const blank=()=>({
 meta:{schemaVersion:SCHEMA_VERSION,createdAt:new Date().toISOString(),lastMutationAt:null,lastCloudAt:null},
 tasks:[],projects:[],routines:[],routineDone:{},calendar:{events:[],asOf:null,source:null},
 financePlan:{cashNow:0,expectedIncome:0,reserveFloor:0,plannedInvestment:0},
 xtbReport:{czkValue:0,eurValue:0,czkProfit:0,eurProfit:0,asOf:null},
 xtbHub:{},tradeJournal:{trades:[]},
 ticketBook:{items:[],history:[],review:[]},
 debtBook:{items:[],review:[]},
 inbox:[],delegations:[],learning:{typeBias:{},feedback:[]},
 ui:{},audit:[],undo:[]
});

export function migrate(input){
 const s=input&&typeof input==='object'?clone(input):blank();
 s.meta=s.meta||{};
 const from=Number(s.meta.schemaVersion||0);
 s.tasks=Array.isArray(s.tasks)?s.tasks:[];
 s.projects=Array.isArray(s.projects)?s.projects:[];
 s.calendar=s.calendar||{events:[]};s.calendar.events=Array.isArray(s.calendar.events)?s.calendar.events:[];
 s.financePlan={cashNow:0,expectedIncome:0,reserveFloor:0,plannedInvestment:0,...(s.financePlan||{})};
 s.xtbReport={czkValue:0,eurValue:0,czkProfit:0,eurProfit:0,...(s.xtbReport||{})};
 s.ticketBook=s.ticketBook||{items:[],history:[],review:[]};s.ticketBook.items=Array.isArray(s.ticketBook.items)?s.ticketBook.items:[];
 s.debtBook=s.debtBook||{items:[],review:[]};s.debtBook.items=Array.isArray(s.debtBook.items)?s.debtBook.items:[];
 s.inbox=Array.isArray(s.inbox)?s.inbox:[];
 s.delegations=Array.isArray(s.delegations)?s.delegations:[];
 s.learning=s.learning||{typeBias:{},feedback:[]};s.learning.typeBias=s.learning.typeBias||{};s.learning.feedback=Array.isArray(s.learning.feedback)?s.learning.feedback:[];
 s.audit=Array.isArray(s.audit)?s.audit:[];
 s.undo=Array.isArray(s.undo)?s.undo:[];
 // Legacy inbox recovery.
 if(Array.isArray(s.inboxItems)&&!s.inbox.length)s.inbox=s.inboxItems;
 // Normalize essential IDs without deleting legacy fields.
 for(const t of s.tasks)if(!t.id)t.id=uid('task');
 for(const p of s.projects)if(!p.id)p.id=uid('project');
 for(const x of s.ticketBook.items)if(!x.id)x.id=uid('ticket');
 for(const x of s.debtBook.items)if(!x.id)x.id=uid('debt');
 s.meta.migratedFrom=from;s.meta.schemaVersion=SCHEMA_VERSION;
 return s;
}


export function validateState(input){
 const issues=[],fatal=[];
 if(!input||typeof input!=='object'){fatal.push('Stav není objekt');return {ok:false,issues,fatal}}
 const arrays=['tasks','projects','inbox','delegations','audit','undo'];
 for(const k of arrays)if(input[k]!==undefined&&!Array.isArray(input[k]))issues.push(`${k} nebylo pole`);
 if(input.ticketBook!==undefined&&typeof input.ticketBook!=='object')fatal.push('ticketBook má neplatný formát');
 if(input.debtBook!==undefined&&typeof input.debtBook!=='object')fatal.push('debtBook má neplatný formát');
 if(input.financePlan!==undefined&&typeof input.financePlan!=='object')issues.push('financePlan má neplatný formát');
 const ids=new Set(),dupIds=[];
 const scan=(a,label)=>Array.isArray(a)&&a.forEach(x=>{if(x?.id){if(ids.has(x.id))dupIds.push(`${label}:${x.id}`);ids.add(x.id)}});
 scan(input.tasks,'task');scan(input.projects,'project');scan(input.ticketBook?.items,'ticket');scan(input.debtBook?.items,'debt');
 if(dupIds.length)issues.push(`Duplicitní ID: ${dupIds.slice(0,5).join(', ')}`);
 return {ok:!fatal.length,issues,fatal};
}
export function repairState(input){
 const report=validateState(input),fixed=migrate(input);
 const dedupe=a=>{const seen=new Set();return (Array.isArray(a)?a:[]).filter(x=>{if(!x?.id)return true;if(seen.has(x.id))return false;seen.add(x.id);return true})};
 fixed.tasks=dedupe(fixed.tasks);fixed.projects=dedupe(fixed.projects);
 fixed.ticketBook.items=dedupe(fixed.ticketBook.items);fixed.debtBook.items=dedupe(fixed.debtBook.items);
 return {state:fixed,report};
}
class Store{
 constructor(){this.listeners=new Set();this.s=migrate(this.readLocal());this.dirty=!!localStorage.getItem(QUEUE_KEY);this.cloudWriter=null}
 readLocal(){try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'null')}catch{return null}}
 get(){return this.s}
 setCloudWriter(fn){this.cloudWriter=fn}
 subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 emit(reason){this.listeners.forEach(fn=>fn(this.s,reason))}
 persist(){localStorage.setItem(LOCAL_KEY,JSON.stringify(this.s))}
 replace(next,reason='replace'){this.s=migrate(next);this.persist();this.emit(reason)}
 mutate(label,fn,{undo=true,cloud=true,audit=true}={}){
   const before=undo?clone(this.s):null;fn(this.s);
   this.s.meta=this.s.meta||{};this.s.meta.schemaVersion=SCHEMA_VERSION;
   if(cloud)this.s.meta.lastMutationAt=new Date().toISOString();
   if(undo){this.s.undo=this.s.undo||[];this.s.undo.unshift({label,at:new Date().toISOString(),state:before});this.s.undo=this.s.undo.slice(0,MAX_UNDO)}
   if(audit){this.s.audit=this.s.audit||[];this.s.audit.unshift({id:uid('audit'),label,at:new Date().toISOString()});this.s.audit=this.s.audit.slice(0,100)}
   this.persist();
   if(cloud){
     this.dirty=true;
     this.queueSync(this.s);
   }
   this.emit(label);if(cloud&&this.cloudWriter)this.cloudWriter();
 }
 undo(){
   const x=this.s.undo?.shift();if(!x)return false;
   const rest=clone(this.s.undo||[]);this.s=migrate(x.state);this.s.undo=rest;
   this.s.meta.lastMutationAt=new Date().toISOString();
   this.s.audit.unshift({id:uid('audit'),label:`Vráceno: ${x.label}`,at:new Date().toISOString()});
   this.persist();this.dirty=true;this.queueSync(this.s);this.emit('undo');if(this.cloudWriter)this.cloudWriter();return true;
 }
 queueSync(payload){localStorage.setItem(QUEUE_KEY,JSON.stringify({at:new Date().toISOString(),payload}))}
 readQueue(){try{return JSON.parse(localStorage.getItem(QUEUE_KEY)||'null')}catch{return null}}
 clearQueue(){localStorage.removeItem(QUEUE_KEY)}
 meta(){try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')}catch{return {}}}
 setMeta(v){localStorage.setItem(META_KEY,JSON.stringify({...this.meta(),...v}))}
}
export const store=new Store();
