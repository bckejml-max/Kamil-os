import {xtbBoard,xtbDataAge} from './live24.js';
import {ticketMarketBrain34} from './ticketBrain34.js';

const n=v=>Number(v||0);
const upper=v=>String(v||'').toUpperCase();
const tone=p=>Number(p)>=90?'bad':Number(p)>=75?'warn':'good';
const label=a=>({BUY:'PŘIKOUPIT',TRIM:'ZMENŠIT',SELL:'PRODAT',REVIEW:'PROVĚŘIT',HOLD:'DRŽET',VERIFY_DATA:'OPRAVIT DATA',SELL_NOW:'PRODAT TEĎ',REPRICE:'ZLEVNIT',LIST_NOW:'VYSTAVIT',CHECK_MARKET:'OBNOVIT TRH',REFRESH_XTB:'OBNOVIT DATA'})[upper(a)]||upper(a)||'PROVĚŘIT';
const urgency=p=>Number(p)>=96?'TEĎ':Number(p)>=90?'DNES':Number(p)>=80?'BRZY':'SLEDOVAT';
const round=v=>Math.round(n(v));

function xtbNextStep36(action,d={}){
 if(action==='REFRESH_XTB')return 'Importovat nový XTB report a až potom znovu přepočítat doporučení.';
 if(action==='BUY')return d?.execution?.tranches?'Otevřít detail pozice, zkontrolovat tezi a provést jen první navrženou tranši.':'Otevřít detail pozice a před nákupem znovu ověřit tezi i velikost pozice.';
 if(action==='TRIM')return 'Otevřít detail pozice, ověřit aktuální data a případně zredukovat jen navrženou část.';
 if(action==='SELL')return 'Otevřít detail pozice, ověřit aktuální data a tezi; teprve potom potvrdit exit.';
 if(action==='REVIEW')return 'Neobchodovat. Nejdřív otevřít dostupný zdroj a dokončit review.';
 return 'Otevřít detail pozice a zkontrolovat aktuální stav.';
}
function xtbEvidence36(d={},blocked=false){
 if(blocked)return 'STALE XTB';
 if(d?.reviewBeforeTrade)return 'SEC REVIEW';
 if(d?.marketQuote?.fresh)return 'FRESH QUOTE';
 if(d?.evidence?.count>0)return 'OFICIÁLNÍ PODKLAD';
 return 'XTB IMPORT';
}
function xtbImpact36(p={},d={},action=''){
 if(['TRIM','SELL'].includes(action)&&n(d?.execution?.trimAmount)>0)return round(d.execution.trimAmount);
 if(action==='SELL'&&n(p?.value)>0)return round(p.value);
 if(action==='BUY'&&n(d?.execution?.plannedAmount)>0)return round(d.execution.plannedAmount);
 return null;
}
function xtbRows36(state={}){
 const age=xtbDataAge(state),fresh=age?.days!==null&&age.days<=2;
 return xtbBoard(state).map(({p,d})=>{
  const rawAction=upper(d?.action||'HOLD'),blocked=!!d?.execution?.blocked||!fresh,actionable=['BUY','TRIM','SELL','REVIEW'].includes(rawAction);
  if(!actionable&&!blocked)return null;
  const action=blocked&&rawAction!=='REVIEW'?'REFRESH_XTB':rawAction;
  const priority=blocked&&['BUY','TRIM','SELL'].includes(rawAction)?Math.max(96,Number(d?.priority||0)):Number(d?.priority||0);
  return {id:`xtb:${p?.ticker||p?.name||'position'}`,domain:'XTB',target:'money',title:`${p?.ticker||p?.name||'Pozice'} · ${label(action)}`,action,priority,tone:tone(priority),urgency:urgency(priority),reason:blocked?(d?.execution?.blockReason||'XTB data nejsou dost čerstvá pro bezpečné provedení obchodu. Nejdřív obnov import účtu.'):(d?.reason||d?.when||'Pozice vyžaduje kontrolu.'),detail:d?.execution?.label||null,nextStep:xtbNextStep36(action,d),evidence:xtbEvidence36(d,blocked),impactCzk:xtbImpact36(p,d,rawAction),positionValueCzk:n(p?.value)>0?round(p.value):null,weightPct:Number.isFinite(Number(p?.weightPct))?Number(p.weightPct):null,blocked,autoExecute:false};
 }).filter(Boolean);
}

function ticketNextStep36(x={}){
 if(x.action==='VERIFY_DATA')return 'Opravit evidenci vstupenky a potom znovu přepočítat doporučení.';
 if(x.action==='SELL_NOW')return 'Otevřít vstupenky, zkontrolovat market a nastavit cenu nejméně na bezpečný floor.';
 if(x.action==='REPRICE')return 'Otevřít listing a snížit cenu jen k navržené hodnotě, ne pod bezpečný floor.';
 if(x.action==='LIST_NOW')return 'Vystavit vstupenky za navrženou cenu a uložit nový listing snapshot.';
 if(x.action==='CHECK_MARKET')return 'Doplnit aktuální market/recommended snapshot; bez něj cenu neměnit.';
 return 'Otevřít vstupenky a zkontrolovat stav.';
}
function ticketEvidence36(x={}){return x.recommendedSource==='VIAGOGO_SNAPSHOT'?'VIAGOGO SNAPSHOT':x.recommendedSource==='MARKET'?'MARKET SNAPSHOT':'BEZ MARKET DAT'};
function ticketRows36(state={},now=new Date()){
 return ticketMarketBrain34(state,now).rows.filter(x=>x.priority>=80&&x.action!=='HOLD').map(x=>({id:`ticket:${x.ticketId}`,domain:'VSTUPENKY',target:'tickets',title:`${x.eventName} · ${label(x.action)}`,action:x.action,priority:Number(x.priority||0),tone:tone(x.priority),urgency:urgency(x.priority),reason:x.reason,detail:x.suggestedPrice?`Navržená cena ${Math.round(x.suggestedPrice).toLocaleString('cs-CZ')} Kč / ks`:null,nextStep:ticketNextStep36(x),evidence:ticketEvidence36(x),impactCzk:n(x.buyPer)>0?round(n(x.buyPer)*Math.max(1,n(x.qty))):null,potentialGrossCzk:x.grossAtSuggested===null||x.grossAtSuggested===undefined?null:round(x.grossAtSuggested),eventDays:x.eventDays,blocked:false,autoExecute:false}));
}

export function decisionCenter36(state={},now=new Date()){
 const rows=[...xtbRows36(state),...ticketRows36(state,now)].sort((a,b)=>b.priority-a.priority||a.title.localeCompare(b.title,'cs-CZ')).slice(0,8).map((x,i)=>({...x,rank:i+1}));
 const visibleImpact=rows.reduce((s,x)=>s+Math.max(0,n(x.impactCzk)),0);
 const counts={critical:rows.filter(x=>x.priority>=90).length,blocked:rows.filter(x=>x.blocked).length,xtb:rows.filter(x=>x.domain==='XTB').length,tickets:rows.filter(x=>x.domain==='VSTUPENKY').length,visibleImpactCzk:round(visibleImpact)};
 return {rows,counts,top:rows[0]||null,generatedAt:new Date(now).toISOString(),contract:{autoTrade:false,autoReprice:false,proposalOnly:true},note:'Decision Center řadí konkrétní investiční a ticketové zásahy do jedné fronty. Impact je orientační kapitál dotčený rozhodnutím, ne očekávaný zisk. Nic samo nekupuje, neprodává ani nepřecenňuje.'};
}
