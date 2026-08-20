import {LOCAL_KEY,META_KEY,QUEUE_KEY,SCHEMA_VERSION,MAX_UNDO} from './config.js';
import {clone,uid} from './utils.js';

const blank=()=>({
 meta:{schemaVersion:SCHEMA_VERSION,createdAt:new Date().toISOString(),lastMutationAt:null,lastCloudAt:null},
 tasks:[],projects:[],routines:[],routineDone:{},calendar:{events:[],asOf:null,source:null},
 financePlan:{cashNow:0,expectedIncome:0,reserveFloor:0,plannedInvestment:0},
 xtbReport:{czkValue:0,eurValue:0,czkProfit:0,eurProfit:0,asOf:null},
 xtbHub:{},xtbStrategy:{overrides:{}},tradeJournal:{trades:[]},
 ticketBook:{items:[],watchlist:[],history:[],review:[]},
 debtBook:{items:[],review:[]},
 personalAdmin:{items:[]},familyHome:{members:[]},personalSettings:{maskSensitive:true,notificationMode:'IMPORTANT'},emergencyFile:{contacts:[],assets:[]},
 personalInbox:{items:[]},assetBook:{items:[]},personalGoals:{items:[]},
 inbox:[],delegations:[],learning:{typeBias:{},feedback:[]},
 ui:{},audit:[],undo:[]
});

const compactUndo=a=>(Array.isArray(a)?a:[]).map(entry=>{
 const x=entry&&typeof entry==='object'?clone(entry):entry;
 if(x?.state&&typeof x.state==='object')x.state.undo=[];
 return x;
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
 s.xtbStrategy={overrides:{},...(s.xtbStrategy||{})};s.xtbStrategy.overrides=s.xtbStrategy.overrides&&typeof s.xtbStrategy.overrides==='object'?s.xtbStrategy.overrides:{};
 s.ticketBook=s.ticketBook||{items:[],watchlist:[],history:[],review:[]};s.ticketBook.items=Array.isArray(s.ticketBook.items)?s.ticketBook.items:[];s.ticketBook.watchlist=Array.isArray(s.ticketBook.watchlist)?s.ticketBook.watchlist:[];
 s.debtBook=s.debtBook||{items:[],review:[]};s.debtBook.items=Array.isArray(s.debtBook.items)?s.debtBook.items:[];
 s.personalAdmin={items:[],...(s.personalAdmin||{})};s.personalAdmin.items=Array.isArray(s.personalAdmin.items)?s.personalAdmin.items:[];
 s.familyHome={members:[],...(s.familyHome||{})};s.familyHome.members=Array.isArray(s.familyHome.members)?s.familyHome.members:[];
 s.personalSettings={maskSensitive:true,notificationMode:'IMPORTANT',...(s.personalSettings||{})};
 s.emergencyFile={contacts:[],assets:[],...(s.emergencyFile||{})};s.emergencyFile.contacts=Array.isArray(s.emergencyFile.contacts)?s.emergencyFile.contacts:[];s.emergencyFile.assets=Array.isArray(s.emergencyFile.assets)?s.emergencyFile.assets:[];
 s.personalInbox={items:[],...(s.personalInbox||{})};s.personalInbox.items=Array.isArray(s.personalInbox.items)?s.personalInbox.items:[];
 s.assetBook={items:[],...(s.assetBook||{})};s.assetBook.items=Array.isArray(s.assetBook.items)?s.assetBook.items:[];
 s.personalGoals={items:[],...(s.personalGoals||{})};s.personalGoals.items=Array.isArray(s.personalGoals.items)?s.personalGoals.items:[];
 s.inbox=Array.isArray(s.inbox)?s.inbox:[];
 s.delegations=Array.isArray(s.delegations)?s.delegations:[];
 s.learning=s.learning||{typeBias:{},feedback:[]};s.learning.typeBias=s.learning.typeBias||{};s.learning.feedback=Array.isArray(s.learning.feedback)?s.learning.feedback:[];
 s.audit=Array.isArray(s.audit)?s.audit:[];
 s.undo=compactUndo(s.undo);
 if(Array.isArray(s.inboxItems)&&!s.inbox.length)s.inbox=s.inboxItems;
 for(const t of s.tasks)if(!t.id)t.id=uid('task');
 for(const p of s.projects)if(!p.id)p.id=uid('project');
 for(const x of s.ticketBook.items)if(!x.id)x.id=uid('ticket');
 for(const x of s.ticketBook.watchlist)if(!x.id)x.id=uid('ticket-watch');
 for(const x of s.debtBook.items)if(!x.id)x.id=uid('debt');
 for(const x of s.personalAdmin.items)if(!x.id)x.id=uid('personal');
 for(const x of s.familyHome.members)if(!x.id)x.id=uid('family');
 for(const x of s.emergencyFile.contacts)if(!x.id)x.id=uid('emergency-contact');
 for(const x of s.emergencyFile.assets)if(!x.id)x.id=uid('emergency-asset');
 for(const x of s.personalInbox.items)if(!x.id)x.id=uid('personal-inbox');
 for(const x of s.assetBook.items)if(!x.id)x.id=uid('asset');
 for(const x of s.personalGoals.items)if(!x.id)x.id=uid('goal');
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
 if(input.personalAdmin!==undefined&&typeof input.personalAdmin!=='object')issues.push('personalAdmin má neplatný formát');
 if(input.personalAdmin?.items!==undefined&&!Array.isArray(input.personalAdmin.items))issues.push('personalAdmin.items nebylo pole');
 if(input.familyHome!==undefined&&typeof input.familyHome!=='object')issues.push('familyHome má neplatný formát');
 if(input.familyHome?.members!==undefined&&!Array.isArray(input.familyHome.members))issues.push('familyHome.members nebylo pole');
 if(input.emergencyFile!==undefined&&typeof input.emergencyFile!=='object')issues.push('emergencyFile má neplatný formát');
 if(input.emergencyFile?.contacts!==undefined&&!Array.isArray(input.emergencyFile.contacts))issues.push('emergencyFile.contacts nebylo pole');
 if(input.emergencyFile?.assets!==undefined&&!Array.isArray(input.emergencyFile.assets))issues.push('emergencyFile.assets nebylo pole');
 if(input.personalInbox!==undefined&&typeof input.personalInbox!=='object')issues.push('personalInbox má neplatný formát');
 if(input.personalInbox?.items!==undefined&&!Array.isArray(input.personalInbox.items))issues.push('personalInbox.items nebylo pole');
 if(input.assetBook!==undefined&&typeof input.assetBook!=='object')issues.push('assetBook má neplatný formát');
 if(input.assetBook?.items!==undefined&&!Array.isArray(input.assetBook.items))issues.push('assetBook.items nebylo pole');
 if(input.personalGoals!==undefined&&typeof input.personalGoals!=='object')issues.push('personalGoals má neplatný formát');
 if(input.personalGoals?.items!==undefined&&!Array.isArray(input.personalGoals.items))issues.push('personalGoals.items nebylo pole');
 const ids=new Set(),dupIds=[];
 const scan=(a,label)=>Array.isArray(a)&&a.forEach(x=>{if(x?.id){if(ids.has(x.id))dupIds.push(`${label}:${x.id}`);ids.add(x.id)}});
 scan(input.tasks,'task');scan(input.projects,'project');scan(input.ticketBook?.items,'ticket');scan(input.ticketBook?.watchlist,'ticket-watch');scan(input.debtBook?.items,'debt');scan(input.personalAdmin?.items,'personal');scan(input.familyHome?.members,'family');scan(input.emergencyFile?.contacts,'emergency-contact');scan(input.emergencyFile?.assets,'emergency-asset');scan(input.personalInbox?.items,'personal-inbox');scan(input.assetBook?.items,'asset');scan(input.personalGoals?.items,'goal');
 if(dupIds.length)issues.push(`Duplicitní ID: ${dupIds.slice(0,5).join(', ')}`);
 return {ok:!fatal.length,issues,fatal};
}
export function repairState(input){
 const report=validateState(input),fixed=migrate(input);
 const dedupe=a=>{const seen=new Set();return (Array.isArray(a)?a:[]).filter(x=>{if(!x?.id)return true;if(seen.has(x.id))return false;seen.add(x.id);return true})};
 fixed.tasks=dedupe(fixed.tasks);fixed.projects=dedupe(fixed.projects);
 fixed.ticketBook.items=dedupe(fixed.ticketBook.items);fixed.ticketBook.watchlist=dedupe(fixed.ticketBook.watchlist);fixed.debtBook.items=dedupe(fixed.debtBook.items);
 fixed.personalAdmin.items=dedupe(fixed.personalAdmin.items);fixed.familyHome.members=dedupe(fixed.familyHome.members);fixed.emergencyFile.contacts=dedupe(fixed.emergencyFile.contacts);fixed.emergencyFile.assets=dedupe(fixed.emergencyFile.assets);fixed.personalInbox.items=dedupe(fixed.personalInbox.items);fixed.assetBook.items=dedupe(fixed.assetBook.items);fixed.personalGoals.items=dedupe(fixed.personalGoals.items);
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
   const before=undo?clone(this.s):null;if(before)before.undo=[];fn(this.s);
   this.s.meta=this.s.meta||{};this.s.meta.schemaVersion=SCHEMA_VERSION;
   if(cloud)this.s.meta.lastMutationAt=new Date().toISOString();
   if(undo){this.s.undo=this.s.undo||[];this.s.undo.unshift({label,at:new Date().toISOString(),state:before});this.s.undo=this.s.undo.slice(0,MAX_UNDO)}
   if(audit){this.s.audit=this.s.audit||[];this.s.audit.unshift({id:uid('audit'),label,at:new Date().toISOString()});this.s.audit=this.s.audit.slice(0,100)}
   this.persist();
   if(cloud){this.dirty=true;this.queueSync(this.s)}
   this.emit(label);if(cloud&&this.cloudWriter)this.cloudWriter();
 }
 undo(){
   const x=this.s.undo?.shift();if(!x)return false;
   const rest=compactUndo(this.s.undo||[]);this.s=migrate(x.state);this.s.undo=rest;
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