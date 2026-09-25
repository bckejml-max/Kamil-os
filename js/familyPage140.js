import {store} from './state.js';
import {h} from './utils.js';
import {ownEvent1100} from './runtimeOwnership1100.js';
import {personalDaysTo650} from './personalDate650.js';
import {isPersonalScope527} from './personalScope527.js';
import {prepareFamilyEvent644} from './personalFamilyHomeActions644.js';
import {openPersonalCapture643} from './personalCapture643.js';
import {openPersonalAction641} from './personalActionExecution641.js';

const OWNER='family.page1500';
const ENABLE_FAMILY_HUB610=false;
const familyRe=/rodin|d[ií]t|dcera|manžel|manzel|mam|tat|babi|děd|ded/i;
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','CANCELLED','CANCELED']);
const daysTo=personalDaysTo650;
const fold=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const when=d=>d===null?'bez termínu':d<0?`${Math.abs(d)} d po termínu`:d===0?'dnes':d===1?'zítra':`za ${d} d`;

function data(){
 const s=store.get(),members=(Array.isArray(s.familyHome?.members)?s.familyHome.members:[]).filter(x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED'),memberNames=members.map(x=>fold(x.name)).filter(x=>x.length>=2);
 const isFamilyEvent=x=>{if(!isPersonalScope527(x))return false;const area=fold(x.area),category=fold(x.category),text=fold(`${x.title||''} ${x.summary||''} ${x.subject||''}`);return area==='rodina'||category==='rodina'||familyRe.test(text)||memberNames.some(name=>text.includes(name))};
 const events=(s.calendar?.events||[]).filter(isFamilyEvent).map(x=>({...x,d:daysTo(x.start||x.date||x.when)})).filter(x=>x.d!==null&&x.d>=0&&x.d<=30).sort((a,b)=>a.d-b.d);
 const tasks=(s.tasks||[]).filter(isPersonalScope527).filter(x=>familyRe.test(`${x.title||''} ${x.category||''} ${x.area||''}`)||String(x.area||'').toLowerCase()==='rodina').filter(x=>!CLOSED.has(String(x.status||'').toUpperCase())).map(x=>({...x,d:daysTo(x.due)})).sort((a,b)=>(a.d??9999)-(b.d??9999));
 const urgent=[
  ...tasks.filter(x=>x.d!==null&&x.d<=3).map(x=>({kind:'task',title:x.title||'Rodinný úkol',detail:when(x.d),src:x,d:x.d})),
  ...events.filter(x=>x.d<=2).map(x=>({kind:'event',title:x.title||x.summary||'Rodinný termín',detail:when(x.d),src:x,d:x.d}))
 ].sort((a,b)=>(a.d??999)-(b.d??999)||String(a.title).localeCompare(String(b.title),'cs'));
 return {s,members,events,tasks,urgent,primary:urgent[0]||null,overdue:tasks.filter(x=>x.d!==null&&x.d<0).length,due7:events.filter(x=>x.d<=7).length+tasks.filter(x=>x.d!==null&&x.d>=0&&x.d<=7).length};
}
const eventRows=rows=>rows.length?rows.slice(0,8).map((x,i)=>`<button type="button" class="pr1300-row pr1300-clickrow" data-family1500-event="${i}"><div class="pr1300-row-main"><b>${h(x.title||x.summary||'Událost')}</b><small>${h(x.location||'Rodinný termín')}</small></div><div class="pr1300-row-side ${x.d<=1?'warn':''}">${h(when(x.d))} <span class="os1500-row-arrow">→</span></div></button>`).join(''):'<div class="os1500-empty">V příštích 30 dnech není uložený rodinný termín.</div>';
const taskRows=rows=>rows.length?rows.slice(0,10).map((x,i)=>`<button type="button" class="pr1300-row pr1300-clickrow" data-family1500-task="${i}"><div class="pr1300-row-main"><b>${h(x.title||'Úkol')}</b><small>${h(x.notes||x.category||'Rodina')}</small></div><div class="pr1300-row-side ${x.d!==null&&x.d<0?'bad':x.d===0?'warn':''}">${h(when(x.d))} <span class="os1500-row-arrow">→</span></div></button>`).join(''):'<div class="os1500-empty">Žádný otevřený rodinný úkol.</div>';
const memberRows=rows=>rows.length?rows.map(x=>`<div class="pr1300-row"><div class="pr1300-row-main"><b>${h(x.name||x.title||'Člen domácnosti')}</b><small>${h(x.role||x.relation||'')}</small></div><div class="pr1300-row-side">domácnost</div></div>`).join(''):'<div class="os1500-empty">Členové domácnosti zatím nejsou ve strukturovaných datech.</div>';

export function renderFamilyPage140(){
 const host=document.querySelector('#ticketsView');if(!host)return false;const d=data(),p=d.primary;
 host.innerHTML=`<div class="pr1300-shell" data-family-page1500>
  <div class="pr1300-head"><div><div class="pr1300-kicker">Rodina</div><h1>Co nás čeká a co je potřeba zařídit.</h1><p>Bez filtrů a bez dalšího dashboardu. Termíny, úkoly a domácnost jsou rovnou na jedné stránce.</p></div><span class="pr1300-status ${d.overdue?'bad':d.due7?'warn':'good'}">${d.overdue?d.overdue+' po termínu':d.due7?d.due7+' do 7 dní':'klid'}</span></div>
  <section class="pr1320-now"><div><div class="pr1300-kicker">Teď</div><h2>${h(p?.title||'Nic rodinného teď nehoří.')}</h2><p>${h(p?.detail||'Nejbližší známé rodinné termíny a úkoly jsou pod tímto přehledem.')}</p></div><div class="pr1320-now-actions"><button class="pr1300-btn primary" type="button" data-family1500-add>＋ Rodinný úkol</button>${p?'<button class="pr1300-btn" type="button" data-family1500-primary>Vyřešit teď →</button>':''}</div></section>
  <div class="os1500-summary-grid"><div class="os1500-summary"><span>Po termínu</span><b>${d.overdue}</b></div><div class="os1500-summary"><span>Do 7 dní</span><b>${d.due7}</b></div><div class="os1500-summary"><span>Úkoly</span><b>${d.tasks.length}</b></div><div class="os1500-summary"><span>Domácnost</span><b>${d.members.length}</b></div></div>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Nejbližší termíny</h2><span>30 dní</span></div><div class="os1500-direct-list">${eventRows(d.events)}</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Rodinné úkoly</h2><span>${d.tasks.length} otevřených</span></div><div class="os1500-direct-list">${taskRows(d.tasks)}</div></section>
  <section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Domácnost</h2><span>${d.members.length} členů</span></div><div class="os1500-direct-list">${memberRows(d.members)}</div></section>
 </div>`;
 host.__family1500=d;
 if(!host.dataset.family1500Bound){host.dataset.family1500Bound='1';ownEvent1100(OWNER,host,'click',async e=>{
  const cur=host.__family1500||data();
  if(e.target.closest('[data-family1500-add]')){await openPersonalCapture643('task',{area:'rodina',category:'rodina'});return renderFamilyPage140()}
  if(e.target.closest('[data-family1500-primary]')){const x=cur.primary;if(x?.kind==='event')prepareFamilyEvent644(x.src);else if(x?.kind==='task')await openPersonalAction641({id:`task:${x.src.id}`,kind:'task',title:x.src.title||'Rodinný úkol',why:'Rodinný úkol.',next:'Dokončit, odložit nebo dát do čekání.',minutes:Number(x.src.estimateMinutes||15),route:'family'});return renderFamilyPage140()}
  const eb=e.target.closest('[data-family1500-event]');if(eb){const x=cur.events[Number(eb.dataset.family1500Event)];if(x)prepareFamilyEvent644(x);return renderFamilyPage140()}
  const tb=e.target.closest('[data-family1500-task]');if(tb){const x=cur.tasks[Number(tb.dataset.family1500Task)];if(x)await openPersonalAction641({id:`task:${x.id}`,kind:'task',title:x.title||'Rodinný úkol',why:'Rodinný úkol.',next:'Dokončit, odložit nebo dát do čekání.',minutes:Number(x.estimateMinutes||15),route:'family'});return renderFamilyPage140()}
 })}
 window.__KAMIL_FAMILY140__={healthy:true,core:'os1500',hub:ENABLE_FAMILY_HUB610?'on':'off',events:d.events.length,tasks:d.tasks.length,overdue:d.overdue,at:Date.now()};return true;
}
