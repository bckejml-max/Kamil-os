import {moneyRouter32,tradeOutcomeSummary32,cashflowBaseline32} from './financialDecision32.js';
import {xtbBoard,xtbDataAge} from './live24.js';
import {ticketEventMarketIntel32} from './ticketMarketIntel32.js';

const n=v=>Number(v||0),upper=v=>String(v||'').trim().toUpperCase(),clamp=v=>Math.max(0,Math.min(100,Math.round(n(v))));
const XTB_ACTIONS=new Set(['BUY','TRIM','SELL','REVIEW']);
const actionLabel=a=>({BUY:'Přikoupit',TRIM:'Redukovat',SELL:'Prodat',REVIEW:'Prověřit'}[upper(a)]||upper(a));
const ticketLabel=a=>({SELL_WINDOW:'Sell-by',SET_LIST:'Nastavit cenu',REPRICE:'Přecenit',CHECK_MARKET:'Obnovit market',TRANSFER_REVIEW:'Prověřit transfer',LIST:'Vystavit',HOLD_LISTING:'Držet listing'}[upper(a)]||upper(a));

export function dailyProfitBrief32(state={},now=new Date()){
 const router=moneyRouter32(state),cashflow=cashflowBaseline32(state),trades=tradeOutcomeSummary32(state),xtbAge=xtbDataAge(state),xtb=xtbBoard(state).filter(x=>XTB_ACTIONS.has(upper(x.d?.action))).sort((a,b)=>n(b.d?.priority)-n(a.d?.priority)),tickets=ticketEventMarketIntel32(state,now),actions=[];
 if(router.code==='CASH_FLOOR')actions.push({id:'money-floor',domain:'Peníze',target:'money',priority:100,action:'Doplnit hotovost',title:'Nový XTB vklad je teď zastavený',detail:router.reason,amountCzk:router.reserveBudget});
 else if(router.code==='BUILD_RESERVE')actions.push({id:'money-reserve',domain:'Peníze',target:'money',priority:96,action:'Doplnit rezervu',title:'Rezerva má přednost před XTB',detail:router.reason,amountCzk:router.reserveBudget});
 else if(router.xtbBudget>0)actions.push({id:'money-xtb',domain:'Peníze',target:'money',priority:72,action:'Připravit XTB vklad',title:`Pro XTB je dostupný rozpočet ${Math.round(router.xtbBudget).toLocaleString('cs-CZ')} Kč`,detail:'Přesné rozdělení najdeš ve Financial Command; obchod se neodesílá automaticky.',amountCzk:router.xtbBudget});
 for(const x of xtb.slice(0,4))actions.push({id:`xtb-${x.p?.ticker||''}`,domain:'XTB',target:'money',priority:clamp(x.d?.priority),action:actionLabel(x.d?.action),title:`${x.p?.ticker||''} · ${x.p?.name||''}`.trim(),detail:x.d?.execution?.blocked?x.d.execution.blockReason:(x.d?.reason||x.d?.when||''),ticker:x.p?.ticker||null});
 for(const e of tickets.events.slice(0,4))actions.push({id:`ticket-${e.key}`,domain:'Vstupenky',target:'tickets',priority:clamp(e.priority),action:ticketLabel(e.topAction),title:e.name,detail:e.nextAction||'',eventKey:e.key,qty:e.qty});
 actions.sort((a,b)=>b.priority-a.priority||String(a.domain).localeCompare(String(b.domain),'cs'));
 const urgent=actions.filter(x=>x.priority>=90),top=actions[0]||null;
 const headline=top?`${top.domain}: ${top.action}`:'Dnes není potřeba vyrábět finanční akci';
 const data={xtb:{fresh:!xtbAge.stale,label:xtbAge.label,asOf:state.xtbHub?.asOf||state.xtbReport?.asOf||null},cashflow:{months:cashflow.months,averageExpenses:cashflow.averageExpenses,averageSurplus:cashflow.averageSurplus,lastMonth:cashflow.history.at(-1)?.month||null},tickets:{events:tickets.totalEvents,freshMarketPct:tickets.rows.length?Math.round(tickets.rows.filter(x=>x.marketFresh).length/tickets.rows.length*100):100,needsMarket:tickets.needsMarket}};
 return {generatedAt:new Date(now).toISOString(),headline,top,actions:actions.slice(0,6),urgentCount:urgent.length,router,trades:{count:trades.trades,realizedTotal:trades.realizedTotal,hitRate:trades.hitRate},data,contract:'READ_ONLY_DAILY_BRIEF',autoTrade:false,autoPrice:false,neverMovesMoney:true};
}

export const dailyProfitBrief32Contract={readOnly:true,autoTrade:false,autoPrice:false,neverMovesMoney:true,maxVisibleActions:6,domains:['Peníze','XTB','Vstupenky']};
