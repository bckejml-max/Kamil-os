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
 const m=workCommandCenter440(store.get()),totalExposure=m.finance.changeExposure+m.finance.receivable+m.finance.unbilled,top=m.topRisks[0],hasDetails=m.duties.length||m.waiting.some(x=>x.urgent)||totalExposure>0;
 const riskBlock=m.topRisks.length?'<section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Co potřebuje pozornost</h2><span>'+m.topRisks.length+' signálů</span></div>'+riskRows(m.topRisks)+'</section>':'';
 const projectBlock=m.projects.length?'<section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Zakázky</h2><button class="pr1300-btn" type="button" data-work1300-inbox>Úkoly a follow-upy</button></div>'+projectRows(m.projects)+'</section>':'';
 const detailsBlock=hasDetails?'<details class="pr1300-panel"><summary class="pr1300-panel-head"><h3>Další pracovní přehledy</h3><span>termíny · Waiting For · finance</span></summary><div>'+dutyRows(m.duties)+waitingRows(m.waiting)+'<div class="pr1300-row"><div class="pr1300-row-main"><b>Otevřené ZL</b><small>čeká na schválení nebo fakturaci</small></div><div class="pr1300-row-side">'+money(m.finance.changeExposure)+'</div></div><div class="pr1300-row"><div class="pr1300-row-main"><b>Nevybraná fakturace</b><small>vyfakturováno, ale nezaplaceno</small></div><div class="pr1300-row-side">'+money(m.finance.receivable)+'</div></div></div></details>':'';
 const clearBlock=!m.topRisks.length&&!m.projects.length&&!hasDetails?'<section class="pr1300-panel pr1328-work-clear"><div class="pr1300-panel-head"><h2>Pracovní data jsou klidná</h2><button class="pr1300-btn" type="button" data-work1300-inbox>Úkoly</button></div><div class="pr1300-empty">Nejsou uložené aktivní zakázky, rizika ani zapnuté pravidelné termíny.</div></section>':'';
 host.innerHTML='<div class="pr1300-shell" data-work-page1300>' +
  '<div class="pr1300-head"><div><div class="pr1300-kicker">Práce</div><h1>Zakázky a další kroky.</h1><p>Nejdřív skutečný termín nebo riziko. Pravidelné povinnosti se hlídají jen pokud jsou zapnuté.</p></div><span class="pr1300-status '+(m.status==='ZÁSAH'?'bad':m.status==='SLEDOVAT'?'warn':'good')+'">'+esc(m.status)+'</span></div>' +
  '<section class="pr1320-now"><div><div class="pr1300-kicker">Teď</div><h2>'+esc(top?.title||'Nic kritického')+'</h2><p>'+esc(top?.detail||'Podle uložených dat teď žádná zakázka, follow-up ani zapnutý pravidelný termín nevyžaduje okamžitý zásah.')+'</p></div><div class="pr1320-now-actions"><button class="pr1300-btn primary" type="button" data-work1300-add>＋ Pracovní úkol</button></div></section>' +
  '<div class="pr1320-meta"><span>Zakázky: '+m.projects.length+'</span><span>Po termínu: '+m.overdue+'</span><span>Waiting For: '+m.waiting.length+'</span><span>Finanční expozice: '+money(totalExposure)+'</span></div>' +
  riskBlock+projectBlock+detailsBlock+clearBlock+
 '</div>';
 if(!host.dataset.work1300Bound){host.dataset.work1300Bound='1';ownEvent1100(OWNER,host,'click',e=>{if(e.target.closest('[data-work1300-add]'))window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'work-task'}));else if(e.target.closest('[data-work1300-inbox]'))window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'inbox'}));else if(e.target.closest('[data-work1300-today]'))window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'today'}))})}

 window.__KAMIL_WORK_PAGE1300__={healthy:true,status:m.status,projects:m.projects.length,risks:m.topRisks.length,at:Date.now()};
 return true;
}

export function renderWorkPage1300(){return render()}
