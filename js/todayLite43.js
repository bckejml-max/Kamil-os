import {APP_VERSION} from './releaseMeta.js';
import {store} from './state.js';
import {h,qs} from './utils.js';

let fullModule=null,fullPromise=null,hydrateTimer=null,seq=0;
const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED']);
const open=x=>!CLOSED.has(String(x?.status||x?.workflow||'').toUpperCase());
const activeTicket=x=>['HOLD','LISTED'].includes(String(x?.workflow||'HOLD').toUpperCase());
const dateMs=v=>{const t=new Date(v||0).getTime();return Number.isFinite(t)?t:null};
const fmt=v=>{const t=dateMs(v);return t===null?'—':new Date(t).toLocaleDateString('cs-CZ',{day:'numeric',month:'short'})};

function nextTask(s={}){
 const rows=(s.tasks||[]).filter(open).map(x=>({title:x.title||x.name||'Úkol',due:x.due||x.dueAt||x.date||null,priority:Number(x.priority||0)}));
 return rows.sort((a,b)=>{const ad=dateMs(a.due),bd=dateMs(b.due);if(ad!==null&&bd!==null)return ad-bd;if(ad!==null)return-1;if(bd!==null)return 1;return b.priority-a.priority})[0]||null;
}
function metrics(s={}){
 const waiting=[...(s.directorBook?.waiting||[]),...(s.delegations||[])].filter(open),inbox=(s.inbox||[]).filter(open),tasks=(s.tasks||[]).filter(open),tickets=(s.ticketBook?.items||[]).filter(activeTicket);
 return {tasks:tasks.length,waiting:waiting.length,inbox:inbox.length,tickets:tickets.length,next:nextTask(s)};
}
function scheduleFull(token,delay=700){
 clearTimeout(hydrateTimer);
 const run=()=>hydrateFull(token);
 if('requestIdleCallback'in window){requestIdleCallback(run,{timeout:Math.max(1000,delay+700)});return}
 hydrateTimer=setTimeout(run,delay);
}
async function hydrateFull(token){
 const host=qs('#todayView');if(!host||host.dataset.todayLite43!==token)return false;
 try{
  if(!fullModule){fullPromise=fullPromise||import('./today29.js');fullModule=await fullPromise}
  const current=qs('#todayView');if(!current||current.dataset.todayLite43!==token)return false;
  fullModule.renderToday?.();current.removeAttribute('data-today-lite43');
  window.dispatchEvent(new CustomEvent('kamil:today-full-ready'));
  return true;
 }catch(error){console.error('[todayLite43]',error);return false}
}

export function renderTodayLite43(){
 if(fullModule){fullModule.renderToday?.();return}
 const host=qs('#todayView');if(!host)return;
 const token=String(++seq),m=metrics(store.get());host.dataset.todayLite43=token;
 const next=m.next?`<div class="card"><div class="card-head"><div><div class="eyebrow">NEJBLIŽŠÍ ÚKOL</div><h2>${h(m.next.title)}</h2></div><b>${h(fmt(m.next.due))}</b></div><p class="muted">Plný prioritizační engine se dopočítá na pozadí.</p></div>`:'';
 host.innerHTML=`<div class="view-head"><div><div class="eyebrow">KAMIL OS ${APP_VERSION} / FAST TODAY</div><h1>Jsi uvnitř. Detail se dopočítává.</h1><p>Základní lokální stav je interaktivní hned; těžký Today Brain se načte až po prvním vykreslení.</p></div><button class="btn" data-today43-full>Načíst detail teď</button></div><div class="metric-strip"><div class="metric"><span>Otevřené úkoly</span><b>${m.tasks}</b></div><div class="metric"><span>Waiting For</span><b>${m.waiting}</b></div><div class="metric"><span>Inbox</span><b>${m.inbox}</b></div><div class="metric"><span>Aktivní vstupenky</span><b>${m.tickets}</b></div></div>${next}<div class="decision-note">Kompletní doporučení, portfolio, ticket brain a osobní autopilot zůstávají zachované. Jen už neblokují první obrazovku.</div>`;
 qs('[data-today43-full]',host)?.addEventListener('click',()=>hydrateFull(token),{once:true});
 scheduleFull(token,700);
}

export function warmFullToday43(){if(fullModule)return Promise.resolve(fullModule);fullPromise=fullPromise||import('./today29.js');return fullPromise.then(m=>fullModule=m).catch(()=>null)}
