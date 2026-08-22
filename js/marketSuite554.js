import {store} from './state.js';
import {h,money,modal} from './utils.js';
import {xtbBoard,ticketDecision,actionLabel} from './live24.js';
import {xtbTradePlanner} from './xtbPlanner24.js';
import {ticketPricingPlan32,ticketDataQuality32} from './ticketTuning32.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,N(v)));
const round=(v,d=0)=>{const k=10**d;return Math.round(N(v)*k)/k};
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const activeTicket=x=>['HOLD','LISTED'].includes(U(x?.workflow||'HOLD'));
const daysTo=v=>{const t=Date.parse(v||'');if(!Number.isFinite(t))return null;const a=new Date();a.setHours(0,0,0,0);const b=new Date(t);b.setHours(0,0,0,0);return Math.round((b-a)/86400000)};
const ticketDue=x=>first(x?.sellBy,x?.eventDate,x?.date,x?.due,x?.dueAt);
const feeRate=x=>{const f=N(first(x?.feeRate,.12));return f>=0&&f<1?f:.12};
const qtyOf=x=>Math.max(1,N(first(x?.qty,x?.quantity,1))||1);
const buyPer=x=>{const q=qtyOf(x),b=N(first(x?.buy,x?.cost));return b>0?b/q:0};
const ticketMarket=x=>N(first(x?.marketPrice,x?.listPrice,x?.price));
const ticketItems=s=>A(s.ticketBook?.items).filter(activeTicket);
const xtbItems=s=>xtbBoard(s);
const tickerOf=x=>x?.ticker||x?.symbol||x?.name||'—';
const positionPrice=p=>N(first(p?.marketPrice,p?.currentPrice,p?.price,p?.quote?.price,p?.value&&p?.volume?N(p.value)/N(p.volume):0));

// 53.5 — heuristic buy zones from the latest stored/reference price. They are planning bands, not live-market claims.
export function xtbBuyZones(s=store.get()){
 return xtbItems(s).map(({p,d})=>{const price=positionPrice(p),gain=N(p.net_profit_pct),base=price||N(p.avgPrice)||N(p.openPrice),good=base?round(base*(gain>20?.88:.94),2):null,ideal=base?round(base*(gain>20?.80:.88),2):null,expensive=base?round(base*1.06,2):null;let label='ČEKEJ';if(U(d.action)==='BUY')label='KUP PŘI ZÓNĚ';if(U(d.action)==='TRIM'||U(d.action)==='SELL')label='NEPŘIKUPOVAT';return{ticker:tickerOf(p),name:p.name||tickerOf(p),reference:base||null,ideal,good,expensive,label,reason:d.reason||'',source:'HEURISTICKÁ ZÓNA Z ULOŽENÉ CENY'}})};
}

// 53.6 — multi-step profit taking ladder for single stocks.
export function xtbProfitLadder(s=store.get()){
 return xtbItems(s).map(({p,d})=>{const gain=N(p.net_profit_pct),qty=N(p.volume),stock=U(p.category)==='STOCK',steps=stock?[{gain:25,sellPct:15},{gain:40,sellPct:25},{gain:60,sellPct:25},{gain:90,sellPct:20}]:[{gain:35,sellPct:10},{gain:60,sellPct:15}];const next=steps.find(x=>gain<x.gain)||null,hit=steps.filter(x=>gain>=x.gain);return{ticker:tickerOf(p),name:p.name||tickerOf(p),gain,steps,hit,next,nextQty:next&&qty?round(qty*next.sellPct/100,4):null,decision:U(d.action),note:'Ladder je návrh ochrany zisku; neprovádí prodej.'}});
}

// 53.7 — exact sell sizing reuses the existing planner, never inventing unsupported FX/amounts.
export function xtbExactSell(s=store.get()){
 const planner=xtbTradePlanner(s);return planner.plans.filter(x=>['TRIM','SELL'].includes(U(x.action))).map(x=>({...x,label:x.qty?`Prodat ${x.qty} ks ${x.ticker}`:x.amount?`Redukovat ${x.ticker} cca o ${money(x.amount)}`:`Prověř redukci ${x.ticker}`}));
}

// 53.8 — allocate the user's stored/planned monthly contribution across current BUY signals.
export function xtbMonthlyAllocation(s=store.get(),amount=N(s.financePlan?.plannedInvestment)){
 const budget=Math.max(0,N(amount)),board=xtbItems(s),buys=board.filter(x=>U(x.d.action)==='BUY'),eligible=buys.length?buys:board.filter(x=>U(x.d.action)==='HOLD'&&U(x.p.category)==='ETF').slice(0,2);const weights=eligible.map(x=>Math.max(20,N(x.d.priority))),sum=weights.reduce((a,b)=>a+b,0)||1;return{budget,rows:eligible.map((x,i)=>({ticker:tickerOf(x.p),name:x.p.name||tickerOf(x.p),amount:round(budget*weights[i]/sum),reason:x.d.reason||'Nejlepší dostupný portfolio-fit podle uložených dat.'})),unallocated:eligible.length?0:budget,note:'Rozdělení je návrh, ne obchod.'};
}

// 53.9 — composite opportunity score based only on stored decision, portfolio fit, P/L and known event risk.
export function xtbOpportunityScores(s=store.get()){
 return xtbItems(s).map(({p,d})=>{const gain=N(p.net_profit_pct),weight=N(p.weightPct),earn=daysTo(first(p.earningsDate,s.xtbStrategy?.earnings?.[p.ticker]?.date)),eventPenalty=earn!==null&&earn>=0&&earn<=5?20:0,concentrationPenalty=weight>=12?20:weight>=10?10:0,actionBase=U(d.action)==='BUY'?75:U(d.action)==='HOLD'?50:U(d.action)==='REVIEW'?30:15,momentum=gain>=0&&gain<=20?10:gain<-15?-15:0,score=clamp(actionBase+momentum-eventPenalty-concentrationPenalty);return{ticker:tickerOf(p),name:p.name||tickerOf(p),score,action:U(d.action),gain,weight,earningsDays:earn,reason:[d.reason,eventPenalty?'blízké výsledky':'',concentrationPenalty?'vyšší koncentrace':''].filter(Boolean).join(' · ')}}).sort((a,b)=>b.score-a.score);
}

// 54.0 — explicit concentration guard.
export function xtbConcentrationGuard(s=store.get()){
 return xtbItems(s).map(({p})=>{const weight=N(p.weightPct);return{ticker:tickerOf(p),name:p.name||tickerOf(p),weight,status:weight>=12?'STOP PŘIKUPOVÁNÍ':weight>=10?'POZOR':'OK',maxAddPct:weight>=12?0:round(Math.max(0,10-weight),1)}}).sort((a,b)=>b.weight-a.weight);
}

// 54.1 — earnings risk only when an actual stored earnings date exists.
export function xtbEarningsRisk(s=store.get()){
 return xtbItems(s).map(({p})=>{const raw=first(p.earningsDate,s.xtbStrategy?.earnings?.[p.ticker]?.date),days=daysTo(raw);return{ticker:tickerOf(p),name:p.name||tickerOf(p),date:raw||null,days,risk:days===null?'NEZNÁMÉ':days>=0&&days<=3?'VYSOKÉ':days<=7&&days>=0?'ZVÝŠENÉ':'BĚŽNÉ',guidance:days===null?'Chybí datum výsledků.':days>=0&&days<=3?'Nový velký vstup před výsledky nedoporučovat.':days>=0&&days<=7?'Zvaž menší velikost nebo počkej na výsledky.':'Bez blízkého earnings risk signálu.'}});
}

// 54.2 — thesis tracker consumes existing thesis metadata only.
export function xtbThesisTracker(s=store.get()){
 const theses=s.xtbStrategy?.theses||{};return xtbItems(s).map(({p,d})=>{const t=theses[p.ticker]||p.thesis||{};const has=typeof t==='string'?!!t:!!(t.reason||t.why||t.exitRule||t.mustHold);return{ticker:tickerOf(p),name:p.name||tickerOf(p),hasThesis:has,why:typeof t==='string'?t:first(t.reason,t.why,null),mustHold:typeof t==='object'?first(t.mustHold,t.conditions,null):null,exitRule:typeof t==='object'?first(t.exitRule,t.invalidate,null):null,status:!has?'DOPLNIT TEZI':U(d.action)==='REVIEW'?'ZNOVU PROVĚŘIT':'OK'}});
}

// 54.3 — rank explicit watchlist entries; no web data is fabricated.
export function xtbWatchlistRanking(s=store.get()){
 const raw=A(first(s.xtbWatchlist,s.watchlist?.xtb,s.xtbStrategy?.watchlist,[]));return raw.map(x=>{const item=typeof x==='string'?{ticker:x}:x,score=clamp(N(first(item.score,item.opportunityScore,50))),price=N(first(item.price,item.currentPrice)),target=N(first(item.buyBelow,item.targetPrice)),status=target&&price?price<=target?'KUP TEĎ':'ČEKEJ':score>=75?'KUP PŘI POTVRZENÍ':score<40?'NEKUPOVAT':'ČEKEJ';return{...item,ticker:tickerOf(item),score,status,price:price||null,target:target||null}}).sort((a,b)=>b.score-a.score);
}

// 54.4 — deploy a specified cash amount using monthly allocation logic.
export function xtbCashDeployment(s=store.get(),cash=N(first(s.marketCapital?.available,s.financePlan?.plannedInvestment))){return xtbMonthlyAllocation(s,Math.max(0,N(cash)))}

// 54.5 — time-based ticket repricing ladder anchored to break-even/floor and current market when known.
export function ticketRepricingLadder(s=store.get()){
 return ticketItems(s).map(x=>{const p=ticketPricingPlan32(x),market=ticketMarket(x),floor=Math.ceil(Math.max(N(p.floor),N(p.breakEven))),anchor=Math.max(floor,market||N(x.listPrice)||N(p.internalTargetPricePerTicket)||floor),steps=[{days:30,factor:1.08},{days:14,factor:1.03},{days:7,factor:.99},{days:3,factor:.96},{days:1,factor:.92}].map(z=>({days:z.days,price:Math.max(floor,Math.round(anchor*z.factor))}));return{id:x.id,name:x.name||'Vstupenka',days:daysTo(ticketDue(x)),floor,market:market||null,steps,note:'Ladder je návrh; před repricingem použij čerstvou market cenu.'}});
}

// 54.6 — net profit after the stored platform fee rate.
export function ticketNetProfit(s=store.get()){
 return ticketItems(s).map(x=>{const qty=qtyOf(x),market=ticketMarket(x),buy=N(x.buy),fees=market*qty*feeRate(x),netRevenue=market*qty-fees,profit=netRevenue-buy;return{id:x.id,name:x.name||'Vstupenka',qty,market:market||null,buy,fees:round(fees),netRevenue:round(netRevenue),profit:round(profit),roi:buy>0?round(profit/buy*100,1):null}});
}

// 54.7 — minimum list price that covers cost after percentage fees.
export function ticketMinimumSafePrice(s=store.get()){
 return ticketItems(s).map(x=>{const unit=buyPer(x),fee=feeRate(x),safe=unit>0?Math.ceil(unit/(1-fee)):0;return{id:x.id,name:x.name||'Vstupenka',safePrice:safe,unitCost:unit,feeRate:fee,label:safe?`Pod ${money(safe)} / ks jdeš do ztráty.`:'Chybí nákupní cena.'}});
}

// 54.8 — best sell timing from the existing ticket decision/tuning state.
export function ticketBestSellTiming(s=store.get()){
 return ticketItems(s).map(x=>{const d=ticketDecision(x,s),days=daysTo(ticketDue(x));let timing=d.when||'Držet';if(days!==null&&days<=3)timing='PRODÁVAT TEĎ';else if(days!==null&&days<=7)timing='KONTROLOVAT / PŘECENIT DNES';else if(days!==null&&days<=14)timing='AKTIVNÍ PRODEJ';return{id:x.id,name:x.name||'Vstupenka',days,action:U(d.action),timing,reason:d.reason||''}}).sort((a,b)=>(a.days??999)-(b.days??999));
}

// 54.9 — inventory risk combines time, capital, quantity, market coverage and data quality.
export function ticketInventoryRisk(s=store.get()){
 return ticketItems(s).map(x=>{const q=ticketDataQuality32(x),days=daysTo(ticketDue(x)),capital=N(x.buy),qty=qtyOf(x),market=ticketMarket(x),safe=ticketMinimumSafePrice({ticketBook:{items:[x]}})[0]?.safePrice||0;let score=20;if(days!==null&&days<=3)score+=40;else if(days!==null&&days<=7)score+=28;else if(days!==null&&days<=14)score+=18;if(qty>=4)score+=10;if(capital>=20000)score+=10;if(q.score<60)score+=12;if(market&&safe&&market<safe)score+=20;return{id:x.id,name:x.name||'Vstupenka',score:clamp(score),level:score>=75?'VYSOKÉ':score>=50?'STŘEDNÍ':'NÍZKÉ',capital,qty,days,dataQuality:q.score}}).sort((a,b)=>b.score-a.score);
}

// 55.0 — identify low-return ticket capital that could be rotated.
export function ticketCapitalRotation(s=store.get()){
 const profit=ticketNetProfit(s),risk=ticketInventoryRisk(s),riskBy=new Map(risk.map(x=>[x.id,x]));return profit.map(x=>{const r=riskBy.get(x.id),rotate=(x.roi!==null&&x.roi<12)||(r?.score>=75&&x.profit<=0);return{...x,risk:r?.score||0,rotate,action:rotate?'ZVAŽ ROTACI KAPITÁLU':'DRŽET',reason:rotate?`ROI ${x.roi??'—'} % · risk ${r?.score||0}/100`:'Poměr výnos/riziko zatím není důvod k rotaci.'}}).sort((a,b)=>(b.rotate?1:0)-(a.rotate?1:0)||b.risk-a.risk);
}

// 55.1 — rank stored ticket opportunities/presales.
export function ticketBuyOpportunities(s=store.get()){
 const raw=A(first(s.ticketBook?.opportunities,s.ticketOpportunities,s.ticketWatchlist,[]));return raw.map(x=>{const cost=N(first(x.buyPrice,x.price,x.cost)),expected=N(first(x.expectedResale,x.marketPrice,x.targetPrice)),fee=feeRate(x),profit=expected?expected*(1-fee)-cost:0,roi=cost>0&&expected?profit/cost*100:null,score=clamp(N(first(x.score,x.opportunityScore,roi!==null?50+roi/2:40)));const maxBuy=expected?Math.floor(expected*(1-fee)/1.25):N(x.maxBuyPrice)||null;return{...x,name:x.name||x.event||'Opportunity',score:round(score),roi:roi===null?null:round(roi,1),maxBuy,maxBuyLabel:maxBuy?`Max nákup cca ${money(maxBuy)} / ks`:'Chybí tržní/target cena',action:score>=75?'A':score>=55?'B':'C'}}).sort((a,b)=>b.score-a.score);
}

// 55.2 — event ranking groups opportunity quality by event.
export function ticketEventRanking(s=store.get()){
 const opp=ticketBuyOpportunities(s),active=ticketItems(s),map=new Map();for(const x of opp){const key=x.event||x.name;const r=map.get(key)||{event:key,score:0,opportunities:0,capital:0};r.score=Math.max(r.score,N(x.score));r.opportunities++;map.set(key,r)}for(const x of active){const key=x.event||x.name||'Aktivní event';const r=map.get(key)||{event:key,score:45,opportunities:0,capital:0};r.capital+=N(x.buy);map.set(key,r)}return[...map.values()].map(x=>({...x,grade:x.score>=75?'A':x.score>=55?'B':'C'})).sort((a,b)=>b.score-a.score);
}

// 55.3 — compare the best stored XTB and ticket opportunities for a new capital amount.
export function unifiedCapitalDecision(s=store.get(),capital=N(first(s.marketCapital?.available,s.financePlan?.plannedInvestment))){
 const amount=Math.max(0,N(capital)),xtb=xtbOpportunityScores(s)[0]||null,ticket=ticketBuyOpportunities(s)[0]||null,xtbScore=N(xtb?.score),ticketScore=N(ticket?.score);let xtbPct=50;if(ticketScore>xtbScore+12)xtbPct=30;else if(xtbScore>ticketScore+12)xtbPct=75;else if(!ticket)xtbPct=100;else if(!xtb)xtbPct=0;const xtbAmount=round(amount*xtbPct/100),ticketAmount=amount-xtbAmount;return{capital:amount,xtbScore,ticketScore,xtbAmount,ticketAmount,recommendation:!amount?'Chybí částka nového kapitálu.':`Návrh: ${money(xtbAmount)} XTB / ${money(ticketAmount)} vstupenky.`,xtbTop:xtb,ticketTop:ticket,note:'Porovnání používá jen uložená data a neprovádí žádnou transakci.'};
}

// 55.4 — one-screen command generated from all market modules.
export function moneyCommand554(s=store.get()){
 const sells=xtbExactSell(s),xtb=xtbOpportunityScores(s),timing=ticketBestSellTiming(s),rotation=ticketCapitalRotation(s),allocation=unifiedCapitalDecision(s),commands=[];
 if(sells[0])commands.push({score:98,kind:'XTB',text:sells[0].label,detail:sells[0].method});
 const urgentTicket=timing.find(x=>x.days!==null&&x.days<=7);if(urgentTicket)commands.push({score:97,kind:'Vstupenky',text:`${urgentTicket.timing}: ${urgentTicket.name}`,detail:urgentTicket.reason});
 const rotate=rotation.find(x=>x.rotate);if(rotate)commands.push({score:88,kind:'Vstupenky',text:`Prověř rotaci: ${rotate.name}`,detail:rotate.reason});
 const buy=xtb.find(x=>x.action==='BUY'&&x.score>=65);if(buy)commands.push({score:75,kind:'XTB',text:`Přikoupit jen při vhodné ceně: ${buy.ticker}`,detail:`Opportunity ${buy.score}/100`});
 if(allocation.capital>0)commands.push({score:60,kind:'Kapitál',text:allocation.recommendation,detail:'Pouze návrh rozdělení nového kapitálu.'});
 if(!commands.length)commands.push({score:10,kind:'Market',text:'Teď nevyrábět obchod.',detail:'Uložená data nedávají dost silný signál.'});
 return{commands:commands.sort((a,b)=>b.score-a.score).slice(0,5),allocation,generatedAt:new Date().toISOString()};
}

export function marketSuite554(s=store.get()){
 const started=performance.now();const result={buyZones:xtbBuyZones(s),profitLadder:xtbProfitLadder(s),exactSell:xtbExactSell(s),monthlyAllocation:xtbMonthlyAllocation(s),opportunityScores:xtbOpportunityScores(s),concentration:xtbConcentrationGuard(s),earnings:xtbEarningsRisk(s),theses:xtbThesisTracker(s),watchlist:xtbWatchlistRanking(s),cashDeployment:xtbCashDeployment(s),repricing:ticketRepricingLadder(s),ticketProfit:ticketNetProfit(s),safePrice:ticketMinimumSafePrice(s),sellTiming:ticketBestSellTiming(s),inventoryRisk:ticketInventoryRisk(s),rotation:ticketCapitalRotation(s),ticketOpportunities:ticketBuyOpportunities(s),eventRanking:ticketEventRanking(s),capital:unifiedCapitalDecision(s),command:moneyCommand554(s)};const ms=round(performance.now()-started,1);window.__KAMIL_MARKET_SUITE_554_LAST__={ms,at:Date.now()};return result;
}

const rows=(list,render,empty='Bez dat.')=>list.length?list.slice(0,6).map(render).join(''):`<div class="empty">${h(empty)}</div>`;
export async function openMarketSuite554(){
 const x=marketSuite554(),command=x.command.commands;
 const body=`<div class="metric-strip"><div class="metric"><span>XTB nejlepší score</span><b>${x.opportunityScores[0]?.score??'—'}</b></div><div class="metric"><span>Ticket risk max</span><b>${x.inventoryRisk[0]?.score??'—'}</b></div><div class="metric"><span>XTB návrh</span><b>${money(x.capital.xtbAmount)}</b></div><div class="metric"><span>Ticket návrh</span><b>${money(x.capital.ticketAmount)}</b></div></div>
 <div class="card"><div class="eyebrow">ONE-SCREEN MONEY COMMAND · 55.4</div>${rows(command,z=>`<div class="intel-row"><div class="intel-main"><b>${h(z.text)}</b><span>${h(z.kind)} · ${h(z.detail||'')}</span></div></div>`)}</div>
 <div class="card"><div class="eyebrow">XTB · 53.5–54.4</div>${rows(x.opportunityScores,z=>`<div class="intel-row"><div class="intel-main"><b>${h(z.ticker)} · ${z.score}/100</b><span>${h(z.action)} · ${h(z.reason||'')}</span></div></div>`,'Žádné XTB pozice.')}${rows(x.exactSell,z=>`<div class="intel-row"><div class="intel-main"><b>${h(z.label)}</b><span>${h(z.method)} · ${h(z.fx||'')}</span></div></div>`,'Žádná redukce není navržena.')}</div>
 <div class="card"><div class="eyebrow">VSTUPENKY · 54.5–55.2</div>${rows(x.sellTiming,z=>`<div class="intel-row"><div class="intel-main"><b>${h(z.name)} · ${h(z.timing)}</b><span>${h(z.reason||'')}</span></div></div>`,'Žádné aktivní vstupenky.')}${rows(x.safePrice,z=>`<div class="intel-row"><div class="intel-main"><b>${h(z.name)} · floor ${money(z.safePrice)}</b><span>${h(z.label)}</span></div></div>`,'')}</div>
 <div class="card"><div class="eyebrow">NOVÝ KAPITÁL · 55.3</div><h2>${h(x.capital.recommendation)}</h2><p>${h(x.capital.note)}</p></div>
 <div class="decision-note">Market Suite 55.4 obsahuje všech 20 XTB/ticket vylepšení. Buy zones, ladders, scores a alokace jsou rozhodovací návrhy z uložených dat. Žádný obchod, nákup vstupenek, prodej, převod ani repricing se automaticky neprovede.</div>`;
 const choice=await modal('XTB + vstupenky / Market Suite 55.4',body,[{label:'Rozhodnutí 53.4',value:'decision'},{label:'XTB',value:'money'},{label:'Vstupenky',value:'tickets'},{label:'Zavřít',value:null,primary:true}]);
 if(choice==='decision'){const m=await import('./marketDecision534.js');return m.openMarketDecision534()}if(choice)window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:choice}));
}
