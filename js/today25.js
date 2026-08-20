import {signals,projectStatus} from './intelligence.js';
import {xtbBoard,ticketDecision,actionLabel} from './live24.js';
import {dayDiff,h} from './utils.js';

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
 return out.sort((a,b)=>b.priority-a.priority||(domainOrder[a.domain]??9)-(domainOrder[b.domain]??9)).filter(x=>{const key=`${x.domain}|${x.id||x.title}`;if(seen.has(key))return false;seen.add(key);return true}).slice(0,5).map((x,i)=>({...x,rank:i+1}));
}

const auditTarget=label=>/vstup|ticket/i.test(label||'')?'tickets':/xtb|invest|finance|pohled|dluh/i.test(label||'')?'money':/ček|deleg/i.test(label||'')?'waiting':/inbox/i.test(label||'')?'inbox':/projekt|úkol|task/i.test(label||'')?'work':null;
const timeLabel=at=>{if(!at)return'Aktuální';const ms=Date.now()-new Date(at).getTime();if(!Number.isFinite(ms)||ms<0)return'Právě teď';const min=Math.floor(ms/60000),hr=Math.floor(ms/3600000),day=Math.floor(ms/86400000);if(min<1)return'Právě teď';if(min<60)return`před ${min} min`;if(hr<24)return`před ${hr} h`;if(day<7)return`před ${day} d`;return new Date(at).toLocaleDateString('cs-CZ')};

export function buildDecisionFeed(s,decisions=buildTodayDecisions(s)){
 const feed=[];
 decisions.slice(0,3).forEach((x,i)=>feed.push({type:'current',title:x.title,reason:x.reason,target:x.target,domain:x.domain,kind:x.kind||x.domain,priority:x.priority,at:null,label:'AKTUÁLNÍ',decisionIndex:i}));
 const liveXtb=s.xtbStrategy?.live,xtbAt=s.xtbStrategy?.liveAsOf;
 if(xtbAt&&liveXtb?.positions){const actionable=Object.entries(liveXtb.positions).filter(([,v])=>(Number(v?.priority)||0)>=58);if(actionable.length)feed.push({type:'intel',title:'XTB intelligence aktualizována',reason:`${actionable.length} pozic s rozhodovací prioritou 58+`,target:'money',domain:'money',kind:'XTB',priority:Math.max(...actionable.map(([,v])=>Number(v.priority)||0)),at:xtbAt,label:'INTELLIGENCE'});}
 const ticketAt=s.ticketBook?.intelligenceAsOf,intel=s.ticketBook?.intelligence;
 if(ticketAt&&intel){const positions=Object.values(intel.positions||{}).filter(v=>(Number(v?.priority)||0)>=58).length,opps=Object.values(intel.opportunities||{}).filter(v=>(Number(v?.priority)||0)>=58).length;if(positions+opps)feed.push({type:'intel',title:'Ticket intelligence aktualizována',reason:`${positions} prodejních a ${opps} nákupních priorit`,target:'tickets',domain:'tickets',kind:'Vstupenky',priority:85,at:ticketAt,label:'INTELLIGENCE'});}
 for(const a of (s.audit||[]).slice(0,12)){if(!a?.label||!a?.at)continue;feed.push({type:'audit',title:a.label,reason:'Potvrzená změna v Kamil OS',target:auditTarget(a.label),domain:auditTarget(a.label)||'system',kind:'Historie',priority:30,at:a.at,label:'AKCE'});}
 const current=feed.filter(x=>x.type==='current');
 const history=feed.filter(x=>x.type!=='current').sort((a,b)=>new Date(b.at||0)-new Date(a.at||0));
 const seen=new Set();return [...current,...history].filter(x=>{const key=x.type==='current'?`current|${x.title}`:`${x.type}|${x.title}|${x.at}`;if(seen.has(key))return false;seen.add(key);return true}).slice(0,10).map((x,i)=>({...x,index:i,time:timeLabel(x.at)}));
}

function feedOpen(x){if(!x?.target)return;if(['work','money','tickets','today','more'].includes(x.target))window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:x.target}));else{window.dispatchEvent(new CustomEvent('kamil:more',{detail:x.target}));window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}))}}
function mountDecisionFeed(s,decisions){
 const anchor=document?.querySelector?.('#todayView .today-decision-card');if(!anchor)return;
 document.querySelector('#todayDecisionFeed25')?.remove?.();
 const feed=buildDecisionFeed(s,decisions),history=feed.filter(x=>x.type!=='current').length;
 const card=document.createElement('div');card.id='todayDecisionFeed25';card.className='card decision-feed-card';
 card.innerHTML=`<div class="card-head"><div><div class="eyebrow">DECISION FEED</div><h2>Co se změnilo a co platí teď</h2></div><span class="status">${history} změn</span></div><div class="decision-feed-list">${feed.map((x,i)=>`<div class="decision-feed-row ${x.type==='current'?'current':''}"><div class="decision-feed-dot ${x.domain||''}"></div><div class="decision-feed-main"><div><span class="decision-feed-label">${h(x.label)}</span><small>${h(x.time)}</small></div><b>${h(x.title)}</b><span>${h(x.reason||'')}</span></div>${x.target?`<button class="btn" data-feed-open="${i}">${x.type==='current'?'Řešit':'Otevřít'}</button>`:''}</div>`).join('')||'<div class="empty">Zatím není co zobrazit.</div>'}</div>`;
 anchor.insertAdjacentElement('afterend',card);card.querySelectorAll('[data-feed-open]').forEach(b=>b.onclick=()=>feedOpen(feed[Number(b.dataset.feedOpen)]));
}

export function todayDecisionStats(s,decisions=buildTodayDecisions(s)){
 const critical=decisions.filter(x=>x.priority>=85).length,high=decisions.filter(x=>x.priority>=70).length;
 if(typeof document!=='undefined'&&typeof queueMicrotask==='function')queueMicrotask(()=>mountDecisionFeed(s,decisions));
 return {count:decisions.length,critical,high,top:decisions[0]||null};
}
