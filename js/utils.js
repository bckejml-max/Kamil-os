export const qs=(s,r=document)=>r.querySelector(s);
export const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
export const h=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
export const norm=v=>String(v??'').toLowerCase().trim().replace(/\s+/g,' ');
export const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v)||0);
export const date=v=>v?new Date(v).toLocaleDateString('cs-CZ'):'—';
export const dateTime=v=>v?new Date(v).toLocaleString('cs-CZ'):'—';
export const uid=(p='id')=>`${p}|${Date.now()}|${Math.random().toString(36).slice(2,8)}`;
export const clone=v=>structuredClone(v);
export const todayKey=()=>new Date().toISOString().slice(0,10);
export const dayDiff=v=>Math.ceil((new Date(v)-new Date())/86400000);
export const toast=(msg)=>{
  const host=qs('#toastHost');if(!host)return;const el=document.createElement('div');el.className='toast';el.textContent=msg;host.appendChild(el);
  setTimeout(()=>el.remove(),2300);
};
export const modal=(title,body,buttons=[])=>new Promise(resolve=>{
  const host=qs('#modalHost');if(!host){resolve(null);return}
  const el=document.createElement('div');el.className='modal';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
  el.innerHTML=`<div class="modal-box"><div class="eyebrow">Kamil OS</div><h2>${h(title)}</h2><div>${body}</div><div class="row-actions" style="margin-top:15px" data-modal-buttons></div></div>`;
  host.appendChild(el);let closed=false;
  const cleanup=()=>document.removeEventListener('keydown',onKey,true);
  const close=v=>{if(closed)return;closed=true;cleanup();el.remove();resolve(v)};
  let primaryBtn=null;
  buttons.forEach(b=>{const x=document.createElement('button');x.className='btn '+(b.primary?'primary':'')+(b.danger?' danger':'');x.textContent=b.label;x.type='button';x.onclick=()=>close(b.value);qs('[data-modal-buttons]',el).appendChild(x);if(b.primary)primaryBtn=x});
  if(title==='XTB + vstupenky / Market Commander 58.7'&&/MARKET COMMANDER 59\.0/.test(String(body))&&/class="good">ACT<\/b>/.test(String(body))){
    const x=document.createElement('button');x.className='btn';x.textContent='Provedl jsem to ručně';x.type='button';x.dataset.executionCheckin591='1';x.onclick=async()=>{close(null);try{const m=await import('./executionReceipt591.js');await m.openExecutionReceipt591()}catch(error){console.error('[execution-receipt-591]',error);toast('Execution check-in se nepodařilo otevřít')}};qs('[data-modal-buttons]',el).prepend(x);
  }
  if(title==='XTB + vstupenky / Market Commander 58.7'&&/MARKET COMMANDER 59\.0/.test(String(body))){
    let hasReceipts=false;try{const s=JSON.parse(localStorage.getItem('kamil-os-state')||'{}');hasReceipts=Array.isArray(s.marketExecutionHistory?.receipts)&&s.marketExecutionHistory.receipts.length>0}catch{}
    if(hasReceipts){const x=document.createElement('button');x.className='btn';x.textContent='Ověřit provedení 59.2';x.type='button';x.dataset.executionReconciliation592='1';x.onclick=async()=>{close(null);try{const m=await import('./executionReconciliation592.js');await m.openExecutionReconciliation592()}catch(error){console.error('[execution-reconciliation-592]',error);toast('Execution reconciliation se nepodařilo otevřít')}};qs('[data-modal-buttons]',el).prepend(x)}
  }
  const onKey=e=>{
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(null);return}
    if(e.key==='Enter'&&primaryBtn&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey){
      const tag=document.activeElement?.tagName;if(tag==='TEXTAREA'||tag==='BUTTON')return;
      e.preventDefault();e.stopPropagation();primaryBtn.click();
    }
  };
  document.addEventListener('keydown',onKey,true);
  el.onclick=e=>{if(e.target===el)close(null)};
  requestAnimationFrame(()=>{const target=qs('[autofocus]',el)||qs('input,select,textarea,button',el);target?.focus()});
});
export const formModal=(title,body,{submitLabel='Uložit',cancelLabel='Zrušit',danger=false}={})=>new Promise(resolve=>{
  const host=qs('#modalHost');if(!host){resolve(null);return}
  const el=document.createElement('div');el.className='modal';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
  el.innerHTML=`<div class="modal-box"><div class="eyebrow">Kamil OS</div><h2>${h(title)}</h2><form data-form-modal>${body}<div class="row-actions" style="margin-top:15px"><button class="btn" type="button" data-form-cancel>${h(cancelLabel)}</button><button class="btn primary${danger?' danger':''}" type="submit">${h(submitLabel)}</button></div></form></div>`;
  host.appendChild(el);let closed=false;
  const cleanup=()=>document.removeEventListener('keydown',onKey,true);
  const close=v=>{if(closed)return;closed=true;cleanup();el.remove();resolve(v)};
  const form=qs('[data-form-modal]',el);form.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form).entries());close(data)});qs('[data-form-cancel]',el).addEventListener('click',()=>close(null));
  const onKey=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(null)}};document.addEventListener('keydown',onKey,true);el.onclick=e=>{if(e.target===el)close(null)};requestAnimationFrame(()=>{const target=qs('[autofocus]',el)||qs('input,select,textarea,button',el);target?.focus()});
});
export const downloadJson=(name,data)=>{
 const b=new Blob([JSON.stringify(data,null,2),],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};