import {loadTicketCloud660} from './ticketCloud660.js';
import {buildTicketActionPriority209} from './ticketActionPriorityModel209.js';

const VERSION='510.0.0';
const ACTIVE=new Set(['LISTED','NOT_LISTED']);
const SOLD=new Set(['SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAYOUT_RECEIVED','PAID']);
let bound=false;
let timer=0;
let loading=null;
let observer=null;

const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const qty=r=>Math.max(1,n(r?.qty)||1);
const money=v=>`${Math.round(Math.abs(n(v))).toLocaleString('cs-CZ')} Kč`;
const signed=v=>`${n(v)>=0?'+':'−'}${money(v)}`;
const status=r=>String(r?.market_status||r?.marketStatus||'').trim().toUpperCase();

function daysTo(raw){
  const event=Date.parse(raw||'');if(!Number.isFinite(event))return null;
  const now=new Date(),a=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(),d=new Date(event),b=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
  return Math.round((b-a)/86400000);
}
function actionLabel(row){
  const type=String(row?.nextMove?.type||'').trim();
  const price=Math.round(n(row?.nextMove?.price));
  const map={'DO NOT LIST':'NEVYSTAVOVAT','CHECK PAYOUT DATA':'DOPLNIT PAYOUT','RAISE TO':'ZDRAŽIT','DROP TO':'ZLEVNIT','LIST AT':'VYSTAVIT','VERIFY RULES':'OVĚŘIT PRAVIDLA','REFRESH MARKET':'OBNOVIT TRH','HOLD / MONITOR':'SLEDOVAT'};
  const base=map[type]||type||'SLEDOVAT';
  return price&&['RAISE TO','DROP TO','LIST AT'].includes(type)?`${base} na ${money(price)}`:base;
}
function eventName(row){return String(row?.name||row?.event_name||row?.eventName||'pozice').replace(/\s+/g,' ').trim()}
function compute(cloud){
  const inventory=cloud.inventory||[],active=inventory.filter(r=>ACTIVE.has(status(r))),sold=inventory.filter(r=>SOLD.has(status(r))),settled=sold.filter(r=>n(r?.payout_received_czk)>0);
  const invested=active.reduce((s,r)=>s+(n(r?.buy_total_czk)||n(r?.buy_each_czk)*qty(r)),0);
  const actualNet=settled.reduce((s,r)=>s+n(r.payout_received_czk)-(n(r?.buy_total_czk)||n(r?.buy_each_czk)*qty(r)),0);
  const due7=active.filter(r=>{const d=daysTo(r?.event_date);return d!==null&&d>=0&&d<=7}).length;
  const due21=active.filter(r=>{const d=daysTo(r?.event_date);return d!==null&&d>=0&&d<=21}).length;
  let priority=null;
  try{priority=buildTicketActionPriority209({inventory,latest:cloud.latest||new Map()})}catch(error){console.warn('[ticketExecutive510/model]',error)}
  const queue=priority?.queue||[];
  const actionable=queue.filter(r=>String(r?.nextMove?.type||'')!=='HOLD / MONITOR');
  const primary=actionable[0]||queue[0]||null;
  return{inventory,active,sold,settled,invested,actualNet,due7,due21,priority,queue,actionable,primary};
}
function sentence(m){
  const parts=[];
  parts.push(`Portfolio má ${m.active.length} aktivních pozic a ${money(m.invested)} vloženého kapitálu.`);
  if(m.primary){
    const count=m.actionable.length;
    parts.push(`${count?`Dnes řeš ${count} ${count===1?'položku':count<5?'položky':'položek'}`:'Nejvyšší priorita'}: ${eventName(m.primary)} — ${actionLabel(m.primary)}.`);
  }else parts.push('Priority model zatím nemá bezpečný akční signál.');
  if(m.due7)parts.push(`${m.due7} ${m.due7===1?'event je':'eventy jsou'} do 7 dní.`);
  else if(m.due21)parts.push(`${m.due21} ${m.due21===1?'event je':'eventů je'} do 21 dní.`);
  if(m.sold.length){
    if(m.settled.length===m.sold.length)parts.push(`Skutečný NET všech ${m.sold.length} prodejů je ${signed(m.actualNet)}.`);
    else if(m.settled.length)parts.push(`Skutečný NET známe u ${m.settled.length}/${m.sold.length} prodejů: ${signed(m.actualNet)}.`);
    else parts.push(`U ${m.sold.length} prodejů zatím chybí skutečný payout pro čistý NET.`);
  }
  return parts.join(' ');
}
function render(m){
  const host=document.querySelector('#ticketIntelView .td331'),hero=host?.querySelector(':scope > .td331-hero');if(!hero)return false;
  let box=hero.querySelector(':scope > [data-executive510]');
  if(!box){box=document.createElement('section');box.dataset.executive510='1';box.className='td510-brief';hero.appendChild(box)}
  const primary=m.primary,primaryScore=primary?.riskAdjusted?.rankScore,actionCount=m.actionable.length;
  box.innerHTML=`<div class="td510-icon" aria-hidden="true">✦</div><div class="td510-copy"><small>EXECUTIVE BRIEFING</small><p>${sentence(m)}</p></div><div class="td510-chips"><span class="${actionCount?'warn':'ok'}">Dnes ${actionCount}</span><span class="${m.due7?'warn':''}">≤7 dní ${m.due7}</span><span>Payout ${m.settled.length}/${m.sold.length}</span>${Number.isFinite(Number(primaryScore))?`<span>D${Math.round(primaryScore)}</span>`:''}</div>`;
  if(primary)box.title=`Nejvyšší priorita: ${eventName(primary)} · ${actionLabel(primary)}`;
  document.documentElement.dataset.ticketExecutive510='1';
  window.__KAMIL_TICKET_EXECUTIVE510__={version:VERSION,healthy:true,text:sentence(m),active:m.active.length,invested:m.invested,actions:actionCount,due7:m.due7,sold:m.sold.length,settled:m.settled.length,actualNet:m.actualNet,primary:primary?{id:primary.id,name:eventName(primary),action:actionLabel(primary),decision:Number.isFinite(Number(primaryScore))?Math.round(primaryScore):null}:null,at:Date.now()};
  return true;
}
async function refresh(force=false){
  if(loading&&!force)return loading;
  loading=(async()=>{try{const cloud=await loadTicketCloud660();if(!cloud?.ok)return false;return render(compute(cloud))}catch(error){console.warn('[ticketExecutive510]',error);return false}finally{loading=null}})();
  return loading;
}
function schedule(ms=100,{reload=false}={}){clearTimeout(timer);timer=setTimeout(()=>{timer=0;reload?refresh(true):refresh()},ms)}
export function installTicketExecutive510(){
  refresh();setTimeout(()=>refresh(),600);if(bound)return;bound=true;
  for(const event of ['kamil:view-change','kamil:ticket-desk331-updated','kamil:ticket-economics506-updated','kamil:ticket-grouping508-updated'])window.addEventListener(event,()=>schedule(140));
  for(const event of ['kamil:ticket-refresh397-done','kamil:ticket-payout154-updated'])window.addEventListener(event,()=>schedule(80,{reload:true}));
  const root=document.querySelector('#ticketIntelView');if(root){observer=new MutationObserver(records=>{if(records.some(r=>r.type==='childList'&&(r.target===root||r.target?.matches?.('.td331'))))schedule(160)});observer.observe(root,{childList:true,subtree:true})}
}
