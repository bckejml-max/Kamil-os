const n=v=>Number(v||0),upper=v=>String(v||'').toUpperCase();
const done=x=>['DONE','HOTOVO','CLOSED','ARCHIVED'].includes(upper(x?.status||''))||x?.done===true||x?.completed===true;
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const workRx=/faktur|zakaz|dodavat|dochaz|cestak|pks|cpi|zbrojov|projekt|stavb|objednav|rozpoc|nabid|technik|montaz|material|reditel|pobock|porad|klient|smlouv|zl\b/;

export const DIRECTOR_DEADLINES_34=[
 {id:'concept-invoices',title:'Koncepty faktur vydaných · všichni',rule:'DAY',day:1,priority:94,owner:'Tým',note:'Zkontrolovat, že všichni vyplnili koncepty faktur vydaných.'},
 {id:'job-card',title:'Aktualizace karty zakázky',rule:'DAY',day:20,priority:86,owner:'Ty / tým',note:'Aktualizovat kartu zakázky.'},
 {id:'supplier-billing',title:'Fakturace na dodavatele',rule:'DAY',day:25,priority:92,owner:'Ty / tým',note:'Fakturace na dodavatele musí být odeslaná nejpozději do 25.'},
 {id:'month-close',title:'Cesták + docházka',rule:'LAST_DAY',priority:94,owner:'Ty',note:'Poslat cesták a vyplnit docházku poslední den v měsíci.'}
];

const ymd=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`};
const monthKey=d=>ymd(d).slice(0,7);
const atNoon=(y,m,d)=>new Date(y,m,d,12,0,0,0);
function lastDay(y,m){return new Date(y,m+1,0).getDate()}
function currentOccurrence(def,now=new Date()){const y=now.getFullYear(),m=now.getMonth(),day=def.rule==='LAST_DAY'?lastDay(y,m):Math.min(def.day,lastDay(y,m));return atNoon(y,m,day)}
function nextOccurrence(def,due){const y=due.getFullYear(),m=due.getMonth()+1,ny=m>11?y+1:y,nm=m>11?0:m,day=def.rule==='LAST_DAY'?lastDay(ny,nm):Math.min(def.day,lastDay(ny,nm));return atNoon(ny,nm,day)}
function diffDays(a,b=new Date()){const x=new Date(b);x.setHours(12,0,0,0);const y=new Date(a);y.setHours(12,0,0,0);return Math.round((y-x)/86400000)}
function dueOf(x){return x?.due||x?.dueAt||x?.deadline||x?.date||x?.at||null}
function titleOf(x){return x?.title||x?.name||x?.subject||x?.label||'Pracovní položka'}
function isWork(x){if(x?.scope==='work'||x?.domain==='work'||x?.work===true)return true;return workRx.test(norm(`${titleOf(x)} ${x?.project||''} ${x?.kind||''} ${x?.domain||''}`))}
function priorityFromDays(days,base=70){if(days===null)return base;if(days<0)return 100;if(days===0)return 97;if(days<=2)return Math.max(base,92);if(days<=7)return Math.max(base,82);if(days<=14)return Math.max(base,72);return base}

export function directorDeadlines34(state={},now=new Date()){
 const completions=state.directorBook?.completions||{},rows=[];
 for(const d of DIRECTOR_DEADLINES_34){
  let due=currentOccurrence(d,now),days=diffDays(due,now),key=`${d.id}|${monthKey(due)}`;
  if(completions[key]||days<-3){due=nextOccurrence(d,due);days=diffDays(due,now);key=`${d.id}|${monthKey(due)}`}
  rows.push({...d,due:ymd(due),month:monthKey(due),completionKey:key,done:!!completions[key],days,priority:priorityFromDays(days,d.priority)});
 }
 return rows.sort((a,b)=>a.days-b.days||b.priority-a.priority);
}

export function directorBriefing34(state={},now=new Date()){
 const deadlineRows=directorDeadlines34(state,now),tasks=(state.tasks||[]).filter(x=>!done(x)&&isWork(x)).map(x=>{const due=dueOf(x),days=due?diffDays(due,now):null;return {id:x.id||`task:${titleOf(x)}`,kind:'TASK',title:titleOf(x),detail:x.project||x.kind||'Pracovní úkol',due:due?ymd(due):null,days,priority:priorityFromDays(days,n(x.priority)||68),source:x}}),delegations=(state.delegations||[]).filter(x=>!done(x)).map(x=>{const due=dueOf(x),days=due?diffDays(due,now):null;return {id:x.id||`deleg:${titleOf(x)}`,kind:'WAITING',title:titleOf(x),detail:`Čekám na ${x.assignee||x.owner||x.person||'někoho'}`,due:due?ymd(due):null,days,priority:priorityFromDays(days,n(x.priority)||74),source:x}}),manual=(state.directorBook?.waiting||[]).filter(x=>!done(x)).map(x=>{const due=dueOf(x),days=due?diffDays(due,now):null;return {id:x.id,kind:'WAITING',title:titleOf(x),detail:`Čekám na ${x.person||'odpověď'}`,due:due?ymd(due):null,days,priority:priorityFromDays(days,n(x.priority)||76),source:x}}),calendar=(state.calendar?.events||[]).filter(x=>{const raw=x.start||x.at||x.date;if(!raw)return false;const d=diffDays(raw,now);return d>=0&&d<=7&&isWork(x)}).map(x=>{const raw=x.start||x.at||x.date,days=diffDays(raw,now);return {id:x.id||`cal:${titleOf(x)}:${raw}`,kind:'CALENDAR',title:titleOf(x),detail:'Pracovní kalendář',due:ymd(raw),days,priority:days===0?88:days<=2?76:64,source:x}}),deadlines=deadlineRows.map(x=>({id:`deadline:${x.id}`,kind:'DEADLINE',title:x.title,detail:x.note,due:x.due,days:x.days,priority:x.priority,source:x}));
 const all=[...deadlines,...tasks,...delegations,...manual,...calendar].sort((a,b)=>b.priority-a.priority||(a.days??999)-(b.days??999)||a.title.localeCompare(b.title,'cs-CZ')),seen=new Set(),top=all.filter(x=>{const k=`${x.kind}|${x.title}`;if(seen.has(k))return false;seen.add(k);return true}).slice(0,8);
 return {top,deadlines:deadlineRows,tasks,waiting:[...delegations,...manual].sort((a,b)=>b.priority-a.priority),calendar,critical:top.filter(x=>x.priority>=90).length,week:all.filter(x=>x.days!==null&&x.days<=7&&x.days>=-3).length,note:'Director Mode kombinuje měsíční ředitelské termíny, pracovní úkoly, čekání na ostatní a pracovní kalendář. Nedávno prošlý termín zůstane viditelný tři dny, dokud ho nepotvrdíš.'};
}

export function ensureDirectorBook34(state={}){state.directorBook=state.directorBook||{completions:{},waiting:[]};state.directorBook.completions=state.directorBook.completions||{};state.directorBook.waiting=Array.isArray(state.directorBook.waiting)?state.directorBook.waiting:[];return state.directorBook}
