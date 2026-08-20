const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs-CZ').trim();
const ccy=v=>String(v||'CZK').toUpperCase();
const n=v=>Number(v||0);
const finite=v=>Number.isFinite(Number(v));
const pad=v=>String(v).padStart(2,'0');
const monthKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}`;
const dateOnly=v=>{if(!v)return null;const s=String(v);const d=/^\d{4}-\d{2}-\d{2}/.test(s)?new Date(`${s.slice(0,10)}T12:00:00`):new Date(s);return Number.isFinite(d.getTime())?d:null};
const transfer=x=>norm(x?.category)==='prevod'||/\b(transfer|prevod|převod|exchange|smena|směna)\b/.test(norm(`${x?.description} ${x?.type||''}`));
const expense=x=>finite(x?.amount)&&Number(x.amount)<0&&!transfer(x);
const income=x=>finite(x?.amount)&&Number(x.amount)>0&&!transfer(x);
const category=x=>String(x?.category||'NEZAŘAZENO').toUpperCase();
const merchant=x=>String(x?.description||'Neznámý obchodník').trim()||'Neznámý obchodník';

function bounds(now=new Date()){
 const r=new Date(now),currentFrom=new Date(r.getFullYear(),r.getMonth(),1),currentTo=new Date(r.getFullYear(),r.getMonth(),r.getDate()+1),prevFrom=new Date(r.getFullYear(),r.getMonth()-1,1),prevMonthEnd=new Date(r.getFullYear(),r.getMonth(),0),prevComparableTo=new Date(prevFrom.getFullYear(),prevFrom.getMonth(),Math.min(r.getDate(),prevMonthEnd.getDate())+1),prevFullTo=new Date(r.getFullYear(),r.getMonth(),1);
 return {currentFrom,currentTo,prevFrom,prevComparableTo,prevFullTo,currentKey:monthKey(currentFrom),prevKey:monthKey(prevFrom),day:r.getDate()};
}
const between=(d,a,z)=>d&&d>=a&&d<z;
function cleanTransactions(s){return (s.personalSpending?.transactions||[]).map(x=>({...x,_date:dateOnly(x.date)})).filter(x=>x._date&&finite(x.amount));}
function sum(a,pred=()=>true){return a.filter(pred).reduce((z,x)=>z+Math.abs(Number(x.amount||0)),0)}
function aggregateCategories(rows,prevRows){
 const map={};for(const x of rows.filter(expense)){const k=category(x);map[k]=map[k]||{category:k,current:0,previous:0,count:0,previousCount:0};map[k].current+=Math.abs(n(x.amount));map[k].count++}for(const x of prevRows.filter(expense)){const k=category(x);map[k]=map[k]||{category:k,current:0,previous:0,count:0,previousCount:0};map[k].previous+=Math.abs(n(x.amount));map[k].previousCount++}
 return Object.values(map).map(x=>({...x,delta:x.current-x.previous,pct:x.previous>0?((x.current-x.previous)/x.previous)*100:null})).sort((a,b)=>b.current-a.current||String(a.category).localeCompare(String(b.category),'cs'));
}
function aggregateMerchants(rows){const map={};for(const x of rows.filter(expense)){const k=merchant(x);map[k]=map[k]||{merchant:k,amount:0,count:0};map[k].amount+=Math.abs(n(x.amount));map[k].count++}return Object.values(map).sort((a,b)=>b.amount-a.amount||a.merchant.localeCompare(b.merchant,'cs')).slice(0,8)}
function completedMonthlyAverage(all,currency,b){
 const buckets={};for(const x of all){if(ccy(x.currency)!==currency||!expense(x)||x._date>=b.currentFrom)continue;const key=monthKey(x._date);buckets[key]=(buckets[key]||0)+Math.abs(n(x.amount))}
 const keys=Object.keys(buckets).sort().slice(-3);if(keys.length<2)return {average:null,months:keys.map(k=>({month:k,amount:buckets[k]}))};return {average:keys.reduce((z,k)=>z+buckets[k],0)/keys.length,months:keys.map(k=>({month:k,amount:buckets[k]}))};
}
function recurringCandidates(all,currency,b){
 const start=new Date(b.currentFrom.getFullYear(),b.currentFrom.getMonth()-5,1),groups={};
 for(const x of all){if(ccy(x.currency)!==currency||!expense(x)||x._date<start||x._date>=b.currentTo)continue;const k=norm(merchant(x));if(!k)continue;groups[k]=groups[k]||{merchant:merchant(x),amounts:[],months:new Set(),currency};groups[k].amounts.push(Math.abs(n(x.amount)));groups[k].months.add(monthKey(x._date))}
 const out=[];for(const g of Object.values(groups)){if(g.months.size<2||g.amounts.length<2)continue;const sorted=[...g.amounts].sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length/2)],maxDev=Math.max(...g.amounts.map(x=>median?Math.abs(x-median)/median:1));if(maxDev<=0.1)out.push({merchant:g.merchant,currency,months:g.months.size,charges:g.amounts.length,typicalAmount:median,confidence:g.months.size>=3?'HIGH':'MEDIUM'})}
 return out.sort((a,b)=>b.months-a.months||b.typicalAmount-a.typicalAmount).slice(0,6);
}
function currencyView(all,currency,b){
 const cur=all.filter(x=>ccy(x.currency)===currency&&between(x._date,b.currentFrom,b.currentTo)),prev=all.filter(x=>ccy(x.currency)===currency&&between(x._date,b.prevFrom,b.prevComparableTo)),prevFull=all.filter(x=>ccy(x.currency)===currency&&between(x._date,b.prevFrom,b.prevFullTo));
 const spent=sum(cur,expense),previousComparable=sum(prev,expense),previousFull=sum(prevFull,expense),incomeMtd=sum(cur,income),transferVolume=sum(cur,transfer),unknown=cur.filter(x=>expense(x)&&category(x)==='NEZAŘAZENO'),unknownAmount=sum(unknown,()=>true),avg=completedMonthlyAverage(all,currency,b),categories=aggregateCategories(cur,prev),merchants=aggregateMerchants(cur),recurring=recurringCandidates(all,currency,b),delta=spent-previousComparable,pct=previousComparable>0?(delta/previousComparable)*100:null;
 return {currency,spentMtd:spent,previousComparable,previousFull,incomeMtd,transferVolume,delta,pct,expenseCount:cur.filter(expense).length,incomeCount:cur.filter(income).length,unknownCount:unknown.length,unknownAmount,unknownShare:spent>0?(unknownAmount/spent)*100:0,monthlyAverage:avg.average,completedMonths:avg.months,categories,merchants,recurring};
}
function insights(byCurrency){const out=[];for(const v of Object.values(byCurrency)){
 if(v.pct!==null&&v.pct>=20&&v.delta>0)out.push({key:`spend-up:${v.currency}`,priority:v.pct>=50?90:80,title:`Výdaje jsou zatím vyšší než minulý měsíc`,detail:`${v.currency}: +${v.pct.toFixed(0)} % proti stejným ${v.expenseCount?'dnům období':'dnům'} (${Math.round(v.delta).toLocaleString('cs-CZ')} ${v.currency}).`,currency:v.currency,type:'SPEND_UP'});
 for(const x of v.categories.filter(x=>x.pct!==null&&x.pct>=30&&x.delta>0).slice(0,2))out.push({key:`cat:${v.currency}:${x.category}`,priority:x.pct>=80?84:74,title:`Roste kategorie ${x.category}`,detail:`${v.currency}: +${x.pct.toFixed(0)} % · o ${Math.round(x.delta).toLocaleString('cs-CZ')} ${v.currency} více proti stejnému období.`,currency:v.currency,type:'CATEGORY_UP'});
 if(v.unknownShare>=20&&v.unknownAmount>0)out.push({key:`unknown:${v.currency}`,priority:70,title:`Velká část výdajů je nezařazená`,detail:`${v.unknownShare.toFixed(0)} % letošních měsíčních výdajů v ${v.currency} nemá použitelnou kategorii.`,currency:v.currency,type:'DATA_GAP'});
 if(v.recurring.length)out.push({key:`recurring:${v.currency}`,priority:62,title:`Nalezeny opakující se platby`,detail:`${v.recurring.length} kandidátů v ${v.currency}; jde o pravidlovou detekci podle opakovaného obchodníka a podobné částky.`,currency:v.currency,type:'RECURRING'});
 }
 return out.sort((a,b)=>b.priority-a.priority||a.title.localeCompare(b.title,'cs')).slice(0,8)}
export function spendingIntelligence(s={},now=new Date()){
 const all=cleanTransactions(s),b=bounds(now),currencies=[...new Set(all.map(x=>ccy(x.currency)))].sort(),byCurrency={};for(const c of currencies)byCurrency[c]=currencyView(all,c,b);
 const dated=all.map(x=>x._date.getTime()).sort((a,b)=>a-b),monthCount=new Set(all.map(x=>monthKey(x._date))).size;
 return {period:{current:b.currentKey,previous:b.prevKey,day:b.day},byCurrency,currencies,insights:insights(byCurrency),coverage:{transactions:all.length,months:monthCount,from:dated.length?new Date(dated[0]).toISOString().slice(0,10):null,to:dated.length?new Date(dated.at(-1)).toISOString().slice(0,10):null},note:'Spending Intelligence používá jen skutečně importované transakce. Výdaje, příjmy a převody drží odděleně; převody se nepočítají jako spotřeba. Porovnání MTD používá stejný počet kalendářních dní minulého měsíce. Průměr je jen z dokončených měsíců s daty a měny se nikdy nesčítají.'};
}
