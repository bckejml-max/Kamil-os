import {store} from './state.js';

const isoInDays=days=>{const d=new Date();d.setDate(d.getDate()+Number(days||0));return d.toISOString()};
const tomorrowMorningIso=()=>{const d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);return d.toISOString()};
const splitId=id=>{const s=String(id||''),i=s.indexOf(':');return i<0?[s,'']:[s.slice(0,i),s.slice(i+1)]};
const setDue=(x,iso)=>{if('due' in x||(!('dueAt' in x)&&!('deadline' in x)&&!('followUpAt' in x)))x.due=iso;else if('dueAt' in x)x.dueAt=iso;else if('deadline' in x)x.deadline=iso;else x.followUpAt=iso};
const locate=(s,kind,id)=>kind==='task'?(s.tasks||[]).find(x=>String(x.id)===id):kind==='admin'?(s.personalAdmin?.items||[]).find(x=>String(x.id)===id):kind==='waiting'?(s.delegations||[]).find(x=>String(x.id||x.title)===id):null;

function postponeToIso(action,iso,label){
 if(!action?.id)return false;const [kind,id]=splitId(action.id);if(!['task','admin','waiting'].includes(kind))return false;
 let changed=false;store.mutate(`${label}: ${action.title||id}`,s=>{const x=locate(s,kind,id);if(!x)return;setDue(x,iso);if(kind==='waiting')x.followUpAt=iso;x.status=String(x.status||'OPEN').toUpperCase()==='DONE'?'OPEN':(x.status||'OPEN');x.updatedAt=new Date().toISOString();changed=true},{undo:true,cloud:true,audit:true});return changed;
}

export function postponePersonalAction642(action,days=3){return postponeToIso(action,isoInDays(days),`Posunut osobní termín o ${days} dní`)}
export function postponePersonalActionToTomorrow642(action){return postponeToIso(action,tomorrowMorningIso(),'Přesunuto na zítra ráno')}

export function markPersonalWaiting642(action,days=3){
 if(!action?.id)return false;const [kind,id]=splitId(action.id);if(!['task','admin'].includes(kind))return postponePersonalAction642(action,days);
 let changed=false;store.mutate(`Čekám na odpověď: ${action.title||id}`,s=>{const x=locate(s,kind,id);if(!x)return;const followUpAt=isoInDays(days);s.delegations=Array.isArray(s.delegations)?s.delegations:[];const wid=`followup|${kind}|${id}`;const existing=s.delegations.find(v=>v.id===wid);const payload={id:wid,title:x.title||x.name||action.title||id,area:x.area||null,category:x.category||null,status:'OPEN',followUpAt,sourceId:id,sourceKind:kind,createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};if(existing)Object.assign(existing,payload);else s.delegations.push(payload);x.waitingFor=true;x.followUpAt=followUpAt;x.updatedAt=new Date().toISOString();changed=true},{undo:true,cloud:true,audit:true});return changed;
}
