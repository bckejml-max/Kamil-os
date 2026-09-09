import {installRuntimeOwnership1100,ownEvent1100,activateDomain1100,scheduleMicrotask1100} from './runtimeOwnership1100.js';
import {runtimeHealth1120} from './runtimeHealth1120.js';

const VERSION='1220.0.1',OWNER='core.performance1220';
const BUDGETS={today:120,inbox:140,money:160,tickets:180,betting:180,family:150,home:150,more:160,unknown:180};
const state=globalThis.__KAMIL_PERF_BUDGET1220__||(globalThis.__KAMIL_PERF_BUDGET1220__={version:VERSION,installed:false,views:{},violations:[],last:null});
const trim=()=>{if(state.violations.length>100)state.violations.splice(0,state.violations.length-100)};
function measure(view,start){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const ms=Math.round((performance.now()-start)*10)/10,budget=BUDGETS[view]||BUDGETS.unknown,row={view,ms,budget,ok:ms<=budget,at:Date.now()};
  state.views[view]=row;state.last=row;
  if(!row.ok){state.violations.push(row);trim();globalThis.dispatchEvent?.(new CustomEvent('kamil:performance-budget1220',{detail:row}))}
 }));
}
function onView(e){const view=String(e?.detail||'unknown');measure(view,performance.now())}
export function performanceBudget1220(){const health=runtimeHealth1120(),violations=state.violations.slice(-20);return{version:VERSION,budgets:{...BUDGETS},views:{...state.views},last:state.last,violations,violationCount:state.violations.length,slowViews5m:health.slowViews5m,tone:violations.length?'warn':'good'}}
export function installPerformanceBudget1220(){if(state.installed)return performanceBudget1220();installRuntimeOwnership1100();activateDomain1100('core',[OWNER]);state.installed=true;ownEvent1100(OWNER,globalThis,'kamil:view-change',onView);scheduleMicrotask1100(OWNER,'initial',()=>{const view=document.querySelector('[id^="view-"][class~="on"]')?.id?.replace(/^view-/,'')||'today';measure(view,performance.now())});globalThis.__KAMIL_PERF_BUDGET1220_API__={snapshot:performanceBudget1220,budgets:BUDGETS};return performanceBudget1220()}
