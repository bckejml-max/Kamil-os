import {APP_VERSION} from './config.js';
import {store} from './state.js';
import {sb,login,logout,session,loadCloud,loadDataHubs,resolveConflict,conflictSummary,onSyncStatus,flushQueue,sendPasswordReset,updatePassword} from './cloud.js';
import {qs,qsa,toast,modal} from './utils.js';
import {renderMore,setMoreMode} from './more24.js';
import {renderToday} from './today24.js';
import {renderWork} from './work24.js';
import {renderMoney} from './money24.js';
import {renderTickets} from './tickets24.js';
import {openQuickCapture} from './capture24.js';
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
let recoveryMode=location.hash.includes('type=recovery')||new URLSearchParams(location.search).get('type')==='recovery';
const renderers={today:renderToday,work:renderWork,money:renderMoney,tickets:renderTickets,more:renderMore};
const pageTitles={today:'DNES',work:'PRÁCE',money:'PENÍZE',tickets:'VSTUPENKY',more:'VÍCE'};
const captureTypeForView=()=>({work:'task',money:'debt',tickets:'ticket'})[current]||null;
const openCapture=(type=null)=>withActionLock(()=>openQuickCapture(type||captureTypeForView()));

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
 const page=qs('#pageTitle');if(page)page.textContent=pageTitles[current]||'DNES';
 qsa('.version').forEach(x=>x.textContent=APP_VERSION);
 const count=attentionCount(s),b=qs('#moreBadge');if(b){b.textContent=count;b.classList.toggle('hidden',!count)}
 qsa('[data-view]').forEach(x=>x.classList.toggle('on',x.dataset.view===current));
 qs('#undoBtn').disabled=!(s.undo||[]).length;
 const add=qs('#quickAddBtn');if(add){const label={work:'Úkol',money:'Pohledávka',tickets:'Vstupenka'}[current]||'Přidat';const text=qs('b',add);if(text)text.textContent=label;add.title=`Rychle přidat ${label.toLowerCase()} · Ctrl N`}
}
function render(){
 updateChrome();renderers[current]?.();
 if(current!=='today')renderToday();
}
function navigate(v){
 current=renderers[v]?v:'today';
 qsa('.view').forEach(x=>x.classList.remove('on'));
 qs(`#view-${current}`).classList.add('on');
 updateChrome();renderers[current]?.();window.scrollTo({top:0,behavior:'smooth'});
}
qsa('[data-view]').forEach(x=>x.onclick=()=>navigate(x.dataset.view));
window.addEventListener('kamil:navigate',e=>navigate(e.detail));
window.addEventListener('kamil:more',e=>setMoreMode(e.detail));
window.addEventListener('kamil:logout',()=>logout());
window.addEventListener('kamil:capture',e=>openCapture(e.detail||null));

store.subscribe(()=>{render();maybeNotify()});
qs('#undoBtn').onclick=()=>{if(!store.undo())toast('Není co vrátit')};
qs('#logoutBtn').onclick=()=>logout();
qs('#quickAddBtn')?.addEventListener('click',()=>openCapture());

const input=qs('#commandInput');
input.oninput=()=>renderResults(input.value);
input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const v=input.value;withActionLock(()=>execute(v));input.value='';renderResults('')}if(e.key==='Escape'){input.value='';renderResults('');input.blur()}};
qs('#commandGo').onclick=()=>{const v=input.value;withActionLock(()=>execute(v));input.value='';renderResults('')};
document.addEventListener('keydown',e=>{
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.focus();input.select()}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='n'){e.preventDefault();openCapture()}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();store.undo()}
});
document.addEventListener('click',e=>{if(!e.target.closest('.command-wrap'))renderResults('')});

onSyncStatus((s,detail)=>{
 const el=qs('#syncStatus');if(!el)return;
 el.className='sync '+(s==='ok'?'ok':s);
 el.innerHTML=`<i></i> ${s==='ok'?'Uloženo':s==='saving'?'Ukládám…':s==='offline'?'Offline – uložím později':s==='conflict'?'Konflikt dat':'Cloud'}`;
 if(detail)el.title=detail;
});

function showResetView(){
 qs('#authView').classList.add('hidden');qs('#appView').classList.add('hidden');qs('#resetView').classList.remove('hidden');
 setTimeout(()=>qs('#resetPassword1')?.focus(),30);
}
function showLoginView(message=''){
 qs('#resetView').classList.add('hidden');qs('#appView').classList.add('hidden');qs('#authView').classList.remove('hidden');
 if(message)qs('#authMessage').textContent=message;
}

async function handleSession(sess){
 if(recoveryMode){showResetView();return}
 if(!sess){showLoginView();return}
 qs('#authView').classList.add('hidden');qs('#resetView').classList.add('hidden');qs('#appView').classList.remove('hidden');
 const email=qs('#userEmail');if(email)email.textContent=sess.user?.email||'Přihlášený účet';
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
 const email=qs('#loginEmail').value.trim(),password=qs('#loginPassword').value,msg=qs('#authMessage');
 if(!email||!password){msg.textContent='Vyplň e-mail i heslo.';return}
 msg.textContent='Přihlašuji…';
 const {error}=await login(email,password);msg.textContent=error?error.message:'';
};
qs('#loginPassword').onkeydown=e=>{if(e.key==='Enter')qs('#loginBtn').click()};

qs('#forgotPasswordBtn').onclick=async()=>{
 const email=qs('#loginEmail').value.trim(),msg=qs('#authMessage');
 if(!email){msg.textContent='Nejdřív napiš e-mail, na který mám poslat reset.';qs('#loginEmail').focus();return}
 msg.textContent='Posílám resetovací odkaz…';
 const {error}=await sendPasswordReset(email);
 msg.textContent=error?error.message:'Hotovo. Otevři odkaz v e-mailu a nastavíš si nové heslo.';
};

qs('#setPasswordBtn').onclick=async()=>{
 const p1=qs('#resetPassword1').value,p2=qs('#resetPassword2').value,msg=qs('#resetMessage');
 if(p1.length<8){msg.textContent='Heslo musí mít alespoň 8 znaků.';return}
 if(p1!==p2){msg.textContent='Hesla se neshodují.';return}
 msg.textContent='Ukládám nové heslo…';
 const {error}=await updatePassword(p1);
 if(error){msg.textContent=error.message;return}
 msg.textContent='Heslo změněno.';
 recoveryMode=false;
 history.replaceState({},document.title,location.pathname+location.search.replace(/([?&])type=recovery(&|$)/,'$1').replace(/[?&]$/,''));
 await handleSession(await session());
};
qs('#resetPassword2').onkeydown=e=>{if(e.key==='Enter')qs('#setPasswordBtn').click()};

sb.auth.onAuthStateChange((ev,sess)=>{
 if(ev==='PASSWORD_RECOVERY'){recoveryMode=true;setTimeout(showResetView,0);return}
 if(!recoveryMode)setTimeout(()=>handleSession(sess),0);
});

const hashParams=new URLSearchParams(location.hash.replace(/^#/,''));
if(hashParams.get('error')){
 recoveryMode=false;
 const expired=hashParams.get('error_code')==='otp_expired';
 history.replaceState({},document.title,location.pathname+location.search);
 showLoginView(expired?'Resetovací odkaz už vypršel. Pošli si nový přes „Zapomněl jsem heslo“.':(hashParams.get('error_description')||'Reset hesla se nepodařil.'));
}else if(recoveryMode){
 showResetView();
}else{
 handleSession(await session());
}

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
