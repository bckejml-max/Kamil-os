import {store} from './state.js';
import {h,money,modal} from './utils.js';
import {xtbTradePlanner} from './xtbPlanner24.js';
import {xtbBoard,ticketDecision,actionLabel} from './live24.js';
import {ticketSellCockpit} from './ticketCockpit24.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const active=x=>['HOLD','LISTED'].includes(U(x?.workflow||'HOLD'));
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,N(v)));
const daysTo=v=>{const t=Date.parse(v||'');if(!Number.isFinite(t))return null;const a=new Date();a.setHours(0,0,0,0);const b=new Date(t);b.setHours(0,0,0,0);return Math.round((b-a)/86400000)};
const dueOf=x=>first(x?.sellBy,x?.eventDate,x?.date,x?.due,x?.dueAt);
const feeRate=x=>{const f=N(first(x?.feeRate,.12));return f>=0&&f<1?f:.12};
const perTicketBuy=x=>{const qty=Math.max(1,N(first(x?.qty,x?.quantity,1))||1),buy=N(x?.buy);return buy&&qty>1?buy/qty:buy};
const marketPrice=(x,d)=>N(first(d?.recommendedListPricePerTicket,d?.marketPricePerTicket,x?.marketPrice,x?.listPrice));
const breakEven=(x)=>{const buy=perTicketBuy(x),fee=feeRate(x);return buy>0?Math.ceil(buy/(1-fee)):0};
const fmtDays=d=>d===null?'bez termínu':d<0?`${Math.abs(d)} d po termínu`:d===0?'dnes':`za ${d} d`;

function xtbRows(s){
 const board=xtbBoard(s),planner=xtbTradePlanner(s),planByTicker=new Map(planner.plans.map(x=>[U(x.ticker),x]));
 return board.map(({p,d})=>{
  const plan=planByTicker.get(U(p.ticker)),action=U(d.action||'HOLD'),priority=N(d.priority),confidence=d.confidence===null||d.confidence===undefined?null:clamp(d.confidence);
  let size='';
  if(plan?.qty)size=`${Number(plan.qty).toLocaleString('cs-CZ',{maximumFractionDigits:4})} ks`;
  else if(plan?.amount)size=`cca ${money(plan.amount)}`;
  const why=[d.reason,d.when,plan?.method].filter(Boolean).join(' · ');
  return{kind:'XTB',name:p.name||p.ticker,ticker:p.ticker,action,actionLabel:actionLabel(action),priority,confidence,size,why,fx:plan?.fx||'',destination:plan?.destination||null,source:d.source||'AUTO'};
 }).sort((a,b)=>b.priority-a.priority);
}

function ticketRows(s){
 return A(s.ticketBook?.items).filter(active).map(x=>{
  const d=ticketDecision(x,s),days=daysTo(dueOf(x)),market=marketPrice(x,d),be=breakEven(x),buy=perTicketBuy(x),roi=buy>0&&market>0?Math.round(((market*(1-feeRate(x))-buy)/buy)*1000)/10:null;
  const action=U(d.action||'HOLD'),priority=Math.max(N(d.priority),days!==null&&days<=3?95:0,market>0&&be>0&&market<be?92:0);
  const price=market||null,priceText=price?`${money(price)} / ks`:'';
  const why=[d.reason,d.when,days!==null?fmtDays(days):'',be?`break-even ${money(be)} / ks`:'',roi!==null?`ROI po poplatku ${roi}%`:'' ].filter(Boolean).join(' · ');
  return{kind:'Vstupenky',id:x.id,name:x.name||'Vstupenka',action,actionLabel:actionLabel(action),priority,confidence:d.confidence===null||d.confidence===undefined?null:clamp(d.confidence),size:`${Math.max(1,N(x.qty)||1)} ks`,price,priceText,breakEven:be,roi,days,why,source:d.source||'AUTO'};
 }).sort((a,b)=>b.priority-a.priority);
}

function recommendation(rows){
 const actionable=rows.filter(x=>!['HOLD','WAIT','REVIEW'].includes(x.action));
 const urgent=rows.filter(x=>x.priority>=85);
 if(urgent.length)return `Teď řešit ${urgent.length} urgentní ${urgent.length===1?'rozhodnutí':'rozhodnutí'}.`;
 if(actionable.length)return `Máš ${actionable.length} konkrétní ${actionable.length===1?'návrh':'návrhy'} k prověření.`;
 return 'Nevyrábět obchod jen proto, aby se něco dělo.';
}

export function marketDecision534(s=store.get()){
 const started=performance.now(),xtb=xtbRows(s),tickets=ticketRows(s),planner=xtbTradePlanner(s),cockpit=ticketSellCockpit(s),all=[...xtb,...tickets].sort((a,b)=>b.priority-a.priority),top=all.slice(0,5);
 const result={xtb,tickets,top,planner,cockpit,recommendation:recommendation(all),urgent:all.filter(x=>x.priority>=85).length,generatedAt:new Date().toISOString()};
 const ms=Math.round((performance.now()-started)*10)/10;
 window.__KAMIL_DECISION_534_LAST__={ms,at:Date.now(),urgent:result.urgent};
 return result;
}

const row=x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.name)}</b><span>${h(x.why||'Bez dalšího důvodu.')}</span>${x.fx?`<small>${h(x.fx)}</small>`:''}</div><div class="row-actions"><span class="decision-action ${x.priority>=90?'bad':x.priority>=80?'warn':x.action==='BUY'?'good':''}">${h(x.actionLabel||x.action)}</span>${x.size?`<span class="status">${h(x.size)}</span>`:''}${x.priceText?`<span class="status">${h(x.priceText)}</span>`:''}${x.confidence!==null?`<span class="intel-source">${Math.round(x.confidence)} %</span>`:''}</div></div>`;

export async function openMarketDecision534(){
 const x=marketDecision534(),body=`<div class="metric-strip"><div class="metric"><span>Urgentní rozhodnutí</span><b class="${x.urgent?'warn':'good'}">${x.urgent}</b></div><div class="metric"><span>XTB návrhy</span><b>${x.xtb.filter(v=>!['HOLD','WAIT'].includes(v.action)).length}</b></div><div class="metric"><span>Ticket návrhy</span><b>${x.tickets.filter(v=>!['HOLD','WAIT'].includes(v.action)).length}</b></div><div class="metric"><span>Ticket kapitál v riziku</span><b>${money(x.cockpit.capitalAtRisk)}</b></div></div><div class="card"><div class="eyebrow">CO UDĚLAT TEĎ</div><h2>${h(x.recommendation)}</h2>${x.top.map(row).join('')||'<div class="empty success-empty">Teď nemám žádný konkrétní návrh.</div>'}</div><div class="card"><div class="eyebrow">XTB · KONKRÉTNÍ KROKY</div>${x.xtb.map(row).join('')||'<div class="empty">XTB import neobsahuje pozice.</div>'}</div><div class="card"><div class="eyebrow">VSTUPENKY · KONKRÉTNÍ KROKY</div>${x.tickets.map(row).join('')||'<div class="empty">Žádné aktivní vstupenky.</div>'}</div><div class="decision-note">Decision Engine 53.4 pouze skládá existující XTB/ticket intelligence do konkrétního pořadí kroků. Nic neprodává, nenakupuje, nepřevádí peníze ani automaticky nepřecenňuje. Když chybí spolehlivá částka nebo FX, částku nevymýšlí.</div>`;
 const choice=await modal('XTB + vstupenky / Rozhodnutí 53.4',body,[{label:'Market Suite 55.4',value:'suite',primary:true},{label:'Otevřít XTB',value:'money'},{label:'Otevřít vstupenky',value:'tickets'},{label:'Zavřít',value:null}]);
 if(choice==='suite'){const m=await import('./marketSuite554.js');return m.openMarketSuite554()}
 if(choice)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:choice}));
}