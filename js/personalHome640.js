import {store} from './state.js';
import {h,qs} from './utils.js';
import {ensurePersonalVault640,personalVault640} from './personalVault640.js';
import {editHomeRecord644,openMaintenance644} from './personalFamilyHomeActions644.js';
import {personalHomeTimeline650} from './personalAssistant650.js';

const maintRe=/servis|reviz|filtr|čerpad|cerpad|rekuper|klima|kom[ií]n|zahrad|oprava|údržb|udrzb|stk/i;
const closed=x=>['DONE','CLOSED','ARCHIVED','RESOLVED'].includes(String(x?.status||'').toUpperCase());
const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const date=v=>v?new Date(v).toLocaleDateString('cs-CZ'):'—';
const card=(v,i)=>`<article class="ux64-contract"><div class="ux64-contract-head"><div><span class="ux64-type">${h(v.recordType==='insurance'?'Pojištění':v.recordType==='utility'?'Energie':v.recordType==='property'?'Nemovitost':'Domov')}</span><h2>${h(v.title)}</h2></div><span class="ux64-status">${h(v.status.label)}</span></div>${v.annualAmount?`<div class="ux64-big">${money(v.annualAmount)}/rok</div>`:''}${v.monthlyAmount?`<div class="ux64-big">${money(v.monthlyAmount)}/měs.</div>`:''}<div class="ux64-next"><b>Co dál:</b> ${h(v.nextAction)}</div><div class="muted">${v.validUntil?`Platnost do ${date(v.validUntil)} · `:''}${h(v.sourceLabel||'')}</div><button class="btn" data-home-record="${i}">Upravit / zkontrolovat</button></article>`;
const timelineRow=x=>`<div class="row ux64-row"><div><b>${h(x.title)}</b><div class="muted">${date(x.date)} · ${x.days<0?`${Math.abs(x.days)} d po termínu`:x.days===0?'dnes':x.days===1?'zítra':`za ${x.days} d`}</div></div><span class="ux64-status">${x.kind==='maintenance'?'Údržba':'Smlouva'}</span></div>`;
const urgentRow=(x,i)=>`<div class="home-action-row"><span class="home-action-rank">${i+1}</span><div><b>${h(x.title)}</b><div class="muted">${x.days<0?`${Math.abs(x.days)} dní po termínu`:x.days===0?'Dnes':x.days===1?'Zítra':`Za ${x.days} dní`} · ${x.kind==='maintenance'?'údržba':'smlouva'}</div></div></div>`;

export function renderPersonalHome640(){
 ensurePersonalVault640();const s=store.get(),vault=personalVault640(s),host=qs('#homeView');if(!host)return;
 const home=vault.records.filter(x=>x.section==='home'),timeline=personalHomeTimeline650(s);
 const maintenance=[...(s.personalAdmin?.items||[]).map(x=>({item:x,source:'admin'})),...(s.tasks||[]).map(x=>({item:x,source:'task'}))].filter(({item:x})=>!closed(x)&&maintRe.test(`${x.title||''} ${x.name||''} ${x.category||''}`));
 const urgent=timeline.filter(x=>x.days<=30).slice(0,3),next90=timeline.filter(x=>x.days>=0&&x.days<=90).length,overdue=timeline.filter(x=>x.days<0).length;
 host.innerHTML=`<div class="ux64-page home-page"><div class="view-head"><div><div class="eyebrow">DOMOV</div><h1>Co bude dům potřebovat</h1><p>Smlouvy, energie, servis a údržba v jednom praktickém plánu.</p></div></div>
 <section class="home-action-summary ${urgent.length?'has-issues':''}"><div class="eyebrow">CO ŘEŠIT TEĎ</div>${urgent.length?urgent.map(urgentRow).join(''):`<div class="home-clear"><b>Nic kolem domu teď nehoří.</b><span class="muted">Další známé termíny hlídám níže.</span></div>`}</section>
 <section class="metric-strip home-metrics"><div class="metric"><span>Po termínu</span><b>${overdue}</b></div><div class="metric"><span>Do 90 dní</span><b>${next90}</b></div><div class="metric"><span>Smlouvy / údaje</span><b>${home.length}</b></div><div class="metric"><span>Aktivní údržba</span><b>${maintenance.length}</b></div></section>
 <nav class="home-filters" aria-label="Filtry domova"><button class="btn" data-home-filter="all">Vše</button><button class="btn" data-home-filter="timeline">12 měsíců</button><button class="btn" data-home-filter="records">Smlouvy a energie</button><button class="btn" data-home-filter="maintenance">Údržba</button></nav>
 <section class="card home-section" data-home-section="timeline"><div class="eyebrow">DALŠÍCH 12 MĚSÍCŮ</div>${timeline.length?timeline.slice(0,10).map(timelineRow).join(''):'<div class="empty success-empty">Nemám známý termín kolem domu v dalších 12 měsících.</div>'}</section>
 <section class="ux64-contract-grid home-section" data-home-section="records">${home.map(card).join('')||'<div class="card">Zatím bez uložených údajů o domovu.</div>'}</section>
 <section class="card home-section" data-home-section="maintenance"><div class="eyebrow">ÚDRŽBA A SERVIS</div>${maintenance.length?maintenance.slice(0,8).map(({item:x},i)=>`<div class="row ux64-row"><div><b>${h(x.title||x.name||'Údržba')}</b><div class="muted">${h(x.due||x.nextAt||x.deadline||'bez termínu')}</div></div><button class="btn" data-maintenance="${i}">Řešit</button></div>`).join(''):'<div class="empty success-empty">Teď není evidovaná žádná údržba k řešení.</div>'}</section></div>`;
 host.querySelectorAll('[data-home-record]').forEach(b=>b.addEventListener('click',async()=>{const x=home[Number(b.dataset.homeRecord)];await editHomeRecord644(x.id);renderPersonalHome640()}));
 host.querySelectorAll('[data-maintenance]').forEach(b=>b.addEventListener('click',async()=>{const x=maintenance[Number(b.dataset.maintenance)];await openMaintenance644(x.item,x.source);renderPersonalHome640()}));
 const setFilter=filter=>{host.querySelectorAll('[data-home-section]').forEach(x=>x.classList.toggle('hidden',filter!=='all'&&x.dataset.homeSection!==filter));host.querySelectorAll('[data-home-filter]').forEach(b=>b.classList.toggle('on',b.dataset.homeFilter===filter))};
 host.querySelectorAll('[data-home-filter]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.homeFilter)));setFilter('all');
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_HOME_650_LAST__={at:Date.now(),records:home.length,maintenance:maintenance.length,timeline:timeline.length,urgent:urgent.length,overdue};
}
