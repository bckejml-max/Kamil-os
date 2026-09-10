import {APP_VERSION} from './releaseMeta.js';

const SNAPSHOT_KEY='kamil-os-fast-snapshot-66-0';
const root=document.documentElement;
const BOOT343={version:343,architecture:'os2-on-demand',startedAt:performance.now(),modules:[],failures:[],complete:false,totalMs:0,slowest:[],healthy:true,at:Date.now()};
const DEFER345={version:345,architecture:'os2-on-demand',started:false,complete:false,modules:[],failures:[],healthy:true,at:Date.now()};
window.__KAMIL_BOOT_BUDGET343__=BOOT343;
window.__KAMIL_DEFERRED345__=DEFER345;

const parse=(raw,fallback=null)=>{try{return JSON.parse(raw)}catch{return fallback}};
function applyTheme(){try{root.classList.remove('theme-light');root.classList.add('theme-dark');root.dataset.theme='dark';root.dataset.os2='1';root.style.colorScheme='dark'}catch{}document.title='Kamil OS'}
function fallbackHtml(){
 const s=parse(localStorage.getItem('kamil-os-state')||'null',{})||{};
 const closed=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED']);
 const tasks=(s.tasks||[]).filter(x=>!closed.has(String(x?.status||'').toUpperCase())).length;
 const waiting=[...(s.directorBook?.waiting||[]),...(s.delegations||[])].filter(x=>!closed.has(String(x?.status||'').toUpperCase())).length;
 const tickets=(s.ticketBook?.items||[]).filter(x=>['HOLD','LISTED','OPEN'].includes(String(x?.workflow||'HOLD').toUpperCase())).length;
 return `<div class="os2-today"><div class="os2-welcome"><section class="os2-hero"><div><div class="os2-kicker">KAMIL OS 2.0</div><h1>Načítám přehled…</h1><p>Shell je připravený. Data se skládají bez spouštění analytiky na pozadí.</p></div><div class="os2-hero-bottom"><span class="os2-pill good">● rychlý režim</span></div></section></div><div class="os2-kpis"><div class="os2-kpi"><span>Otevřené</span><b>${tasks}</b></div><div class="os2-kpi"><span>Čekám na</span><b>${waiting}</b></div><div class="os2-kpi"><span>Vstupenky</span><b>${tickets}</b></div><div class="os2-kpi"><span>Start</span><b>OS2</b></div></div></div>`
}
function paintInstant(){
 const host=document.querySelector('#todayView');if(!host)return;
 let html='';try{const snap=parse(localStorage.getItem(SNAPSHOT_KEY)||'null');if(snap?.version===APP_VERSION&&snap?.os2===true&&snap?.html&&Date.now()-Number(snap.at||0)<2*86400000)html=snap.html}catch{}
 host.innerHTML=html||fallbackHtml();window.__KAMIL_SNAPSHOT_HIT__=!!html
}
function saveSnapshot(){const host=document.querySelector('#todayView');if(!host||!host.querySelector('[data-os2-today]'))return;const html=host.innerHTML;if(html.length>300&&html.length<120000)try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify({version:APP_VERSION,os2:true,html,at:Date.now()}))}catch{}}
function registerSw(){if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{})}
function publishBoot343(){BOOT343.totalMs=Math.max(0,Math.round((performance.now()-BOOT343.startedAt)*10)/10);BOOT343.slowest=[...BOOT343.modules].sort((a,b)=>b.ms-a.ms).slice(0,5);BOOT343.healthy=BOOT343.failures.length===0;BOOT343.at=Date.now();window.__KAMIL_BOOT_BUDGET343__=BOOT343}
function publishDeferred345(){DEFER345.healthy=DEFER345.failures.length===0;DEFER345.at=Date.now();window.__KAMIL_DEFERRED345__=DEFER345}
function noteBootError(scope,error){const message=String(error?.message||error);console.error(`[os2:${scope}]`,error);window.__KAMIL_BOOT_ERRORS__=window.__KAMIL_BOOT_ERRORS__||[];window.__KAMIL_BOOT_ERRORS__.push({scope,message,at:Date.now()});BOOT343.failures.push({scope,message});publishBoot343()}
function scheduleDeferred345(){
 const run=()=>{if(DEFER345.started)return;DEFER345.started=true;DEFER345.complete=true;DEFER345.mode='on-demand';publishDeferred345();window.dispatchEvent(new CustomEvent('kamil:deferred345-complete',{detail:{healthy:true,modules:0,mode:'on-demand'}}))};
 if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:2500});else setTimeout(run,1200)
}
async function load(){
 const started=performance.now();let ok=false;
 try{await import('./app.js');ok=true}
 catch(error){noteBootError('app',error);const host=document.querySelector('#todayView');if(host)host.insertAdjacentHTML('beforeend','<div class="decision-note bad" data-core-boot-failed>Kamil OS se nepodařilo načíst. Data zůstala beze změny. Obnov stránku.</div>')}
 finally{BOOT343.modules.push({path:'./app.js',fn:'module',ms:Math.max(0,Math.round((performance.now()-started)*10)/10),ok})}
 BOOT343.complete=true;publishBoot343();window.dispatchEvent(new CustomEvent('kamil:boot-budget343',{detail:{totalMs:BOOT343.totalMs,healthy:BOOT343.healthy,architecture:'os2-on-demand'}}));
 scheduleDeferred345();
 if(ok){document.querySelector('[data-core-boot-failed]')?.remove();const idle=fn=>'requestIdleCallback'in window?requestIdleCallback(fn,{timeout:5000}):setTimeout(fn,2500);idle(()=>{saveSnapshot();registerSw()})}
}

applyTheme();paintInstant();
document.onvisibilitychange=()=>{if(document.visibilityState==='hidden')saveSnapshot()};
window.onbeforeunload=saveSnapshot;
requestAnimationFrame(()=>load());
