import {loadTicketCloud660} from './ticketCloud660.js';
import {buildTicketPayoutLearning192} from './ticketPayoutLearningModel192.js';

const VERSION='506.0.1';
const ACTIVE=new Set(['LISTED','NOT_LISTED']);
const SOLD=new Set(['SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAYOUT_RECEIVED','PAID']);
let bound=false;
let timer=0;
let loading=null;
let cloud=null;
let learning=null;
let observer=null;

const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const status=r=>String(r?.market_status||r?.marketStatus||'').trim().toUpperCase();
const qty=r=>Math.max(1,n(r?.qty)||1);
const money=v=>`${Math.round(Math.abs(n(v))).toLocaleString('cs-CZ')} Kč`;
const signed=v=>`${n(v)>=0?'+':'−'}${money(v)}`;

function saleMarket(row){
  const raw=[row?.sale_marketplace,row?.saleMarketplace,row?.resale_marketplace,row?.resaleMarketplace,row?.marketplace]
    .filter(Boolean).join(' ').toLowerCase();
  if(raw.includes('viagogo'))return'Viagogo';
  if(raw.includes('stubhub'))return'StubHub';
  if(raw.includes('ticketswap'))return'TicketSwap';
  return null;
}

function statsFor(row){
  if(!learning)return null;
  const market=saleMarket(row);
  const exact=market?learning.byMarket?.[market]:null;
  if(exact?.count>=1&&exact.ratio>0)return{...exact,source:`${market} payout historie`,market};
  if(learning.knownGlobal?.count>=2&&learning.knownGlobal.ratio>0)return{...learning.knownGlobal,source:'resale payout historie',market:null};
  if(learning.global?.count>=3&&learning.global.ratio>0)return{...learning.global,source:'celá payout historie',market:null};
  return null;
}

function latestFor(row){
  if(!cloud?.latest)return null;
  return cloud.latest.get(row.id)||cloud.latest.get(String(row.id))||null;
}

function targetEach(row){
  const snap=latestFor(row);
  return n(snap?.recommended_ask_czk)||n(row.ask_each_czk)||n(snap?.market_price_czk)||n(snap?.stubhub_price_czk)||0;
}

function economics(row){
  const q=qty(row),buy=n(row.buy_total_czk)||n(row.buy_each_czk)*q,sell=n(row.sell_total_czk)||n(row.sell_each_czk)*q;
  const payout=n(row.payout_received_czk),feeRaw=row.marketplace_fee_czk,fee=feeRaw===null||feeRaw===undefined?null:n(feeRaw);
  const stats=statsFor(row),ratio=stats?.ratio>0?stats.ratio:null;
  const beTotal=ratio&&buy>0?buy/ratio:null;
  const beEach=beTotal?beTotal/q:null;
  const minimumBeEach=buy>0?buy/q:null;
  const target=targetEach(row),projectedGross=target>0?target*q:0;
  const projectedNet=ratio&&projectedGross>0?projectedGross*ratio-buy:null;
  const actualNet=payout>0?payout-buy:null;
  const grossSold=sell>0?sell-buy:null;
  const st=status(row);
  return{q,buy,sell,payout,fee,stats,ratio,beTotal,beEach,minimumBeEach,target,projectedGross,projectedNet,actualNet,grossSold,st,active:ACTIVE.has(st),sold:SOLD.has(st)};
}

function confidenceLabel(stats){
  if(!stats)return'';
  const map={HIGH:'vysoká',MEDIUM:'střední',LOW:'nízká',VERY_LOW:'velmi nízká'};
  return `${stats.count} payoutů · jistota ${map[stats.confidence]||String(stats.confidence||'').toLowerCase()}`;
}

function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}

function decorateActive(el,row,e){
  const sellCell=el.querySelector('[data-col="sell"]');
  const profitCell=el.querySelector('[data-col="profit"]');
  const sellSmall=sellCell?.querySelector('small');
  const profitSmall=profitCell?.querySelector('small');
  const target=e.target||0;
  const be=e.beEach;

  if(sellSmall){
    const targetLabel=target?`cíl ${money(target)} / ks`:'bez cílové ceny';
    const beLabel=be?`BE ${money(Math.ceil(be))} / ks`:`BE min. ${money(Math.ceil(e.minimumBeEach))} / ks*`;
    setText(sellSmall,`${targetLabel} · ${beLabel}`);
    sellSmall.classList.add('td506-econ-line');
    sellSmall.title=be
      ?`Break-even z ${e.stats.source}. Historický payout ratio ${(e.ratio*100).toFixed(1)} %.`
      :'Minimální break-even je pouze nákupní cena. Marketplace fee neodhaduji bez dostatečné payout historie.';
  }

  if(profitSmall){
    if(e.projectedNet!==null){
      setText(profitSmall,`NET odhad ${signed(e.projectedNet)} · ${confidenceLabel(e.stats)}`);
      profitSmall.classList.toggle('td506-good',e.projectedNet>=0);
      profitSmall.classList.toggle('td506-bad',e.projectedNet<0);
      profitSmall.title=`Odhad čistého výsledku používá pouze historický payout poměr z reálných settlementů (${e.stats.source}).`;
    }else{
      setText(profitSmall,'hrubý potenciál · NET model zatím bez historie');
      profitSmall.classList.remove('td506-good','td506-bad');
      profitSmall.title='Kamil OS nebude odhadovat marketplace fee bez dostatečné historie skutečných payoutů.';
    }
    profitSmall.classList.add('td506-econ-line');
  }
}

function decorateSold(el,row,e){
  const sellCell=el.querySelector('[data-col="sell"]');
  const profitCell=el.querySelector('[data-col="profit"]');
  const sellSmall=sellCell?.querySelector('small');
  const profitMain=profitCell?.querySelector('b');
  const profitSmall=profitCell?.querySelector('small');

  if(sellSmall){
    const saleEach=e.sell>0?e.sell/e.q:n(row.sell_each_czk);
    const be=e.beEach;
    const base=saleEach?`prodej ${money(saleEach)} / ks`:'prodej bez ceny';
    const beLabel=be?`BE ${money(Math.ceil(be))} / ks`:`BE min. ${money(Math.ceil(e.minimumBeEach))} / ks*`;
    setText(sellSmall,`${base} · ${beLabel}`);
    sellSmall.classList.add('td506-econ-line');
    sellSmall.title=be?`Break-even z ${e.stats.source}.`:'Fee model nemá dost payout historie.';
  }

  if(e.actualNet!==null){
    setText(profitMain,signed(e.actualNet));
    if(profitMain){
      profitMain.classList.toggle('td506-good',e.actualNet>=0);
      profitMain.classList.toggle('td506-bad',e.actualNet<0);
      profitMain.title=e.grossSold===null?'':`Hrubý P/L před payoutem: ${signed(e.grossSold)}`;
    }
    const roi=e.buy>0?e.actualNet/e.buy*100:0;
    if(profitSmall){
      setText(profitSmall,`NET skutečný · ROI ${roi>=0?'+':''}${roi.toFixed(1)} %${e.fee!==null?` · fee ${money(e.fee)}`:''}`);
      profitSmall.classList.add('td506-econ-line',e.actualNet>=0?'td506-good':'td506-bad');
      profitSmall.title='Čistý P/L = skutečně přijatý payout − nákupní cena.';
    }
  }else if(profitSmall){
    setText(profitSmall,'hrubý P/L · NET čeká na skutečný payout');
    profitSmall.classList.add('td506-econ-line');
    profitSmall.classList.remove('td506-good','td506-bad');
    profitSmall.title='Dokud není payout skutečně přijatý, Kamil OS ho nevydává za čistý zisk.';
  }
}

function decorateRows(){
  if(!cloud?.ok)return false;
  const host=document.querySelector('#ticketIntelView .td331');
  if(!host)return false;
  const rows=new Map((cloud.inventory||[]).map(r=>[String(r.id),r]));
  let decorated=0;
  for(const el of host.querySelectorAll('.td500-ticket-row[data-ticket-id]')){
    const row=rows.get(String(el.dataset.ticketId));
    if(!row)continue;
    const e=economics(row);
    const key=[e.payout,e.sell,e.target,e.ratio,e.beEach,e.actualNet,e.projectedNet].map(x=>x===null?'n':Number.isFinite(Number(x))?Number(x).toFixed(2):String(x)).join('|');
    if(el.dataset.econ506Key===key)continue;
    el.dataset.econ506Key=key;
    if(e.active)decorateActive(el,row,e);
    else if(e.sold)decorateSold(el,row,e);
    decorated++;
  }
  return decorated;
}

function updateProfitKpi(){
  if(!cloud?.ok)return;
  const host=document.querySelector('#ticketIntelView .td331');
  const card=host?.querySelector(':scope > .td331-overview .td331-stat:nth-child(4)');
  if(!card)return;
  const sold=(cloud.inventory||[]).filter(r=>SOLD.has(status(r)));
  const settled=sold.filter(r=>n(r.payout_received_czk)>0);
  const actualNet=settled.reduce((sum,r)=>sum+n(r.payout_received_czk)-(n(r.buy_total_czk)||n(r.buy_each_czk)*qty(r)),0);
  const spans=[...card.querySelectorAll(':scope > span')];
  const label=spans.find(s=>!s.classList.contains('td500-kpi-icon')&&!s.classList.contains('ticket-kpi-compat500'))||spans[0];
  const value=card.querySelector(':scope > b');
  const small=card.querySelector(':scope > small');

  if(sold.length&&settled.length===sold.length){
    setText(label,'Čistý zisk');
    setText(value,signed(actualNet));
    setText(small,`${settled.length}/${sold.length} payoutů · skutečný NET`);
    card.dataset.econ506='actual';
  }else{
    setText(label,'Hrubý zisk');
    if(small){
      if(settled.length)setText(small,`čistý znám ${settled.length}/${sold.length} · ${signed(actualNet)}`);
      else setText(small,'čistý NET čeká na payouty');
    }
    card.dataset.econ506='partial';
  }
}

function addModelBadge(){
  const host=document.querySelector('#ticketIntelView .td331');
  const modes=host?.querySelector(':scope > .td331-modes');
  if(!modes||!learning)return;
  let badge=modes.querySelector('[data-econ506-badge]');
  if(!badge){
    badge=document.createElement('span');
    badge.dataset.econ506Badge='1';
    badge.className='td506-model-badge';
    const tools=modes.querySelector('.td500-view-tools');
    modes.insertBefore(badge,tools||null);
  }
  const stats=learning.knownGlobal?.count?learning.knownGlobal:learning.global;
  if(stats?.count&&stats.ratio){
    badge.textContent=`NET model · ${stats.count} payoutů · ${(stats.ratio*100).toFixed(1)} % payout`;
    badge.title='Poměr vychází pouze ze skutečně uzavřených payoutů. Nejde o pevně zadaný marketplace fee.';
    badge.dataset.ready='1';
  }else{
    badge.textContent='NET model · čeká na payout historii';
    badge.title='Až bude dost skutečných settlementů, OS dopočítá break-even po marketplace fee.';
    badge.dataset.ready='0';
  }
}

function paint(){
  if(!cloud?.ok)return false;
  decorateRows();
  updateProfitKpi();
  addModelBadge();
  document.documentElement.dataset.ticketEconomics506='1';
  const sold=(cloud.inventory||[]).filter(r=>SOLD.has(status(r)));
  const settled=sold.filter(r=>n(r.payout_received_czk)>0);
  window.__KAMIL_TICKET_ECONOMICS506__={version:VERSION,healthy:true,payoutSamples:learning?.totalSamples||0,knownMarketSamples:learning?.knownMarketSamples||0,sold:sold.length,settled:settled.length,actualNetCzk:settled.reduce((sum,r)=>sum+n(r.payout_received_czk)-(n(r.buy_total_czk)||n(r.buy_each_czk)*qty(r)),0),at:Date.now()};
  window.dispatchEvent(new CustomEvent('kamil:ticket-economics506-updated',{detail:window.__KAMIL_TICKET_ECONOMICS506__}));
  return true;
}

async function refresh(force=false){
  if(loading&&!force)return loading;
  loading=(async()=>{try{const next=await loadTicketCloud660();if(!next?.ok)return false;cloud=next;learning=buildTicketPayoutLearning192(next.inventory||[]);return paint()}catch(error){console.warn('[ticketEconomics506]',error);return false}finally{loading=null}})();
  return loading;
}
function schedule(ms=80,{reload=false}={}){clearTimeout(timer);timer=setTimeout(()=>{timer=0;reload?refresh(true):paint()},ms)}
export function installTicketEconomics506(){
  refresh();
  if(bound)return;
  bound=true;
  for(const event of ['kamil:view-change','kamil:ticket-desk331-updated','kamil:ticket-boot466-updated'])window.addEventListener(event,()=>schedule(100));
  for(const event of ['kamil:ticket-refresh397-done','kamil:ticket-payout154-updated'])window.addEventListener(event,()=>schedule(80,{reload:true}));
  const root=document.querySelector('#ticketIntelView');
  if(root){observer=new MutationObserver(records=>{if(records.some(r=>r.type==='childList'))schedule(70)});observer.observe(root,{childList:true,subtree:true})}
}
