export const qs=(s,r=document)=>r.querySelector(s);
export const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
export const h=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
export const norm=v=>String(v??'').toLowerCase().trim().replace(/\s+/g,' ');
export const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v)||0);
export const date=v=>v?new Date(v).toLocaleDateString('cs-CZ'):'—';
export const dateTime=v=>v?new Date(v).toLocaleString('cs-CZ'):'—';
export const uid=(p='id')=>`${p}|${Date.now()}|${Math.random().toString(36).slice(2,8)}`;
export const clone=v=>structuredClone(v);
export const todayKey=()=>new Date().toISOString().slice(0,10);
export const dayDiff=v=>Math.ceil((new Date(v)-new Date())/86400000);
export const toast=(msg)=>{
  const host=qs('#toastHost'); const el=document.createElement('div');el.className='toast';el.textContent=msg;host.appendChild(el);
  setTimeout(()=>el.remove(),2300);
};
export const modal=(title,body,buttons=[])=>new Promise(resolve=>{
  const host=qs('#modalHost');const el=document.createElement('div');el.className='modal';
  el.innerHTML=`<div class="modal-box"><div class="eyebrow">Kamil OS</div><h2>${h(title)}</h2><div>${body}</div><div class="row-actions" style="margin-top:15px" id="modalButtons"></div></div>`;
  host.appendChild(el); const close=v=>{resolve(v);setTimeout(()=>el.remove(),0)};
  buttons.forEach(b=>{const x=document.createElement('button');x.className='btn '+(b.primary?'primary':'')+(b.danger?' danger':'');x.textContent=b.label;x.onclick=()=>close(b.value);qs('#modalButtons',el).appendChild(x)});
  el.onclick=e=>{if(e.target===el)close(null)};
});
export const downloadJson=(name,data)=>{
 const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
