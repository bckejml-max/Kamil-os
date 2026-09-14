import {installRuntimeOwnership1100,ownEvent1100,schedule1100} from './runtimeOwnership1100.js';
import {dedupeTransactions1206,recoveryManifest1207,diagnosticsBundle1208,moneyReconciliation1205} from '../lib/os-recovery1202.js';

const RECOVERY_KEY='kamil-os-recovery-1130';
const OWNER='data.integrity1130';
const SETTLED=new Set(['WON','LOST','VOID','CASHED_OUT','SETTLED','PAID','PAYOUT RECEIVED']);
const criticalBetFields=['status','result','outcome','payout','payoutCzk','profit','profitCzk','settledAt','settled_at'];
let started=false,stop=()=>{},checking=false,settledBaseline=new Map();
installRuntimeOwnership1100();
const clone=x=>{try{return structuredClone(x)}catch{return JSON.parse(JSON.stringify(x))}};
const criticalSnapshot=bet=>Object.fromEntries(criticalBetFields.map(k=>[k,clone(bet?.[k]??null)]));
const signature=bet=>JSON.stringify(criticalSnapshot(bet));
function captureSettled(state){for(const bet of state?.bettingLedger?.bets||[]){const status=String(bet?.status||bet?.result||'').toUpperCase();if(bet?.id&&SETTLED.has(status)&&!settledBaseline.has(bet.id))settledBaseline.set(bet.id,criticalSnapshot(bet))}}
function saveRecovery(state,reason,report){try{localStorage.setItem(RECOVERY_KEY,JSON.stringify({at:new Date().toISOString(),reason,report,state:clone({...state,undo:[]})}))}catch{}}
function settledViolations(state){const changed=[];for(const bet of state?.bettingLedger?.bets||[]){if(!bet?.id||!settledBaseline.has(bet.id))continue;const before=settledBaseline.get(bet.id),after=signature(bet);if(JSON.stringify(before)!==after)changed.push({id:bet.id,before})}return changed}
function repairSettled(state,violations){const next=clone(state),byId=new Map((next?.bettingLedger?.bets||[]).map(b=>[b?.id,b]));for(const row of violations){const bet=byId.get(row.id);if(!bet)continue;for(const key of criticalBetFields){if(row.before[key]===undefined)delete bet[key];else bet[key]=clone(row.before[key])}}return next}
function financeDedupe(state){const rows=state?.personalSpending?.transactions;if(!Array.isArray(rows)||rows.length<2)return null;const result=dedupeTransactions1206(rows);return result.duplicates.length?result:null}
function liveMoneyCheck(state){const items=Array.isArray(state?.netWorthBook?.items)?state.netWorthBook.items:[];const accounts=items.filter(x=>String(x?.type||x?.category||'').toLowerCase().includes('account')).map(x=>({balanceCzk:x?.balanceCzk??x?.valueCzk??x?.value}));const investments=items.filter(x=>String(x?.type||x?.category||'').toLowerCase().includes('invest')).map(x=>({valueCzk:x?.valueCzk??x?.value}));return moneyReconciliation1205({accounts,investments,cash:Number(state?.financePlan?.cashNow||0),expectedTotalCzk:state?.netWorthBook?.expectedTotalCzk})}
async function start(){
 if(started)return;started=true;
 const mod=await import('./state.js');const {store,validateState}=mod;
 captureSettled(store.get());
 stop=store.subscribe((state,reason)=>{
  if(checking)return;checking=true;
  try{
   const report=validateState(state);
   if(!report.ok||report.fatal.length){saveRecovery(state,reason||'state-invalid',report);globalThis.__KAMIL_HEALTH1159__?.warnings?.push?.({type:'state-invalid',reason,report,at:Date.now()})}
   const violations=settledViolations(state),dedupe=financeDedupe(state);
   if(violations.length||dedupe){
    saveRecovery(state,violations.length?`settled-bet-changed:${violations.map(x=>x.id).join(',')}`:'duplicate-finance-transactions',{settledChanged:violations.map(x=>x.id),financeDuplicates:dedupe?.duplicates?.length||0});
    let corrected=violations.length?repairSettled(state,violations):clone(state);
    if(dedupe){corrected.personalSpending=corrected.personalSpending||{};corrected.personalSpending.transactions=dedupe.transactions}
    corrected.audit=Array.isArray(corrected.audit)?corrected.audit:[];
    corrected.audit.unshift({id:`integrity-${Date.now()}`,label:`Integrity auto-repair: ${violations.length} settled bet field set(s), ${dedupe?.duplicates?.length||0} duplicate transaction(s)`,at:new Date().toISOString()});
    corrected.audit=corrected.audit.slice(0,100);
    store.replace(corrected,'integrity-auto-repair');
    captureSettled(corrected);
    globalThis.__KAMIL_HEALTH1159__?.warnings?.push?.({type:'integrity-auto-repair',settledIds:violations.map(x=>x.id),financeDuplicates:dedupe?.duplicates?.length||0,at:Date.now()});
    return;
   }
   captureSettled(state);
  }finally{checking=false}
 });
 const manifest=()=>recoveryManifest1207({store:{schemaVersion:store.get()?.meta?.schemaVersion??null,lastMutationAt:store.get()?.meta?.lastMutationAt??null,recoveryPresent:!!localStorage.getItem(RECOVERY_KEY)},cloud:{lastCloudAt:store.get()?.meta?.lastCloudAt??null},gmail:store.get()?.ticketBook?.gmailCheckpoint||null,betting:{count:store.get()?.bettingLedger?.bets?.length||0,settledTracked:settledBaseline.size},tickets:{count:store.get()?.ticketBook?.items?.length||0}});
 const diagnostics=()=>diagnosticsBundle1208({runtime:globalThis.__KAMIL_HEALTH1159__||null,state:{validation:validateState(store.get()),money:liveMoneyCheck(store.get()),manifest:manifest()},errors:globalThis.__KAMIL_HEALTH1159__?.warnings||[]});
 globalThis.__KAMIL_DATA_INTEGRITY1130__={version:'1208.0.0',recoveryKey:RECOVERY_KEY,validate:()=>validateState(store.get()),manifest,diagnostics,snapshot:()=>({settledTracked:settledBaseline.size,recovery:!!localStorage.getItem(RECOVERY_KEY),money:liveMoneyCheck(store.get())}),stop:()=>{stop();stop=()=>{};started=false}};
}
ownEvent1100(OWNER,window,'kamil:boot-budget343',()=>void start(),{once:true});
schedule1100(OWNER,'fallback-start',()=>void start(),3500,{pauseWhenHidden:true});
