import {ownEvent1100,ownObserver1100,schedule1100} from './runtimeOwnership1100.js';
const VERSION='527.0.1';
const OWNER='core.audit527';
const TITLES={today:'DNES',inbox:'INBOX',money:'PENÍZE',tickets:'VSTUPENKY',betting:'SÁZENÍ',family:'RODINA',home:'DOMOV',more:'DOKUMENTY'};
let bound=false,ledgerPromise=null,ledgerInfo=null;
const bettingActive=()=>!!document.querySelector('#view-betting.on,#view-betting.active,[data-view-panel="betting"].on,[data-view-panel="betting"].active');

function ensureCss(){
  if(document.querySelector('link[data-audit525]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=new URL('../audit525.css',import.meta.url).href;
  link.dataset.audit525='1';
  document.head.appendChild(link);
}
function viewFrom(detail){
  const requested=typeof detail==='string'?detail:detail?.view;
  if(requested&&TITLES[requested])return requested;
  const active=document.querySelector('[id^="view-"].on,[id^="view-"].active');
  return active?.id?.replace(/^view-/,'')||null;
}
function syncNav(view){
  if(!view)return;
  document.querySelectorAll('[data-view]').forEach(el=>{
    const active=el.dataset.view===view;
    el.classList.toggle('on',active);
    if(active){if(el.getAttribute('aria-current')!=='page')el.setAttribute('aria-current','page')}else if(el.hasAttribute('aria-current'))el.removeAttribute('aria-current');
  });
}
function syncLocalStatus(){
  const el=document.querySelector('#syncStatus');
  if(!el?.classList.contains('local'))return;
  if(el.onclick)el.onclick=null;if(el.onkeydown)el.onkeydown=null;
  if(el.hasAttribute('role'))el.removeAttribute('role');if(el.hasAttribute('tabindex'))el.removeAttribute('tabindex');
  if(el.style.cursor!=='default')el.style.cursor='default';
  const title='Data jsou uložená na tomto zařízení. Cloudové přihlášení je v osobním režimu skryté.';
  if(el.title!==title)el.title=title;
}
async function loadLedgerInfo(){
  if(!bettingActive())return null;
  if(ledgerInfo)return ledgerInfo;
  if(ledgerPromise)return ledgerPromise;
  ledgerPromise=fetch(`/api/core70-health?source=ledger&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}}).then(async response=>{
    if(!response.ok)throw new Error(`ledger HTTP ${response.status}`);
    const payload=await response.json();
    if(!payload?.ok)throw new Error(payload?.error||'ledger unavailable');
    ledgerInfo=payload.ledger||{};
    return ledgerInfo;
  }).catch(error=>{console.warn('[audit527:ledger]',error);return null}).finally(()=>{ledgerPromise=null});
  return ledgerPromise;
}
function applyBettingTruth(){
  if(!bettingActive())return;
  const host=document.querySelector('#bettingView'),metrics=host?.querySelectorAll('.bet144-metric');
  if(!host||!metrics?.length||!ledgerInfo)return;
  const incomplete=ledgerInfo.priorReportedExposureUnresolved===true;
  const second=metrics[1]?.querySelector('span'),third=metrics[2]?.querySelector('span');
  if(incomplete){
    if(second&&second.textContent!=='Evidováno otevřené')second.textContent='Evidováno otevřené';
    if(third&&third.textContent!=='Možná výplata (evid.)')third.textContent='Možná výplata (evid.)';
    let note=host.querySelector('[data-audit527-ledger]');
    if(!note){
      note=document.createElement('div');note.className='bet144-note';note.dataset.audit527Ledger='1';
      const list=host.querySelector('.bet144-list');(list||host.querySelector('.bet144'))?.insertAdjacentElement(list?'beforebegin':'beforeend',note);
    }
    if(note){
      const text='Datová poznámka: betting ledger zatím není kompletní. Částky nahoře jsou pouze evidované potvrzené otevřené sázky, ne úplná historie ani celkové vsazeno.';
      if(note.textContent!==text)note.textContent=text;
    }
  }else{
    host.querySelector('[data-audit527-ledger]')?.remove();
  }
  if(window.__KAMIL_BETTING_144__){window.__KAMIL_BETTING_144__.ledgerComplete=!incomplete;window.__KAMIL_BETTING_144__.ledgerPersistence=ledgerInfo.persistence||null}
  document.documentElement.dataset.bettingLedger527=incomplete?'partial':'complete';
}
function scheduleBettingTruth(){schedule1100(OWNER,'betting-truth',applyBettingTruth,35,{pauseWhenHidden:true})}
function ensureBettingTruth(){
  if(!bettingActive())return;
  const host=document.querySelector('#bettingView');if(!host)return;
  if(!host.dataset.audit527Observed){host.dataset.audit527Observed='1';ownObserver1100(OWNER,host,{childList:true,subtree:true},scheduleBettingTruth)}
  loadLedgerInfo().then(()=>scheduleBettingTruth());
}
function sync(view=viewFrom(null)){
  const title=TITLES[view];
  const pageTitle=document.querySelector('#pageTitle');
  if(pageTitle&&title&&pageTitle.textContent!==title)pageTitle.textContent=title;
  if(view)syncNav(view);
  syncLocalStatus();
  if(view==='betting')ensureBettingTruth();
  document.documentElement.dataset.audit525='1';
  document.documentElement.dataset.audit526='1';
  document.documentElement.dataset.audit527='1';
  const state={version:VERSION,healthy:true,view,title:title||null,ledgerComplete:ledgerInfo?ledgerInfo.priorReportedExposureUnresolved!==true:null,at:Date.now()};
  window.__KAMIL_AUDIT525__=state;window.__KAMIL_AUDIT526__=state;window.__KAMIL_AUDIT527__=state;
}
function schedule(view){
  queueMicrotask(()=>sync(view||viewFrom(null)));
  schedule1100(OWNER,'sync',()=>sync(view||viewFrom(null)),90,{pauseWhenHidden:true});
}
export function installAudit525(){
  ensureCss();sync();if(bound)return;bound=true;
  ownEvent1100(OWNER,window,'kamil:view-change',event=>schedule(viewFrom(event.detail)));
  ownEvent1100(OWNER,window,'popstate',()=>schedule());
  const title=document.querySelector('#pageTitle');
  if(title)ownObserver1100(OWNER,title,{childList:true,characterData:true,subtree:true},()=>schedule());
  const syncStatus=document.querySelector('#syncStatus');
  if(syncStatus)ownObserver1100(OWNER,syncStatus,{attributes:true,childList:true,subtree:true},()=>syncLocalStatus());
  schedule1100(OWNER,'initial',()=>sync(),350,{pauseWhenHidden:true});
}