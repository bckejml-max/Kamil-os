import {store} from './state.js';
import {h,modal} from './utils.js';
import {ownEvent1100} from './runtimeOwnership1100.js';
import {ensurePersonalVault640,personalVault640} from './personalVault640.js';
import {personalDaysTo650} from './personalDate650.js';
import {insuranceCenter} from './insurance25.js';
import {openVaultRecord640,addSourceInbox650} from './personalDocuments640.js';
import {buildActionTruth741} from './actionTruthEngine.js';

const OWNER='documents.page1500';
async function openMoreFocus610(focus){
 if(focus==='insurance'){const host=document.querySelector('#moreView');if(host)host.dataset.productAdvanced='1';const m=await import('./insuranceUi25.js');m.renderInsurance25?.();return true}
 if(focus==='upgrades2050'){const m=await import('./osUpgrades2050.js');m.renderUpgradeCenter2050?.();return true}
 if(focus==='automation2100'){const m=await import('./osAutomation2100.js');m.renderAutomationCenter2100?.();return true}
 if(focus==='execution2200'){const m=await import('./osExecution2200.js');m.renderExecutionCenter2200?.();return true}
 if(focus==='portfolio2300'){const m=await import('./osPortfolio2300.js');m.renderPortfolioCenter2300?.();return true}
 if(focus==='strategy2400'){const m=await import('./osStrategy2400.js');m.renderStrategyCenter2400?.();return true}
 return false
}
const typeLabel=v=>v.recordType==='insurance'?'Pojištění':v.recordType==='utility'?'Smlouva / energie':v.recordType==='mortgage'?'Hypotéka':v.recordType==='bank-data'?'Bankovní data':v.recordType==='property'?'Nemovitost':'Dokument';
const date=v=>v?new Date(v).toLocaleDateString('cs-CZ'):'—';
const validity=v=>v.validUntil?`do ${date(v.validUntil)}`:v.noticeBy?`rozhodnout do ${date(v.noticeBy)}`:v.reviewAt?`kontrola ${date(v.reviewAt)}`:v.asOf?`stav k ${date(v.asOf)}`:'bez známého termínu';
const daysTo=v=>personalDaysTo650(v.noticeBy||v.validUntil||v.reviewAt||null);
const archived=v=>['ARCHIVED','CLOSED','DONE','RESOLVED'].includes(String(v.status?.code||v.status?.label||'').toUpperCase());
const bucket=v=>archived(v)?'archive':v.status?.severity>0?'action':daysTo(v)!==null&&daysTo(v)>=0&&daysTo(v)<=90?'ending':'valid';
const urgency=(a,b)=>Number(b.status?.severity||0)-Number(a.status?.severity||0)||(daysTo(a)??99999)-(daysTo(b)??99999)||String(a.title||'').localeCompare(String(b.title||''),'cs');
function data(){
 ensurePersonalVault640();const s=store.get(),vault=personalVault640(s),records=[...vault.records].sort(urgency),insurance=insuranceCenter(s),counts={action:0,ending:0,valid:0,archive:0};records.forEach(x=>counts[bucket(x)]++);
 const top=records.filter(x=>['action','ending'].includes(bucket(x))),refs=records.reduce((n,x)=>n+(Array.isArray(x.attachments)?x.attachments.length:0),0),insuranceAction=[...(insurance.actions||[])].sort((a,b)=>Number(b.priority||0)-Number(a.priority||0));
 const vaultPrimary=top[0]||null,ins=insuranceAction[0]||null,insurancePrimary=ins?{source:'insurance',id:ins.id,title:ins.title,nextAction:ins.issues?.[0]||'Otevřít pojištění.',lifecycleLabel:ins.lifecycleLabel,severity:Number(ins.priority||0)}:null,primary=insurancePrimary&&insurancePrimary.severity>=Number(vaultPrimary?.status?.severity||0)?insurancePrimary:vaultPrimary;
 const actionTotal=counts.action+insuranceAction.length;
 return {s,vault,records,insurance,counts,top,refs,insuranceAction,actionTotal,primary};
}
const tone=v=>Number(v.status?.severity||0)>0?'bad':bucket(v)==='ending'?'warn':'good';
const primaryDetail=p=>p?.source==='insurance'?`${p.lifecycleLabel||'Pojištění'} · ${p.nextAction||'Zkontrolovat pojistku.'}`:p?`${validity(p)} · ${p.nextAction||'Zkontrolovat dokument.'}`:'';
const rows=records=>records.length?records.map(v=>`<button type="button" class="pr1300-row pr1300-clickrow" data-doc1500-record="${h(v.id)}"><div class="pr1300-row-main"><b>${h(v.title)}</b><small>${h(typeLabel(v))} · ${h(validity(v))} · ${h(v.nextAction||'bez další akce')}</small></div><div class="pr1300-row-side ${tone(v)}">${h(v.status?.label||bucket(v))} <span class="os1500-row-arrow">→</span></div></button>`).join(''):'<div class="os1500-empty">Zatím tu nejsou uložené smlouvy ani dokumenty.</div>';

export function renderDocumentsPage141(){
 const host=document.querySelector('#moreView');if(!host)return false;const d=data(),p=d.primary,truth=buildActionTruth741(d.s),insTruth=truth.domains.insuranceTruth,trash=Array.isArray(d.s.trash?.items)?d.s.trash.items:[],hasPrivateData=d.records.length>0||d.insurance.all.length>0;
 const summaryBlock=hasPrivateData?`<div class="os1500-summary-grid"><div class="os1500-summary"><span>Řešit</span><b>${d.actionTotal}</b></div><div class="os1500-summary"><span>Do 90 dní</span><b>${d.counts.ending}</b></div><div class="os1500-summary"><span>Platné</span><b>${d.counts.valid}</b></div><div class="os1500-summary"><span>Archiv</span><b>${d.counts.archive}</b></div></div>`:'';
 const radarBlock=insTruth.matrix.length||insTruth.radar.length?`<section class="pr1300-panel os741-insurance-radar"><div class="pr1300-panel-head"><div><h2>Pojištění · radar 90 dní</h2><span>${insTruth.radar.length} termínů · ${insTruth.matrix.filter(x=>x.verified).length}/${insTruth.matrix.length} potvrzených zdrojů</span></div><button class="pr1300-btn" type="button" id="insurance25Radar">Detail →</button></div><div class="os741-radar-grid">${insTruth.radar.slice(0,6).map(x=>`<div><b>${h(x.title)}</b><small>${h(x.provider||'—')} · ${x.days===0?'dnes':'za '+x.days+' d'} · ${h(x.sourceStatus||'UNKNOWN')}</small></div>`).join('')||'<div class="os1500-empty">Do 90 dní není známý pojistný termín.</div>'}</div></section>`:'';
 host.innerHTML=`<div class="pr1300-shell" data-documents-page1500>
  <div class="pr1300-head"><div><div class="pr1300-kicker">Dokumenty</div><h1>Smlouvy, pojistky a důležité údaje.</h1><p>Co vyžaduje akci je nahoře. Soukromá data se objeví až z tohoto zařízení nebo připojeného cloudu.</p></div><span class="pr1300-status ${d.actionTotal?'bad':d.counts.ending?'warn':'good'}">${!hasPrivateData?'připraveno':d.actionTotal?d.actionTotal+' řešit':d.counts.ending?d.counts.ending+' končí':'klid'}</span></div>
  <section class="pr1320-now"><div><div class="pr1300-kicker">Teď</div><h2>${h(p?.title||(hasPrivateData?'Dokumenty jsou bez akutního problému.':'Dokumenty čekají na soukromá data.'))}</h2><p>${h(p?primaryDetail(p):hasPrivateData?'Žádná smlouva nebo pojistka teď nevyžaduje okamžitý zásah.':'Přidej první zdroj nebo otevři Pojištění. Ve veřejném balíku nejsou žádná osobní čísla ani smlouvy.')}</p></div><div class="pr1320-now-actions">${p?`<button class="pr1300-btn primary" type="button" data-doc1500-primary>Vyřešit teď →</button><button class="pr1300-btn" type="button" id="documentInbox650">＋ Přidat zdroj</button>`:`<button class="pr1300-btn primary" type="button" id="documentInbox650">＋ Přidat zdroj</button>`}</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><div><h2>Pojištění</h2><span>${d.insurance.active} aktivní · ${d.insurance.review} ověřit · ${d.insurance.terminating} ukončované</span></div><button class="pr1300-btn primary" type="button" id="insurance25Tile">Otevřít pojištění →</button></div><div class="os1500-section-note">Aktivní smlouvy, nové smlouvy, ukončování, nabídky a historie jsou v jednom soukromém přehledu.</div></section>
  ${summaryBlock}
  <section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Všechny dokumenty a údaje</h2><span>${d.records.length} záznamů · ${d.refs} zdrojů</span></div><div class="os1500-direct-list">${rows(d.records)}</div></section>
  ${radarBlock}
  <section class="pr1300-panel os741-backup-health"><div class="pr1300-panel-head"><div><h2>Datová integrita</h2><span>${truth.backupHealth.stateValid?'stav je v pořádku':'stav potřebuje kontrolu'}</span></div></div><div class="os1500-summary-grid"><div class="os1500-summary"><span>Připojené zdroje</span><b>${truth.counts.connected}</b></div><div class="os1500-summary ${truth.counts.stale?'warn':''}"><span>Potřebují obnovit</span><b>${truth.counts.stale}</b></div><div class="os1500-summary ${truth.counts.conflicts?'bad':''}"><span>Konflikty</span><b>${truth.counts.conflicts}</b></div><div class="os1500-summary"><span>Koš</span><b>${trash.length}</b></div></div>${truth.counts.missing?`<div class="os1500-section-note">${truth.counts.missing} zdrojů zatím není připojených. To není chyba ani zastaralý údaj.</div>`:''}</section>
  ${trash.length?'<section class="pr1300-panel os741-trash"><div class="pr1300-panel-head"><div><h2>Koš · 30 dní</h2><span>'+trash.length+' obnovitelných záznamů</span></div></div><div class="os1500-direct-list">'+trash.slice(0,10).map(x=>'<div class="pr1300-row"><div class="pr1300-row-main"><b>'+h(x.value?.title||x.value?.name||x.sourceId||'Záznam')+'</b><small>'+h(x.sourcePath)+' · '+date(x.deletedAt)+'</small></div><div class="pr1300-row-side"><button class="pr1300-btn" type="button" data-doc741-restore="'+h(x.id)+'">Obnovit</button></div></div>').join('')+'</div></section>':''}
  <details class="os1500-advanced-tools" data-doc1500-advanced>
   <summary><div><b>Pokročilé nástroje OS</b><span>Technické vrstvy a interní moduly. Pro běžnou práci je nepotřebuješ.</span></div><em>Rozbalit</em></summary>
   <div class="os1500-advanced-body">
  <section class="pr1300-panel"><div class="pr1300-panel-head"><div><h2>OS Intelligence</h2><span>50 aktivních upgrade modulů</span></div><button class="pr1300-btn primary" type="button" data-doc1500-upgrades>Otevřít 50 upgradeů →</button></div><div class="os1500-section-note">Jedna intelligence vrstva nad úkoly, penězi, realitami, tickety, prací a datovou kvalitou.</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><div><h2>Repo debt dashboard</h2><span>velikost repa, testy, guardy a legacy názvy</span></div><button class="pr1300-btn" type="button" data-doc741-repo-health>Otevřít stav repa →</button></div><div class="os1500-section-note">Interní technický přehled. Nemíchá se do každodenních úkolů ani osobních dat.</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><div><h2>OS Automation & Learning</h2><span>Dalších 50 automatizačních modulů</span></div><button class="pr1300-btn primary" type="button" data-doc1500-automation>Otevřít dalších 50 →</button></div><div class="os1500-section-note">SLA, rozhodovací historie, provenance dat, scénáře, plánování kapacity, alert policy a samoúdržba.</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><div><h2>OS Execution & Governance</h2><span>Třetích 50 modulů · 101–150</span></div><button class="pr1300-btn primary" type="button" data-doc1500-execution>Otevřít třetích 50 →</button></div><div class="os1500-section-note">Execution, forecasty, knowledge graph, komunikace a bezpečná autonomie s dry-run + kill switchem.</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><div><h2>OS Portfolio & Resilience</h2><span>Čtvrtých 50 modulů · 151–200</span></div><button class="pr1300-btn primary" type="button" data-doc1500-portfolio>Otevřít čtvrtých 50 →</button></div><div class="os1500-section-note">Capital allocation, odolnost, protistrany, compliance a meta-optimalizace OS.</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><div><h2>OS Strategy & Horizon</h2><span>Pátých 50 modulů · 201–250</span></div><button class="pr1300-btn primary" type="button" data-doc1500-strategy>Otevřít pátých 50 →</button></div><div class="os1500-section-note">Cíle, rozhodovací portfolio, drift, UX intelligence a dlouhodobé plánování.</div></section>   </div>
  </details>
  <div class="os1500-section-note">${d.s.meta?.cloudMode==='cloud'?'Osobní metadata jsou synchronizovaná s cloudem.':'Data jsou zatím jen na tomto zařízení.'}</div>
 </div>`;
 host.__documents1500=d;
 if(!host.dataset.documents1500Bound){host.dataset.documents1500Bound='1';ownEvent1100(OWNER,window,'kamil:focus610',async e=>{if(e.detail?.target==='more'&&e.detail?.focus){if(window.__KAMIL_PENDING_FOCUS610__?.target==='more')delete window.__KAMIL_PENDING_FOCUS610__;await openMoreFocus610(e.detail.focus)}});ownEvent1100(OWNER,host,'click',async e=>{
  const cur=host.__documents1500||data();
  if(e.target.closest('[data-doc741-repo-health]')){try{const m=await import('./repoHealth.js'),x=m.repoHealthSummary741(await m.loadRepoHealth741());await modal('Repo debt dashboard',`<div class="card"><div class="eyebrow">OS 745 · TECHNICKÝ STAV</div><div class="row"><span>Soubory</span><b>${x.files}</b></div><div class="row"><span>JS + MJS</span><b>${x.runtime}</b></div><div class="row"><span>CSS</span><b>${x.css}</b></div><div class="row"><span>E2E</span><b>${x.e2e}</b></div><div class="row"><span>Guardy</span><b>${x.guards}</b></div><div class="row"><span>Legacy číslované runtime soubory</span><b>${x.numbered}</b></div><div class="row"><span>Canonical CSS</span><b>${x.canonicalCssKb} kB</b></div></div>`,[{label:'Zavřít',value:null,primary:true}])}catch(error){console.warn('[repo-health741]',error)}return}
  if(e.target.closest('[data-doc1500-upgrades]')){const m=await import('./osUpgrades2050.js');m.renderUpgradeCenter2050?.();return}
  if(e.target.closest('[data-doc1500-automation]')){const m=await import('./osAutomation2100.js');m.renderAutomationCenter2100?.();return}
  if(e.target.closest('[data-doc1500-execution]')){const m=await import('./osExecution2200.js');m.renderExecutionCenter2200?.();return}
  if(e.target.closest('[data-doc1500-portfolio]')){const m=await import('./osPortfolio2300.js');m.renderPortfolioCenter2300?.();return}
  if(e.target.closest('[data-doc1500-strategy]')){const m=await import('./osStrategy2400.js');m.renderStrategyCenter2400?.();return}
  if(e.target.closest('#insurance25Tile')||e.target.closest('#insurance25Radar')){await openMoreFocus610('insurance');return}
  const restore=e.target.closest('[data-doc741-restore]');if(restore){if(store.restoreTrash(restore.dataset.doc741Restore))return renderDocumentsPage141();return}
  if(e.target.closest('#documentInbox650')){await addSourceInbox650(cur.records);return renderDocumentsPage141()}
  if(e.target.closest('[data-doc1500-primary]')&&cur.primary){if(cur.primary.source==='insurance'){await openMoreFocus610('insurance');return}await openVaultRecord640(cur.primary.id);return renderDocumentsPage141()}
  const rb=e.target.closest('[data-doc1500-record]');if(rb){await openVaultRecord640(rb.dataset.doc1500Record);return renderDocumentsPage141()}
 })}
 window.__KAMIL_DOCUMENTS141__={healthy:true,core:'os1500',records:d.records.length,action:d.actionTotal,insuranceAction:d.insuranceAction.length,ending:d.counts.ending,refs:d.refs,primarySource:d.primary?.source||'vault',insuranceRadar:insTruth.radar.length,trash:trash.length,stale:truth.counts.stale,missing:truth.counts.missing,connected:truth.counts.connected,conflicts:truth.counts.conflicts,at:Date.now()};
 const pending=window.__KAMIL_PENDING_FOCUS610__;
 if(pending?.target==='more'&&pending.focus){
  delete window.__KAMIL_PENDING_FOCUS610__;
  void openMoreFocus610(pending.focus);
 }
 return true;
}