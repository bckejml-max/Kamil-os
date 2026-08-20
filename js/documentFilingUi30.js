import {store} from './state.js';
import {documentFilingRecommendation,documentReminderPatch,documentFiling30Note} from './documentFiling30.js';
import {h,qs,modal,toast} from './utils.js';

const fmtDate=v=>{const d=new Date(`${String(v||'').slice(0,10)}T12:00:00`);return Number.isFinite(d.getTime())?d.toLocaleDateString('cs-CZ'):'—'};
const when=x=>x.days===null?'':x.days<0?`${Math.abs(x.days)} dní po termínu`:x.days===0?'dnes':`za ${x.days} dní`;
function navigate(target='home',homeMode=null){window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:target}));if(target==='home'&&homeMode)queueMicrotask(()=>window.dispatchEvent(new CustomEvent('kamil:home-open',{detail:homeMode})))}
function recordById(id){return (store.get().personalAdmin?.items||[]).find(x=>x.id===id&&String(x.status||'ACTIVE').toUpperCase()!=='ARCHIVED')||null}

async function setReminder(id){
 const record=recordById(id);if(!record)return toast('Dokument už není aktivní.');const expiry=record.document?.expiryDate||record.renewalDate||record.endDate||null;
 const ok=await modal('Vlastní předstih před expirací',`<label>Datum připomínky<input id="filing30ReminderDate" type="date" autofocus></label><div class="decision-note"><b>Expirace / kontrola</b><div>${h(fmtDate(expiry))}</div></div><p class="muted">Datum nechávám zcela na tobě. Kamil OS nepředvyplňuje 7/30/60 dní a nevymýšlí právní ani servisní lhůtu.</p>`,[{label:'Zrušit',value:false},{label:'Uložit datum',value:true,primary:true}]);if(!ok)return;
 const value=qs('#filing30ReminderDate')?.value||'',patch=documentReminderPatch(record,value,new Date());if(!patch.ok)return toast(patch.message||'Datum nelze uložit.');
 store.mutate(`Vlastní předstih: ${record.title||'doklad'}`,s=>{const x=s.personalAdmin?.items?.find(y=>y.id===id);if(!x)return;x.document=patch.patch.document;x.updatedAt=new Date().toISOString()});toast('Vlastní datum předstihu uloženo.');navigate('home','documents');
}

export async function showDocumentFiling(id){
 const record=recordById(id);if(!record)return null;const r=documentFilingRecommendation(record,store.get(),new Date());
 const tracked=r.tracked.map(x=>`<div class="row"><span><b>${h(x.label)}</b><small class="muted">${h(when(x))}</small></span><span>${h(fmtDate(x.date))}</span></div>`).join('')||'<div class="empty">Z potvrzených metadat zatím není co časově hlídat.</div>';
 const gaps=r.gaps.map(x=>`<div class="decision-note warn">${h(x)}</div>`).join('');
 const related=r.related.map(x=>`<div class="row"><span><b>${h(x.title)}</b><small class="muted">${h(x.reasons.join(' · '))}</small></span><span>${x.score}/100</span></div>`).join('')||'<div class="empty success-empty">Nenašel jsem silně související aktivní položku ve stejném registru.</div>';
 const body=`<div class="metric-strip"><div class="metric"><span>Zařazení</span><b>${h(r.filing.label)}</b></div><div class="metric"><span>Sledované termíny</span><b>${r.tracked.length}</b></div><div class="metric"><span>Související</span><b>${r.related.length}</b></div></div><div class="card" style="margin-top:12px"><div class="eyebrow">CO SE BUDE HLÍDAT</div>${tracked}</div>${gaps?`<div style="margin-top:10px">${gaps}</div>`:''}<div class="card" style="margin-top:12px"><div class="eyebrow">MOŽNÉ SOUVISEJÍCÍ POLOŽKY</div>${related}<p class="muted">Shoda je jen kandidát k ruční kontrole. Nic se automaticky neslučuje ani nepřepisuje.</p></div><p class="muted">${h(documentFiling30Note)}</p>`;
 const buttons=[{label:'Hotovo',value:'done',primary:true},{label:'Otevřít registr',value:'open'}];if(r.canSetReminder&&!r.tracked.some(x=>x.kind==='REMINDER'))buttons.push({label:'Nastavit vlastní předstih',value:'reminder'});
 const choice=await modal('Smart Filing · co dál s dokumentem',body,buttons);if(choice==='open')navigate(r.filing.target,r.filing.homeMode);else if(choice==='reminder')await setReminder(id);return r;
}

let lastShownId=null;
store.subscribe((s,reason)=>{
 if(!String(reason||'').startsWith('Document Scanner:'))return;
 const item=(s.personalAdmin?.items||[]).find(x=>x?.scanner30&&String(x.status||'ACTIVE').toUpperCase()!=='ARCHIVED');if(!item||item.id===lastShownId)return;lastShownId=item.id;queueMicrotask(()=>showDocumentFiling(item.id));
});
