import {store} from './state.js';
import {h,qs,modal,toast} from './utils.js';
import {ensurePersonalVault640,personalVault640,personalVaultRecord640,confirmVaultRecord640} from './personalVault640.js';
import {openVaultEdit641} from './personalVaultEdit641.js';

const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const date=v=>v?new Date(v).toLocaleDateString('cs-CZ'):'—';
const typeLabel=v=>v.recordType==='insurance'?'Pojištění':v.recordType==='utility'?'Smlouva / energie':v.recordType==='mortgage'?'Hypotéka':v.recordType==='bank-data'?'Bankovní data':v.recordType==='property'?'Nemovitost':'Dokument';
const amountLabel=v=>v.monthlyAmount?`${money(v.monthlyAmount)}/měs.`:v.annualAmount?`${money(v.annualAmount)}/rok`:v.balance?money(v.balance):'částka není známá';
const validityLabel=v=>v.validUntil?`do ${date(v.validUntil)}`:v.noticeBy?`rozhodnout do ${date(v.noticeBy)}`:v.reviewAt?`kontrola ${date(v.reviewAt)}`:v.asOf?`stav k ${date(v.asOf)}`:'bez známého termínu';
const row=v=>`<article class="ux64-doc"><div class="ux64-doc-main"><div class="ux64-contract-head"><div><span class="ux64-type">${typeLabel(v)}</span><h2>${h(v.title)}</h2></div><span class="ux64-status">${h(v.status.label)}</span></div><div class="ux64-facts"><span><b>Částka:</b> ${h(amountLabel(v))}</span><span><b>Platnost:</b> ${h(validityLabel(v))}</span></div><p>${h(v.status.detail)}</p><div class="ux64-next"><b>Co dál:</b> ${h(v.nextAction)}</div><div class="muted">Zdroj: ${h(v.sourceLabel||'neuveden')}</div></div><button class="btn" data-vault-record="${h(v.id)}">Spravovat</button></article>`;

export async function openVaultRecord640(id){
 const v=personalVaultRecord640(id);if(!v)return null;
 const body=`<div class="card"><div class="eyebrow">${h(typeLabel(v))}</div><h2>${h(v.title)}</h2><div class="row"><span>Stav</span><b>${h(v.status.label)}</b></div><div class="row"><span>Jistota údajů</span><b>${v.status.effectiveConfidence}%</b></div>${v.provider?`<div class="row"><span>Poskytovatel</span><b>${h(v.provider)}</b></div>`:''}${v.monthlyAmount?`<div class="row"><span>Částka</span><b>${money(v.monthlyAmount)}/měs.</b></div>`:''}${v.annualAmount?`<div class="row"><span>Částka</span><b>${money(v.annualAmount)}/rok</b></div>`:''}${v.balance?`<div class="row"><span>Poslední známá hodnota</span><b>${money(v.balance)}</b></div>`:''}${v.validUntil?`<div class="row"><span>Platnost / konec</span><b>${date(v.validUntil)}</b></div>`:''}${v.noticeBy?`<div class="row"><span>Rozhodnout nejpozději</span><b>${date(v.noticeBy)}</b></div>`:''}<div class="decision-note"><b>Co dál:</b> ${h(v.nextAction)}</div><p class="muted">Zdroj: ${h(v.sourceLabel||'neuveden')}</p></div>`;
 const actions=[{label:'Upravit údaje',value:'edit'},{label:'Mám aktuální doklad / údaj — potvrdit',value:'confirm',primary:!!v.status.severity},{label:'Zavřít',value:null,primary:!v.status.severity}];
 const choice=await modal('Dokument a data',body,actions);
 if(choice==='edit'){await openVaultEdit641(id);return 'edited'}
 if(choice==='confirm'){confirmVaultRecord640(id);toast('Údaj potvrzen a uložen mezi osobní data.');return 'confirmed'}
 return choice;
}

export function renderPersonalDocuments640(){
 ensurePersonalVault640();const s=store.get(),v=personalVault640(s),host=qs('#moreView');if(!host)return;
 const records=[...v.records].sort((a,b)=>b.status.severity-a.status.severity||a.title.localeCompare(b.title,'cs'));
 host.innerHTML=`<div class="ux64-page"><div class="view-head"><div><div class="eyebrow">DOKUMENTY A DATA</div><h1>Smlouvy, pojistky a důležité údaje</h1><p>Vidíš stav, zdroj a další krok. Hodnoty můžeš rovnou opravit nebo aktualizovat.</p></div></div><div class="metric-strip"><div class="metric"><span>Pokrytí osobních dat</span><b>${v.coverage}%</b></div><div class="metric"><span>K ověření / aktualizaci</span><b>${v.action.length}</b></div><div class="metric"><span>Uložených záznamů</span><b>${v.records.length}</b></div><div class="metric"><span>Cloud</span><b>${s.meta?.cloudMode==='cloud'?'Připojen':'Lokálně'}</b></div></div>
 <section class="ux64-doc-list">${records.map(row).join('')}</section><div class="decision-note">Změny jsou vratné přes Undo, zapisují se do auditu a při připojeném cloudu se synchronizují s ostatními osobními údaji.</div></div>`;
 host.querySelectorAll('[data-vault-record]').forEach(b=>b.addEventListener('click',async()=>{await openVaultRecord640(b.dataset.vaultRecord);renderPersonalDocuments640()}));
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_UX_641_LAST__={at:Date.now(),view:'documents',coverage:v.coverage,records:v.records.length,action:v.action.length};
}
