import {renderPersonalMoney640} from './personalMoney640.js';
import {appendXtbIntelligence100,appendCapitalBrain100} from './marketIntelligence100.js';
import {appendXtbDetails100} from './marketDetails100.js';
import {enhanceMoneyVisual138} from './moneyVisual138.js';
let observer=null,pending=false;
function ensureStyle(){if(document.querySelector('link[data-moneyvisual138]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./moneyVisual138.css';l.dataset.moneyvisual138='1';document.head.appendChild(l)}
function enhance(){if(pending)return;pending=true;queueMicrotask(async()=>{pending=false;try{appendXtbIntelligence100();appendXtbDetails100();await appendCapitalBrain100();enhanceMoneyVisual138()}catch(e){console.warn('[money138]',e)}})}
function arm(){const host=document.querySelector('#moneyView');if(!host)return;observer?.disconnect();observer=new MutationObserver(enhance);observer.observe(host,{childList:true,subtree:false});setTimeout(enhance,80);setTimeout(enhance,600)}
export function renderMoneyPage100(){ensureStyle();renderPersonalMoney640();arm()}
