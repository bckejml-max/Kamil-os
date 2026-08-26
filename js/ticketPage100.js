import {renderTicketPage687} from './ticketPage687.js';
import {appendTicketIntelligence100} from './marketIntelligence100.js';
import {appendTicketDetails100} from './marketDetails100.js';
let observer=null,pending=false;
function enhance(){if(pending)return;pending=true;queueMicrotask(async()=>{pending=false;try{await appendTicketIntelligence100();await appendTicketDetails100()}catch(e){console.warn('[tickets100]',e)}})}
function arm(){const host=document.querySelector('#ticketIntelView');if(!host)return;observer?.disconnect();observer=new MutationObserver(enhance);observer.observe(host,{childList:true,subtree:false});setTimeout(enhance,80);setTimeout(enhance,600)}
export function renderTicketPage100(){renderTicketPage687();arm()}
