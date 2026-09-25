import {store} from './state.js';
import {h} from './utils.js';
import {ownEvent1100} from './runtimeOwnership1100.js';
import {ensurePersonalVault640,personalVault640} from './personalVault640.js';
import {personalDaysTo650} from './personalDate650.js';
import {insuranceCenter} from './insurance25.js';
import {openVaultRecord640,addSourceInbox650} from './personalDocuments640.js';

const OWNER='documents.page1500';
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
 const host=document.querySelector('#moreView');if(!host)return false;const d=data(),p=d.primary;
 host.innerHTML=`<div class="pr1300-shell" data-documents-page1500>
  <div class="pr1300-head"><div><div class="pr1300-kicker">Dokumenty</div><h1>Smlouvy, pojistky a důležité údaje.</h1><p>Všechno je na jedné stránce. Co vyžaduje akci je nahoře, platné věci a archiv zůstávají pod tím.</p></div><span class="pr1300-status ${d.actionTotal?'bad':d.counts.ending?'warn':'good'}">${d.actionTotal?d.actionTotal+' řešit':d.counts.ending?d.counts.ending+' končí':'klid'}</span></div>
  <section class="pr1320-now"><div><div class="pr1300-kicker">Teď</div><h2>${h(p?.title||'Dokumenty jsou bez akutního problému.')}</h2><p>${h(p?primaryDetail(p):'Žádná smlouva nebo pojistka teď nevyžaduje okamžitý zásah.')}</p></div><div class="pr1320-now-actions"><button class="pr1300-btn primary" type="button" id="documentInbox650">＋ Přidat zdroj</button>${p?`<button class="pr1300-btn" type="button" data-doc1500-primary>Otevřít →</button>`:''}</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><div><h2>OS Intelligence</h2><span>50 aktivních upgrade modulů</span></div><button class="pr1300-btn primary" type="button" data-doc1500-upgrades>Otevřít 50 upgradeů →</button></div><div class="os1500-section-note">Jedna intelligence vrstva nad úkoly, penězi, realitami, tickety, prací a datovou kvalitou.</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><div><h2>OS Automation & Learning</h2><span>Dalších 50 automatizačních modulů</span></div><button class="pr1300-btn primary" type="button" data-doc1500-automation>Otevřít dalších 50 →</button></div><div class="os1500-section-note">SLA, rozhodovací historie, provenance dat, scénáře, plánování kapacity, alert policy a samoúdržba.</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><div><h2>OS Execution & Governance</h2><span>Třetích 50 modulů · 101–150</span></div><button class="pr1300-btn primary" type="button" data-doc1500-execution>Otevřít třetích 50 →</button></div><div class="os1500-section-note">Execution, forecasty, knowledge graph, komunikace a bezpečná autonomie s dry-run + kill switchem.</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><div><h2>OS Portfolio & Resilience</h2><span>Čtvrtých 50 modulů · 151–200</span></div><button class="pr1300-btn primary" type="button" data-doc1500-portfolio>Otevřít čtvrtých 50 →</button></div><div class="os1500-section-note">Capital allocation, odolnost, protistrany, compliance a meta-optimalizace OS.</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><div><h2>Pojištění</h2><span>${d.insurance.active} aktivní · ${d.insurance.review} ověřit · ${d.insurance.terminating} ukončované</span></div><button class="pr1300-btn primary" type="button" id="insurance25Tile">Otevřít pojištění →</button></div><div class="os1500-section-note">Aktivní smlouvy, nové smlouvy, ukončování, nabídky a historie jsou v jednom specializovaném přehledu.</div></section>
  <div class="os1500-summary-grid"><div class="os1500-summary"><span>Řešit</span><b>${d.actionTotal}</b></div><div class="os1500-summary"><span>Do 90 dní</span><b>${d.counts.ending}</b></div><div class="os1500-summary"><span>Platné</span><b>${d.counts.valid}</b></div><div class="os1500-summary"><span>Archiv</span><b>${d.counts.archive}</b></div></div>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Všechny dokumenty a údaje</h2><span>${d.records.length} záznamů · ${d.refs} zdrojů</span></div><div class="os1500-direct-list">${rows(d.records)}</div></section>
  <div class="os1500-section-note">${d.s.meta?.cloudMode==='cloud'?'Osobní metadata jsou synchronizovaná s cloudem.':'Data jsou zatím jen na tomto zařízení.'}</div>
 </div>`;
 host.__documents1500=d;
 if(!host.dataset.documents1500Bound){host.dataset.documents1500Bound='1';ownEvent1100(OWNER,window,'kamil:focus610',async e=>{if(e.detail?.target==='more'&&e.detail?.focus==='upgrades2050'){const m=await import('./osUpgrades2050.js');m.renderUpgradeCenter2050?.()}if(e.detail?.target==='more'&&e.detail?.focus==='automation2100'){const m=await import('./osAutomation2100.js');m.renderAutomationCenter2100?.()}if(e.detail?.target==='more'&&e.detail?.focus==='execution2200'){const m=await import('./osExecution2200.js');m.renderExecutionCenter2200?.()}if(e.detail?.target==='more'&&e.detail?.focus==='portfolio2300'){const m=await import('./osPortfolio2300.js');m.renderPortfolioCenter2300?.()}});ownEvent1100(OWNER,host,'click',async e=>{
  const cur=host.__documents1500||data();
  if(e.target.closest('[data-doc1500-upgrades]')){const m=await import('./osUpgrades2050.js');m.renderUpgradeCenter2050?.();return}
  if(e.target.closest('[data-doc1500-automation]')){const m=await import('./osAutomation2100.js');m.renderAutomationCenter2100?.();return}
  if(e.target.closest('[data-doc1500-execution]')){const m=await import('./osExecution2200.js');m.renderExecutionCenter2200?.();return}
  if(e.target.closest('[data-doc1500-portfolio]')){const m=await import('./osPortfolio2300.js');m.renderPortfolioCenter2300?.();return}
  if(e.target.closest('#insurance25Tile')){const m=await import('./insuranceUi25.js');m.renderInsurance25?.();return}
  if(e.target.closest('#documentInbox650')){await addSourceInbox650(cur.records);return renderDocumentsPage141()}
  if(e.target.closest('[data-doc1500-primary]')&&cur.primary){if(cur.primary.source==='insurance'){const m=await import('./insuranceUi25.js');m.renderInsurance25?.();return}await openVaultRecord640(cur.primary.id);return renderDocumentsPage141()}
  const rb=e.target.closest('[data-doc1500-record]');if(rb){await openVaultRecord640(rb.dataset.doc1500Record);return renderDocumentsPage141()}
 })}
 window.__KAMIL_DOCUMENTS141__={healthy:true,core:'os1500',records:d.records.length,action:d.actionTotal,insuranceAction:d.insuranceAction.length,ending:d.counts.ending,refs:d.refs,primarySource:d.primary?.source||'vault',at:Date.now()};return true;
}
