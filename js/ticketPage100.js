import {renderTicketPage687} from './ticketPage687.js';
import {appendTicketIntelligence100} from './marketIntelligence100.js';
import {appendTicketDetails100} from './marketDetails100.js';
import {applyTicketPriceFix102} from './ticketPriceFix102.js';
let observer=null,pending=false;
function enhance(){if(pending)return;pending=true;queueMicrotask(async()=>{pending=false;try{await appendTicketIntelligence100();await appendTicketDetails100();await applyTicketPriceFix102()}catch(e){console.warn('[tickets102]',e)}})}
function arm(){const host=document.querySelector('#ticketIntelView');if(!host)return;observer?.disconnect();observer=new MutationObserver(enhance);observer.observe(host,{childList:true,subtree:false});setTimeout(enhance,80);setTimeout(enhance,600);setTimeout(enhance,1400)}
export function renderTicketPage100(){renderTicketPage687();arm()}
