import {xtbBoard} from './live24.js';

const n=v=>Number(v||0);
const pct=(v,total)=>total>0?v/total*100:0;
const round=v=>Math.round(v*10)/10;
const name=p=>String(`${p.name||''} ${p.ticker||''}`).toLowerCase();
const isBond=p=>/bond|aggregate|treasury|dluhopis/.test(name(p));
const isSectorEtf=p=>String(p.category||'').toUpperCase()==='ETF'&&/health|tech|energy|financial|sector|semiconductor|nasdaq/.test(name(p));
const isBroadEtf=p=>String(p.category||'').toUpperCase()==='ETF'&&!isBond(p)&&!isSectorEtf(p);
const isStock=p=>String(p.category||'').toUpperCase()==='STOCK';
const theme=(p,rx)=>rx.test(name(p));

export function xtbPortfolioAudit(s){
 const positions=xtbBoard(s).map(x=>x.p),total=positions.reduce((a,p)=>a+n(p.value),0);
 const valueOf=fn=>positions.filter(fn).reduce((a,p)=>a+n(p.value),0);
 const broad=valueOf(isBroadEtf),bond=valueOf(isBond),sectorEtf=valueOf(isSectorEtf),stocks=valueOf(isStock);
 const satellites=Math.max(0,total-broad-bond);
 const sorted=[...positions].sort((a,b)=>n(b.value)-n(a.value));
 const largest=sorted[0]||null,largestPct=largest?round(pct(n(largest.value),total)):0;
 const health=valueOf(p=>theme(p,/novo|eli lilly|lly|abbot|abbott|health care|healthcare|xdwh/));
 const chips=valueOf(p=>theme(p,/tsmc|broadcom|semiconductor|chip|1yd/));
 const mix={broadPct:round(pct(broad,total)),bondPct:round(pct(bond,total)),satellitePct:round(pct(satellites,total)),sectorEtfPct:round(pct(sectorEtf,total)),stockPct:round(pct(stocks,total))};
 const themes=[{label:'Zdravotnictví',pct:round(pct(health,total))},{label:'Čipy / AI',pct:round(pct(chips,total))}].filter(x=>x.pct>0).sort((a,b)=>b.pct-a.pct);
 const risks=[];
 if(mix.broadPct<50)risks.push({level:'warn',label:'Globální jádro je pod 50 %',detail:`Široké akciové ETF tvoří přibližně ${mix.broadPct} % XTB portfolia.`});
 if(mix.bondPct<10)risks.push({level:'warn',label:'Dluhopisová složka je pod 10 %',detail:`Dluhopisy tvoří přibližně ${mix.bondPct} %.`});
 if(largestPct>12)risks.push({level:'bad',label:'Vysoká váha jedné pozice',detail:`${largest?.name||largest?.ticker} tvoří přibližně ${largestPct} %.`});
 for(const t of themes)if(t.pct>20)risks.push({level:'warn',label:`Koncentrace: ${t.label}`,detail:`Známé pozice v tématu tvoří přibližně ${t.pct} % portfolia.`});
 let healthScore=100;
 healthScore-=Math.max(0,50-mix.broadPct)*0.8;
 healthScore-=Math.max(0,10-mix.bondPct)*1.2;
 healthScore-=Math.max(0,largestPct-12)*2;
 for(const t of themes)healthScore-=Math.max(0,t.pct-20)*1.2;
 healthScore=Math.max(0,Math.min(100,Math.round(healthScore)));
 const targetBroad=Math.max(0,55-mix.broadPct),targetBond=Math.max(0,12.5-mix.bondPct);
 let nextContribution='Nový vklad rozdělit podle cílové alokace; nepřidávat automaticky do převažených témat.';
 if(targetBroad>5&&targetBond>3)nextContribution='Priorita nového vkladu: široké globální ETF, menší část dluhopisy; jednotlivé akcie až po dorovnání jádra.';
 else if(targetBroad>5)nextContribution='Priorita nového vkladu: široké globální ETF; satelitní akcie teď nenavyšovat jen kvůli krátkodobému poklesu.';
 else if(targetBond>3)nextContribution='Priorita nového vkladu: doplnit dluhopisovou složku; akciové jádro je už blízko cílovému pásmu.';
 else nextContribution='Alokace je blízko cílovým pásmům; nový vklad lze dělit mezi široké jádro a nejlepší konkrétní příležitosti.';
 return {total,positions:positions.length,mix,largest:largest?{name:largest.name||largest.ticker,ticker:largest.ticker,pct:largestPct,value:n(largest.value)}:null,themes,risks,healthScore,nextContribution,targets:{broad:'50–60 %',bond:'10–15 %',satellite:'25–40 %'}};
}
