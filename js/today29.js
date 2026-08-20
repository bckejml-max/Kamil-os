import {store} from './state.js';
import {oneScreenAutopilot,onboardingWizard} from './personalPlus29.js';
import {personalInbox} from './autopilot28.js';
import {h,date,qs,qsa} from './utils.js';

const tone=p=>Number(p)>=90?'bad':Number(p)>=75?'warn':'good';
const nav=(target='today',homeMode=null)=>{window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:target}));if(target==='home'&&homeMode)queueMicrotask(()=>window.dispatchEvent(new CustomEvent('kamil:home-open',{detail:homeMode})))};
const row=(x,button=true)=>`<div class="autopilot29-row"><div><b>${h(x.title||'Osobní věc')}</b><small>${h(x.reason||x.detail||x.kind||'')}</small></div>${button?`<button class="btn" data-t29-open="${h(x.target||'today')}" data-t29-home="${h(x.homeMode||'')}">Otevřít</button>`:''}</div>`;

export function renderToday(){
 const s=store.get(),meta=store.meta(),a=oneScreenAutopilot(s,meta),on=onboardingWizard(s,meta),inbox=personalInbox(s),currency=a.money.primary||'CZK',safe=Number(a.money.safeToDeploy||0).toLocaleString('cs-CZ',{maximumFractionDigits:0});
 const changeRows=a.changes.slice(0,5).map(x=>`<div class="autopilot29-row"><div><b>${h(x.title)}</b><small>${h(x.kind)} · ${date(x.at)}</small></div></div>`).join('');
 qs('#todayView').innerHTML=`<div class="view-head"><div><div class="eyebrow">KAMIL OS 29 / OSOBNÍ AUTOPILOT</div><h1>${a.quiet?'Všechno důležité je pod kontrolou.':'Tady je jen to, co teď stojí za pozornost.'}</h1><p>Žádné pracovní moduly. Jen osobní akce, peníze, blížící se termíny a skutečné změny.</p></div><div class="view-head-stat"><b class="${a.escalation.urgent?'bad':a.quality.high?'warn':'good'}">${a.doToday.length}</b><span>věcí dnes</span></div></div>
 <div class="autopilot29-grid">
  <div class="card autopilot29-card"><div class="card-head"><div><div class="eyebrow">UDĚLEJ DNES</div><h2>Nejdůležitější osobní kroky</h2></div><span class="status ${a.doToday.some(x=>x.priority>=90)?'bad':a.doToday.length?'warn':'good'}">${a.doToday.length}</span></div>${a.doToday.map(x=>row(x)).join('')||'<div class="empty success-empty">Nic zásadního dnes nehoří.</div>'}</div>
  <div class="card autopilot29-card"><div class="card-head"><div><div class="eyebrow">POZOR NA PENÍZE</div><h2>Rezerva a rozhodnutí</h2></div><button class="btn" data-t29-open="money">Peníze</button></div>${a.moneyAlerts.map(x=>`<div class="autopilot29-alert"><b>${h(x)}</b></div>`).join('')||'<div class="empty success-empty">Známé cashflow teď nevytváří nový varovný signál.</div>'}<div class="row"><span>Bezpečný prostor před plánem</span><b>${safe} ${h(currency)}</b></div><div class="decision-note">Jde o plánovací prostor podle uložených dat; nic se automaticky neinvestuje.</div></div>
  <div class="card autopilot29-card"><div class="card-head"><div><div class="eyebrow">BLÍŽÍ SE</div><h2>Připravit → naplánovat → řešit</h2></div><button class="btn" data-t29-open="home" data-t29-home="timeline">Timeline</button></div>${a.approaching.map(x=>`<div class="autopilot29-row"><div><b>${h(x.title)}</b><small>${h(x.label)} · ${h(x.detail)} · ${h(x.domain)}</small></div><span class="status ${tone(x.priority)}">${h(x.label)}</span></div>`).join('')||'<div class="empty">Bez blízkého osobního termínu.</div>'}</div>
  <div class="card autopilot29-card"><div class="card-head"><div><div class="eyebrow">CO SE ZMĚNILO</div><h2>Posledních 14 dní</h2></div></div>${changeRows||'<div class="empty">Bez nové osobní změny v historii.</div>'}</div>
 </div>
 <div class="metric-strip autopilot29-strip"><button class="metric autopilot29-metric" data-t29-action="inbox"><span>Personal Inbox</span><b class="${inbox.total?'warn':'good'}">${inbox.total}</b></button><button class="metric autopilot29-metric" data-t29-action="quality"><span>Kvalita dat</span><b class="${a.quality.high?'warn':'good'}">${a.quality.score}/100</b></button><button class="metric autopilot29-metric" data-t29-open="money"><span>Cíle / fondy</span><b class="${a.goals.attention?'warn':'good'}">${a.goals.total}</b></button><button class="metric autopilot29-metric" data-t29-action="onboarding"><span>Onboarding</span><b class="${on.complete?'good':on.steps.length?'warn':'good'}">${on.complete?'✓':on.steps.length}</b></button></div>`;
 qsa('[data-t29-open]',qs('#todayView')).forEach(b=>b.onclick=()=>nav(b.dataset.t29Open,b.dataset.t29Home||null));
 qsa('[data-t29-action]',qs('#todayView')).forEach(b=>b.onclick=()=>{if(b.dataset.t29Action==='inbox')nav('home','dashboard');else if(b.dataset.t29Action==='quality')nav('home','risk');else nav('home','dashboard')});
}
