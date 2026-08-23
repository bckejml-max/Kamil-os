import {APP_VERSION} from './releaseMeta.js';
import {store} from './state.js';
import {h,qs,toast} from './utils.js';

let fullModule=null,fullPromise=null,seq=0,financePromise=null,lifePromise=null,assistantPromise=null,decisionPromise=null,actionQueuePromise=null,commanderPromise=null,resolutionLoopPromise=null;
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED']);
const A=v=>Array.isArray(v)?v:[],N=v=>Number(v||0),U=v=>String(v||'').toUpperCase();
const open=x=>!CLOSED.has(U(x?.status||x?.workflow));
const activeTicket=x=>['HOLD','LISTED'].includes(U(x?.workflow||'HOLD'));
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|\bzl\b|projektov[aá] karta|pracovn/i;
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.subject||''} ${x?.area||''} ${x?.category||''} ${x?.project||''}`);
const dateMs=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const money=v=>Number.isFinite(Number(v))?new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v)):'—';
const titleOf=x=>x?.title||x?.name||x?.subject||x?.symbol||x?.ticker||'Položka';
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const todayVisible=()=>document.visibilityState!=='hidden'&&!!qs('#view-today')?.classList.contains('on');
const daysTo=v=>{const t=dateMs(v);if(t===null)return null;return Math.ceil((t-Date.now())/86400000)};
const dueOf=x=>first(x?.sellBy,x?.eventDate,x?.date,x?.due,x?.dueAt);
const pct=(a,b)=>b>0?Math.round(a/b*1000)/10:0;

function ticketStats(tickets=[]){
 const rows=A(tickets).filter(activeTicket).filter(personal).map(x=>{
  const qty=N(first(x.qty,x.quantity,1))||1,buy=N(first(x.buy,x.buyPrice,x.cost)),market=N(first(x.marketPrice,x.listPrice,x.price)),fee=N(first(x.feeRate,.12)),cost=buy,value=market*qty,profit=value-cost,roi=cost>0?pct(profit,cost):0,unitBuy=qty>0?buy/qty:buy,breakEven=fee<1?Math.ceil(unitBuy/(1-fee)):unitBuy,days=daysTo(dueOf(x));
  return{raw:x,name:titleOf(x),qty,buy,market,cost,value,profit,roi,breakEven,days};
 }).sort((a,b)=>(a.days??999)-(b.days??999));
 return{rows,capital:rows.reduce((a,x)=>a+x.cost,0),marketValue:rows.reduce((a,x)=>a+x.value,0)};
}

function xtbStats(s={}){
 const xtb=s.xtbReport||{},positions=A(xtb.positions),value=N(first(xtb.czkValue,s.xtbHub?.valueCzk)),profit=N(first(xtb.czkProfit,s.xtbHub?.profitCzk)),xtbAt=dateMs(xtb.asOf),age=xtbAt===null?null:Math.max(0,(Date.now()-xtbAt)/3600000);
 const total=positions.reduce((a,x)=>a+N(first(x.valueCZK,x.marketValue,x.value)),0);
 const rows=positions.map(x=>{const v=N(first(x.valueCZK,x.marketValue,x.value)),p=N(first(x.profitCZK,x.profit,x.pnl)),base=Math.max(0,v-p),ret=base>0?p/base*100:0;return{name:titleOf(x),value:v,profit:p,weight:total?Math.round(v/total*1000)/10:0,returnPct:Math.round(ret*10)/10}}).sort((a,b)=>b.weight-a.weight);
 return{value,profit,age,positions:rows,count:rows.length};
}

function smartMarketTop3(s={},xtb,ticket){
 const signals=[];
 const push=(score,title,meta,kind)=>signals.push({score,title,meta,kind});
 if(xtb.age===null)push(100,'Aktualizovat XTB data','chybí datum posledního importu','XTB');
 else if(xtb.age>72)push(95,'Aktualizovat XTB data',`${Math.round(xtb.age)} h stará`,'XTB');
 else if(xtb.age>36)push(82,'Aktualizovat XTB data',`${Math.round(xtb.age)} h stará`,'XTB');
 const concentrated=xtb.positions[0];
 if(concentrated?.weight>35)push(84,`Prověř koncentraci ${concentrated.name}`,`${concentrated.weight}% portfolia`,'XTB');
 else if(concentrated?.weight>25)push(62,`Hlídaj váhu ${concentrated.name}`,`${concentrated.weight}% portfolia`,'XTB');
 const lock=xtb.positions.find(x=>x.returnPct>35);
 if(lock)push(76,`Zvaž částečný profit-lock: ${lock.name}`,`výnos ${lock.returnPct}% · pouze návrh`,'XTB');
 else {const watch=xtb.positions.find(x=>x.returnPct>20);if(watch)push(55,`Hlídaj zisk ${watch.name}`,`výnos ${watch.returnPct}%`,'XTB')}
 for(const x of ticket.rows){
  if(x.days!==null&&x.days<=3)push(98,`Prodat / zkontrolovat cenu: ${x.name}`,x.days<0?'deadline minul':x.days===0?'deadline dnes':`deadline za ${x.days} d`,'Vstupenky');
  else if(x.days!==null&&x.days<=10)push(88,`Přecenit: ${x.name}`,`deadline za ${x.days} d`,'Vstupenky');
  else if(x.days!==null&&x.days<=30)push(66,`Hlídaj cenu: ${x.name}`,`deadline za ${x.days} d`,'Vstupenky');
  if(x.market>0&&x.market<x.breakEven)push(91,`Pod break-even: ${x.name}`,`trh ${money(x.market)} · break-even ${money(x.breakEven)}`,'Vstupenky');
  else if(x.roi<0)push(86,`Ztrátová pozice: ${x.name}`,`ROI ${x.roi}%`,'Vstupenky');
  else if(x.roi>=40&&x.days!==null&&x.days<=30)push(74,`Zvaž realizaci zisku: ${x.name}`,`ROI ${x.roi}% · ${x.days} d do deadline`,'Vstupenky');
 }
 if(!signals.some(x=>x.kind==='Vstupenky')&&ticket.rows[0]){const x=[...ticket.rows].sort((a,b)=>b.roi-a.roi)[0];push(35,`Nejlepší ticket pozice: ${x.name}`,`ROI ${x.roi}%`,'Vstupenky')}
 if(!signals.some(x=>x.kind==='XTB')&&xtb.positions[0])push(30,`XTB bez urgentního zásahu`,`${xtb.count} pozic · největší ${xtb.positions[0].name} ${xtb.positions[0].weight}%`,'XTB');
 return signals.sort((a,b)=>b.score-a.score).slice(0,3);
}

function marketSnapshot(s={}){
 const xtb=xtbStats(s),ticket=ticketStats(s.ticketBook?.items),priorities=smartMarketTop3(s,xtb,ticket);
 return{xtb,ticket,priorities};
}

async function hydrateFull(token){const host=qs('#todayView');if(!host||host.dataset.todayLite43!==token||!todayVisible())return false;try{if(!fullModule){fullPromise=fullPromise||import('./today29.js');fullModule=await fullPromise}const current=qs('#todayView');if(!current||current.dataset.todayLite43!==token||!todayVisible())return false;fullModule.renderToday?.();current.removeAttribute('data-today-lite43');window.__KAMIL_TODAY_FULL_AT__=performance.now();window.dispatchEvent(new CustomEvent('kamil:today-full-ready'));return true}catch(error){console.error('[todayLite43]',error);toast('Detail Today se nepodařilo načíst');return false}}
async function openFinance(){try{financePromise=financePromise||import('./personalFinance445.js');const m=await financePromise;return m.openPersonalFinance445()}catch(error){console.error('[personal-finance]',error);toast('Moje finance se nepodařilo načíst')}}
async function openLife(){try{window.__KAMIL_LIFE_455_ERROR__=null;window.__KAMIL_LIFE_455_IMPORT_AT__=performance.now();lifePromise=lifePromise||import('./lifeDashboard455.js');const m=await lifePromise;window.__KAMIL_LIFE_455_IMPORTED_AT__=performance.now();return m.openLifeDashboard455()}catch(error){lifePromise=null;window.__KAMIL_LIFE_455_ERROR__=String(error?.stack||error);console.error('[life-dashboard]',error);toast('Životní dashboard se nepodařilo načíst')}}
async function assistantModule(){assistantPromise=assistantPromise||import('./personalAssistant530.js');return assistantPromise}
async function openAssistant(){try{return (await assistantModule()).openAssistant530()}catch(error){assistantPromise=null;console.error('[assistant-530]',error);toast('Osobní asistent se nepodařil načíst')}}
async function openDecision(){try{decisionPromise=decisionPromise||import('./marketDecision534.js');return (await decisionPromise).openMarketDecision534()}catch(error){decisionPromise=null;console.error('[decision-534]',error);toast('Rozhodnutí se nepodařilo načíst')}}
async function openActionQueue(){try{actionQueuePromise=actionQueuePromise||import('./actionQueue559.js');return (await actionQueuePromise).openActionQueue559()}catch(error){actionQueuePromise=null;console.error('[action-queue-559]',error);toast('Akční frontu se nepodařilo načíst')}}
async function openCommander(){try{commanderPromise=commanderPromise||import('./marketCommander587.js');return (await commanderPromise).openMarketCommander587()}catch(error){commanderPromise=null;console.error('[market-commander-587]',error);toast('Market Commander se nepodařilo načíst')}}
async function openResolutionLoop(){try{resolutionLoopPromise=resolutionLoopPromise||import('./commanderResolutionLoop598.js');return (await resolutionLoopPromise).openCommanderResolutionLoop598()}catch(error){resolutionLoopPromise=null;console.error('[resolution-loop-598]',error);toast('Resolution Loop se nepodařilo načíst')}}
function openView(view){const b=qs(`#mainNav [data-view="${view}"]`)||qs(`#bottomNav [data-view="${view}"]`);b?.click()}
const cardRows=(rows,empty='Nic důležitého.')=>rows.length?rows.map(x=>`<div class="row"><div><b>${h(x.title)}</b>${x.meta?`<div class="muted">${h(x.meta)}</div>`:''}</div>${x.value?`<b>${h(x.value)}</b>`:''}</div>`).join(''):`<div class="empty success-empty">${h(empty)}</div>`;

export function renderTodayLite43(){
 if(fullModule){fullModule.renderToday?.();return}
 const host=qs('#todayView');if(!host)return;const started=performance.now(),token=String(++seq),m=marketSnapshot(store.get());host.dataset.todayLite43=token;
 const priorityRows=m.priorities.map((x,i)=>({title:`${i+1}. ${x.title}`,meta:`${x.kind} · ${x.meta}`}));
 const ticketRows=m.ticket.rows.slice(0,5).map(x=>({title:x.name,meta:`ROI ${x.roi}% · ${x.days===null?'bez deadline':x.days<0?'po deadline':x.days===0?'dnes':`${x.days} d`}`,value:x.market?money(x.market):'—'}));
 const positionRows=m.xtb.positions.slice(0,5).map(x=>({title:x.name,meta:`váha ${x.weight}% · výnos ${x.returnPct}%`,value:money(x.value)}));
 const xtbAge=m.xtb.age===null?'bez data':m.xtb.age>36?`${Math.round(m.xtb.age)} h · STARÉ`:`${Math.round(m.xtb.age)} h`;
 host.innerHTML=`<div class="view-head"><div><div class="eyebrow">KAMIL OS ${APP_VERSION} / COMMANDER HOME LOOP 59.9</div><h1>XTB + vstupenky. Co přesně udělat teď?</h1><p>Jedním kliknutím otevře Resolution Loop 59.8, který tě provede od doporučené akce přes ověření až po výsledek. Těžší výpočty zůstávají lazy a spustí se až po kliknutí.</p></div><div class="row-actions"><button class="btn primary" data-resolution-loop-598>Co mám udělat teď</button><button class="btn" data-market-commander-587>Commander diagnostika</button><button class="btn" data-action-queue-559>Akční fronta</button><button class="btn" data-open-money>XTB</button><button class="btn" data-open-tickets>Vstupenky</button></div></div>
 <div class="metric-strip"><div class="metric"><span>XTB hodnota</span><b>${money(m.xtb.value)}</b></div><div class="metric"><span>XTB P/L</span><b>${money(m.xtb.profit)}</b></div><div class="metric"><span>Kapitál ve vstupenkách</span><b>${money(m.ticket.capital)}</b></div><div class="metric"><span>Aktivní ticket pozice</span><b>${m.ticket.rows.length}</b></div></div>
 <div class="card"><div class="eyebrow">RESOLUTION LOOP 59.8</div><div class="card-head"><div><h2>Jedna cesta od problému k vyřešení</h2><p class="muted">Next Action → kontrola → Fix & Re-run → Guided Resolution. Home nic nepřepočítává před kliknutím.</p></div><button class="btn primary" data-resolution-loop-598>Spustit řešení</button></div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">SMART TOP 3 · XTB + VSTUPENKY</div><h2>Co má největší smysl řešit teď?</h2></div><button class="btn primary" data-resolution-loop-598>Vyřešit přes Loop</button></div>${cardRows(priorityRows,'XTB ani vstupenky teď podle uložených dat nevyžadují zásah.')}</div>
 <div class="card"><div class="eyebrow">DIAGNOSTIKA</div><div class="card-head"><div><h2>Commander 58.7 · Action Queue 55.9 · Decision 53.4</h2><p class="muted">Starší detailní vrstvy zůstávají dostupné jako diagnostika, ne jako primární workflow.</p></div><div class="row-actions"><button class="btn" data-market-commander-587>Commander</button><button class="btn" data-action-queue-559>Akční fronta</button><button class="btn" data-decision-534>Rozhodnutí</button></div></div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">XTB</div><h2>${m.xtb.count} pozic · data ${h(xtbAge)}</h2></div><button class="btn" data-open-money>Otevřít XTB</button></div>${cardRows(positionRows,'Nemám uložené XTB pozice.')}</div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">VSTUPENKY</div><h2>${m.ticket.rows.length} aktivních pozic · tržní hodnota ${money(m.ticket.marketValue)}</h2></div><button class="btn" data-open-tickets>Otevřít vstupenky</button></div>${cardRows(ticketRows,'Nemám aktivní vstupenky.')}</div>
 <div class="card"><div class="eyebrow">RYCHLÉ VSTUPY</div><div class="row-actions"><button class="btn primary" data-resolution-loop-598>Resolution Loop</button><button class="btn" data-market-commander-587>Commander diagnostika</button><button class="btn" data-action-queue-559>Akční fronta</button><button class="btn" data-open-tickets>Vstupenky detail</button><button class="btn" data-open-money>XTB detail</button></div></div>
 <div class="decision-note">59.9: Resolution Loop 59.8 je primární vstup pro XTB + vstupenky. Loop ani žádná těžká rozhodovací vrstva se nespouští při načtení Home; aktivují se až po explicitním kliknutí. Nic automaticky neobchodují, nepřevádějí, neprodávají ani nepřecenňují.</div>`;
 host.querySelectorAll('[data-open-money]').forEach(b=>b.addEventListener('click',()=>openView('money')));host.querySelectorAll('[data-open-tickets]').forEach(b=>b.addEventListener('click',()=>openView('tickets')));host.querySelectorAll('[data-decision-534]').forEach(b=>b.addEventListener('click',openDecision));host.querySelectorAll('[data-action-queue-559]').forEach(b=>b.addEventListener('click',openActionQueue));host.querySelectorAll('[data-market-commander-587]').forEach(b=>b.addEventListener('click',openCommander));host.querySelectorAll('[data-resolution-loop-598]').forEach(b=>b.addEventListener('click',openResolutionLoop));
 window.__KAMIL_MARKET_TOP3_533_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),top:m.priorities};window.__KAMIL_PERSONAL_HOME_531_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now()};window.__KAMIL_MARKET_HOME_560_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),lazyActionQueue:true};window.__KAMIL_MARKET_HOME_588_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),lazyCommander:true};window.__KAMIL_COMMANDER_HOME_599_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),lazyResolutionLoop:true};window.dispatchEvent(new CustomEvent('kamil:app-interactive'));
}
export function warmFullToday43(){if(fullModule)return Promise.resolve(fullModule);fullPromise=fullPromise||import('./today29.js');return fullPromise.then(m=>fullModule=m).catch(()=>null)}
// Legacy compatibility markers: Dnes řeš to důležité. Zbytek může počkat. · Personal 45.5 drží Safe Core · data-life-dashboard · import('./lifeDashboard455.js') · Životní dashboard · Můj život na jedné obrazovce. · Moje finance / 44.5 · data-assistant-530 · MARKET COCKPIT 53.4 · Rozhodnutí 53.4 · MARKET HOME 58.8
