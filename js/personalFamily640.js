import {store} from './state.js';
import {h,qs} from './utils.js';
import {openPersonalAction641} from './personalActionExecution641.js';
import {prepareFamilyEvent644} from './personalFamilyHomeActions644.js';
import {openPersonalCapture643} from './personalCapture643.js';

const WORK_RE=/zak[aá]zk|faktur|dodavat|pks|cpi|zbrojov|pracovn|xtb|ticket|vstupenk/i;
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.category||''}`);
const familyRe=/rodin|d[ií]t|dcera|manžel|manzel|mam|tat|babi|děd|ded/i;
const daysTo=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):null};
const row=(title,meta='',button='')=>`<div class="row ux64-row"><div><b>${h(title)}</b>${meta?`<div class="muted">${h(meta)}</div>`:''}</div>${button}</div>`;
const when=x=>x.d===0?'dnes':x.d===1?'zítra':x.d<0?`${Math.abs(x.d)} d po termínu`:`za ${x.d} dní`;

export function renderPersonalFamily640(){
 const s=store.get(),host=qs('#ticketsView');if(!host)return;
 const members=Array.isArray(s.familyHome?.members)?s.familyHome.members:[];
 const events=(s.calendar?.events||[]).filter(personal).map(x=>({...x,d:daysTo(x.start||x.date||x.when)})).filter(x=>x.d!==null&&x.d>=0&&x.d<=30).sort((a,b)=>a.d-b.d);
 const tasks=(s.tasks||[]).filter(personal).filter(x=>familyRe.test(`${x.title||''} ${x.category||''} ${x.area||''}`)||String(x.area||'').toLowerCase()==='rodina').filter(x=>!['DONE','CLOSED','ARCHIVED'].includes(String(x.status||'').toUpperCase())).map(x=>({...x,d:daysTo(x.due)})).sort((a,b)=>(a.d??9999)-(b.d??9999));
 const weekend=events.filter(x=>{const t=Date.parse(x.start||x.date||x.when||'');if(!Number.isFinite(t))return false;const d=new Date(t).getDay();return d===0||d===6}).slice(0,4);
 const urgent=[...events.filter(x=>x.d<=2).map(x=>({kind:'event',title:x.title||x.summary||'Událost',meta:when(x),src:x})),...tasks.filter(x=>x.d!==null&&x.d<=3).map(x=>({kind:'task',title:x.title||'Úkol',meta:x.d<0?`${Math.abs(x.d)} d po termínu`:x.d===0?'dnes':x.d===1?'zítra':`za ${x.d} dní`,src:x}))].slice(0,3);
 const overdue=tasks.filter(x=>x.d!==null&&x.d<0).length,due7=events.filter(x=>x.d<=7).length+tasks.filter(x=>x.d!==null&&x.d>=0&&x.d<=7).length;
 host.innerHTML=`<div class="ux64-page family-page"><div class="view-head"><div><div class="eyebrow">RODINA</div><h1>Co nás čeká</h1><p>Nejdřív důležité věci, potom teprve celý přehled.</p></div><div class="row-actions"><button class="btn primary" id="familyAdd650">+ Rodinný úkol</button></div></div>
 <section class="family-action-summary ${urgent.length?'has-issues':''}"><div class="eyebrow">CO ŘEŠIT TEĎ</div>${urgent.length?urgent.map((x,i)=>`<div class="family-action-row"><span class="family-action-rank">${i+1}</span><div><b>${h(x.title)}</b><div class="muted">${h(x.meta)}</div></div><button class="btn ${i===0?'primary':''}" data-family-urgent="${i}">Řešit</button></div>`).join(''):'<div class="family-clear"><b>Teď není nic rodinného akutního.</b><span class="muted">Nejbližší termíny najdeš níže.</span></div>'}</section>
 <section class="metric-strip family-metrics"><div class="metric"><span>Po termínu</span><b>${overdue}</b></div><div class="metric"><span>Do 7 dní</span><b>${due7}</b></div><div class="metric"><span>Otevřené úkoly</span><b>${tasks.length}</b></div><div class="metric"><span>Členové domácnosti</span><b>${members.length}</b></div></section>
 <div class="family-filters"><button class="btn on" data-family-filter="all">Vše</button><button class="btn" data-family-filter="events">Termíny</button><button class="btn" data-family-filter="tasks">Úkoly</button><button class="btn" data-family-filter="weekend">Víkend</button><button class="btn" data-family-filter="members">Domácnost</button></div>
 <section class="card family-section" data-family-section="events"><div class="eyebrow">NEJBLIŽŠÍ TERMÍNY</div>${events.length?events.slice(0,10).map((x,i)=>row(x.title||x.summary||'Událost',when(x),`<button class="btn ${x.d<=1?'primary':''}" data-family-event="${i}">Připravit</button>`)).join(''):'<div class="empty success-empty">V příštích 30 dnech nemám rodinný termín.</div>'}</section>
 <section class="card family-section" data-family-section="tasks"><div class="eyebrow">RODINNÉ ÚKOLY</div>${tasks.length?tasks.slice(0,10).map((x,i)=>row(x.title||'Úkol',x.due?`termín ${new Date(x.due).toLocaleDateString('cs-CZ')}`:'bez termínu',`<button class="btn" data-family-task="${i}">Řešit</button>`)).join(''):'<div class="empty success-empty">Žádný otevřený rodinný úkol.</div>'}</section>
 <section class="card family-section" data-family-section="weekend"><div class="eyebrow">VÍKEND</div>${weekend.length?weekend.map(x=>row(x.title||x.summary||'Událost',when(x))).join(''):'<div class="empty">Na nejbližší víkend tu zatím nemám plán.</div>'}</section>
 <section class="card family-section" data-family-section="members"><div class="eyebrow">DOMÁCNOST</div>${members.length?members.map(x=>row(x.name||x.title||'Člen domácnosti',x.role||x.relation||'')).join(''):'<div class="empty">Členové domácnosti zatím nejsou ve strukturovaných datech.</div>'}</section></div>`;
 host.querySelector('#familyAdd650')?.addEventListener('click',async()=>{await openPersonalCapture643('task',{area:'rodina',category:'rodina'});renderPersonalFamily640()});
 host.querySelectorAll('[data-family-event]').forEach(b=>b.addEventListener('click',()=>{const x=events[Number(b.dataset.familyEvent)];prepareFamilyEvent644(x);renderPersonalFamily640()}));
 host.querySelectorAll('[data-family-task]').forEach(b=>b.addEventListener('click',async()=>{const x=tasks[Number(b.dataset.familyTask)];await openPersonalAction641({id:`task:${x.id}`,kind:'task',title:x.title||x.name,why:'Rodinný úkol.',next:'Dokončit, odložit nebo dát do čekání.',minutes:Number(x.estimateMinutes||15),route:'family'});renderPersonalFamily640()}));
 host.querySelectorAll('[data-family-urgent]').forEach(b=>b.addEventListener('click',async()=>{const x=urgent[Number(b.dataset.familyUrgent)];if(x?.kind==='event')prepareFamilyEvent644(x.src);else if(x?.kind==='task')await openPersonalAction641({id:`task:${x.src.id}`,kind:'task',title:x.src.title||x.src.name,why:'Rodinný úkol.',next:'Dokončit, odložit nebo dát do čekání.',minutes:Number(x.src.estimateMinutes||15),route:'family'});renderPersonalFamily640()}));
 host.querySelectorAll('[data-family-filter]').forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.familyFilter;host.querySelectorAll('[data-family-filter]').forEach(x=>x.classList.toggle('on',x===b));host.querySelectorAll('[data-family-section]').forEach(x=>x.classList.toggle('hidden',f!=='all'&&x.dataset.familySection!==f));}));
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_FAMILY_650_LAST__={at:Date.now(),events:events.length,tasks:tasks.length,weekend:weekend.length,members:members.length,urgent:urgent.length};
}
