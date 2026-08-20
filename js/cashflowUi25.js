import {store} from './state.js';
import {cashflow90} from './cashflow25.js';
import {h,money,qs,qsa,modal,uid,toast} from './utils.js';

const hostId='cashflow90Host';
const cadenceLabel=x=>({once:'jednorázově',weekly:'týdně',monthly:'měsíčně'}[x]||x);
const sourceLabel=x=>({RECEIVABLE:'pohledávka',PERSONAL_ADMIN:'osobní závazek',MANUAL:'ruční plán'}[x]||'plán');
const statusText=x=>x==='RISK'?'Rezerva bude porušena':x==='TIGHT'?'Těsně nad rezervou':'Rezerva drží';
const statusClass=x=>x==='RISK'?'bad':x==='TIGHT'?'warn':'good';

function card(){
 const s=store.get(),cf=cashflow90(s),entries=Array.isArray(s.financePlan?.cashflow)?s.financePlan.cashflow:[];
 return `<div class="card cashflow90-card" id="${hostId}" style="margin-top:12px">
  <div class="card-head"><div><div class="eyebrow">CASHFLOW / 90 DNÍ</div><h2>Kolik hotovosti opravdu zbude</h2></div><div class="row-actions"><span class="status ${statusClass(cf.status)}">${h(statusText(cf.status))}</span><button class="btn" id="cashflowAdd25">＋ Tok</button></div></div>
  <div class="metric-strip"><div class="metric"><span>Za 90 dní</span><b class="${cf.endBalance>=cf.reserve?'good':'bad'}">${money(cf.endBalance)}</b></div><div class="metric"><span>Minimum</span><b class="${cf.minBalance>=cf.reserve?'good':'bad'}">${money(cf.minBalance)}</b></div><div class="metric"><span>Příjmy</span><b>${money(cf.inflow)}</b></div><div class="metric"><span>Výdaje</span><b>${money(cf.outflow)}</b></div></div>
  ${cf.belowReserveDate?`<div class="decision-note warn"><b>Riziko likvidity:</b> podle uložených toků klesne hotovost pod rezervní minimum ${money(cf.reserve)} už ${h(cf.belowReserveDate)}.</div>`:`<div class="decision-note ${cf.status==='TIGHT'?'warn':''}">Nejnižší očekávaný zůstatek je ${money(cf.minBalance)} (${h(cf.minDate)}). Rezervní minimum: ${money(cf.reserve)}.</div>`}
  <div class="decision-note"><b>Osobní závazky:</b> ${cf.personalObligations} položek v ${h(cf.primaryCurrency)} je započteno přímo do výhledu.${cf.personalIgnoredCurrency?` ${cf.personalIgnoredCurrency} položek v jiné měně je bezpečně ignorováno bez domyšleného FX kurzu.`:''}${cf.personalMissingAmount||cf.personalMissingDate?` Neúplné osobní položky: ${cf.personalMissingAmount} bez částky, ${cf.personalMissingDate} bez termínu.`:''}</div>
  <div class="grid two" style="margin-top:10px"><div><div class="eyebrow">NEJBLIŽŠÍ TOKY</div><div class="intel-list">${cf.next.map(x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.label)}</b><span>${h(x.date)} · ${h(sourceLabel(x.source))}${x.overdue?' · po termínu započteno dnes':''}</span></div><b class="${x.amount>=0?'good':'bad'}">${x.amount>=0?'+':''}${money(x.amount)}</b></div>`).join('')||'<div class="empty">Žádné naplánované peněžní toky.</div>'}</div></div><div><div class="eyebrow">RUČNÍ PLÁN</div><div class="intel-list">${entries.filter(x=>x.active!==false).slice(0,8).map(x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.label||'Cashflow')}</b><span>${h(x.date||'bez data')} · ${h(cadenceLabel(x.cadence||'once'))}</span></div><div class="row-actions"><b class="${Number(x.amount||0)>=0?'good':'bad'}">${Number(x.amount||0)>=0?'+':''}${money(x.amount)}</b><button class="btn" data-cashflow-edit25="${h(x.id)}">Upravit</button></div></div>`).join('')||'<div class="empty">Přidej příjem nebo výdaj s konkrétním datem.</div>'}</div></div></div>
  <div class="decision-note">${h(cf.note)} Částky se nikdy automaticky neposílají ani neinvestují.</div>
 </div>`;
}

function mount(){
 const view=qs('#moneyView');if(!view)return;
 const old=qs(`#${hostId}`,view);if(old)old.remove();
 const wrap=document.createElement('div');wrap.innerHTML=card();const node=wrap.firstElementChild;
 const first=view.querySelector('.metric-strip.money-metrics');
 if(first?.parentNode)first.parentNode.insertBefore(node,first.nextSibling);else view.appendChild(node);
 bind();
}

async function editEntry(id=null){
 const s=store.get(),list=Array.isArray(s.financePlan?.cashflow)?s.financePlan.cashflow:[],x=id?list.find(y=>y.id===id):null;
 const body=`<div class="form-grid"><label class="wide-field">Název<input id="cf25label" autofocus value="${h(x?.label||'') }" placeholder="Výplata, hypotéka, školka…"></label><label>Částka Kč<input id="cf25amount" type="number" value="${Number(x?.amount||0)}"><small>Kladná = příjem, záporná = výdaj</small></label><label>První datum<input id="cf25date" type="date" value="${h(x?.date||'')}"></label><label>Opakování<select id="cf25cadence"><option value="once" ${(x?.cadence||'once')==='once'?'selected':''}>Jednorázově</option><option value="weekly" ${x?.cadence==='weekly'?'selected':''}>Týdně</option><option value="monthly" ${x?.cadence==='monthly'?'selected':''}>Měsíčně</option></select></label></div>`;
 const actions=[{label:'Zrušit',value:'cancel'}];if(x)actions.push({label:'Odstranit',value:'delete'});actions.push({label:'Uložit',value:'save',primary:true});
 const result=await modal(x?'Upravit cashflow':'Přidat cashflow',body,actions);if(result==='cancel'||result===false)return;
 if(result==='delete'){
  store.mutate('Cashflow položka odstraněna',st=>{st.financePlan=st.financePlan||{};st.financePlan.cashflow=(st.financePlan.cashflow||[]).filter(y=>y.id!==id)});toast('Cashflow položka odstraněna');return;
 }
 const label=qs('#cf25label')?.value.trim()||'Cashflow',amount=Number(qs('#cf25amount')?.value||0),date=qs('#cf25date')?.value||null,cadence=qs('#cf25cadence')?.value||'once';
 if(!date||!Number.isFinite(amount)||amount===0){toast('Vyplň datum a nenulovou částku');return}
 store.mutate(x?'Cashflow položka upravena':'Cashflow položka přidána',st=>{st.financePlan=st.financePlan||{};st.financePlan.cashflow=Array.isArray(st.financePlan.cashflow)?st.financePlan.cashflow:[];if(x){const t=st.financePlan.cashflow.find(y=>y.id===id);if(t)Object.assign(t,{label,amount,date,cadence,active:true})}else st.financePlan.cashflow.push({id:uid('cashflow'),label,amount,date,cadence,active:true})});
}

function bind(){qs('#cashflowAdd25')?.addEventListener('click',()=>editEntry());qsa('[data-cashflow-edit25]').forEach(b=>b.addEventListener('click',()=>editEntry(b.dataset.cashflowEdit25)))}

const observer=new MutationObserver(mutations=>{const view=qs('#moneyView');if(!view||qs(`#${hostId}`,view))return;if(mutations.some(m=>m.target?.id==='moneyView'||m.target?.closest?.('#moneyView')))queueMicrotask(mount)});
const start=()=>{const view=qs('#moneyView');if(!view)return;observer.observe(view,{childList:true});if(view.childElementCount&&!qs(`#${hostId}`,view))mount();store.subscribe(()=>{if(qs('#view-money')?.classList.contains('on'))queueMicrotask(mount)})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
