import {store} from './state.js';
import {h,qs,modal,toast} from './utils.js';
import {ensurePersonalVault640,personalVault640,personalVaultRecord640,confirmVaultRecord640} from './personalVault640.js';
import {openVaultEdit641} from './personalVaultEdit641.js';
import {openDocumentReferences646,createDocumentTaskModal646} from './personalDocumentActions646.js';

const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const date=v=>v?new Date(v).toLocaleDateString('cs-CZ'):'—';
const typeLabel=v=>v.recordType==='insurance'?'Pojištění':v.recordType==='utility'?'Smlouva / energie':v.recordType==='mortgage'?'Hypotéka':v.recordType==='bank-data'?'Bankovní data':v.recordType==='property'?'Nemovitost':'Dokument';
const validityLabel=v=>v.validUntil?`do ${date(v.validUntil)}`:v.noticeBy?`rozhodnout do ${date(v.noticeBy)}`:v.reviewAt?`kontrola ${date(v.reviewAt)}`:v.asOf?`stav k ${date(v.asOf)}`:'bez známého termínu';
const daysTo=v=>{const raw=v.noticeBy||v.validUntil||v.reviewAt||null;if(!raw)return null;const t=Date.parse(raw);return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):null};
const archived=v=>['ARCHIVED','CLOSED','DONE','RESOLVED'].includes(String(v.status?.code||v.status?.label||'').toUpperCase());
const bucket=v=>archived(v)?'archive':v.status?.severity>0?'action':daysTo(v)!==null&&daysTo(v)<=90?'ending':'valid';
const row=v=>`<article class="ux64-doc ux65-doc doc-filter-row" data-doc-bucket="${bucket(v)}"><div class="ux64-doc-main"><div class="ux64-contract-head"><div><span class="ux64-type">${typeLabel(v)}</span><h2>${h(v.title)}</h2></div><span class="ux64-status">${h(v.status.label)}</span></div><div class="muted">${h(validityLabel(v))}</div><div class="ux64-next"><b>Co dál:</b> ${h(v.nextAction)}</div></div><button class="btn ${v.status.severity?'primary':''}" data-vault-record="${h(v.id)}">${v.status.severity?'Vyřešit':'Otevřít'}</button></article>`;

export async function openVaultRecord640(id){
 const v=personalVaultRecord640(id);if(!v)return null;const refs=Array.isArray(v.attachments)?v.attachments.length:0;
 const body=`<div class="card"><div class="eyebrow">${h(typeLabel(v))}</div><h2>${h(v.title)}</h2><div class="row"><span>Stav</span><b>${h(v.status.label)}</b></div><div class="row"><span>Termín / platnost</span><b>${h(validityLabel(v))}</b></div><div class="row"><span>Připojené zdroje</span><b>${refs}</b></div>${v.provider?`<div class="row"><span>Poskytovatel</span><b>${h(v.provider)}</b></div>`:''}${v.monthlyAmount?`<div class="row"><span>Částka</span><b>${money(v.monthlyAmount)}/měs.</b></div>`:''}${v.annualAmount?`<div class="row"><span>Částka</span><b>${money(v.annualAmount)}/rok</b></div>`:''}${v.balance?`<div class="row"><span>Poslední známá hodnota</span><b>${money(v.balance)}</b></div>`:''}<div class="decision-note"><b>Co dál:</b> ${h(v.nextAction)}</div></div>`;
 const actions=[{label:'Zdroje / přílohy',value:'sources'},{label:'Vytvořit úkol',value:'task'},{label:'Upravit údaje',value:'edit'},{label:'Proč tomu Kamil OS věří',value:'why'},{label:'Potvrdit aktuálnost',value:'confirm',primary:!!v.status.severity},{label:'Zavřít',value:null,primary:!v.status.severity}];
 const choice=await modal('Dokument',body,actions);
 if(choice==='sources'){await openDocumentReferences646(id);return 'sources'}if(choice==='task'){await createDocumentTaskModal646(id);return 'task'}if(choice==='edit'){await openVaultEdit641(id);return 'edited'}
 if(choice==='why'){await modal('Zdroj a jistota údaje',`<div class="card"><div class="row"><span>Zdroj</span><b>${h(v.sourceLabel||'neuveden')}</b></div><div class="row"><span>Jistota dat</span><b>${Number(v.status.effectiveConfidence||0)} %</b></div><p class="muted">${h(v.sourceBasis||v.status.detail||'')}</p></div>`,[{label:'Zavřít',value:null,primary:true}]);return 'why'}
 if(choice==='confirm'){confirmVaultRecord640(id);toast('Aktuálnost potvrzena.');return 'confirmed'}return choice;
}

async function addSourceInbox650(records){
 const candidates=[...records].sort((a,b)=>b.status.severity-a.status.severity||Number((a.attachments||[]).length)-Number((b.attachments||[]).length)).slice(0,8);if(!candidates.length)return null;
 const choice=await modal('Přidat dokument / zdroj','<p class="muted">Vyber, ke kterému osobnímu záznamu chceš připojit odkaz nebo referenci na dokument.</p>',[...candidates.map((x,i)=>({label:x.title,value:String(i),primary:i===0&&x.status.severity>0})),{label:'Zavřít',value:null}]);if(choice===null||choice===undefined)return null;const x=candidates[Number(choice)];if(!x)return null;return openDocumentReferences646(x.id);
}

export function renderPersonalDocuments640(){
 ensurePersonalVault640();const s=store.get(),v=personalVault640(s),host=qs('#moreView');if(!host)return;const records=[...v.records].sort((a,b)=>b.status.severity-a.status.severity||a.title.localeCompare(b.title,'cs')),refs=records.reduce((n,x)=>n+(Array.isArray(x.attachments)?x.attachments.length:0),0);
 const counts={action:0,ending:0,valid:0,archive:0};records.forEach(x=>counts[bucket(x)]++);const top=records.filter(x=>bucket(x)==='action'||bucket(x)==='ending').slice(0,3);
 host.innerHTML=`<div class="ux64-page documents-page"><div class="view-head"><div><div class="eyebrow">DOKUMENTY</div><h1>Co je potřeba hlídat</h1><p>Smlouvy, pojistky a důležité údaje. Nejdřív věci k řešení, potom archiv.</p></div><div class="row-actions"><button class="btn primary" id="documentInbox650">+ Přidat dokument / zdroj</button></div></div>
 <section class="document-action-summary ${top.length?'has-issues':''}"><div class="eyebrow">CO ŘEŠIT TEĎ</div>${top.length?top.map((x,i)=>`<div class="document-action-row"><span class="document-action-rank">${i+1}</span><div><b>${h(x.title)}</b><div class="muted">${h(validityLabel(x))} · ${h(x.nextAction)}</div></div></div>`).join(''):'<div class="document-clear"><b>Dokumenty jsou bez akutního problému.</b><span class="muted">Nic teď nevyžaduje zásah.</span></div>'}</section>
 <section class="metric-strip document-metrics"><div class="metric"><span>Řešit</span><b>${counts.action}</b></div><div class="metric"><span>Končí do 90 dní</span><b>${counts.ending}</b></div><div class="metric"><span>Platné / v pořádku</span><b>${counts.valid}</b></div><div class="metric"><span>Archiv</span><b>${counts.archive}</b></div></section>
 <div class="document-filters"><button class="btn on" data-doc-filter="all">Vše</button><button class="btn" data-doc-filter="action">Řešit</button><button class="btn" data-doc-filter="valid">Platné</button><button class="btn" data-doc-filter="ending">Končící</button><button class="btn" data-doc-filter="archive">Archiv</button></div>
 <section class="ux64-doc-list">${records.map(row).join('')}</section><div class="muted ux65-footnote">Připojených zdrojů: ${refs} · ${s.meta?.cloudMode==='cloud'?'osobní metadata jsou synchronizovaná':'data jsou zatím jen na tomto zařízení'}</div></div>`;
 const applyFilter=f=>{host.querySelectorAll('[data-doc-filter]').forEach(b=>b.classList.toggle('on',b.dataset.docFilter===f));host.querySelectorAll('.doc-filter-row').forEach(r=>r.classList.toggle('hidden',f!=='all'&&r.dataset.docBucket!==f));};host.querySelectorAll('[data-doc-filter]').forEach(b=>b.addEventListener('click',()=>applyFilter(b.dataset.docFilter)));
 host.querySelector('#documentInbox650')?.addEventListener('click',async()=>{await addSourceInbox650(records);renderPersonalDocuments640()});host.querySelectorAll('[data-vault-record]').forEach(b=>b.addEventListener('click',async()=>{await openVaultRecord640(b.dataset.vaultRecord);renderPersonalDocuments640()}));
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_DOCUMENTS_650_LAST__={at:Date.now(),records:v.records.length,needsUpdate:v.action.length,refs};
}
