const STATE346={version:346,installed:false,loading:false,loaded:false,loadMs:0,loads:0,failures:[],healthy:true,at:Date.now()};
let promise=null;
const publish=()=>{STATE346.healthy=STATE346.failures.length===0;STATE346.at=Date.now();window.__KAMIL_TICKET_ON_DEMAND346__={...STATE346,load:loadTicketDesk346}};
const activeTickets=()=>window.__KAMIL_NAVIGATION342__?.current?.()==='tickets'||document.querySelector('#view-tickets')?.classList.contains('on');
function ensureVisualCss361(){if(document.querySelector('link[data-ticket-desk357],link[href="./ticketDesk357.css"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./ticketDesk357.css';l.dataset.ticketDesk357='1';document.head.appendChild(l)}
export async function loadTicketDesk346(){
 if(STATE346.loaded)return true;
 if(promise)return promise;
 STATE346.loading=true;STATE346.loads++;publish();
 const start=performance.now();
 ensureVisualCss361();
 promise=import('./ticketDesk331.js').then(m=>{
  if(typeof m.installTicketDesk331!=='function')throw new Error('installTicketDesk331 missing');
  m.installTicketDesk331();
  STATE346.loaded=true;
  STATE346.loading=false;
  STATE346.loadMs=Math.max(0,Math.round((performance.now()-start)*10)/10);
  publish();
  window.dispatchEvent(new CustomEvent('kamil:ticket-on-demand346',{detail:{loaded:true,loadMs:STATE346.loadMs}}));
  return true;
 }).catch(error=>{
  STATE346.loading=false;
  STATE346.failures.push({message:String(error?.message||error),at:Date.now()});
  publish();
  console.error('[ticketOnDemand346]',error);
  return false;
 }).finally(()=>{promise=null});
 return promise;
}
function onView(detail){if(detail==='tickets')loadTicketDesk346()}
export function installTicketOnDemand346(){
 if(STATE346.installed)return;
 STATE346.installed=true;
 window.addEventListener('kamil:view-change',e=>onView(e.detail));
 publish();
 if(activeTickets())queueMicrotask(loadTicketDesk346);
}
