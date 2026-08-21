import {APP_VERSION} from './releaseMeta.js';
import {store} from './state.js';
import {login,logout,session,loadCloud,loadDataHubs,resolveConflict,conflictSummary,onSyncStatus,flushQueue,sendPasswordReset,sendMagicLink,updatePassword,watchAuth} from './cloud.js';
import {authCooldownSeconds32,authErrorMessage32,authConnectedLabel32} from './authUx32.js';
import {qs,qsa,toast,modal} from './utils.js';
import {renderMore,setMoreMode} from './more26.js';
import {renderToday} from './today29.js';
import {renderHome} from './home26.js';
import {renderMoney} from './money24.js';
import {renderTickets} from './tickets24.js';
import {openQuickCapture} from './capture26.js';
import {execute,renderResults} from './command.js';
import {personalRiskCenter} from './personalRisk25.js';
import {runPreflight} from './preflight.js';
import {renderAutopilot,runAutopilotNotifications} from './autopilotUi28.js';
import {renderPersonalPlus,runReminderNotifications} from './personalPlusUi29.js';

let actionLock=false;
export async function withActionLock(fn){if(actionLock)return false;actionLock=true;try{return await fn()}finally{setTimeout(()=>{actionLock=false},250)}}

let current='today',stopAuthWatch=()=>{},authCooldownTimer=null;
let recoveryMode=location.hash.includes('type=recovery')||new URLSearchParams(location.search).get('type')==='recovery';
const renderers={today:renderToday,money:renderMoney,tickets:renderTickets,home:renderHome,more:renderMore};
const pageTitles={today:'DNES',money:'PENÍZE',tickets:'VSTUPENKY',home:'DOMOV',more:'VÍCE'};
const captureTypeForView=()=>({today:'task',home:'personal',money:'debt',tickets:'ticket'})[current]||'task';
const openCapture=(type=null)=>withActionLock(()=>openQuickCapture(type||captureTypeForView()));

function updateChrome(){
 const s=store.get();
 qs('#todayLabel').textContent=new Date().toLocaleDateString('cs-CZ',{weekday:'long',day:'numeric',month:'long'});
 const page=qs('#pageTitle');if(page)page.textContent=pageTitles[current]||'DNES';
 qsa('.version').forEach(x=>x.textContent=APP_VERSION);
 const risk=personalRiskCenter(s),count=risk.critical+risk.high,b=qs('#moreBadge');if(b){b.textContent=count;b.classList.toggle('hidden',!count)}
 qsa('[data-view]').forEach(x=>x.classList.toggle('on',x.dataset.view===current));
 qs('#undoBtn').disabled=!(s.undo||[]).length;
 const add=qs('#quickAddBtn');if(add){const label={today:'Osobní úkol',home:'Osobní položka',money:'Pohledávka',tickets:'Vstupenka'}[current]||'Přidat';const text=qs('b',add);if(text)text.textContent=label;add.title=`Rychle přidat ${label.toLowerCase()} · Ctrl N`}
}
function render(){updateChrome();renderers[current]?.();if(current!=='today')renderAutopilot(current);renderPersonalPlus(current)}
function navigate(v){current=renderers[v]?v:'today';qsa('.view').forEach(x=>x.classList.remove('on'));qs(`#view-${current}`)?.classList.add('on');render();window.scrollTo({top:0,behavior:'smooth'})}
qsa('[data-view]').forEach(x=>x.onclick=()=>navigate(x.dataset.view));
window.addEventListener('kamil:navigate',e=>navigate(e.detail));
window.addEventListener('kamil:more',e=>{setMoreMode(e.detail);queueMicrotask(()=>{renderAutopilot('more');renderPersonalPlus('more')})});
window.addEventListener('kamil:logout',()=>withActionLock(async()=>{await logout();await handleSession(null)}));
window.addEventListener('kamil:capture',e=>openCapture(e.detail||null));
window.addEventListener('kamil:cloud-login',e=>showLoginView(e.detail?.reason==='recovery'?'Toto zařízení nemá tvoje uložená data. Připoj existující cloudový profil — nejjednodušší je e-mailový odkaz bez hesla.':'Cloud je volitelný. Kamil OS funguje i bez přihlášení.'));

store.subscribe(()=>{render();runAutopilotNotifications();runReminderNotifications()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){runAutopilotNotifications();runReminderNotifications()}});
qs('#undoBtn').onclick=()=>{if(!store.undo())toast('Není co vrátit')};
qs('#logoutBtn').onclick=()=>withActionLock(async()=>{await logout();await handleSession(null)});
qs('#quickAddBtn')?.addEventListener('click',()=>openCapture());

const input=qs('#commandInput');
input.oninput=()=>renderResults(input.value);
input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const v=input.value;execute(v);input.value='';renderResults('')}if(e.key==='Escape'){input.value='';renderResults('');input.blur()}};
qs('#commandGo').onclick=()=>{const v=input.value;execute(v);input.value='';renderResults('')};
document.addEventListener('keydown',e=>{
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.focus();input.select()}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='n'){e.preventDefault();openCapture()}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();store.undo()}
});
document.addEventListener('click',e=>{if(!e.target.closest('.command-wrap'))renderResults('')});

onSyncStatus((s,detail)=>{const el=qs('#syncStatus');if(!el)return;el.className='sync '+(s==='ok'?'ok':s);el.innerHTML=`<i></i> ${s==='ok'?'Cloud • Uloženo':s==='saving'?'Cloud • Ukládám…':s==='offline'?'Offline – uložím později':s==='conflict'?'Konflikt dat':'Cloud'}`;el.onclick=null;el.onkeydown=null;el.removeAttribute('role');el.removeAttribute('tabindex');el.style.cursor='default';if(detail)el.title=detail});
function setCloudConnectedStatus(sess,result={}){const el=qs('#syncStatus');if(!el||!sess)return;const x=authConnectedLabel32({email:sess.user?.email,lastCloudAt:result.updatedAt||store.meta().lastCloudAt});el.className='sync ok';el.innerHTML=`<i></i> ${x.short}`;el.title=x.detail}
function openCloudConnect(){showLoginView('Připoj existující cloudový profil. Heslo není nutné — stačí e-mailový přihlašovací odkaz.')}
function localSyncStatus(){const el=qs('#syncStatus');if(!el)return;el.className='sync local';el.innerHTML='<i></i> Jen toto zařízení';el.title='Klikni a připoj existující cloudová data. Kamil OS jinak dál funguje lokálně.';el.setAttribute('role','button');el.tabIndex=0;el.style.cursor='pointer';el.onclick=openCloudConnect;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCloudConnect()}}}
function authCooldownRender(){clearTimeout(authCooldownTimer);const magic=qs('#magicLinkBtn'),reset=qs('#forgotPasswordBtn'),m=store.meta(),magicLeft=authCooldownSeconds32(m.lastMagicLinkAt),resetLeft=authCooldownSeconds32(m.lastPasswordResetAt);if(magic){magic.disabled=magicLeft>0;magic.textContent=magicLeft>0?`Další odkaz za ${magicLeft} s`:'Poslat přihlašovací odkaz bez hesla'}if(reset){reset.disabled=resetLeft>0;reset.textContent=resetLeft>0?`Reset znovu za ${resetLeft} s`:'Obnovit cloudové heslo'}if(magicLeft||resetLeft)authCooldownTimer=setTimeout(authCooldownRender,1000)}
function showResetView(){qs('#authView').classList.add('hidden');qs('#appView').classList.add('hidden');qs('#resetView').classList.remove('hidden');setTimeout(()=>qs('#resetPassword1')?.focus(),30)}
function showLoginView(message=''){qs('#resetView').classList.add('hidden');qs('#appView').classList.add('hidden');qs('#authView').classList.remove('hidden');const email=qs('#loginEmail'),last=store.meta().lastCloudEmail;if(email&&!email.value&&last)email.value=last;if(message)qs('#authMessage').textContent=message;authCooldownRender();setTimeout(()=>email?.focus(),30)}
function showApp(){clearTimeout(authCooldownTimer);qs('#authView').classList.add('hidden');qs('#resetView').classList.add('hidden');qs('#appView').classList.remove('hidden')}

async function handleSession(sess){
 if(recoveryMode){showResetView();return}showApp();const email=qs('#userEmail'),logoutBtn=qs('#logoutBtn');if(email)email.textContent=sess?.user?.email||'Toto zařízení';if(logoutBtn)logoutBtn.classList.toggle('hidden',!sess);
 if(sess){
  store.setMeta({lastCloudEmail:sess.user?.email||store.meta().lastCloudEmail||null});const result=await loadCloud();
  if(result?.futureSchema){await modal('Cloudová data jsou z novější verze',`<p class="muted">Cloud používá schema <b>${result.remoteSchema}</b>, tato aplikace umí <b>${result.currentSchema}</b>. Nic jsem nepřepsal. Otevři nejnovější Kamil OS na stabilní adrese.</p>`,[{label:'Rozumím',value:'ok',primary:true}]);localSyncStatus();return}
  if(result?.conflict){const diff=conflictSummary(store.get(),result.cloud),rows=diff.map(x=>`<div class="row"><span>${x.label}</span><span>toto zařízení <b>${x.local}</b> · cloud <b>${x.cloud}</b></span></div>`).join('');const choice=await modal('Cloud a zařízení mají různé osobní změny',`<p class="muted">Nic nepřepisuju automaticky. Osobní data porovnám po hlavních skupinách:</p>${rows}<p class="muted">Pokud si nejsi jistý, zvol toto zařízení a potom udělej export zálohy.</p>`,[{label:'Použít cloud',value:'cloud'},{label:'Použít toto zařízení',value:'local',primary:true}]);if(choice)await resolveConflict(choice,result.cloud)}
  await flushQueue();await loadDataHubs();store.setMeta({cloudConnectedAt:new Date().toISOString()});setCloudConnectedStatus(sess,result);
 }else localSyncStatus();
 store.get().meta.cloudMode=sess?'cloud':'local';const pf=runPreflight();store.get().meta.preflight=pf;store.persist();render();
}
async function startAuthWatch(){stopAuthWatch();stopAuthWatch=await watchAuth((ev,sess)=>{if(ev==='PASSWORD_RECOVERY'){recoveryMode=true;setTimeout(showResetView,0);return}if(!recoveryMode)setTimeout(()=>handleSession(sess),0)})}

qs('#magicLinkBtn').onclick=async()=>{const email=qs('#loginEmail').value.trim(),msg=qs('#authMessage'),left=authCooldownSeconds32(store.meta().lastMagicLinkAt);if(left){msg.textContent=`Už jsem odkaz poslal. Použij nejnovější e-mail nebo počkej ${left} s.`;authCooldownRender();return}if(!email){msg.textContent='Nejdřív napiš e-mail cloudového účtu.';qs('#loginEmail').focus();return}store.setMeta({lastCloudEmail:email});msg.textContent='Posílám přihlašovací odkaz…';qs('#magicLinkBtn').disabled=true;try{const {error}=await sendMagicLink(email);if(error){if(error.status===429||String(error.message||'').toLowerCase().includes('rate limit'))store.setMeta({lastMagicLinkAt:new Date().toISOString()});msg.textContent=authErrorMessage32(error)}else{store.setMeta({lastMagicLinkAt:new Date().toISOString()});msg.textContent='Hotovo. Otevři vždy nejnovější e-mail. Odkaz tě vrátí na stabilní Kamil OS a načte cloudová data.'}}catch(error){msg.textContent=authErrorMessage32(error)}authCooldownRender()};
qs('#loginBtn').onclick=async()=>{const email=qs('#loginEmail').value.trim(),password=qs('#loginPassword').value,msg=qs('#authMessage');if(!email||!password){msg.textContent='Pro přihlášení heslem vyplň e-mail i heslo. Nebo použij přihlašovací odkaz bez hesla.';return}store.setMeta({lastCloudEmail:email});msg.textContent='Připojuji cloud…';try{const {data,error}=await login(email,password);if(error){msg.textContent=authErrorMessage32(error);return}msg.textContent='';await handleSession(data?.session||await session());await startAuthWatch()}catch(error){msg.textContent=authErrorMessage32(error)}};
qs('#loginPassword').onkeydown=e=>{if(e.key==='Enter')qs('#loginBtn').click()};
qs('#skipLoginBtn')?.addEventListener('click',async()=>{recoveryMode=false;await handleSession(await session())});
qs('#forgotPasswordBtn').onclick=async()=>{const email=qs('#loginEmail').value.trim(),msg=qs('#authMessage'),left=authCooldownSeconds32(store.meta().lastPasswordResetAt);if(left){msg.textContent=`Reset už byl odeslaný. Použij nejnovější e-mail nebo počkej ${left} s.`;authCooldownRender();return}if(!email){msg.textContent='Nejdřív napiš e-mail, na který mám poslat reset.';qs('#loginEmail').focus();return}store.setMeta({lastCloudEmail:email});msg.textContent='Posílám resetovací odkaz…';qs('#forgotPasswordBtn').disabled=true;try{const {error}=await sendPasswordReset(email);if(error){if(error.status===429||String(error.message||'').toLowerCase().includes('rate limit'))store.setMeta({lastPasswordResetAt:new Date().toISOString()});msg.textContent=authErrorMessage32(error)}else{store.setMeta({lastPasswordResetAt:new Date().toISOString()});msg.textContent='Hotovo. Otevři nejnovější resetovací e-mail; vrátí se na stabilní Kamil OS adresu.'}}catch(error){msg.textContent=authErrorMessage32(error)}authCooldownRender()};
qs('#setPasswordBtn').onclick=async()=>{const p1=qs('#resetPassword1').value,p2=qs('#resetPassword2').value,msg=qs('#resetMessage');if(p1.length<8){msg.textContent='Heslo musí mít alespoň 8 znaků.';return}if(p1!==p2){msg.textContent='Hesla se neshodují.';return}msg.textContent='Ukládám nové heslo…';const {error}=await updatePassword(p1);if(error){msg.textContent=authErrorMessage32(error);return}msg.textContent='Cloudové heslo změněno.';recoveryMode=false;history.replaceState({},document.title,location.pathname+location.search.replace(/([?&])type=recovery(&|$)/,'$1').replace(/[?&]$/,''));await handleSession(await session());await startAuthWatch()};
qs('#resetPassword2').onkeydown=e=>{if(e.key==='Enter')qs('#setPasswordBtn').click()};

const hashParams=new URLSearchParams(location.hash.replace(/^#/,''));
if(hashParams.get('error')){recoveryMode=false;history.replaceState({},document.title,location.pathname+location.search);toast(hashParams.get('error_code')==='otp_expired'?'Přihlašovací/resetovací odkaz vypršel. Pošli si nový a otevři vždy nejnovější e-mail.':'Cloudové přihlášení se nepodařilo. Kamil OS běží lokálně.');await handleSession(await session())}else if(recoveryMode){await session();showResetView();await startAuthWatch()}else{const sess=await session();await handleSession(sess);if(sess)await startAuthWatch()}

if('serviceWorker'in navigator){
 navigator.serviceWorker.register('./sw.js').then(reg=>{
  reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)qs('#updateBanner')?.classList.remove('hidden')})});
  const reload=qs('#reloadAppBtn');if(reload)reload.onclick=()=>location.reload();
 }).catch(()=>{});
}
window.addEventListener('beforeunload',()=>{if(store.dirty){store.queueSync(store.get());store.setMeta({pendingAt:new Date().toISOString()})}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.__installPrompt=e});
