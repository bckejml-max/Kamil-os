import {APP_VERSION} from './releaseMeta.js';
import {store} from './state.js';
import {login,logout,session,loadCloud,loadDataHubs,resolveConflict,conflictSummary,onSyncStatus,flushQueue,sendPasswordReset,sendMagicLink,updatePassword,watchAuth} from './cloud.js';
import {authCooldownSeconds32,authErrorMessage32,authConnectedLabel32} from './authUx32.js';
import {qs,qsa,toast,modal} from './utils.js';
import {validViews41,getViewRenderer41,prefetchView41,setMoreMode41,openCapture41,renderCommandResults41,executeCommand41,renderExtras41,refreshRiskBadge41,runPreflight41,scheduleNotifications41,warmRuntime41} from './viewRuntime41.js';
import {markPerf41,markFirstView41} from './perf41.js';

let actionLock=false;
export async function withActionLock(fn){if(actionLock)return false;actionLock=true;try{return await fn()}finally{setTimeout(()=>{actionLock=false},250)}}

let current='today',stopAuthWatch=()=>{},authCooldownTimer=null,renderSeq=0,renderQueued=false;
let recoveryMode=location.hash.includes('type=recovery')||new URLSearchParams(location.search).get('type')==='recovery';
const pageTitles={today:'DNES',money:'PENÍZE',tickets:'VSTUPENKY',home:'DOMOV',more:'VÍCE'};
const captureTypeForView=()=>({today:'task',home:'personal',money:'debt',tickets:'ticket'})[current]||'task';
const openCapture=(type=null)=>withActionLock(()=>openCapture41(type||captureTypeForView()));

function updateChrome(){
 const s=store.get();
 const label=qs('#todayLabel');if(label)label.textContent=new Date().toLocaleDateString('cs-CZ',{weekday:'long',day:'numeric',month:'long'});
 const page=qs('#pageTitle');if(page)page.textContent=pageTitles[current]||'DNES';
 qsa('.version').forEach(x=>x.textContent=APP_VERSION);
 qsa('[data-view]').forEach(x=>x.classList.toggle('on',x.dataset.view===current));
 const undo=qs('#undoBtn');if(undo)undo.disabled=!(s.undo||[]).length;
 const add=qs('#quickAddBtn');if(add){const text=qs('b',add),name={today:'Osobní úkol',home:'Osobní položka',money:'Pohledávka',tickets:'Vstupenka'}[current]||'Přidat';if(text)text.textContent=name;add.title=`Rychle přidat ${name.toLowerCase()} · Ctrl N`}
 refreshRiskBadge41(s);
}
function quickShell(view){
 const host=qs(`#${view}View`);if(!host||host.dataset.fastShell==='1')return;host.dataset.fastShell='1';
 if(view==='today'){
  const s=store.get(),open=(s.tasks||[]).filter(x=>!['DONE','CLOSED','ARCHIVED'].includes(String(x.status||'').toUpperCase())).length,waiting=(s.directorBook?.waiting||[]).filter(x=>!['DONE','CLOSED','ARCHIVED'].includes(String(x.status||'OPEN').toUpperCase())).length,tickets=(s.ticketBook?.items||[]).filter(x=>['HOLD','LISTED'].includes(String(x.workflow||'HOLD').toUpperCase())).length;
  host.innerHTML=`<div class="view-head"><div><div class="eyebrow">KAMIL OS ${APP_VERSION}</div><h1>Načítám detail. Základ už je připravený.</h1><p>Nejdřív ukazuju uložená data z tohoto zařízení; cloud a těžší analýzy se dotáhnou potom.</p></div></div><div class="metric-strip"><div class="metric"><span>Otevřené úkoly</span><b>${open}</b></div><div class="metric"><span>Waiting For</span><b>${waiting}</b></div><div class="metric"><span>Aktivní vstupenky</span><b>${tickets}</b></div><div class="metric"><span>Režim</span><b>rychlý start</b></div></div>`;
 }else host.innerHTML=`<div class="view-head"><div><div class="eyebrow">${pageTitles[view]||'KAMIL OS'}</div><h1>Načítám modul…</h1><p>Obsah se dotahuje až při otevření této sekce, aby nezpomaloval start celé aplikace.</p></div></div>`;
}
async function render(){
 updateChrome();quickShell(current);const seq=++renderSeq,view=current;
 try{
  const renderer=await getViewRenderer41(view);if(seq!==renderSeq||view!==current)return;renderer?.();qs(`#${view}View`)?.removeAttribute('data-fast-shell');markFirstView41(view);window.dispatchEvent(new CustomEvent('kamil:release-stamp'));renderExtras41(view);
 }catch(error){console.error('[app41] render',view,error);const host=qs(`#${view}View`);if(host)host.innerHTML=`<div class="card"><h2>Modul se nepodařilo načíst</h2><p class="muted">Obnov stránku. Uložená data nebyla smazána.</p></div>`}
}
function scheduleRender(){if(renderQueued)return;renderQueued=true;queueMicrotask(()=>{renderQueued=false;render()})}
function navigate(v){current=validViews41.has(v)?v:'today';qsa('.view').forEach(x=>x.classList.remove('on'));qs(`#view-${current}`)?.classList.add('on');quickShell(current);scheduleRender();window.dispatchEvent(new CustomEvent('kamil:view-change',{detail:current}));window.scrollTo({top:0,behavior:'smooth'})}
qsa('[data-view]').forEach(x=>{x.onclick=()=>navigate(x.dataset.view);x.addEventListener('pointerenter',()=>prefetchView41(x.dataset.view),{passive:true})});
window.addEventListener('kamil:navigate',e=>navigate(e.detail));
window.addEventListener('kamil:more',async e=>{await setMoreMode41(e.detail);if(current==='more')scheduleRender()});
window.addEventListener('kamil:logout',()=>withActionLock(async()=>{await logout();await handleSession(null)}));
window.addEventListener('kamil:capture',e=>openCapture(e.detail||null));
window.addEventListener('kamil:cloud-login',e=>showLoginView(e.detail?.reason==='recovery'?'Toto zařízení nemá tvoje uložená data. Připoj existující cloudový profil — nejjednodušší je e-mailový odkaz bez hesla.':'Cloud je volitelný. Kamil OS funguje i bez přihlášení.'));

store.subscribe(()=>{scheduleRender();scheduleNotifications41()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')scheduleNotifications41(0)});
qs('#undoBtn').onclick=()=>{if(!store.undo())toast('Není co vrátit')};
qs('#logoutBtn').onclick=()=>withActionLock(async()=>{await logout();await handleSession(null)});
qs('#quickAddBtn')?.addEventListener('click',()=>openCapture());

const input=qs('#commandInput');let commandSeq=0;
input.oninput=()=>{const seq=++commandSeq,value=input.value;renderCommandResults41(value).then(()=>{if(seq!==commandSeq)return}).catch(()=>{})};
input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const v=input.value;input.value='';commandSeq++;executeCommand41(v).then(()=>renderCommandResults41(''))}if(e.key==='Escape'){input.value='';commandSeq++;renderCommandResults41('');input.blur()}};
qs('#commandGo').onclick=()=>{const v=input.value;input.value='';commandSeq++;executeCommand41(v).then(()=>renderCommandResults41(''))};
document.addEventListener('keydown',e=>{
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.focus();input.select();import('./command.js')}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='n'){e.preventDefault();openCapture()}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();store.undo()}
});
document.addEventListener('click',e=>{if(!e.target.closest('.command-wrap')&&input.value)renderCommandResults41('')});

onSyncStatus((s,detail)=>{const el=qs('#syncStatus');if(!el)return;el.className='sync '+(s==='ok'?'ok':s);el.innerHTML=`<i></i> ${s==='ok'?'Cloud • Uloženo':s==='saving'?'Cloud • Ukládám…':s==='offline'?'Offline – uložím později':s==='conflict'?'Konflikt dat':'Cloud'}`;el.onclick=null;el.onkeydown=null;el.removeAttribute('role');el.removeAttribute('tabindex');el.style.cursor='default';if(detail)el.title=detail});
function setCloudConnectedStatus(sess,result={}){const el=qs('#syncStatus');if(!el||!sess)return;const x=authConnectedLabel32({email:sess.user?.email,lastCloudAt:result.updatedAt||store.meta().lastCloudAt});el.className='sync ok';el.innerHTML=`<i></i> ${x.short}`;el.title=x.detail}
function setCloudLoadingStatus(){const el=qs('#syncStatus');if(!el)return;el.className='sync saving';el.innerHTML='<i></i> Cloud • Načítám data…';el.title='Lokální obrazovka už funguje; cloud se synchronizuje na pozadí.'}
function openCloudConnect(){showLoginView('Připoj existující cloudový profil. Heslo není nutné — stačí e-mailový přihlašovací odkaz.')}
function localSyncStatus(){const el=qs('#syncStatus');if(!el)return;el.className='sync local';el.innerHTML='<i></i> Jen toto zařízení';el.title='Klikni a připoj existující cloudová data. Kamil OS jinak dál funguje lokálně.';el.setAttribute('role','button');el.tabIndex=0;el.style.cursor='pointer';el.onclick=openCloudConnect;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCloudConnect()}}}
function authCooldownRender(){clearTimeout(authCooldownTimer);const magic=qs('#magicLinkBtn'),reset=qs('#forgotPasswordBtn'),m=store.meta(),magicLeft=authCooldownSeconds32(m.lastMagicLinkAt),resetLeft=authCooldownSeconds32(m.lastPasswordResetAt);if(magic){magic.disabled=magicLeft>0;magic.textContent=magicLeft>0?`Další odkaz za ${magicLeft} s`:'Poslat přihlašovací odkaz bez hesla'}if(reset){reset.disabled=resetLeft>0;reset.textContent=resetLeft>0?`Reset znovu za ${resetLeft} s`:'Obnovit cloudové heslo'}if(magicLeft||resetLeft)authCooldownTimer=setTimeout(authCooldownRender,1000)}
function showResetView(){qs('#authView').classList.add('hidden');qs('#appView').classList.add('hidden');qs('#resetView').classList.remove('hidden');setTimeout(()=>qs('#resetPassword1')?.focus(),30)}
function showLoginView(message=''){qs('#resetView').classList.add('hidden');qs('#appView').classList.add('hidden');qs('#authView').classList.remove('hidden');const email=qs('#loginEmail'),last=store.meta().lastCloudEmail;if(email&&!email.value&&last)email.value=last;if(message)qs('#authMessage').textContent=message;authCooldownRender();setTimeout(()=>email?.focus(),30)}
function showApp(){clearTimeout(authCooldownTimer);qs('#authView').classList.add('hidden');qs('#resetView').classList.add('hidden');qs('#appView').classList.remove('hidden')}
function schedulePreflight(){const idle=fn=>'requestIdleCallback'in window?requestIdleCallback(fn,{timeout:3000}):setTimeout(fn,1200);idle(async()=>{try{const pf=await runPreflight41();store.get().meta.preflight=pf;store.persist()}catch{}})}

async function handleSession(sess){
 if(recoveryMode){showResetView();return}showApp();const email=qs('#userEmail'),logoutBtn=qs('#logoutBtn');if(email)email.textContent=sess?.user?.email||'Toto zařízení';if(logoutBtn)logoutBtn.classList.toggle('hidden',!sess);
 store.get().meta.cloudMode=sess?'cloud':'local';scheduleRender();
 if(sess){
  setCloudLoadingStatus();store.setMeta({lastCloudEmail:sess.user?.email||store.meta().lastCloudEmail||null});const result=await loadCloud();
  if(result?.futureSchema){await modal('Cloudová data jsou z novější verze',`<p class="muted">Cloud používá schema <b>${result.remoteSchema}</b>, tato aplikace umí <b>${result.currentSchema}</b>. Nic jsem nepřepsal. Otevři nejnovější Kamil OS na stabilní adrese.</p>`,[{label:'Rozumím',value:'ok',primary:true}]);localSyncStatus();return}
  if(result?.conflict){const diff=conflictSummary(store.get(),result.cloud),rows=diff.map(x=>`<div class="row"><span>${x.label}</span><span>toto zařízení <b>${x.local}</b> · cloud <b>${x.cloud}</b></span></div>`).join('');const choice=await modal('Cloud a zařízení mají různé osobní změny',`<p class="muted">Nic nepřepisuju automaticky. Osobní data porovnám po hlavních skupinách:</p>${rows}<p class="muted">Pokud si nejsi jistý, zvol toto zařízení a potom udělej export zálohy.</p>`,[{label:'Použít cloud',value:'cloud'},{label:'Použít toto zařízení',value:'local',primary:true}]);if(choice)await resolveConflict(choice,result.cloud)}
  await flushQueue();setCloudConnectedStatus(sess,result);scheduleRender();
  loadDataHubs().then(()=>{setCloudConnectedStatus(sess,result);scheduleRender();markPerf41('cloud-hubs-ready')}).catch(()=>{});
 }else localSyncStatus();
 schedulePreflight();markPerf41(sess?'cloud-session-ready':'local-ready');
}
async function startAuthWatch(){stopAuthWatch();stopAuthWatch=await watchAuth((ev,sess)=>{if(ev==='PASSWORD_RECOVERY'){recoveryMode=true;setTimeout(showResetView,0);return}if(!recoveryMode)setTimeout(()=>handleSession(sess),0)})}

qs('#magicLinkBtn').onclick=async()=>{const email=qs('#loginEmail').value.trim(),msg=qs('#authMessage'),left=authCooldownSeconds32(store.meta().lastMagicLinkAt);if(left){msg.textContent=`Už jsem odkaz poslal. Použij nejnovější e-mail nebo počkej ${left} s.`;authCooldownRender();return}if(!email){msg.textContent='Nejdřív napiš e-mail cloudového účtu.';qs('#loginEmail').focus();return}store.setMeta({lastCloudEmail:email});msg.textContent='Posílám přihlašovací odkaz…';qs('#magicLinkBtn').disabled=true;try{const {error}=await sendMagicLink(email);if(error){if(error.status===429||String(error.message||'').toLowerCase().includes('rate limit'))store.setMeta({lastMagicLinkAt:new Date().toISOString()});msg.textContent=authErrorMessage32(error)}else{store.setMeta({lastMagicLinkAt:new Date().toISOString()});msg.textContent='Hotovo. Otevři vždy nejnovější e-mail. Odkaz tě vrátí na stabilní Kamil OS a načte cloudová data.'}}catch(error){msg.textContent=authErrorMessage32(error)}authCooldownRender()};
qs('#loginBtn').onclick=async()=>{const email=qs('#loginEmail').value.trim(),password=qs('#loginPassword').value,msg=qs('#authMessage');if(!email||!password){msg.textContent='Pro přihlášení heslem vyplň e-mail i heslo. Nebo použij přihlašovací odkaz bez hesla.';return}store.setMeta({lastCloudEmail:email});msg.textContent='Připojuji cloud…';try{const {data,error}=await login(email,password);if(error){msg.textContent=authErrorMessage32(error);return}msg.textContent='';await handleSession(data?.session||await session());await startAuthWatch()}catch(error){msg.textContent=authErrorMessage32(error)}};
qs('#loginPassword').onkeydown=e=>{if(e.key==='Enter')qs('#loginBtn').click()};
qs('#skipLoginBtn')?.addEventListener('click',async()=>{recoveryMode=false;await handleSession(await session())});
qs('#forgotPasswordBtn').onclick=async()=>{const email=qs('#loginEmail').value.trim(),msg=qs('#authMessage'),left=authCooldownSeconds32(store.meta().lastPasswordResetAt);if(left){msg.textContent=`Reset už byl odeslaný. Použij nejnovější e-mail nebo počkej ${left} s.`;authCooldownRender();return}if(!email){msg.textContent='Nejdřív napiš e-mail, na který mám poslat reset.';qs('#loginEmail').focus();return}store.setMeta({lastCloudEmail:email});msg.textContent='Posílám resetovací odkaz…';qs('#forgotPasswordBtn').disabled=true;try{const {error}=await sendPasswordReset(email);if(error){if(error.status===429||String(error.message||'').toLowerCase().includes('rate limit'))store.setMeta({lastPasswordResetAt:new Date().toISOString()});msg.textContent=authErrorMessage32(error)}else{store.setMeta({lastPasswordResetAt:new Date().toISOString()});msg.textContent='Hotovo. Otevři nejnovější resetovací e-mail; vrátí se na stabilní Kamil OS adresu.'}}catch(error){msg.textContent=authErrorMessage32(error)}authCooldownRender()};
qs('#setPasswordBtn').onclick=async()=>{const p1=qs('#resetPassword1').value,p2=qs('#resetPassword2').value,msg=qs('#resetMessage');if(p1.length<8){msg.textContent='Heslo musí mít alespoň 8 znaků.';return}if(p1!==p2){msg.textContent='Hesla se neshodují.';return}msg.textContent='Ukládám nové heslo…';const {error}=await updatePassword(p1);if(error){msg.textContent=authErrorMessage32(error);return}msg.textContent='Cloudové heslo změněno.';recoveryMode=false;history.replaceState({},document.title,location.pathname+location.search.replace(/([?&])type=recovery(&|$)/,'$1').replace(/[?&]$/,''));await handleSession(await session());await startAuthWatch()};
qs('#resetPassword2').onkeydown=e=>{if(e.key==='Enter')qs('#setPasswordBtn').click()};

// Rychlý start: lokální data vykreslíme dřív, než čekáme na SDK/cloud session.
showApp();localSyncStatus();quickShell('today');scheduleRender();warmRuntime41();markPerf41('shell-visible');
const hashParams=new URLSearchParams(location.hash.replace(/^#/,''));
if(hashParams.get('error')){recoveryMode=false;history.replaceState({},document.title,location.pathname+location.search);toast(hashParams.get('error_code')==='otp_expired'?'Přihlašovací/resetovací odkaz vypršel. Pošli si nový a otevři vždy nejnovější e-mail.':'Cloudové přihlášení se nepodařilo. Kamil OS běží lokálně.');await handleSession(await session())}else if(recoveryMode){await session();showResetView();await startAuthWatch()}else{const sess=await session();if(sess){await handleSession(sess);await startAuthWatch()}else{store.get().meta.cloudMode='local';schedulePreflight();markPerf41('session-check-complete')}}

if('serviceWorker'in navigator){const reg=await navigator.serviceWorker.register('./sw.js');reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)qs('#updateBanner').classList.remove('hidden')})});qs('#reloadAppBtn').onclick=()=>location.reload()}
window.addEventListener('beforeunload',()=>{if(store.dirty){store.queueSync(store.get());store.setMeta({pendingAt:new Date().toISOString()})}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.__installPrompt=e});
