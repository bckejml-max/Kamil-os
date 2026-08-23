import {store} from './state.js';
import {h,qs} from './utils.js';

const WORK_RE=/zak[aá]zk|faktur|dodavat|pks|cpi|zbrojov|pracovn|xtb|ticket|vstupenk/i;
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.category||''}`);
const familyRe=/rodin|d[ií]t|dcera|manžel|manzel|mam|tat|babi|děd|ded/i;
const daysTo=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-Date.now())/86400000):null};
const row=(title,meta='')=>`<div class="row ux64-row"><div><b>${h(title)}</b>${meta?`<div class="muted">${h(meta)}</div>`:''}</div></div>`;

export function renderPersonalFamily640(){
 const s=store.get(),host=qs('#ticketsView');if(!host)return;
 const members=Array.isArray(s.familyHome?.members)?s.familyHome.members:[];
 const events=(s.calendar?.events||[]).filter(personal).map(x=>({...x,d:daysTo(x.start||x.date||x.when)})).filter(x=>x.d!==null&&x.d>=0&&x.d<=14).sort((a,b)=>a.d-b.d);
 const tasks=(s.tasks||[]).filter(personal).filter(x=>familyRe.test(`${x.title||''} ${x.category||''} ${x.area||''}`)).filter(x=>!['DONE','CLOSED','ARCHIVED'].includes(String(x.status||'').toUpperCase()));
 host.innerHTML=`<div class="ux64-page"><div class="view-head"><div><div class="eyebrow">RODINA</div><h1>Rodinný přehled</h1><p>Události, úkoly a věci, na které nechceš zapomenout.</p></div></div>
 <div class="ux64-two"><section class="card"><div class="eyebrow">PŘÍŠTÍCH 14 DNÍ</div>${events.length?events.slice(0,8).map(x=>row(x.title||x.summary||'Událost',x.d===0?'dnes':x.d===1?'zítra':`za ${x.d} dní`)).join(''):'<div class="empty success-empty">Žádná rodinná událost v příštích 14 dnech.</div>'}</section>
 <section class="card"><div class="eyebrow">RODINNÉ ÚKOLY</div>${tasks.length?tasks.slice(0,8).map(x=>row(x.title||'Úkol',x.due?`termín ${new Date(x.due).toLocaleDateString('cs-CZ')}`:'bez termínu')).join(''):'<div class="empty">Žádný otevřený rodinný úkol.</div>'}</section></div>
 <section class="card"><div class="eyebrow">ČLENOVÉ DOMÁCNOSTI</div>${members.length?members.map(x=>row(x.name||x.title||'Člen domácnosti',x.role||x.relation||'')).join(''):'<div class="empty">Členové domácnosti zatím nejsou ve strukturovaných datech.</div>'}</section></div>`;
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_UX_640_LAST__={at:Date.now(),view:'family',events:events.length,tasks:tasks.length};
}
