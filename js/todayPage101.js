import {renderPersonalToday640} from './personalToday640.js';
import {appendMarketAction101} from './marketAction101.js';
let observer=null,pending=false;
function enhance(){if(pending)return;pending=true;queueMicrotask(async()=>{pending=false;try{await appendMarketAction101()}catch(e){console.warn('[market101]',e)}})}
function arm(){const host=document.querySelector('#todayView');if(!host)return;observer?.disconnect();observer=new MutationObserver(enhance);observer.observe(host,{childList:true,subtree:false});setTimeout(enhance,80);setTimeout(enhance,600)}
export function renderTodayPage101(){renderPersonalToday640();arm()}
