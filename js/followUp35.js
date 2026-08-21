const DAY=86400000;
const n=v=>Number(v||0);
const upper=v=>String(v||'').trim().toUpperCase();
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs-CZ').replace(/[^a-z0-9]+/g,' ').trim();
const done=x=>['DONE','HOTOVO','CLOSED','ARCHIVED','RESOLVED'].includes(upper(x?.status||''))||x?.done===true||x?.completed===true;
const start=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d:null};
const ymd=d=>{const x=new Date(d);return Number.isFinite(x.getTime())?`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`:null};
const diffDays=(future,now=new Date())=>{const a=start(future),b=start(now);if(!a||!b)return null;a.setHours(12,0,0,0);b.setHours(12,0,0,0);return Math.round((a-b)/DAY)};
const addDays=(raw,days)=>{const d=start(raw)||new Date();d.setDate(d.getDate()+Number(days||0));return ymd(d)};
const titleOf=x=>x?.title||x?.subject||x?.name||'Čekám na odpověď';
const personOf=x=>x?.person||x?.assignee||x?.owner||x?.contact||'';
const createdOf=x=>x?.lastTouchAt||x?.lastFollowUpAt||x?.createdAt||x?.sentAt||x?.date||null;
const cadence=x=>Math.max(1,n(x?.followUpEveryDays)||3);
const dueOf=x=>x?.nextFollowUpAt||x?.followUpAt||x?.due||x?.dueAt||null;

function inboxReply(state,x){
 const inbox=Array.isArray(state.inbox)?state.inbox:[],thread=x.sourceThreadId||x.threadId||null,subject=norm(x.subject||x.title),person=norm(personOf(x)),since=start(createdOf(x));
 const candidates=inbox.filter(m=>!done(m)).filter(m=>{
  const when=start(m.receivedAt||m.createdAt||m.date||m.at);if(since&&when&&when<=since)return false;
  const incoming=m.direction?upper(m.direction)!=='OUTBOUND':true;if(!incoming)return false;
  if(thread&&String(m.threadId||m.sourceThreadId||'')===String(thread))return true;
  const hay=norm(`${m.subject||m.title||''} ${m.from||m.sender||''}`);
  if(subject&&subject.length>=5&&hay.includes(subject))return true;
  if(person&&person.length>=3&&hay.includes(person)&&subject&&subject.split(' ').some(t=>t.length>=5&&hay.includes(t)))return true;
  return false;
 });
 return candidates.sort((a,b)=>new Date(b.receivedAt||b.createdAt||b.date||0)-new Date(a.receivedAt||a.createdAt||a.date||0))[0]||null;
}

function draftFor(x){
 const informal=upper(x.tone)==='INFORMAL'||upper(x.tone)==='TYKANI',title=titleOf(x),person=personOf(x),hello=informal?(person?`Ahoj ${person},`:'Ahoj,'):(person?`Dobrý den${/\s/.test(person)?'':` ${person}`},`:'Dobrý den,'),ask=informal?'můžeš mi prosím dát vědět, jaký je aktuální stav a kdy to můžeme uzavřít?':'můžete mi prosím potvrdit aktuální stav a předpokládaný termín vyřešení?';
 return `${hello}\n\nnavazuji prosím na: ${title}. ${ask}\n\nDěkuji.`;
}

function normalizeSource(x,kind){
 const id=x.id||`${kind}:${norm(titleOf(x))}`;
 return {id,kind,title:titleOf(x),person:personOf(x),status:x.status||'OPEN',createdAt:x.createdAt||x.sentAt||null,lastTouchAt:x.lastTouchAt||x.lastFollowUpAt||null,lastFollowUpAt:x.lastFollowUpAt||null,followUpEveryDays:cadence(x),nextFollowUpAt:x.nextFollowUpAt||x.followUpAt||null,due:x.due||x.dueAt||null,tone:x.tone||'FORMAL',note:x.note||'',subject:x.subject||x.title||'',sourceThreadId:x.sourceThreadId||x.threadId||null,source:x};
}

export function waitingFor35(state={},now=new Date()){
 const manual=(state.directorBook?.waiting||[]).filter(x=>!done(x)).map(x=>normalizeSource(x,'MANUAL'));
 const delegated=(state.delegations||[]).filter(x=>!done(x)).map(x=>normalizeSource(x,'DELEGATION'));
 const rows=[...manual,...delegated].map(x=>{
  const reply=inboxReply(state,x),base=start(createdOf(x))||start(x.createdAt)||now,ageDays=Math.max(0,Math.floor((now-base)/DAY)),explicit=dueOf(x),next=explicit?ymd(explicit):addDays(base,x.followUpEveryDays),days=diffDays(next,now),hardDue=x.due?diffDays(x.due,now):null;
  let action='WAIT',priority=48,reason=`Další kontrola ${days===0?'dnes':days!==null&&days>0?`za ${days} d`:'bez termínu'}.`;
  if(reply){action='REPLY_DETECTED';priority=88;reason='V inboxu je novější pravděpodobná odpověď. Zkontroluj ji a čekání uzavři nebo aktualizuj.'}
  else if(hardDue!==null&&hardDue<0){action='FOLLOW_UP_NOW';priority=98;reason=`Termín je ${Math.abs(hardDue)} d po termínu a odpověď není evidovaná.`}
  else if(days!==null&&days<0){action='FOLLOW_UP_NOW';priority=Math.min(96,88+Math.abs(days)*2);reason=`Follow-up je ${Math.abs(days)} d po plánovaném termínu.`}
  else if(days===0){action='FOLLOW_UP_NOW';priority=90;reason='Follow-up je naplánovaný na dnešek.'}
  else if(days!==null&&days<=2){action='FOLLOW_UP_SOON';priority=78;reason=`Follow-up je za ${days} d.`}
  else if(ageDays>=7&&!explicit){action='FOLLOW_UP_NOW';priority=86;reason=`Čekání běží ${ageDays} dní bez uloženého follow-up termínu.`}
  return {...x,ageDays,nextFollowUpAt:next,days,hardDueDays:hardDue,replyDetected:!!reply,replyId:reply?.id||null,replyAt:reply?.receivedAt||reply?.createdAt||reply?.date||null,action,priority,reason,draft:draftFor(x)};
 }).sort((a,b)=>b.priority-a.priority||(a.days??999)-(b.days??999)||a.title.localeCompare(b.title,'cs-CZ'));
 const dueNow=rows.filter(x=>x.action==='FOLLOW_UP_NOW').length,replies=rows.filter(x=>x.action==='REPLY_DETECTED').length,soon=rows.filter(x=>x.action==='FOLLOW_UP_SOON').length;
 return {rows,dueNow,replies,soon,total:rows.length,top:rows[0]||null,note:'Waiting For hlídá ruční čekání a delegace. Pokud má položka thread/subject metadata, umí v interním inboxu rozpoznat pravděpodobnou novou odpověď. Follow-up nikdy neposílá automaticky.'};
}

export function ensureWaiting35(state={}){
 state.directorBook=state.directorBook||{completions:{},waiting:[]};state.directorBook.waiting=Array.isArray(state.directorBook.waiting)?state.directorBook.waiting:[];state.directorBook.completions=state.directorBook.completions||{};return state.directorBook.waiting;
}

export function nextFollowUpDate35(days=3,from=new Date()){return addDays(from,Math.max(1,n(days)||3))}
