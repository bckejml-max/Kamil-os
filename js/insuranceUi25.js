import {store} from './state.js';
import {insuranceCenter,INSURANCE_KINDS} from './insurance25.js';
import {PERSONAL_CADENCES} from './personalAdmin25.js';
import {h,date,uid,qs,qsa,modal,toast} from './utils.js';

const tileId='insurance25Tile';
const tone=s=>s==='URGENT'?'bad':s==='SOON'||s==='REVIEW'?'warn':'good';
const label=s=>({URGENT:'ŘEŠIT',SOON:'BRZY',REVIEW:'DOPLNIT',OK:'OK'}[s]||s);
const opts=(map,selected)=>Object.entries(map).map(([k,v])=>`<option value="${k}" ${k===selected?'selected':''}>${h(v)}</option>`).join('');
const toDate=v=>v?String(v).slice(0,10):'';
const fmt=(v,c='CZK')=>v===null||v===undefined?'—':`${Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:2})} ${h(c)}`;

function ensureTile(){
 const view=qs('#moreView'),grid=view?.querySelector('.more24-grid');if(!grid||qs(`#${tileId}`,view))return;
 const a=insuranceCenter(store.get());
 const b=document.createElement('button');b.id=tileId;b.className='hub-tile';b.innerHTML=`<span class="hub-icon ${a.urgent?'bad':a.due30?'warn':'good'}">▣</span><span class="hub-copy"><b>Pojištění</b><small>${a.total?`${a.total} pojistek · ${a.due30} termínů do 30 dní`:'Pojistky, výročí, limity a výpovědi'}</small></span><span class="hub-arrow">→</span>`;b.onclick=renderInsurance;grid.prepend(b);
}

async function editPolicy(id=null){
 const s=store.get(),x=id?(s.personalAdmin?.items||[]).find(y=>y.id===id):null,info=x?.insurance||{};
 const v=(k,d='')=>x?.[k]??d,iv=(k,d='')=>info?.[k]??d;
 const body=`<div class="form-grid capture-form">
  <label class="wide-field">Název pojistky<input id="insTitle" autofocus value="${h(v('title'))}" placeholder="Např. Pojištění domu"></label>
  <label>Typ<select id="insKind">${opts(INSURANCE_KINDS,iv('kind','OTHER'))}</select></label>
  <label>Pojištěná osoba / majetek<input id="insInsured" value="${h(iv('insured'))}" placeholder="Např. dům / rodina / auto"></label>
  <label>Pojišťovna<input id="insProvider" value="${h(v('provider'))}"></label>
  <label>Číslo smlouvy<input id="insNumber" value="${h(iv('policyNumber'))}"></label>
  <label>Kontakt / poradce<input id="insContact" value="${h(iv('contact'))}"></label>
  <label>Pojistné<input id="insPremium" type="number" min="0" step="0.01" value="${h(v('amount'))}"></label>
  <label>Měna<select id="insCurrency"><option value="CZK" ${v('currency','CZK')==='CZK'?'selected':''}>CZK</option><option value="EUR" ${v('currency')==='EUR'?'selected':''}>EUR</option><option value="USD" ${v('currency')==='USD'?'selected':''}>USD</option></select></label>
  <label>Periodicita<select id="insCadence">${opts(PERSONAL_CADENCES,v('cadence','YEARLY'))}</select></label>
  <label>Pojistný limit<input id="insCoverage" type="number" min="0" step="1" value="${h(iv('coverageAmount'))}"></label>
  <label>Spoluúčast<input id="insDeductible" type="number" min="0" step="1" value="${h(iv('deductible'))}"></label>
  <label>Další platba / kontrola<input id="insDue" type="date" value="${toDate(v('nextDue'))}"></label>
  <label>Výročí / expirace<input id="insRenewal" type="date" value="${toDate(v('renewalDate')||iv('endDate'))}"></label>
  <label>Výpověď nejpozději<input id="insNotice" type="date" value="${toDate(v('noticeDate'))}"></label>
  <label>Platba<select id="insAuto"><option value="false" ${!v('autoPay',false)?'selected':''}>Ručně / neznámé</option><option value="true" ${v('autoPay',false)?'selected':''}>Automatická</option></select></label>
  <label class="wide-field">Poznámka<textarea id="insNotes" rows="3">${h(v('notes'))}</textarea></label>
 </div><p class="muted">Kamil OS pouze eviduje skutečně zadané údaje. Nehodnotí odbornou dostatečnost pojistných limitů.</p>`;
 const ok=await modal(id?'Upravit pojistku':'Nová pojistka',body,[{label:'Zrušit',value:false},{label:'Uložit pojistku',value:true,primary:true}]);if(!ok)return;
 const title=qs('#insTitle')?.value?.trim();if(!title)return toast('Doplň název pojistky');
 const num=id=>{const raw=qs(id)?.value?.trim();if(raw==='')return null;const z=Number(raw);return Number.isFinite(z)&&z>=0?z:NaN};
 const amount=num('#insPremium'),coverageAmount=num('#insCoverage'),deductible=num('#insDeductible');if([amount,coverageAmount,deductible].some(z=>Number.isNaN(z)))return toast('Číselné hodnoty musí být platné');
 const now=new Date().toISOString();
 const next={id:id||uid('personal'),title,category:'INSURANCE',provider:qs('#insProvider').value.trim(),amount,currency:qs('#insCurrency').value,cadence:qs('#insCadence').value,nextDue:qs('#insDue').value||null,renewalDate:qs('#insRenewal').value||null,noticeDate:qs('#insNotice').value||null,autoPay:qs('#insAuto').value==='true',notes:qs('#insNotes').value.trim(),status:'ACTIVE',updatedAt:now,createdAt:x?.createdAt||now,insurance:{kind:qs('#insKind').value,insured:qs('#insInsured').value.trim(),policyNumber:qs('#insNumber').value.trim(),contact:qs('#insContact').value.trim(),coverageAmount,deductible}};
 store.mutate(`${id?'Upravena':'Přidána'} pojistka: ${title}`,z=>{z.personalAdmin=z.personalAdmin||{items:[]};z.personalAdmin.items=Array.isArray(z.personalAdmin.items)?z.personalAdmin.items:[];if(id){const i=z.personalAdmin.items.findIndex(y=>y.id===id);if(i>=0)z.personalAdmin.items[i]=next}else z.personalAdmin.items.unshift(next)});toast('Pojistka uložena');renderInsurance();
}

function costsHtml(costs){const rows=Object.entries(costs);return rows.length?rows.map(([c,v])=>`<span class="status">${h(c)} ${Number(v.monthly).toLocaleString('cs-CZ',{maximumFractionDigits:2})}/měs · ${Number(v.annual).toLocaleString('cs-CZ',{maximumFractionDigits:2})}/rok</span>`).join(' '):'<span class="status">Náklady nejsou zadané</span>'}

function renderInsurance(){
 const view=qs('#moreView'),a=insuranceCenter(store.get());if(!view)return;
 view.innerHTML=`<div class="subview-bar"><button class="btn" id="insuranceBack25">← Zpět</button><div><span>VÍCE</span><b>Pojištění</b></div></div>
 <div class="view-head compact"><div><div class="eyebrow">INSURANCE CENTER / 25.14</div><h1>Všechny pojistky na jednom místě</h1><p>Výročí, výpovědní lhůty, pojistné, limity, spoluúčast a co je potřeba doplnit.</p></div><div class="view-head-stat"><b class="${a.urgent?'bad':a.due30?'warn':'good'}">${a.urgent}</b><span>urgentních</span></div></div>
 <div class="metric-strip"><div class="metric"><span>Pojistek</span><b>${a.total}</b></div><div class="metric"><span>Do 30 dní</span><b class="${a.due30?'warn':'good'}">${a.due30}</b></div><div class="metric"><span>Pojištěných subjektů</span><b>${a.insuredSubjects}</b></div><div class="metric"><span>Neúplných</span><b class="${a.incomplete?'warn':'good'}">${a.incomplete}</b></div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">NÁKLADY PO MĚNÁCH</div><h2>Pojistné bez falešných FX součtů</h2></div><div>${costsHtml(a.costs)}</div></div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">RADAR POJISTEK</div><h2>Co zkontrolovat jako první</h2></div><button class="btn primary" id="insuranceAdd25">＋ Pojistka</button></div>
 <div class="intel-list">${a.policies.map(x=>`<div class="intel-row"><div class="intel-main"><div><span class="status ${tone(x.status)}">${label(x.status)} · ${h(x.kindLabel)}</span>${x.autoPay?' <span class="status good">AUTOPAY</span>':''}</div><b>${h(x.title)}</b><span>${h(x.issues[0]||x.insured||x.provider||'Bez aktuálního upozornění')}</span><small>${x.insured?`Pojištěno: ${h(x.insured)} · `:''}pojistné ${fmt(x.premium,x.currency||'CZK')} · limit ${fmt(x.coverage,x.currency||'CZK')} · spoluúčast ${fmt(x.deductible,x.currency||'CZK')} · výročí/expirace ${x.renewal?date(x.renewal):'—'}</small></div><div class="row-actions"><button class="btn" data-ins-edit="${h(x.id)}">Detail</button><button class="btn quiet-action" data-ins-archive="${h(x.id)}">Archivovat</button></div></div>`).join('')||'<div class="empty">Zatím není evidovaná žádná pojistka.</div>'}</div>
 <div class="decision-note">${h(a.note)} „Neúplná“ znamená pouze chybějící evidenční údaje; není to tvrzení, že je pojistka špatně nastavená.</div></div>`;
 qs('#insuranceBack25').onclick=()=>window.dispatchEvent(new CustomEvent('kamil:more',{detail:'menu'}));qs('#insuranceAdd25').onclick=()=>editPolicy();qsa('[data-ins-edit]',view).forEach(b=>b.onclick=()=>editPolicy(b.dataset.insEdit));qsa('[data-ins-archive]',view).forEach(b=>b.onclick=()=>{const id=b.dataset.insArchive;store.mutate('Archivována pojistka',s=>{const x=s.personalAdmin?.items?.find(y=>y.id===id);if(x){x.status='ARCHIVED';x.updatedAt=new Date().toISOString()}});renderInsurance()});
}

const start=()=>{const view=qs('#moreView');if(!view)return;new MutationObserver(()=>queueMicrotask(ensureTile)).observe(view,{childList:true,subtree:true});ensureTile()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
