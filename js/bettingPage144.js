const LEDGER_API='/api/core70-health?source=ledger';
const HEALTH_API='/api/core70-health';
const SCAN_PAGES=3;
const SCAN_BASE='/api/core70-health?source=chance&sport=soccer&days=1&main=1&limit=30&maxMarkets=12&minOdds=1.45&maxOdds=3.20&value=1&autoModel=1&autoModelLimit=3&betsOnly=1';

const money=value=>`${Number(value||0).toLocaleString('cs-CZ')} Kč`;
const decimal=value=>Number(value||0).toLocaleString('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:2});
const pct=value=>Number(value||0).toLocaleString('cs-CZ',{minimumFractionDigits:1,maximumFractionDigits:1});
const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
const marketLabel=market=>({MATCH_RESULT:'Výsledek zápasu',BOTH_TEAMS_TO_SCORE:'Oba dají gól',ASIAN_HANDICAP:'Asijský handicap'}[String(market||'').toUpperCase()]||String(market||'Sázka'));

function ensureStyles(){
 if(document.querySelector('style[data-betting144]'))return;
 const style=document.createElement('style');
 style.dataset.betting144='1';
 style.textContent=`
 .bet144{display:grid;gap:16px;max-width:1220px;margin:0 auto}.bet144-hero{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;padding:24px;border:1px solid rgba(135,164,194,.18);border-radius:22px;background:linear-gradient(135deg,rgba(20,37,55,.94),rgba(10,22,35,.96));box-shadow:0 18px 44px rgba(0,0,0,.18)}.bet144-hero h1{margin:5px 0 7px;font-size:31px;letter-spacing:-.04em}.bet144-hero p{margin:0;color:#9eb0c2;max-width:760px;line-height:1.5}.bet144-refresh{flex:0 0 auto}.bet144-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.bet144-metric{padding:16px 18px;border:1px solid rgba(135,164,194,.16);border-radius:16px;background:rgba(10,22,35,.78)}.bet144-metric span{display:block;font-size:12px;color:#8fa4b8}.bet144-metric b{display:block;margin-top:6px;font-size:22px}.bet144-list{display:grid;gap:10px}.bet144-ticket{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;padding:18px;border:1px solid rgba(135,164,194,.16);border-radius:17px;background:rgba(10,22,35,.78)}.bet144-title{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.bet144-title strong{font-size:17px}.bet144-lock{font-size:11px;font-weight:800;letter-spacing:.04em;padding:4px 8px;border-radius:999px;border:1px solid rgba(104,211,145,.28);background:rgba(42,122,80,.18);color:#8fe0ad}.bet144-event{margin-top:7px;color:#8fa4b8;font-size:13px}.bet144-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.bet144-chip{font-size:12px;padding:5px 8px;border-radius:9px;background:rgba(135,164,194,.09);color:#aac0d3}.bet144-numbers{display:grid;grid-template-columns:repeat(3,minmax(82px,auto));gap:8px;align-self:center}.bet144-number{padding:9px 10px;border-radius:11px;background:rgba(135,164,194,.07);text-align:right}.bet144-number span{display:block;font-size:10px;color:#879bad;text-transform:uppercase;letter-spacing:.05em}.bet144-number b{display:block;margin-top:4px;font-size:15px}.bet144-note{padding:13px 15px;border:1px solid rgba(135,164,194,.14);border-radius:14px;background:rgba(10,22,35,.55);color:#91a7ba;font-size:13px;line-height:1.5}.bet144-error{padding:20px;border:1px solid rgba(232,113,113,.26);border-radius:16px;background:rgba(111,35,35,.18)}
 .bet144-scanner{display:grid;gap:14px;padding:20px;border:1px solid rgba(135,164,194,.18);border-radius:20px;background:linear-gradient(145deg,rgba(12,28,44,.92),rgba(9,20,33,.9))}.bet144-scanhead{display:flex;justify-content:space-between;align-items:center;gap:14px}.bet144-scanhead h2{margin:0;font-size:21px}.bet144-scanhead p{margin:5px 0 0;color:#8fa4b8;font-size:13px}.bet144-statusrow{display:flex;gap:8px;flex-wrap:wrap}.bet144-status{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid rgba(135,164,194,.16);background:rgba(135,164,194,.07);color:#a9bdd0}.bet144-status.ok{border-color:rgba(74,211,125,.26);background:rgba(38,122,74,.16);color:#91e4af}.bet144-status.warn{border-color:rgba(240,183,77,.3);background:rgba(143,93,19,.16);color:#f0c979}.bet144-scanbody{display:grid;gap:10px}.bet144-scanempty{padding:18px;border:1px dashed rgba(135,164,194,.24);border-radius:15px;color:#91a7ba}.bet144-scanempty strong{display:block;color:#dbe8f3;font-size:18px;margin-bottom:5px}.bet144-pick{display:grid;grid-template-columns:minmax(0,1fr) repeat(4,minmax(74px,auto));gap:10px;align-items:center;padding:15px;border:1px solid rgba(72,205,124,.22);border-radius:15px;background:rgba(38,122,74,.09)}.bet144-pickmain strong{display:block;font-size:15px}.bet144-pickmain span{display:block;margin-top:4px;color:#8fa4b8;font-size:12px}.bet144-stat{padding:8px 9px;border-radius:10px;background:rgba(135,164,194,.07)}.bet144-stat span{display:block;font-size:9px;color:#8298aa;text-transform:uppercase;letter-spacing:.05em}.bet144-stat b{display:block;margin-top:3px;font-size:14px}.bet144-ev b{color:#8fe0ad}.bet144-scinfo{font-size:11px;color:#7f94a7}.bet144-modelhelp{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:13px 14px;border:1px solid rgba(240,183,77,.22);border-radius:14px;background:rgba(143,93,19,.09);color:#d6b878;font-size:13px;line-height:1.45}.bet144-modelhelp a{color:#f0c979;text-decoration:underline}.bet144-section-title{font-size:13px;font-weight:900;letter-spacing:.08em;color:#8298aa;text-transform:uppercase;margin:4px 2px -2px}
 @media(max-width:850px){.bet144-hero{align-items:flex-start;flex-direction:column;padding:18px}.bet144-hero h1{font-size:27px}.bet144-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.bet144-ticket{grid-template-columns:1fr}.bet144-numbers{grid-template-columns:repeat(3,minmax(0,1fr))}.bet144-number{text-align:left}.bet144-scanhead{align-items:flex-start;flex-direction:column}.bet144-pick{grid-template-columns:repeat(2,minmax(0,1fr))}.bet144-pickmain{grid-column:1/-1}}
 @media(max-width:520px){.bet144-metrics{gap:8px}.bet144-metric{padding:13px}.bet144-metric b{font-size:19px}.bet144-ticket{padding:14px}.bet144-numbers{gap:6px}.bet144-number{padding:8px}.bet144-number b{font-size:14px}.bet144-scanner{padding:15px}.bet144-modelhelp{align-items:flex-start;flex-direction:column}}
 `;
 document.head.appendChild(style);
}

function loading(host){
 host.innerHTML=`<div class="bet144"><section class="bet144-hero"><div><div class="eyebrow">SÁZENÍ · CHANCE</div><h1>Betting centrum</h1><p>Načítám ledger a stav automatického value scanneru…</p></div></section></div>`;
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

function renderScannerResults(host,state){
 const body=host.querySelector('[data-bet144-scanbody]');
 const meta=host.querySelector('[data-bet144-scanmeta]');
 const btn=host.querySelector('[data-bet144-scan]');
 if(!body)return;
 if(btn){btn.disabled=state.loading||!state.modelReady;btn.textContent=state.loading?'Skenuji Chance…':'Spustit value sken'}
 if(state.loading){
  body.innerHTML='<div class="bet144-scanempty"><strong>Procházím Chance + model…</strong>Beru budoucí pre-match zápasy, kurz 1,45–3,20 a pouštím jen EV ≥ 5 % + edge ≥ 4 pp.</div>';
  if(meta)meta.textContent='Probíhá sken…';
  return;
 }
 if(state.error){
  body.innerHTML=`<div class="bet144-error"><b>Sken se nepodařil.</b><div class="muted" style="margin-top:6px">${escapeHtml(state.error)}</div></div>`;
  if(meta)meta.textContent='Sken selhal';
  return;
 }
 if(!state.modelReady){
  body.innerHTML='<div class="bet144-scanempty"><strong>Model ještě není připojen.</strong>Chance kurzy už OS čte automaticky. Bez nezávislé pravděpodobnosti ale správně nevydám žádné VSADIT.</div>';
  if(meta)meta.textContent='0 modelových requestů · bezpečný režim';
  return;
 }
 const rows=renderPickRows(state.events);
 if(!rows.length){
  body.innerHTML='<div class="bet144-scanempty"><strong>NIC — 0u</strong>V právě modelované várce není tip, který splní oba filtry. Nic nenutím.</div>';
 }else{
  body.innerHTML=rows.map(({event,market,selection})=>`<article class="bet144-pick"><div class="bet144-pickmain"><strong>🟢 ${escapeHtml(selection.name||selection.outcome)} @ ${decimal(selection.odds)}</strong><span>${escapeHtml(event.home)} – ${escapeHtml(event.away)} · ${escapeHtml(marketLabel(market.type))}</span></div><div class="bet144-stat"><span>Model</span><b>${pct(Number(selection.modelProbability||0)*100)} %</b></div><div class="bet144-stat"><span>Fair</span><b>${decimal(selection.fairOdds)}</b></div><div class="bet144-stat"><span>Edge</span><b>+${pct(selection.edgePctPoints)} pp</b></div><div class="bet144-stat bet144-ev"><span>EV</span><b>+${pct(selection.evPct)} %</b></div></article>`).join('');
 }
 if(meta){
  const modeled=Number(state.modeledEvents||0);
  const requests=Number(state.apiRequests||0);
  const cacheHits=Number(state.cacheHits||0);
  meta.textContent=`${state.pagesScanned||0}/${SCAN_PAGES} stran Chance · ${modeled} modelovaných zápasů · ${requests} API requestů · ${cacheHits} cache hitů`;
 }
 window.__KAMIL_VALUE_SCAN_144__={ok:!state.error,modelReady:state.modelReady,picks:rows.length,pagesScanned:state.pagesScanned||0,modeledEvents:state.modeledEvents||0,apiRequests:state.apiRequests||0};
}

async function runValueScan(host){
 const health=window.__KAMIL_BETTING_HEALTH_144__||{};
 const modelReady=health?.checks?.api_football_key===true;
 const state={loading:true,modelReady,events:[],pagesScanned:0,modeledEvents:0,apiRequests:0,cacheHits:0,error:null};
 renderScannerResults(host,state);
 if(!modelReady){state.loading=false;renderScannerResults(host,state);return}
 try{
  for(let page=1;page<=SCAN_PAGES;page+=1){
   const response=await fetch(`${SCAN_BASE}&page=${page}&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});
   if(!response.ok)throw new Error(`Chance scanner HTTP ${response.status}`);
   const payload=await response.json();
   if(!payload?.ok)throw new Error(payload?.error||'Chance scanner není dostupný');
   state.pagesScanned=page;
   state.events.push(...(Array.isArray(payload.events)?payload.events:[]));
   state.modeledEvents+=Number(payload?.value?.autoModel?.modeledEvents||0);
   state.apiRequests+=Number(payload?.value?.autoModel?.apiRequests||0);
   state.cacheHits+=Number(payload?.value?.autoModel?.cacheHits||0);
   if(payload?.value?.autoModel?.configured===false){state.modelReady=false;break}
   if(payload?.hasNextPage===false)break;
  }
 }catch(error){state.error=String(error?.message||error)}
 state.loading=false;
 renderScannerResults(host,state);
}

function scannerHtml(health){
 const modelReady=health?.checks?.api_football_key===true;
 const chanceReady=health?.checks?.pulsescore_api===true;
 return `<section class="bet144-scanner"><div class="bet144-scanhead"><div><h2>🎯 Value scanner</h2><p>Chance kurzy → nezávislý model → fair kurz → edge → EV → VSADIT / NIC.</p></div><button class="btn" type="button" data-bet144-scan ${modelReady?'':'disabled'}>Spustit value sken</button></div><div class="bet144-statusrow"><span class="bet144-status ${chanceReady?'ok':'warn'}">${chanceReady?'●':'○'} Chance feed</span><span class="bet144-status ${modelReady?'ok':'warn'}">${modelReady?'● API-Football model':'○ Model čeká na klíč'}</span><span class="bet144-status">EV ≥ 5 %</span><span class="bet144-status">Edge ≥ 4 pp</span><span class="bet144-status">Pre-match only</span></div>${modelReady?'':`<div class="bet144-modelhelp"><span><b>Chybí už jen jednorázový API-Football klíč.</b> Free plán má 100 requestů/den; bez klíče scanner schválně nic nedoporučí.</span><a href="https://dashboard.api-football.com/register" target="_blank" rel="noopener noreferrer">Vytvořit free klíč ↗</a></div>`}<div class="bet144-scanbody" data-bet144-scanbody><div class="bet144-scanempty"><strong>${modelReady?'Připraveno ke skenu.':'Model ještě není připojen.'}</strong>${modelReady?'Projedu až 3 stránky Chance a vrátím jen skutečné value tipy.':'Chance feed už funguje; čeká se pouze na nezávislý model.'}</div></div><div class="bet144-scinfo" data-bet144-scanmeta>${modelReady?'Sken se spouští ručně, aby se zbytečně nepálila free kvóta.':'0 modelových requestů · bezpečný režim'}</div></section>`;
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
 host.innerHTML=`<div class="bet144"><section class="bet144-hero"><div><div class="eyebrow">SÁZENÍ · CHANCE</div><h1>Betting centrum</h1><p>Kurzy už tahá OS sám. Value tip se zobrazí jen tehdy, když ho potvrdí nezávislý model a projde EV/edge filtrem; už vsazené tikety znovu nenabízím.</p></div><button class="btn bet144-refresh" type="button" data-bet144-refresh>↻ Aktualizovat</button></section><section class="bet144-metrics"><div class="bet144-metric"><span>Otevřené tikety</span><b>${bets.length}</b></div><div class="bet144-metric"><span>Celkem vsazeno</span><b>${money(exposure)}</b></div><div class="bet144-metric"><span>Možná výplata</span><b>${money(Math.round(totalReturn))}</b></div><div class="bet144-metric"><span>Chance feed</span><b>${health?.checks?.pulsescore_api?'🟢 Online':'🟠 Kontrola'}</b></div></section>${scannerHtml(health)}<div class="bet144-section-title">Otevřené tikety</div><section class="bet144-list">${rows||'<div class="bet144-note">Nemáš žádnou otevřenou potvrzenou sázku.</div>'}</section><div class="bet144-note">🔒 Zamčený tiket už znovu nedoporučuju ani nepřepisuju. Aktuálně eviduju ${bets.length} otevřené tikety za ${money(exposure)}. Automatický model je teď první vrstva pro fotbalové 1X2; další na řadě jsou totals, handicapy, rohy, karty a tenis.</div></div>`;
 host.querySelector('[data-bet144-refresh]')?.addEventListener('click',()=>loadBetting(host,true));
 host.querySelector('[data-bet144-scan]')?.addEventListener('click',()=>runValueScan(host));
 window.__KAMIL_BETTING_HEALTH_144__=health||{};
 window.__KAMIL_BETTING_144__={ok:true,openCount:bets.length,exposureCzk:exposure,modelReady:health?.checks?.api_football_key===true,bets:bets.map(b=>({id:b.id,label:b.label,odds:b.odds,stakeCzk:b.stakeCzk,status:b.status}))};
}

async function loadBetting(host,force=false){
 if(!host)return;
 if(force)loading(host);
 try{
   const stamp=Date.now();
   const [ledgerResponse,healthResponse]=await Promise.all([
    fetch(`${LEDGER_API}&_=${stamp}`,{cache:'no-store',headers:{Accept:'application/json'}}),
    fetch(`${HEALTH_API}?_=${stamp}`,{cache:'no-store',headers:{Accept:'application/json'}})
   ]);
   if(!ledgerResponse.ok)throw new Error(`Ledger HTTP ${ledgerResponse.status}`);
   if(!healthResponse.ok)throw new Error(`Health HTTP ${healthResponse.status}`);
   const [payload,health]=await Promise.all([ledgerResponse.json(),healthResponse.json()]);
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
 loading(host);
 loadBetting(host);
 return window.__KAMIL_BETTING_144__||{ok:true,loading:true};
}
