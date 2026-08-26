import {renderTicketPage687} from './ticketPage687.js';
import {appendTicketIntelligence100} from './marketIntelligence100.js';
import {appendTicketDetails100} from './marketDetails100.js';
import {applyTicketPriceFix102} from './ticketPriceFix102.js';
import {enhanceTicketSector103} from './ticketSector103.js';
import {enhanceTicketRepricing105} from './ticketRepricing105.js';
import {enhanceTicketVisual132} from './ticketVisual132.js';
let observer=null,pending=false;
function ensureVisualStyle(){if(document.querySelector('link[data-ticketvisual132]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./ticketVisual132.css';l.dataset.ticketvisual132='1';document.head.appendChild(l)}
function enhance(){if(pending)return;pending=true;queueMicrotask(async()=>{pending=false;try{await appendTicketIntelligence100();await appendTicketDetails100();await applyTicketPriceFix102();await enhanceTicketSector103();await enhanceTicketRepricing105();await enhanceTicketVisual132()}catch(e){console.warn('[tickets132]',e)}})}
function arm(){const host=document.querySelector('#ticketIntelView');if(!host)return;observer?.disconnect();observer=new MutationObserver(enhance);observer.observe(host,{childList:true,subtree:false});setTimeout(enhance,80);setTimeout(enhance,600);setTimeout(enhance,1400)}
export function renderTicketPage100(){ensureVisualStyle();renderTicketPage687();arm()}
