import {store} from './state.js';
import {workCommandCenter440} from './workCommandCenter440.js';
import {ownEvent1100} from './runtimeOwnership1100.js';

const OWNER='product.work1300';
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=v=>`${Math.round(Number(v||0)).toLocaleString('cs-CZ')} Kč`;
const tone=score=>score<50?'bad':score<85?'warn':'good';
const riskTone=score=>score>=95?'bad':score>=85?'warn':'good';
const follow=x=>x.due!==null?(x.due<0?`${Math.abs(x.due)} d po termínu`:x.due===0?'dnes':`za ${x.due} d`):(x.age!==null?`${x.age} d bez pohybu`:'bez termínu');

function riskRows(items){
 if(!items.length)return '<div class="pr1300-empty">Podle uložených dat teď nic akutně nehoří.</div>';
 return `<div class="pr1300-attention">${items.slice(0,6).map(x=>`<button type="button" data-work1300-today><i class="pr1300-dot ${riskTone(x.score)}"></i><span><b>${esc(x.title)}</b><small>${esc(x.kind)} · ${esc(x.detail)}</small></span><em>${x.score>=95?'řešit teď':'zkontrolovat'}</em></button>`).join('')}</div>`;
}
function projectRows(items){
 if(!items.length)return '<div class="pr1300-empty">Nejsou uložené aktivní zakázky.</div>';
 return items.slice(0,10).map(x=>`<div class="pr1300-row"><div class="pr1300-row-main"><b>${esc(x.name)}</b><small>${esc(x.reasons.slice(0,3).join(' · ')||'Bez zjevného rizika')}${x.pending?` · ZL ${money(x.pending)}`:''}${x.receivable?` · pohledávka ${money(x.receivable)}`:''}</small></div><div class="pr1300-row-side"><span class="pr1300-project-health ${tone(x.score)}">${esc(x.status)} · ${x.score}/100</span></div></div>`).join('');
}
function dutyRows(items){return items.map(x=>`<div class="pr1300-row"><div class="pr1300-row-main"><b>${esc(x.title)}</b><small>${x.dueDay}. den v měsíci</small></div><div class="pr1300-row-side ${x.status==='PO TERMÍNU'?'bad':x.status==='DNES'||x.status==='BRZY'?'warn':'good'}">${esc(x.status)}</div></div>`).join('')}
function waitingRows(items){
 const rows=items.filter(x=>x.urgent).slice(0,6);
 if(!rows.length)return '<div class="pr1300-empty">Žádný akutní follow-up.</div>';
 return rows.map(x=>`<div class="pr1300-row"><div class="pr1300-row-main"><b>${esc(x.title)}</b><small>${esc(x.person||'Waiting For')}</small></div><div class="pr1300-row-side warn">${esc(follow(x))}</div></div>`).join('');
}

function render(){
 const host=document.querySelector('#workView');if(!host)return false;
 const m=workCommandCenter440(store.get());
 const totalExposure=m.finance.changeExposure+m.finance.receivable+m.finance.unbilled;
 const top=m.topRisks[0];
 host.innerHTML=`<div class="pr1300-shell" data-work-page1300>
  <div class="pr1300-head"><div><div class="pr1300-kicker">Práce</div><h1>Zakázky bez hledání v pěti obrazovkách.</h1><p>Termíny, rizika, fakturace a Waiting For na jednom místě. Technické diagnostiky zůstávají na pozadí.</p></div><span class="pr1300-status ${m.status==='ZÁSAH'?'bad':m.status==='SLEDOVAT'?'warn':'good'}">${esc(m.status)}</span></div>
  <section class="pr1300-hero"><div><div class="pr1300-kicker">Nejdůležitější pracovní věc</div><h2>${esc(top?.title||'Nic kritického')}</h2><p>${esc(top?.detail||'Podle uložených dat teď žádná zakázka ani pravidelný termín nevyžaduje okamžitý zásah.')}</p></div><div class="pr1300-hero-value"><b>${m.projects.length}</b><span>aktivních zakázek</span></div></section>
  <div class="pr1300-kpis"><div class="pr1300-kpi"><span>Zakázky</span><b>${m.projects.length}</b><small>${m.projects.filter(x=>x.score<70).length} rizikových</small></div><div class="pr1300-kpi"><span>Úkoly po termínu</span><b>${m.overdue}</b><small>otevřené pracovní i obecné</small></div><div class="pr1300-kpi"><span>Waiting For</span><b>${m.waiting.length}</b><small>${m.waiting.filter(x=>x.urgent).length} potřebuje follow-up</small></div><div class="pr1300-kpi"><span>Finanční expozice</span><b>${money(totalExposure)}</b><small>ZL + pohledávky + nefakturováno</small></div></div>
  <div class="pr1300-actions"><button class="pr1300-btn primary" type="button" data-work1300-add>＋ Přidat pracovní úkol</button><button class="pr1300-btn" type="button" data-work1300-inbox>Otevřít Inbox</button></div>
  <div class="pr1300-grid"><div class="pr1300-stack"><section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Co potřebuje pozornost</h2><span>${m.topRisks.length} signálů</span></div>${riskRows(m.topRisks)}</section><section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Zakázky</h2><span>nejrizikovější nahoře</span></div>${projectRows(m.projects)}</section></div><div class="pr1300-stack"><section class="pr1300-panel"><div class="pr1300-panel-head"><h3>Pravidelné termíny</h3><span>tento měsíc</span></div>${dutyRows(m.duties)}</section><section class="pr1300-panel"><div class="pr1300-panel-head"><h3>Waiting For</h3><span>jen urgentní</span></div>${waitingRows(m.waiting)}</section><section class="pr1300-panel"><div class="pr1300-panel-head"><h3>Peníze v zakázkách</h3><span>podle uložených dat</span></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Otevřené ZL</b><small>čeká na schválení nebo fakturaci</small></div><div class="pr1300-row-side ${m.finance.changeExposure?'warn':''}">${money(m.finance.changeExposure)}</div></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Nevybraná fakturace</b><small>vyfakturováno, ale nezaplaceno</small></div><div class="pr1300-row-side ${m.finance.receivable?'warn':''}">${money(m.finance.receivable)}</div></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Schváleno, nefakturováno</b><small>potenciální cash-flow k dotažení</small></div><div class="pr1300-row-side ${m.finance.unbilled?'warn':''}">${money(m.finance.unbilled)}</div></div></section></div></div>
 </div>`;
 if(!host.dataset.work1300Bound){host.dataset.work1300Bound='1';ownEvent1100(OWNER,host,'click',e=>{if(e.target.closest('[data-work1300-add]'))window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'work-task'}));else if(e.target.closest('[data-work1300-inbox]'))window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'inbox'}));else if(e.target.closest('[data-work1300-today]'))window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'today'}))})}
 window.__KAMIL_WORK_PAGE1300__={healthy:true,status:m.status,projects:m.projects.length,risks:m.topRisks.length,at:Date.now()};
 return true;
}

export function renderWorkPage1300(){return render()}
