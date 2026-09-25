import {store} from './state.js';
import {h} from './utils.js';
import {ownEvent1100} from './runtimeOwnership1100.js';
import {ensurePersonalVault640,personalVault640} from './personalVault640.js';
import {editHomeRecord644,openMaintenance644} from './personalFamilyHomeActions644.js';
import {personalHomeTimeline650} from './personalAssistant650.js';
import {isPersonalScope527} from './personalScope527.js';
import {openPersonalCapture643} from './personalCapture643.js';

const OWNER='home.page1500';
const maintRe=/servis|reviz|filtr|čerpad|cerpad|rekuper|klima|kom[ií]n|zahrad|oprava|údržb|udrzb|stk/i;
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED']);
const date=v=>v?new Date(v).toLocaleDateString('cs-CZ'):'—';
const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
function data(){
 ensurePersonalVault640();const s=store.get(),vault=personalVault640(s),records=vault.records.filter(x=>x.section==='home'),timeline=personalHomeTimeline650(s);
 const maintenance=[...(s.personalAdmin?.items||[]).map(x=>({item:x,source:'admin'})),...(s.tasks||[]).map(x=>({item:x,source:'task'}))].filter(({item:x})=>!CLOSED.has(String(x?.status||'').toUpperCase())&&isPersonalScope527(x)&&maintRe.test(`${x.title||''} ${x.name||''} ${x.category||''}`));
 const urgent=timeline.filter(x=>x.days!==null&&x.days!==undefined&&x.days<=30).sort((a,b)=>a.days-b.days),primary=urgent[0]||null;
 return {s,records,timeline,maintenance,urgent,primary,overdue:timeline.filter(x=>x.days!==null&&x.days!==undefined&&x.days<0).length,next90:timeline.filter(x=>x.days!==null&&x.days!==undefined&&x.days>=0&&x.days<=90).length};
}
const timelineRows=rows=>rows.length?rows.slice(0,10).map(x=>`<div class="pr1300-row"><div class="pr1300-row-main"><b>${h(x.title)}</b><small>${h(x.kind==='maintenance'?'Údržba / servis':'Smlouva / termín')}</small></div><div class="pr1300-row-side ${x.days<0?'bad':x.days<=14?'warn':''}">${x.days===null||x.days===undefined?'bez termínu':x.days<0?`${Math.abs(x.days)} d po termínu`:x.days===0?'dnes':x.days===1?'zítra':`za ${x.days} d`}</div></div>`).join(''):'<div class="os1500-empty">V příštích 12 měsících není uložený známý termín kolem domova.</div>';
const recordRows=rows=>rows.length?rows.map((x,i)=>`<button type="button" class="os1500-record" data-home1500-record="${i}"><span>${h(x.recordType==='insurance'?'Pojištění':x.recordType==='utility'?'Energie':x.recordType==='property'?'Nemovitost':'Domov')}</span><b>${h(x.title)}</b><small>${x.monthlyAmount?money(x.monthlyAmount)+'/měs. · ':x.annualAmount?money(x.annualAmount)+'/rok · ':''}${h(x.nextAction||'Otevřít a zkontrolovat')}</small></button>`).join(''):'<div class="os1500-empty">Zatím nejsou uložené smlouvy ani údaje k domovu.</div>';
const maintenanceRows=rows=>rows.length?rows.slice(0,10).map((x,i)=>`<button type="button" class="pr1300-row pr1300-clickrow" data-home1500-maintenance="${i}"><div class="pr1300-row-main"><b>${h(x.item.title||x.item.name||'Údržba')}</b><small>${h(x.item.due||x.item.nextAt||x.item.deadline||'bez termínu')}</small></div><div class="pr1300-row-side">řešit <span class="os1500-row-arrow">→</span></div></button>`).join(''):'<div class="os1500-empty">Teď není evidovaná žádná údržba k řešení.</div>';

export function renderHomePage140(){
 const host=document.querySelector('#homeView');if(!host)return false;const d=data(),p=d.primary;
 host.innerHTML=`<div class="pr1300-shell" data-home-page1500>
  <div class="pr1300-head"><div><div class="pr1300-kicker">Domov</div><h1>Dům, energie, smlouvy a údržba.</h1><p>Všechny známé termíny a záznamy rovnou na stránce. Žádné přepínání mezi skrytými filtry.</p></div><span class="pr1300-status ${d.overdue?'bad':d.next90?'warn':'good'}">${d.overdue?d.overdue+' po termínu':d.next90?d.next90+' do 90 dní':'klid'}</span></div>
  <section class="pr1320-now"><div><div class="pr1300-kicker">Teď</div><h2>${h(p?.title||'Nic kolem domova teď nehoří.')}</h2><p>${h(p?(p.days<0?`${Math.abs(p.days)} dní po termínu`:p.days===0?'Termín je dnes.':`Termín za ${p.days} dní.`):'Další známé termíny, smlouvy a servis jsou vidět níže.')}</p></div><div class="pr1320-now-actions"><button class="pr1300-btn primary" type="button" data-home1500-add>＋ Domácí úkol</button></div></section>
  <div class="os1500-summary-grid"><div class="os1500-summary"><span>Po termínu</span><b>${d.overdue}</b></div><div class="os1500-summary"><span>Do 90 dní</span><b>${d.next90}</b></div><div class="os1500-summary"><span>Smlouvy / údaje</span><b>${d.records.length}</b></div><div class="os1500-summary"><span>Údržba</span><b>${d.maintenance.length}</b></div></div>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Nejbližší termíny</h2><span>12 měsíců</span></div><div class="os1500-direct-list">${timelineRows(d.timeline)}</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Smlouvy, energie a údaje</h2><span>kliknutím upravíš</span></div><div class="os1500-record-grid">${recordRows(d.records)}</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Údržba a servis</h2><span>${d.maintenance.length} otevřených</span></div><div class="os1500-direct-list">${maintenanceRows(d.maintenance)}</div></section>
 </div>`;
 host.__home1500=d;
 if(!host.dataset.home1500Bound){host.dataset.home1500Bound='1';ownEvent1100(OWNER,host,'click',async e=>{
  const cur=host.__home1500||data();
  if(e.target.closest('[data-home1500-add]')){await openPersonalCapture643('task',{area:'Domov',category:'Domov'});return renderHomePage140()}
  const rb=e.target.closest('[data-home1500-record]');if(rb){const x=cur.records[Number(rb.dataset.home1500Record)];if(x)await editHomeRecord644(x.id);return renderHomePage140()}
  const mb=e.target.closest('[data-home1500-maintenance]');if(mb){const x=cur.maintenance[Number(mb.dataset.home1500Maintenance)];if(x)await openMaintenance644(x.item,x.source);return renderHomePage140()}
 })}
 window.__KAMIL_HOME140__={healthy:true,core:'os1500',records:d.records.length,maintenance:d.maintenance.length,overdue:d.overdue,at:Date.now()};return true;
}
