import {APP_VERSION} from './releaseMeta.js';

const SNAPSHOT_KEY='kamil-os-fast-snapshot-66-0';
const root=document.documentElement;
const WORK_RE=/zak[aá]zk|faktur|dodavat|pks|cpi|zbrojov|pracovn|xtb|ticket|vstupenk/i;
const BOOT343={version:343,startedAt:performance.now(),modules:[],failures:[],complete:false,totalMs:0,slowest:[],healthy:true,at:Date.now()};
const DEFER345={version:345,started:false,complete:false,modules:[],failures:[],healthy:true,at:Date.now()};
window.__KAMIL_BOOT_BUDGET343__=BOOT343;
window.__KAMIL_DEFERRED345__=DEFER345;

const parse=(raw,fallback=null)=>{try{return JSON.parse(raw)}catch{return fallback}};
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.category||''}`);

function ensureOS111(){if(document.querySelector('link[data-os111]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./os111.css';l.dataset.os111='1';document.head.appendChild(l)}
function applyTheme(){ensureOS111();try{root.classList.remove('theme-light');root.classList.add('theme-dark');root.dataset.theme='dark';root.style.colorScheme='dark'}catch{}document.title='Kamil OS';document.querySelectorAll('.version').forEach(x=>x.classList.add('hidden'))}
function fallbackHtml(){const s=parse(localStorage.getItem('kamil-os-state')||'null',{})||{},tasks=(s.tasks||[]).filter(personal).filter(x=>!['DONE','CLOSED','ARCHIVED'].includes(String(x.status||'').toUpperCase())).length,admin=(s.personalAdmin?.items||[]).filter(x=>!['DONE','CLOSED','ARCHIVED'].includes(String(x.status||'').toUpperCase())).length;return `<div class="ux64-page ux65-today"><section class="ux64-hero ux65-hero"><div class="eyebrow">DNES</div><h1>Načítám osobní přehled…</h1><p>Nejdřív ukážu jen to, co má smysl řešit.</p></section><div class="metric-strip"><div class="metric"><span>Osobní úkoly</span><b>${tasks}</b></div><div class="metric"><span>Administrativa</span><b>${admin}</b></div></div></div>`}
function paintInstant(){const host=document.querySelector('#todayView');if(!host)return;let html='';try{const snap=parse(localStorage.getItem(SNAPSHOT_KEY)||'null');if(snap?.version===APP_VERSION&&snap?.html&&Date.now()-Number(snap.at||0)<2*86400000)html=snap.html}catch{}host.innerHTML=html||fallbackHtml();window.__KAMIL_SNAPSHOT_HIT__=!!html}
function saveSnapshot(){const host=document.querySelector('#todayView');if(!host)return;const html=[...host.children].slice(0,5).map(x=>x.outerHTML).join('');if(html.length>300&&html.length<160000)try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify({version:APP_VERSION,html,at:Date.now()}))}catch{}}
function registerSw(){if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{})}
function publishBoot343(){BOOT343.totalMs=Math.round(performance.now()-BOOT343.startedAt);BOOT343.slowest=[...BOOT343.modules].sort((a,b)=>b.ms-a.ms).slice(0,8);BOOT343.healthy=BOOT343.failures.length===0;BOOT343.at=Date.now();window.__KAMIL_BOOT_BUDGET343__=BOOT343}
function publishDeferred345(){DEFER345.healthy=DEFER345.failures.length===0;DEFER345.at=Date.now();window.__KAMIL_DEFERRED345__=DEFER345}
function noteBootError(scope,error){console.error(`[instantShell66:${scope}]`,error);window.__KAMIL_BOOT_ERRORS__=window.__KAMIL_BOOT_ERRORS__||[];window.__KAMIL_BOOT_ERRORS__.push({scope,message:String(error?.message||error),at:Date.now()});BOOT343.failures.push({scope,message:String(error?.message||error)});publishBoot343()}
async function optionalImport(path,fn){const start=performance.now();let ok=false;try{const m=await import(path);if(typeof m?.[fn]==='function')m[fn]();ok=true;return true}catch(error){noteBootError(path,error);return false}finally{BOOT343.modules.push({path,fn,ms:Math.max(0,Math.round((performance.now()-start)*10)/10),ok});publishBoot343()}}
async function deferredImport(path,fn){const start=performance.now();let ok=false;try{const m=await import(path);if(typeof m?.[fn]==='function')m[fn]();ok=true;return true}catch(error){console.warn(`[instantShell66:deferred:${path}]`,error);DEFER345.failures.push({scope:path,message:String(error?.message||error)});return false}finally{DEFER345.modules.push({path,fn,ms:Math.max(0,Math.round((performance.now()-start)*10)/10),ok});publishDeferred345()}}

function scheduleDeferred345(){
  const run=async()=>{
    if(DEFER345.started)return;
    DEFER345.started=true;publishDeferred345();
    // The first paint only needs the core command/finance/execution owners.
    // Market decision enrichment is event-driven and safely fills in after interactive boot.
    await deferredImport('./xtbDecision368.js','installXtbDecision368');
    await deferredImport('./ticketDecision369.js','installTicketDecision369');
    await deferredImport('./opportunityScore370.js','installOpportunityScore370');
    await deferredImport('./xtbTargets371.js','installXtbTargets371');
    await deferredImport('./ticketTargets372.js','installTicketTargets372');
    await deferredImport('./positionSizing373.js','installPositionSizing373');
    // OS467 owns the first visible decision surface. These older Today layers
    // remain available for compatibility, but no longer tax interactive boot.
    await deferredImport('./focusRadar334.js','installFocusRadar334');
    await deferredImport('./actionExecution336.js','installActionExecution336');
    await deferredImport('./todayCockpit363.js','installTodayCockpit363');
    await deferredImport('./performance330.js','installPerformance330');
    await deferredImport('./ticketQa332.js','installTicketQa332');
    await deferredImport('./workspaces305.js','installWorkspaces305');
    DEFER345.complete=true;publishDeferred345();
    window.dispatchEvent(new CustomEvent('kamil:deferred345-complete',{detail:{healthy:DEFER345.healthy,modules:DEFER345.modules.length}}));
  };
  if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:1800});else setTimeout(run,900);
}

async function load(){
  let appOk=false;
  const appStart=performance.now();
  try{await import('./app.js');appOk=true}catch(error){noteBootError('app',error);const host=document.querySelector('#todayView');if(host&&!host.querySelector('[data-core-boot-failed]'))host.insertAdjacentHTML('beforeend','<div class="decision-note bad" data-core-boot-failed>Kamil OS se nepodařilo načíst. Lokální data zůstala beze změny. Zkus obnovit stránku.</div>');setTimeout(registerSw,300);BOOT343.modules.unshift({path:'./app.js',fn:'module',ms:Math.max(0,Math.round((performance.now()-appStart)*10)/10),ok:false});BOOT343.complete=true;publishBoot343();return}
  BOOT343.modules.push({path:'./app.js',fn:'module',ms:Math.max(0,Math.round((performance.now()-appStart)*10)/10),ok:true});publishBoot343();
  const critical=[
    ['./navigationOS342.js','installNavigation342'],
    ['./personalShell640.js','bindPersonalShell640'],
    ['./personalHardening650.js','bindPersonalHardening650'],
    ['./appWorkspace211.js','installAppWorkspaces211'],
    ['./compactNavigation212.js','installCompactNavigation212'],
    ['./navigation302.js','installNavigation302'],
    ['./productionChrome228.js','installProductionChrome228'],
    ['./releaseHealth362.js','installReleaseHealth362'],
    ['./todayWake226.js','installTodayWake226'],
    ['./uxFoundation238.js','installUxFoundation238'],
    ['./financeCommand258.js','installFinanceCommand258'],
    ['./ticketCommand268.js','installTicketCommand268'],
    ['./kamilCore312.js','installKamilCore312'],
    ['./intelligence318.js','installIntelligence318'],
    ['./domainOS328.js','installDomainOS328'],
    ['./design304.js','installDesign304'],
    ['./unified307.js','installUnified307'],
    ['./hardening329.js','installHardening329'],
    ['./ticketOnDemand346.js','installTicketOnDemand346'],
    ['./unifiedCommand333.js','installUnifiedCommand333'],
    ['./os333Resilience.js','installOS333Resilience'],
    ['./focusQueue335.js','installFocusQueue335'],
    ['./managerOS341.js','installManagerOS341'],
    ['./executionState364.js','installExecutionState364'],
    ['./urgencyDraft367.js','installUrgencyDraft367'],
    ['./commandCenter467.js','installCommandCenter467'],
    ['./cashflow468.js','installCashflow468']
  ];
  for(const [p,f] of critical)await optionalImport(p,f);
  BOOT343.complete=true;publishBoot343();
  window.dispatchEvent(new CustomEvent('kamil:boot-budget343',{detail:{totalMs:BOOT343.totalMs,healthy:BOOT343.healthy}}));
  scheduleDeferred345();
  if(appOk){document.querySelector('[data-core-boot-failed]')?.remove();setTimeout(saveSnapshot,1100);setTimeout(registerSw,1200)}
}

applyTheme();paintInstant();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveSnapshot()});
window.addEventListener('beforeunload',saveSnapshot);
requestAnimationFrame(()=>requestAnimationFrame(load));
