import {store} from './state.js';
import {buildRecoveryVaultSeed640} from './personalVault640.js';

const VERSION='737.1.0';
const CASH_ID='manual-cash-20260912';
const amountLabel=value=>`${Math.round(Number(value||0)).toLocaleString('cs-CZ')} Kč`;
const dateOnly=value=>{const d=new Date(value||'');return Number.isFinite(d.getTime())?d.toISOString().slice(0,10):null};

export function ensurePersonalMoneyBridge737(){
 const s=store.get(),plan=s.financePlan||{};
 const current=Array.isArray(s.personalVault?.items)?s.personalVault.items:[];
 const seed=current.length?current:buildRecoveryVaultSeed640(s);
 const cashNow=Number(plan.cashNow||0),explicit=!!plan.updatedAt||[plan.cashNow,plan.expectedIncome,plan.reserveFloor,plan.plannedInvestment].some(v=>Number(v||0)!==0);
 if(!explicit)return false;
 const asOf=dateOnly(plan.updatedAt);
 const sourceLabel=asOf?`Uživatel · finanční plán ${new Date(plan.updatedAt).toLocaleDateString('cs-CZ')}`:'Uživatel · uložený finanční plán';
 const sourceBasis=`Uložená likvidní hotovost ve finančním plánu: ${amountLabel(cashNow)}.`;
 const existing=seed.find(x=>x.id===CASH_ID);
 if(existing&&Number(existing.balance||0)===cashNow&&(existing.asOf||null)===asOf&&existing.sourceBasis===sourceBasis)return true;
 const now=new Date().toISOString();
 const cash={
  id:CASH_ID,section:'money',recordType:'bank-data',title:'Likvidní hotovost',provider:'',balance:cashNow,
  asOf,freshnessDays:45,confidence:100,confidenceLabel:'POTVRZENO',
  sourceLabel,sourceBasis,
  nextAction:'Aktualizovat při významné změně likvidní hotovosti.',seededFrom:'finance-plan',createdAt:existing?.createdAt||now,updatedAt:now
 };
 store.mutate('Aktualizována likvidní hotovost',x=>{
  const base=Array.isArray(x.personalVault?.items)&&x.personalVault.items.length?x.personalVault.items:seed;
  const withoutManual=base.filter(v=>v.id!==CASH_ID);
  const stale=withoutManual.find(v=>v.id==='recovered-bank-coverage');
  if(stale){stale.nextAction='Historický MONETA snapshot ponechán jen jako zdroj; aktuální likvidita je vedena samostatně.'}
  x.personalVault={...(x.personalVault||{}),version:1,items:[cash,...withoutManual],updatedAt:now,migratedAt:x.personalVault?.migratedAt||now};
 },{undo:false,cloud:true,audit:true});
 window.__KAMIL_PERSONAL_MONEY_BRIDGE737__={version:VERSION,cashCzk:cashNow,asOf,healthy:true,at:Date.now()};
 return true;
}
