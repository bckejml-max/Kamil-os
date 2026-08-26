import {renderTicketPage687} from './ticketPage687.js';
import {appendTicketIntelligence100} from './marketIntelligence100.js';
import {appendTicketDetails100} from './marketDetails100.js';
import {applyTicketPriceFix102} from './ticketPriceFix102.js';
import {enhanceTicketSector103} from './ticketSector103.js';
import {enhanceTicketRepricing105} from './ticketRepricing105.js';
import {enhanceTicketVisual132} from './ticketVisual132.js';
import {enhanceTicketVisual133} from './ticketVisual133.js';
import {enhanceTicketVisual134} from './ticketVisual134.js';
import {enhanceTicketVisual135} from './ticketVisual135.js';
import {enhanceTicketVisual136} from './ticketVisual136.js';
import {applyTicketDataQa144} from './dataQa144.js';
import {applyTicketSafetyUi149} from './ticketSafetyUi149.js';
import {enhanceTicketSales150} from './ticketSales150.js';
import {enhanceTicketSaleDetail151} from './ticketSaleDetail151.js';
let observer=null,pending=false;
function ensureVisualStyle(){for(const [key,href] of [['ticketvisual132','./ticketVisual132.css'],['ticketvisual133','./ticketVisual133.css'],['ticketvisual134','./ticketVisual134.css'],['ticketvisual135','./ticketVisual135.css'],['ticketvisual136','./ticketVisual136.css'],['ticketsaledetail151','./ticketSaleDetail151.css']]){if(document.querySelector(`link[data-${key}]`))continue;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l)}}
function enhance(){if(pending)return;pending=true;queueMicrotask(async()=>{pending=false;try{await appendTicketIntelligence100();await appendTicketDetails100();await applyTicketPriceFix102();await enhanceTicketSector103();await enhanceTicketRepricing105();await enhanceTicketVisual132();await enhanceTicketVisual133();await enhanceTicketVisual134();await enhanceTicketVisual135();await enhanceTicketVisual136();await applyTicketDataQa144();applyTicketSafetyUi149();enhanceTicketSales150();await enhanceTicketSaleDetail151()}catch(e){console.warn('[tickets151]',e)}})}
function arm(){const host=document.querySelector('#ticketIntelView');if(!host)return;observer?.disconnect();observer=new MutationObserver(enhance);observer.observe(host,{childList:true,subtree:false});setTimeout(enhance,80);setTimeout(enhance,600);setTimeout(enhance,1400)}
export function renderTicketPage100(){ensureVisualStyle();renderTicketPage687();arm()}
