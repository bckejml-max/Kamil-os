import {APP_VERSION} from './config.js';
import {store} from './state.js';
import {sb,login,logout,session,loadCloud,loadDataHubs,resolveConflict,conflictSummary,onSyncStatus,flushQueue} from './cloud.js';
import {qs,qsa,toast,modal} from './utils.js';
import {renderToday,renderWork,renderMoney,renderTickets,renderMore,setMoreMode} from './render.js';
import {execute,renderResults} from './command.js';
import {attentionCount,recommendation} from './intelligence.js';
import {runPreflight} from './preflight.js';


let actionLock=false;
export async function withActionLock(fn){
 if(actionLock)return false;
 actionLock=true;
 try{return await fn()}finally{setTimeout(()=>{actionLock=false},250)}
}
let current='today';
const renderers={today:renderToday,work:renderWork,money:renderMoney,tickets:renderTickets,more:renderMore};


function maybeNotify(){
 if(!('Notification'in window)||Notification.permission!=='granted'||document.visibilityState==='visible')return;
 const rec=recommendation(store.get());if(rec.score<85)return;
 const key=`kamil-notify-${new Date().toISOString().slice(0,10)}-${rec.title}`;
 if(localStorage.getItem(key))return;
 new Notification('Kamil OS',{body:rec.title,tag:'kamil-os-attention'});localStorage.setItem(key,'1');
}
function updateChrome(){
 const s=store.get();
 qs('#todayLabel').textContent=new Date().toLocaleDateString('cs-CZ',{weekday:'long',day:'numeric',month:'long'});
 const count=attentionCount(s);const b=qs('#moreBadge');b.textContent=count;b.classList.toggle('hidden',!count);
 qsa('[data-view]').forEach(x=>x.classList.toggle('on',x.dataset.view===current));
 qs('#undoBtn').disabled=!(s.undo||[]).length;
}
function render(){
 updateChrome();renderers[current]?.();
 // Keep non-current lightweight views fresh enough after mutation.
 if(current!=='today')renderToday();
}
function navigate(v){current=renderers[v]?v:'today';qsa('.view').forEach(x=>x.classList.remove('on'));qs(`#view-${current}`).classList.add('on');updateChrome();renderers[current]?.();window.scrollTo({top:0,behavior:'smooth'})}
qsa('[data-view]').forEach(x=>x.onclick=()=>navigate(x.dataset.view));
window.addEventListener('kamil:navigate',e=>navigate(e.detail));
window.addEventListener('kamil:more',e=>setMoreMode(e.detail));
window.addEventListener('kamil:logout',()=>logout());

store.subscribe(()=>{render();maybeNotify()});
qs('#undoBtn').onclick=()=>{if(!store.undo())toast('Není co vrátit')};

const input=qs('#commandInput');
input.oninput=()=>renderResults(input.value);
input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const v=input.value;withActionLock(()=>execute(v));input.value='';renderResults('')}if(e.key==='Escape'){input.value='';renderResults('');input.blur()}};
qs('#commandGo').onclick=()=>{const v=input.value;withActionLock(()=>execute(v));input.value='';renderResults('')};
document.addEventListener('keydown',e=>{
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.focus();input.select()}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();store.undo()}
});
document.addEventListener('click',e=>{if(!e.target.closest('.command-wrap'))renderResults('')});

onSyncStatus((s,detail)=>{
 const el=qs('#syncStatus');el.className='sync '+(s==='ok'?'ok':s);el.textContent=s==='ok'?'Uloženo':s==='saving'?'Ukládám…':s==='offline'?'Offline – uložím později':s==='conflict'?'Konflikt dat':'Cloud';
 if(detail)el.title=detail;
});

async function handleSession(sess){
 if(!sess){qs('#authView').classList.remove('hidden');qs('#appView').classList.add('hidden');return}
 qs('#authView').classList.add('hidden');qs('#appView').classList.remove('hidden');
 const result=await loadCloud();
 if(result?.conflict){
   const diff=conflictSummary(store.get(),result.cloud);
   const rows=diff.map(x=>`<div class="row"><span>${x.label}</span><span>toto zařízení <b>${x.local}</b> · cloud <b>${x.cloud}</b></span></div>`).join('');
   const choice=await modal('Cloud a zařízení mají různé změny',`<p class="muted">Nic nepřepisuju automaticky. Nejdřív se podívej na rozdíly:</p>${rows}<p class="muted">Pokud si nejsi jistý, zvol toto zařízení a potom udělej export zálohy.</p>`,[
     {label:'Použít cloud',value:'cloud'},{label:'Použít toto zařízení',value:'local',primary:true}
   ]);
   if(choice)await resolveConflict(choice,result.cloud);
 }
 await flushQueue();await loadDataHubs();const pf=runPreflight();store.get().meta.preflight=pf;store.persist();render();
}

qs('#loginBtn').onclick=async()=>{
 const email=qs('#loginEmail').value.trim(),password=qs('#loginPassword').value,msg=qs('#authMessage');msg.textContent='Přihlašuji…';
 const {error}=await login(email,password);msg.textContent=error?error.message:'';
};
qs('#loginPassword').onkeydown=e=>{if(e.key==='Enter')qs('#loginBtn').click()};
sb.auth.onAuthStateChange((ev,sess)=>setTimeout(()=>handleSession(sess),0));
handleSession(await session());

if('serviceWorker'in navigator){
 const reg=await navigator.serviceWorker.register('./sw.js');
 reg.addEventListener('updatefound',()=>{
   const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)qs('#updateBanner').classList.remove('hidden')})
 });
 qs('#reloadAppBtn').onclick=()=>location.reload();
}

window.addEventListener('beforeunload',()=>{
 if(store.dirty){store.queueSync(store.get());store.setMeta({pendingAt:new Date().toISOString()})}
});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.__installPrompt=e});
