import {renderPersonalMoney640} from './personalMoney640.js';
import {appendXtbIntelligence100,appendCapitalBrain100} from './marketIntelligence100.js';
import {appendXtbDetails100} from './marketDetails100.js';
import {enhanceMoneyVisual138} from './moneyVisual138.js';
import {applyMoneyDataQa144} from './dataQa144.js';
import {enhanceUnifiedCapital160} from './unifiedCapital160.js';
import {enhanceRecommendationPerformance162} from './recommendationPerformance162.js';
let observer=null,running=false,rerun=false;
function ensureStyle(){for(const [key,href] of [['moneyvisual138','./moneyVisual138.css'],['os164','./os164.css']]){if(document.querySelector(`link[data-${key}]`))continue;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l)}}
function enhance(){if(running){rerun=true;return}running=true;queueMicrotask(async()=>{try{appendXtbIntelligence100();appendXtbDetails100();await appendCapitalBrain100();applyMoneyDataQa144();enhanceMoneyVisual138();await enhanceUnifiedCapital160();await enhanceRecommendationPerformance162()}catch(e){console.warn('[money164.2]',e)}finally{running=false;if(rerun){rerun=false;enhance()}}})}
function arm(){const host=document.querySelector('#moneyView');if(!host)return;observer?.disconnect();observer=new MutationObserver(enhance);observer.observe(host,{childList:true,subtree:false});setTimeout(enhance,80);setTimeout(enhance,600)}
export function renderMoneyPage100(){ensureStyle();renderPersonalMoney640();arm()}
