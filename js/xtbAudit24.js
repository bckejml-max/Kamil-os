import {xtbBoard} from './live24.js';
import {marketFxRate32} from './marketQuoteIngest32.js';

const n=v=>Number(v||0);
const pct=(v,total)=>total>0?v/total*100:0;
const round=v=>Math.round(v*10)/10;
const upper=v=>String(v||'').trim().toUpperCase();
const name=p=>String(`${p.name||''} ${p.ticker||''}`).toLowerCase();
const isBond=p=>/bond|aggregate|treasury|dluhopis/.test(name(p));
const isSectorEtf=p=>upper(p.category)==='ETF'&&/health|tech|energy|financial|sector|semiconductor|nasdaq/.test(name(p));
const isBroadEtf=p=>upper(p.category)==='ETF'&&!isBond(p)&&!isSectorEtf(p);
const isStock=p=>upper(p.category)==='STOCK';
const theme=(p,rx)=>rx.test(name(p));

function normalizedRow(p){
 const currency=upper(p.accountCurrency||p.currency||'CZK'),raw=n(p.value);
 if(currency==='CZK')return {p,currency,raw,czkValue:raw,rate:1,complete:true,fx:null};
 const fx=marketFxRate32(currency,'CZK');
 return fx?{p,currency,raw,czkValue:raw*fx.rate,rate:fx.rate,complete:true,fx}:{p,currency,raw,czkValue:null,rate:null,complete:false,fx:null};
}

export function xtbPortfolioAudit(s){
 const positions=xtbBoard(s).map(x=>x.p),rows=positions.map(normalizedRow),known=rows.filter(x=>x.complete),missing=[...new Set(rows.filter(x=>!x.complete).map(x=>x.currency))],valuationComplete=missing.length===0,total=known.reduce((a,x)=>a+n(x.czkValue),0);
 const valueOf=fn=>known.filter(x=>fn(x.p)).reduce((a,x)=>a+n(x.czkValue),0);
 const broad=valueOf(isBroadEtf),bond=valueOf(isBond),sectorEtf=valueOf(isSectorEtf),stocks=valueOf(isStock),satellites=Math.max(0,total-broad-bond);
 const sorted=[...known].sort((a,b)=>n(b.czkValue)-n(a.czkValue)),largestRow=sorted[0]||null,largest=largestRow?.p||null,largestPct=largestRow?round(pct(n(largestRow.czkValue),total)):0;
 const health=valueOf(p=>theme(p,/novo|eli lilly|lly|abbot|abbott|health care|healthcare|xdwh/)),chips=valueOf(p=>theme(p,/tsmc|broadcom|semiconductor|chip|1yd/));
 const mix={broadPct:round(pct(broad,total)),bondPct:round(pct(bond,total)),satellitePct:round(pct(satellites,total)),sectorEtfPct:round(pct(sectorEtf,total)),stockPct:round(pct(stocks,total))};
 const themes=[{label:'Zdravotnictví',pct:round(pct(health,total))},{label:'Čipy / AI',pct:round(pct(chips,total))}].filter(x=>x.pct>0).sort((a,b)=>b.pct-a.pct),risks=[];
 if(!valuationComplete)risks.push({level:'bad',label:'Chybí FX pro úplný audit',detail:`Nelze bezpečně sečíst účty v měnách: ${missing.join(', ')}. Obnov veřejné tržní ceny; do té doby nedávám přesný alokační verdikt.`});
 if(valuationComplete&&mix.broadPct<50)risks.push({level:'warn',label:'Globální jádro je pod 50 %',detail:`Široké akciové ETF tvoří přibližně ${mix.broadPct} % XTB portfolia.`});
 if(valuationComplete&&mix.bondPct<10)risks.push({level:'warn',label:'Dluhopisová složka je pod 10 %',detail:`Dluhopisy tvoří přibližně ${mix.bondPct} %.`});
 if(valuationComplete&&largestPct>12)risks.push({level:'bad',label:'Vysoká váha jedné pozice',detail:`${largest?.name||largest?.ticker} tvoří přibližně ${largestPct} %.`});
 if(valuationComplete)for(const t of themes)if(t.pct>20)risks.push({level:'warn',label:`Koncentrace: ${t.label}`,detail:`Známé pozice v tématu tvoří přibližně ${t.pct} % portfolia.`});
 let score=100;score-=Math.max(0,50-mix.broadPct)*0.8;score-=Math.max(0,10-mix.bondPct)*1.2;score-=Math.max(0,largestPct-12)*2;for(const t of themes)score-=Math.max(0,t.pct-20)*1.2;const healthScore=valuationComplete?Math.max(0,Math.min(100,Math.round(score))):null;
 const targetBroad=Math.max(0,55-mix.broadPct),targetBond=Math.max(0,12.5-mix.bondPct);let nextContribution='Nový vklad rozdělit podle cílové alokace; nepřidávat automaticky do převažených témat.';
 if(!valuationComplete)nextContribution=`Přesný plán nového vkladu je blokovaný, dokud není čerstvý FX pro ${missing.join(', ')} → CZK.`;
 else if(targetBroad>5&&targetBond>3)nextContribution='Priorita nového vkladu: široké globální ETF, menší část dluhopisy; jednotlivé akcie až po dorovnání jádra.';
 else if(targetBroad>5)nextContribution='Priorita nového vkladu: široké globální ETF; satelitní akcie teď nenavyšovat jen kvůli krátkodobému poklesu.';
 else if(targetBond>3)nextContribution='Priorita nového vkladu: doplnit dluhopisovou složku; akciové jádro je už blízko cílovému pásmu.';
 else nextContribution='Alokace je blízko cílovým pásmům; nový vklad lze dělit mezi široké jádro a nejlepší konkrétní příležitosti.';
 const currencyBreakdown=Object.values(rows.reduce((o,x)=>{const k=x.currency;o[k]=o[k]||{currency:k,rawValue:0,czkValue:0,complete:true,rateToCzk:x.rate||null};o[k].rawValue+=x.raw;if(x.complete)o[k].czkValue+=n(x.czkValue);else{o[k].complete=false;o[k].czkValue=null}return o},{}));
 return {total,positions:positions.length,valuedPositions:known.length,valuationComplete,missingFx:missing,currencyBreakdown,mix,largest:largestRow?{name:largest.name||largest.ticker,ticker:largest.ticker,pct:largestPct,value:n(largestRow.czkValue)}:null,themes,risks,healthScore,nextContribution,targets:{broad:'50–60 %',bond:'10–15 %',satellite:'25–40 %'},targetMidpoints:{broad:55,bond:12.5}};
}
