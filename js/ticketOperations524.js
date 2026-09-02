import {loadTicketCloud660} from './ticketCloud660.js';
import {buildTicketRepricingGuardDesk194} from './ticketRepricingGuardModel194.js';
import {buildTicketSellLadderDesk195} from './ticketSellLadderModel195.js';

const VERSION='524.0.0';
const ACTIVE=new Set(['LISTED','NOT_LISTED']);
const SOLD=new Set(['SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAYOUT_RECEIVED','PAID']);
const ACTIONS=new Set(['DROP TO','RAISE TO','LIST AT']);
const LOG_KEY='kamil.ticket.actionLog524';
let bound=false,timer=0,loading=null,observer=null,painting=false;
let cloud=null,guardDesk=null,ladderDesk=null;

const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const qty=r=>Math.max(1,n(r?.qty)||1);
const status=r=>String(r?.market_status||r?.marketStatus||'').trim().toUpperCase();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>`${Math.round(Math.abs(n(v))).toLocaleString('cs-CZ')} Kč`;
const signed=v=>`${n(v)>=0?'+':'−'}${money(v)}`;
const name=r=>String(r?.event_name||r?.eventName||r?.name||'Vstupenka').trim();
const section=r=>String(r?.section||'').trim();
const buyTotal=r=>n(r?.buy_total_czk)||n(r?.buy_each_czk)*qty(r);
const sellTotal=r=>n(r?.sell_total_czk)||n(r?.sell_each_czk)*qty(r);
const askEach=r=>n(r?.ask_each_czk??r?.askEachCzk??r?.listPrice)||0;
const parseDate=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const ageHours=v=>{const t=parseDate(v);return t===null?null:Math.max(0,(Date.now()-t)/36e5)};
const ageDays=v=>{const h=ageHours(v);return h===null?null:Math.floor(h/24)};
const today=()=>new Date().toISOString().slice(0,10);

function latest(r){return cloud?.latest?.get?.(r.id)||cloud?.latest?.get?.(String(r.id))||null}
function checkedAt(s){return s?.checked_at||s?.market_checked_at||s?.fetched_at||s?.observed_at||s?.updated_at||s?.created_at||null}
function marketEach(s){return n(s?.market_price_czk??s?.consensus?.market_price_czk??s?.viagogo_price_czk??s?.consensus?.viagogo_price_czk??s?.stubhub_price_czk??s?.consensus?.stubhub_price_czk)||0}
function platform(r,s){
  const raw=[r?.source_name,r?.source_sheet,r?.viagogo_url,r?.stubhub_url,s?.source,s?.marketplace].filter(Boolean).join(' ').toLowerCase();
  if(raw.includes('viagogo'))return'Viagogo';if(raw.includes('stubhub'))return'StubHub';if(raw.includes('ticketmaster'))return'Ticketmaster';if(raw.includes('ticketportal'))return'Ticketportal';
  return String(r?.source_name||s?.source||'Evidence').trim()||'Evidence';
}
function guardMap(){return new Map((guardDesk?.rows||[]).map(r=>[String(r.id),r]))}
function ladderMap(){return new Map((ladderDesk?.rows||[]).map(r=>[String(r.id),r]))}

function readLog(){try{const x=JSON.parse(localStorage.getItem(LOG_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function writeLog(rows){try{localStorage.setItem(LOG_KEY,JSON.stringify(rows.slice(-1500)))}catch{}return rows}
function actionKey(g){return `${g?.id||''}|${g?.action||''}|${Math.round(n(g?.recommendedAsk))}|${today()}`}
function confirmed(g){return readLog().some(x=>x.key===actionKey(g)&&!x.undoneAt)}
function confirmGuard(g){
  if(!g||!ACTIONS.has(g.action))return false;
  const rows=readLog(),key=actionKey(g);
  if(rows.some(x=>x.key===key&&!x.undoneAt))return true;
  const inv=(cloud?.inventory||[]).find(r=>String(r.id)===String(g.id));
  rows.push({key,kind:'TICKET_REPRICE',ticketId:String(g.id),event:name(inv||g),section:section(inv||g),action:g.action,oldAsk:n(g.askEach)||null,recommendedAsk:n(g.recommendedAsk)||null,marketEach:n(g.marketEach)||null,neverBelow:n(g.neverBelow)||null,emergencyFloor:n(g.emergencyFloor)||null,reason:String(g.reason||''),source:'ticketRepricingGuardModel194',createdAt:new Date().toISOString(),undoneAt:null});
  writeLog(rows);
  window.__KAMIL_TICKET_ACTION524__={version:'524.0.0',healthy:true,count:rows.filter(x=>!x.undoneAt).length,last:rows.at(-1),localOnly:true,at:Date.now()};
  window.dispatchEvent(new CustomEvent('kamil:ticket-action524-updated',{detail:window.__KAMIL_TICKET_ACTION524__}));
  return true;
}

function freshness(r){
  const s=latest(r),market=marketEach(s),stamp=checkedAt(s),hours=ageHours(stamp);
  if(!(market>0))return{market:0,stamp,hours:null,label:'Trh chybí',tone:'missing',factor:0.55,points:0};
  if(hours===null)return{market,stamp:null,hours:null,label:'Stáří neznámé',tone:'unknown',factor:0.75,points:8};
  if(hours<=6)return{market,stamp,hours,label:hours<1?'Trh <1 h':`Trh ${Math.max(1,Math.round(hours))} h`,tone:'fresh',factor:1,points:20};
  if(hours<=24)return{market,stamp,hours,label:`Trh ${Math.round(hours)} h`,tone:'ok',factor:.95,points:16};
  if(hours<=72)return{market,stamp,hours,label:`Trh ${Math.round(hours/24)} d`,tone:'stale',factor:.80,points:10};
  return{market,stamp,hours,label:`Trh ${Math.round(hours/24)} d`,tone:'expired',factor:.60,points:4};
}
function scoreTone(v){return v>=85?'good':v>=65?'warn':'bad'}
function trustFor(r,g){
  const s=latest(r),f=freshness(r),missing=[];let score=0;
  if(parseDate(r?.event_date??r?.eventDate)!==null)score+=10;else missing.push('datum eventu');
  if(section(r)&&section(r)!=='—')score+=10;else missing.push('sektor');
  if(buyTotal(r)>0)score+=15;else missing.push('nákupní cena');
  if(f.market>0)score+=20;else missing.push('market cena');
  score+=f.points;
  if(askEach(r)>0)score+=10;else missing.push('listing cena');
  if(n(g?.neverBelow)>0||n(g?.emergencyFloor)>0)score+=10;else missing.push('payout-based floor');
  const p=platform(r,s);if(p&&p!=='Evidence')score+=5;else missing.push('zdroj/platforma');
  return{score:Math.max(0,Math.min(100,Math.round(score))),tone:scoreTone(score),missing,fresh:f};
}

function adjustDecision(el,r){
  const line=el.querySelector('[data-decision507]');if(!line)return null;
  const f=freshness(r),match=(line.textContent||'').match(/D(\d+)/i);if(!match)return null;
  const visible=Number(match[1]),lastRendered=Number(line.dataset.os516RenderedScore),storedRaw=Number(line.dataset.os516RawScore);
  let raw=Number.isFinite(storedRaw)?storedRaw:visible;
  if(Number.isFinite(lastRendered)&&visible!==lastRendered)raw=visible;
  if(!Number.isFinite(raw))return null;
  const effective=Math.max(0,Math.min(100,Math.round(raw*f.factor)));
  const action=String(line.textContent||'').split('·').slice(1).join('·').trim();
  line.dataset.os516RawScore=String(raw);line.dataset.os516RenderedScore=String(effective);line.dataset.os516Freshness=f.tone;
  if(effective!==visible)line.textContent=`D${effective}${action?` · ${action}`:''}`;
  line.title=`Efektivní Decision Score ${effective}/100 · základ ${raw}/100 · freshness faktor ${Math.round(f.factor*100)} %. Starší market data skóre snižují; nejde o pravděpodobnost prodeje.`;
  return{raw,effective,factor:f.factor};
}

function decorateRows(){
  const host=document.querySelector('#ticketIntelView .td331');if(!host||!cloud?.ok)return{active:0,trustAvg:null,stale:0};
  const inv=new Map((cloud.inventory||[]).map(r=>[String(r.id),r])),gm=guardMap();let active=0,trustSum=0,stale=0;
  for(const el of host.querySelectorAll('.td500-ticket-row[data-ticket-id]')){
    const r=inv.get(String(el.dataset.ticketId));if(!r||!ACTIVE.has(status(r)))continue;active++;
    const g=gm.get(String(r.id))||{},f=freshness(r),trust=trustFor(r,g);trustSum+=trust.score;if(['stale','expired','missing','unknown'].includes(f.tone))stale++;
    const sell=el.querySelector('[data-col="sell"]');if(sell){let box=sell.querySelector('[data-target514]');if(!box){box=document.createElement('span');box.dataset.target514='1';box.className='td514-levels';sell.appendChild(box)}const target=n(g.recommendedAsk),floor=n(g.neverBelow),be=n(g.emergencyFloor);box.innerHTML=target?`<b>Cíl ${money(target)}</b><small>${floor?`floor ${money(floor)}`:be?`BE ${money(be)}`:'floor bez payout dat'}</small>`:`<b>Cíl —</b><small>${g.action==='PAYOUT DATA NEEDED'?'doplň payout historii':'bez market cíle'}</small>`;box.title=[target?`Target ${money(target)}`:'Target není bezpečně dostupný',floor?`Normální chráněný floor ${money(floor)}`:null,be?`Emergency break-even ${money(be)}`:null,g.reason].filter(Boolean).join(' · ')}
    const plat=el.querySelector('[data-col="platform"]');if(plat){let badge=plat.querySelector('[data-freshness516]');if(!badge){badge=document.createElement('span');badge.dataset.freshness516='1';badge.className='td516-freshness';plat.appendChild(badge)}badge.dataset.tone=f.tone;badge.textContent=f.label;badge.title=f.stamp?`Poslední market kontrola ${new Date(f.stamp).toLocaleString('cs-CZ')}`:'Čas poslední market kontroly není dostupný.'}
    const stat=el.querySelector('[data-col="status"]');if(stat){let badge=stat.querySelector('[data-trust517]');if(!badge){badge=document.createElement('span');badge.dataset.trust517='1';badge.className='td517-trust';stat.appendChild(badge)}badge.dataset.tone=trust.tone;badge.textContent=`Data ${trust.score}`;badge.title=`Data Trust ${trust.score}/100${trust.missing.length?` · chybí: ${trust.missing.join(', ')}`:''}. Skóre měří úplnost a čerstvost dat, ne šanci na prodej.`}
    adjustDecision(el,r);
    el.dataset.trust517=trust.tone;el.dataset.freshness516=f.tone;
  }
  document.documentElement.dataset.ticketTarget514='1';document.documentElement.dataset.ticketFreshness516='1';document.documentElement.dataset.ticketTrust517='1';
  window.__KAMIL_TICKET_TARGET514__={version:'514.0.0',healthy:true,active,guarded:(guardDesk?.rows||[]).filter(x=>n(x.neverBelow)>0).length,at:Date.now()};
  window.__KAMIL_TICKET_FRESHNESS516__={version:'516.0.0',healthy:true,active,stale,thresholdHours:24,at:Date.now()};
  window.__KAMIL_TICKET_TRUST517__={version:'517.0.0',healthy:true,active,average:active?Math.round(trustSum/active):null,stale,at:Date.now()};
  return{active,trustAvg:active?Math.round(trustSum/active):null,stale};
}

function saleStamp(r){return r?.sold_at||r?.sale_date||r?.sale_recorded_at||r?.updated_at||r?.imported_at||null}
function payoutRows(){return (cloud?.inventory||[]).filter(r=>SOLD.has(status(r))).map(r=>{const st=status(r),buy=buyTotal(r),sell=sellTotal(r),payout=n(r?.payout_received_czk),known=payout>0,net=known?payout-buy:null,stamp=st==='PAYOUT_RECEIVED'||st==='PAID'?(r?.payout_recorded_at||saleStamp(r)):saleStamp(r);return{r,st,buy,sell,payout,known,net,days:ageDays(stamp),stamp}})}
function payoutSummary(){const rows=payoutRows(),waiting=rows.filter(x=>x.st==='SOLD_WAITING_PAYMENT'),delivery=rows.filter(x=>x.st==='SOLD_UNDELIVERED'),paid=rows.filter(x=>x.known);return{rows,waiting,delivery,paid,pendingGross:[...waiting,...delivery].reduce((s,x)=>s+x.sell,0),payout:paid.reduce((s,x)=>s+x.payout,0),net:paid.reduce((s,x)=>s+n(x.net),0)}}

function ensureShell(){
  let shell=document.querySelector('[data-ticket-ops524-shell]');if(shell)return shell;
  shell=document.createElement('div');shell.dataset.ticketOps524Shell='1';shell.className='tdops524-shell';shell.innerHTML='<div class="tdops524-backdrop" data-ops-close></div><aside class="tdops524-drawer" role="dialog" aria-modal="true"><header><div><small data-ops-eyebrow>TICKET OPS</small><h2 data-ops-title>Detail</h2></div><button type="button" data-ops-close aria-label="Zavřít">×</button></header><div class="tdops524-body" data-ops-body></div></aside>';
  document.body.appendChild(shell);shell.addEventListener('click',e=>{if(e.target.closest('[data-ops-close]'))closeShell();const confirm=e.target.closest('[data-confirm524]');if(confirm){const g=guardMap().get(String(confirm.dataset.confirm524));if(confirmGuard(g)){confirm.textContent='✓ Potvrzeno';confirm.disabled=true;renderRepricing();decorateRows()}}});
  return shell;
}
function openShell(title,eyebrow,html){const s=ensureShell();s.querySelector('[data-ops-title]').textContent=title;s.querySelector('[data-ops-eyebrow]').textContent=eyebrow;s.querySelector('[data-ops-body]').innerHTML=html;s.classList.add('open');document.documentElement.classList.add('ticket-ops-open')}
function closeShell(){document.querySelector('[data-ticket-ops524-shell]')?.classList.remove('open');document.documentElement.classList.remove('ticket-ops-open')}
function statusLabel(st){return st==='SOLD_UNDELIVERED'?'K doručení':st==='SOLD_WAITING_PAYMENT'?'Čeká payout':st==='PAYOUT_RECEIVED'||st==='PAID'?'Vyplaceno':st}
function payoutItem(x){return `<article class="td511-row"><div><b>${esc(name(x.r))}</b><small>${esc(section(x.r)||'sektor neuveden')} · ${qty(x.r)} ks · ${esc(statusLabel(x.st))}${x.days!==null?` · ${x.days} d`:''}</small></div><div><span>Prodej</span><strong>${x.sell?money(x.sell):'—'}</strong></div><div><span>Payout</span><strong>${x.known?money(x.payout):'—'}</strong></div><div><span>NET</span><strong class="${x.net!==null?(x.net>=0?'good':'bad'):''}">${x.net!==null?signed(x.net):'—'}</strong></div></article>`}
function openPayout(){const p=payoutSummary();const waiting=[...p.delivery,...p.waiting].sort((a,b)=>(b.days??-1)-(a.days??-1)),paid=[...p.paid].sort((a,b)=>(b.days??-1)-(a.days??-1));openShell('Payout centrum','OS511 · CASHFLOW',`<div class="td511-kpis"><article><small>ČEKÁ / DORUČIT</small><b>${waiting.length}</b><span>${money(p.pendingGross)} hrubě</span></article><article><small>SKUTEČNÉ PAYOUTY</small><b>${money(p.payout)}</b><span>${p.paid.length}/${p.rows.length} prodejů</span></article><article><small>SKUTEČNÝ NET</small><b class="${p.net>=0?'good':'bad'}">${p.paid.length?signed(p.net):'—'}</b><span>jen přijaté payouty</span></article></div><section class="td511-block"><h3>Čeká na dokončení</h3>${waiting.map(payoutItem).join('')||'<p class="tdops-empty">Nic aktuálně nečeká na doručení ani payout.</p>'}</section><section class="td511-block"><h3>Vyplaceno</h3>${paid.map(payoutItem).join('')||'<p class="tdops-empty">Zatím není uložen skutečný payout.</p>'}</section><p class="tdops-note">OS511 nepředpovídá čistý payout. NET se ukazuje jen tam, kde je v evidenci skutečně přijatá částka.</p>`);document.documentElement.dataset.ticketPayout511='1';window.__KAMIL_TICKET_PAYOUT511__={version:'511.0.0',healthy:true,waiting:waiting.length,pendingGross:p.pendingGross,paid:p.paid.length,actualPayout:p.payout,actualNet:p.net,at:Date.now()}}

const actionRank=a=>a==='DROP TO'?100:a==='RAISE TO'?90:a==='LIST AT'?80:a==='PAYOUT DATA NEEDED'?60:10;
const actionCs=a=>a==='DROP TO'?'ZLEVNIT':a==='RAISE TO'?'ZDRAŽIT':a==='LIST AT'?'VYSTAVIT':a==='PAYOUT DATA NEEDED'?'DOPLNIT PAYOUT':a==='HOLD'?'DRŽET':a;
function repricingRows(){return [...(guardDesk?.rows||[])].sort((a,b)=>actionRank(b.action)-actionRank(a.action)||(a.days??999)-(b.days??999))}
function repricingItem(g){const done=confirmed(g),actionable=ACTIONS.has(g.action);return `<article class="td523-row" data-tone="${g.action==='DROP TO'?'urgent':g.action==='RAISE TO'?'raise':g.action==='LIST AT'?'list':'hold'}"><div class="td523-main"><span>${esc(actionCs(g.action))}</span><b>${esc(g.name)}</b><small>${esc(g.section||'—')} · ${g.days==null?'termín neznámý':g.days<0?'event proběhl':`${g.days} dní do eventu`}</small></div><div><small>AKTUÁLNĚ</small><b>${n(g.askEach)?money(g.askEach):'—'}</b></div><div><small>CÍL</small><b>${n(g.recommendedAsk)?money(g.recommendedAsk):'—'}</b></div><div><small>TRH</small><b>${n(g.marketEach)?money(g.marketEach):'—'}</b></div><div><small>FLOOR</small><b>${n(g.neverBelow)?money(g.neverBelow):n(g.emergencyFloor)?`BE ${money(g.emergencyFloor)}`:'—'}</b></div><div class="td523-act">${actionable?`<button type="button" data-confirm524="${esc(g.id)}" ${done?'disabled':''}>${done?'✓ Potvrzeno':'Hotovo'}</button>`:'<span>—</span>'}</div><p>${esc(g.reason||'')}</p></article>`}
function renderRepricing(){const shell=document.querySelector('[data-ticket-ops524-shell]');if(!shell?.classList.contains('open')||shell.querySelector('[data-ops-title]')?.textContent!=='Smart repricing')return;const rows=repricingRows(),actionable=rows.filter(x=>ACTIONS.has(x.action));shell.querySelector('[data-ops-body]').innerHTML=`<div class="td523-summary"><b>${actionable.length}</b><span>cenových akcí</span><b>${rows.filter(x=>x.action==='HOLD').length}</b><span>držet</span><b>${rows.filter(x=>x.action==='PAYOUT DATA NEEDED').length}</b><span>bez payout modelu</span></div><div class="td523-head"><span>POZICE</span><span>AKTUÁLNĚ</span><span>CÍL</span><span>TRH</span><span>FLOOR</span><span>AKCE</span></div>${rows.map(repricingItem).join('')||'<p class="tdops-empty">Žádné aktivní pozice.</p>'}<p class="tdops-note">„Hotovo“ pouze zapíše, že jsi doporučenou akci provedl. OS tím sám nemění cenu na marketplace.</p>`;window.__KAMIL_TICKET_REPRICING523__={version:'523.0.0',healthy:true,active:rows.length,actionable:actionable.length,confirmedToday:actionable.filter(confirmed).length,at:Date.now()}}
function openRepricing(){openShell('Smart repricing','OS523–524 · PRICE ACTION','');renderRepricing();document.documentElement.dataset.ticketRepricing523='1';document.documentElement.dataset.ticketAction524='1'}

function installControls(){
  const host=document.querySelector('#ticketIntelView .td331'),modes=host?.querySelector(':scope > .td331-modes'),tools=modes?.querySelector('.td500-view-tools');if(!tools)return;
  if(!tools.querySelector('[data-payout511]')){const b=document.createElement('button');b.type='button';b.className='td500-icon-btn tdops-control';b.dataset.payout511='1';b.textContent='Payouty';b.title='OS511 · otevřít payout centrum';b.addEventListener('click',openPayout);tools.prepend(b)}
  if(!tools.querySelector('[data-repricing523]')){const b=document.createElement('button');b.type='button';b.className='td500-icon-btn tdops-control';b.dataset.repricing523='1';b.textContent='Repricing';b.title='OS523 · otevřít frontu cenových akcí';b.addEventListener('click',openRepricing);tools.prepend(b)}
}
function publish(){const p=payoutSummary(),rows=repricingRows(),logs=readLog();window.__KAMIL_TICKET_PAYOUT511__={version:'511.0.0',healthy:true,waiting:rows.length,pendingGross:p.pendingGross,paid:p.paid.length,actualPayout:p.payout,actualNet:p.net,at:Date.now()};window.__KAMIL_TICKET_REPRICING523__={version:'523.0.0',healthy:true,active:rows.length,actionable:rows.filter(x=>ACTIONS.has(x.action)).length,confirmedToday:rows.filter(x=>ACTIONS.has(x.action)&&confirmed(x)).length,at:Date.now()};window.__KAMIL_TICKET_ACTION524__={version:'524.0.0',healthy:true,count:logs.filter(x=>!x.undoneAt).length,localOnly:true,at:Date.now()}}
function paint(){if(painting||!cloud?.ok)return false;painting=true;try{installControls();decorateRows();publish();return true}finally{painting=false}}
async function refresh(force=false){if(loading&&!force)return loading;loading=(async()=>{try{const next=await loadTicketCloud660();if(!next?.ok)return false;cloud=next;guardDesk=buildTicketRepricingGuardDesk194(next.inventory||[],next.latest||new Map());ladderDesk=buildTicketSellLadderDesk195(next.inventory||[],next.latest||new Map());paint();if(document.querySelector('[data-ticket-ops524-shell].open [data-ops-title]')?.textContent==='Smart repricing')renderRepricing();return true}catch(error){console.warn('[ticketOperations524]',error);return false}finally{loading=null}})();return loading}
function schedule(ms=100,{reload=false}={}){clearTimeout(timer);timer=setTimeout(()=>{timer=0;reload?refresh(true):paint()},ms)}
export function installTicketOperations524(){
  refresh();setTimeout(()=>paint(),500);setTimeout(()=>paint(),1400);if(bound)return;bound=true;
  for(const ev of ['kamil:view-change','kamil:ticket-desk331-updated','kamil:ticket-economics506-updated','kamil:ticket-grouping508-updated'])window.addEventListener(ev,()=>schedule(140));
  for(const ev of ['kamil:ticket-refresh397-done','kamil:ticket-payout154-updated'])window.addEventListener(ev,()=>schedule(80,{reload:true}));
  window.addEventListener('keydown',e=>{if(e.key==='Escape')closeShell()});
  const root=document.querySelector('#ticketIntelView');if(root){observer=new MutationObserver(records=>{if(painting)return;if(records.some(r=>r.type==='childList'&&(r.target===root||r.target?.matches?.('.td331,.td331-grid'))))schedule(160)});observer.observe(root,{childList:true,subtree:true})}
}
