import {TICKET_MASTER_ID_1336} from './ticketMaster1336.js';
import {BETTING_MASTER_ID_1335} from './bettingMaster1335.js';
import {INSURANCE_MASTER_ID_1336} from './insuranceMaster1336.js';

const DAY=86400000;
const ts=v=>{const n=Date.parse(v||'');return Number.isFinite(n)?n:null};
const latest=(...values)=>values.map(ts).filter(Number.isFinite).sort((a,b)=>b-a)[0]||null;
const latestFrom=(rows=[],keys=['updatedAt','asOf','createdAt'])=>latest(...rows.flatMap(x=>keys.map(k=>x?.[k])));

export const MASTER_DATA_REGISTRY=Object.freeze({
 tickets:{id:TICKET_MASTER_ID_1336,label:'Vstupenky',route:'tickets',masterPath:'ticketBook.masterId',staleAfterDays:7},
 betting:{id:BETTING_MASTER_ID_1335,label:'Sázení',route:'betting',masterPath:'bettingLedger.masterId',staleAfterDays:14},
 insurance:{id:INSURANCE_MASTER_ID_1336,label:'Pojištění',route:'more',masterPath:'personalAdmin.insuranceMasterId',staleAfterDays:45},
 money:{id:'money-live-state',label:'Peníze',route:'money',staleAfterDays:14},
 property:{id:'property-book',label:'Reality',route:'property',staleAfterDays:30},
 work:{id:'work-state',label:'Práce',route:'work',staleAfterDays:14},
 calendar:{id:'calendar-feed',label:'Kalendář',route:'today',staleAfterDays:3},
 personal:{id:'personal-state',label:'Osobní OS',route:'inbox',staleAfterDays:14}
});

const getPath=(o,path)=>String(path||'').split('.').reduce((x,k)=>x?.[k],o);
const sourceUpdatedAt=(key,s)=>{
 if(key==='tickets')return latest(s.ticketBook?.updatedAt,s.ticketBook?.masterMeta?.confirmedAt);
 if(key==='betting')return latest(s.bettingLedger?.updatedAt,s.bettingLedger?.masterMeta?.confirmedAt);
 if(key==='insurance')return latest(s.personalAdmin?.insuranceMasterAt,latestFrom(s.personalAdmin?.items||[]));
 if(key==='money')return latest(s.financePlan?.updatedAt,s.xtbReport?.asOf,latestFrom(s.netWorthBook?.history||[],['asOf','date','createdAt']),latestFrom(s.personalSpending?.transactions||[]));
 if(key==='property')return latest(latestFrom(s.propertyBook?.candidates||[]),s.propertyBook?.updatedAt);
 if(key==='work')return latest(latestFrom(s.projects||[]),latestFrom(s.tasks||[]));
 if(key==='calendar')return latest(s.calendar?.asOf,latestFrom(s.calendar?.events||[],['updatedAt','start','date','createdAt']));
 if(key==='personal')return latest(s.meta?.lastMutationAt,latestFrom(s.personalAdmin?.items||[]),latestFrom(s.familyHome?.members||[]));
 return null;
};

export function sourceFreshness741(s={},now=Date.now()){
 return Object.entries(MASTER_DATA_REGISTRY).map(([key,cfg])=>{
  const at=sourceUpdatedAt(key,s),ageDays=at===null?null:Math.max(0,(now-at)/DAY),masterActual=cfg.masterPath?getPath(s,cfg.masterPath):null;
  const masterOk=!cfg.masterPath||masterActual===cfg.id;
  const stale=ageDays===null||ageDays>cfg.staleAfterDays;
  return {key,...cfg,updatedAt:at?new Date(at).toISOString():null,ageDays,stale,masterOk,masterActual,confidence:!masterOk?'conflict':stale?'stale':'fresh'};
 });
}
export function masterConflicts741(s={}){
 return sourceFreshness741(s).filter(x=>!x.masterOk).map(x=>({
  id:'master:'+x.key,domain:x.key,route:x.route,severity:'bad',
  title:x.label+' používá jiný master',
  detail:'Očekávám '+x.id+', ale stav uvádí '+String(x.masterActual||'žádný')+'.',
  expected:x.id,actual:x.masterActual
 }));
}
export function freshnessLabel741(row){
 if(!row?.updatedAt)return'bez potvrzeného času';
 const d=Math.floor(Number(row.ageDays||0));
 if(d<=0)return'dnes';
 if(d===1)return'včera';
 return'před '+d+' d';
}
