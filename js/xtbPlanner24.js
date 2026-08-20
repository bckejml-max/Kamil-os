import {xtbBoard} from './live24.js';
import {xtbPortfolioAudit} from './xtbAudit24.js';

const n=v=>Number(v||0);
const round=(v,d=2)=>{const k=10**d;return Math.round(n(v)*k)/k};
const upper=v=>String(v||'').toUpperCase();
const assetName=p=>String(`${p.name||''} ${p.ticker||''}`).toLowerCase();
const isBond=p=>/bond|aggregate|treasury|dluhopis/.test(assetName(p));
const isSectorEtf=p=>upper(p.category)==='ETF'&&/health|tech|energy|financial|sector|semiconductor|nasdaq/.test(assetName(p));
const isBroadEtf=p=>upper(p.category)==='ETF'&&!isBond(p)&&!isSectorEtf(p);
const isStock=p=>upper(p.category)==='STOCK';
const targetWeight=p=>isStock(p)?10:isSectorEtf(p)?12:isBond(p)?15:isBroadEtf(p)?30:12;
const confidence=d=>d.confidence===null||d.confidence===undefined?(d.source==='RUČNĚ'?85:d.source==='ŽIVĚ'?75:55):Math.max(0,Math.min(100,n(d.confidence)));

function destination(board,audit,sourceTicker){
 const candidates=board.filter(x=>x.p.ticker!==sourceTicker);
 const broad=candidates.filter(x=>isBroadEtf(x.p)).sort((a,b)=>n(b.p.value)-n(a.p.value));
 const bonds=candidates.filter(x=>isBond(x.p)).sort((a,b)=>n(b.p.value)-n(a.p.value));
 const buys=candidates.filter(x=>x.d.action==='BUY').sort((a,b)=>n(b.d.priority)-n(a.d.priority));
 if(audit.mix.broadPct<50&&broad[0])return {ticker:broad[0].p.ticker,name:broad[0].p.name||broad[0].p.ticker,reason:'dorovnat široké globální jádro',accountCurrency:broad[0].p.accountCurrency||''};
 if(audit.mix.bondPct<10&&bonds[0])return {ticker:bonds[0].p.ticker,name:bonds[0].p.name||bonds[0].p.ticker,reason:'dorovnat dluhopisovou složku',accountCurrency:bonds[0].p.accountCurrency||''};
 if(buys[0])return {ticker:buys[0].p.ticker,name:buys[0].p.name||buys[0].p.ticker,reason:'nejvyšší aktuální BUY priorita v portfoliu',accountCurrency:buys[0].p.accountCurrency||''};
 if(broad[0])return {ticker:broad[0].p.ticker,name:broad[0].p.name||broad[0].p.ticker,reason:'udržet široké jádro místo zvyšování satelitní koncentrace',accountCurrency:broad[0].p.accountCurrency||''};
 return null;
}

function fxGuidance(p,d,dest){
 const account=String(p.accountCurrency||'').toUpperCase(),quote=String(d.priceCurrency||'').toUpperCase(),destAccount=String(dest?.accountCurrency||'').toUpperCase();
 if(quote&&account&&quote!==account)return `Pozor na FX: živá cena je v ${quote}, pozice je vedena na ${account} účtu. Neprovádět přesun jen kvůli měně; další nákup směrovat do účtu ve vhodné měně, pokud je dostupný.`;
 if(dest&&destAccount&&account&&destAccount!==account)return `Cílová pozice je na ${destAccount} účtu, zdrojová na ${account}. Nepřevádět automaticky; porovnat FX náklad a raději použít nový vklad v cílové měně.`;
 if(account)return `Prostředky mohou zůstat na ${account} účtu; nevytvářet zbytečnou měnovou konverzi.`;
 return 'Měna účtu není v importu spolehlivě určena; před obchodem ji ověřit.';
}

function trimProposal(p,d){
 const value=n(p.value),volume=n(p.volume),weight=n(p.weightPct),target=targetWeight(p);
 if(d.trimQty||d.trimAmount)return {qty:d.trimQty?round(d.trimQty,4):null,amount:d.trimAmount?n(d.trimAmount):null,method:'ŽIVÁ / RUČNÍ intelligence'};
 if(upper(d.action)==='SELL')return {qty:volume?round(volume,4):null,amount:value||null,method:'Celý exit podle verdiktu'};
 let share=.25;
 if(weight>target&&weight>0)share=Math.max(.20,Math.min(.60,(weight-target)/weight));
 return {qty:volume?round(volume*share,4):null,amount:value?Math.round(value*share):null,method:weight>target?`Redukce směrem k cca ${target} % váze`:'Konzervativní 25% redukce pozice'};
}

function buyProposal(item,s,board,audit){
 const planned=Math.max(0,n(s.financePlan?.plannedInvestment));
 if(item.d.buyAmount)return {amount:n(item.d.buyAmount),method:'ŽIVÁ / RUČNÍ intelligence'};
 if(!planned)return {amount:null,method:'Chybí plánovaná investice — částku nevymýšlím'};
 const buys=board.filter(x=>x.d.action==='BUY');
 const denominator=Math.max(1,buys.length);
 let share=1/denominator;
 if(isBroadEtf(item.p)&&audit.mix.broadPct<50)share=Math.max(share,.5);
 if(isBond(item.p)&&audit.mix.bondPct<10)share=Math.max(share,.25);
 return {amount:Math.round(Math.min(planned,planned*share)),method:'Rozdělení z plánované investice podle alokační mezery'};
}

export function xtbTradePlanner(s){
 const board=xtbBoard(s),audit=xtbPortfolioAudit(s),plans=[];
 for(const item of board){
  const {p,d}=item,action=upper(d.action),dest=destination(board,audit,p.ticker);
  if(['TRIM','SELL'].includes(action)){
   const proposal=trimProposal(p,d);
   plans.push({ticker:p.ticker,name:p.name||p.ticker,action,priority:n(d.priority),confidence:confidence(d),qty:proposal.qty,amount:proposal.amount,currency:p.accountCurrency||'',method:proposal.method,destination:dest,fx:fxGuidance(p,d,dest),reason:d.reason||'',when:d.when||'',source:d.source||'AUTO'});
  }else if(action==='BUY'){
   const proposal=buyProposal(item,s,board,audit);
   plans.push({ticker:p.ticker,name:p.name||p.ticker,action,priority:n(d.priority),confidence:confidence(d),qty:null,amount:proposal.amount,currency:p.accountCurrency||'',method:proposal.method,destination:null,fx:fxGuidance(p,d,null),reason:d.reason||'',when:d.when||'',source:d.source||'AUTO'});
  }else if(action==='REVIEW'&&n(d.priority)>=80){
   plans.push({ticker:p.ticker,name:p.name||p.ticker,action,priority:n(d.priority),confidence:confidence(d),qty:null,amount:null,currency:p.accountCurrency||'',method:'Neobchodovat, dokud není znovu potvrzena teze',destination:null,fx:fxGuidance(p,d,null),reason:d.reason||'',when:d.when||'',source:d.source||'AUTO'});
  }
 }
 plans.sort((a,b)=>b.priority-a.priority);
 const reductions=plans.filter(x=>['TRIM','SELL'].includes(x.action));
 const reductionByCurrency=reductions.reduce((out,x)=>{if(!x.amount)return out;const currency=String(x.currency||'NEZNÁMÁ').toUpperCase();out[currency]=(out[currency]||0)+n(x.amount);return out},{});
 const currencies=Object.keys(reductionByCurrency);
 const knownReduction=currencies.length===1?reductionByCurrency[currencies[0]]:null;
 const top=plans[0]||null;
 let summary='Není tu žádný obchod, který by planner považoval za nutný. Držet plán a čekat na čerstvější signál.';
 if(top)summary=`Nejvyšší priorita: ${top.ticker} — ${top.action}. ${top.method}.`;
 return {plans,top,audit,knownReduction,reductionByCurrency,currencies,summary,generatedAt:new Date().toISOString(),note:'Planner pouze převádí aktuální verdikty a alokační audit do návrhu velikosti kroku. Neprovádí obchody a při chybějících datech částku raději neurčí.'};
}
