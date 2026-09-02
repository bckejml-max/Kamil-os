const LEDGER_API='/api/core70-health?source=ledger';
const HEALTH_API='/api/core70-health';
const DISCOVERY_API='/api/chance-model-pages?days=5&maxPages=40';
const SCAN_BASE='/api/core70-health?source=chance&sport=soccer&days=5&main=1&limit=100&maxMarkets=12&minOdds=1.45&maxOdds=3.20&value=1&autoModel=1&autoModelLimit=3&poissonLimit=15&betsOnly=1';
const SCAN_PAGE_PAUSE_MS=1100;
const HEALTH_CLIENT_TTL_MS=30000;

let activeScan=null;
let scanSeq=0;
let healthClientCache={value:null,checkedAt:0};

const money=value=>`${Number(value||0).toLocaleString('cs-CZ')} Kč`;
const decimal=value=>Number(value||0).toLocaleString('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:2});
const pct=value=>Number(value||0).toLocaleString('cs-CZ',{minimumFractionDigits:1,maximumFractionDigits:1});
const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
const marketLabel=market=>({MATCH_RESULT:'Výsledek zápasu',BOTH_TEAMS_TO_SCORE:'Oba dají gól',OVER_UNDER:'Góly v zápasu',HOME_OVER_UNDER:'Góly domácích',AWAY_OVER_UNDER:'Góly hostů',ASIAN_HANDICAP:'Asijský handicap'}[String(market||'').toUpperCase()]||String(market||'Sázka'));
const hasBuiltInModel=health=>health?.checks?.football_data_poisson_model===true||health?.checks?.api_football_key===true;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function ensureStyles(){
 if(document.querySelector('style[data-betting144]'))return;
 const style=document.createElement('style');
 style.dataset.betting144='1';
 style.textContent=`
 .bet144{display:grid;gap:16px;max-width:1220px;margin:0 auto}.bet144-hero{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;padding:24px;border:1px solid rgba(135,164,194,.18);border-radius:22px;background:linear-gradient(135deg,rgba(20,37,55,.94),rgba(10,22,35,.96));box-shadow:0 18px 44px rgba(0,0,0,.18)}.bet144-hero h1{margin:5px 0 7px;font-size:31px;letter-spacing:-.04em}.bet144-hero p{margin:0;color:#9eb0c2;max-width:760px;line-height:1.5}.bet144-refresh{flex:0 0 auto}.bet144-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.bet144-metric{padding:16px 18px;border:1px solid rgba(135,164,194,.16);border-radius:16px;background:rgba(10,22,35,.78)}.bet144-metric span{display:block;font-size:12px;color:#8fa4b8}.bet144-metric b{display:block;margin-top:6px;font-size:22px}.bet144-list{display:grid;gap:10px}.bet144-ticket{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;padding:18px;border:1px solid rgba(135,164,194,.16);border-radius:17px;background:rgba(10,22,35,.78)}.bet144-title{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.bet144-title strong{font-size:17px}.bet144-lock{font-size:11px;font-weight:800;letter-spacing:.04em;padding:4px 8px;border-radius:999px;border:1px solid rgba(104,211,145,.28);background:rgba(42,122,80,.18);color:#8fe0ad}.bet144-event{margin-top:7px;color:#8fa4b8;font-size:13px}.bet144-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.bet144-chip{font-size:12px;padding:5px 8px;border-radius:9px;background:rgba(135,164,194,.09);color:#aac0d3}.bet144-numbers{display:grid;grid-template-columns:repeat(3,minmax(82px,auto));gap:8px;align-self:center}.bet144-number{padding:9px 10px;border-radius:11px;background:rgba(135,164,194,.07);text-align:right}.bet144-number span{display:block;font-size:10px;color:#879bad;text-transform:uppercase;letter-spacing:.05em}.bet144-number b{display:block;margin-top:4px;font-size:15px}.bet144-note{padding:13px 15px;border:1px solid rgba(135,164,194,.14);border-radius:14px;background:rgba(10,22,35,.55);color:#91a7ba;font-size:13px;line-height:1.5}.bet144-error{padding:20px;border:1px solid rgba(232,113,113,.26);border-radius:16px;background:rgba(111,35,35,.18)}
 .bet144-scanner{display:grid;gap:14px;padding:20px;border:1px solid rgba(135,164,194,.18);border-radius:20px;background:linear-gradient(145deg,rgba(12,28,44,.92),rgba(9,20,33,.9))}.bet144-scanhead{display:flex;justify-content:space-between;align-items:center;gap:14px}.bet144-scanhead h2{margin:0;font-size:21px}.bet144-scanhead p{margin:5px 0 0;color:#8fa4b8;font-size:13px}.bet144-statusrow{display:flex;gap:8px;flex-wrap:wrap}.bet144-status{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid rgba(135,164,194,.16);background:rgba(135,164,194,.07);color:#a9bdd0}.bet144-status.ok{border-color:rgba(74,211,125,.26);background:rgba(38,122,74,.16);color:#91e4af}.bet144-status.warn{border-color:rgba(240,183,77,.3);background:rgba(143,93,19,.16);color:#f0c979}.bet144-scanbody{display:grid;gap:10px}.bet144-scanempty{padding:18px;border:1px dashed rgba(135,164,194,.24);border-radius:15px;color:#91a7ba}.bet144-scanempty strong{display:block;color:#dbe8f3;font-size:18px;margin-bottom:5px}.bet144-pick{display:grid;grid-template-columns:minmax(0,1fr) repeat(4,minmax(74px,auto));gap:10px;align-items:center;padding:15px;border:1px solid rgba(72,205,124,.22);border-radius:15px;background:rgba(38,122,74,.09)}.bet144-pickmain strong{display:block;font-size:15px}.bet144-pickmain span{display:block;margin-top:4px;color:#8fa4b8;font-size:12px}.bet144-stat{padding:8px 9px;border-radius:10px;background:rgba(135,164,194,.07)}.bet144-stat span{display:block;font-size:9px;color:#8298aa;text-transform:uppercase;letter-spacing:.05em}.bet144-stat b{display:block;margin-top:3px;font-size:14px}.bet144-ev b{color:#8fe0ad}.bet144-scinfo{font-size:11px;color:#7f94a7}.bet144-modelhelp{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:13px 14px;border:1px solid rgba(74,211,125,.2);border-radius:14px;background:rgba(38,122,74,.08);color:#a7cfb5;font-size:13px;line-height:1.45}.bet144-section-title{font-size:13px;font-weight:900;letter-spacing:.08em;color:#8298aa;text-transform:uppercase;margin:4px 2px -2px}
 @media(max-width:850px){.bet144-hero{align-items:flex-start;flex-direction:column;padding:18px}.bet144-hero h1{font-size:27px}.bet144-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.bet144-ticket{grid-template-columns:1fr}.bet144-numbers{grid-template-columns:repeat(3,minmax(0,1fr))}.bet144-number{text-align:left}.bet144-scanhead{align-items:flex-start;flex-direction:column}.bet144-pick{grid-template-columns:repeat(2,minmax(0,1fr))}.bet144-pickmain{grid-column:1/-1}}
 @media(max-width:520px){.bet144-metrics{gap:8px}.bet144-metric{padding:13px}.bet144-metric b{font-size:19px}.bet144-ticket{padding:14px}.bet144-numbers{gap:6px}.bet144-number{padding:8px}.bet144-number b{font-size:14px}.bet144-scanner{padding:15px}.bet144-modelhelp{align-items:flex-start;flex-direction:column}}
 `;
 document.head.appendChild(style);
}

function loading(host){
 host.innerHTML=`<div class="bet144"><section class="bet144-hero"><div><div class="eyebrow">SÁZENÍ · CHANCE</div><h1>Betting centrum</h1><p>Načítám ledger a stav automatického value scanneru…</p></div></section></div>`;
}

function cancelActiveScan(){
 if(activeScan?.controller&&!activeScan.controller.signal.aborted)activeScan.controller.abort();
 activeScan=null;
}

function renderPickRows(events){
 const rows=[];
 const seen=new Set();
 for(const event of Array.isArray(events)?events:[]){
  for(const market of Array.isArray(event?.markets)?event.markets:[]){
   for(const selection of Array.isArray(market?.selections)?market.selections:[]){
    if(selection?.decision!=='BET'||selection?.existingBet)continue;
    const key=String(selection?.id||`${event?.id}|${market?.id}|${selection?.name}`);
    if(seen.has(key))continue;
    seen.add(key);
    rows.push({event,market,selection});
   }
  }
 }
 rows.sort((a,b)=>Number(b.selection?.evPct||0)-Number(a.selection?.evPct||0));
 return rows;
}

function pickRowsHtml(rows){
 return rows.map(({event,market,selection})=>`<article class="bet144-pick"><div class="bet144-pickmain"><strong>🟢 ${escapeHtml(selection.name||selection.outcome)} @ ${decimal(selection.odds)}</strong><span>${escapeHtml(event.home)} – ${escapeHtml(event.away)} · ${escapeHtml(marketLabel(market.type))} · ${escapeHtml(selection.modelSource||'model')}</span></div><div class="bet144-stat"><span>Model</span><b>${pct(Number(selection.modelProbability||0)*100)} %</b></div><div class="bet144-stat"><span>Fair</span><b>${decimal(selection.fairOdds)}</b></div><div class="bet144-stat"><span>Edge</span><b>+${pct(selection.edgePctPoints)} pp</b></div><div class="bet144-stat bet144-ev"><span>EV</span><b>+${pct(selection.evPct)} %</b></div></article>`).join('');
}

function publishScanState(state,rows){
 window.__KAMIL_VALUE_SCAN_144__={
  ok:!state.error,
  loading:!!state.loading,
  partial:!!state.partial,
  modelReady:state.modelReady,
  picks:rows.length,
  pagesScanned:state.pagesScanned||0,
  relevantPages:state.relevantPages||0,
  totalPages:state.totalPages||0,
  modeledEvents:state.modeledEvents||0,
  dataRequests:state.dataRequests||0,
  apiRequests:state.apiRequests||0,
  failedPages:Array.isArray(state.failedPages)?state.failedPages.map(item=>item.page):[]
 };
}

function renderScannerResults(host,state){
 const body=host.querySelector('[data-bet144-scanbody]');
 const meta=host.querySelector('[data-bet144-scanmeta]');
 const btn=host.querySelector('[data-bet144-scan]');
 if(!body)return;
 const rows=renderPickRows(state.events);
 publishScanState(state,rows);
 if(btn){
  btn.disabled=state.loading||!state.modelReady;
  btn.textContent=state.loading?(state.relevantPages?`Skenuji ${state.pagesScanned}/${state.relevantPages}…`:'Skenuji Chance…'):'Spustit value sken';
 }
 if(state.loading){
  const intro=`<div class="bet144-scanempty"><strong>${rows.length?`Průběžně nalezeno ${rows.length} tipů`:'Procházím Chance + vlastní model…'}</strong>Na BASIC feedu jedu bezpečně po jedné stránce. Výsledky níže jsou už ověřené a zůstávají viditelné i během pokračujícího skenu.</div>`;
  body.innerHTML=intro+(rows.length?pickRowsHtml(rows):'');
  if(meta)meta.textContent=state.progress||'Hledám relevantní stránky Chance…';
  return;
 }
 if(state.error){
  const partial=rows.length||state.pagesScanned>0;
  body.innerHTML=`<div class="bet144-error"><b>${partial?'Sken skončil částečně.':'Sken se nepodařil.'}</b><div class="muted" style="margin-top:6px">${escapeHtml(state.error)}</div>${partial?'<div class="muted" style="margin-top:5px">Už ověřené výsledky zachovávám.</div>':''}</div>`+(rows.length?pickRowsHtml(rows):'');
  if(meta)meta.textContent=partial?`Částečný sken ${state.pagesScanned||0}/${state.relevantPages||'?'} · ${rows.length} tipů zachováno`:'Sken selhal';
  return;
 }
 if(!state.modelReady){
  body.innerHTML='<div class="bet144-scanempty"><strong>Model není dostupný.</strong>Bez nezávislé pravděpodobnosti správně nevydám žádné VSADIT.</div>';
  if(meta)meta.textContent='Bez modelu = 0 BET';
  return;
 }
 if(state.partial&&Array.isArray(state.failedPages)&&state.failedPages.length){
  body.innerHTML=`<div class="bet144-error"><b>Sken dokončen s výpadky.</b><div class="muted" style="margin-top:6px">Nepodařilo se ověřit ${state.failedPages.length} stran; úspěšné výsledky níže jsou zachované.</div></div>`+(rows.length?pickRowsHtml(rows):'<div class="bet144-scanempty"><strong>NIC z ověřených stran — 0u</strong>Na úspěšně zkontrolovaných stranách nebyl tip, který splnil oba filtry.</div>');
 }else if(!rows.length){
  body.innerHTML='<div class="bet144-scanempty"><strong>NIC — 0u</strong>V modelovaných podporovaných ligách není tip, který splní oba filtry. Nic nenutím.</div>';
 }else{
  body.innerHTML=pickRowsHtml(rows);
 }
 if(meta){
  const modeled=Number(state.modeledEvents||0);
  const dataRequests=Number(state.dataRequests||0);
  const apiRequests=Number(state.apiRequests||0);
  const cacheHits=Number(state.cacheHits||0);
  const relevant=Number(state.relevantPages||0);
  const total=Number(state.totalPages||0);
  const failed=Array.isArray(state.failedPages)?state.failedPages.length:0;
  meta.textContent=`${state.pagesScanned||0}/${relevant} relevantních stran z ${total||'?'} · ${modeled} modelovaných zápasů · ${rows.length} value tipů${failed?` · ${failed} stran přeskočeno`:''} · ${dataRequests} historických načtení · ${apiRequests} API predikcí · ${cacheHits} cache hitů`;
 }
}

async function readJson(response){try{return await response.json()}catch{return null}}
function apiError(payload,fallback){
 const raw=payload?.message||payload?.details?.message||payload?.error||fallback;
 if(String(payload?.error||'').includes('RATE_LIMIT')||String(raw).includes('Too many requests'))return'Chance feed narazil na limit 1 požadavek/s. OS automaticky počká a zkusí stránku znovu.';
 if(String(payload?.error||'').includes('AUTH'))return'Chance feed odmítl přístupový klíč. Zkontroluj PulseScore API klíč.';
 return String(raw||fallback);
}

async function discoverRelevantPages(signal){
 const response=await fetch(DISCOVERY_API,{headers:{Accept:'application/json'},signal});
 const payload=await readJson(response);
 if(!response.ok)throw new Error(apiError(payload,`Chance discovery HTTP ${response.status}`));
 if(!payload?.ok)throw new Error(apiError(payload,'Chance page discovery není dostupné'));
 const pages=(Array.isArray(payload.pages)?payload.pages:[]).map(item=>({
  page:Number(item?.page),
  supportedEvents:Number(item?.supportedEvents||0),
  leagues:Array.isArray(item?.leagues)?item.leagues:[]
 })).filter(item=>Number.isInteger(item.page)).sort((a,b)=>b.supportedEvents-a.supportedEvents||a.page-b.page);
 return {pages,totalPages:Number(payload.totalPages||0),scannedPages:Number(payload.scannedPages||0),authMode:payload.authMode||null};
}

async function fetchScanPage(page,signal){
 let lastError=null;
 for(let attempt=0;attempt<3;attempt+=1){
  if(signal?.aborted)throw new DOMException('Aborted','AbortError');
  try{
   const response=await fetch(`${SCAN_BASE}&page=${page}&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'},signal});
   const payload=await readJson(response);
   if(response.ok&&payload?.ok)return payload;
   const message=apiError(payload,`Chance scanner HTTP ${response.status}`);
   if(response.status<500&&response.status!==429)throw new Error(message);
   lastError=new Error(message);
  }catch(error){
   if(error?.name==='AbortError')throw error;
   lastError=error;
  }
  if(attempt<2)await wait(1300*(attempt+1));
 }
 throw lastError||new Error('Chance scanner není dostupný');
}

async function runValueScan(host){
 cancelActiveScan();
 const controller=new AbortController();
 const runId=++scanSeq;
 activeScan={runId,controller};
 const health=window.__KAMIL_BETTING_HEALTH_144__||{};
 const modelReady=hasBuiltInModel(health);
 const state={loading:true,modelReady,events:[],pagesScanned:0,relevantPages:0,totalPages:0,modeledEvents:0,dataRequests:0,apiRequests:0,cacheHits:0,error:null,partial:false,failedPages:[],progress:'Hledám relevantní stránky Chance…'};
 renderScannerResults(host,state);
 if(!modelReady){
  state.loading=false;
  renderScannerResults(host,state);
  if(activeScan?.runId===runId)activeScan=null;
  return;
 }
 try{
  const discovery=await discoverRelevantPages(controller.signal);
  if(controller.signal.aborted||activeScan?.runId!==runId)return;
  state.relevantPages=discovery.pages.length;
  state.totalPages=discovery.totalPages;
  if(!discovery.pages.length){state.loading=false;renderScannerResults(host,state);return}
  for(let i=0;i<discovery.pages.length;i+=1){
   if(controller.signal.aborted||activeScan?.runId!==runId)return;
   const pageInfo=discovery.pages[i];
   const page=pageInfo.page;
   const currentPicks=renderPickRows(state.events).length;
   state.progress=`Skenuji ${i+1}/${discovery.pages.length} · strana ${page} · ${pageInfo.supportedEvents} podporovaných zápasů · ${currentPicks} tipů`;
   renderScannerResults(host,state);
   try{
    const payload=await fetchScanPage(page,controller.signal);
    if(controller.signal.aborted||activeScan?.runId!==runId)return;
    state.pagesScanned+=1;
    state.events.push(...(Array.isArray(payload.events)?payload.events:[]));
    state.modeledEvents+=Number(payload?.value?.autoModel?.modeledEvents||0);
    state.dataRequests+=Number(payload?.value?.autoModel?.dataRequests||0);
    state.apiRequests+=Number(payload?.value?.autoModel?.apiRequests||0);
    state.cacheHits+=Number(payload?.value?.autoModel?.cacheHits||0);
    if(payload?.value?.autoModel?.configured===false){state.modelReady=false;break}
   }catch(error){
    if(error?.name==='AbortError')return;
    const message=String(error?.message||error);
    if(/klíč|AUTH|401/i.test(message))throw error;
    state.partial=true;
    state.failedPages.push({page,error:message});
   }
   const found=renderPickRows(state.events).length;
   state.progress=`Hotovo ${i+1}/${discovery.pages.length} · ${found} value tipů${state.failedPages.length?` · ${state.failedPages.length} výpadků`:''}`;
   renderScannerResults(host,state);
   if(i<discovery.pages.length-1)await wait(SCAN_PAGE_PAUSE_MS);
  }
 }catch(error){
  if(error?.name==='AbortError')return;
  state.error=String(error?.message||error);
  state.partial=state.pagesScanned>0;
 }finally{
  if(activeScan?.runId===runId)activeScan=null;
 }
 state.loading=false;
 renderScannerResults(host,state);
}

function scannerHtml(health){
 const modelReady=hasBuiltInModel(health);
 const chanceReady=health?.checks?.pulsescore_api===true;
 const apiBoost=health?.checks?.api_football_key===true;
 return `<section class="bet144-scanner"><div class="bet144-scanhead"><div><h2>🎯 Value scanner</h2><p>Chance kurzy → nezávislý model → fair kurz → edge → EV → VSADIT / NIC.</p></div><button class="btn" type="button" data-bet144-scan ${modelReady?'':'disabled'}>Spustit value sken</button></div><div class="bet144-statusrow"><span class="bet144-status ${chanceReady?'ok':'warn'}">${chanceReady?'●':'○'} Chance feed</span><span class="bet144-status ${modelReady?'ok':'warn'}">${modelReady?'● Vlastní Poisson model':'○ Model nedostupný'}</span>${apiBoost?'<span class="bet144-status ok">● API-Football 1X2 boost</span>':''}<span class="bet144-status">EV ≥ 5 %</span><span class="bet144-status">Edge ≥ 4 pp</span><span class="bet144-status">Pre-match only</span></div><div class="bet144-modelhelp"><span><b>Bez bookmakerového modelu.</b> Scanner projde Chance soccer feed s throttlem podle BASIC API limitu a model pustí jen na relevantní podporované ligy. Nejbohatší stránky kontroluje jako první a nalezené tipy ukazuje průběžně.</span></div><div class="bet144-scanbody" data-bet144-scanbody><div class="bet144-scanempty"><strong>${modelReady?'Připraveno ke skenu.':'Model není dostupný.'}</strong>${modelReady?'Klikni na Spustit value sken. Výsledky se budou zobrazovat průběžně, nemusíš čekat až na konec.':'Bez nezávislého modelu nic nedoporučím.'}</div></div><div class="bet144-scinfo" data-bet144-scanmeta>${modelReady?'Discovery se cacheuje 5 minut; bookmaker odds nejsou vstupem modelu.':'Bez modelu = 0 BET'}</div></section>`;
}

function renderData(host,payload,health){
 const summary=payload?.ledger||{};
 const bets=(Array.isArray(payload?.bets)?payload.bets:[]).filter(b=>String(b?.status||'').toUpperCase()==='OPEN');
 const exposure=Number(summary.knownTicketExposureCzk??bets.reduce((sum,b)=>sum+Number(b.stakeCzk||0),0));
 const totalReturn=bets.reduce((sum,b)=>sum+Number(b.stakeCzk||0)*Number(b.odds||0),0);
 const rows=bets.map(b=>{
   const payout=Number(b.stakeCzk||0)*Number(b.odds||0);
   return `<article class="bet144-ticket" data-bet-id="${escapeHtml(b.id)}"><div><div class="bet144-title"><strong>${escapeHtml(b.label||b.event)}</strong><span class="bet144-lock">🔒 OTEVŘENO</span></div><div class="bet144-event">${escapeHtml(b.event||'')}</div><div class="bet144-meta"><span class="bet144-chip">Chance</span><span class="bet144-chip">${escapeHtml(marketLabel(b.market))}</span>${b.line!=null?`<span class="bet144-chip">linie ${escapeHtml(String(b.line).replace('.',','))}</span>`:''}</div></div><div class="bet144-numbers"><div class="bet144-number"><span>Kurz</span><b>${decimal(b.odds)}</b></div><div class="bet144-number"><span>Vklad</span><b>${money(b.stakeCzk)}</b></div><div class="bet144-number"><span>Výplata</span><b>${money(Math.round(payout))}</b></div></div></article>`;
 }).join('');
 host.innerHTML=`<div class="bet144"><section class="bet144-hero"><div><div class="eyebrow">SÁZENÍ · CHANCE</div><h1>Betting centrum</h1><p>Kurzy už tahá OS sám. Value tip se zobrazí jen tehdy, když ho potvrdí nezávislý model a projde EV/edge filtrem; už vsazené tikety znovu nenabízím.</p></div><button class="btn bet144-refresh" type="button" data-bet144-refresh>↻ Aktualizovat</button></section><section class="bet144-metrics"><div class="bet144-metric"><span>Otevřené tikety</span><b>${bets.length}</b></div><div class="bet144-metric"><span>Celkem vsazeno</span><b>${money(exposure)}</b></div><div class="bet144-metric"><span>Možná výplata</span><b>${money(Math.round(totalReturn))}</b></div><div class="bet144-metric"><span>Chance feed</span><b>${health?.checks?.pulsescore_api?'🟢 Připraven':'🟠 Kontrola'}</b></div></section>${scannerHtml(health)}<div class="bet144-section-title">Otevřené tikety</div><section class="bet144-list">${rows||'<div class="bet144-note">Nemáš žádnou otevřenou potvrzenou sázku.</div>'}</section><div class="bet144-note">🔒 Zamčený tiket už znovu nedoporučuju ani nepřepisuju. Aktuálně eviduju ${bets.length} otevřené tikety za ${money(exposure)}. Automatická fotbalová vrstva už umí 1X2, BTTS, gólové a týmové totaly na půlgólových liniích. Další na řadě jsou rohy, karty, handicapy a tenis.</div></div>`;
 host.querySelector('[data-bet144-refresh]')?.addEventListener('click',()=>loadBetting(host,true));
 host.querySelector('[data-bet144-scan]')?.addEventListener('click',()=>runValueScan(host));
 window.__KAMIL_BETTING_HEALTH_144__=health||{};
 window.__KAMIL_BETTING_144__={ok:true,openCount:bets.length,exposureCzk:exposure,modelReady:hasBuiltInModel(health),bets:bets.map(b=>({id:b.id,label:b.label,odds:b.odds,stakeCzk:b.stakeCzk,status:b.status}))};
}

async function getHealth(){
 const now=Date.now();
 if(healthClientCache.value&&now-healthClientCache.checkedAt<HEALTH_CLIENT_TTL_MS)return healthClientCache.value;
 const response=await fetch(`${HEALTH_API}?_=${now}`,{cache:'no-store',headers:{Accept:'application/json'}});
 const payload=await readJson(response);
 if(!response.ok)throw new Error(`Health HTTP ${response.status}`);
 if(!payload?.ok)throw new Error(payload?.error||'Health není dostupný');
 healthClientCache={value:payload,checkedAt:Date.now()};
 return payload;
}

async function loadBetting(host,force=false){
 if(!host)return;
 if(force){cancelActiveScan();loading(host)}
 try{
   const stamp=Date.now();
   const ledgerPromise=fetch(`${LEDGER_API}&_=${stamp}`,{cache:'no-store',headers:{Accept:'application/json'}});
   const [ledgerResponse,health]=await Promise.all([ledgerPromise,getHealth()]);
   if(!ledgerResponse.ok)throw new Error(`Ledger HTTP ${ledgerResponse.status}`);
   const payload=await ledgerResponse.json();
   if(!payload?.ok)throw new Error(payload?.error||'Ledger není dostupný');
   renderData(host,payload,health);
 }catch(error){
   host.innerHTML=`<div class="bet144"><section class="bet144-hero"><div><div class="eyebrow">SÁZENÍ · CHANCE</div><h1>Betting centrum</h1></div></section><div class="bet144-error"><b>Betting centrum se nepodařilo načíst.</b><div class="muted" style="margin-top:6px">${escapeHtml(error?.message||error)}</div><button class="btn" style="margin-top:12px" type="button" data-bet144-retry>Zkusit znovu</button></div></div>`;
   host.querySelector('[data-bet144-retry]')?.addEventListener('click',()=>loadBetting(host,true));
   window.__KAMIL_BETTING_144__={ok:false,error:String(error?.message||error)};
 }
}

export function renderBettingPage144(){
 ensureStyles();
 const host=document.querySelector('#bettingView');
 if(!host)return null;
 cancelActiveScan();
 loading(host);
 loadBetting(host);
 return window.__KAMIL_BETTING_144__||{ok:true,loading:true};
}