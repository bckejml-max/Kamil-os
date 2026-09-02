const API='/api/core70-health?source=ledger';

const money=value=>`${Number(value||0).toLocaleString('cs-CZ')} Kč`;
const decimal=value=>Number(value||0).toLocaleString('cs-CZ',{minimumFractionDigits:2,maximumFractionDigits:2});
const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
const marketLabel=market=>({MATCH_RESULT:'Výsledek zápasu',BOTH_TEAMS_TO_SCORE:'Oba dají gól',ASIAN_HANDICAP:'Asijský handicap'}[String(market||'').toUpperCase()]||String(market||'Sázka'));

function ensureStyles(){
 if(document.querySelector('style[data-betting144]'))return;
 const style=document.createElement('style');
 style.dataset.betting144='1';
 style.textContent=`
 .bet144{display:grid;gap:16px;max-width:1220px;margin:0 auto}.bet144-hero{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;padding:24px;border:1px solid rgba(135,164,194,.18);border-radius:22px;background:linear-gradient(135deg,rgba(20,37,55,.94),rgba(10,22,35,.96));box-shadow:0 18px 44px rgba(0,0,0,.18)}.bet144-hero h1{margin:5px 0 7px;font-size:31px;letter-spacing:-.04em}.bet144-hero p{margin:0;color:#9eb0c2;max-width:700px;line-height:1.5}.bet144-refresh{flex:0 0 auto}.bet144-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.bet144-metric{padding:16px 18px;border:1px solid rgba(135,164,194,.16);border-radius:16px;background:rgba(10,22,35,.78)}.bet144-metric span{display:block;font-size:12px;color:#8fa4b8}.bet144-metric b{display:block;margin-top:6px;font-size:22px}.bet144-list{display:grid;gap:10px}.bet144-ticket{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;padding:18px;border:1px solid rgba(135,164,194,.16);border-radius:17px;background:rgba(10,22,35,.78)}.bet144-title{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.bet144-title strong{font-size:17px}.bet144-lock{font-size:11px;font-weight:800;letter-spacing:.04em;padding:4px 8px;border-radius:999px;border:1px solid rgba(104,211,145,.28);background:rgba(42,122,80,.18);color:#8fe0ad}.bet144-event{margin-top:7px;color:#8fa4b8;font-size:13px}.bet144-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.bet144-chip{font-size:12px;padding:5px 8px;border-radius:9px;background:rgba(135,164,194,.09);color:#aac0d3}.bet144-numbers{display:grid;grid-template-columns:repeat(3,minmax(82px,auto));gap:8px;align-self:center}.bet144-number{padding:9px 10px;border-radius:11px;background:rgba(135,164,194,.07);text-align:right}.bet144-number span{display:block;font-size:10px;color:#879bad;text-transform:uppercase;letter-spacing:.05em}.bet144-number b{display:block;margin-top:4px;font-size:15px}.bet144-note{padding:13px 15px;border:1px solid rgba(135,164,194,.14);border-radius:14px;background:rgba(10,22,35,.55);color:#91a7ba;font-size:13px;line-height:1.5}.bet144-error{padding:20px;border:1px solid rgba(232,113,113,.26);border-radius:16px;background:rgba(111,35,35,.18)}
 @media(max-width:850px){.bet144-hero{align-items:flex-start;flex-direction:column;padding:18px}.bet144-hero h1{font-size:27px}.bet144-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.bet144-ticket{grid-template-columns:1fr}.bet144-numbers{grid-template-columns:repeat(3,minmax(0,1fr))}.bet144-number{text-align:left}}
 @media(max-width:520px){.bet144-metrics{gap:8px}.bet144-metric{padding:13px}.bet144-metric b{font-size:19px}.bet144-ticket{padding:14px}.bet144-numbers{gap:6px}.bet144-number{padding:8px}.bet144-number b{font-size:14px}}
 `;
 document.head.appendChild(style);
}

function loading(host){
 host.innerHTML=`<div class="bet144"><section class="bet144-hero"><div><div class="eyebrow">SÁZENÍ · CHANCE</div><h1>Otevřené sázky</h1><p>Načítám potvrzené tikety z betting ledgeru…</p></div></section></div>`;
}

function renderData(host,payload){
 const summary=payload?.ledger||{};
 const bets=(Array.isArray(payload?.bets)?payload.bets:[]).filter(b=>String(b?.status||'').toUpperCase()==='OPEN');
 const exposure=Number(summary.knownTicketExposureCzk??bets.reduce((sum,b)=>sum+Number(b.stakeCzk||0),0));
 const totalReturn=bets.reduce((sum,b)=>sum+Number(b.stakeCzk||0)*Number(b.odds||0),0);
 const rows=bets.map(b=>{
   const payout=Number(b.stakeCzk||0)*Number(b.odds||0);
   return `<article class="bet144-ticket" data-bet-id="${escapeHtml(b.id)}"><div><div class="bet144-title"><strong>${escapeHtml(b.label||b.event)}</strong><span class="bet144-lock">🔒 OTEVŘENO</span></div><div class="bet144-event">${escapeHtml(b.event||'')}</div><div class="bet144-meta"><span class="bet144-chip">Chance</span><span class="bet144-chip">${escapeHtml(marketLabel(b.market))}</span>${b.line!=null?`<span class="bet144-chip">linie ${escapeHtml(String(b.line).replace('.',','))}</span>`:''}</div></div><div class="bet144-numbers"><div class="bet144-number"><span>Kurz</span><b>${decimal(b.odds)}</b></div><div class="bet144-number"><span>Vklad</span><b>${money(b.stakeCzk)}</b></div><div class="bet144-number"><span>Výplata</span><b>${money(Math.round(payout))}</b></div></div></article>`;
 }).join('');
 host.innerHTML=`<div class="bet144"><section class="bet144-hero"><div><div class="eyebrow">SÁZENÍ · CHANCE</div><h1>Otevřené sázky</h1><p>Tady jsou jen sázky, které jsi potvrdil jako skutečně vsazené. Doporučený tip se sem nepřidá, dokud ho nepotvrdíš.</p></div><button class="btn bet144-refresh" type="button" data-bet144-refresh>↻ Aktualizovat</button></section><section class="bet144-metrics"><div class="bet144-metric"><span>Otevřené tikety</span><b>${bets.length}</b></div><div class="bet144-metric"><span>Celkem vsazeno</span><b>${money(exposure)}</b></div><div class="bet144-metric"><span>Možná výplata</span><b>${money(Math.round(totalReturn))}</b></div><div class="bet144-metric"><span>Ledger</span><b>🔒 Zamčeno</b></div></section><section class="bet144-list">${rows||'<div class="bet144-note">Nemáš žádnou otevřenou potvrzenou sázku.</div>'}</section><div class="bet144-note">🔒 Zamčený tiket už znovu nedoporučuju ani nepřepisuju. Aktuálně eviduju ${bets.length} otevřené tikety za ${money(exposure)}.</div></div>`;
 host.querySelector('[data-bet144-refresh]')?.addEventListener('click',()=>loadLedger(host,true));
 window.__KAMIL_BETTING_144__={ok:true,openCount:bets.length,exposureCzk:exposure,bets:bets.map(b=>({id:b.id,label:b.label,odds:b.odds,stakeCzk:b.stakeCzk,status:b.status}))};
}

async function loadLedger(host,force=false){
 if(!host)return;
 if(force)loading(host);
 try{
   const response=await fetch(`${API}&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});
   if(!response.ok)throw new Error(`HTTP ${response.status}`);
   const payload=await response.json();
   if(!payload?.ok)throw new Error(payload?.error||'Ledger není dostupný');
   renderData(host,payload);
 }catch(error){
   host.innerHTML=`<div class="bet144"><section class="bet144-hero"><div><div class="eyebrow">SÁZENÍ · CHANCE</div><h1>Otevřené sázky</h1></div></section><div class="bet144-error"><b>Ledger se nepodařilo načíst.</b><div class="muted" style="margin-top:6px">${escapeHtml(error?.message||error)}</div><button class="btn" style="margin-top:12px" type="button" data-bet144-retry>Zkusit znovu</button></div></div>`;
   host.querySelector('[data-bet144-retry]')?.addEventListener('click',()=>loadLedger(host,true));
   window.__KAMIL_BETTING_144__={ok:false,error:String(error?.message||error)};
 }
}

export function renderBettingPage144(){
 ensureStyles();
 const host=document.querySelector('#bettingView');
 if(!host)return null;
 loading(host);
 loadLedger(host);
 return window.__KAMIL_BETTING_144__||{ok:true,loading:true};
}
