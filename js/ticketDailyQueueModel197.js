import {buildTicketCommander196} from './ticketCommanderModel196.js';

export const TICKET_DAILY_QUEUE_VERSION_197=197;
const n=v=>Number(v||0)||0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function ticketDailyActionScore197(row={}){
 const days=row?.guard?.days;
 const urgency=days==null?8:days<=1?35:days<=3?30:days<=7?22:days<=14?12:6;
 const priceAction=['RAISE TO','DROP TO','LIST AT'].includes(row?.guard?.action)?35:row?.guard?.action==='PAYOUT DATA NEEDED'?28:0;
 const marketAction=String(row?.marketAction||'');
 const marketNeed=marketAction.includes('CROSS')?20:marketAction.includes('CHECK')?16:0;
 const qty=Math.max(1,n(row?.qty)||1);
 const buyEach=n(row?.buyEach??row?.guard?.floors?.breakEven?.buyEach);
 const capital=n(row?.costTotal)||(buyEach*qty);
 const moneyWeight=clamp(Math.round(capital/1000)*3,0,18);
 const ask=n(row?.currentAsk),target=n(row?.targetAsk);
 const deltaPct=ask>0&&target>0?Math.abs(target/ask-1)*100:0;
 const deltaWeight=clamp(Math.round(deltaPct/3),0,16);
 const dataPenalty=row?.headline==='CHECK DATA'?8:0;
 return clamp(urgency+priceAction+marketNeed+moneyWeight+deltaWeight+dataPenalty,0,100);
}

export function buildTicketDailyQueue197(inventory=[],latest=new Map(),now=Date.now(),limit=5){
 const commander=buildTicketCommander196(inventory,latest,now);
 const queue=commander.rows.map(row=>{
  const score=ticketDailyActionScore197(row);
  let why='Průběžná kontrola aktivního ticketu.';
  if(row.headline==='CHECK DATA')why='Chybí data pro bezpečné cenové rozhodnutí.';
  else if(['RAISE TO','DROP TO','LIST AT'].includes(row.guard?.action))why='Konkrétní cenová akce má dnes přednost.';
  else if(String(row.marketAction||'').includes('CHECK')||String(row.marketAction||'').includes('CROSS'))why='Chybí nebo stojí za ověření další prodejní market.';
  else if(row.guard?.days!=null&&row.guard.days<=7)why='Akce se blíží; roste časové riziko.';
  return {...row,dailyScore:score,dailyWhy:why};
 }).sort((a,b)=>b.dailyScore-a.dailyScore||b.priority-a.priority);
 const visible=queue.slice(0,Math.max(1,Math.min(5,limit||5)));
 return {version:TICKET_DAILY_QUEUE_VERSION_197,commander,queue,visible,summary:{active:queue.length,shown:visible.length,urgent:queue.filter(x=>(x.guard?.days??999)<=3).length,priceActions:queue.filter(x=>['RAISE TO','DROP TO','LIST AT'].includes(x.guard?.action)).length,dataNeeded:queue.filter(x=>x.headline==='CHECK DATA').length}};
}
