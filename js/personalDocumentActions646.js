import {store} from './state.js';
import {formModal,modal,h,toast,uid} from './utils.js';
import {personalVaultRecord640} from './personalVault640.js';

const now=()=>new Date().toISOString();
const safeUrl=v=>{try{const u=new URL(String(v||'').trim());return ['http:','https:'].includes(u.protocol)?u.toString():null}catch{return null}};
const byId=(s,id)=>(s.personalVault?.items||[]).find(x=>String(x.id)===String(id));

export function addDocumentReference646(id,{label,url,note='',validUntil=null}={}){
 const href=safeUrl(url);if(!href)return null;let out=null;
 store.mutate(`Přidán zdroj dokumentu: ${id}`,s=>{const x=byId(s,id);if(!x)return;x.attachments=Array.isArray(x.attachments)?x.attachments:[];out={id:uid('docref'),label:String(label||'Dokument').trim()||'Dokument',url:href,note:String(note||'').trim(),validUntil:validUntil||null,addedAt:now()};x.attachments.push(out);x.updatedAt=now();},{undo:true,cloud:true,audit:true});
 return out;
}

export function removeDocumentReference646(id,refId){let changed=false;store.mutate(`Odebrán zdroj dokumentu: ${id}`,s=>{const x=byId(s,id);if(!x)return;const before=(x.attachments||[]).length;x.attachments=(x.attachments||[]).filter(a=>String(a.id)!==String(refId));changed=x.attachments.length!==before;if(changed)x.updatedAt=now();},{undo:true,cloud:true,audit:true});return changed}

export function createDocumentTask646(id,{title,due=null}={}){
 const r=personalVaultRecord640(id);if(!r)return null;let out=null;
 store.mutate(`Vytvořen úkol k dokumentu: ${r.title}`,s=>{s.tasks=Array.isArray(s.tasks)?s.tasks:[];out={id:uid('task'),title:String(title||`Vyřešit: ${r.title}`).trim(),status:'OPEN',category:'Osobní dokumenty',area:'Osobní',due:due||null,sourceRecordId:r.id,createdAt:now()};s.tasks.push(out);},{undo:true,cloud:true,audit:true});return out;
}

export async function addDocumentReferenceModal646(id){const r=personalVaultRecord640(id);if(!r)return null;const data=await formModal(`Přidat zdroj: ${r.title}`,`<div class="form-grid"><label>Název odkazu<input name="label" value="Dokument" autofocus></label><label class="wide">Odkaz (Drive, OneDrive, web…)<input name="url" type="url" placeholder="https://…"></label><label>Platnost do<input name="validUntil" type="date"></label><label class="wide">Poznámka<textarea name="note" rows="3"></textarea></label></div>`,{submitLabel:'Uložit zdroj'});if(!data)return null;const out=addDocumentReference646(id,data);if(!out){toast('Odkaz musí začínat http:// nebo https://');return null}toast('Zdroj dokumentu uložen.');return out}

export async function createDocumentTaskModal646(id){const r=personalVaultRecord640(id);if(!r)return null;const data=await formModal(`Úkol k: ${r.title}`,`<div class="form-grid"><label class="wide">Úkol<input name="title" value="${h(`Vyřešit: ${r.title}`)}" autofocus></label><label>Termín<input name="due" type="date"></label></div>`,{submitLabel:'Vytvořit úkol'});if(!data)return null;const out=createDocumentTask646(id,data);if(out)toast('Navazující úkol vytvořen.');return out}

export async function openDocumentReferences646(id){const r=personalVaultRecord640(id);if(!r)return null;const refs=Array.isArray(r.attachments)?r.attachments:[];const body=`<div class="card"><h2>${h(r.title)}</h2>${refs.length?refs.map(a=>`<div class="row"><div><b>${h(a.label)}</b>${a.note?`<div class="muted">${h(a.note)}</div>`:''}${a.validUntil?`<div class="muted">Platnost do ${h(new Date(a.validUntil).toLocaleDateString('cs-CZ'))}</div>`:''}</div><a class="btn" href="${h(a.url)}" target="_blank" rel="noopener noreferrer">Otevřít</a></div>`).join(''):'<div class="empty">Zatím není připojen žádný odkaz na dokument.</div>'}</div>`;return modal('Zdroje a přílohy',body,[{label:'Přidat odkaz',value:'add',primary:true},{label:'Zavřít',value:null}]).then(async choice=>choice==='add'?addDocumentReferenceModal646(id):choice)}
