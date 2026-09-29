import {APP_VERSION} from './releaseMeta.js';
import {store} from './state.js';
import {login,logout,session,loadCloud,loadDataHubs,resolveConflict,conflictSummary,onSyncStatus,flushQueue,sendPasswordReset,sendMagicLink,updatePassword,watchAuth} from './cloud.js';
import {authCooldownSeconds32,authErrorMessage32,authConnectedLabel32} from './authUx32.js';
import {qs,qsa,toast,modal,norm} from './utils.js';
import {validViews41,getViewRenderer41,prefetchView41,setMoreMode41,openCapture41,renderCommandResults41,executeCommand41,renderExtras41,refreshRiskBadge41,runPreflight41,scheduleNotifications41,warmRuntime41} from './viewRuntime41.js';
import {markPerf41,markFirstView41} from './perf41.js';
import {startColdPartition42} from './coldPartition42.js';
import {installRuntimeOwnership1100,ownEvent1100,ownCleanup1100,schedule1100,cancelScheduled1100} from './runtimeOwnership1100.js';
import {scheduleFrame1110,scheduleIdle1110} from './osHardening1110.js';
import {restoreCanonicalProductStyles} from './productAdvancedStyles.js';
import {isPersonalScope527} from './personalScope527.js';
import {VIEW_ORDER,viewMeta,viewFromUrl,writeViewToUrl} from './viewRegistry.js';
import {recordDiagnostic,copyDiagnostic} from './diagnostics.js';

const OWNER='core.app41';
installRuntimeOwnership1100();
await startColdPartition42();
let actionLock=false;
export async function withActionLock(fn){if(actionLock)return false;actionLock=true;try{return await fn()}finally{schedule1100(OWNER,'action-unlock',()=>{actionLock=false},250)}}

let current='today',stopAuthWatch=()=>{},renderSeq=0,renderQueued=false,renderForce=false,stateRevision=0,sessionSeq=0;
const viewRevision=new Map();
let recoveryMode=location.hash.includes('type=recovery')||new URLSearchParams(location.search).get('type')==='recovery';
const hasPrivateSnapshotKey=()=>{try{return new URLSearchParams(location.hash.replace(/^#/,'')).has('privateSnapshotKey')}catch{return false}};
async function importPrivateSnapshotIfPresent(){
 if(!hasPrivateSnapshotKey())return false;
 try{const m=await import('./privateSnapshotImport1320.js');const result=await m.importPrivateSnapshot1320();if(result?.ok){stateRevision++;scheduleRender(true);toast('Aktuální soukromá data byla načtena do Kamil OS.');return true}toast('Soukromý snapshot se nepodařilo načíst.');return false}catch(error){console.warn('[app41:private-snapshot]',error);toast('Soukromý snapshot se nepodařilo načíst.');return false}
}
const hostForView=view=>qs(`#${viewMeta(view).host}`);
const openCapture=(type=null)=>withActionLock(()=>openCapture41(type||viewMeta(current).capture));
const warnAction=(scope,error)=>{console.warn(`[app41:${scope}]`,error);toast('Akci se nepodařilo dokončit')};

const NAV_CLOSED1333=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED','PAYOUT_RECEIVED','CANCELLED','CANCELED']);
const navOpen1333=x=>!NAV_CLOSED1333.has(String(x?.status||x?.workflow||x?.market_status||'OPEN').toUpperCase());
const navArea1333=x=>norm(x?.area||x?.category||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const navDue1333=x=>x?.due||x?.followUpAt||x?.dueAt||x?.due_at||x?.dueDate||x?.due_date||x?.deadline||null;
const navDueTime1333=x=>{const raw=String(navDue1333(x)||'');if(!raw)return null;const d=Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(raw)?raw+'T23:59:59.999':raw);return Number.isFinite(d)?d:null};
function navSignals1333(s){
 const now=Date.now(),soon=now+2*86400000,tasks=(s.tasks||[]).filter(navOpen1333);
 const overdue=tasks.filter(isPersonalScope527).filter(x=>{const t=navDueTime1333(x);return t!==null&&t<now}).length;
 const workDue=tasks.filter(x=>{const a=navArea1333(x),t=navDueTime1333(x);return (a.includes('prac')||a.includes('zakaz'))&&t!==null&&t<=soon}).length;
 const transfers=(s.ticketBook?.items||[]).filter(x=>['SOLD_UNDELIVERED','TRANSFER_REQUIRED','SOLD_WAITING_TRANSFER'].includes(String(x?.market_status||x?.workflow||'').toUpperCase())).length;
 return {
  inbox:overdue?{count:overdue,tone:'bad',label:`${overdue} úkolů po termínu`}:null,
  work:workDue?{count:workDue,tone:'warn',label:`${workDue} pracovní termíny do 2 dnů`}:null,
  tickets:transfers?{count:transfers,tone:'bad',label:`${transfers} ticket transfery čekají`}:null
 };
}
function applyNavSignals1333(s){
 const signals=navSignals1333(s);
 qsa('#mainNav [data-view],#bottomNav [data-view]').forEach(x=>{
  const sig=signals[x.dataset.view];
  if(sig?.count){
   x.dataset.navBadge=String(Math.min(99,sig.count));
   x.dataset.navTone=sig.tone;
   x.dataset.navSignal=sig.label;
  }else{
   delete x.dataset.navBadge;
   delete x.dataset.navTone;
   delete x.dataset.navSignal;
  }
 });
 window.__KAMIL_NAV_SIGNALS1333__={...signals,at:Date.now()};
}

function updateChrome(){
 const s=store.get();
 const label=qs('#todayLabel');if(label)label.textContent=current==='today'?new Date().toLocaleDateString('cs-CZ',{weekday:'long',day:'numeric',month:'long'}):'';
 const meta=viewMeta(current),page=qs('#pageTitle');if(page)page.textContent=meta.title;const commandInput=qs('#commandInput');if(commandInput)commandInput.placeholder=meta.hint||'Co chceš udělat?';
 qsa('.version').forEach(x=>x.textContent=APP_VERSION);
 qsa('[data-view]').forEach(x=>{const on=x.dataset.view===current;x.classList.toggle('on',on);if(on)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current')});
 applyNavSignals1333(s);
 const undo=qs('#undoBtn');if(undo){const undoCount=store.undoCount(),undoLabel=store.undoLabel?.();undo.disabled=undoCount===0;undo.title=undoLabel?'Vrátit: '+undoLabel:'Není co vrátit';undo.setAttribute('aria-label',undoLabel?'Vrátit poslední změnu: '+undoLabel:'Vrátit poslední změnu')}
 const add=qs('#quickAddBtn');if(add){add.classList.remove('hidden');const text=qs('b',add),name=meta.quick||'Přidat';if(text)text.textContent=name;add.title=`Rychle přidat ${name.toLowerCase()} · Ctrl N`;add.setAttribute('aria-label',`Rychle přidat ${name.toLowerCase()}`)}
 refreshRiskBadge41(s);
}
function revealMobileDestination(view){
 const nav=qs('#bottomNav'),btn=nav?.querySelector(`[data-view="${view}"]`);if(!nav||!btn)return false;
 const nr=nav.getBoundingClientRect(),br=btn.getBoundingClientRect();if(br.left>=nr.left&&br.right<=nr.right)return false;
 btn.scrollIntoView({block:'nearest',inline:'center',behavior:'auto'});return true;
}
function quickShell(view){
 const host=hostForView(view);if(!host||host.dataset.fastShell==='1'||host.dataset.viewReady==='1')return;host.dataset.fastShell='1';
 const title=viewMeta(view).title;
 host.innerHTML=`<div class="view-head os1900-loading" data-os1900-loading><div><div class="eyebrow">${title}</div><h1>Načítám…</h1><p>Aktuální obsah se vykreslí z jednoho kanonického rendereru.</p></div></div>`;
}
async function render(force=false){
 updateChrome();const view=current,host=hostForView(view);
 if(!force&&host?.dataset.viewReady==='1'&&viewRevision.get(view)===stateRevision)return;
 quickShell(view);const seq=++renderSeq,revision=stateRevision;
 try{
  const renderer=await getViewRenderer41(view);if(seq!==renderSeq||view!==current)return;
  const result=renderer?.();if(result&&typeof result.then==='function')await result;
  if(seq!==renderSeq||view!==current)return;
  const currentHost=hostForView(view);if(currentHost){currentHost.dataset.viewReady='1';currentHost.removeAttribute('data-fast-shell')}
  viewRevision.set(view,revision);markFirstView41(view);window.dispatchEvent(new CustomEvent('kamil:release-stamp'));await renderExtras41(view);if(!currentHost?.dataset.productAdvanced)restoreCanonicalProductStyles();
 }catch(error){
  console.error('[app41] render',view,error);
  const failed=hostForView(view),diag=recordDiagnostic('render:'+view,error,{view});
  if(failed){
   failed.removeAttribute('data-fast-shell');failed.removeAttribute('data-view-ready');
   failed.innerHTML=`<div class="card" data-runtime-error><div class="eyebrow">DIAGNOSTIKA</div><h2>Modul se nepodařilo načíst</h2><p class="muted">Data zůstala uložená. Můžeš zkusit renderer znovu nebo zkopírovat diagnostiku.</p><div class="row"><span>Kód chyby</span><b>${diag.id}</b></div><div class="row-actions"><button class="btn primary" data-runtime-retry>Zkusit znovu</button><button class="btn" data-runtime-copy>Kopírovat diagnostiku</button></div></div>`;
   const retry=failed.querySelector('[data-runtime-retry]'),copy=failed.querySelector('[data-runtime-copy]');
   if(retry)retry.onclick=()=>scheduleRender(true);
   if(copy)copy.onclick=async()=>toast(await copyDiagnostic(diag.id)?'Diagnostika zkopírována':'Diagnostiku se nepodařilo zkopírovat');
  }
 }
}
function scheduleRender(force=false){
 renderForce=renderForce||force;if(renderQueued)return;renderQueued=true;
 scheduleFrame1110('app-render',()=>{const runForce=renderForce;renderForce=false;renderQueued=false;void render(runForce)});
}
function navigate(v,{syncUrl=true,replaceUrl=false}={}){
 const next=validViews41.has(v)?v:'today';
 if(next===current){
  const sameHost=hostForView(current);
  if(sameHost?.dataset.productAdvanced==='1'){
   sameHost.removeAttribute('data-product-advanced');
   sameHost.removeAttribute('data-view-ready');
   viewRevision.delete(current);
   restoreCanonicalProductStyles();
   scheduleRender(true);
   window.scrollTo({top:0,behavior:'auto'});
   return;
  }
  updateChrome();if(viewRevision.get(current)!==stateRevision)scheduleRender();return
 }
 const leavingHost=hostForView(current);
 if(leavingHost?.dataset.productAdvanced==='1'){leavingHost.removeAttribute('data-product-advanced');leavingHost.removeAttribute('data-view-ready');viewRevision.delete(current);restoreCanonicalProductStyles()}
 current=next;if(syncUrl)writeViewToUrl(current,{replace:replaceUrl});qsa('.view').forEach(x=>x.classList.remove('on'));qs(`#view-${current}`)?.classList.add('on');updateChrome();revealMobileDestination(current);quickShell(current);
 if(viewRevision.get(current)!==stateRevision)scheduleRender();
 void prefetchView41(current);window.dispatchEvent(new CustomEvent('kamil:view-change',{detail:current}));window.scrollTo({top:0,behavior:'auto'});
}
qsa('[data-view]').forEach(x=>{x.onclick=()=>navigate(x.dataset.view)});
const warmNav=e=>{const x=e.target?.closest?.('[data-view]');if(x)void prefetchView41(x.dataset.view)};
ownEvent1100(OWNER,document,'pointerover',warmNav,{passive:true});
ownEvent1100(OWNER,document,'pointerdown',warmNav,{passive:true});
ownEvent1100(OWNER,document,'focusin',warmNav,{passive:true});
ownEvent1100(OWNER,window,'kamil:navigate',e=>navigate(e.detail));
ownEvent1100(OWNER,window,'popstate',()=>navigate(viewFromUrl(),{syncUrl:false}));
ownEvent1100(OWNER,window,'kamil:more',async e=>{await setMoreMode41(e.detail);if(current==='more')scheduleRender(true)});
ownEvent1100(OWNER,window,'kamil:logout',()=>withActionLock(async()=>{await logout();await handleSession(null)}).catch(error=>warnAction('logout',error)));
ownEvent1100(OWNER,window,'kamil:capture',e=>openCapture(e.detail||null).catch(error=>warnAction('capture',error)));
ownEvent1100(OWNER,window,'kamil:cloud-login',e=>showLoginView(e.detail?.reason==='recovery'?'Toto zařízení nemá tvoje uložená data. Připoj existující cloudový profil — nejjednodušší je e-mailový odkaz bez hesla.':'Cloud je volitelný. Kamil OS funguje i bez přihlášení.'));

const stopStore=store.subscribe(()=>{stateRevision++;if(store.get().meta?.cloudMode!=='cloud')localSyncStatus();if(document.visibilityState==='visible')scheduleRender();scheduleNotifications41()});
ownCleanup1100(OWNER,stopStore);
ownEvent1100(OWNER,document,'visibilitychange',()=>{if(document.visibilityState==='hidden')scheduleNotifications41(0);else if(viewRevision.get(current)!==stateRevision)scheduleRender()});
qs('#undoBtn').onclick=()=>{if(!store.undo())toast('Není co vrátit')};
qs('#logoutBtn').onclick=()=>withActionLock(async()=>{await logout();await handleSession(null)}).catch(error=>warnAction('logout-button',error));
const quickAdd=qs('#quickAddBtn');if(quickAdd)ownEvent1100(OWNER,quickAdd,'click',()=>openCapture().catch(error=>warnAction('quick-add',error)));

const input=qs('#commandInput'),commandBox=qs('#commandResults');let commandSeq=0,commandHomeIndex1333=0,commandHistoryIndex741=-1;
const COMMAND_HISTORY_KEY741='kamil-os-command-history-v1',COMMAND_FAVORITES_KEY741='kamil-os-command-favorites-v1';
const commandEsc741=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readCommandList741(key){try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x.filter(Boolean).map(String):[]}catch(error){recordDiagnostic('command-storage-read',error,{key});return[]}}
function writeCommandList741(key,rows){try{localStorage.setItem(key,JSON.stringify([...new Set(rows)].slice(0,20)));return true}catch(error){recordDiagnostic('command-storage-write',error,{key});return false}}
function recordCommand741(value){const v=String(value||'').trim();if(!v)return;writeCommandList741(COMMAND_HISTORY_KEY741,[v,...readCommandList741(COMMAND_HISTORY_KEY741).filter(x=>x!==v)]);commandHistoryIndex741=-1}
function toggleFavorite741(value){const v=String(value||'').trim();if(!v)return false;const list=readCommandList741(COMMAND_FAVORITES_KEY741),on=list.includes(v),next=on?list.filter(x=>x!==v):[v,...list];writeCommandList741(COMMAND_FAVORITES_KEY741,next);return !on}
function commandMemoryHtml741(){
 const favorites=readCommandList741(COMMAND_FAVORITES_KEY741).slice(0,4),recent=readCommandList741(COMMAND_HISTORY_KEY741).filter(x=>!favorites.includes(x)).slice(0,4);
 const group=(title,rows,pinned)=>rows.length?'<div class="os741-command-memory"><b>'+title+'</b>'+rows.map(x=>'<div><button type="button" data-command-run741="'+commandEsc741(x)+'">'+commandEsc741(x)+'</button><button type="button" aria-label="'+(pinned?'Odepnout':'Připnout')+'" title="'+(pinned?'Odepnout':'Připnout')+'" data-command-pin741="'+commandEsc741(x)+'">'+(pinned?'★':'☆')+'</button></div>').join('')+'</div>':'';
 return group('Oblíbené',favorites,true)+group('Poslední příkazy',recent,false);
}
const commandNav1332=VIEW_ORDER.map(view=>{const meta=viewMeta(view);return[view,meta.title,meta.icon]});
function cancelCommandTimer(){cancelScheduled1100(OWNER,'command-debounce')}
function hideCommand1332(){commandBox?.classList.add('hidden');if(commandBox)commandBox.innerHTML=''}
function commandHomeButtons1333(){return [...(commandBox?.querySelectorAll('[data-command-nav1332]')||[])]}
function paintCommandHome1333(){
 const buttons=commandHomeButtons1333();if(!buttons.length)return false;
 commandHomeIndex1333=((commandHomeIndex1333%buttons.length)+buttons.length)%buttons.length;
 buttons.forEach((b,i)=>{const on=i===commandHomeIndex1333;b.classList.toggle('is-active',on);b.setAttribute('aria-selected',on?'true':'false')});
 return true;
}
function moveCommandHome1333(delta){commandHomeIndex1333+=delta;paintCommandHome1333()}
function openCommandHomeSelection1333(){
 const buttons=commandHomeButtons1333(),b=buttons[commandHomeIndex1333];if(!b)return false;
 hideCommand1332();input.blur();navigate(b.dataset.commandNav1332);return true
}
function showCommandHome1332(){
 if(!commandBox||String(input?.value||'').trim())return false;
 commandBox.classList.remove('hidden');
 commandBox.innerHTML='<div class="os1332-command-home" data-command-home1332><div class="os1332-command-head"><div><b>Rychle otevřít</b><span>bez hledání a bez dalšího menu</span></div><span>Šipky · Enter · Esc</span></div><div class="os1332-command-grid">'+commandNav1332.map(([view,label,icon])=>'<button type="button" data-command-nav1332="'+view+'" aria-selected="false"><i>'+icon+'</i><span>'+label+'</span></button>').join('')+'</div>'+commandMemoryHtml741()+'<div class="os1332-command-actions"><button type="button" class="primary" data-command-add1332>＋ Přidat podle aktuální sekce</button><span>Piš pro hledání napříč daty nebo příkaz, např. „co dnes hoří“.</span></div></div>';
 commandHomeIndex1333=Math.max(0,commandNav1332.findIndex(([view])=>view===current));
 paintCommandHome1333();
 return true;
}
function renderCommandSafe(value,seq){
 if(!String(value||'').trim()){showCommandHome1332();return Promise.resolve(true)}
 return renderCommandResults41(value).then(()=>{if(seq!==commandSeq){const next=++commandSeq;const latest=input.value;if(!String(latest||'').trim()){showCommandHome1332();return next}return renderCommandResults41(latest).catch(error=>warnAction('command-refresh',error)).then(()=>next)}}).catch(error=>warnAction('command-results',error))
}
function runCommand(value){const v=String(value||'').trim();if(!v){showCommandHome1332();return}recordCommand741(v);commandSeq++;return executeCommand41(v).then(()=>hideCommand1332()).catch(error=>warnAction('command-execute',error))}
input.onfocus=()=>{if(!input.value.trim())showCommandHome1332()};
input.oninput=()=>{cancelCommandTimer();const seq=++commandSeq,value=input.value;schedule1100(OWNER,'command-debounce',()=>void renderCommandSafe(value,seq),70)};
input.onkeydown=e=>{
 const homeVisible=!!commandBox?.querySelector('[data-command-home1332]')&&!input.value.trim();
 if(homeVisible&&['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(e.key)){
  e.preventDefault();
  if(e.key==='ArrowRight')moveCommandHome1333(1);
  if(e.key==='ArrowLeft')moveCommandHome1333(-1);
  if(e.key==='ArrowDown')moveCommandHome1333(5);
  if(e.key==='ArrowUp')moveCommandHome1333(-5);
  if(e.key==='Home'){commandHomeIndex1333=0;paintCommandHome1333()}
  if(e.key==='End'){commandHomeIndex1333=commandNav1332.length-1;paintCommandHome1333()}
  return;
 }
 if(e.key==='ArrowUp'&&!homeVisible){const hist=readCommandList741(COMMAND_HISTORY_KEY741);if(hist.length){e.preventDefault();commandHistoryIndex741=Math.min(hist.length-1,commandHistoryIndex741+1);input.value=hist[commandHistoryIndex741]||'';input.setSelectionRange(input.value.length,input.value.length);return}}
 if(e.key==='ArrowDown'&&!homeVisible&&commandHistoryIndex741>=0){const hist=readCommandList741(COMMAND_HISTORY_KEY741);e.preventDefault();commandHistoryIndex741=Math.max(-1,commandHistoryIndex741-1);input.value=commandHistoryIndex741<0?'':hist[commandHistoryIndex741]||'';return}
 if(e.key==='Enter'){e.preventDefault();cancelCommandTimer();if(homeVisible&&openCommandHomeSelection1333())return;const v=input.value;input.value='';runCommand(v)}
 if(e.key==='Escape'){cancelCommandTimer();input.value='';commandSeq++;hideCommand1332();input.blur()}
};
qs('#commandGo').onclick=()=>{cancelCommandTimer();const v=input.value;input.value='';runCommand(v)};
if(commandBox){
 ownEvent1100(OWNER,commandBox,'pointerover',e=>{const nav=e.target.closest('[data-command-nav1332]');if(!nav)return;const buttons=commandHomeButtons1333(),i=buttons.indexOf(nav);if(i>=0){commandHomeIndex1333=i;paintCommandHome1333()}},{passive:true});
 ownEvent1100(OWNER,commandBox,'click',e=>{const pin=e.target.closest('[data-command-pin741]');if(pin){toggleFavorite741(pin.dataset.commandPin741);showCommandHome1332();return}const run=e.target.closest('[data-command-run741]');if(run){input.value='';runCommand(run.dataset.commandRun741);input.blur();return}const nav=e.target.closest('[data-command-nav1332]');if(nav){hideCommand1332();input.blur();navigate(nav.dataset.commandNav1332);return}if(e.target.closest('[data-command-add1332]')){hideCommand1332();input.blur();openCapture().catch(error=>warnAction('command-home-add',error))}});
}
ownEvent1100(OWNER,document,'keydown',e=>{
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.focus();input.select();if(!input.value.trim())showCommandHome1332();import('./command.js').catch(()=>{})}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='n'){e.preventDefault();openCapture().catch(error=>warnAction('shortcut-add',error))}
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();if(!store.undo())toast('Není co vrátit')}
});
ownEvent1100(OWNER,document,'click',e=>{if(!e.target.closest('.os2-command'))hideCommand1332()});

const stopSyncStatus=onSyncStatus((s,detail)=>{const el=qs('#syncStatus');if(!el)return;el.className='sync '+(s==='ok'?'ok':s);el.innerHTML=`<i></i> ${s==='ok'?'Cloud • Uloženo':s==='saving'?'Cloud • Ukládám…':s==='offline'?'Offline – uložím později':s==='conflict'?'Konflikt dat':'Cloud'}`;el.onclick=null;el.onkeydown=null;el.removeAttribute('role');el.removeAttribute('tabindex');el.style.cursor='default';if(detail)el.title=detail});
ownCleanup1100(OWNER,stopSyncStatus);
function setCloudConnectedStatus(sess,result={}){const el=qs('#syncStatus');if(!el||!sess)return;const x=authConnectedLabel32({email:sess.user?.email,lastCloudAt:result.updatedAt||store.meta().lastCloudAt});el.className='sync ok';el.innerHTML=`<i></i> ${x.short}`;el.title=x.detail}
function setCloudLoadingStatus(){const el=qs('#syncStatus');if(!el)return;el.className='sync saving';el.innerHTML='<i></i> Cloud • Načítám data…';el.title='Lokální obrazovka už funguje; cloud se synchronizuje na pozadí.'}
function openCloudConnect(){showLoginView('Připoj existující cloudový profil. Heslo není nutné — stačí e-mailový přihlašovací odkaz.')}
function localSyncStatus(){const el=qs('#syncStatus');if(!el)return;el.className='sync local';el.innerHTML='<i></i> Lokálně • uloženo';el.title='Aktuální stav je uložený v tomto zařízení. Klikni pro volitelné připojení cloudu.';el.setAttribute('role','button');el.tabIndex=0;el.style.cursor='pointer';el.onclick=openCloudConnect;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCloudConnect()}}}
function authCooldownRender(){cancelScheduled1100(OWNER,'auth-cooldown');const magic=qs('#magicLinkBtn'),reset=qs('#forgotPasswordBtn'),m=store.meta(),magicLeft=authCooldownSeconds32(m.lastMagicLinkAt),resetLeft=authCooldownSeconds32(m.lastPasswordResetAt);if(magic){magic.disabled=magicLeft>0;magic.textContent=magicLeft>0?`Další odkaz za ${magicLeft} s`:'Poslat přihlašovací odkaz bez hesla'}if(reset){reset.disabled=resetLeft>0;reset.textContent=resetLeft>0?`Reset znovu za ${resetLeft} s`:'Obnovit cloudové heslo'}if(magicLeft||resetLeft)schedule1100(OWNER,'auth-cooldown',authCooldownRender,1000,{pauseWhenHidden:true})}
function showResetView(){qs('#authView').classList.add('hidden');qs('#appView').classList.add('hidden');qs('#resetView').classList.remove('hidden');schedule1100(OWNER,'focus-reset',()=>qs('#resetPassword1')?.focus(),30)}
function showLoginView(message=''){qs('#resetView').classList.add('hidden');qs('#appView').classList.add('hidden');qs('#authView').classList.remove('hidden');const email=qs('#loginEmail'),last=store.meta().lastCloudEmail;if(email&&!email.value&&last)email.value=last;if(message)qs('#authMessage').textContent=message;authCooldownRender();schedule1100(OWNER,'focus-login',()=>email?.focus(),30)}
function showApp(){cancelScheduled1100(OWNER,'auth-cooldown');qs('#authView').classList.add('hidden');qs('#resetView').classList.add('hidden');qs('#appView').classList.remove('hidden')}
function schedulePreflight(){scheduleIdle1110('app-preflight',async()=>{try{const pf=await runPreflight41();store.get().meta.preflight=pf;store.persist()}catch(error){recordDiagnostic('preflight',error);console.warn('[app41:preflight]',error)}},3000)}

async function handleSession(sess){
 const seq=++sessionSeq;
 if(recoveryMode){showResetView();return}showApp();const email=qs('#userEmail'),logoutBtn=qs('#logoutBtn');if(email)email.textContent=sess?.user?.email||'Toto zařízení';if(logoutBtn)logoutBtn.classList.toggle('hidden',!sess);
 store.get().meta.cloudMode=sess?'cloud':'local';scheduleRender(true);
 if(sess){
  setCloudLoadingStatus();store.setMeta({lastCloudEmail:sess.user?.email||store.meta().lastCloudEmail||null});const result=await loadCloud();if(seq!==sessionSeq)return;
  if(result?.futureSchema){await modal('Cloudová data jsou z novější verze',`<p class="muted">Cloud používá schema <b>${result.remoteSchema}</b>, tato aplikace umí <b>${result.currentSchema}</b>. Nic jsem nepřepsal. Otevři nejnovější Kamil OS na stabilní adrese.</p>`,[{label:'Rozumím',value:'ok',primary:true}]);if(seq!==sessionSeq)return;localSyncStatus();return}
  if(result?.conflict){const diff=conflictSummary(store.get(),result.cloud),rows=diff.map(x=>`<div class="row"><span>${x.label}</span><span>toto zařízení <b>${x.local}</b> · cloud <b>${x.cloud}</b></span></div>`).join('');const choice=await modal('Cloud a zařízení mají různé osobní změny',`<p class="muted">Nic nepřepisuju automaticky. Osobní data porovnám po hlavních skupinách:</p>${rows}<p class="muted">Pokud si nejsi jistý, zvol toto zařízení a potom udělej export zálohy.</p>`,[{label:'Použít cloud',value:'cloud'},{label:'Použít toto zařízení',value:'local',primary:true}]);if(seq!==sessionSeq)return;if(choice)await resolveConflict(choice,result.cloud,result.updatedAt)}
  if(seq!==sessionSeq)return;await flushQueue();if(seq!==sessionSeq)return;setCloudConnectedStatus(sess,result);scheduleRender(true);
  loadDataHubs().then(()=>{if(seq!==sessionSeq)return;setCloudConnectedStatus(sess,result);scheduleRender(true);markPerf41('cloud-hubs-ready')}).catch(error=>console.warn('[app41:cloud-hubs]',error));
 }else localSyncStatus();
 schedulePreflight();markPerf41(sess?'cloud-session-ready':'local-ready');
}
async function startAuthWatch(){stopAuthWatch();stopAuthWatch=await watchAuth((ev,sess)=>{if(ev==='PASSWORD_RECOVERY'){recoveryMode=true;schedule1100(OWNER,'auth-recovery-view',showResetView,0);return}if(!recoveryMode)schedule1100(OWNER,'auth-session-handoff',()=>{handleSession(sess).catch(error=>console.warn('[app41:auth-watch]',error))},0)})}
ownCleanup1100(OWNER,()=>stopAuthWatch());

qs('#magicLinkBtn').onclick=async()=>{const email=qs('#loginEmail').value.trim(),msg=qs('#authMessage'),left=authCooldownSeconds32(store.meta().lastMagicLinkAt);if(left){msg.textContent=`Už jsem odkaz poslal. Použij nejnovější e-mail nebo počkej ${left} s.`;authCooldownRender();return}if(!email){msg.textContent='Nejdřív napiš e-mail cloudového účtu.';qs('#loginEmail').focus();return}store.setMeta({lastCloudEmail:email});msg.textContent='Posílám přihlašovací odkaz…';qs('#magicLinkBtn').disabled=true;try{const {error}=await sendMagicLink(email);if(error){if(error.status===429||String(error.message||'').toLowerCase().includes('rate limit'))store.setMeta({lastMagicLinkAt:new Date().toISOString()});msg.textContent=authErrorMessage32(error)}else{store.setMeta({lastMagicLinkAt:new Date().toISOString()});msg.textContent='Hotovo. Otevři vždy nejnovější e-mail. Odkaz tě vrátí na stabilní Kamil OS a načte cloudová data.'}}catch(error){msg.textContent=authErrorMessage32(error)}authCooldownRender()};
qs('#loginBtn').onclick=async()=>{const email=qs('#loginEmail').value.trim(),password=qs('#loginPassword').value,msg=qs('#authMessage');if(!email||!password){msg.textContent='Pro přihlášení heslem vyplň e-mail i heslo. Nebo použij přihlašovací odkaz bez hesla.';return}store.setMeta({lastCloudEmail:email});msg.textContent='Připojuji cloud…';try{const {data,error}=await login(email,password);if(error){msg.textContent=authErrorMessage32(error);return}msg.textContent='';await handleSession(data?.session||await session());await startAuthWatch()}catch(error){msg.textContent=authErrorMessage32(error)}};
qs('#loginPassword').onkeydown=e=>{if(e.key==='Enter')qs('#loginBtn').click()};
const skipLogin=qs('#skipLoginBtn');if(skipLogin)ownEvent1100(OWNER,skipLogin,'click',async()=>{recoveryMode=false;await handleSession(await session())});
qs('#forgotPasswordBtn').onclick=async()=>{const email=qs('#loginEmail').value.trim(),msg=qs('#authMessage'),left=authCooldownSeconds32(store.meta().lastPasswordResetAt);if(left){msg.textContent=`Reset už byl odeslaný. Použij nejnovější e-mail nebo počkej ${left} s.`;authCooldownRender();return}if(!email){msg.textContent='Nejdřív napiš e-mail, na který mám poslat reset.';qs('#loginEmail').focus();return}store.setMeta({lastCloudEmail:email});msg.textContent='Posílám resetovací odkaz…';qs('#forgotPasswordBtn').disabled=true;try{const {error}=await sendPasswordReset(email);if(error){if(error.status===429||String(error.message||'').toLowerCase().includes('rate limit'))store.setMeta({lastPasswordResetAt:new Date().toISOString()});msg.textContent=authErrorMessage32(error)}else{store.setMeta({lastPasswordResetAt:new Date().toISOString()});msg.textContent='Hotovo. Otevři nejnovější resetovací e-mail; vrátí se na stabilní Kamil OS adresu.'}}catch(error){msg.textContent=authErrorMessage32(error)}authCooldownRender()};
qs('#setPasswordBtn').onclick=async()=>{const p1=qs('#resetPassword1').value,p2=qs('#resetPassword2').value,msg=qs('#resetMessage');if(p1.length<8){msg.textContent='Heslo musí mít alespoň 8 znaků.';return}if(p1!==p2){msg.textContent='Hesla se neshodují.';return}msg.textContent='Ukládám nové heslo…';const {error}=await updatePassword(p1);if(error){msg.textContent=authErrorMessage32(error);return}msg.textContent='Cloudové heslo změněno.';recoveryMode=false;history.replaceState({},document.title,location.pathname+location.search.replace(/([?&])type=recovery(&|$)/,'$1').replace(/[?&]$/,''));await handleSession(await session());await startAuthWatch()};
qs('#resetPassword2').onkeydown=e=>{if(e.key==='Enter')qs('#setPasswordBtn').click()};

// Rychlý start: lokální data vykreslíme dřív, než čekáme na SDK/cloud session.
showApp();localSyncStatus();const initialView=viewFromUrl();if(initialView!=='today')navigate(initialView,{syncUrl:false});else{quickShell('today');scheduleRender(true)}warmRuntime41();markPerf41('shell-visible');
const hashParams=new URLSearchParams(location.hash.replace(/^#/,''));
if(hashParams.get('error')){recoveryMode=false;history.replaceState({},document.title,location.pathname+location.search);toast(hashParams.get('error_code')==='otp_expired'?'Přihlašovací/resetovací odkaz vypršel. Pošli si nový a otevři vždy nejnovější e-mail.':'Cloudové přihlášení se nepodařilo. Kamil OS běží lokálně.');await handleSession(await session())}else if(recoveryMode){await session();showResetView();await startAuthWatch()}else{const sess=await session();if(sess){await handleSession(sess);await importPrivateSnapshotIfPresent();await startAuthWatch()}else{store.get().meta.cloudMode='local';await importPrivateSnapshotIfPresent();schedulePreflight();markPerf41('session-check-complete')}}

if('serviceWorker'in navigator){try{const reg=await (window.__KAMIL_SW_PROMISE__||(window.__KAMIL_SW_PROMISE__=navigator.serviceWorker.register('./sw.js')));if(reg){ownEvent1100(OWNER,reg,'updatefound',()=>{const w=reg.installing;if(!w)return;ownEvent1100(OWNER,w,'statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)qs('#updateBanner').classList.remove('hidden')})});qs('#reloadAppBtn').onclick=()=>location.reload()}}catch(error){console.warn('[app41:service-worker]',error)}}
ownEvent1100(OWNER,window,'beforeunload',()=>{if(store.dirty){store.queueSync(store.get());store.setMeta({pendingAt:new Date().toISOString()})}});
ownEvent1100(OWNER,window,'beforeinstallprompt',e=>{e.preventDefault();window.__installPrompt=e});
