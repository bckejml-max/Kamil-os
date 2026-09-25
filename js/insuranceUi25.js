import {store} from './state.js';
import {insuranceCenter,INSURANCE_KINDS,INSURANCE_LIFECYCLES} from './insurance25.js';
import {PERSONAL_CADENCES} from './personalAdmin25.js';
import {h,date,uid,qs,qsa,modal,toast} from './utils.js';

const tone=s=>s==='URGENT'?'bad':s==='SOON'||s==='REVIEW'?'warn':'good';
const label=s=>({URGENT:'ŘEŠIT',SOON:'BRZY',REVIEW:'OVĚŘIT',OK:'OK'}[s]||s);
const lifeTone=s=>({ACTIVE:'good',UPCOMING:'warn',TERMINATING:'warn',REVIEW:'bad',OFFER:'',HISTORY:''}[s]||'');
const opts=(map,selected)=>Object.entries(map).map(([k,v])=>`<option value="${k}" ${k===selected?'selected':''}>${h(v)}</option>`).join('');
const toDate=v=>v?String(v).slice(0,10):'';
const fmt=(v,c='CZK')=>v===null||v===undefined?'—':`${Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:2})} ${h(c)}`;

async function editPolicy(id=null){
 const s=store.get(),x=id?(s.personalAdmin?.items||[]).find(y=>y.id===id):null,info=x?.insurance||{};
 const v=(k,d='')=>x?.[k]??d,iv=(k,d='')=>info?.[k]??d;
 const body=`<div class="form-grid capture-form">
  <label class="wide-field">Název pojistky<input id="insTitle" autofocus value="${h(v('title'))}" placeholder="Např. Pojištění domu"></label>
  <label>Typ<select id="insKind">${opts(INSURANCE_KINDS,iv('kind','OTHER'))}</select></label>
  <label>Stav smlouvy<select id="insLifecycle">${opts(INSURANCE_LIFECYCLES,iv('lifecycle',x?.status==='ARCHIVED'?'HISTORY':'ACTIVE'))}</select></label>
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
 const next={...(x||{}),id:id||uid('personal'),title,category:'INSURANCE',provider:qs('#insProvider').value.trim(),amount,currency:qs('#insCurrency').value,cadence:qs('#insCadence').value,nextDue:qs('#insDue').value||null,renewalDate:qs('#insRenewal').value||null,noticeDate:qs('#insNotice').value||null,autoPay:qs('#insAuto').value==='true',notes:qs('#insNotes').value.trim(),status:qs('#insLifecycle').value==='HISTORY'?'ARCHIVED':'ACTIVE',updatedAt:now,createdAt:x?.createdAt||now,insurance:{...(info||{}),kind:qs('#insKind').value,lifecycle:qs('#insLifecycle').value,insured:qs('#insInsured').value.trim(),policyNumber:qs('#insNumber').value.trim(),contact:qs('#insContact').value.trim(),coverageAmount,deductible,sourceStatus:id?'MANUAL_OVERRIDE':(info?.sourceStatus||'MANUAL')}};
 store.mutate(`${id?'Upravena':'Přidána'} pojistka: ${title}`,z=>{z.personalAdmin=z.personalAdmin||{items:[]};z.personalAdmin.items=Array.isArray(z.personalAdmin.items)?z.personalAdmin.items:[];if(id){const i=z.personalAdmin.items.findIndex(y=>y.id===id);if(i>=0)z.personalAdmin.items[i]=next}else z.personalAdmin.items.unshift(next)});toast('Pojistka uložena');renderInsurance25();
}

function costsHtml(costs){const rows=Object.entries(costs);return rows.length?rows.map(([c,v])=>`<span class="status">${h(c)} ${Number(v.monthly).toLocaleString('cs-CZ',{maximumFractionDigits:2})}/měs · ${Number(v.annual).toLocaleString('cs-CZ',{maximumFractionDigits:2})}/rok</span>`).join(' '):'<span class="status">Náklady nejsou zadané</span>'}

function policyRows(rows,{archive=true}={}){
 return rows.map(x=>`<div class="intel-row"><div class="intel-main"><div><span class="status ${lifeTone(x.lifecycle)}">${h(x.lifecycleLabel)} · ${h(x.kindLabel)}</span> <span class="status ${tone(x.status)}">${label(x.status)}</span>${x.autoPay?' <span class="status good">AUTOPAY</span>':''}</div><b>${h(x.title)}</b><span>${h(x.issues[0]||x.notes||x.insured||x.provider||'Bez aktuálního upozornění')}</span><small>${x.provider?h(x.provider)+' · ':''}${x.policyNumber?'smlouva '+h(x.policyNumber)+' · ':''}${x.premium!==null?'pojistné '+fmt(x.premium,x.currency||'CZK')+' · ':''}${x.startDate?'počátek '+date(x.startDate)+' · ':''}${x.renewal?'výročí '+date(x.renewal):''}</small></div><div class="row-actions"><button class="btn" data-ins-edit="${h(x.id)}">Detail</button>${archive?'<button class="btn quiet-action" data-ins-archive="'+h(x.id)+'">Archivovat</button>':''}</div></div>`).join('');
}
export function renderInsurance25(){
 const view=qs('#moreView'),a=insuranceCenter(store.get());if(!view)return;
 view.innerHTML=`<div class="subview-bar"><button class="btn" id="insuranceBack25">← Zpět</button><div><span>VÍCE</span><b>Pojištění</b></div></div>
 <div class="view-head compact"><div><div class="eyebrow">INSURANCE CENTER / OS1336</div><h1>Všechny pojistky na jednom místě</h1><p>Aktivní smlouvy, nové smlouvy, ukončované pojistky, nabídky a historie jsou oddělené.</p></div><div class="view-head-stat"><b class="${a.review?'bad':a.terminating?'warn':'good'}">${a.active}</b><span>aktivních</span></div></div>
 <div class="metric-strip"><div class="metric"><span>Aktivní</span><b>${a.active}</b></div><div class="metric"><span>Začíná</span><b class="${a.upcoming?'warn':'good'}">${a.upcoming}</b></div><div class="metric"><span>Ukončované</span><b class="${a.terminating?'warn':'good'}">${a.terminating}</b></div><div class="metric"><span>Ověřit</span><b class="${a.review?'bad':'good'}">${a.review}</b></div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">AKTUÁLNÍ STAV SMLUV</div><h2>Aktivní, začínající, ukončované a k ověření</h2></div><div>${costsHtml(a.costs)}</div></div><div class="decision-note">Nákladový součet zahrnuje jen aktivní a začínající pojistky s potvrzenou částkou. Smlouvy „Ověřit“ a „Ukončované“ jsou v seznamu kvůli kontrole, ne jako potvrzený dlouhodobý náklad.</div><div class="intel-list">${policyRows(a.policies)||'<div class="empty">Žádná aktuální pojistka.</div>'}</div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">NABÍDKY</div><h2>Nesjednané varianty</h2></div><span class="status">${a.offers.length} nabídek</span></div><div class="intel-list">${policyRows(a.offers,{archive:false})||'<div class="empty">Žádná uložená nabídka.</div>'}</div></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">HISTORIE</div><h2>Ukončené / jednorázové pojistky</h2></div><span class="status">${a.history.length} záznamů</span></div><details><summary>Zobrazit historii</summary><div class="intel-list">${policyRows(a.history,{archive:false})||'<div class="empty">Bez historie.</div>'}</div></details></div>
 <div class="card"><div class="card-head"><div><div class="eyebrow">SPRÁVA</div><h2>Vlastní záznamy</h2></div><button class="btn primary" id="insuranceAdd25">＋ Pojistka</button></div><div class="decision-note">${h(a.note)} Náklady nahoře zahrnují jen aktivní a začínající pojistky s potvrzenou částkou; nabídky a historie se do nich nepočítají.</div></div>`;
 qs('#insuranceBack25').onclick=async()=>{const m=await import('./documentsPage141.js');m.renderDocumentsPage141?.()};qs('#insuranceAdd25').onclick=()=>editPolicy();qsa('[data-ins-edit]',view).forEach(b=>b.onclick=()=>editPolicy(b.dataset.insEdit));qsa('[data-ins-archive]',view).forEach(b=>b.onclick=()=>{const id=b.dataset.insArchive;store.mutate('Archivována pojistka',z=>{const x=z.personalAdmin?.items?.find(y=>y.id===id);if(x){x.status='ARCHIVED';x.insurance=x.insurance||{};x.insurance.lifecycle='HISTORY';x.updatedAt=new Date().toISOString()}});renderInsurance25()});
 window.__KAMIL_INSURANCE_CENTER1336__={healthy:true,active:a.active,upcoming:a.upcoming,terminating:a.terminating,review:a.review,offers:a.offers.length,history:a.history.length,total:a.all.length,at:Date.now()};
}

