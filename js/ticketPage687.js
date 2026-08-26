import {renderTicketPage665} from './ticketPage665.js';
import {enhanceTicketPriority87} from './ticketPriority87.js';

let observer=null;
function arm(){const host=document.querySelector('#ticketIntelView');if(!host)return;observer?.disconnect();observer=new MutationObserver(()=>{queueMicrotask(()=>enhanceTicketPriority87().catch(()=>{}))});observer.observe(host,{childList:true,subtree:false});setTimeout(()=>enhanceTicketPriority87().catch(()=>{}),80);setTimeout(()=>enhanceTicketPriority87().catch(()=>{}),500)}
export function renderTicketPage687(){renderTicketPage665();arm()}
