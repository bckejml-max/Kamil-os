import {store} from './state.js';
import {personalVault640} from './personalVault640.js';

const DAY=86400000;
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','CANCELLED','CANCELED']);
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|projektov[aá] karta|pracovn|xtb|ticket|vstupenk/i;
const FAMILY_RE=/rodin|d[ií]t|dcera|manžel|manzel|mam|tat|babi|děd|ded/i;
const HOME_RE=/dom|dům|dum|vlasatic|servis|reviz|filtr|rekuper|klima|kom[ií]n|zahrad|energie|elektř/i;
const MONEY_RE=/hypot|bank|platb|pojist|pojiště|rozpočet|finance|pen[ií]z|spořen/i;
const text=x=>`${x?.title||''} ${x?.name||''} ${x?.subject||''} ${x?.category||''} ${x?.area||''} ${x?.project||''}`;
const personal=x=>!WORK_RE.test(text(x));
const open=x=>!CLOSED.has(String(x?.status||x?.workflow||'').toUpperCase());
const dueOf=x=>x?.due||x?.dueAt||x?.deadline||x?.followUpAt||x?.nextAt||x?.date||x?.start||null;
const daysTo=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/DAY):null};
const dueScore=d=>d===null?35:d<0?125+Math.min(12,Math.abs(d)):d===0?120:d===1?110:d<=3?98:d<=7?82:d<=14?60:35;
const whenLabel=d=>d===null?'bez termínu':d<0?`${Math.abs(d)} d po termínu`:d===0?'dnes':d===1?'zítra':`za ${d} d`;
const level=s=>s>=110?'critical':s>=90?'high':s>=70?'medium':'low';
const routeForVault=v=>v.section==='home'?'home':v.section==='money'?'money':'documents';
const minutesFor=v=>v.recordType==='bank-data'||v.recordType==='mortgage'?3:v.recordType==='insurance'?5:10;
const taskArea=x=>{const t=text(x);return FAMILY_RE.test(t)?'family':HOME_RE.test(t)?'home':MONEY_RE.test(t)?'money':'admin'};
const bias=(s,area)=>String(s.personalSettings?.priorityArea||'none')===area?5:0;
const belongsToday=d=>d===null||d<=0;

export function personalActions640(s=store.get()){
 const rows=[],vault=personalVault640(s);
 const push=x=>{const score=x.score+bias(s,x.area);rows.push({...x,score,level:level(score)})};
 for(const v of vault.action){
  const area=v.section==='home'?'home':v.section==='money'?'money':'admin',score=90+v.status.severity/4;
  push({id:`vault:${v.id}`,score,title:v.title,why:v.status.detail,next:v.nextAction,minutes:minutesFor(v),kind:'data',route:routeForVault(v),recordId:v.id,area});
 }
 for(const t of (s.tasks||[]).filter(open).filter(personal).filter(x=>!x.waitingFor)){
  const d=daysTo(dueOf(t));if(!belongsToday(d))continue;push({id:`task:${t.id}`,score:dueScore(d),title:t.title||t.name||'Osobní úkol',why:`Osobní úkol · ${whenLabel(d)}`,next:'Dokončit nebo posunout termín.',minutes:Number(t.estimateMinutes||15),kind:'task',route:'today',area:taskArea(t)});
 }
 for(const w of (s.delegations||[]).filter(open).filter(personal)){
  const d=daysTo(dueOf(w));if(!belongsToday(d))continue;push({id:`waiting:${w.id||w.title}`,score:Math.max(78,dueScore(d)-6),title:w.title||w.name||'Čekám na odpověď',why:`Čekáš na reakci · ${whenLabel(d)}`,next:'Udělej follow-up, pokud je termín splněný.',minutes:3,kind:'waiting',route:'waiting',area:taskArea(w)});
 }
 for(const a of (s.personalAdmin?.items||[]).filter(open).filter(personal).filter(x=>!x.waitingFor)){
  if(String(a.id||'').startsWith('recovered-'))continue;
  const d=daysTo(dueOf(a));if(!belongsToday(d))continue;push({id:`admin:${a.id}`,score:Math.max(55,dueScore(d)-4),title:a.title||a.name||'Osobní administrativa',why:`Administrativa · ${whenLabel(d)}`,next:'Vyřídit nebo doložit další krok.',minutes:5,kind:'admin',route:'today',area:taskArea(a)});
 }
 for(const e of (s.calendar?.events||[]).filter(personal)){
  const d=daysTo(e.start||e.date||e.when);if(d!==0)continue;
  push({id:`calendar:${e.id||e.title}`,score:112,title:e.title||e.summary||'Událost',why:'Kalendář · dnes',next:'Připravit se na událost.',minutes:5,kind:'calendar',route:'family',area:'family'});
 }
 const seen=new Set(),ordered=rows.sort((a,b)=>b.score-a.score).filter(x=>{const k=x.title.toLocaleLowerCase('cs-CZ');if(seen.has(k))return false;seen.add(k);return true});
 return{top3:ordered.slice(0,3),all:ordered,urgent:ordered.filter(x=>x.score>=90),soon:ordered.filter(x=>x.score>=70&&x.score<90),waiting:ordered.filter(x=>x.kind==='waiting'),summary:ordered.length?`Dnes má smysl řešit ${Math.min(3,ordered.length)} věci.`:'Dnes nic osobního nehoří.'};
}
