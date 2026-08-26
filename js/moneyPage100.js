import {renderPersonalMoney640} from './personalMoney640.js';
import {appendXtbIntelligence100,appendCapitalBrain100} from './marketIntelligence100.js';
let observer=null,pending=false;
function enhance(){if(pending)return;pending=true;queueMicrotask(async()=>{pending=false;try{appendXtbIntelligence100();await appendCapitalBrain100()}catch(e){console.warn('[money100]',e)}})}
function arm(){const host=document.querySelector('#moneyView');if(!host)return;observer?.disconnect();observer=new MutationObserver(enhance);observer.observe(host,{childList:true,subtree:false});setTimeout(enhance,80);setTimeout(enhance,600)}
export function renderMoneyPage100(){renderPersonalMoney640();arm()}
