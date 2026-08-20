import './smartSyncUi31.js';
import './remoteInboxUi31.js';
import {dataEngineStatus31,runDataMirror31} from './dataEngine31.js';
import {cloudHistoryStatus32} from './cloudHistory32.js';
import {qs,h,date} from './utils.js';
const id='dataEngine31Host';let seq=0;
const bucketLabel=k=>({decision:'Decision Journal',networth:'Net Worth',ticket:'Ticket historie',trade:'Trade Journal',import:'Import historie'}[k]||k);
const shell=()=>`<div class="card"><div class="card-head"><div><div class="eyebrow">CORE V2 / DATA ENGINE V3 32.1</div><h2>History Data Engine</h2><p class="muted">Dlouhá historie se zrcadlí do IndexedDB a při připojeném cloudu také do samostatných cloudových entit.</p></div><span class="status warn">NAČÍTÁM</span></div><div class="decision-note">Primární state se zatím nezkracuje. 32.1 je bezpečný dual-write před budoucím cutoverem.</div></div>`;
async function render(){
 const n=++seq,view=qs('#moreView');if(!view)return;const isSystem=[...view.querySelectorAll('h1')].some(x=>String(x.textContent||'').includes('Kamil OS'));let host=qs(`#${id}`,view);if(!isSystem){host?.remove();return}
 if(!host){host=document.createElement('div');host.id=id;const health=qs('#systemHealth31Host',view),target=health||view.querySelector('.view-head');if(target)target.insertAdjacentElement('afterend',host);else view.prepend(host)}host.innerHTML=shell();
 const s=await dataEngineStatus31();if(n!==seq||!host.isConnected)return;const c=s.cloudHistory||cloudHistoryStatus32();
 const rows=Object.entries(s.byBucket||{}).map(([k,v])=>`<div class="row"><span>${h(bucketLabel(k))}</span><b>${Number(v||0).toLocaleString('cs-CZ')}</b></div>`).join('');
 const cloudStatus=c.ok?'CLOUD READY':c.reason==='LOCAL_ONLY'||c.reason==='NO_SESSION'?'LOCAL ONLY':c.reason==='OFFLINE'?'OFFLINE':c.error?'POZOR':'DUAL WRITE';
 host.innerHTML=`<div class="card"><div class="card-head"><div><div class="eyebrow">CORE V2 / DATA ENGINE V3 32.1</div><h2>History Data Engine</h2><p class="muted">IndexedDB zůstává lokální archiv; připojený cloud dostává stejné historické záznamy jako samostatné entity.</p></div><span class="status ${s.ready?'good':s.supported?'warn':'bad'}">${s.ready?'READY':s.supported?'POZOR':'NEDOSTUPNÉ'}</span></div><div class="metric-strip"><div class="metric"><span>Lokální historie</span><b>${Number(s.total||0).toLocaleString('cs-CZ')}</b></div><div class="metric"><span>Cloud historie</span><b>${Number(c.cloudCount||c.lastCloudCount||0).toLocaleString('cs-CZ')}</b></div><div class="metric"><span>Cloud režim</span><b>${h(cloudStatus)}</b></div></div>${rows||'<div class="empty">Zatím není historický záznam k zrcadlení.</div>'}<div class="decision-note">${s.lastMirrorAt?`Lokální mirror ${h(date(s.lastMirrorAt))}. `:''}${c.lastSyncAt?`Cloud sync ${h(date(c.lastSyncAt))}. `:''}32.1 je DUAL WRITE: z hlavního state se nic nemaže a cloudová historie nemá klientské DELETE oprávnění.${s.error?` Chyba IndexedDB: ${h(s.error)}.`:''}${c.error?` Chyba cloudu: ${h(c.error)}.`:''}</div><button class="btn" data-data-engine-sync>Zrcadlit a synchronizovat teď</button></div>`;
 host.querySelector('[data-data-engine-sync]')?.addEventListener('click',async e=>{e.currentTarget.disabled=true;await runDataMirror31();render()});
}
function start(){const view=qs('#moreView');if(!view)return;new MutationObserver(()=>queueMicrotask(render)).observe(view,{childList:true,subtree:false});window.addEventListener('kamil:navigate',()=>queueMicrotask(render));window.addEventListener('kamil:data-engine',()=>queueMicrotask(render));render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
