import {personalRiskCenter} from './personalRisk25.js';
import {personalTimeline} from './personalTimeline26.js';
import {cashflow90} from './cashflow25.js';
import {renewalRadar} from './renewalRadar26.js';
import {xtbBoard,ticketDecision,ticketOpportunityDecision,actionLabel} from './live24.js';

const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
const item=(domain,title,priority,reason,target,extra={})=>({domain,title,priority:clamp(priority),reason,target,...extra});
const modeForRisk=x=>x.domains?.includes('Pojištění')?'insurance':x.domains?.includes('Doklady')?'documents':x.domains?.includes('Platby')?'payments':x.domains?.includes('Domov')?'house':'risk';
const activeTicket=x=>['HOLD','LISTED'].includes(String(x?.workflow||'HOLD').toUpperCase());

export function buildPersonalToday(s={},now=new Date()){
 const out=[],risk=personalRiskCenter(s,now),timeline=personalTimeline(s,now),cf=cashflow90(s,now),renewals=renewalRadar(s,now);
 for(const x of risk.top||[]){
  if((x.priority||0)<60)continue;
  out.push(item('home',x.title,x.priority,(x.reasons||[]).join(' · ')||x.reason,'home',{kind:'Osobní riziko',homeMode:modeForRisk(x),source:'ULOŽENÁ DATA',id:x.key}));
 }
 if(cf.status==='RISK')out.push(item('money','Likvidita pod rezervou',100,cf.belowReserveDate?`Pod rezervní minimum podle uloženého cashflow od ${cf.belowReserveDate}.`:'Dnešní hotovost je pod rezervním minimem.','money',{kind:'Cashflow 90',source:'ULOŽENÝ PLÁN'}));
 else if(cf.status==='TIGHT')out.push(item('money','Likvidita je těsně nad rezervou',82,`Minimum 90denního výhledu je ${Math.round(cf.minBalance).toLocaleString('cs-CZ')} Kč.`, 'money',{kind:'Cashflow 90',source:'ULOŽENÝ PLÁN'}));
 for(const x of timeline.items.filter(x=>x.days<0||x.days<=7).slice(0,6)){
  if(x.domain==='Platby'||x.domain==='Smlouvy'||x.domain==='Doklady')continue;
  const p=x.days<0?96:x.days===0?90:x.type==='Úkol'?82:x.domain==='Rodina'?68:64;
  out.push(item(x.target==='tickets'?'tickets':'home',x.title,p,x.days<0?`${Math.abs(x.days)} dní po termínu`:`${x.type} za ${x.days} dní`,x.target||'home',{kind:x.domain,homeMode:x.homeMode,source:x.source||'ULOŽENÁ DATA',id:x.key}));
 }
 const renewal=renewals.rows.find(x=>x.priority>=75);
 if(renewal)out.push(item('home',renewal.title,renewal.priority,`${renewal.action}. ${renewal.reason}`,'home',{kind:'Renewal Radar',homeMode:renewal.homeMode,source:renewal.source,id:`admin:${renewal.id}`}));
 for(const {p,d} of xtbBoard(s)){
  if((d.priority||0)<60)continue;
  out.push(item('money',`${p.ticker} · ${actionLabel(d.action)}`,d.priority,d.reason,'money',{kind:'XTB',action:d.action,confidence:d.confidence,source:d.source||'PRAVIDLA',id:p.ticker}));
 }
 for(const x of s.ticketBook?.items||[]){
  if(!activeTicket(x))continue;const d=ticketDecision(x,s);if((d.priority||0)<60)continue;
  out.push(item('tickets',`${x.name} · ${actionLabel(d.action)}`,d.priority,d.reason,'tickets',{kind:'Vstupenky',action:d.action,confidence:d.confidence,source:d.source||'PRAVIDLA',id:x.id}));
 }
 for(const x of s.ticketBook?.watchlist||[]){
  const d=ticketOpportunityDecision(x,s);if((d.priority||0)<72)continue;
  out.push(item('tickets',`${x.name||'Ticket opportunity'} · ${actionLabel(d.action)}`,d.priority,d.reason,'tickets',{kind:'Ticket BUY',action:d.action,confidence:d.confidence,source:d.source||'PRAVIDLA',id:x.id}));
 }
 const seen=new Set();
 return out.sort((a,b)=>b.priority-a.priority||String(a.title).localeCompare(String(b.title),'cs')).filter(x=>{const k=`${x.domain}|${x.id||x.title}`;if(seen.has(k))return false;seen.add(k);return true}).slice(0,5).map((x,i)=>({...x,rank:i+1}));
}

export function personalBriefing(s={},now=new Date()){
 const decisions=buildPersonalToday(s,now),timeline=personalTimeline(s,now),risk=personalRiskCenter(s,now);
 return {decisions,top:decisions[0]||null,critical:decisions.filter(x=>x.priority>=90).length,high:decisions.filter(x=>x.priority>=75).length,today:timeline.items.filter(x=>x.days<=0).length,week:timeline.next7.length,riskScore:risk.score,riskTop:risk.top||[],timeline};
}
