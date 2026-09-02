import {store} from './state.js';
import {personalVault640} from './personalVault640.js';
import {personalActions640} from './personalActions640.js';
import {personalDaysTo650} from './personalDate650.js';
import {isPersonalScope527} from './personalScope527.js';

const DAY=86400000;
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','CANCELLED','CANCELED']);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const personal=isPersonalScope527;
const open=x=>!CLOSED.has(String(x?.status||x?.workflow||'').toUpperCase());
const dateOf=x=>x?.due||x?.dueAt||x?.deadline||x?.followUpAt||x?.nextAt||x?.date||x?.start||x?.when||null;
const daysTo=personalDaysTo650;
const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const fmtDate=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?new Date(t).toLocaleDateString('cs-CZ'):'—'};
const currentHour=()=>new Date().getHours();
const futurePersonal=s=>{
 const rows=[];
 for(const x of (s.calendar?.events||[]).filter(personal)){const d=daysTo(x.start||x.date||x.when);if(d!==null&&d>0&&d<=7)rows.push({...x,d,sourceKind:'calendar'});}
 for(const x of (s.tasks||[]).filter(open).filter(personal).filter(x=>!x.waitingFor)){const d=daysTo(dateOf(x));if(d!==null&&d>0&&d<=7)rows.push({...x,d,sourceKind:'task'});}
 for(const x of (s.personalAdmin?.items||[]).filter(open).filter(personal).filter(x=>!x.waitingFor)){if(String(x.id||'').startsWith('recovered-'))continue;const d=daysTo(dateOf(x));if(d!==null&&d>0&&d<=7)rows.push({...x,d,sourceKind:'admin'});}
 return rows.sort((a,b)=>a.d-b.d||String(a.title||a.name||a.summary||'').localeCompare(String(b.title||b.name||b.summary||''),'cs'));
};

export function personalActionCta650(a){
 if(!a)return 'Otevřít';
 if(a.kind==='waiting')return 'Udělám follow-up';
 if(a.kind==='calendar')return 'Připravit';
 if(a.kind==='task'||a.kind==='admin')return 'Vyřešit';
 if(a.kind==='data'){
  const t=norm(`${a.title} ${a.next}`);
  if(t.includes('hypot'))return 'Aktualizovat hypotéku';
  if(t.includes('bank'))return 'Doplnit bankovní data';
  if(t.includes('pojist'))return 'Ověřit pojištění';
  if(t.includes('elektr')||t.includes('eon'))return 'Zkontrolovat smlouvu';
  return 'Ověřit údaj';
 }
 return 'Otevřít';
}

export function personalDailyAssistant650(s=store.get()){
 const actions=personalActions640(s),hour=currentHour();
 const waiting=(s.delegations||[]).filter(open).filter(personal).map(x=>({...x,d:daysTo(dateOf(x))})).sort((a,b)=>(a.d??999)-(b.d??999));
 const upcoming=futurePersonal(s),tomorrow=upcoming.filter(x=>x.d===1),next7=upcoming;
 const top=actions.top3.map(x=>({...x,cta:personalActionCta650(x)}));
 const primary=top[0]||null,secondary=top.slice(1,3);
 const evening=hour>=18,morning=hour<11;
 const headline=primary?(evening?`Dnes ještě stojí za to vyřešit 1 důležitou věc.`:morning?`Začni jednou důležitou věcí.`:`Teď má největší smysl tohle.`):evening?(tomorrow.length?`Dnes je klid. Zítra máš ${tomorrow.length} ${tomorrow.length===1?'věc':'věci'}.`:'Dnes je hotovo.'):'Dnes nic osobního nehoří.';
 return{primary,secondary,top,waiting,tomorrow,next7,hour,headline,waitingCount:waiting.length,tomorrowCount:tomorrow.length,next7Count:next7.length,summary:primary?`${primary.title} · ${primary.cta}`:'Bez urgentní osobní akce'};
}

export function personalWaitingCenter650(s=store.get()){
 const rows=(s.delegations||[]).filter(open).filter(personal).map(x=>{const d=daysTo(dateOf(x));return{...x,days:d,when:d===null?'bez follow-up termínu':d<0?`${Math.abs(d)} d po follow-up`:d===0?'follow-up dnes':d===1?'follow-up zítra':`follow-up za ${d} d`}}).sort((a,b)=>(a.days??999)-(b.days??999));
 return{rows,overdue:rows.filter(x=>x.days!==null&&x.days<0),today:rows.filter(x=>x.days===0),soon:rows.filter(x=>x.days!==null&&x.days>0&&x.days<=7),count:rows.length};
}

export function personalHomeTimeline650(s=store.get()){
 const v=personalVault640(s),rows=[];
 for(const x of v.records.filter(x=>x.section==='home')){
  const at=x.noticeBy||x.validUntil||x.reviewAt||null;if(!at)continue;const d=daysTo(at);if(d===null||d<-30||d>365)continue;
  rows.push({id:`vault:${x.id}`,title:x.title,date:at,days:d,kind:'contract',next:x.nextAction||'Zkontrolovat údaj.'});
 }
 const maintRe=/servis|reviz|filtr|čerpad|cerpad|rekuper|klima|kom[ií]n|zahrad|oprava|údržb|udrzb|stk/i;
 for(const x of [...(s.tasks||[]),...(s.personalAdmin?.items||[])].filter(open).filter(personal).filter(x=>maintRe.test(`${x.title||''} ${x.name||''} ${x.category||''}`))){
  const at=dateOf(x),d=daysTo(at);if(d===null||d<-30||d>365)continue;rows.push({id:`task:${x.id}`,title:x.title||x.name||'Údržba',date:at,days:d,kind:'maintenance',next:'Vyřešit nebo posunout termín.'});
 }
 rows.sort((a,b)=>a.days-b.days);return rows;
}

export function personalMoneyPlan650(s=store.get()){
 const v=personalVault640(s),recent=(s.personalSpending?.transactions||[]).filter(x=>{const t=Date.parse(x.date||x.at||'');return Number.isFinite(t)&&t>=Date.now()-31*DAY});
 const spend=recent.reduce((a,x)=>{const n=Number(x.amount||0),k=norm(x.type||x.kind);return a+(k.includes('expense')||k.includes('out')||n<0?Math.abs(n):0)},0);
 const oneOff=(s.tasks||[]).filter(open).filter(personal).filter(x=>/zaplat|koup|objed|faktur|poplatek|oprava/i.test(`${x.title||''} ${x.category||''}`)).slice(0,5);
 return{fixedMonthly:v.monthlyKnown,insuranceAnnual:v.insuranceAnnual,recentSpend:spend,oneOff,knownMonthlyLabel:money(v.monthlyKnown),spendLabel:spend?money(spend):null};
}

export function personalSearch650(query,s=store.get()){
 const q=norm(query).trim();if(q.length<2)return[];const v=personalVault640(s),rows=[];
 const add=(type,id,title,meta,route)=>{const hay=norm(`${title} ${meta}`);if(hay.includes(q))rows.push({type,id,title,meta,route,score:hay.startsWith(q)?100:70})};
 v.records.forEach(x=>add('data',x.id,x.title,`${x.provider||''} ${x.sourceLabel||''} ${x.status?.label||''}`,(x.section==='home'?'home':x.section==='money'?'money':'documents')));
 (s.tasks||[]).filter(open).filter(personal).forEach(x=>add('task',x.id,x.title||x.name||'Úkol',`${x.category||''} ${fmtDate(dateOf(x))}`,'today'));
 (s.delegations||[]).filter(open).filter(personal).forEach(x=>add('waiting',x.id||x.title,x.title||x.name||'Čekám',fmtDate(dateOf(x)),'waiting'));
 (s.calendar?.events||[]).filter(personal).forEach(x=>add('calendar',x.id||x.title,x.title||x.summary||'Událost',fmtDate(x.start||x.date||x.when),'family'));
 return rows.sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'cs')).slice(0,8);
}

export function personalWeeklyReset650(s=store.get()){
 const d=personalDailyAssistant650(s),v=personalVault640(s),done=(s.audit||[]).filter(x=>{const t=Date.parse(x.at||x.createdAt||'');return Number.isFinite(t)&&t>=Date.now()-7*DAY&&personal(x)}).slice(-8).reverse();
 const stale=v.action.slice(0,5);return{done,next7:d.next7,waiting:d.waiting.slice(0,5),stale,summary:`${done.length} posledních změn · ${d.next7.length} věcí do 7 dní · ${d.waiting.length} čekání`};
}
