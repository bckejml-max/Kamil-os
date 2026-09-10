import {installRuntimeOwnership1100,ownEvent1100} from './runtimeOwnership1100.js';

const OWNER='core.decision-focus2020';
const VERSION='2020.0.0';
let bound=false;

function hostFor(view){
 return view==='tickets'?document.querySelector('#ticketIntelView'):view==='betting'?document.querySelector('#bettingView'):null;
}
function labelFor(view){return view==='tickets'?'Vstupenky':'Sázení'}
function ensureBar(view,host){
 if(!host||host.querySelector(':scope > [data-os2020-focusbar]'))return;
 const bar=document.createElement('div');
 bar.dataset.os2020Focusbar='1';
 bar.className='os2020-focusbar';
 bar.innerHTML=`<div><b>Rozhodovací režim</b><span>${labelFor(view)} · zobrazuju jen to, co potřebuješ k akci</span></div><button type="button" class="os2020-advanced-btn" data-os2020-toggle aria-expanded="false">Pokročilé</button>`;
 host.prepend(bar);
}
function syncButton(host){
 const open=host?.classList.contains('os2020-advanced');
 const btn=host?.querySelector('[data-os2020-toggle]');
 if(btn){btn.setAttribute('aria-expanded',open?'true':'false');btn.textContent=open?'Skrýt pokročilé':'Pokročilé'}
}
function apply(view){
 const host=hostFor(view);if(!host)return false;
 host.classList.add('os2020-focused');
 ensureBar(view,host);syncButton(host);
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
