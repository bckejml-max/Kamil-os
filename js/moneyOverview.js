import {store} from './state.js';
import {ensurePersonalVault640,personalVault640} from './personalVault640.js';
import {personalMoneyPlan650} from './personalAssistant650.js';
import {createMoneyTask645,updateBankSnapshot645,updateMortgageSnapshot645,openMoneyRecord645} from './personalMoneyActions645.js';
import {ownEvent1100} from './runtimeOwnership1100.js';
import {loadProductAdvancedStyles} from './productAdvancedStyles.js';
import {openPersonalAction641} from './personalActionExecution641.js';

const OWNER='product.moneyOverview';
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const val=(x,...keys)=>{for(const k of keys){const n=Number(x?.[k]);if(Number.isFinite(n)&&n!==0)return n}return 0};
const isOpen=x=>!['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','CANCELLED','CANCELED'].includes(String(x?.status||'').toUpperCase());

function data(){
 ensurePersonalVault640();
 const s=store.get(),v=personalVault640(s),plan=personalMoneyPlan650(s);
 const debt=v.records.filter(x=>['mortgage','loan','debt'].includes(x.recordType)).reduce((a,x)=>a+Math.abs(val(x,'balance','debtBalance')),0);
 const property=v.records.filter(x=>x.recordType==='property').reduce((a,x)=>a+val(x,'marketValue','estimatedValue','value'),0);
 const vaultBank=v.records.filter(x=>x.recordType==='bank-data').reduce((a,x)=>a+val(x,'balance','cashBalance','currentBalance'),0),planCash=Number(s.financePlan?.cashNow||0),bank=vaultBank>0?vaultBank:(s.financePlan?.updatedAt&&Number.isFinite(planCash)?Math.max(0,planCash):0);
 const xtb=Object.values(s.xtbHub?.accounts||{}).reduce((a,x)=>a+val(x,'totalValueCzk','marketValueCzk','valueCzk'),0);
 const generic=[...(s.investments?.positions||[]),...(s.portfolio?.positions||[])].reduce((a,x)=>a+val(x,'marketValueCzk','valueCzk'),0);
 const tickets=(s.ticketBook?.items||[]).filter(x=>['HOLD','LISTED','OPEN'].includes(String(x.workflow||'').toUpperCase())).reduce((a,x)=>a+Number(x.buy||x.buyTotalCzk||0),0);
 const tasks=(s.tasks||[]).filter(isOpen).filter(x=>/finan|bank|hypot|pojist|spoř|spor|invest|pen[ií]z/i.test(String(x.title||'')+' '+String(x.category||'')+' '+String(x.area||'')));
 const attention=[...v.action.slice(0,3).map(x=>({kind:'record',id:x.id,title:x.title,detail:x.status?.detail||x.nextAction||'Zkontrolovat údaj',severity:x.status?.severity||60})),...tasks.slice(0,3).map(x=>({kind:'task',id:x.id,title:x.title||'Finanční úkol',detail:x.due?'Termín '+new Date(x.due).toLocaleDateString('cs-CZ'):'Bez termínu',severity:55}))].sort((a,b)=>b.severity-a.severity).slice(0,4);
 return {s,v,plan,debt,property,bank,invest:xtb+generic,tickets,assets:property+bank+xtb+generic+tickets,net:property+bank+xtb+generic+tickets-debt,mortgage:v.records.find(x=>x.recordType==='mortgage'),bankRecord:v.records.find(x=>x.recordType==='bank-data'),tasks,attention};
}
const tone=n=>n>=90?'bad':n>=65?'warn':'good';
function attentionHtml(rows){if(!rows.length)return '<div class="pr1300-empty">Nic finančního teď nevyžaduje zásah.</div>';return '<div class="pr1300-attention">'+rows.map(x=>'<button type="button" data-money-record="'+esc(x.kind==='record'?x.id:'')+'" data-money-task="'+esc(x.kind==='task'?x.id:'')+'"><i class="pr1300-dot '+tone(x.severity)+'"></i><span><b>'+esc(x.title)+'</b><small>'+esc(x.detail)+'</small></span><em>'+(x.kind==='record'?'otevřít':'úkol')+' →</em></button>').join('')+'</div>'}

export function renderMoneyOverview(){
 const host=document.querySelector('#moneyView');if(!host)return false;const d=data(),complete=d.property>0&&d.bank>0&&(d.invest>0||d.tickets>0);
 const headline=complete?money(d.net):(d.bank?money(d.bank):'Doplnit aktuální stav');
 const detail=complete?'Známé čisté jmění podle uložených aktiv a dluhů.':(d.bank?'Zatím ukazuju známou hotovost. Pro přesné čisté jmění chybí část majetku nebo investic.':'Nejdřív doplň aktuální bankovní stav; bez něj nechci ukazovat falešně přesné součty.');
 host.innerHTML='<div class="pr1300-shell" data-money-overview>' +
  '<div class="pr1300-head"><div><div class="pr1300-kicker">Peníze</div><h1>Co je potřeba udělat s penězi.</h1><p>Výchozí pohled je provozní: aktuální stav, problém a další krok. Analytika je až v detailu.</p></div><span class="pr1300-status '+(d.attention.length?'warn':'good')+'">'+(d.attention.length?d.attention.length+' k řešení':'klid')+'</span></div>' +
  '<section class="pr1320-now"><div><div class="pr1300-kicker">'+(complete?'Čisté jmění':'Známý stav')+'</div><h2>'+headline+'</h2><p>'+detail+'</p></div><div class="pr1320-now-actions"><button class="pr1300-btn primary" type="button" data-money-add>＋ Finanční úkol</button></div></section>' +
  '<div class="pr1320-meta"><span>Banky: '+(d.bank?money(d.bank):'doplnit')+'</span><span>Investice: '+money(d.invest)+'</span><span>Tickety: '+money(d.tickets)+'</span><span>Dluhy: '+money(d.debt)+'</span></div>' +
  '<section class="pr1300-panel"><div class="pr1300-panel-head"><h2>Potřebuje pozornost</h2><button class="pr1300-btn" type="button" data-money-advanced>Detail financí</button></div>'+attentionHtml(d.attention)+'</section>' +
  '<div class="pr1300-actions">'+(d.bankRecord?'<button class="pr1300-btn" type="button" data-money-bank>Aktualizovat bankovní data</button>':'')+(d.mortgage?'<button class="pr1300-btn" type="button" data-money-mortgage>Aktualizovat hypotéku</button>':'')+'</div></div>';
 if(!host.dataset.moneyOverviewBound){host.dataset.moneyOverviewBound='1';ownEvent1100(OWNER,host,'click',async e=>{const current=data();if(e.target.closest('[data-money-add]')){await createMoneyTask645();renderMoneyOverview();return}if(e.target.closest('[data-money-bank]')&&current.bankRecord){await updateBankSnapshot645(current.bankRecord.id);renderMoneyOverview();return}if(e.target.closest('[data-money-mortgage]')&&current.mortgage){await updateMortgageSnapshot645(current.mortgage.id);renderMoneyOverview();return}const row=e.target.closest('[data-money-record]');if(row?.dataset.moneyRecord){await openMoneyRecord645(row.dataset.moneyRecord);renderMoneyOverview();return}const task=e.target.closest('[data-money-task]');if(task?.dataset.moneyTask){const item=(store.get().tasks||[]).find(x=>String(x.id)===task.dataset.moneyTask);if(item)await openPersonalAction641({id:'task:'+item.id,kind:'task',title:item.title||'Finanční úkol',why:item.due?'Termín: '+new Date(item.due).toLocaleDateString('cs-CZ'):'Finanční úkol',next:item.notes||'Dokončit nebo naplánovat další krok.',route:'money'});return}if(e.target.closest('[data-money-advanced]')){host.dataset.productAdvanced='1';await loadProductAdvancedStyles(["./globalFintech137.css","./personal64.css"]);const m=await import('./moneyAdvanced100.js');await m.renderMoneyPage100?.()}})}

 window.__KAMIL_MONEY_OVERVIEW__={healthy:true,attention:d.attention.length,net:d.net,at:Date.now()};return true;
}