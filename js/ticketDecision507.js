import {loadTicketCloud660} from './ticketCloud660.js';
import {buildTicketActionPriority209} from './ticketActionPriorityModel209.js';

const VERSION='507.0.0';
const ACTIVE=new Set(['LISTED','NOT_LISTED']);
let bound=false;
let timer=0;
let loading=null;
let cloud=null;
let plan=null;
let observer=null;

const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const status=r=>String(r?.market_status||r?.marketStatus||'').trim().toUpperCase();
const clamp=v=>Math.max(0,Math.min(100,Math.round(n(v))));

function eventCountdown(row){
  const raw=row?.event_date??row?.eventDate;
  if(!raw)return{days:null,label:'termín neznámý',tone:'unknown'};
  const event=Date.parse(raw);
  if(!Number.isFinite(event))return{days:null,label:'termín neznámý',tone:'unknown'};
  const now=new Date();
  const startToday=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
  const eventDate=new Date(event);
  const startEvent=new Date(eventDate.getFullYear(),eventDate.getMonth(),eventDate.getDate()).getTime();
  const days=Math.round((startEvent-startToday)/86400000);
  if(days<0)return{days,label:`${Math.abs(days)} d po eventu`,tone:'past'};
  if(days===0)return{days,label:'dnes',tone:'critical'};
  if(days===1)return{days,label:'zítra',tone:'critical'};
  if(days<=3)return{days,label:`za ${days} dny`,tone:'critical'};
  if(days<=7)return{days,label:`za ${days} dní`,tone:'urgent'};
  if(days<=21)return{days,label:`za ${days} dní`,tone:'near'};
  return{days,label:`za ${days} dní`,tone:'normal'};
}

function planMap(){
  return new Map((plan?.queue||plan?.commander?.rows||[]).map(r=>[String(r.id??''),r]));
}

function decisionFor(p){
  const risk=p?.riskAdjusted||{};
  if(risk.ok&&Number.isFinite(Number(risk.rankScore))){
    const score=clamp(risk.rankScore);
    return{score,modeled:true,rank:risk.rank||null,riskAdjustedProfit:Number.isFinite(Number(risk.riskAdjustedProfit))?Number(risk.riskAdjustedProfit):null,confidence:risk.confidence??null,liquidity:risk.liquidity??null,exposureSafety:risk.exposureSafety??null};
  }
  return{score:null,modeled:false,rank:null,riskAdjustedProfit:null,confidence:null,liquidity:null,exposureSafety:null};
}

function actionShort(p){
  const type=String(p?.nextMove?.type||'').trim();
  if(!type)return'SLEDOVAT';
  const map={
    'DO NOT LIST':'NEVYSTAVOVAT',
    'CHECK PAYOUT DATA':'DOPLNIT PAYOUT',
    'RAISE TO':'ZDRAŽIT',
    'DROP TO':'ZLEVNIT',
    'LIST AT':'VYSTAVIT',
    'VERIFY RULES':'OVĚŘIT PRAVIDLA',
    'REFRESH MARKET':'OBNOVIT TRH',
    'HOLD / MONITOR':'SLEDOVAT'
  };
  return map[type]||type;
}

function scoreTone(score){
  if(score===null)return'unknown';
  if(score>=80)return'elite';
  if(score>=65)return'strong';
  if(score>=50)return'mid';
  return'low';
}

function decorateRow(el,row,p){
  const countdown=eventCountdown(row);
  const decision=decisionFor(p);
  const action=actionShort(p);
  const dateCell=el.querySelector('[data-col="date"]');
  const dateSmall=dateCell?.querySelector('small');
  if(dateSmall){
    if(!dateSmall.dataset.os507Original)dateSmall.dataset.os507Original=dateSmall.textContent||'';
    dateSmall.textContent=countdown.label;
    dateSmall.className=`td507-countdown td507-${countdown.tone}`;
    dateSmall.title=dateSmall.dataset.os507Original&&dateSmall.dataset.os507Original!=='—'
      ?`Čas eventu: ${dateSmall.dataset.os507Original}`
      :'Odpočet do data eventu.';
  }

  const statusCell=el.querySelector('[data-col="status"]');
  if(statusCell){
    let line=statusCell.querySelector('[data-decision507]');
    if(!line){
      line=document.createElement('span');
      line.dataset.decision507='1';
      line.className='td507-decision';
      statusCell.appendChild(line);
    }
    const scoreLabel=decision.score===null?'D—':`D${decision.score}`;
    line.textContent=`${scoreLabel} · ${action}`;
    line.dataset.tone=scoreTone(decision.score);
    if(decision.modeled){
      const pieces=[`Decision ${decision.score}/100`];
      if(decision.confidence!==null)pieces.push(`confidence ${Math.round(decision.confidence)}`);
      if(decision.liquidity!==null)pieces.push(`likvidita ${Math.round(decision.liquidity)}`);
      if(decision.exposureSafety!==null)pieces.push(`exposure ${Math.round(decision.exposureSafety)}`);
      if(decision.riskAdjustedProfit!==null)pieces.push(`risk-adjusted profit ${Math.round(decision.riskAdjustedProfit).toLocaleString('cs-CZ')} Kč`);
      line.title=pieces.join(' · ');
    }else{
      line.title='Decision Score se nezobrazuje bez learned NET + confidence dat. Akce používá existující Commander guard.';
    }
  }

  el.dataset.decision507=scoreTone(decision.score);
  el.dataset.countdown507=countdown.tone;
  const key=[countdown.days,decision.score,p?.nextMove?.type,p?.nextMove?.price,p?.riskAdjusted?.rank].join('|');
  el.dataset.decision507Key=key;
  return{countdown,decision,action};
}

function paint(){
  if(!cloud?.ok)return false;
  const host=document.querySelector('#ticketIntelView .td331');
  if(!host)return false;
  const inventory=new Map((cloud.inventory||[]).map(r=>[String(r.id),r]));
  const priorities=planMap();
  let modeled=0,near=0,critical=0,active=0;
  for(const el of host.querySelectorAll('.td500-ticket-row[data-ticket-id]')){
    const row=inventory.get(String(el.dataset.ticketId));
    if(!row||!ACTIVE.has(status(row)))continue;
    active++;
    const p=priorities.get(String(row.id))||null;
    const c=eventCountdown(row),d=decisionFor(p);
    const key=[c.days,d.score,p?.nextMove?.type,p?.nextMove?.price,p?.riskAdjusted?.rank].join('|');
    if(el.dataset.decision507Key!==key)decorateRow(el,row,p);
    if(d.score!==null)modeled++;
    if(c.days!==null&&c.days>=0&&c.days<=21)near++;
    if(c.days!==null&&c.days>=0&&c.days<=7)critical++;
  }

  document.documentElement.dataset.ticketDecision507='1';
  window.__KAMIL_TICKET_DECISION507__={
    version:VERSION,healthy:true,active,modeled,near21:near,due7:critical,
    prioritySummary:plan?.summary||null,
    at:Date.now()
  };
  return true;
}

async function refresh(force=false){
  if(loading&&!force)return loading;
  loading=(async()=>{
    try{
      const next=await loadTicketCloud660();
      if(!next?.ok)return false;
      cloud=next;
      try{plan=buildTicketActionPriority209({inventory:next.inventory||[],latest:next.latest||new Map()});}
      catch(error){console.warn('[ticketDecision507/model]',error);plan=null;}
      return paint();
    }catch(error){
      console.warn('[ticketDecision507]',error);
      return false;
    }finally{loading=null}
  })();
  return loading;
}

function schedule(ms=90,{reload=false}={}){
  clearTimeout(timer);
  timer=setTimeout(()=>{timer=0;reload?refresh(true):paint()},ms);
}

export function installTicketDecision507(){
  refresh();
  if(bound)return;
  bound=true;
  for(const event of ['kamil:view-change','kamil:ticket-desk331-updated','kamil:ticket-economics506-updated'])
    window.addEventListener(event,()=>schedule(100));
  for(const event of ['kamil:ticket-refresh397-done','kamil:ticket-payout154-updated'])
    window.addEventListener(event,()=>schedule(80,{reload:true}));
  const root=document.querySelector('#ticketIntelView');
  if(root){
    observer=new MutationObserver(records=>{if(records.some(r=>r.type==='childList'))schedule(80)});
    observer.observe(root,{childList:true,subtree:true});
  }
  setInterval(()=>paint(),60000);
}
