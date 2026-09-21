import {store} from './state.js';
import {ownEvent1100} from './runtimeOwnership1100.js';
import {loadProductAdvancedStyles} from './productAdvancedStyles.js';

const OWNER='product.bettingOverview';
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));

function ledger(){
 let legacy={};try{legacy=JSON.parse(localStorage.getItem('kamil_betting_ledger_543')||'{}')}catch{}
 const canonical=store.get()?.bettingLedger||{},useCanonical=canonical.updatedAt||Number(canonical.bankrollCzk||0)!==0||Number(canonical.unitCzk||0)!==0||(Array.isArray(canonical.bets)&&canonical.bets.length>0),bets=useCanonical?(Array.isArray(canonical.bets)?canonical.bets:[]):(Array.isArray(legacy.bets)?legacy.bets:[]);
 return {bets,bankrollCzk:Number(useCanonical?canonical.bankrollCzk:legacy.bankrollCzk||0),unitCzk:Number(useCanonical?canonical.unitCzk:legacy.unitCzk||0)};
}
function data(){
 const l=ledger(),open=l.bets.filter(x=>String(x.status||'OPEN').toUpperCase()==='OPEN'),settled=l.bets.filter(x=>['WIN','LOSS','VOID'].includes(String(x.status||'').toUpperCase()));
 const stake=settled.reduce((a,x)=>a+Number(x.stakeCzk||0),0),profit=settled.reduce((a,x)=>a+Number(x.pnlCzk||0),0),wins=settled.filter(x=>String(x.status).toUpperCase()==='WIN').length,losses=settled.filter(x=>String(x.status).toUpperCase()==='LOSS').length;
 return {...l,open,settled,exposure:open.reduce((a,x)=>a+Number(x.stakeCzk||0),0),profit,roi:stake?profit/stake*100:0,winRate:wins+losses?wins/(wins+losses)*100:0};
}
function rows(items){if(!items.length)return '<div class="pr1300-empty">Žádná otevřená sázka.</div>';return items.slice(0,8).map(x=>'<div class="pr1300-row"><div class="pr1300-row-main"><b>'+esc(x.label||x.selection||x.event||'Sázka')+(x.odds?' @ '+Number(x.odds).toFixed(2):'')+'</b><small>'+esc(x.event||'')+' · '+esc(x.market||'')+' · '+money(x.stakeCzk||0)+'</small></div><div class="pr1300-row-side">'+(x.units?esc(x.units+'u'):'OPEN')+'</div></div>').join('')}

export function renderBettingOverview(){
 const host=document.querySelector('#bettingView');if(!host)return false;const d=data(),risk=d.bankrollCzk&&d.exposure>d.bankrollCzk*.2;
 host.innerHTML='<div class="pr1300-shell" data-betting-overview>' +
 '<div class="pr1300-head"><div><div class="pr1300-kicker">Sázení</div><h1>Bankroll, otevřená expozice a výsledky. Nic víc, dokud nechceš.</h1><p>Scanner a modely jsou sekundární nástroje. Výchozí obrazovka ukazuje jen skutečné sázky a riziko.</p></div><span class="pr1300-status '+(risk?'warn':'good')+'">'+d.open.length+' otevřených</span></div>' +
 '<section class="pr1300-hero"><div><div class="pr1300-kicker">Otevřená expozice</div><h2>'+money(d.exposure)+'</h2><p>'+(risk?'Expozice je vyšší než 20 % uloženého bankrollu. Zkontroluj nové sázky před dalším vstupem.':'Podle uloženého bankrollu není otevřená expozice mimo běžný rámec.')+'</p></div><div class="pr1300-hero-value"><b>'+(d.bankrollCzk?money(d.bankrollCzk):'nenastaven')+'</b><span>bankroll</span></div></section>' +
 '<div class="pr1300-kpis"><div class="pr1300-kpi"><span>Otevřené</span><b>'+d.open.length+'</b><small>aktuální sázky</small></div><div class="pr1300-kpi"><span>Profit</span><b>'+money(d.profit)+'</b><small>settled historie</small></div><div class="pr1300-kpi"><span>ROI</span><b>'+d.roi.toFixed(1).replace('.',',')+' %</b><small>z uzavřených sázek</small></div><div class="pr1300-kpi"><span>Win rate</span><b>'+d.winRate.toFixed(1).replace('.',',')+' %</b><small>WIN / LOSS</small></div></div>' +
 '<div class="pr1300-actions"><button class="pr1300-btn primary" type="button" data-betting-advanced>Scanner a detail sázek</button><button class="pr1300-btn" type="button" data-betting-task>＋ Úkol k sázení</button></div>' +
 '<section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Otevřené sázky</h2><span>jen to, kde jsou peníze právě teď</span></div>'+rows(d.open)+'</section></div>';
 if(!host.dataset.bettingOverviewBound){host.dataset.bettingOverviewBound='1';ownEvent1100(OWNER,host,'click',async e=>{if(e.target.closest('[data-betting-task]')){window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'task'}));return}if(e.target.closest('[data-betting-advanced]')){host.dataset.productAdvanced='1';await loadProductAdvancedStyles(["./globalFintech137.css"]);const m=await import('./bettingAdvanced527.js');await m.renderBettingPage527?.()}})}
 window.__KAMIL_BETTING_OVERVIEW__={healthy:true,open:d.open.length,exposure:d.exposure,profit:d.profit,at:Date.now()};return true;
}