import {store} from './state.js';
import {h,qs} from './utils.js';
import {openPersonalAction641} from './personalActionExecution641.js';
import {prepareFamilyEvent644} from './personalFamilyHomeActions644.js';

const WORK_RE=/zak[aá]zk|faktur|dodavat|pks|cpi|zbrojov|pracovn|xtb|ticket|vstupenk/i;
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.category||''}`);
const familyRe=/rodin|d[ií]t|dcera|manžel|manzel|mam|tat|babi|děd|ded/i;
const daysTo=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):null};
const row=(title,meta='',button='')=>`<div class="row ux64-row"><div><b>${h(title)}</b>${meta?`<div class="muted">${h(meta)}</div>`:''}</div>${button}</div>`;

export function renderPersonalFamily640(){
 const s=store.get(),host=qs('#ticketsView');if(!host)return;
 const members=Array.isArray(s.familyHome?.members)?s.familyHome.members:[];
 const events=(s.calendar?.events||[]).filter(personal).map(x=>({...x,d:daysTo(x.start||x.date||x.when)})).filter(x=>x.d!==null&&x.d>=0&&x.d<=14).sort((a,b)=>a.d-b.d);
 const tasks=(s.tasks||[]).filter(personal).filter(x=>familyRe.test(`${x.title||''} ${x.category||''} ${x.area||''}`)).filter(x=>!['DONE','CLOSED','ARCHIVED'].includes(String(x.status||'').toUpperCase()));
 host.innerHTML=`<div class="ux64-page"><div class="view-head"><div><div class="eyebrow">RODINA</div><h1>Rodinný přehled</h1><p>Události, úkoly a věci, na které nechceš zapomenout.</p></div></div>
 <div class="ux64-two"><section class="card"><div class="eyebrow">PŘÍŠTÍCH 14 DNÍ</div>${events.length?events.slice(0,8).map((x,i)=>row(x.title||x.summary||'Událost',x.d===0?'dnes':x.d===1?'zítra':`za ${x.d} dní`,`<button class="btn" data-family-event="${i}">Připravit</button>`)).join(''):'<div class="empty success-empty">Žádná rodinná událost v příštích 14 dnech.</div>'}</section>
 <section class="card"><div class="eyebrow">RODINNÉ ÚKOLY</div>${tasks.length?tasks.slice(0,8).map((x,i)=>row(x.title||'Úkol',x.due?`termín ${new Date(x.due).toLocaleDateString('cs-CZ')}`:'bez termínu',`<button class="btn" data-family-task="${i}">Řešit</button>`)).join(''):'<div class="empty">Žádný otevřený rodinný úkol.</div>'}</section></div>
 <section class="card"><div class="eyebrow">ČLENOVÉ DOMÁCNOSTI</div>${members.length?members.map(x=>row(x.name||x.title||'Člen domácnosti',x.role||x.relation||'')).join(''):'<div class="empty">Členové domácnosti zatím nejsou ve strukturovaných datech.</div>'}</section></div>`;
 host.querySelectorAll('[data-family-event]').forEach(b=>b.addEventListener('click',()=>{const x=events[Number(b.dataset.familyEvent)];prepareFamilyEvent644(x);renderPersonalFamily640()}));
 host.querySelectorAll('[data-family-task]').forEach(b=>b.addEventListener('click',async()=>{const x=tasks[Number(b.dataset.familyTask)];await openPersonalAction641({id:`task:${x.id}`,kind:'task',title:x.title||x.name,why:'Rodinný úkol.',next:'Dokončit, odložit nebo dát do čekání.',minutes:Number(x.estimateMinutes||15),route:'tickets'});renderPersonalFamily640()}));
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_UX_644_LAST__={at:Date.now(),view:'family',events:events.length,tasks:tasks.length,actionable:true};
}
