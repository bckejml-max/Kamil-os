import {store} from './state.js';
import {emergencyFile,emergencySnapshotText,EMERGENCY_CONTACT_ROLES,EMERGENCY_ASSET_KINDS,containsSecretLike,emergencyFileNote} from './emergencyFile26.js';
import {h,uid,qs,qsa,modal,toast} from './utils.js';

const hostId='emergencyFile26Host';
let expanded=false;
const opts=(map,selected)=>Object.entries(map).map(([k,v])=>`<option value="${k}" ${k===selected?'selected':''}>${h(v)}</option>`).join('');
const tone=score=>score>=85?'good':score>=60?'warn':'bad';

function ensureState(s){s.emergencyFile=s.emergencyFile||{contacts:[],assets:[]};s.emergencyFile.contacts=Array.isArray(s.emergencyFile.contacts)?s.emergencyFile.contacts:[];s.emergencyFile.assets=Array.isArray(s.emergencyFile.assets)?s.emergencyFile.assets:[]}
function secretBlocked(values){return values.some(containsSecretLike)}

async function editContact(id=null){
 const s=store.get(),x=id?(s.emergencyFile?.contacts||[]).find(y=>y.id===id):null,v=(k,d='')=>x?.[k]??d;
 const body=`<div class="form-grid capture-form"><label class="wide-field">Jméno / organizace<input id="efcName" autofocus value="${h(v('name'))}" placeholder="Koho volat"></label><label>Role<select id="efcRole">${opts(EMERGENCY_CONTACT_ROLES,v('role','OTHER'))}</select></label><label>Telefon<input id="efcPhone" value="${h(v('phone'))}" inputmode="tel"></label><label>E-mail<input id="efcEmail" value="${h(v('email'))}" inputmode="email"></label><label class="wide-field">Poznámka bez hesel/PINů<textarea id="efcNotes" rows="3">${h(v('notes'))}</textarea></label></div><p class="muted">${h(emergencyFileNote)}</p>`;
 const ok=await modal(id?'Upravit nouzový kontakt':'Nový nouzový kontakt',body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);if(!ok)return;
 const name=qs('#efcName')?.value?.trim(),phone=qs('#efcPhone')?.value?.trim(),email=qs('#efcEmail')?.value?.trim(),notes=qs('#efcNotes')?.value?.trim();if(!name)return toast('Doplň jméno nebo organizaci');
 if(secretBlocked([name,phone,email,notes]))return toast('Neukládej do Emergency File hesla, PINy, recovery/seed fráze ani privátní klíče.');
 const now=new Date().toISOString(),next={...x,id:id||uid('emergency-contact'),name,role:qs('#efcRole')?.value||'OTHER',phone,email,notes,status:'ACTIVE',updatedAt:now,createdAt:x?.createdAt||now};
 store.mutate(`${id?'Upraven':'Přidán'} nouzový kontakt: ${name}`,z=>{ensureState(z);if(id){const i=z.emergencyFile.contacts.findIndex(y=>y.id===id);if(i>=0)z.emergencyFile.contacts[i]=next}else z.emergencyFile.contacts.unshift(next)});toast('Nouzový kontakt uložen');
}

async function editAsset(id=null){
 const s=store.get(),x=id?(s.emergencyFile?.assets||[]).find(y=>y.id===id):null,v=(k,d='')=>x?.[k]??d;
 const body=`<div class="form-grid capture-form"><label class="wide-field">Co potřebuji najít<input id="efaTitle" autofocus value="${h(v('title'))}" placeholder="Např. pojistné smlouvy / náhradní klíče"></label><label>Typ<select id="efaKind">${opts(EMERGENCY_ASSET_KINDS,v('kind','OTHER'))}</select></label><label class="wide-field">Kde to najdu<input id="efaLocation" value="${h(v('location'))}" placeholder="Např. modré desky v pracovně / správce dokumentů"></label><label class="wide-field">Koho kontaktovat<input id="efaContact" value="${h(v('contact'))}" placeholder="Jméno, servis nebo instituce – bez přihlašovacích údajů"></label><label class="wide-field">Poznámka bez hesel/PINů<textarea id="efaNotes" rows="3">${h(v('notes'))}</textarea></label></div><p class="muted">Ukládej pouze orientaci, kde věc hledat. ${h(emergencyFileNote)}</p>`;
 const ok=await modal(id?'Upravit položku Emergency File':'Nová položka Emergency File',body,[{label:'Zrušit',value:false},{label:'Uložit',value:true,primary:true}]);if(!ok)return;
 const title=qs('#efaTitle')?.value?.trim(),location=qs('#efaLocation')?.value?.trim(),contact=qs('#efaContact')?.value?.trim(),notes=qs('#efaNotes')?.value?.trim();if(!title)return toast('Doplň, co chceš v nouzi najít');
 if(secretBlocked([title,location,contact,notes]))return toast('Neukládej do Emergency File hesla, PINy, recovery/seed fráze ani privátní klíče.');
 const now=new Date().toISOString(),next={...x,id:id||uid('emergency-asset'),title,kind:qs('#efaKind')?.value||'OTHER',location,contact,notes,status:'ACTIVE',updatedAt:now,createdAt:x?.createdAt||now};
 store.mutate(`${id?'Upravena':'Přidána'} nouzová položka: ${title}`,z=>{ensureState(z);if(id){const i=z.emergencyFile.assets.findIndex(y=>y.id===id);if(i>=0)z.emergencyFile.assets[i]=next}else z.emergencyFile.assets.unshift(next)});toast('Nouzová položka uložena');
}

function archive(kind,id){store.mutate('Archivována položka Emergency File',s=>{ensureState(s);const list=kind==='contact'?s.emergencyFile.contacts:s.emergencyFile.assets,x=list.find(y=>y.id===id);if(x){x.status='ARCHIVED';x.updatedAt=new Date().toISOString()}});}
async function copySnapshot(){try{await navigator.clipboard.writeText(emergencySnapshotText(store.get()));toast('Nouzový přehled zkopírován bez čísel smluv a dokladů')}catch{toast('Kopírování není v tomto prohlížeči dostupné')}}

function detailHtml(e){
 const role=k=>EMERGENCY_CONTACT_ROLES[k]||EMERGENCY_CONTACT_ROLES.OTHER,kind=k=>EMERGENCY_ASSET_KINDS[k]||EMERGENCY_ASSET_KINDS.OTHER;
 return `<div class="decision-note">${h(emergencyFileNote)}</div>
 <div class="section-head"><div><span>NOUZOVÉ KONTAKTY</span><h3>Komu zavolat</h3></div><button class="btn primary" data-ef-add-contact>＋ Kontakt</button></div>
 <div class="intel-list">${e.contacts.map(x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.name||'Bez názvu')}</b><span>${h(role(x.role))}${x.phone?` · ${h(x.phone)}`:''}${x.email?` · ${h(x.email)}`:''}</span></div><div class="row-actions"><button class="btn" data-ef-edit-contact="${h(x.id)}">Upravit</button><button class="btn" data-ef-archive-contact="${h(x.id)}">Archivovat</button></div></div>`).join('')||'<div class="empty">Přidej alespoň jeden kontakt, kterému lze v nouzi zavolat.</div>'}</div>
 <div class="section-head"><div><span>KDE CO NAJÍT</span><h3>Orientační index důležitých věcí</h3></div><button class="btn primary" data-ef-add-asset>＋ Položka</button></div>
 <div class="intel-list">${e.assets.map(x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.title||'Bez názvu')}</b><span>${h(kind(x.kind))}${x.location?` · ${h(x.location)}`:' · chybí umístění'}${x.contact?` · kontakt: ${h(x.contact)}`:''}</span></div><div class="row-actions"><button class="btn" data-ef-edit-asset="${h(x.id)}">Upravit</button><button class="btn" data-ef-archive-asset="${h(x.id)}">Archivovat</button></div></div>`).join('')||'<div class="empty">Přidej, kde v nouzi najít dokumenty, klíče, pojistky nebo servisní informace.</div>'}</div>
 <div class="section-head"><div><span>EXISTUJÍCÍ OSOBNÍ EVIDENCE</span><h3>Co už Kamil OS zná</h3></div></div>
 <div class="metric-strip"><div class="metric"><span>Pojistky</span><b>${e.sources.insurance}</b></div><div class="metric"><span>Doklady</span><b>${e.sources.documents}</b></div><div class="metric"><span>Dům</span><b>${e.sources.home}</b></div><div class="metric"><span>Auto</span><b>${e.sources.vehicle}</b></div><div class="metric"><span>Rodina</span><b>${e.sources.familyMembers}</b></div></div>
 ${e.gaps.length?`<div class="intel-rules">${e.gaps.map(x=>`<div class="intel-rule"><span>Evidence</span><b>${h(x)}</b></div>`).join('')}</div>`:''}`;
}

function render(){
 const view=qs('#homeView');if(!view||!view.childElementCount)return;const e=emergencyFile(store.get());let host=qs(`#${hostId}`,view);
 if(!host){host=document.createElement('div');host.id=hostId;host.className='card';const head=view.querySelector('.view-head');if(head)head.insertAdjacentElement('afterend',host);else view.prepend(host)}
 host.innerHTML=`<div class="card-head"><div><div class="eyebrow">EMERGENCY FILE / 26.4</div><h2>Nouzový přehled domácnosti</h2></div><span class="status ${tone(e.score)}">EVIDENCE ${e.score}/100</span></div>
 <div class="metric-strip"><div class="metric"><span>Nouzové kontakty</span><b>${e.totalContacts}</b></div><div class="metric"><span>Kde co najít</span><b>${e.totalAssets}</b></div><div class="metric"><span>Bez spojení</span><b class="${e.contactsWithoutChannel?'warn':'good'}">${e.contactsWithoutChannel}</b></div><div class="metric"><span>Bez umístění</span><b class="${e.assetsWithoutLocation?'warn':'good'}">${e.assetsWithoutLocation}</b></div></div>
 <div class="decision-note">Během minuty najít komu volat a kde jsou důležité věci. Skóre měří pouze úplnost uložené evidence, ne skutečnou bezpečnost domácnosti.</div>
 <div class="row-actions"><button class="btn primary" data-ef-toggle>${expanded?'Sbalit':'Otevřít Emergency File'}</button><button class="btn" data-ef-copy>Kopírovat nouzový přehled</button></div>
 ${expanded?detailHtml(e):''}`;
 bind(host);
}

function bind(host){
 qs('[data-ef-toggle]',host)?.addEventListener('click',()=>{expanded=!expanded;render()});
 qs('[data-ef-copy]',host)?.addEventListener('click',copySnapshot);
 qs('[data-ef-add-contact]',host)?.addEventListener('click',()=>editContact());qs('[data-ef-add-asset]',host)?.addEventListener('click',()=>editAsset());
 qsa('[data-ef-edit-contact]',host).forEach(b=>b.onclick=()=>editContact(b.dataset.efEditContact));qsa('[data-ef-edit-asset]',host).forEach(b=>b.onclick=()=>editAsset(b.dataset.efEditAsset));
 qsa('[data-ef-archive-contact]',host).forEach(b=>b.onclick=()=>archive('contact',b.dataset.efArchiveContact));qsa('[data-ef-archive-asset]',host).forEach(b=>b.onclick=()=>archive('asset',b.dataset.efArchiveAsset));
}

function start(){const view=qs('#homeView');if(!view)return;new MutationObserver(()=>{if(!qs(`#${hostId}`,view)&&view.childElementCount)queueMicrotask(render)}).observe(view,{childList:true});store.subscribe(()=>{if(qs(`#${hostId}`,view))queueMicrotask(render)});if(view.childElementCount)render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
