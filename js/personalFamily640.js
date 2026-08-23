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
const when=x=>x.d===0?'dnes':x.d===1?'zítra':`za ${x.d} dní`;

export function renderPersonalFamily640(){
 const s=store.get(),host=qs('#ticketsView');if(!host)return;
 const members=Array.isArray(s.familyHome?.members)?s.familyHome.members:[];
 const events=(s.calendar?.events||[]).filter(personal).map(x=>({...x,d:daysTo(x.start||x.date||x.when)})).filter(x=>x.d!==null&&x.d>=0&&x.d<=14).sort((a,b)=>a.d-b.d);
 const tasks=(s.tasks||[]).filter(personal).filter(x=>familyRe.test(`${x.title||''} ${x.category||''} ${x.area||''}`)||String(x.area||'').toLowerCase()==='rodina').filter(x=>!['DONE','CLOSED','ARCHIVED'].includes(String(x.status||'').toUpperCase()));
 const weekend=events.filter(x=>{const t=Date.parse(x.start||x.date||x.when||'');if(!Number.isFinite(t))return false;const d=new Date(t).getDay();return d===0||d===6}).slice(0,4);
 host.innerHTML=`<div class="ux64-page"><div class="view-head"><div><div class="eyebrow">RODINA</div><h1>Co nás čeká</h1><p>Termíny, příprava a rodinné úkoly na jednom místě.</p></div><div class="row-actions"><button class="btn primary" id="familyAdd650">+ Rodinný úkol</button></div></div>
 <section class="card ux65-family-next"><div class="eyebrow">NEJBLIŽŠÍ</div>${events.length?events.slice(0,5).map((x,i)=>row(x.title||x.summary||'Událost',when(x),`<button class="btn ${x.d<=1?'primary':''}" data-family-event="${i}">${x.d<=1?'Připravit':'Připravit'}</button>`)).join(''):'<div class="empty success-empty">V příštích 14 dnech nemám rodinný termín.</div>'}</section>
 <div class="ux64-two"><section class="card"><div class="eyebrow">RODINNÉ ÚKOLY</div>${tasks.length?tasks.slice(0,8).map((x,i)=>row(x.title||'Úkol',x.due?`termín ${new Date(x.due).toLocaleDateString('cs-CZ')}`:'bez termínu',`<button class="btn" data-family-task="${i}">Řešit</button>`)).join(''):'<div class="empty">Žádný otevřený rodinný úkol.</div>'}</section>
 <section class="card"><div class="eyebrow">VÍKEND</div>${weekend.length?weekend.map(x=>row(x.title||x.summary||'Událost',when(x))).join(''):'<div class="empty">Na nejbližší víkend tu zatím nemám plán.</div>'}</section></div>
 <section class="card"><div class="eyebrow">DOMÁCNOST</div>${members.length?members.map(x=>row(x.name||x.title||'Člen domácnosti',x.role||x.relation||'')).join(''):'<div class="empty">Členové domácnosti zatím nejsou ve strukturovaných datech.</div>'}</section></div>`;
 host.querySelector('#familyAdd650')?.addEventListener('click',async()=>{await openPersonalCapture643('task',{area:'rodina',category:'rodina'});renderPersonalFamily640()});
 host.querySelectorAll('[data-family-event]').forEach(b=>b.addEventListener('click',()=>{const x=events[Number(b.dataset.familyEvent)];prepareFamilyEvent644(x);renderPersonalFamily640()}));
 host.querySelectorAll('[data-family-task]').forEach(b=>b.addEventListener('click',async()=>{const x=tasks[Number(b.dataset.familyTask)];await openPersonalAction641({id:`task:${x.id}`,kind:'task',title:x.title||x.name,why:'Rodinný úkol.',next:'Dokončit, odložit nebo dát do čekání.',minutes:Number(x.estimateMinutes||15),route:'tickets'});renderPersonalFamily640()}));
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_FAMILY_650_LAST__={at:Date.now(),events:events.length,tasks:tasks.length,weekend:weekend.length,members:members.length};
}
