import {store} from './state.js';
import {simulateScenario,SCENARIO_TYPES,scenarioSimulatorNote} from './scenarioSimulator26.js';
import {h,qs,qsa} from './utils.js';

const hostId='scenarioSimulator26Host',resultId='scenario26Result';
let draft={type:'EXPENSE',amount:'',date:''},result=null;
const localDateKey=()=>{const d=new Date(),p=x=>String(x).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`};
const fmt=(v,c)=>`${Number(v||0).toLocaleString('cs-CZ',{maximumFractionDigits:0})} ${h(c||'CZK')}`;
const signed=(v,c)=>`${Number(v)>0?'+':''}${fmt(v,c)}`;
const verdictLabel=v=>({OK:'BEZPEČNÉ',CAUTION:'OPATRNĚ',BLOCK:'NEDĚLAT',RISK_REMAINS:'RIZIKO TRVÁ',IMPROVES:'ZLEPŠENÍ',OUTSIDE_HORIZON:'MIMO 90 DNÍ'}[v]||v||'—');
const verdictClass=v=>['BLOCK','RISK_REMAINS'].includes(v)?'bad':['CAUTION','OUTSIDE_HORIZON'].includes(v)?'warn':'good';

function resultHtml(r,currency){
 if(!r)return `<div class="decision-note">Zadej částku a klikni na Simulovat. ${h(scenarioSimulatorNote)}</div>`;
 if(!r.ok)return `<div class="decision-note bad"><b>${h(r.message)}</b><br>${h(r.note)}</div>`;
 const b=r.base,a=r.sim;
 return `<div class="metric-strip">
  <div class="metric"><span>Minimum 90 dní</span><b class="${a.cashflow.minBalance<b.cashflow.minBalance?'warn':'good'}">${fmt(a.cashflow.minBalance,currency)}</b><small>před ${fmt(b.cashflow.minBalance,currency)} · ${signed(r.delta.minBalance,currency)}</small></div>
  <div class="metric"><span>Bezpečný prostor</span><b class="${a.allocation.safeBeforePlan<=0?'bad':a.allocation.safeBeforePlan<b.allocation.safeBeforePlan?'warn':'good'}">${fmt(a.allocation.safeBeforePlan,currency)}</b><small>před ${fmt(b.allocation.safeBeforePlan,currency)} · ${signed(r.delta.safeBeforePlan,currency)}</small></div>
  <div class="metric"><span>Další bezpečný kapitál</span><b class="${a.allocation.newCapital<=0?'warn':'good'}">${fmt(a.allocation.newCapital,currency)}</b><small>před ${fmt(b.allocation.newCapital,currency)} · ${signed(r.delta.newCapital,currency)}</small></div>
  <div class="metric"><span>Konec 90 dní</span><b>${fmt(a.cashflow.endBalance,currency)}</b><small>${signed(r.delta.endBalance,currency)}</small></div>
 </div>
 <div class="decision-note ${verdictClass(r.verdict)}"><b>${h(verdictLabel(r.verdict))}</b> · ${h(r.reason)}${a.cashflow.belowReserveDate?` Rezerva je podle scénáře prolomena od <b>${h(a.cashflow.belowReserveDate)}</b>.`:''}</div>
 <div class="row"><span>Scénář</span><b>${h(r.typeLabel)} · ${fmt(r.amount,currency)} · ${h(r.date)}</b></div>
 <div class="row"><span>90denní stav</span><b class="${a.cashflow.status==='RISK'?'bad':a.cashflow.status==='TIGHT'?'warn':'good'}">${h(a.cashflow.status)}</b></div>
 <div class="decision-note">${h(r.note)}</div>`;
}

function render(){
 const view=qs('#moneyView');if(!view||!view.childElementCount)return;
 const currency=String(store.get().financePlan?.currency||'CZK').toUpperCase();if(!draft.date)draft.date=localDateKey();
 let host=qs(`#${hostId}`,view);if(!host){host=document.createElement('div');host.id=hostId;host.className='card';const anchor=qs('#capitalAllocation25Host',view)||qs('#cashflow90Host',view)||qs('#personalMoney26Host',view);if(anchor?.parentNode)anchor.parentNode.insertBefore(host,anchor.nextSibling);else view.appendChild(host)}
 if(result?.ok)result=simulateScenario(store.get(),{...draft,currency},new Date());
 host.innerHTML=`<div class="card-head"><div><div class="eyebrow">SCENARIO SIMULATOR / 26.3</div><h2>Co když…</h2></div><span class="status good">NEUKLÁDÁ SE</span></div>
 <div class="form-grid capture-form"><label>Scénář<select id="scenario26Type">${Object.entries(SCENARIO_TYPES).map(([k,v])=>`<option value="${k}" ${draft.type===k?'selected':''}>${h(v)}</option>`).join('')}</select></label><label>Částka (${h(currency)})<input id="scenario26Amount" type="number" min="1" step="1" value="${h(draft.amount)}" placeholder="25000"></label><label>Datum<input id="scenario26Date" type="date" value="${h(draft.date)}"></label><div class="wide-field row-actions"><button class="btn" data-scenario-preset="25000">25 000</button><button class="btn" data-scenario-preset="50000">50 000</button><button class="btn" data-scenario-preset="100000">100 000</button><button class="btn primary" id="scenario26Run">Simulovat</button></div></div>
 <div id="${resultId}">${resultHtml(result,currency)}</div>`;
 bind(host,currency);
}

function bind(host,currency){
 const syncDraft=()=>{draft={type:qs('#scenario26Type',host)?.value||'EXPENSE',amount:qs('#scenario26Amount',host)?.value||'',date:qs('#scenario26Date',host)?.value||localDateKey()}};
 const invalidate=()=>{syncDraft();if(result!==null){result=null;const box=qs(`#${resultId}`,host);if(box)box.innerHTML=resultHtml(null,currency)}};
 qs('#scenario26Run',host)?.addEventListener('click',()=>{syncDraft();result=simulateScenario(store.get(),{...draft,currency},new Date());render()});
 qsa('[data-scenario-preset]',host).forEach(b=>b.addEventListener('click',()=>{const input=qs('#scenario26Amount',host);if(input)input.value=b.dataset.scenarioPreset;syncDraft();result=simulateScenario(store.get(),{...draft,currency},new Date());render()}));
 qs('#scenario26Type',host)?.addEventListener('change',invalidate);qs('#scenario26Amount',host)?.addEventListener('input',invalidate);qs('#scenario26Date',host)?.addEventListener('change',invalidate);
}

function start(){const view=qs('#moneyView');if(!view)return;new MutationObserver(()=>{if(!qs(`#${hostId}`,view)&&view.childElementCount)queueMicrotask(render)}).observe(view,{childList:true});if(view.childElementCount)render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
