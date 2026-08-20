import {store} from './state.js';
import {documentsCenter,DOCUMENT_KINDS} from './documents25.js';
import {h,date,uid,qs,qsa,modal,toast} from './utils.js';

const tileId='documents25Tile';
const tone=s=>s==='URGENT'?'bad':s==='SOON'||s==='REVIEW'?'warn':'good';
const label=s=>({URGENT:'ŘEŠIT',SOON:'BRZY',REVIEW:'DOPLNIT',OK:'OK'}[s]||s);
const opts=(map,selected)=>Object.entries(map).map(([k,v])=>`<option value="${k}" ${k===selected?'selected':''}>${h(v)}</option>`).join('');
const toDate=v=>v?String(v).slice(0,10):'';

function ensureTile(){const view=qs('#moreView'),grid=view?.querySelector('.more24-grid');if(!grid||qs(`#${tileId}`,view))return;const a=documentsCenter(store.get());const b=document.createElement('button');b.id=tileId;b.className='hub-tile';b.innerHTML=`<span class="hub-icon ${a.expired?'bad':a.due30?'warn':'good'}">▤</span><span class="hub-copy"><b>Doklady & expirace</b><small>${a.total?`${a.total} položek · ${a.due30} do 30 dní`:'Doklady, STK, revize, záruky a servis'}</small></span><span class="hub-arrow">→</span>`;b.onclick=renderDocuments;grid.prepend(b)}

async function editDocument(id=null){
 const s=store.get(),x=id?(s.personalAdmin?.items||[]).find(y=>y.id===id):null,d=x?.document||{},v=(k,z='')=>x?.[k]??z,dv=(k,z='')=>d?.[k]??z;
 const body=`<div class="form-grid capture-form">
 <label class="wide-field">Název<input id="docTitle" autofocus value="${h(v('title'))}" placeholder="Např. Občanka Kamil / STK auto / Revize kotle"></label>
 <label>Typ<select id="docKind">${opts(DOCUMENT_KINDS,dv('kind','OTHER'))}</select></label>
 <label>Držitel / objekt<input id="docHolder" value="${h(dv('holder'))}" placeholder="Osoba, auto, dům…"></label>
 <label>Číslo / identifikace<input id="docNumber" value="${h(dv('number'))}"></label>
 <label>Vydal / poskytovatel<input id="docIssuer" value="${h(dv('issuer')||v('provider'))}"></label>
 <label>Expirace / kontrola<input id="docExpiry" type="date" value="${toDate(dv('expiryDate')||v('renewalDate')||v('nextDue'))}"></label>
 <label>Připomenout od<input id="docReminder" type="date" value="${toDate(dv('reminderDate'))}"></label>
 <label class="wide-field">Poznámka<textarea id="docNotes" rows="3">${h(v('notes'))}</textarea></label>
 </div><p class="muted">Zapisuj jen skutečný termín. Kamil OS nevytváří zákonné lhůty ani automaticky neobjednává obnovu nebo servis.</p>`;
 const ok=await modal(id?'Upravit doklad / expiraci':'Nový doklad / expirace',body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);if(!ok)return;
 const title=qs('#docTitle')?.value?.trim();if(!title)return toast('Doplň název');const now=new Date().toISOString();
 const next={...x,id:id||uid('personal'),title,category:'DOCUMENT',provider:qs('#docIssuer').value.trim(),renewalDate:qs('#docExpiry').value||null,nextDue:null,status:'ACTIVE',notes:qs('#docNotes').value.trim(),updatedAt:now,createdAt:x?.createdAt||now,document:{kind:qs('#docKind').value,holder:qs('#docHolder').value.trim(),number:qs('#docNumber').value.trim(),issuer:qs('#docIssuer').value.trim(),expiryDate:qs('#docExpiry').value||null,reminderDate:qs('#docReminder').value||null}};
 store.mutate(`${id?'Upraven':'Přidán'} doklad / expirace: ${title}`,z=>{z.personalAdmin=z.personalAdmin||{items:[]};z.personalAdmin.items=Array.isArray(z.personalAdmin.items)?z.personalAdmin.items:[];if(id){const i=z.personalAdmin.items.findIndex(y=>y.id===id);if(i>=0)z.personalAdmin.items[i]=next}else z.personalAdmin.items.unshift(next)});toast('Doklad / expirace uložena');renderDocuments();
}

function renderDocuments(){const view=qs('#moreView'),a=documentsCenter(store.get());if(!view)return;view.innerHTML=`<div class="subview-bar"><button class="btn" id="docsBack25">← Zpět</button><div><span>VÍCE</span><b>Doklady & expirace</b></div></div><div class="view-head compact"><div><div class="eyebrow">DOCUMENTS & EXPIRY / 25.16</div><h1>Nic důležitého nesmí propadnout</h1><p>Doklady, STK, dálniční známky, revize, záruky a servisní termíny.</p></div><div class="view-head-stat"><b class="${a.expired?'bad':a.due30?'warn':'good'}">${a.expired}</b><span>po expiraci</span></div></div><div class="metric-strip"><div class="metric"><span>Do 30 dní</span><b class="${a.due30?'warn':'good'}">${a.due30}</b></div><div class="metric"><span>Do 60 dní</span><b>${a.due60}</b></div><div class="metric"><span>Do 90 dní</span><b>${a.due90}</b></div><div class="metric"><span>Chybí termín</span><b class="${a.missing?'warn':'good'}">${a.missing}</b></div></div><div class="card"><div class="card-head"><div><div class="eyebrow">EXPIRY RADAR</div><h2>Co řešit jako první</h2></div><button class="btn primary" id="docsAdd25">＋ Přidat</button></div><div class="intel-list">${a.items.map(x=>`<div class="intel-row"><div class="intel-main"><div><span class="status ${tone(x.status)}">${label(x.status)} · ${h(x.kindLabel)}</span></div><b>${h(x.title)}</b><span>${h(x.issues[0]||x.holder||x.issuer||'Bez aktuálního upozornění')}</span><small>${x.holder?`Držitel / objekt: ${h(x.holder)} · `:''}expirace ${x.expiry?date(x.expiry):'—'}${x.reminder?` · připomenout od ${date(x.reminder)}`:''}</small></div><div class="row-actions"><button class="btn" data-doc-edit="${h(x.id)}">Detail</button><button class="btn quiet-action" data-doc-archive="${h(x.id)}">Archivovat</button></div></div>`).join('')||'<div class="empty">Zatím nejsou evidované žádné doklady nebo expirace.</div>'}</div><div class="decision-note">${h(a.note)}</div></div>`;
 qs('#docsBack25').onclick=()=>window.dispatchEvent(new CustomEvent('kamil:more',{detail:'menu'}));qs('#docsAdd25').onclick=()=>editDocument();qsa('[data-doc-edit]',view).forEach(b=>b.onclick=()=>editDocument(b.dataset.docEdit));qsa('[data-doc-archive]',view).forEach(b=>b.onclick=()=>{const id=b.dataset.docArchive;store.mutate('Archivován doklad / expirace',s=>{const x=s.personalAdmin?.items?.find(y=>y.id===id);if(x){x.status='ARCHIVED';x.updatedAt=new Date().toISOString()}});renderDocuments()});
}
const start=()=>{const view=qs('#moreView');if(!view)return;new MutationObserver(()=>queueMicrotask(ensureTile)).observe(view,{childList:true,subtree:true});ensureTile()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
