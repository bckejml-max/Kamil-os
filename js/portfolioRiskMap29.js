import {netWorthFxRate} from './netWorth29.js';
import {rebalancePositions,classifyRebalancePosition,rebalanceTargets,REBALANCE_LABELS} from './portfolioRebalancer29.js';

const n=v=>Number.isFinite(Number(v))?Number(v):0;
const ccy=v=>String(v||'CZK').toUpperCase();
const round1=v=>Math.round(n(v)*10)/10;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,n(v)));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const severityRank={bad:3,warn:2,info:1,good:0};
const themeDefs=[
 {key:'health',label:'Zdravotnictví – známé názvy',rx:/health|healthcare|novo|eli lilly|lly|abbott|abbot|xdwh/},
 {key:'chips-ai',label:'Čipy / AI – známé názvy',rx:/semiconductor|nvidia|nvda|tsmc|broadcom|avgo|chip|artificial intelligence|ai /}
];

function shares(rows,total){return rows.map(x=>({...x,pct:total>0?round1(x.value/total*100):0}))}
function bucketSummary(rows,total,targets){
 const out={};for(const key of ['broad','bond','satellite']){const value=rows.filter(x=>x.bucket===key).reduce((z,x)=>z+x.value,0);out[key]={key,label:REBALANCE_LABELS[key],value:round1(value),pct:total>0?round1(value/total*100):0,targetPct:n(targets[key])}}
 return out;
}
function concentration(rows,total){
 const sorted=shares(rows.slice().sort((a,b)=>b.value-a.value||String(a.ticker).localeCompare(String(b.ticker))),total),top1=sorted[0]?.pct||0,top3=round1(sorted.slice(0,3).reduce((z,x)=>z+x.value,0)/Math.max(1,total)*100),hhi=sorted.reduce((z,x)=>z+Math.pow(x.pct/100,2),0),effective=hhi>0?round1(1/hhi):0;
 return {positions:sorted,top1Pct:top1,top3Pct:top3,effectivePositions:effective};
}
function themeSummary(rows,total){return themeDefs.map(t=>{const matches=rows.filter(x=>t.rx.test(norm(`${x.name||''} ${x.ticker||''}`))),value=matches.reduce((z,x)=>z+x.value,0);return {key:t.key,label:t.label,value:round1(value),pct:total>0?round1(value/total*100):0,tickers:matches.map(x=>x.ticker).filter(Boolean)}}).filter(x=>x.value>0)}
function currencySummary(rows,total){const map={};for(const x of rows){const k=x.accountCurrency;map[k]=(map[k]||0)+x.value}return Object.entries(map).map(([currency,value])=>({currency,value:round1(value),pct:total>0?round1(value/total*100):0})).sort((a,b)=>b.value-a.value||a.currency.localeCompare(b.currency))}
function drift(bucket,total,targets){if(total<=0)return 0;return round1(['broad','bond','satellite'].reduce((z,k)=>z+Math.abs((bucket[k]?.value||0)/total*100-n(targets[k])),0)/2)}
function scoreDrivers(summary){
 const drivers=[];const add=(key,label,points,detail)=>{points=round1(clamp(points,0,100));if(points>0)drivers.push({key,label,points,detail})};
 add('single','Jedna velká pozice',Math.min(25,Math.max(0,summary.concentration.top1Pct-10)*2),`Největší pozice má ${summary.concentration.top1Pct} % portfolia.`);
 add('satellite','Satelitní koncentrace',Math.min(25,Math.max(0,summary.buckets.satellite.pct-35)*1.25),`Satelity tvoří ${summary.buckets.satellite.pct} %.`);
 add('core','Slabší široké jádro',Math.min(20,Math.max(0,50-summary.buckets.broad.pct)*0.75),`Široké ETF tvoří ${summary.buckets.broad.pct} %.`);
 add('bond','Nízká stabilizační složka',Math.min(5,Math.max(0,10-summary.buckets.bond.pct)*0.5),`Dluhopisy tvoří ${summary.buckets.bond.pct} %.`);
 const maxTheme=summary.themes.slice().sort((a,b)=>b.pct-a.pct)[0];if(maxTheme)add('theme','Známá tematická koncentrace',Math.min(15,Math.max(0,maxTheme.pct-20)*0.75),`${maxTheme.label}: ${maxTheme.pct} %.`);
 const maxCurrency=summary.accountCurrencies[0];if(maxCurrency)add('account-currency','Koncentrace podle měny účtu',Math.min(10,Math.max(0,maxCurrency.pct-75)*0.4),`${maxCurrency.currency} účty představují ${maxCurrency.pct} % přepočtené hodnoty.`);
 const riskScore=Math.round(clamp(drivers.reduce((z,x)=>z+x.points,0),0,100));
 return {riskScore,drivers:drivers.sort((a,b)=>b.points-a.points||a.key.localeCompare(b.key))};
}
function alerts(summary,missingCurrencies=[]){
 const out=[],push=(level,label,detail,value=0)=>out.push({level,label,detail,value});
 const top=summary?.concentration?.positions?.[0];if(top?.pct>=15)push('bad','Vysoká váha jedné pozice',`${top.name||top.ticker} tvoří ${top.pct} %.`,top.pct);else if(top?.pct>=10)push('warn','Jedna pozice je výrazná',`${top.name||top.ticker} tvoří ${top.pct} %.`,top.pct);
 if(summary?.buckets?.satellite?.pct>40)push('warn','Satelity nad 40 %',`Satelitní část je ${summary.buckets.satellite.pct} %.`,summary.buckets.satellite.pct);
 if(summary?.buckets?.broad?.pct<50)push('warn','Široké jádro pod 50 %',`Široké ETF tvoří ${summary.buckets.broad.pct} %.`,50-summary.buckets.broad.pct);
 for(const t of summary?.themes||[])if(t.pct>20)push('warn',`Známé téma: ${t.label}`,`${t.tickers.join(', ')} dohromady ${t.pct} %.`,t.pct);
 if(missingCurrencies.length)push('info','Globální skóre není dostupné',`Chybí skutečný FX kurz pro ${missingCurrencies.join(', ')}. Riziko po měnách zůstává dostupné.`,100);
 return out.sort((a,b)=>(severityRank[b.level]||0)-(severityRank[a.level]||0)||b.value-a.value||a.label.localeCompare(b.label,'cs'));
}
function localCurrencyRisk(rows,currency,targets){const total=rows.reduce((z,x)=>z+n(x.value),0),prepared=rows.map(x=>({...x,value:n(x.value),bucket:classifyRebalancePosition(x,{})})),buckets=bucketSummary(prepared,total,targets),con=concentration(prepared,total);return {currency,total:round1(total),positions:con.positions,top1Pct:con.top1Pct,top3Pct:con.top3Pct,effectivePositions:con.effectivePositions,buckets}}
export function portfolioRiskMap(s={},opts={}){
 const baseCurrency=ccy(opts.currency||s.financePlan?.currency||'CZK'),targets=rebalanceTargets(s),raw=rebalancePositions(s);
 if(!raw.length)return {ok:false,code:'NO_POSITIONS',message:'V XTB nejsou aktivní pozice pro mapu rizika.',baseCurrency,riskScore:null,global:null,byCurrency:{},missingCurrencies:[],alerts:[]};
 const byCurrency={};for(const p of raw){const k=ccy(p.accountCurrency);(byCurrency[k]||(byCurrency[k]=[])).push(p)}
 const local=Object.fromEntries(Object.entries(byCurrency).map(([currency,rows])=>[currency,localCurrencyRisk(rows,currency,targets)]));
 const converted=[],missing=[];for(const p of raw){const rate=netWorthFxRate(s,p.accountCurrency,baseCurrency);if(rate===null){missing.push(ccy(p.accountCurrency));continue}converted.push({...p,value:n(p.value)*rate,originalValue:n(p.value),bucket:classifyRebalancePosition(p,s),fxToBase:rate,accountCurrency:ccy(p.accountCurrency)})}
 const missingCurrencies=[...new Set(missing)].sort();if(missingCurrencies.length){const partialAlerts=alerts(null,missingCurrencies);return {ok:true,code:'PARTIAL_FX',baseCurrency,riskScore:null,riskLabel:'Neúplné FX',global:null,byCurrency:local,missingCurrencies,alerts:partialAlerts,targets,positionCount:raw.length,note:'Globální risk score se bez skutečného FX kurzu nepočítá. Lokální koncentrace po jednotlivých měnách používá jen hodnoty v dané měně a nic mezi měnami nesčítá.'}}
 const total=converted.reduce((z,x)=>z+x.value,0),buckets=bucketSummary(converted,total,targets),con=concentration(converted,total),themes=themeSummary(converted,total),accountCurrencies=currencySummary(converted,total),allocationDriftPct=drift(buckets,total,targets),summary={total:round1(total),buckets,concentration:con,themes,accountCurrencies,allocationDriftPct},scored=scoreDrivers(summary),riskLabel=scored.riskScore>=75?'Vysoké':scored.riskScore>=50?'Vyšší':scored.riskScore>=25?'Střední':'Nízké';
 const globalAlerts=alerts(summary,[]);
 return {ok:true,code:'OK',baseCurrency,riskScore:scored.riskScore,riskLabel,drivers:scored.drivers,global:summary,byCurrency:local,missingCurrencies:[],alerts:globalAlerts,targets,positionCount:raw.length,note:'Portfolio Risk Map pracuje jen s aktivními XTB pozicemi. Ručně potvrzené prodeje jsou vyřazené do novějšího importu. Měna účtu není totéž co ekonomická měnová expozice podkladových aktiv. Tematické koncentrace jsou záměrně konzervativní a používají jen známé názvy/tickery, ne vymyšlenou úplnou sektorovou taxonomii.'};
}
