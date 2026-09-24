import {localInboxSummary660} from './inboxHub660.js';
import {ownEvent1100} from './runtimeOwnership1100.js';
import {loadProductAdvancedStyles} from './productAdvancedStyles.js';
import {openPersonalAction641} from './personalActionExecution641.js';

const OWNER='product.tasksOverview';
let lastModel=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function when(x){if(x.days===null||x.days===undefined)return'bez termínu';if(x.days<0)return Math.abs(x.days)+' d po termínu';if(x.days===0)return'dnes';if(x.days===1)return'zítra';return'za '+x.days+' d'}
function rows(items){if(!items.length)return '<div class="pr1300-empty">Nic otevřeného.</div>';return items.map(x=>'<button type="button" class="pr1300-row pr1300-clickrow" data-task-open="'+esc(x.id)+'" data-task-route="'+esc(x.route||'today')+'"><div class="pr1300-row-main"><b>'+esc(x.title)+'</b><small>'+esc(x.sourceLabel||x.bucket||'Úkol')+(x.detail?' · '+esc(x.detail).slice(0,90):'')+'</small></div><div class="pr1300-row-side '+(x.days!==null&&x.days<0?'bad':x.days===0?'warn':'')+'">'+esc(when(x))+'</div></button>').join('')}
function immediateTop(m){return (m.rows||[]).find(x=>x.score>=120||(x.days!==null&&x.days<=7))||null}

export function renderTasksOverview(){
 const host=document.querySelector('#inboxView');if(!host)return false;if(host.dataset.productAdvanced==='1')return true;const m=localInboxSummary660(),top=immediateTop(m);lastModel=m;
 const quietDetail=m.counts.total?'Otevřené položky jsou ve frontě, ale žádná teď nemá krátký termín ani vysokou prioritu.':'Žádná otevřená položka teď nemá vysokou prioritu.';
 host.innerHTML='<div class="pr1300-shell" data-tasks-overview>' +
 '<div class="pr1300-head"><div><div class="pr1300-kicker">Úkoly</div><h1>Co je potřeba vyřídit.</h1><p>Jedna fronta úkolů, odpovědí, plateb, čekání, termínů a dokumentů.</p></div><span class="pr1300-status '+(m.counts.urgent?'bad':m.counts.total?'warn':'good')+'">'+(m.counts.total?m.counts.total+' otevřených':'čisto')+'</span></div>' +
 '<section class="pr1320-now"><div><div class="pr1300-kicker">Teď</div><h2>'+esc(top?.title||'Nic akutního')+'</h2><p>'+esc(top?.detail||quietDetail)+'</p></div><div class="pr1320-now-actions"><button class="pr1300-btn primary" type="button" data-task-add>＋ Úkol</button></div></section>' +
 '<div class="pr1320-meta pr1329-task-meta"><span>Odpovědět: '+m.counts.reply+'</span><span>Zaplatit: '+m.counts.pay+'</span><span>Vyřešit: '+m.counts.do+'</span><span>Čekám: '+m.counts.waiting+'</span><span>Termíny: '+m.counts.deadline+'</span><span>Dokumenty: '+m.counts.document+'</span></div>' +
 '<section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Fronta</h2><button class="pr1300-btn" type="button" data-task-advanced>Gmail + detail</button></div>'+rows(m.rows)+'</section>' +
 '<div class="pr1300-actions"><button class="pr1300-btn" type="button" data-task-wait>Čekám na někoho</button></div></div>';
 if(!host.dataset.tasksOverviewBound){host.dataset.tasksOverviewBound='1';ownEvent1100(OWNER,host,'click',async e=>{if(e.target.closest('[data-task-add]')){window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'task'}));return}if(e.target.closest('[data-task-wait]')){window.dispatchEvent(new CustomEvent('kamil:capture',{detail:'waiting'}));return}const rowBtn=e.target.closest('[data-task-open]');if(rowBtn){const row=lastModel?.rows?.find(x=>x.id===rowBtn.dataset.taskOpen);if(row?.action){await openPersonalAction641(row.action);renderTasksOverview();return}window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:row?.route||rowBtn.dataset.taskRoute||'today'}));return}if(e.target.closest('[data-task-advanced]')){host.dataset.productAdvanced='1';await loadProductAdvancedStyles(["./core70.css","./personal64.css"]);const m=await import('./inboxAdvanced141.js');await m.renderInboxPage141?.()}})}

 window.__KAMIL_TASKS_OVERVIEW__={healthy:true,total:m.counts.total,urgent:m.counts.urgent,at:Date.now()};return true;
}