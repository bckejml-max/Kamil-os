import {cashflow90} from './cashflow25.js';
import {capitalAllocation} from './capitalAllocation25.js';

const DAY=86400000;
const n=v=>Number(v||0);
const localDateKey=v=>{const d=new Date(v);if(!Number.isFinite(d.getTime()))return null;const p=x=>String(x).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`};
const dayStart=v=>{const d=new Date(v);if(!Number.isFinite(d.getTime()))return null;d.setHours(0,0,0,0);return d.getTime()};
const cloneState=s=>JSON.parse(JSON.stringify(s&&typeof s==='object'?s:{}));

export const SCENARIO_TYPES={EXPENSE:'Mimořádný výdaj',INVEST:'Nová investice',INCOME:'Mimořádný příjem'};
export const scenarioSimulatorNote='Scenario Simulator pracuje jen s dočasnou kopií uloženého stavu. Nic neukládá, neposílá peníze, neprovádí investici a bez skutečného FX kurzu nepřepočítává cizí měny.';

function baseSnapshot(s,now){
 return {cashflow:cashflow90(s,now),allocation:capitalAllocation(s,now)};
}
function resultReason(verdict,type,sim,base,days){
 if(verdict==='OUTSIDE_HORIZON')return `Zadaný termín je za ${days} dní, tedy mimo 90denní cashflow horizont. Reálná data se nemění.`;
 if(verdict==='BLOCK'&&sim.allocation.unfundedPlan>base.allocation.unfundedPlan)return 'Scénář by snížil bezpečný prostor natolik, že část už naplánované investice přestane být krytá rezervou.';
 if(verdict==='BLOCK')return sim.cashflow.belowReserveDate?`Scénář by podle uloženého 90denního cashflow dostal hotovost pod rezervní minimum od ${sim.cashflow.belowReserveDate}.`:'Scénář by porušil uložené rezervní minimum.';
 if(verdict==='RISK_REMAINS')return 'Mimořádný příjem situaci zlepšuje, ale ani po něm uložený 90denní výhled nezůstává nad rezervním minimem.';
 if(verdict==='CAUTION')return 'Rezerva zůstává zachovaná, ale minimální hotovost se dostává do těsného pásma nad rezervou.';
 if(verdict==='IMPROVES')return 'Scénář zlepšuje uložený 90denní výhled z rizikového/těsného stavu do bezpečného pásma.';
 return type==='INCOME'?'Po započtení příjmu zůstává uložený 90denní výhled nad rezervním minimem.':'Po započtení scénáře zůstává uložený 90denní výhled nad rezervním minimem.';
}

export function simulateScenario(s={},input={},now=new Date()){
 const type=String(input.type||'EXPENSE').toUpperCase(),amount=Math.abs(n(input.amount));
 const primaryCurrency=String(s.financePlan?.currency||'CZK').toUpperCase(),currency=String(input.currency||primaryCurrency).toUpperCase();
 const date=input.date||localDateKey(now),at=dayStart(date),today=dayStart(now),base=baseSnapshot(s,now);
 if(!SCENARIO_TYPES[type])return {ok:false,code:'INVALID_TYPE',message:'Neznámý typ scénáře.',type,amount,currency,date,primaryCurrency,base,note:scenarioSimulatorNote};
 if(!Number.isFinite(amount)||amount<=0)return {ok:false,code:'INVALID_AMOUNT',message:'Zadej kladnou částku scénáře.',type,amount,currency,date,primaryCurrency,base,note:scenarioSimulatorNote};
 if(at===null||today===null)return {ok:false,code:'INVALID_DATE',message:'Zadej platné datum scénáře.',type,amount,currency,date,primaryCurrency,base,note:scenarioSimulatorNote};
 if(at<today)return {ok:false,code:'PAST_DATE',message:'Scénář musí být dnes nebo v budoucnu.',type,amount,currency,date,primaryCurrency,base,note:scenarioSimulatorNote};
 if(currency!==primaryCurrency)return {ok:false,code:'FX_UNSUPPORTED',message:`Scénář je v ${currency}, ale finanční plán je v ${primaryCurrency}. Bez skutečného FX kurzu částku nepřepočítávám.`,type,amount,currency,date,primaryCurrency,base,note:scenarioSimulatorNote};
 const days=Math.round((at-today)/DAY),draft=cloneState(s);draft.financePlan={...(draft.financePlan||{})};draft.financePlan.cashflow=Array.isArray(draft.financePlan.cashflow)?draft.financePlan.cashflow:[];
 const signed=type==='INCOME'?amount:-amount,label=`Scénář: ${SCENARIO_TYPES[type]}`;
 draft.financePlan.cashflow.push({id:`scenario-${type.toLowerCase()}`,label,amount:signed,date:localDateKey(at),cadence:'once',active:true,source:'SCENARIO'});
 const sim=baseSnapshot(draft,now),withinHorizon=days<=90;
 let verdict='OK';
 if(!withinHorizon)verdict='OUTSIDE_HORIZON';
 else if(type!=='INCOME'&&sim.allocation.unfundedPlan>base.allocation.unfundedPlan)verdict='BLOCK';
 else if(sim.cashflow.status==='RISK')verdict=type==='INCOME'?'RISK_REMAINS':'BLOCK';
 else if(sim.cashflow.status==='TIGHT')verdict='CAUTION';
 else if(type==='INCOME'&&base.cashflow.status!=='OK'&&sim.cashflow.status==='OK')verdict='IMPROVES';
 const delta={
  minBalance:sim.cashflow.minBalance-base.cashflow.minBalance,
  endBalance:sim.cashflow.endBalance-base.cashflow.endBalance,
  safeBeforePlan:sim.allocation.safeBeforePlan-base.allocation.safeBeforePlan,
  newCapital:sim.allocation.newCapital-base.allocation.newCapital
 };
 return {ok:true,type,typeLabel:SCENARIO_TYPES[type],amount,currency,date:localDateKey(at),days,withinHorizon,verdict,reason:resultReason(verdict,type,sim,base,days),base,sim,delta,note:scenarioSimulatorNote};
}
