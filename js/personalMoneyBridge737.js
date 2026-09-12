import {store} from './state.js';
import {buildRecoveryVaultSeed640} from './personalVault640.js';

const VERSION='737.0.1';
const CASH_ID='manual-cash-20260912';

export function ensurePersonalMoneyBridge737(){
 const s=store.get();
 const current=Array.isArray(s.personalVault?.items)?s.personalVault.items:[];
 const seed=current.length?current:buildRecoveryVaultSeed640(s);
 const cashNow=Number(s.financePlan?.cashNow||0);
 if(!cashNow)return false;
 const existing=seed.find(x=>x.id===CASH_ID);
 if(existing&&Number(existing.balance||0)===cashNow&&existing.asOf==='2026-09-12')return true;
 const cash={
  id:CASH_ID,section:'money',recordType:'bank-data',title:'Likvidní hotovost',provider:'',balance:cashNow,
  asOf:'2026-09-12',freshnessDays:45,confidence:100,confidenceLabel:'POTVRZENO',
  sourceLabel:'Uživatel · aktuální stav 12. 9. 2026',sourceBasis:'Uživatel potvrdil, že má aktuálně 100 000 Kč u sebe.',
  nextAction:'Aktualizovat při významné změně likvidní hotovosti.',seededFrom:'personal-snapshot-737',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
 };
 store.mutate('Aktualizována likvidní hotovost',x=>{
  const base=Array.isArray(x.personalVault?.items)&&x.personalVault.items.length?x.personalVault.items:seed;
  const withoutManual=base.filter(v=>v.id!==CASH_ID);
  const stale=withoutManual.find(v=>v.id==='recovered-bank-coverage');
  if(stale){stale.nextAction='Historický MONETA snapshot ponechán jen jako zdroj; aktuální likvidita je vedena samostatně.'}
  x.personalVault={...(x.personalVault||{}),version:1,items:[cash,...withoutManual],updatedAt:new Date().toISOString(),migratedAt:x.personalVault?.migratedAt||new Date().toISOString()};
 },{undo:false,cloud:true,audit:true});
 window.__KAMIL_PERSONAL_MONEY_BRIDGE737__={version:VERSION,cashCzk:cashNow,healthy:true,at:Date.now()};
 return true;
}
