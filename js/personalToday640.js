import {store} from './state.js';
import {h,qs} from './utils.js';
import {ensurePersonalVault640} from './personalVault640.js';
import {openPersonalAction641} from './personalActionExecution641.js';
import {personalDailyAssistant650,personalActionCta650} from './personalAssistant650.js';
import {openPersonalWaiting650} from './personalWaiting650.js';

const go=route=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:route}));
const hour=()=>new Date().getHours();
const greeting=()=>hour()<11?'Dobré ráno.':hour()<18?'Dobré odpoledne.':'Dobrý večer.';
const badge=x=>x?.level==='critical'?'DŮLEŽITÉ':x?.level==='high'?'BRZY':x?.level==='medium'?'HLÍDAT':'POZDĚJI';
const primaryHtml=x=>`<article class="ux65-primary ux64-${h(x.level)}"><div class="ux64-action-top"><span class="ux64-badge">${badge(x)}</span><span class="ux64-time">${h(String(x.minutes||5))} min</span></div><h2>${h(x.title)}</h2><p>${h(x.why)}</p><div class="ux64-next">${h(x.next)}</div><button class="btn primary" data-ux65-action="${h(x.id)}">${h(x.cta||personalActionCta650(x))}</button></article>`;
const secondaryHtml=x=>`<div class="row ux65-secondary"><div><b>${h(x.title)}</b><div class="muted">${h(x.why)}</div></div><button class="btn" data-ux65-action="${h(x.id)}">${h(x.cta||personalActionCta650(x))}</button></div>`;

export function renderPersonalToday640(){
 ensurePersonalVault640();const s=store.get(),d=personalDailyAssistant650(s),host=qs('#todayView');if(!host)return;
 host.innerHTML=`<div class="ux64-page ux65-today"><section class="ux64-hero ux65-hero"><div class="eyebrow">DNES</div><h1>${greeting()}</h1><p>${h(d.headline)}</p></section>
 ${d.primary?`<section>${primaryHtml(d.primary)}</section>`:'<section class="card ux64-clear"><b>Všechno důležité je teď v pořádku.</b><p class="muted">Nemusíš nic spravovat jen proto, že je appka otevřená.</p></section>'}
 ${d.secondary.length?`<section class="card ux65-later"><div class="eyebrow">POTOM</div>${d.secondary.map(secondaryHtml).join('')}</section>`:''}
 <section class="ux65-context"><button class="ux65-chip" data-waiting-open><b>${d.waitingCount}</b><span>Čekám na odpověď</span></button><button class="ux65-chip" data-family-open><b>${d.tomorrowCount}</b><span>Zítra</span></button><button class="ux65-chip" data-family-open><b>${d.next7Count}</b><span>Do 7 dní</span></button></section>
 <section class="ux65-quick"><button class="btn" data-ask="Co mám dnes řešit?">Co dnes řešit?</button><button class="btn" data-ask="Co mi končí?">Co mi končí?</button><button class="btn" data-ask="Na co čekám?">Na co čekám?</button></section></div>`;
 host.querySelector('[data-waiting-open]')?.addEventListener('click',()=>openPersonalWaiting650());
 host.querySelectorAll('[data-family-open]').forEach(b=>b.addEventListener('click',()=>go('tickets')));
 host.querySelectorAll('[data-ask]').forEach(b=>b.addEventListener('click',()=>{const input=qs('#commandInput');if(input){input.value=b.dataset.ask;input.focus();qs('#commandGo')?.click()}}));
 host.querySelectorAll('[data-ux65-action]').forEach(b=>b.addEventListener('click',async()=>{const fresh=personalDailyAssistant650(store.get()).top.find(x=>x.id===b.dataset.ux65Action);if(!fresh)return;await openPersonalAction641(fresh);renderPersonalToday640()}));
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_UX_650_LAST__={at:Date.now(),view:'today',primary:d.primary?.title||null,secondary:d.secondary.map(x=>x.title),waiting:d.waitingCount,tomorrow:d.tomorrowCount};
}
