import {store} from './state.js';
import {norm,h,money,uid,qs,qsa,toast} from './utils.js';
import {debtRemaining} from './intelligence.js';

const navigateFromTarget=t=>{
 if(t==='debts'||t==='inbox'||t==='terms'||t==='backup'||t==='settings'||t==='system'){
  window.dispatchEvent(new CustomEvent('kamil:more',{detail:t}));
  window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'more'}));
 }else window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:t||'today'}));
};
const cmdFingerprints=new Map();
function once(key,fn){
 const now=Date.now(),last=cmdFingerprints.get(key)||0;
 if(now-last<800)return false;
 cmdFingerprints.set(key,now);fn();return true;
}
const S=()=>store.get();
export function search(q){
 q=norm(q);if(!q)return[];const out=[],add=(kind,title,detail,target,id)=>{if(norm(title+' '+detail).includes(q))out.push({kind,title,detail,target,id})};
 for(const x of S().tasks||[])if(x.status!=='HOTOVO')add('Úkol',x.title,x.area||'','work',x.id);
 for(const x of S().projects||[])add('Projekt',x.name,x.next||'','work',x.id);
 for(const x of S().delegations||[])if((x.status||'WAITING')!=='DONE')add('Čekám',x.title||x.person||'Čekající položka','čeká na reakci','today',x.id);
 for(const x of S().ticketBook?.items||[])add('Vstupenka',x.name,`${x.qty||1} ks`,'tickets',x.id);
 for(const x of S().debtBook?.items||[])if(x.status!=='PAID')add('Pohledávka',x.person,`${money(debtRemaining(x))}`,'debts',x.id);
 return out.slice(0,10);
}
export function parse(raw){
 const t=String(raw||'').trim(),n=norm(t);if(!n)return{type:'empty'};
 const nav={'ukaž dluhy':'debts','ukaz dluhy':'debts','ukaž pohledávky':'debts','ukaz pohledavky':'debts','ukaž vstupenky':'tickets','ukaz vstupenky':'tickets','ukaž práci':'work','ukaz praci':'work','ukaž peníze':'money','ukaz penize':'money','ukaž inbox':'inbox','ukaz inbox':'inbox','ukaž termíny':'terms','ukaz terminy':'terms'};
 if(nav[n])return{type:'nav',target:nav[n]};
 let m=t.match(/^ček[aá]m\s+na\s+(.+)$/i);if(m)return{type:'waiting',title:m[1].trim()};
 m=t.match(/^projekt\s+(.+)$/i);if(m)return{type:'project',name:m[1].trim()};
 m=n.match(/^(.+?)\s+spl[aá]tka\s+([\d\s.,]+)$/);if(m)return{type:'payment',person:m[1],amount:Number(m[2].replace(/\s/g,'').replace(',','.'))};
 m=n.match(/^(.+?)\s+prod[aá]no$/);if(m)return{type:'sold',name:m[1]};
 m=t.match(/^(.+?)\s+z[ií]tra$/i);if(m)return{type:'tomorrow',name:m[1].trim()};
 return{type:'free',text:t};
}
export function execute(raw){
 const c=parse(raw);if(c.type==='empty')return;
 if(c.type==='nav'){navigateFromTarget(c.target);return}
 if(c.type==='waiting'){
   if(!c.title)return toast('Napiš, na co čekáš.');
   store.mutate('Přidáno čekání',s=>{s.delegations=s.delegations||[];s.delegations.unshift({id:uid('wait'),title:c.title,status:'WAITING',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})});toast('Přidáno do „Čekám na“');return
 }
 if(c.type==='project'){
   if(!c.name)return toast('Napiš název projektu.');
   store.mutate('Přidán projekt',s=>{s.projects=s.projects||[];s.projects.unshift({id:uid('project'),name:c.name,status:'Aktivní',next:'Doplnit další krok',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})});toast('Projekt přidán');return
 }
 if(c.type==='payment'){
   const x=S().debtBook.items.find(d=>d.status!=='PAID'&&norm(d.person).includes(norm(c.person)));if(!x||!Number.isFinite(c.amount)||c.amount<=0)return toast('Pohledávku nebo částku jsem nenašel.');
   once(`pay|${x.id}|${c.amount}`,()=>store.mutate(`Splátka ${x.person}`,s=>{const d=s.debtBook.items.find(y=>y.id===x.id);d.payments=d.payments||[];d.payments.push({id:uid('payment'),amount:c.amount,at:new Date().toISOString()});d.lastContactAt=new Date().toISOString()}));return
 }
 if(c.type==='sold'){
   const x=S().ticketBook.items.find(t=>norm(t.name).includes(norm(c.name)));if(!x)return toast('Vstupenku jsem nenašel.');
   once(`sold|${x.id}`,()=>store.mutate('Vstupenka prodána',s=>{const t=s.ticketBook.items.find(y=>y.id===x.id);if(t.workflow==='SOLD')return;t.workflow='SOLD';t.soldAt=new Date().toISOString()}));return
 }
 if(c.type==='tomorrow'){
   const x=S().tasks.find(t=>t.status!=='HOTOVO'&&norm(t.title).includes(norm(c.name)));
   if(x){once(`tomorrow|${x.id}`,()=>store.mutate('Úkol přesunut na zítra',s=>{const t=s.tasks.find(y=>y.id===x.id),d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);t.due=d.toISOString();t.updatedAt=new Date().toISOString()}));return}
   const title=c.name.replace(/^úkol\s+/i,'').trim();if(!title)return toast('Napiš název úkolu.');
   store.mutate('Přidán úkol na zítra',s=>{const d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);s.tasks.unshift({id:uid('task'),title,status:'UDĚLAT',priority:'NORMAL',area:'Osobní',due:d.toISOString(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})});toast('Úkol přidán na zítra');return
 }
 const found=search(c.text);
 if(found.length===1){navigateFromTarget(found[0].target);return}
 if(found.length>1){renderResults(c.text);toast('Našel jsem více výsledků – vyber správný.');return}
 store.mutate('Přidán úkol',s=>s.tasks.unshift({id:uid('task'),title:c.text,status:'UDĚLAT',priority:'NORMAL',area:'Osobní',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));
 toast('Úkol přidán');
}
export function renderResults(q){
 const box=qs('#commandResults'),a=search(q);if(!q.trim()||!a.length){box.classList.add('hidden');box.innerHTML='';return}
 box.classList.remove('hidden');box.innerHTML=a.map((x,i)=>`<div class="search-row"><div><b>${h(x.title)}</b><div class="muted">${h(x.kind)} · ${h(x.detail||'')}</div></div><button class="btn" data-search="${i}">Otevřít</button></div>`).join('');
 qsa('[data-search]',box).forEach(b=>b.onclick=()=>{navigateFromTarget(a[Number(b.dataset.search)].target);box.classList.add('hidden')});
}
