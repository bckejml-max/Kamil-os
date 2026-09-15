import {store} from './state.js';
import {cashflowSafety1211,moneyIntegrityScan1211} from '../lib/money-integrity1211.js';
import {recoveryManifest1207} from '../lib/os-recovery1202.js';
import {ownCleanup1100,schedule1100} from './runtimeOwnership1100.js';

const OWNER='money.integrity1211',VERSION='1211.0.0';
let applying=false,lastSignature='';
const clone=value=>{try{return structuredClone(value)}catch{return JSON.parse(JSON.stringify(value))}};
const signature=rows=>{try{return JSON.stringify((rows||[]).map(x=>[x?.id,x?.externalId,x?.date,x?.amount,x?.amountCzk,x?.currency,x?.merchant,x?.category]))}catch{return String(Date.now())}};
function recoverySnapshot(state,reason,detail){try{localStorage.setItem('kamil-os-money-recovery-1211',JSON.stringify({version:VERSION,reason,detail,manifest:recoveryManifest1207(state),state:clone(state),savedAt:new Date().toISOString()}))}catch{}}
function emit(detail){try{window.dispatchEvent(new CustomEvent('kamil:money-integrity',{detail}))}catch{}}
function run(){
 if(applying)return;
 const state=store.get?.()||{},rows=state?.personalSpending?.transactions||[],sig=signature(rows);
 const health=cashflowSafety1211(state);
 globalThis.__KAMIL_MONEY_INTEGRITY1211__={version:VERSION,...health,at:Date.now()};
 document.documentElement.dataset.moneyIntegrity1211=health.critical?'blocked':health.ok?'ok':'warning';
 if(health.critical){recoverySnapshot(state,'money-critical-integrity',health);emit({ok:false,critical:true,health});return}
 if(health.transactions.duplicateCount>0&&sig!==lastSignature){
  const scan=moneyIntegrityScan1211(rows);lastSignature=sig;recoverySnapshot(state,'money-exact-duplicate-repair',{duplicates:scan.duplicateCount});
  applying=true;
  try{const next=clone(state);next.personalSpending=next.personalSpending||{};next.personalSpending.transactions=scan.canonical;store.replace?.(next,'money-integrity-dedupe',{cloud:true,audit:true})}finally{applying=false}
  emit({ok:true,repaired:true,duplicates:scan.duplicateCount});return;
 }
 emit({ok:true,critical:false,health});
}
const schedule=()=>schedule1100(OWNER,'scan',run,80,{pauseWhenHidden:true});
const unsubscribe=store.subscribe?.(()=>schedule());if(typeof unsubscribe==='function')ownCleanup1100(OWNER,unsubscribe);
schedule1100(OWNER,'boot',run,120,{pauseWhenHidden:true});
