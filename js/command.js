import {store} from './state.js';
import {norm,h,money,uid,qs,qsa,toast} from './utils.js';
import {debtRemaining} from './intelligence.js';
import {PERSONAL_CATEGORIES} from './personalAdmin25.js';
import {FAMILY_RELATIONS} from './familyHome25.js';
import {INSURANCE_KINDS} from './insurance25.js';
import {DOCUMENT_KINDS} from './documents25.js';

const navigateFromTarget=(target,homeMode=null)=>{
 if(target==='home'){
  window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:'home'}));
  queueMicrotask(()=>window.dispatchEvent(new CustomEvent('kamil:home-open',{detail:homeMode||'dashboard'})));
 }else window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:target||'today'}));
};
const openResult=x=>navigateFromTarget(x?.target,x?.homeMode);
const cmdFingerprints=new Map();
function once(key,fn){const now=Date.now(),last=cmdFingerprints.get(key)||0;if(now-last<800)return false;cmdFingerprints.set(key,now);fn();return true}
const S=()=>store.get();
const personalTask=t=>String(t?.area||'').toLocaleLowerCase('cs-CZ').includes('osob');
const active=x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const homeModeFor=x=>x.category==='INSURANCE'?'insurance':x.category==='DOCUMENT'?'documents':x.category==='VEHICLE'?'car':x.category==='FAMILY'?'family':['HOME','UTILITY'].includes(x.category)?'house':['SUBSCRIPTION','LOAN','FEE'].includes(x.category)?'contracts':x.category==='PAYMENT'?'payments':'contracts';

export function search(q){
 q=norm(q);if(!q)return[];const out=[],add=(kind,title,detail,target,id,extra={})=>{if(norm(`${title} ${detail}`).includes(q))out.push({kind,title,detail,target,id,...extra})};
 for(const t of S().tasks||[])if(t.status!=='HOTOVO'&&personalTask(t))add('Osobní úkol',t.title,t.area||'Osobní','today',t.id);
 for(const x of S().personalAdmin?.items||[]){
  if(!active(x))continue;
  const cat=PERSONAL_CATEGORIES[x.category]||PERSONAL_CATEGORIES.OTHER,ins=x.insurance||{},doc=x.document||{};
  const detail=[cat,x.provider,x.notes,ins.insured,INSURANCE_KINDS[ins.kind],doc.holder,DOCUMENT_KINDS[doc.kind],doc.issuer].filter(Boolean).join(' · ');
  add(cat,x.title||cat,detail,'home',x.id,{homeMode:homeModeFor(x)});
 }
 for(const m of S().familyHome?.members||[])if(active(m))add('Rodina',m.name,[FAMILY_RELATIONS[m.relation]||'',m.notes||''].filter(Boolean).join(' · '),'home',m.id,{homeMode:'family'});
 for(const x of S().ticketBook?.items||[])add('Vstupenka',x.name,`${x.qty||1} ks`,'tickets',x.id);
 for(const x of S().debtBook?.items||[])if(x.status!=='PAID')add('Pohledávka',x.person||x.reason||'Pohledávka',`${money(debtRemaining(x))}`,'money',x.id);
 for(const a of Object.values(S().xtbHub?.accounts||{}))for(const p of a?.positions||[])add('XTB',p.ticker||p.name||'Pozice',[p.name,p.category,a.currency].filter(Boolean).join(' · '),'money',p.ticker||p.name);
 return out.slice(0,15);
}

export function parse(raw){
 const t=String(raw||'').trim(),n=norm(t);if(!n)return{type:'empty'};
 const nav={
  'ukaž domov':['home','dashboard'],'ukaz domov':['home','dashboard'],'ukaž domácnost':['home','house'],'ukaz domacnost':['home','house'],'ukaž dům':['home','house'],'ukaz dum':['home','house'],
  'ukaž platby':['home','payments'],'ukaz platby':['home','payments'],'ukaž pojištění':['home','insurance'],'ukaz pojisteni':['home','insurance'],'ukaž smlouvy':['home','contracts'],'ukaz smlouvy':['home','contracts'],
  'ukaž doklady':['home','documents'],'ukaz doklady':['home','documents'],'ukaž auto':['home','car'],'ukaz auto':['home','car'],
  'ukaž rodinu':['home','family'],'ukaz rodinu':['home','family'],'ukaž rizika':['home','risk'],'ukaz rizika':['home','risk'],
  'ukaž termíny':['home','timeline'],'ukaz terminy':['home','timeline'],'ukaž vstupenky':['tickets',null],'ukaz vstupenky':['tickets',null],
  'ukaž peníze':['money',null],'ukaz penize':['money',null],'ukaž pohledávky':['money',null],'ukaz pohledavky':['money',null]
 };
 if(nav[n])return{type:'nav',target:nav[n][0],homeMode:nav[n][1]};
 let m=n.match(/^(.+?)\s+spl[aá]tka\s+([\d\s.,]+)$/);if(m)return{type:'payment',person:m[1],amount:Number(m[2].replace(/\s/g,'').replace(',','.'))};
 m=n.match(/^(.+?)\s+prod[aá]no$/);if(m)return{type:'sold',name:m[1]};
 m=t.match(/^(.+?)\s+z[ií]tra$/i);if(m)return{type:'tomorrow',name:m[1].trim()};
 return{type:'free',text:t};
}

export function execute(raw){
 const c=parse(raw);if(c.type==='empty')return;
 if(c.type==='nav'){navigateFromTarget(c.target,c.homeMode);return}
 if(c.type==='payment'){
  const x=S().debtBook.items.find(d=>d.status!=='PAID'&&norm(d.person).includes(norm(c.person)));if(!x||!Number.isFinite(c.amount)||c.amount<=0)return toast('Pohledávku nebo částku jsem nenašel.');
  once(`pay|${x.id}|${c.amount}`,()=>store.mutate(`Splátka ${x.person}`,s=>{const d=s.debtBook.items.find(y=>y.id===x.id);d.payments=d.payments||[];d.payments.push({id:uid('payment'),amount:c.amount,at:new Date().toISOString()});d.lastContactAt=new Date().toISOString()}));return
 }
 if(c.type==='sold'){
  const x=S().ticketBook.items.find(t=>norm(t.name).includes(norm(c.name)));if(!x)return toast('Vstupenku jsem nenašel.');
  once(`sold|${x.id}`,()=>store.mutate('Vstupenka prodána',s=>{const t=s.ticketBook.items.find(y=>y.id===x.id);if(t.workflow==='SOLD')return;t.workflow='SOLD';t.soldAt=new Date().toISOString()}));return
 }
 if(c.type==='tomorrow'){
  const x=S().tasks.find(t=>t.status!=='HOTOVO'&&personalTask(t)&&norm(t.title).includes(norm(c.name)));
  if(x){once(`tomorrow|${x.id}`,()=>store.mutate('Osobní úkol přesunut na zítra',s=>{const t=s.tasks.find(y=>y.id===x.id),d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);t.due=d.toISOString();t.updatedAt=new Date().toISOString()}));return}
  const title=c.name.replace(/^úkol\s+/i,'').trim();if(!title)return toast('Napiš název úkolu.');
  store.mutate('Přidán osobní úkol na zítra',s=>{const d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);s.tasks.unshift({id:uid('task'),title,status:'UDĚLAT',priority:'NORMAL',area:'Osobní',due:d.toISOString(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})});toast('Osobní úkol přidán na zítra');return
 }
 const found=search(c.text);
 if(found.length===1){openResult(found[0]);return}
 if(found.length>1){renderResults(c.text);toast('Našel jsem více osobních výsledků – vyber správný.');return}
 store.mutate('Přidán osobní úkol',s=>s.tasks.unshift({id:uid('task'),title:c.text,status:'UDĚLAT',priority:'NORMAL',area:'Osobní',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));toast('Osobní úkol přidán');
}
export function renderResults(q){
 const box=qs('#commandResults'),a=search(q);if(!q.trim()||!a.length){box.classList.add('hidden');box.innerHTML='';return}
 box.classList.remove('hidden');box.innerHTML=a.map((x,i)=>`<div class="search-row"><div><b>${h(x.title)}</b><div class="muted">${h(x.kind)} · ${h(x.detail||'')}</div></div><button class="btn" data-search="${i}">Otevřít</button></div>`).join('');
 qsa('[data-search]',box).forEach(b=>b.onclick=()=>{openResult(a[Number(b.dataset.search)]);box.classList.add('hidden')});
}
