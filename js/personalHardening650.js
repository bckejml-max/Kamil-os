import {qs,qsa} from './utils.js';

const TITLES={today:'DNES',inbox:'INBOX',tickets:'VSTUPENKY',betting:'SÁZENÍ',family:'RODINA',home:'DOMOV',money:'PENÍZE',more:'DOKUMENTY'};
let current='today',bound=false;

function apply(view=current){
 if(TITLES[view])current=view;
 const page=qs('#pageTitle');if(page&&page.textContent!==TITLES[current])page.textContent=TITLES[current];
 qsa('.version').forEach(x=>x.classList.add('hidden'));
 const sub=qs('.sidebar-sub');if(sub&&sub.textContent!=='Osobní asistent')sub.textContent='Osobní asistent';
 document.title='Kamil OS';
}

export function bindPersonalHardening650(){
 if(bound)return;bound=true;
 // Ctrl+N and view-specific capture belong to app.js / viewRuntime41. Older hardening
 // used a capture-phase listener here and silently bypassed the canonical routing.
 window.addEventListener('kamil:view-change',e=>apply(e.detail));
 apply('today');
 if(typeof window!=='undefined'){
  window.__KAMIL_PERSONAL_HARDENING_650__={bound:true,canonicalCapture:true,at:Date.now()};
  window.__KAMIL_PERSONAL_HARDENING_660__={bound:true,at:Date.now(),ticketIntelligence:true};
 }
}

export function personalReleasePreflight650(){
 const text=document?.body?.innerText||'';
 const forbidden=['Personal Home','KAMIL OS 64.1 / DNES','Pokrytí osobních dat'];
 const found=forbidden.filter(x=>text.includes(x));
 const primary=document?.querySelectorAll?.('.ux65-primary')?.length||0;
 const dataHealth=document?.querySelectorAll?.('.ux64-data-health')?.length||0;
 const navViews=new Set([...document?.querySelectorAll?.('[data-view]')||[]].map(x=>x.dataset.view));
 const missingViews=Object.keys(TITLES).filter(view=>!navViews.has(view));
 return{ok:found.length===0&&primary<=1&&dataHealth===0&&missingViews.length===0,found,missingViews,primaryCards:primary,dataHealthCards:dataHealth,views:Object.values(TITLES),assistant:'527.0'};
}
