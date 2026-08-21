import {netWorthFxRate} from './netWorth29.js';
import {rebalancePositions,classifyRebalancePosition,rebalanceTargets,REBALANCE_LABELS} from './portfolioRebalancer29.js';
import {moneyRouter32} from './financialDecision32.js';

const n=v=>Number.isFinite(Number(v))?Number(v):0;
const ccy=v=>String(v||'CZK').toUpperCase();
const round=v=>Math.round(n(v)*100)/100;
const active=x=>!['ARCHIVED','CLOSED','SOLD'].includes(String(x?.status||'ACTIVE').toUpperCase())&&n(x?.value)>0;
const BUCKETS=['broad','bond','satellite'];
const LABELS={...REBALANCE_LABELS,alternative:'Alternativy / real estate'};

function externalBucket(x){
 const explicit=String(x?.allocationClass||'').toLowerCase();
 if(BUCKETS.includes(explicit))return explicit;
 const text=`${x?.title||''} ${x?.instrument||''} ${x?.isin||''}`.toLowerCase();
 if(/s&p\s*500|msci world|all[- ]?world|ftse|global|core.*etf|index/.test(text))return 'broad';
 if(/bond|dluhopis|treasury|aggregate/.test(text))return 'bond';
 if(/real estate|nemovit|reit/.test(text))return 'alternative';
 return 'satellite';
}
function convert(s,value,from,to){const rate=netWorthFxRate(s,from,to);return rate===null?{ok:false,rate:null,value:null}:{ok:true,rate,value:n(value)*rate}}

export function totalInvestmentPortfolio34(s={}){
 const baseCurrency=ccy(s.financePlan?.currency||'CZK'),rows=[],missing=[];
 for(const p of rebalancePositions(s)){
  const x=convert(s,p.value,p.accountCurrency,baseCurrency);if(!x.ok)missing.push(p.accountCurrency);
  rows.push({id:`xtb:${p.accountId}:${p.ticker}`,source:'XTB',provider:'XTB',accountId:p.accountId,ticker:p.ticker,name:p.name||p.ticker,currency:ccy(p.accountCurrency),nativeValue:n(p.value),baseValue:x.value,fx:x.rate,bucket:classifyRebalancePosition(p,s),category:p.category||null,position:p});
 }
 for(const x of s.netWorthBook?.items||[]){
  if(!active(x)||String(x.side||'ASSET').toUpperCase()==='LIABILITY'||String(x.kind||'').toUpperCase()!=='INVESTMENT')continue;
  const cv=convert(s,x.value,x.currency||baseCurrency,baseCurrency);if(!cv.ok)missing.push(ccy(x.currency));
  rows.push({id:`external:${x.id}`,source:'EXTERNAL',provider:x.provider||'Mimo XTB',accountId:x.accountType||null,ticker:x.isin||null,name:x.title||x.instrument||'Investice mimo XTB',currency:ccy(x.currency||baseCurrency),nativeValue:n(x.value),baseValue:cv.value,fx:cv.rate,bucket:externalBucket(x),category:x.accountType||null,position:x,monthlyContributionCzk:n(x.monthlyContributionCzk)});
 }
 const missingCurrencies=[...new Set(missing)].sort(),complete=missingCurrencies.length===0,known=rows.filter(x=>x.baseValue!==null),total=known.reduce((z,x)=>z+n(x.baseValue),0),coreRows=known.filter(x=>BUCKETS.includes(x.bucket)),coreTotal=coreRows.reduce((z,x)=>z+n(x.baseValue),0),alternativeTotal=known.filter(x=>x.bucket==='alternative').reduce((z,x)=>z+n(x.baseValue),0),targets=rebalanceTargets(s);
 const buckets={};for(const key of [...BUCKETS,'alternative']){const value=known.filter(x=>x.bucket===key).reduce((z,x)=>z+n(x.baseValue),0);buckets[key]={key,label:LABELS[key],value:round(value),pctOfTotal:total>0?round(value/total*100):0,pct:BUCKETS.includes(key)&&coreTotal>0?round(value/coreTotal*100):key==='alternative'&&total>0?round(value/total*100):0,targetPct:BUCKETS.includes(key)?n(targets[key]):null}}
 const providers=Object.values(known.reduce((map,x)=>{const k=x.provider||x.source;map[k]=map[k]||{provider:k,value:0,positions:0};map[k].value+=n(x.baseValue);map[k].positions++;return map},{})).map(x=>({...x,value:round(x.value),pct:total>0?round(x.value/total*100):0})).sort((a,b)=>b.value-a.value);
 const broadExternal=known.filter(x=>x.source==='EXTERNAL'&&x.bucket==='broad').reduce((z,x)=>z+n(x.baseValue),0),recurringExternalCzk=rows.filter(x=>x.source==='EXTERNAL').reduce((z,x)=>z+n(x.monthlyContributionCzk),0);
 const drift=complete&&coreTotal>0?round(BUCKETS.reduce((z,k)=>z+Math.abs(buckets[k].pct-n(targets[k])),0)/2):null;
 return {ok:rows.length>0,complete,baseCurrency,rows,total:round(total),coreTotal:round(coreTotal),alternativeTotal:round(alternativeTotal),buckets,targets,providers,missingCurrencies,positionCount:rows.length,xtbCount:rows.filter(x=>x.source==='XTB').length,externalCount:rows.filter(x=>x.source==='EXTERNAL').length,broadExternal:round(broadExternal),recurringExternalCzk:round(recurringExternalCzk),driftPct:drift,note:'Strategická alokace broad/bond/satellite se počítá přes XTB i investice mimo XTB. Alternativy (např. real estate) jsou zahrnuté do celkové hodnoty, ale nejsou násilně vmáčknuté do akciově-dluhopisového cíle.'};
}

function projectToSimplex(desired,total){
 const keys=Object.keys(desired),u=keys.map(k=>n(desired[k])).sort((a,b)=>b-a);let rho=0,cum=0,theta=0;
 for(let j=0;j<u.length;j++){cum+=u[j];const t=(cum-total)/(j+1);if(u[j]-t>0){rho=j+1;theta=t}}
 if(!rho)return Object.fromEntries(keys.map(k=>[k,0]));
 cum=u.slice(0,rho).reduce((a,b)=>a+b,0);theta=(cum-total)/rho;
 const out=Object.fromEntries(keys.map(k=>[k,Math.max(0,n(desired[k])-theta)])),sum=Object.values(out).reduce((a,b)=>a+b,0),diff=total-sum;
 if(Math.abs(diff)>1e-7){const key=keys.slice().sort((a,b)=>out[b]-out[a])[0];out[key]=Math.max(0,out[key]+diff)}
 return out;
}
function candidateFor(bucket,portfolio,s){
 const rows=portfolio.rows.filter(x=>x.source==='XTB'&&x.bucket===bucket&&x.baseValue>0),preferred=s.xtbStrategy?.rebalancePreferred?.[bucket];
 if(preferred){const hit=rows.find(x=>x.ticker===preferred);if(hit)return {...hit,preferred:true}}
 if(bucket==='satellite'&&rows.length!==1)return null;
 return rows.sort((a,b)=>b.baseValue-a.baseValue||String(a.ticker).localeCompare(String(b.ticker)))[0]||null;
}

export function monthlyInvestmentPlan34(s={},budgetCzk=null){
 const portfolio=totalInvestmentPortfolio34(s),budget=Math.max(0,n(budgetCzk??s.financePlan?.plannedInvestment??25000)),routing=moneyRouter32({...s,financePlan:{...(s.financePlan||{}),plannedInvestment:budget}});
 if(!portfolio.ok)return {ok:false,code:'NO_PORTFOLIO',message:'Nejsou dostupné investice pro společný plán.',budget,routing,portfolio};
 if(!portfolio.complete)return {ok:false,code:'MISSING_FX',message:`Chybí FX pro ${portfolio.missingCurrencies.join(', ')} → ${portfolio.baseCurrency}.`,budget,routing,portfolio};
 if(routing.xtbBudget<=0)return {ok:false,code:routing.code,message:routing.reason,budget,routing,portfolio,trades:[]};
 const externalContrib=Object.fromEntries(BUCKETS.map(k=>[k,0]));
 for(const x of portfolio.rows.filter(x=>x.source==='EXTERNAL'&&BUCKETS.includes(x.bucket)))externalContrib[x.bucket]+=n(x.monthlyContributionCzk);
 const current=Object.fromEntries(BUCKETS.map(k=>[k,n(portfolio.buckets[k].value)])),afterRecurring=Object.fromEntries(BUCKETS.map(k=>[k,current[k]+externalContrib[k]])),coreAfterRecurring=Object.values(afterRecurring).reduce((a,b)=>a+b,0),xtbBudget=n(routing.xtbBudget),finalTotal=coreAfterRecurring+xtbBudget,targetAmounts=Object.fromEntries(BUCKETS.map(k=>[k,finalTotal*n(portfolio.targets[k])/100])),desired=Object.fromEntries(BUCKETS.map(k=>[k,targetAmounts[k]-afterRecurring[k]])),allocation=projectToSimplex(desired,xtbBudget),after=Object.fromEntries(BUCKETS.map(k=>[k,afterRecurring[k]+allocation[k]]));
 const trades=[];for(const k of BUCKETS){const amount=allocation[k];if(amount<1)continue;const c=candidateFor(k,portfolio,s);if(!c){trades.push({bucket:k,label:LABELS[k],baseAmount:round(amount),baseCurrency:portfolio.baseCurrency,requiresChoice:true,ticker:null,name:null,reason:k==='satellite'?'Satelitní část nerozděluji mezi jednotlivé akcie bez explicitní preference.':'V XTB zatím není existující pozice této třídy.'});continue}const native=amount/n(c.fx||1);trades.push({bucket:k,label:LABELS[k],baseAmount:round(amount),baseCurrency:portfolio.baseCurrency,nativeAmount:round(native),nativeCurrency:c.currency,ticker:c.ticker,name:c.name,accountId:c.accountId,requiresChoice:false,preferred:!!c.preferred,reason:`Celková váha ${LABELS[k].toLowerCase()} je ${portfolio.buckets[k].pct.toFixed(1)} % proti cíli ${n(portfolio.targets[k]).toFixed(1)} %; plán už zohledňuje Efektu a další investice mimo XTB.`})}
 const beforeDrift=portfolio.driftPct,afterPct=Object.fromEntries(BUCKETS.map(k=>[k,finalTotal>0?after[k]/finalTotal*100:0])),afterDrift=round(BUCKETS.reduce((z,k)=>z+Math.abs(afterPct[k]-n(portfolio.targets[k])),0)/2);
 return {ok:true,code:'OK',budget:round(budget),routing,portfolio,externalRecurring:{totalCzk:round(Object.values(externalContrib).reduce((a,b)=>a+b,0)),byBucket:Object.fromEntries(BUCKETS.map(k=>[k,round(externalContrib[k])]))},xtbBudget:round(xtbBudget),trades,beforeDriftPct:beforeDrift,afterDriftPct:afterDrift,improvementPct:beforeDrift===null?null:round(Math.max(0,beforeDrift-afterDrift)),afterPct:Object.fromEntries(BUCKETS.map(k=>[k,round(afterPct[k])])),note:'Efekta a další pravidelné investice se nejdřív promítnou do očekávané alokace. Teprve potom se rozděluje nový XTB rozpočet. Jde o návrh; Kamil OS peníze ani obchody automaticky neprovádí.'};
}

export function investmentSnapshot34(s={},now=new Date()){
 const p=totalInvestmentPortfolio34(s);if(!p.complete||!p.ok)return null;let xtb=0,external=0,profit=0,profitKnown=false;
 for(const [id,a] of Object.entries(s.xtbHub?.accounts||{})){const cv=convert(s,a.value,a.currency||'CZK',p.baseCurrency);if(cv.ok)xtb+=n(cv.value);if(Number.isFinite(Number(a.profit))){const pv=convert(s,a.profit,a.currency||'CZK',p.baseCurrency);if(pv.ok){profit+=n(pv.value);profitKnown=true}}}
 for(const x of p.rows.filter(x=>x.source==='EXTERNAL'))external+=n(x.baseValue);
 let externalCost=0,externalCostKnown=0;for(const x of p.rows.filter(x=>x.source==='EXTERNAL')){const cb=Number(x.position?.costBasis);if(Number.isFinite(cb)&&cb>0){const cv=convert(s,cb,x.currency,p.baseCurrency);if(cv.ok){externalCost+=cv.value;externalCostKnown++}}}
 let dividends=0,dividendCount=0;for(const t of s.tradeJournal?.trades||[]){if(!/DIVIDEND|DIVIDENDA/.test(String(t.kind||'').toUpperCase()))continue;const amount=Number(t.realized??t.amount);if(!Number.isFinite(amount))continue;const cv=convert(s,amount,t.currency||p.baseCurrency,p.baseCurrency);if(cv.ok){dividends+=cv.value;dividendCount++}}
 const knownInvested=profitKnown?Math.max(0,xtb-profit)+(externalCostKnown?externalCost:0):externalCostKnown?externalCost:null;
 return {id:`investment-${new Date(now).toISOString().slice(0,10)}`,at:new Date(now).toISOString(),date:new Date(now).toISOString().slice(0,10),currency:p.baseCurrency,total:round(p.total),xtb:round(xtb),external:round(external),knownProfit:profitKnown?round(profit):null,knownInvested:knownInvested===null?null:round(knownInvested),dividends:round(dividends),dividendCount,externalCostCoverage:externalCostKnown,positions:p.positionCount};
}

export function upsertInvestmentSnapshot34(s,now=new Date()){
 s.investmentBook=s.investmentBook||{history:[]};s.investmentBook.history=Array.isArray(s.investmentBook.history)?s.investmentBook.history:[];const snap=investmentSnapshot34(s,now);if(!snap)return null;const i=s.investmentBook.history.findIndex(x=>String(x.date||x.at||'').slice(0,10)===snap.date);if(i>=0)s.investmentBook.history[i]=snap;else s.investmentBook.history.unshift(snap);s.investmentBook.history=s.investmentBook.history.sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,730);return snap;
}
