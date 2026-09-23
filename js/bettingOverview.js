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
 const state=store.get(),l=ledger(),master=state?.bettingLedger?.masterMeta||null,open=l.bets.filter(x=>String(x.status||'OPEN').toUpperCase()==='OPEN').sort((a,b)=>Number(b.stakeCzk||0)-Number(a.stakeCzk||0)),settled=l.bets.filter(x=>['WIN','LOSS','VOID'].includes(String(x.status||'').toUpperCase()));
 const stake=settled.reduce((a,x)=>a+Number(x.stakeCzk||0),0),profit=settled.reduce((a,x)=>a+Number(x.pnlCzk||0),0),wins=settled.filter(x=>String(x.status).toUpperCase()==='WIN').length,losses=settled.filter(x=>String(x.status).toUpperCase()==='LOSS').length;
 return {...l,master,open,settled,exposure:open.reduce((a,x)=>a+Number(x.stakeCzk||0),0),profit,roi:stake?profit/stake*100:0,winRate:wins+losses?wins/(wins+losses)*100:0};
}
function rows(items){if(!items.length)return '<div class="pr1300-empty">Žádná otevřená sázka.</div>';return items.map(x=>'<div class="pr1300-row" data-betting-open-row><div class="pr1300-row-main"><b>'+esc(x.label||x.selection||x.event||'Sázka')+(x.odds?' @ '+Number(x.odds).toFixed(2):'')+'</b><small>'+esc(x.event||'')+' · '+esc(x.market||'')+'</small></div><div class="os1334-bet-stake"><b>'+money(x.stakeCzk||0)+'</b><small>'+(x.units?esc(x.units+'u'):'OPEN')+'</small></div></div>').join('')}

export function renderBettingOverview(){
 const host=document.querySelector('#bettingView');if(!host)return false;if(host.dataset.productAdvanced==='1')return true;
 const d=data(),hasBankroll=d.bankrollCzk>0,hasHistory=d.settled.length>0,risk=hasBankroll&&d.exposure>d.bankrollCzk*.2,unknownRisk=d.exposure>0&&!hasBankroll,largest=d.open[0]||null,riskPct=hasBankroll?d.exposure/d.bankrollCzk*100:null,master=d.master;
 const statusTone=risk||unknownRisk?'warn':'good';
 const riskCopy=unknownRisk?'Máš otevřenou expozici, ale bankroll není nastavený. Poměr rizika proto nejde poctivě vyhodnotit.':risk?'Expozice je vyšší než 20 % uloženého bankrollu. Další vstup nejdřív zkontroluj.':d.exposure?'Otevřená expozice podle uloženého bankrollu není mimo běžný rámec.':'Teď nemáš žádnou otevřenou expozici.';
 const context='<section class="pr1300-panel os1334-context-panel os1334-betting-context"><div class="pr1300-panel-head"><div><h2>Rámec rizika</h2><span>bez modelových doporučení</span></div><button class="pr1300-btn" type="button" data-betting-advanced>Scanner a detail</button></div><div class="os1334-mini-grid"><span><small>Bankroll</small><b>'+(hasBankroll?money(d.bankrollCzk):'nenastaven')+'</b></span><span><small>Expozice / bankroll</small><b>'+(riskPct===null?'—':riskPct.toFixed(1).replace('.',',')+' %')+'</b></span><span><small>Největší pozice</small><b>'+(largest?money(largest.stakeCzk||0):'—')+'</b></span><span><small>Otevřené sázky</small><b>'+d.open.length+'</b></span></div></section>';
 host.innerHTML='<div class="pr1300-shell" data-betting-overview data-decision-surface1334>' +
 '<div class="pr1300-head"><div><div class="pr1300-kicker">Sázení</div><h1>Aktuální portfolio sázek.</h1><p>'+(master?'Master potvrzen 23. 9. 2026 · '+master.ticketCount+' tiketů agregovaných do '+master.positionCount+' pozic.':'Všechny otevřené sázky jsou vidět přímo. Scanner, modely a historie zůstávají až v detailu.')+'</p></div><span class="pr1300-status '+statusTone+'">'+(master?master.positionCount+' pozic':d.open.length+' otevřených')+'</span></div>' +
 '<div class="os1334-decision-grid os1334-betting-grid"><section class="pr1320-now os1334-primary"><div><div class="pr1300-kicker">Expozice</div><h2>'+money(d.exposure)+'</h2><p>'+riskCopy+'</p></div><div class="pr1320-now-actions"><button class="pr1300-btn primary" type="button" data-betting-advanced>Otevřít detail sázek</button></div></section>'+context+'</div>' +
 '<div class="pr1320-meta os1334-history-meta">'+(master?'<span>Vsazeno: '+money(master.totalStakedCzk)+'</span><span>Pot. výplata: '+money(master.potentialPayoutCzk)+'</span><span>Zbývá dosázet: '+money(master.remainingToPlaceCzk)+'</span>':'<span>Profit: '+(hasHistory?money(d.profit):'—')+'</span><span>ROI: '+(hasHistory?d.roi.toFixed(1).replace('.',',')+' %':'—')+'</span><span>Win rate: '+(hasHistory?d.winRate.toFixed(1).replace('.',',')+' %':'—')+'</span>')+'</div>' +
 (master?'<div class="pr1320-meta os1335-category-meta"><span>Evropské poháry: '+money(master.categoryTotals?.["Evropské poháry"]||0)+'</span><span>Domácí liga: '+money(master.categoryTotals?.["Domácí liga"]||0)+'</span><span>Liga národů: '+money(master.categoryTotals?.["Liga národů"]||0)+'</span></div>':'')' +
 (d.open.length?'<section class="pr1300-panel os1334-open-bets"><div class="pr1300-panel-head"><h2>Otevřené sázky</h2><span>všech '+d.open.length+' · '+money(d.exposure)+'</span></div>'+rows(d.open)+'</section>':'<section class="pr1300-panel pr1330-betting-clear"><div class="pr1300-panel-head"><h2>Bez otevřených sázek</h2><span>expozice 0 Kč</span></div><div class="pr1300-empty">Teď není nic ve hře. Historii a scanner otevřeš jen pokud je potřebuješ.</div></section>') +
 '<div class="pr1300-actions"><button class="pr1300-btn" type="button" data-betting-task>＋ Úkol k sázení</button></div></div>';
 if(!host.dataset.bettingOverviewBound){host.dataset.bettingOverviewBound='1';ownEvent1100(OWNER,host,'click',async e=>{if(e.target.closest('[data-betting-task]')){window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'task'}));return}if(e.target.closest('[data-betting-advanced]')){host.dataset.productAdvanced='1';await loadProductAdvancedStyles(["./globalFintech137.css"]);const m=await import('./bettingAdvanced527.js');await m.renderBettingPage527?.()}})}
 window.__KAMIL_BETTING_OVERVIEW__={healthy:true,open:d.open.length,renderedOpen:d.open.length,exposure:d.exposure,profit:d.profit,hasBankroll,hasHistory,riskUnknown:unknownRisk,masterId:store.get()?.bettingLedger?.masterId||null,ticketCount:master?.ticketCount||d.open.length,positionCount:master?.positionCount||d.open.length,decisionSurface:1335,at:Date.now()};return true;
}
