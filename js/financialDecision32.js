const n=v=>Number(v||0),round=v=>Math.round((Number(v)||0)*100)/100;
const validDate=v=>{const t=Date.parse(v||0);return Number.isFinite(t)?t:null};
const tradeRoi=t=>{const base=n(t?.purchaseValue),real=n(t?.realized);return base>0?real/base*100:null};

export function cashflowBaseline32(state={}){
 const c=state.wealthProfile?.cashflow||{},raw=Array.isArray(c.history)?c.history:[];
 const history=raw.map(x=>({month:String(x.month||x.date||'').slice(0,7),income:n(x.income),expenses:n(x.expenses),surplus:Number.isFinite(Number(x.surplus))?n(x.surplus):n(x.income)-n(x.expenses),closed:x.closed!==false,source:x.source||null})).filter(x=>/^\d{4}-\d{2}$/.test(x.month)&&x.closed).sort((a,b)=>a.month.localeCompare(b.month));
 const avg=(key,fallback)=>history.length?history.reduce((s,x)=>s+n(x[key]),0)/history.length:n(fallback);
 return {history,months:history.length,averageIncome:round(avg('income',c.baselineIncome)),averageExpenses:round(avg('expenses',c.baselineExpenses)),averageSurplus:round(avg('surplus',c.baselineSurplus)),source:history.length?'CASHFLOW_HISTORY':'WEALTH_PROFILE_BASELINE'};
}

export function tradeOutcomeSummary32(state={}){
 const trades=(Array.isArray(state.tradeJournal?.trades)?state.tradeJournal.trades:[]).filter(x=>String(x?.kind||'INVESTMENT').toUpperCase()!=='TRANSFER'&&Number.isFinite(Number(x?.realized)));
 const realizedTotal=trades.reduce((s,x)=>s+n(x.realized),0),purchaseTotal=trades.reduce((s,x)=>s+n(x.purchaseValue),0),wins=trades.filter(x=>n(x.realized)>0).length,losses=trades.filter(x=>n(x.realized)<0).length,flat=trades.length-wins-losses;
 const ranked=[...trades].sort((a,b)=>n(b.realized)-n(a.realized)),best=ranked[0]||null,worst=ranked.at(-1)||null,recent=[...trades].sort((a,b)=>(validDate(b.closeDate)||0)-(validDate(a.closeDate)||0));
 return {trades:trades.length,wins,losses,flat,hitRate:trades.length?round(wins/trades.length*100):null,realizedTotal:round(realizedTotal),purchaseTotal:round(purchaseTotal),weightedRoiPct:purchaseTotal>0?round(realizedTotal/purchaseTotal*100):null,averageTradeRoiPct:trades.length?round(trades.map(tradeRoi).filter(x=>x!==null).reduce((s,x)=>s+x,0)/Math.max(1,trades.map(tradeRoi).filter(x=>x!==null).length)):null,best,worst,recent};
}

export function xtbAccountSummary32(state={}){
 const accounts=Object.entries(state.xtbHub?.accounts||{}).map(([id,a])=>({id,currency:String(a?.currency||'').toUpperCase(),value:round(n(a?.value)),profit:round(n(a?.profit)),positions:Array.isArray(a?.positions)?a.positions.length:0}));
 return {asOf:state.xtbHub?.asOf||state.xtbReport?.asOf||null,source:state.xtbHub?.source||state.xtbReport?.source||null,positionCount:accounts.reduce((s,x)=>s+x.positions,0),accounts};
}

export function moneyRouter32(state={}){
 const cash=Math.max(0,n(state.financePlan?.cashNow)),planned=Math.max(0,n(state.financePlan?.plannedInvestment)),baseline=cashflowBaseline32(state),profile=state.wealthProfile||{},hardFloor=Math.max(0,n(state.financePlan?.reserveFloor)||n(profile.reserve?.floor)),targetReserve=Math.max(hardFloor,n(profile.reserve?.target)||baseline.averageExpenses*4),hardGap=Math.max(0,hardFloor-cash),targetGap=Math.max(0,targetReserve-cash);
 let code='XTB_ALLOWED',status='XTB POVOLENO',reserveBudget=0,xtbBudget=planned,reason='Hotovost je nad rezervními branami; plánovaný investiční rozpočet může pokračovat do XTB podle alokace.';
 if(planned<=0){code='NO_BUDGET';status='BEZ NOVÉHO VKLADU';xtbBudget=0;reason='Finance plan nemá nastavený nový investiční rozpočet.'}
 else if(cash<hardFloor){code='CASH_FLOOR';status='STOP NOVÝ XTB VKLAD';reserveBudget=planned;xtbBudget=0;reason=`Hotovost je ${Math.round(hardGap).toLocaleString('cs-CZ')} Kč pod tvrdou podlahou. Celý plánovaný vklad nejdřív držet v hotovosti.`}
 else if(cash<targetReserve){code='BUILD_RESERVE';status='DOPLNIT REZERVU';reserveBudget=Math.min(planned,targetGap);xtbBudget=Math.max(0,planned-reserveBudget);reason=xtbBudget>0?'Část plánovaného rozpočtu doplní cílovou rezervu; až přebytek nad ní může do XTB.':'Celý plánovaný rozpočet jde zatím do rezervy, protože 4M cíl ještě není splněný.'}
 return {code,status,cash:round(cash),plannedCzk:round(planned),hardFloor:round(hardFloor),targetReserve:round(targetReserve),hardGap:round(hardGap),targetGap:round(targetGap),reserveBudget:round(reserveBudget),xtbBudget:round(xtbBudget),reason,baseline,autoTrade:false,contract:'ROUTING_PROPOSAL_ONLY'};
}

export const financialDecision32Contract={autoTrade:false,neverMovesMoney:true,usesClosedCashflowHistory:true,tradeHistoryReadOnly:true,hardFloorBeforeXtb:true};
