import {renderPersonalMoney640} from './personalMoney640.js';
import {appendXtbIntelligence100,appendCapitalBrain100} from './marketIntelligence100.js';
import {appendXtbDetails100} from './marketDetails100.js';
import {installXtbCockpit383} from './xtbCockpit383.js';
import {installXtbReconciliationPanel391} from './xtbReconciliationPanel391.js';
import {installXtbOrderAdvisorPanel392} from './xtbOrderAdvisorPanel392.js';
import {enhanceMoneyVisual138} from './moneyVisual138.js';
import {applyMoneyDataQa144} from './dataQa144.js';
import {enhanceUnifiedCapital160} from './unifiedCapital160.js';
import {enhanceRecommendationPerformance162} from './recommendationPerformance162.js';
import {enhanceMoney181} from './os181Suite.js';
import {enhanceMoney181Final} from './os181Final.js';
let running=false,rerun=false,timers=[];
function ensureStyle(){for(const [key,href] of [['moneyvisual138','./moneyVisual138.css'],['os164','./os164.css'],['os181','./os181.css']]){if(document.querySelector(`link[data-${key}]`))continue;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l)}}
function installXtbLayers(){installXtbCockpit383();installXtbReconciliationPanel391();installXtbOrderAdvisorPanel392()}
function enhance(){if(running){rerun=true;return}running=true;queueMicrotask(async()=>{try{installXtbLayers();appendXtbIntelligence100();appendXtbDetails100();await appendCapitalBrain100();applyMoneyDataQa144();enhanceMoneyVisual138();await enhanceUnifiedCapital160();await enhanceRecommendationPerformance162();await enhanceMoney181();await enhanceMoney181Final()}catch(e){console.warn('[money392]',e)}finally{running=false;if(rerun){rerun=false;enhance()}}})}
function scheduleEnhance(){for(const t of timers)clearTimeout(t);timers=[setTimeout(enhance,40),setTimeout(enhance,500)];}
export function renderMoneyPage100(){ensureStyle();renderPersonalMoney640();installXtbLayers();scheduleEnhance()}
