const n=v=>Number.isFinite(Number(v))?Number(v):0;
const ccy=v=>String(v||'CZK').toUpperCase();
const flow=x=>String(x?.workflow||'HOLD').toUpperCase();
const activeFlow=x=>['HOLD','LISTED'].includes(flow(x));
const soldFlow=x=>['SOLD','PAYOUT WAIT','PAYOUT RECEIVED'].includes(flow(x));
const qty=x=>Math.max(1,n(x?.qty)||1);
const hasSale=x=>Number.isFinite(Number(x?.sell))&&Number(x.sell)>0;
const profit=x=>n(x.sell)-n(x.buy)-n(x.fees);
const roi=x=>n(x.buy)>0?profit(x)/n(x.buy)*100:null;
const round2=v=>Math.round(n(v)*100)/100;
const safeDate=x=>x?.payoutAt||x?.soldAt||x?.updatedAt||x?.date||x?.createdAt||null;
const eventName=x=>String(x?.eventName||x?.name||'Vstupenková akce').trim();
const eventKey=x=>String(x?.eventKey||x?.eventId||`${String(x?.date||'bez-data').slice(0,10)}|${eventName(x).toLocaleLowerCase('cs-CZ')}`);

function dedupedTrades(s={}){
 const map=new Map(),anon=[];
 const put=(x,source)=>{if(!x||typeof x!=='object')return;const key=x.id?`id:${x.id}`:`anon:${x.name||''}|${x.date||''}|${x.buy||''}|${x.sell||''}|${x.qty||''}`;const row={...x,_source:source};if(x.id||!map.has(key))map.set(key,row);else anon.push(row)};
 for(const x of s.ticketBook?.history||[])put(x,'history');
 for(const x of s.ticketBook?.items||[])put(x,'current');
 return [...map.values(),...anon];
}
function realizedTrade(x){return hasSale(x)&&(x._source==='history'||soldFlow(x))}
function rowOf(x){return {id:x.id||null,name:eventName(x),eventKey:eventKey(x),date:x.date||null,currency:ccy(x.currency),qty:qty(x),buy:round2(n(x.buy)),sell:round2(n(x.sell)),fees:round2(n(x.fees)),profit:round2(profit(x)),roi:roi(x)===null?null:round2(roi(x)),workflow:flow(x),source:x._source,settlement:x._source==='current'&&flow(x)==='PAYOUT RECEIVED'?'RECEIVED':x._source==='current'&&['SOLD','PAYOUT WAIT'].includes(flow(x))?'PENDING':'UNKNOWN',at:safeDate(x)}
function bucket(map,currency){const k=ccy(currency);return map[k]||(map[k]={currency:k,realizedTrades:0,realizedCost:0,realizedRevenue:0,realizedFees:0,realizedProfit:0,realizedRoi:null,wins:0,losses:0,breakeven:0,winRate:null,cashReceived:0,payoutPending:0,unknownSettlementRevenue:0,openCapital:0,openPositions:0,openQty:0,listedGross:0,listedPositions:0,unpricedCapital:0,missingSaleCount:0,realizedRows:[],openRows:[],events:[]})}
function summarizeEvents(rows){
 const map=new Map();for(const x of rows){const k=x.eventKey;if(!map.has(k))map.set(k,{key:k,name:x.name,currency:x.currency,trades:0,buy:0,revenue:0,fees:0,profit:0,wins:0});const g=map.get(k);g.trades++;g.buy+=x.buy;g.revenue+=x.sell;g.fees+=x.fees;g.profit+=x.profit;if(x.profit>0)g.wins++}
 return [...map.values()].map(g=>({...g,buy:round2(g.buy),revenue:round2(g.revenue),fees:round2(g.fees),profit:round2(g.profit),roi:g.buy>0?round2(g.profit/g.buy*100):null,winRate:g.trades?round2(g.wins/g.trades*100):null})).sort((a,b)=>b.profit-a.profit||a.name.localeCompare(b.name,'cs'));
}
export function ticketProfitLedger(s={}){
 const all=dedupedTrades(s),byCurrency={};
 for(const x of all){
  const b=bucket(byCurrency,x.currency);
  if(realizedTrade(x)){
   const r=rowOf(x);b.realizedRows.push(r);b.realizedTrades++;b.realizedCost+=r.buy;b.realizedRevenue+=r.sell;b.realizedFees+=r.fees;b.realizedProfit+=r.profit;if(r.profit>0)b.wins++;else if(r.profit<0)b.losses++;else b.breakeven++;
   if(r.settlement==='RECEIVED')b.cashReceived+=r.sell;else if(r.settlement==='PENDING')b.payoutPending+=r.sell;else b.unknownSettlementRevenue+=r.sell;
  }
  if(x._source==='current'&&activeFlow(x)){
   const buy=n(x.buy),list=n(x.listPrice),q=qty(x);b.openCapital+=buy;b.openPositions++;b.openQty+=q;if(flow(x)==='LISTED'&&list>0){b.listedGross+=list*q;b.listedPositions++}else b.unpricedCapital+=buy;
  }
  if(x._source==='current'&&soldFlow(x)&&!hasSale(x))b.missingSaleCount++;
 }
 for(const b of Object.values(byCurrency)){
  b.realizedCost=round2(b.realizedCost);b.realizedRevenue=round2(b.realizedRevenue);b.realizedFees=round2(b.realizedFees);b.realizedProfit=round2(b.realizedProfit);b.realizedRoi=b.realizedCost>0?round2(b.realizedProfit/b.realizedCost*100):null;b.winRate=b.realizedTrades?round2(b.wins/b.realizedTrades*100):null;b.cashReceived=round2(b.cashReceived);b.payoutPending=round2(b.payoutPending);b.unknownSettlementRevenue=round2(b.unknownSettlementRevenue);b.openCapital=round2(b.openCapital);b.listedGross=round2(b.listedGross);b.unpricedCapital=round2(b.unpricedCapital);b.realizedRows.sort((a,b)=>(new Date(b.at||0)-new Date(a.at||0))||b.profit-a.profit);b.events=summarizeEvents(b.realizedRows);
 }
 const currencies=Object.keys(byCurrency).sort(),coverage={records:all.length,realizedTrades:Object.values(byCurrency).reduce((z,x)=>z+x.realizedTrades,0),openPositions:Object.values(byCurrency).reduce((z,x)=>z+x.openPositions,0),missingSaleCount:Object.values(byCurrency).reduce((z,x)=>z+x.missingSaleCount,0),unknownSettlementTrades:Object.values(byCurrency).reduce((z,x)=>z+x.realizedRows.filter(r=>r.settlement==='UNKNOWN').length,0)};
 const gaps=[];if(coverage.missingSaleCount)gaps.push(`${coverage.missingSaleCount} prodaných / payout pozic nemá uloženou skutečnou prodejní částku a do realizovaného P/L se nepočítá.`);if(coverage.unknownSettlementTrades)gaps.push(`${coverage.unknownSettlementTrades} historických realizovaných obchodů nemá spolehlivě uložený stav výplaty; výsledek je realizovaný, ale cash settlement zůstává neznámý.`);if(currencies.length>1)gaps.push('Ticket ledger obsahuje více měn. Souhrny zůstávají oddělené a Kamil OS je bez explicitního FX nepřevádí do jednoho čísla.');
 return {byCurrency,currencies,coverage,gaps,note:'Realizovaný P/L používá pouze skutečně uložený nenulový prodej a odečítá nákup i poplatky. Listingová/cílová cena se nikdy nezapočítává do realizovaného zisku. SOLD a PAYOUT WAIT se počítají jako realizovaný obchod s čekajícím payoutem; PAYOUT RECEIVED jako přijatá tržba. Otevřený kapitál je veden odděleně. Měny se nikdy nesčítají naslepo.'};
}
