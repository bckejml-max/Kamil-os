import {store} from './state.js';
import {liveBrainSummary32} from './liveBrain32.js';
import {qs,h} from './utils.js';
const id='liveBrain32Host';let queued=false;
const tone=s=>s==='TRUSTED'?'good':s==='WARN'?'warn':'info';
const label=s=>({TRUSTED:'OVĚŘENO',WARN:'BLOKOVÁNO',IDLE:'BEZ LIVE DAT'}[s]||s);
const row=(name,value,detail='')=>`<div class="row"><span>${h(name)}${detail?`<small class="muted" style="display:block">${h(detail)}</small>`:''}</span><b>${Number(value||0).toLocaleString('cs-CZ')}</b></div>`;
function render(){
 const view=qs('#moreView');if(!view)return;const isSystem=[...view.querySelectorAll('h1')].some(x=>String(x.textContent||'').includes('Kamil OS'));let host=qs(`#${id}`,view);if(!isSystem){host?.remove();return}
 const s=liveBrainSummary32(store.get(),new Date());if(!host){host=document.createElement('div');host.id=id;const health=qs('#systemHealth31Host',view),target=health||view.querySelector('.view-head');if(target)target.insertAdjacentElement('afterend',host);else view.prepend(host)}
 host.innerHTML=`<div class="card"><div class="card-head"><div><div class="eyebrow">CORE V2 / LIVE BRAIN 32.3</div><h2>Source Trust</h2><p class="muted">Live signál smí změnit XTB nebo ticket rozhodnutí jen když má čerstvý čas, validní webový zdroj a confidence.</p></div><span class="status ${tone(s.status)}">${label(s.status)}</span></div><div class="metric-strip"><div class="metric"><span>Ověřené live</span><b>${s.trusted}</b></div><div class="metric"><span>Blokované live</span><b>${s.blocked}</b></div><div class="metric"><span>Celkem kandidátů</span><b>${s.total}</b></div></div>${row('XTB',s.xtb.trusted,`${s.xtb.total} kandidátů · ${s.xtb.blocked} blokováno`)}${row('Vstupenky',s.tickets.trusted,`${s.tickets.total} kandidátů · ${s.tickets.blocked} blokováno`)}${row('Bez validního zdroje',s.xtb.unsourced+s.tickets.unsourced)}${row('Zastaralé',s.xtb.stale+s.tickets.stale)}${row('Bez confidence',s.xtb.noConfidence+s.tickets.noConfidence)}${row('Neplatný / budoucí čas',s.xtb.invalidAsOf+s.tickets.invalidAsOf)}<div class="decision-note">SOURCE BACKED ONLY: bez validního zdroje se live kandidát nesmí vydávat za živé doporučení ani přepsat pravidlové AUTO rozhodnutí. 32.3 pouze ověřuje již dodané live signály; sama žádné tržní zprávy nevymýšlí ani neprovádí obchody.</div></div>`;
}
function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;render()})}
function start(){const view=qs('#moreView');if(!view)return;new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n?.id!==id)))schedule()}).observe(view,{childList:true,subtree:false});window.addEventListener('kamil:navigate',e=>{if(e.detail==='more')schedule()});store.subscribe(schedule);render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
