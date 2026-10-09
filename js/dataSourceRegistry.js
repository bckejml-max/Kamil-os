const TICKET_MASTER_ID_1336='flipovani-2024-2026-2026-09-23';
const BETTING_MASTER_ID_1335='sazky_portfolio_FINAL_2026-09-23';
const INSURANCE_MASTER_ID_1336='insurance-registry-2026-09-25-v2';

const DAY=86400000;
const A=v=>Array.isArray(v)?v:[];
const ts=v=>{const n=Date.parse(v||'');return Number.isFinite(n)?n:null};
const latest=(...values)=>values.map(ts).filter(Number.isFinite).sort((a,b)=>b-a)[0]||null;
const latestFrom=(rows=[],keys=['updatedAt','asOf','createdAt'])=>latest(...A(rows).flatMap(x=>keys.map(k=>x?.[k])));
const hasRows=v=>A(v).length>0;
const hasObjectValues=v=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length>0;

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
const workTasks=s=>A(s.tasks).filter(x=>/prac|zakaz|zakáz|work/i.test(String(x?.area||'')+' '+String(x?.category||'')+' '+String(x?.project||'')));
const personalTasks=s=>A(s.tasks).filter(x=>!workTasks({tasks:[x]}).length);
const insuranceRows=s=>A(s.personalAdmin?.items).filter(x=>String(x?.category||'').toUpperCase()==='INSURANCE');

const sourceHasData=(key,s)=>{
 if(key==='tickets')return hasRows(s.ticketBook?.items)||hasRows(s.ticketBook?.watchlist)||!!s.ticketBook?.updatedAt||!!s.ticketBook?.masterMeta?.confirmedAt;
 if(key==='betting')return hasRows(s.bettingLedger?.bets)||Number(s.bettingLedger?.bankrollCzk||0)>0||Number(s.bettingLedger?.unitCzk||0)>0||!!s.bettingLedger?.updatedAt;
 if(key==='insurance')return hasRows(insuranceRows(s))||!!s.personalAdmin?.insuranceMasterAt;
 if(key==='money')return !!s.financePlan?.updatedAt||!!s.xtbReport?.asOf||!!s.xtbHub?.updatedAt||hasObjectValues(s.xtbHub?.accounts)||hasRows(s.personalVault?.items)||hasRows(s.netWorthBook?.items)||hasRows(s.netWorthBook?.history)||hasRows(s.personalSpending?.transactions);
 if(key==='property')return hasRows(s.propertyBook?.candidates)||!!s.propertyBook?.updatedAt;
 if(key==='work')return hasRows(s.projects)||hasRows(workTasks(s))||!!s.workState?.updatedAt;
 if(key==='calendar')return hasRows(s.calendar?.events)||!!s.calendar?.asOf||!!s.calendar?.updatedAt;
 if(key==='personal')return hasRows(personalTasks(s))||hasRows(s.personalAdmin?.items)||hasRows(s.familyHome?.members)||hasRows(s.personalInbox?.items)||hasRows(s.assetBook?.items)||hasRows(s.personalGoals?.items)||hasRows(s.delegations)||hasRows(s.inbox);
 return false;
};
const sourceUpdatedAt=(key,s)=>{
 if(key==='tickets')return latest(s.ticketBook?.updatedAt,s.ticketBook?.masterMeta?.confirmedAt,latestFrom(s.ticketBook?.items||[]));
 if(key==='betting')return latest(s.bettingLedger?.updatedAt,s.bettingLedger?.masterMeta?.confirmedAt,latestFrom(s.bettingLedger?.bets||[],['updatedAt','settledAt','placedAt','createdAt']));
 if(key==='insurance')return latest(s.personalAdmin?.insuranceMasterAt,latestFrom(insuranceRows(s)));
 if(key==='money')return latest(s.financePlan?.updatedAt,s.xtbReport?.asOf,s.xtbHub?.updatedAt,latestFrom(s.personalVault?.items||[]),latestFrom(s.netWorthBook?.history||[],['asOf','createdAt']),latestFrom(s.personalSpending?.transactions||[]));
 if(key==='property')return latest(latestFrom(s.propertyBook?.candidates||[]),s.propertyBook?.updatedAt);
 if(key==='work')return latest(s.workState?.updatedAt,latestFrom(s.projects||[]),latestFrom(workTasks(s)));
 if(key==='calendar')return latest(s.calendar?.asOf,s.calendar?.updatedAt,latestFrom(s.calendar?.events||[],['updatedAt','createdAt']));
 if(key==='personal')return latest(latestFrom(personalTasks(s)),latestFrom(s.personalAdmin?.items||[]),latestFrom(s.familyHome?.members||[]),latestFrom(s.personalInbox?.items||[]),latestFrom(s.assetBook?.items||[]),latestFrom(s.personalGoals?.items||[]));
 return null;
};

export function sourceFreshness741(s={},now=Date.now()){
 return Object.entries(MASTER_DATA_REGISTRY).map(([key,cfg])=>{
  const available=sourceHasData(key,s),at=sourceUpdatedAt(key,s),ageDays=at===null?null:Math.max(0,(now-at)/DAY),masterActual=cfg.masterPath?getPath(s,cfg.masterPath):null;
  const masterConnected=masterActual!==null&&masterActual!==undefined&&String(masterActual).trim()!=='';
  const expectedMaster=s.meta?.expectedMasterIds?.[key]||null;
  const masterOk=!expectedMaster||!masterConnected||String(masterActual)===String(expectedMaster);
  const missing=!available,stale=available&&(ageDays===null||ageDays>cfg.staleAfterDays);
  return {key,...cfg,available,missing,updatedAt:at?new Date(at).toISOString():null,ageDays,stale,masterOk,masterConnected,masterActual,expectedMaster,confidence:!masterOk?'conflict':missing?'missing':stale?'stale':'fresh'};
 });
}
export function masterConflicts741(s={}){
 return sourceFreshness741(s).filter(x=>x.expectedMaster&&x.masterConnected&&!x.masterOk).map(x=>({
  id:'master:'+x.key,domain:x.key,route:x.route,severity:'bad',
  title:x.label+' používá jiný očekávaný zdroj',
  detail:'Očekávám '+x.expectedMaster+', ale stav uvádí '+String(x.masterActual)+'.',
  expected:x.expectedMaster,actual:x.masterActual
 }));
}
export function freshnessLabel741(row){
 if(row?.missing)return'nepřipojeno';
 if(!row?.updatedAt)return'bez potvrzeného času';
 const d=Math.floor(Number(row.ageDays||0));
 if(d<=0)return'dnes';
 if(d===1)return'včera';
 return'před '+d+' d';
}