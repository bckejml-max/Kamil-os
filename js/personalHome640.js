import {store} from './state.js';
import {h,qs} from './utils.js';
import {ensurePersonalVault640,personalVault640} from './personalVault640.js';

const maintRe=/servis|reviz|filtr|čerpad|cerpad|rekuper|klima|kom[ií]n|zahrad|oprava|údržb|udrzb|stk/i;
const closed=x=>['DONE','CLOSED','ARCHIVED','RESOLVED'].includes(String(x?.status||'').toUpperCase());
const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const date=v=>v?new Date(v).toLocaleDateString('cs-CZ'):'—';
const card=v=>`<article class="ux64-contract"><div class="ux64-contract-head"><div><span class="ux64-type">${h(v.recordType==='insurance'?'Pojištění':v.recordType==='utility'?'Energie':v.recordType==='property'?'Nemovitost':'Domov')}</span><h2>${h(v.title)}</h2></div><span class="ux64-status">${h(v.status.label)}</span></div>${v.annualAmount?`<div class="ux64-big">${money(v.annualAmount)}/rok</div>`:''}${v.monthlyAmount?`<div class="ux64-big">${money(v.monthlyAmount)}/měs.</div>`:''}<p>${h(v.status.detail)}</p><div class="muted">${v.validUntil?`Platnost / smlouva do ${date(v.validUntil)} · `:''}${h(v.sourceLabel||'')}</div></article>`;

export function renderPersonalHome640(){
 ensurePersonalVault640();const s=store.get(),vault=personalVault640(s),host=qs('#homeView');if(!host)return;
 const home=vault.records.filter(x=>x.section==='home');
 const maintenance=[...(s.personalAdmin?.items||[]),...(s.tasks||[])].filter(x=>!closed(x)&&maintRe.test(`${x.title||''} ${x.name||''} ${x.category||''}`));
 host.innerHTML=`<div class="ux64-page"><div class="view-head"><div><div class="eyebrow">DOMOV</div><h1>Dům, energie a údržba</h1><p>Jen praktické věci kolem domácnosti a nemovitosti.</p></div></div>
 <section class="ux64-contract-grid">${home.map(card).join('')||'<div class="card">Zatím bez uložených údajů o domovu.</div>'}</section>
 <section class="card"><div class="eyebrow">ÚDRŽBA A SERVIS</div>${maintenance.length?maintenance.slice(0,8).map(x=>`<div class="row ux64-row"><div><b>${h(x.title||x.name||'Údržba')}</b><div class="muted">${h(x.due||x.nextAt||x.deadline||'bez termínu')}</div></div></div>`).join(''):'<div class="empty success-empty">Teď není evidovaná žádná údržba k řešení.</div>'}</section></div>`;
 if(typeof window!=='undefined')window.__KAMIL_PERSONAL_UX_640_LAST__={at:Date.now(),view:'home',records:home.length,maintenance:maintenance.length};
}
