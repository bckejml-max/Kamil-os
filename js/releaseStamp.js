import {APP_VERSION,APP_RELEASE} from './releaseMeta.js';

function stamp(){
 document.title=`Kamil OS ${APP_RELEASE}`;
 document.querySelectorAll('.version').forEach(el=>{if(el.textContent!==APP_VERSION)el.textContent=APP_VERSION});
 document.querySelectorAll('#todayView .eyebrow').forEach(el=>{
  const text=el.textContent||'';
  if(/^KAMIL OS \S+ \/ OSOBNÍ AUTOPILOT/.test(text)){
   const next=`KAMIL OS ${APP_VERSION} / OSOBNÍ AUTOPILOT`;
   if(text!==next)el.textContent=next;
  }
 });
}
const start=()=>{stamp();new MutationObserver(()=>queueMicrotask(stamp)).observe(document.body,{childList:true,subtree:true})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
