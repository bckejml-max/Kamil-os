import {xtbBoard,xtbDataAge} from './live24.js';
import {ticketMarketBrain34} from './ticketBrain34.js';

const upper=v=>String(v||'').toUpperCase();
const tone=p=>Number(p)>=90?'bad':Number(p)>=75?'warn':'good';
const label=a=>({BUY:'PŘIKOUPIT',TRIM:'ZMENŠIT',SELL:'PRODAT',REVIEW:'PROVĚŘIT',HOLD:'DRŽET',VERIFY_DATA:'OPRAVIT DATA',SELL_NOW:'PRODAT TEĎ',REPRICE:'ZLEVNIT',LIST_NOW:'VYSTAVIT',CHECK_MARKET:'OBNOVIT TRH'})[upper(a)]||upper(a)||'PROVĚŘIT';

function xtbRows36(state={}){
 const age=xtbDataAge(state),fresh=age?.days!==null&&age.days<=2;
 return xtbBoard(state).map(({p,d})=>{
  const action=upper(d?.action||'HOLD'),blocked=!!d?.execution?.blocked||!fresh,actionable=['BUY','TRIM','SELL','REVIEW'].includes(action);
  if(!actionable&&!blocked)return null;
  const priority=blocked&&['BUY','TRIM','SELL'].includes(action)?Math.max(96,Number(d?.priority||0)):Number(d?.priority||0);
  return {id:`xtb:${p?.ticker||p?.name||'position'}`,domain:'XTB',target:'money',title:`${p?.ticker||p?.name||'Pozice'} · ${blocked&&action!=='REVIEW'?'OBNOVIT DATA':label(action)}`,action:blocked&&action!=='REVIEW'?'REFRESH_XTB':action,priority,tone:tone(priority),reason:blocked?(d?.execution?.blockReason||'XTB data nejsou dost čerstvá pro bezpečné provedení obchodu. Nejdřív obnov import účtu.'):(d?.reason||d?.when||'Pozice vyžaduje kontrolu.'),detail:d?.execution?.label||null,blocked,autoExecute:false};
 }).filter(Boolean);
}

function ticketRows36(state={},now=new Date()){
 return ticketMarketBrain34(state,now).rows.filter(x=>x.priority>=80&&x.action!=='HOLD').map(x=>({id:`ticket:${x.ticketId}`,domain:'VSTUPENKY',target:'tickets',title:`${x.eventName} · ${label(x.action)}`,action:x.action,priority:Number(x.priority||0),tone:tone(x.priority),reason:x.reason,detail:x.suggestedPrice?`Navržená cena ${Math.round(x.suggestedPrice).toLocaleString('cs-CZ')} Kč / ks`:null,blocked:false,autoExecute:false}));
}

export function decisionCenter36(state={},now=new Date()){
 const rows=[...xtbRows36(state),...ticketRows36(state,now)].sort((a,b)=>b.priority-a.priority||a.title.localeCompare(b.title,'cs-CZ')).slice(0,8).map((x,i)=>({...x,rank:i+1}));
 const counts={critical:rows.filter(x=>x.priority>=90).length,blocked:rows.filter(x=>x.blocked).length,xtb:rows.filter(x=>x.domain==='XTB').length,tickets:rows.filter(x=>x.domain==='VSTUPENKY').length};
 return {rows,counts,top:rows[0]||null,generatedAt:new Date(now).toISOString(),contract:{autoTrade:false,autoReprice:false,proposalOnly:true},note:'Decision Center řadí konkrétní investiční a ticketové zásahy do jedné fronty. Nic samo nekupuje, neprodává ani nepřecenňuje. Pokud jsou XTB data stará, obchodní návrh je blokovaný do nového importu.'};
}
