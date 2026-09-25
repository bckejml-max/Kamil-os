import {store} from './state.js';
import {ensurePersonalVault640,personalVault640} from './personalVault640.js';
import {personalMoneyPlan650} from './personalAssistant650.js';
import {createMoneyTask645,updateBankSnapshot645,updateMortgageSnapshot645,openMoneyRecord645} from './personalMoneyActions645.js';
import {ownEvent1100} from './runtimeOwnership1100.js';
import {modal} from './utils.js';
import {loadProductAdvancedStyles} from './productAdvancedStyles.js';
import {openPersonalAction641} from './personalActionExecution641.js';

const OWNER='product.moneyOverview';
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v||0));
const knownNumber=v=>{if(v===null||v===undefined||String(v).trim()==='')return null;const n=Number(v);return Number.isFinite(n)?n:null};
const knownVal=(x,...keys)=>{for(const k of keys){const n=knownNumber(x?.[k]);if(n!==null)return n}return null};
const val=(x,...keys)=>knownVal(x,...keys)??0;
const isOpen=x=>!['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','CANCELLED','CANCELED'].includes(String(x?.status||'').toUpperCase());
let lastTransactionFocus='',lastTransactionFocusAt=0,lastWealthFocus='',lastWealthFocusAt=0;
async function openTransactionFocus1300(focus){const raw=String(focus||'');if(!raw.startsWith('transaction:'))return false;const now=Date.now();if(raw===lastTransactionFocus&&now-lastTransactionFocusAt<1600)return true;lastTransactionFocus=raw;lastTransactionFocusAt=now;const index=Number(raw.slice(12)),x=(store.get().personalSpending?.transactions||[])[index];if(!x)return false;const currency=String(x.currency||'CZK').toUpperCase(),amount=Number(x.amount||0),amountLabel=Number.isFinite(amount)?new Intl.NumberFormat('cs-CZ',{style:'currency',currency,maximumFractionDigits:2}).format(amount):'—',date=x.date||x.bookedAt||x.at||null;await modal('Transakce',`<div class="card"><div class="eyebrow">PENÍZE</div><h2>${esc(x.merchant||x.title||x.name||'Transakce')}</h2><div class="row"><span>Částka</span><b>${esc(amountLabel)}</b></div><div class="row"><span>Kategorie</span><b>${esc(x.category||'Nezařazeno')}</b></div><div class="row"><span>Datum</span><b>${esc(date?new Date(date).toLocaleDateString('cs-CZ'):'—')}</b></div>${x.description?`<p class="muted">${esc(x.description)}</p>`:''}</div>`,[{label:'Zavřít',value:null,primary:true}]);return true}
async function openWealthFocus1300(focus){const raw=String(focus||'');if(!raw.startsWith('wealth-snapshot:'))return false;const now=Date.now();if(raw===lastWealthFocus&&now-lastWealthFocusAt<1600)return true;lastWealthFocus=raw;lastWealthFocusAt=now;const index=Number(raw.slice(16)),x=(store.get().netWorthBook?.history||[])[index];if(!x)return false;const asOf=x.asOf||x.date||x.createdAt||null,net=knownNumber(x.netKnown??x.netWorth??x.value),assets=knownNumber(x.knownAssets??x.assets),debt=knownNumber(x.debt??x.debtCzk);await modal('Historie majetku',`<div class="card"><div class="eyebrow">PENÍZE · SNAPSHOT</div><h2>${esc(x.title||x.label||(asOf?'Stav '+new Date(asOf).toLocaleDateString('cs-CZ'):'Historický stav'))}</h2><div class="row"><span>Čisté jmění</span><b>${net===null?'—':money(net)}</b></div><div class="row"><span>Známá aktiva</span><b>${assets===null?'—':money(assets)}</b></div><div class="row"><span>Dluhy</span><b>${debt===null?'—':money(Math.abs(debt))}</b></div><div class="row"><span>Datum</span><b>${esc(asOf?new Date(asOf).toLocaleDateString('cs-CZ'):'—')}</b></div></div>`,[{label:'Zavřít',value:null,primary:true}]);return true}


export function moneyData1300(input=null){
 if(!input)ensurePersonalVault640();
 const s=input||store.get(),v=personalVault640(s),plan=personalMoneyPlan650(s);
 const debt=v.records.filter(x=>['mortgage','loan','debt'].includes(x.recordType)).reduce((a,x)=>a+Math.abs(val(x,'balance','debtBalance')),0);
 const property=v.records.filter(x=>x.recordType==='property').reduce((a,x)=>a+val(x,'marketValue','estimatedValue','value'),0);
 const bankValues=v.records.filter(x=>x.recordType==='bank-data'&&x.status?.code!=='ARCHIVED').map(x=>knownVal(x,'balance','cashBalance','currentBalance')).filter(x=>x!==null),vaultBank=bankValues.reduce((a,x)=>a+x,0),vaultBankKnown=bankValues.length>0,planCash=knownNumber(s.financePlan?.cashNow),planCashKnown=!!s.financePlan?.updatedAt&&planCash!==null,bank=vaultBankKnown?Math.max(0,vaultBank):(planCashKnown?Math.max(0,planCash):0),bankKnown=vaultBankKnown||planCashKnown;
 const xtb=Object.values(s.xtbHub?.accounts||{}).reduce((a,x)=>a+val(x,'totalValueCzk','marketValueCzk','valueCzk'),0);
 const generic=[...(s.investments?.positions||[]),...(s.portfolio?.positions||[])].reduce((a,x)=>a+val(x,'marketValueCzk','valueCzk'),0);
 const tickets=(s.ticketBook?.items||[]).filter(x=>!x.issue&&['HOLD','LISTED','OPEN'].includes(String(x.workflow||'').toUpperCase())).reduce((a,x)=>a+Number(x.buy||x.buyTotalCzk||0),0);
 const tasks=(s.tasks||[]).filter(isOpen).filter(x=>/finan|bank|hypot|pojist|spoř|spor|invest|pen[ií]z/i.test(String(x.title||'')+' '+String(x.category||'')+' '+String(x.area||'')));
 const attention=[...v.action.slice(0,3).map(x=>({kind:'record',id:x.id,title:x.title,detail:x.status?.detail||x.nextAction||'Zkontrolovat údaj',severity:x.status?.severity||60})),...tasks.slice(0,3).map(x=>({kind:'task',id:x.id,title:x.title||'Finanční úkol',detail:x.due?'Termín '+new Date(x.due).toLocaleDateString('cs-CZ'):'Bez termínu',severity:55}))].sort((a,b)=>b.severity-a.severity).slice(0,4);
 return {s,v,plan,debt,property,bank,bankKnown,invest:xtb+generic,tickets,assets:property+bank+xtb+generic+tickets,net:property+bank+xtb+generic+tickets-debt,mortgage:v.records.find(x=>x.recordType==='mortgage'),bankRecord:v.records.find(x=>x.recordType==='bank-data'),tasks,attention};
}
const data=()=>moneyData1300();
const tone=n=>n>=90?'bad':n>=65?'warn':'good';
const attrs=x=>'data-money-record="'+esc(x.kind==='record'?x.id:'')+'" data-money-task="'+esc(x.kind==='task'?x.id:'')+'"';
function attentionHtml(rows){if(!rows.length)return '';return '<div class="pr1300-attention">'+rows.map(x=>'<button type="button" '+attrs(x)+'><i class="pr1300-dot '+tone(x.severity)+'"></i><span><b>'+esc(x.title)+'</b><small>'+esc(x.detail)+'</small></span><em>'+(x.kind==='record'?'otevřít':'úkol')+' →</em></button>').join('')+'</div>'}

export function renderMoneyOverview(){
 const host=document.querySelector('#moneyView');if(!host)return false;if(host.dataset.productAdvanced==='1')return true;
 const d=data(),complete=d.property>0&&d.bankKnown&&(d.invest>0||d.tickets>0),primary=d.attention[0]||null,rest=d.attention.slice(1);
 const headline=complete?money(d.net):(d.bankKnown?money(d.bank):'Doplnit aktuální stav');
 const detail=complete?'Známé čisté jmění podle uložených aktiv a dluhů.':(d.bankKnown?'Zatím ukazuju známou hotovost. Pro přesné čisté jmění chybí část majetku nebo investic.':'Nejdřív doplň aktuální bankovní stav; bez něj nechci ukazovat falešně přesné součty.');
 const primaryBlock=primary
  ?'<section class="pr1320-now os1334-primary os1334-money-now"><div><div class="pr1300-kicker">Teď vyřešit</div><h2>'+esc(primary.title)+'</h2><p>'+esc(primary.detail)+'</p></div><div class="pr1320-now-actions"><button class="pr1300-btn primary" type="button" '+attrs(primary)+'>Vyřešit →</button></div></section>'
  :'<section class="pr1320-now os1334-primary os1334-money-now clear"><div><div class="pr1300-kicker">Teď</div><h2>Nic finančního nehoří.</h2><p>OS teď nevidí žádný finanční záznam nebo úkol, který by vyžadoval okamžitý zásah.</p></div></section>';
 const stateBlock='<section class="pr1300-panel os1334-context-panel os1334-money-context"><div class="pr1300-panel-head"><div><h2>'+(complete?'Čisté jmění':'Známý stav')+'</h2><span>jen z uložených dat</span></div><button class="pr1300-btn" type="button" data-money-advanced>Detail financí</button></div><div class="os1334-context-value"><b>'+headline+'</b><small>'+detail+'</small></div><div class="os1334-mini-grid"><span><small>Banky</small><b>'+(d.bankKnown?money(d.bank):'doplnit')+'</b></span><span><small>Investice</small><b>'+money(d.invest)+'</b></span><span><small>Tickety</small><b>'+money(d.tickets)+'</b></span><span><small>Dluhy</small><b>'+money(d.debt)+'</b></span></div></section>';
 host.innerHTML='<div class="pr1300-shell" data-money-overview data-decision-surface1334>' +
  '<div class="pr1300-head"><div><div class="pr1300-kicker">Peníze</div><h1>Co je potřeba udělat s penězi.</h1><p>Jedna hlavní akce, vedle ní známý finanční stav. Detailní analytika zůstává na vyžádání.</p></div><span class="pr1300-status '+(d.attention.length?'warn':'good')+'">'+(d.attention.length?d.attention.length+' k řešení':'klid')+'</span></div>' +
  '<div class="os1334-decision-grid os1334-money-grid">'+primaryBlock+stateBlock+'</div>' +
  (rest.length?'<section class="pr1300-panel os1334-secondary-panel"><div class="pr1300-panel-head"><h2>Potom</h2><span>'+rest.length+' další</span></div>'+attentionHtml(rest)+'</section>':'') +
  '<div class="pr1300-actions"><button class="pr1300-btn primary" type="button" data-money-add>＋ Finanční úkol</button>'+(d.bankRecord?'<button class="pr1300-btn" type="button" data-money-bank>Aktualizovat bankovní data</button>':'')+(d.mortgage?'<button class="pr1300-btn" type="button" data-money-mortgage>Aktualizovat hypotéku</button>':'')+'</div></div>';
 if(!host.dataset.moneyOverviewBound){host.dataset.moneyOverviewBound='1';ownEvent1100(OWNER,window,'kamil:focus610',e=>{const focus=e.detail?.focus;void openTransactionFocus1300(focus);void openWealthFocus1300(focus)});ownEvent1100(OWNER,host,'click',async e=>{const current=data();if(e.target.closest('[data-money-add]')){await createMoneyTask645();renderMoneyOverview();return}if(e.target.closest('[data-money-bank]')&&current.bankRecord){await updateBankSnapshot645(current.bankRecord.id);renderMoneyOverview();return}if(e.target.closest('[data-money-mortgage]')&&current.mortgage){await updateMortgageSnapshot645(current.mortgage.id);renderMoneyOverview();return}const row=e.target.closest('[data-money-record]');if(row?.dataset.moneyRecord){await openMoneyRecord645(row.dataset.moneyRecord);renderMoneyOverview();return}const task=e.target.closest('[data-money-task]');if(task?.dataset.moneyTask){const item=(store.get().tasks||[]).find(x=>String(x.id)===task.dataset.moneyTask);if(item){await openPersonalAction641({id:'task:'+item.id,kind:'task',title:item.title||'Finanční úkol',why:item.due?'Termín: '+new Date(item.due).toLocaleDateString('cs-CZ'):'Finanční úkol',next:item.notes||'Dokončit nebo naplánovat další krok.',route:'money'});renderMoneyOverview()}return}if(e.target.closest('[data-money-advanced]')){host.dataset.productAdvanced='1';await loadProductAdvancedStyles(["./globalFintech137.css","./personal64.css"]);const m=await import('./moneyAdvanced100.js');await m.renderMoneyPage100?.()}})}
 window.__KAMIL_MONEY_OVERVIEW__={healthy:true,attention:d.attention.length,primary:primary?.title||null,net:d.net,tickets:d.tickets,decisionSurface:1334,at:Date.now()};return true;
}
