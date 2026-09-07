import {renderPersonalMoney640} from './personalMoney640.js';
import {appendMoneyHub680} from './moneyHub680.js';
import {appendCashflowHub690} from './cashflowHub690.js';
import {enhanceMoneyVisual138} from './moneyVisual138.js';
import {applyMoneyDataQa144} from './dataQa144.js';

let advancedPromise=null;
function style(key,href){if(document.querySelector(`link[data-${key}]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l)}
function ensureBaseStyle(){style('moneyvisual138','./moneyVisual138.css');style('moneyhub680','./moneyHub680.css');style('cashflowhub690','./cashflowHub690.css')}
function ensureAdvancedStyle(){for(const [k,h] of [['os164','./os164.css'],['os181','./os181.css'],['upgrade610','./upgrade610.css'],['propertyhub620','./propertyHub620.css']])style(k,h)}
function mountAdvancedButton(){const host=document.querySelector('#moneyView');if(!host||host.querySelector('[data-money-advanced]'))return;const row=document.createElement('div');row.className='row money-advanced-entry';row.dataset.moneyAdvanced='1';row.innerHTML='<div><b>Rozšířená analýza peněz</b><div class="muted">XTB detail, reality, historie majetku a capital allocation se načtou na vyžádání.</div></div><button class="btn" type="button">Načíst detail</button>';row.querySelector('button').onclick=async()=>{const b=row.querySelector('button');b.disabled=true;b.textContent='Načítám…';await loadMoneyAdvanced100();b.textContent='Detail načten'};const head=host.querySelector('.view-head');head?.after(row)||host.prepend(row)}

export async function loadMoneyAdvanced100(){
 if(advancedPromise)return advancedPromise;ensureAdvancedStyle();advancedPromise=(async()=>{
  const [cockpit,reconcile,advisor,outcome,learning,wealth,propertyFinance,propertyHub,intelligence,details,capital,unified,recommendation,suite,final]=await Promise.all([
   import('./xtbCockpit383.js'),import('./xtbReconciliationPanel391.js'),import('./xtbOrderAdvisorPanel392.js'),import('./xtbOutcomePanel393.js'),import('./xtbLearningPanel394.js'),import('./wealthHistory610.js'),import('./propertyFinance610.js'),import('./propertyHub620.js'),import('./marketIntelligence100.js'),import('./marketDetails100.js'),import('./capitalCommand100.js'),import('./unifiedCapital160.js'),import('./recommendationPerformance162.js'),import('./os181Suite.js'),import('./os181Final.js')
  ]);
  cockpit.installXtbCockpit383?.();reconcile.installXtbReconciliationPanel391?.();advisor.installXtbOrderAdvisorPanel392?.();outcome.installXtbOutcomePanel393?.();learning.installXtbLearningPanel394?.();wealth.appendWealthHistory610?.();propertyFinance.appendPropertyFinance610?.();propertyHub.appendPropertyHub620?.();intelligence.appendXtbIntelligence100?.();details.appendXtbDetails100?.();await intelligence.appendCapitalBrain100?.();await unified.enhanceUnifiedCapital160?.();await recommendation.enhanceRecommendationPerformance162?.();await suite.enhanceMoney181?.();await final.enhanceMoney181Final?.();
  window.__KAMIL_MONEY_ADVANCED__={loaded:true,at:Date.now()};return true
 })().catch(error=>{console.warn('[money advanced]',error);window.__KAMIL_MONEY_ADVANCED__={loaded:false,error:String(error?.message||error),at:Date.now()};throw error}).finally(()=>{advancedPromise=null});return advancedPromise
}

export function renderMoneyPage100(){
 ensureBaseStyle();renderPersonalMoney640();appendMoneyHub680();appendCashflowHub690();try{applyMoneyDataQa144()}catch(error){console.warn('[money qa]',error)}try{enhanceMoneyVisual138()}catch(error){console.warn('[money visual]',error)}mountAdvancedButton();
}
