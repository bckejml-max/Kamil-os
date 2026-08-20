import {store} from './state.js';
import {APP_VERSION} from './releaseMeta.js';
import {SCHEMA_VERSION,LOCAL_KEY,QUEUE_KEY} from './config.js';
import {systemHealth31} from './systemHealth31.js';
import {h,qs} from './utils.js';
const id='systemHealth31Host';
const tone=l=>l==='BAD'?'bad':l==='WARN'?'warn':'good';
const label=l=>({BAD:'PROBLÉM',WARN:'POZOR',INFO:'INFO',OK:'OK'}[l]||l);
const storedBytes=key=>{try{return new TextEncoder().encode(localStorage.getItem(key)||'').length}catch{return 0}};
let queued=false;
function render(){
 const view=qs('#moreView');if(!view)return;const isSystem=[...view.querySelectorAll('h1')].some(x=>String(x.textContent||'').includes('Kamil OS'));let el=qs(`#${id}`,view);
 if(!isSystem){if(el)el.remove();return}
 const s=store.get(),r=systemHealth31(s,store.meta(),{stateBytes:storedBytes(LOCAL_KEY),queueBytes:storedBytes(QUEUE_KEY),pendingSync:!!store.readQueue(),online:navigator.onLine,serviceWorkerSupported:'serviceWorker'in navigator,serviceWorkerControlled:!!navigator.serviceWorker?.controller,schemaVersion:SCHEMA_VERSION,releaseConsistent:true});
 if(!el){el=document.createElement('div');el.id=id;el.className='card';const target=view.querySelector('.view-head');if(target)target.insertAdjacentElement('afterend',el);else view.prepend(el)}
 el.innerHTML=`<div class="card-head"><div><div class="eyebrow">CORE V2 / SYSTEM HEALTH 31</div><h2>Health score ${r.score}/100</h2><p class="muted">Diagnostika běhu Kamil OS ${h(APP_VERSION)}. Nic sama neopravuje ani neposílá.</p></div><span class="status ${tone(r.status)}">${label(r.status)}</span></div>${r.checks.map(x=>`<div class="row"><span>${h(x.label)}<small class="muted" style="display:block">${h(x.detail)}</small></span><b class="${tone(x.level)}">${label(x.level)}</b></div>`).join('')}<div class="decision-note">State ${Math.max(1,Math.round(r.stateBytes/1024)).toLocaleString('cs-CZ')} kB · pending sync ${Math.round(r.queueBytes/1024).toLocaleString('cs-CZ')} kB. Nad ~3 MB už Kamil OS varuje před limity browserového úložiště.</div>`;
}
function scheduleRender(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;render()})}
function start(){const view=qs('#moreView');if(!view)return;new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n?.id!==id)))scheduleRender()}).observe(view,{childList:true,subtree:false});window.addEventListener('kamil:navigate',e=>{if(e.detail==='more')scheduleRender()});window.addEventListener('online',render);window.addEventListener('offline',render);render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
