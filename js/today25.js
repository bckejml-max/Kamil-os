import {signals,projectStatus} from './intelligence.js';
import {xtbBoard,ticketDecision,actionLabel} from './live24.js';
import {dayDiff} from './utils.js';

const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
const activeTicket=x=>['HOLD','LISTED'].includes(x.workflow||'HOLD');
const domainOrder={work:0,project:1,money:2,tickets:3,waiting:4,inbox:5};

const item=(domain,title,priority,reason,target,extra={})=>({domain,title,priority:clamp(priority),reason,target,...extra});

export function buildTodayDecisions(s){
 const out=[];
 for(const x of signals(s)){
  const domain=x.type==='Projekt'?'project':x.type==='Vstupenky'?'tickets':x.type==='Dluh'?'money':x.type==='Čekám'?'waiting':'work';
  out.push(item(domain,x.title,x.score,x.reason,x.target||'work',{id:x.id,kind:x.type,impact:x.impact||'',source:'Kamil OS'}));
 }
 for(const {p,d} of xtbBoard(s)){
  if((d.priority||0)<58)continue;
  out.push(item('money',`${p.ticker} · ${actionLabel(d.action)}`,d.priority,d.reason,'money',{kind:'XTB',action:d.action,confidence:d.confidence,source:d.source||'PRAVIDLA'}));
 }
 for(const x of s.ticketBook?.items||[]){
  if(!activeTicket(x))continue;
  const d=ticketDecision(x,s);if((d.priority||0)<58)continue;
  out.push(item('tickets',`${x.name} · ${actionLabel(d.action)}`,d.priority,d.reason,'tickets',{id:x.id,kind:'Vstupenky',action:d.action,confidence:d.confidence,source:d.source||'PRAVIDLA'}));
 }
 for(const p of s.projects||[]){
  if(/hotov|archiv/i.test(p.status||''))continue;
  const st=projectStatus(p,s);if(st.score<58)continue;
  out.push(item('project',p.name||'Projekt',st.score,st.label,'work',{id:p.id,kind:'Projekt',source:'Projekt'}));
 }
 const inbox=(s.inbox||[]).filter(x=>x.status!=='DONE').length;
 if(inbox)out.push(item('inbox',`${inbox} položek v Inboxu`,Math.min(78,48+inbox*5),'Čekají na rozhodnutí nebo zařazení.','inbox',{kind:'Inbox',source:'Inbox'}));
 const calendarSoon=(s.calendar?.events||[]).map(e=>({e,start:e?.start?.dateTime||e?.start?.date||e?.start||e?.date||null})).filter(x=>x.start&&dayDiff(x.start)>=0&&dayDiff(x.start)<=1);
 if(calendarSoon.length>=3)out.push(item('work',`${calendarSoon.length} události během 48 h`,64,'Kalendář je krátkodobě zaplněný; zkontroluj přípravu a konflikty.','work',{kind:'Kalendář',source:'Kalendář'}));

 const seen=new Set();
 return out.sort((a,b)=>b.priority-a.priority||(domainOrder[a.domain]??9)-(domainOrder[b.domain]??9)).filter(x=>{
  const key=`${x.domain}|${x.id||x.title}`;if(seen.has(key))return false;seen.add(key);return true;
 }).slice(0,5).map((x,i)=>({...x,rank:i+1}));
}

export function todayDecisionStats(s,decisions=buildTodayDecisions(s)){
 const critical=decisions.filter(x=>x.priority>=85).length,high=decisions.filter(x=>x.priority>=70).length;
 return {count:decisions.length,critical,high,top:decisions[0]||null};
}
