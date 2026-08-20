import {netWorthFxRate} from './netWorth29.js';

export const REBALANCE_BUCKETS=['broad','bond','satellite'];
export const DEFAULT_REBALANCE_TARGETS={broad:55,bond:12.5,satellite:32.5};
export const REBALANCE_LABELS={broad:'Široké ETF',bond:'Dluhopisy',satellite:'Satelity'};

const n=v=>Number(v||0);
const ccy=v=>String(v||'CZK').toUpperCase();
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const round2=v=>Math.round((Number(v)||0)*100)/100;
const active=p=>p&&p.sold!==true&&!['SOLD','CLOSED','ARCHIVED'].includes(String(p.status||'ACTIVE').toUpperCase())&&n(p.value)>0;
const posName=p=>norm(`${p.name||''} ${p.ticker||p.symbol||''}`);
const isBond=p=>/bond|aggregate|treasury|dluhopis|government|govt/.test(posName(p));
const isSectorEtf=p=>String(p.category||'').toUpperCase()==='ETF'&&/health|tech|energy|financial|sector|semiconductor|nasdaq|robot|ai |clean energy|water/.test(posName(p));

export function normalizeAllocationClass(v){
 const x=norm(v).replace(/[_\s]+/g,'-');
 if(['broad','broad-etf','core','core-etf','etf'].includes(x))return 'broad';
 if(['bond','bonds','dluhopis','dluhopisy','fixed-income'].includes(x))return 'bond';
 if(['satellite','satellites','satelit','satelity','stock','stocks','sector','thematic'].includes(x))return 'satellite';
 return null;
}
export function classifyRebalancePosition(p,s={}){
 const ticker=p?.ticker||p?.symbol||'',override=s.xtbStrategy?.allocationOverrides?.[ticker],explicit=normalizeAllocationClass(override||p?.allocationClass||p?.allocation);
 if(explicit)return explicit;
 if(isBond(p))return 'bond';
 if(String(p?.category||'').toUpperCase()==='ETF'&&!isSectorEtf(p))return 'broad';
 return 'satellite';
}
function closedByNewerUserAction(s,ticker){
 const raw=s.xtbStrategy?.closedTickers?.[ticker];if(!raw)return false;
 const closedAt=new Date(typeof raw==='string'?raw:raw.at||0).getTime();if(!Number.isFinite(closedAt))return false;
 const importAt=new Date(s.xtbHub?.asOf||s.xtbReport?.asOf||s.xtbHub?.updatedAt||0).getTime();
 return !Number.isFinite(importAt)||importAt<=closedAt;
}
export function rebalancePositions(s={}){
 const accounts=s.xtbHub?.accounts||s.xtbHub?.report?.accounts||{},out=[];
 for(const [accountId,a] of Object.entries(accounts))for(const p of a?.positions||[]){const ticker=p?.ticker||p?.symbol||'';if(!active(p)||closedByNewerUserAction(s,ticker))continue;out.push({...p,ticker,accountId,accountCurrency:ccy(a.currency||p.currency||'CZK')})}
 return out;
}
export function rebalanceTargets(s={},override=null){
 const raw=override||s.xtbStrategy?.rebalanceTargets||DEFAULT_REBALANCE_TARGETS,out={};for(const k of REBALANCE_BUCKETS)out[k]=Math.max(0,n(raw?.[k]));return out;
}
export function validateRebalanceTargets(targets){
 const values=REBALANCE_BUCKETS.map(k=>n(targets?.[k])),sum=values.reduce((a,b)=>a+b,0),ok=values.every(v=>Number.isFinite(v)&&v>=0&&v<=100)&&Math.abs(sum-100)<=0.05;
 return {ok,sum:round2(sum),message:ok?'OK':`Cílová alokace musí dát 100 %. Teď dává ${round2(sum)} %.`};
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
function drift(byBucket,total,targets){
 if(total<=0)return 0;return REBALANCE_BUCKETS.reduce((sum,k)=>sum+Math.abs((n(byBucket[k])/total*100)-n(targets[k])),0)/2;
}
function candidateFor(bucket,positions,s){
 const rows=positions.filter(x=>x.bucket===bucket),preferred=s.xtbStrategy?.rebalancePreferred?.[bucket];
 if(preferred){const hit=rows.find(x=>x.ticker===preferred);if(hit)return {...hit,preferred:true}}
 if(bucket==='satellite'&&rows.length!==1)return null;
 return rows.slice().sort((a,b)=>b.baseValue-a.baseValue||String(a.ticker).localeCompare(String(b.ticker)))[0]||null;
}
function importedUnitPrice(p){const qty=n(p.quantity??p.qty);return qty>0&&n(p.value)>0?n(p.value)/qty:null}
function emptyResult(code,message,currency,targets,targetValidation,extra={}){return {ok:false,code,message,currency,targets,targetValidation,currentTotal:0,contribution:0,byBucket:{},trades:[],...extra}}

export function portfolioRebalancePlan(s={},opts={}){
 const currency=ccy(opts.currency||s.financePlan?.currency||'CZK'),contribution=n(opts.contribution),targets=rebalanceTargets(s,opts.targets),targetValidation=validateRebalanceTargets(targets);
 if(!targetValidation.ok)return emptyResult('INVALID_TARGETS',targetValidation.message,currency,targets,targetValidation,{contribution:Math.max(0,contribution)});
 if(!Number.isFinite(contribution)||contribution<=0)return emptyResult('INVALID_CONTRIBUTION','Zadej kladnou částku nového vkladu.',currency,targets,targetValidation);
 const raw=rebalancePositions(s);if(!raw.length)return emptyResult('NO_POSITIONS','V XTB nejsou aktivní pozice, podle kterých lze rebalancovat.',currency,targets,targetValidation,{contribution});
 const missing=[],positions=[];
 for(const p of raw){const rate=netWorthFxRate(s,p.accountCurrency,currency);if(rate===null){missing.push({ticker:p.ticker,currency:p.accountCurrency});continue}positions.push({...p,bucket:classifyRebalancePosition(p,s),fxToBase:rate,baseValue:n(p.value)*rate})}
 if(missing.length)return emptyResult('MISSING_FX',`Chybí skutečný FX kurz pro ${[...new Set(missing.map(x=>x.currency))].join(', ')} → ${currency}. Bez něj plán nevyrábím.`,currency,targets,targetValidation,{contribution,missingFx:missing});
 const current=Object.fromEntries(REBALANCE_BUCKETS.map(k=>[k,0]));for(const p of positions)current[p.bucket]+=p.baseValue;
 const currentTotal=Object.values(current).reduce((a,b)=>a+b,0),finalTotal=currentTotal+contribution,targetAmounts=Object.fromEntries(REBALANCE_BUCKETS.map(k=>[k,finalTotal*targets[k]/100])),desired=Object.fromEntries(REBALANCE_BUCKETS.map(k=>[k,targetAmounts[k]-current[k]])),allocation=projectToSimplex(desired,contribution),after=Object.fromEntries(REBALANCE_BUCKETS.map(k=>[k,current[k]+allocation[k]]));
 const byBucket={};for(const k of REBALANCE_BUCKETS)byBucket[k]={key:k,label:REBALANCE_LABELS[k],targetPct:targets[k],currentValue:round2(current[k]),currentPct:currentTotal>0?round2(current[k]/currentTotal*100):0,buyAmount:round2(allocation[k]),afterValue:round2(after[k]),afterPct:finalTotal>0?round2(after[k]/finalTotal*100):0,targetValue:round2(targetAmounts[k]),residualValue:round2(after[k]-targetAmounts[k])};
 const trades=[];for(const k of REBALANCE_BUCKETS){const baseAmount=allocation[k];if(baseAmount<0.01)continue;const candidate=candidateFor(k,positions,s);if(!candidate){trades.push({bucket:k,label:REBALANCE_LABELS[k],ticker:null,baseAmount:round2(baseAmount),baseCurrency:currency,nativeAmount:null,nativeCurrency:null,accountId:null,requiresChoice:true,reason:k==='satellite'?'Satelitní část bez explicitně zvoleného preferovaného tickeru nerozděluji mezi jednotlivé akcie naslepo.':'V této třídě není existující pozice.'});continue}const nativeAmount=baseAmount/candidate.fxToBase,unitPrice=importedUnitPrice(candidate),approxQty=unitPrice?nativeAmount/unitPrice:null;trades.push({bucket:k,label:REBALANCE_LABELS[k],ticker:candidate.ticker,name:candidate.name||candidate.ticker,baseAmount:round2(baseAmount),baseCurrency:currency,nativeAmount:round2(nativeAmount),nativeCurrency:candidate.accountCurrency,accountId:candidate.accountId,requiresChoice:false,preferred:!!candidate.preferred,importedUnitPrice:unitPrice?round2(unitPrice):null,approxQty:approxQty?Math.round(approxQty*10000)/10000:null,reason:candidate.preferred?'Použit uložený preferovaný ticker pro tuto třídu.':'Použita největší existující pozice v této třídě; nový ticker si Kamil OS nevymýšlí.'})}
 const currentDrift=drift(current,currentTotal,targets),afterDrift=drift(after,finalTotal,targets),overweights=REBALANCE_BUCKETS.filter(k=>current[k]>targetAmounts[k]+0.01).map(k=>({bucket:k,label:REBALANCE_LABELS[k],excess:round2(current[k]-targetAmounts[k])}));
 const residual=REBALANCE_BUCKETS.map(k=>({bucket:k,label:REBALANCE_LABELS[k],deltaPct:round2((after[k]/finalTotal*100)-targets[k])})).filter(x=>Math.abs(x.deltaPct)>=0.1);
 return {ok:true,code:'OK',currency,contribution:round2(contribution),targets,targetValidation,currentTotal:round2(currentTotal),finalTotal:round2(finalTotal),byBucket,trades,currentDriftPct:round2(currentDrift),afterDriftPct:round2(afterDrift),improvementPct:round2(Math.max(0,currentDrift-afterDrift)),perfect:afterDrift<=0.05,residual,overweights,positionCount:positions.length,note:'Plán používá pouze nový vklad a neprodává žádnou stávající pozici. Cíl optimalizuje odchylku po vkladu; pokud je některá třída už převažená, samotný nový vklad nemusí stačit k perfektnímu dorovnání. Ručně potvrzené prodeje ignoruje do novějšího XTB importu. Měny se převádějí jen skutečným dostupným FX kurzem a nový ticker se nevymýšlí.'};
}
