import {waitingFor35,nextFollowUpDate35,ensureWaiting35} from './followUp35.js';

const DAY=86400000;
const upper=v=>String(v||'').trim().toUpperCase();
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs-CZ').replace(/[^a-z0-9@.]+/g,' ').trim();
const done=x=>['DONE','HOTOVO','CLOSED','ARCHIVED','RESOLVED','WAITING'].includes(upper(x?.status||''))||x?.done===true||x?.completed===true;
const ms=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d.getTime():0};
const ageDays=(v,now=new Date())=>Math.max(0,Math.floor((now.getTime()-ms(v))/DAY));
const workRx=/faktur|zakaz|dodavat|pks|cpi|zbrojov|projekt|stavb|objednav|rozpoc|nabid|technik|montaz|material|reditel|pobock|porad|klient|smlouv|zl\b/;
const incoming=m=>m?.direction?upper(m.direction)!=='OUTBOUND':true;
const titleOf=m=>m?.subject||m?.title||'E-mail bez předmětu';
const senderOf=m=>m?.from||m?.sender||m?.contact||'';
const whenOf=m=>m?.receivedAt||m?.createdAt||m?.date||m?.at||null;
const threadOf=m=>m?.threadId||m?.sourceThreadId||null;
const important=m=>m?.important===true||upper(m?.priority)==='HIGH'||upper(m?.importance)==='HIGH';
const unread=m=>m?.unread!==false&&m?.read!==true;
const workLike=m=>m?.scope==='work'||m?.domain==='work'||m?.work===true||workRx.test(norm(`${titleOf(m)} ${senderOf(m)} ${m?.snippet||''} ${m?.bodyPreview||''}`));

function isLinkedToWaiting(state,m){
 const id=String(m?.id||''),thread=threadOf(m),subject=norm(titleOf(m));
 const rows=[...(state.directorBook?.waiting||[]),...(state.delegations||[])].filter(x=>!['DONE','HOTOVO','CLOSED','ARCHIVED','RESOLVED'].includes(upper(x?.status||'')));
 return rows.some(x=>{
  if(id&&String(x.sourceInboxId||'')===id)return true;
  if(thread&&String(x.sourceThreadId||x.threadId||'')===String(thread))return true;
  const s=norm(x.subject||x.title||'');
  return subject.length>=8&&s.length>=8&&(subject===s||subject.includes(s)||s.includes(subject));
 });
}

function emailPriority(m,now=new Date()){
 const at=whenOf(m),age=at?ageDays(at,now):0;
 let p=workLike(m)?72:58;
 if(unread(m))p+=8;
 if(important(m))p+=16;
 if(age>=2)p+=5;
 if(age>=5)p+=6;
 return Math.min(98,p);
}

function candidateReason(m,now=new Date()){
 const at=whenOf(m),age=at?ageDays(at,now):0,parts=[];
 if(important(m))parts.push('označeno jako důležité');
 if(unread(m))parts.push('nepřečtené');
 if(workLike(m))parts.push('pracovní kontext');
 if(age>0)parts.push(`před ${age} d`);
 return parts.join(' · ')||'nová zpráva k vyřízení';
}

export function emailWorkflow35(state={},now=new Date()){
 const inbox=(state.inbox||[]).filter(m=>incoming(m)&&!done(m)),waiting=waitingFor35(state,now);
 const triage=inbox.filter(m=>(important(m)||workLike(m)||unread(m))&&!isLinkedToWaiting(state,m)).map(m=>({
  id:m.id||`mail:${norm(titleOf(m))}:${whenOf(m)||''}`,
  kind:'EMAIL',
  title:titleOf(m),
  person:senderOf(m),
  at:whenOf(m),
  threadId:threadOf(m),
  priority:emailPriority(m,now),
  reason:candidateReason(m,now),
  source:m
 })).sort((a,b)=>b.priority-a.priority||ms(b.at)-ms(a.at));
 const replies=waiting.rows.filter(x=>x.action==='REPLY_DETECTED');
 const followUps=waiting.rows.filter(x=>x.action==='FOLLOW_UP_NOW');
 const soon=waiting.rows.filter(x=>x.action==='FOLLOW_UP_SOON');
 const top=[...replies.map(x=>({type:'REPLY',priority:x.priority,title:`Přišla odpověď · ${x.title}`,reason:x.reason,id:x.id,row:x})),...followUps.map(x=>({type:'FOLLOW_UP',priority:x.priority,title:`Urgovat · ${x.title}`,reason:x.reason,id:x.id,row:x})),...triage.slice(0,8).map(x=>({type:'EMAIL',priority:x.priority,title:x.title,reason:x.reason,id:x.id,row:x}))].sort((a,b)=>b.priority-a.priority).slice(0,8);
 return {
  triage,replies,followUps,soon,waitingTotal:waiting.total,
  needsAction:triage.filter(x=>x.priority>=80).length,
  readyToClose:replies.length,
  followUpNow:followUps.length,
  top,
  note:'E-mail Control propojuje interní inbox s Waiting For. E-mail se převede do čekání jen po tvém kliknutí „Vyřízeno → čekám“, takže OS nepředstírá, že jsi už odpověděl.'
 };
}

export function markInboxResolved35(state,emailId,now=new Date()){
 const m=(state.inbox||[]).find(x=>String(x.id)===String(emailId));if(!m)return false;
 m.status='RESOLVED';m.resolvedAt=now.toISOString();m.unread=false;return true;
}

export function convertInboxToWaiting35(state,emailId,idFactory=()=>`waiting-${Date.now()}`,now=new Date(),days=3){
 const m=(state.inbox||[]).find(x=>String(x.id)===String(emailId));if(!m)return null;
 const rows=ensureWaiting35(state),existing=rows.find(x=>String(x.sourceInboxId||'')===String(emailId));if(existing)return existing;
 const x={id:idFactory('waiting'),title:titleOf(m),subject:titleOf(m),person:senderOf(m),sourceInboxId:m.id||null,sourceThreadId:threadOf(m),status:'OPEN',tone:'FORMAL',followUpEveryDays:Number(days||3),nextFollowUpAt:nextFollowUpDate35(days,now),createdAt:now.toISOString(),lastTouchAt:now.toISOString(),note:'Vytvořeno z interního e-mailu po označení „Vyřízeno → čekám“.'};
 rows.unshift(x);m.status='WAITING';m.handledAt=now.toISOString();m.unread=false;return x;
}

export function closeWaitingFromReply35(state,waitingId,now=new Date()){
 let x=(state.directorBook?.waiting||[]).find(y=>String(y.id)===String(waitingId));
 if(x){x.status='DONE';x.completedAt=now.toISOString();return true}
 x=(state.delegations||[]).find(y=>String(y.id)===String(waitingId));
 if(x){x.status='DONE';x.completedAt=now.toISOString();return true}
 return false;
}
