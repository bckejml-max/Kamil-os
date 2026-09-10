import {installRuntimeOwnership1100,ownEvent1100} from './runtimeOwnership1100.js';

const OWNER='core.decision-focus2020';
const VERSION='2040.0.0';
let bound=false;

function ensureLink(key,href){
 if(document.querySelector(`link[data-${key}]`))return;
 const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.setAttribute(`data-${key}`,'1');document.head.appendChild(link);
}
function ensureStyles(view){
 ensureLink('os2020-css','./os2020.css');
 if(view==='tickets')ensureLink('os2040-css','./os2040.css');
}
function hostFor(view){
 return view==='tickets'?document.querySelector('#ticketIntelView'):view==='betting'?document.querySelector('#bettingView'):null;
}
function labelFor(view){return view==='tickets'?'Vstupenky':'Sázení'}
function ticketSummary(host){
 const values=[...host.querySelectorAll('.ticket640-kpis>.ticket640-kpi')].slice(0,4).map(node=>({label:node.querySelector('span')?.textContent?.trim()||'',value:node.querySelector('b')?.textContent?.trim()||'0'}));
 const map=Object.fromEntries(values.map(x=>[x.label,x.value]));
 if(!values.length)return'Vstupenky · zobrazím jen věci, které dnes vyžadují rozhodnutí';
 return `${map['KOUPIT DNES']||'0'} koupit · ${map['ZLEVNIT']||'0'} zlevnit · ${map['PRODAT']||'0'} prodat · cash ${map['VOLNÁ HOTOVOST']||'—'}`;
}
function descriptionFor(view,host){return view==='tickets'?ticketSummary(host):'Sázení · zobrazuju jen bankroll, expozici, P/L, ROI a akční frontu'}
function ensureBar(view,host){
 let bar=host?.querySelector(':scope > [data-os2020-focusbar]');
 if(!host)return null;
 if(!bar){bar=document.createElement('div');bar.dataset.os2020Focusbar='1';bar.className='os2020-focusbar';bar.innerHTML='<div><b>Rozhodovací režim</b><span data-os2020-summary></span></div><button type="button" class="os2020-advanced-btn" data-os2020-toggle aria-expanded="false">Pokročilé</button>';host.prepend(bar)}
 const summary=bar.querySelector('[data-os2020-summary]');if(summary)summary.textContent=descriptionFor(view,host);
 return bar;
}
function syncButton(host){
 const open=host?.classList.contains('os2020-advanced');
 const btn=host?.querySelector('[data-os2020-toggle]');
 if(btn){btn.setAttribute('aria-expanded',open?'true':'false');btn.textContent=open?'Skrýt pokročilé':'Pokročilé'}
}
function apply(view){
 const host=hostFor(view);if(!host)return false;
 ensureStyles(view);host.classList.add('os2020-focused');ensureBar(view,host);syncButton(host);
 document.documentElement.dataset.os2020=view;
 return true;
}
function toggle(button){
 const host=button?.closest('#ticketIntelView,#bettingView');if(!host)return;
 host.classList.toggle('os2020-advanced');syncButton(host);
}
export function applyDecisionFocus2020(view='today'){
 installRuntimeOwnership1100();
 if(!bound){
  bound=true;
  ownEvent1100(OWNER,document,'click',event=>{const button=event.target?.closest?.('[data-os2020-toggle]');if(button)toggle(button)});
 }
 const ok=apply(view);
 window.__KAMIL_DECISION_FOCUS2020__={version:VERSION,healthy:true,view,applied:ok,at:Date.now()};
 return ok;
}
