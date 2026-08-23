import {store} from './state.js';
import {h,money,modal} from './utils.js';
import {exactTodayPlan561} from './exactTodayPlan561.js';
import {sequenceRiskBudget567} from './sequenceRiskBudget567.js';
import {marketConfidence556} from './marketConfidence556.js';
import {xtbBuyZones,xtbProfitLadder,xtbExactSell,xtbOpportunityScores,xtbConcentrationGuard,xtbEarningsRisk,xtbThesisTracker,xtbWatchlistRanking,ticketMinimumSafePrice,ticketInventoryRisk,ticketBuyOpportunities,ticketEventRanking} from './marketSuite554.js';
import {ticketMarketStatus32,ticketPhase32,ticketPricingPlan32,ticketDataQuality32} from './ticketTuning32.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,N(v)));
const round=(v,d=1)=>{const k=10**d;return Math.round(N(v)*k)/k};
const activeTicket=x=>['HOLD','LISTED'].includes(U(x?.workflow||'HOLD'));
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|\bzl\b|projektov[aá] karta|pracovn/i;
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.subject||''} ${x?.area||''} ${x?.category||''} ${x?.project||''} ${x?.event||''}`);
const qty=x=>Math.max(1,N(first(x?.qty,x?.quantity,1))||1);
const feeRate=x=>{const f=N(first(x?.feeRate,.12));return f>=0&&f<1?f:.12};
const ticketItems=s=>A(s.ticketBook?.items).filter(activeTicket).filter(personal);
const ticketBy=(s,id)=>ticketItems(s).find(x=>String(x.id)===String(id))||null;
const fmt=(v,c='CZK')=>{if(!Number.isFinite(Number(v)))return '—';try{return new Intl.NumberFormat('cs-CZ',{style:'currency',currency:U(c),maximumFractionDigits:U(c)==='CZK'?0:2}).format(Number(v))}catch{return `${Number(v).toLocaleString('cs-CZ')} ${U(c)}`}};
const dayDiff=v=>{const t=Date.parse(v||'');if(!Number.isFinite(t))return null;return Math.ceil((t-Date.now())/86400000)};
const positionRows=s=>A(s.xtbReport?.positions);
const ticker=x=>U(first(x?.ticker,x?.symbol,x?.name,''));

export function capitalReusePlanner568(s=store.get()){
 const exact=exactTodayPlan561(s),released=new Map(),uses=new Map();
 for(const x of exact.now){if(!x.capitalAmount||!x.capitalCurrency)continue;const m=x.capitalDirection==='RELEASE'?released:x.capitalDirection==='USE'?uses:null;if(m)m.set(U(x.capitalCurrency),(m.get(U(x.capitalCurrency))||0)+N(x.capitalAmount))}
 const opportunities={xtb:xtbOpportunityScores(s).filter(x=>x.score>=65).slice(0,3),tickets:ticketBuyOpportunities(s).filter(personal).filter(x=>x.score>=65).slice(0,3)};
 const currencies=[...new Set([...released.keys(),...uses.keys()])].map(c=>({currency:c,released:round(released.get(c)||0,2),plannedUse:round(uses.get(c)||0,2),net:round((released.get(c)||0)-(uses.get(c)||0),2)}));
 return{currencies,opportunities,note:'Kapitál zůstává oddělený podle měny a zdroje; planner nepředpokládá FX ani přesun ticket cash do XTB.'};
}

export function cashWaitingRoom569(s=store.get()){
 const reuse=capitalReusePlanner568(s),reserved=N(first(s.marketCapital?.reserved,s.financePlan?.plannedInvestment)),available=N(s.marketCapital?.available),rows=reuse.currencies.map(x=>({...x,status:x.net>0?'UVOLNĚNÉ':x.net<0?'REZERVOVANÉ':'VYROVNANÉ'}));
 if(available>0&&!rows.some(x=>x.currency==='CZK'))rows.push({currency:'CZK',released:0,plannedUse:0,net:available,status:'VOLNÉ'});
 return{rows,reserved,waiting:Math.max(0,available-reserved),note:'Waiting Room je evidence disponibilního/plánovaného kapitálu, ne bankovní zůstatek.'};
}

export function buyOrderBuilder570(s=store.get()){
 const exact=exactTodayPlan561(s),zones=new Map(xtbBuyZones(s).map(x=>[ticker(x),x]));
 return exact.now.filter(x=>x.domain==='XTB'&&U(x.verdict)==='BUY').map(x=>{const amount=N(x.capitalAmount),z=zones.get(ticker(x)),currency=U(x.capitalCurrency||'CZK'),parts=amount&&z?[{pct:30,price:z.good,amount:round(amount*.30)},{pct:40,price:z.ideal,amount:round(amount*.40)},{pct:30,price:z.ideal?round(z.ideal*.97,2):null,amount:round(amount*.30)}]:[];return{ticker:ticker(x),name:x.name||x.ticker,currency,total:amount||null,parts,ready:parts.length===3,note:parts.length?'Tři limitní plánovací tranše; nevytváří objednávky.':'Chybí přesný sizing nebo buy zóna.'}});
}

export function sellOrderBuilder571(s=store.get()){
 const exact=new Map(xtbExactSell(s).map(x=>[ticker(x),x])),ladders=xtbProfitLadder(s);
 return ladders.map(x=>{const p=exact.get(ticker(x)),current=N(p?.qty),hit=A(x.hit),stages=hit.map((z,i)=>({stage:i+1,gain:z.gain,sellPct:z.sellPct,qty:current?round(current*z.sellPct/100,4):null}));return{ticker:ticker(x),name:x.name,gain:x.gain,exactQty:current||null,stages,next:x.next,ready:!!p,note:p?'Sekvence částečných výběrů zisku; ruční provedení.':'Aktuální planner nemá potvrzený SELL/TRIM sizing.'}}).filter(x=>x.stages.length||x.ready);
}

export function portfolioHeatmap572(s=store.get()){
 const opp=new Map(xtbOpportunityScores(s).map(x=>[ticker(x),x])),conc=new Map(xtbConcentrationGuard(s).map(x=>[ticker(x),x])),earn=new Map(xtbEarningsRisk(s).map(x=>[ticker(x),x])),conf=new Map(marketConfidence556(s).xtb.map(x=>[ticker(x),x]));
 return positionRows(s).map(p=>{const t=ticker(p),o=opp.get(t),c=conc.get(t),e=earn.get(t),cf=conf.get(t),heat=clamp((N(c?.weight)>=12?30:N(c?.weight)>=10?18:5)+(e?.risk==='VYSOKÉ'?25:e?.risk==='ZVÝŠENÉ'?12:0)+(N(cf?.confidence)<65?20:0)+(N(p.profitCZK)<0?10:0));return{ticker:t,name:p.name||t,weight:c?.weight??null,gain:N(p.net_profit_pct),opportunity:o?.score??null,earnings:e?.risk||'NEZNÁMÉ',confidence:cf?.confidence??null,heat:round(heat),level:heat>=60?'HORKÉ':heat>=35?'TEPLÉ':'KLIDNÉ'}}).sort((a,b)=>b.heat-a.heat);
}

export function portfolioCleanupDetector573(s=store.get()){
 const total=N(s.xtbReport?.czkValue);return positionRows(s).map(p=>{const v=N(first(p.valueCZK,p.valueCzk)),w=total>0?v/total*100:N(p.weightPct),t=ticker(p),reasons=[];if(w>0&&w<1)reasons.push('pozice pod 1 % portfolia');if(Math.abs(N(p.profitCZK))<500&&v>0&&v<5000)reasons.push('malý ekonomický dopad');const thesis=xtbThesisTracker(s).find(x=>ticker(x)===t);if(thesis&&!thesis.hasThesis)reasons.push('chybí uložená teze');return{ticker:t,name:p.name||t,value:v||null,weight:round(w),candidate:reasons.length>=2,reasons}}).filter(x=>x.candidate).sort((a,b)=>a.weight-b.weight);
}

export function thesisBreakDetector574(s=store.get()){
 const thesis=xtbThesisTracker(s),positions=new Map(positionRows(s).map(x=>[ticker(x),x]));return thesis.map(t=>{const p=positions.get(ticker(t)),manual=U(first(p?.thesisStatus,s.xtbStrategy?.theses?.[ticker(t)]?.status,'')),broken=['BROKEN','INVALID','FAILED','PORUŠENA','PORUŠENÁ'].includes(manual),review=U(t.status)==='ZNOVU PROVĚŘIT'||N(p?.net_profit_pct)<=-15;return{ticker:ticker(t),name:t.name,hasThesis:t.hasThesis,broken,review,status:broken?'TEZE PORUŠENA':!t.hasThesis?'TEZE CHYBÍ':review?'OVĚŘIT':'PLATÍ',rule:broken?'NEPŘIKUPOVAT; nejdřív nový fundamentální důvod.':review?'Pokles sám o sobě není BUY signál.':'Bez známého break signálu.'}});
}

export function earningsPlaybook575(s=store.get()){
 return xtbEarningsRisk(s).map(x=>({ticker:ticker(x),name:x.name,date:x.date,days:x.days,risk:x.risk,before:x.days!==null&&x.days>=0&&x.days<=3?'NOVÝ VELKÝ BUY NE':x.days!==null&&x.days<=7?'ZMENŠIT / POČKAT':'BĚŽNÝ REŽIM',after:x.date?'Po zveřejnění výsledků obnovit import a znovu spustit Decision.':'Doplnit datum earnings.',recheck:x.date?new Date(Date.parse(x.date)+86400000).toISOString().slice(0,10):null}));
}

export function entryQualityTracker576(s=store.get()){
 const hist=A(first(s.xtbTradeHistory,s.tradeHistory?.xtb,s.marketHistory?.xtb,[]));return hist.filter(x=>U(first(x.side,x.action))==='BUY').map(x=>{const price=N(x.price),good=N(first(x.buyZoneGood,x.goodPrice)),ideal=N(first(x.buyZoneIdeal,x.idealPrice));let grade='NEZNÁMÉ';if(price&&ideal&&price<=ideal)grade='A';else if(price&&good&&price<=good)grade='B';else if(price&&good)grade='C';return{ticker:ticker(x),at:x.at||x.date||null,price:price||null,good:good||null,ideal:ideal||null,grade,note:grade==='NEZNÁMÉ'?'Historie nemá tehdejší buy zónu.':'Hodnoceno proti zóně uložené v době vstupu, ne proti dnešní ceně.'}});
}

export function exitQualityTracker577(s=store.get()){
 const hist=A(first(s.xtbTradeHistory,s.tradeHistory?.xtb,s.marketHistory?.xtb,[]));return hist.filter(x=>['SELL','TRIM'].includes(U(first(x.side,x.action)))).map(x=>{const followed=!!first(x.ruleMatched,x.ladderMatched,x.plannedExit),confidence=N(x.confidenceAtExit);return{ticker:ticker(x),at:x.at||x.date||null,price:N(x.price)||null,grade:followed&&confidence>=65?'A':followed?'B':'NEZNÁMÉ',note:followed?'Exit odpovídal tehdejšímu uloženému pravidlu.':'Bez uloženého pravidla nelze férově hodnotit hindsight.'}});
}

export function ticketMarketDepth578(s=store.get()){
 return ticketItems(s).map(x=>{const raw=A(first(x.comparableListings,x.marketListings,x.comps,[])).map(v=>typeof v==='number'?{price:v}:v).filter(v=>N(v.price)>0),prices=raw.map(v=>N(v.price)).sort((a,b)=>a-b),median=prices.length?prices[Math.floor(prices.length/2)]:null;return{id:x.id,name:x.name||'Vstupenka',count:prices.length,lowest:prices[0]||null,median,highest:prices.at(-1)||null,known:prices.length>0,status:prices.length>=5?'DOBRÁ HLOUBKA':prices.length?'OMEZENÁ DATA':'DOPLNIT DATA'}});
}

export function ticketLiquidityScore579(s=store.get()){
 const depth=new Map(ticketMarketDepth578(s).map(x=>[x.id,x])),risk=new Map(ticketInventoryRisk(s).map(x=>[x.id,x]));return ticketItems(s).map(x=>{const d=depth.get(x.id),r=risk.get(x.id),days=ticketPhase32(x).days,market=ticketMarketStatus32(x),list=N(x.listPrice),base=70-(N(r?.score)*.45);let score=base;if(days!==null&&days<=3)score-=20;else if(days!==null&&days<=7)score-=10;if(d?.count>=5)score+=10;else if(!d?.known)score-=10;if(market.fresh)score+=8;if(d?.lowest&&list&&list<=d.lowest*1.03)score+=8;score=clamp(score);return{id:x.id,name:x.name||'Vstupenka',score:round(score),level:score>=70?'VYSOKÁ':score>=45?'STŘEDNÍ':'NÍZKÁ',days,depth:d?.count||0,risk:r?.score||0}}).sort((a,b)=>a.score-b.score);
}

export function ticketPriceBands580(s=store.get()){
 return ticketItems(s).map(x=>{const p=ticketPricingPlan32(x),m=ticketMarketStatus32(x),floor=Math.ceil(Math.max(N(p.floor),N(p.breakEven))),market=N(m.price),normal=p.recommendedListPricePerTicket||p.internalTargetPricePerTicket||null;if(!m.fresh&&p.phase.days!==null&&p.phase.days<=30)return{id:x.id,name:x.name||'Vstupenka',fresh:false,floor,fast:null,normal:null,maxMargin:null,status:'OBNOVIT TRH'};return{id:x.id,name:x.name||'Vstupenka',fresh:m.fresh,floor,fast:market?Math.max(floor,Math.round(market*.97)):normal,normal,maxMargin:market?Math.max(floor,Math.round(market*1.07)):normal?Math.round(normal*1.05):null,status:'READY'}});
}

export function ticketUndercutGuard581(s=store.get()){
 const depth=new Map(ticketMarketDepth578(s).map(x=>[x.id,x])),safe=new Map(ticketMinimumSafePrice(s).map(x=>[x.id,x]));return ticketItems(s).map(x=>{const d=depth.get(x.id),floor=N(safe.get(x.id)?.safePrice),list=N(x.listPrice),alreadyLowest=!!(d?.lowest&&list&&list<=d.lowest*1.01),nearFloor=!!(floor&&list&&list<=floor*1.05),block=alreadyLowest||nearFloor;return{id:x.id,name:x.name||'Vstupenka',list:list||null,lowest:d?.lowest||null,floor:floor||null,block,action:block?'NEZLEVNIT BEZ DŮVODU':'LZE ZVÁŽIT REPRICE',reason:alreadyLowest?'už jsi na/okolo nejnižší relevantní ceny':nearFloor?'listing je do 5 % nad break-even floor':'bez undercut blockeru'}});
}

export function ticketSelloutSignal582(s=store.get()){
 return ticketItems(s).map(x=>{const sold=first(x.officialSoldOut,x.sellout?.soldOut),remain=N(first(x.officialInventory,x.sellout?.remaining)),prev=N(first(x.sellout?.previousRemaining,x.officialInventoryPrevious)),fall=prev>0&&remain>=0?(prev-remain)/prev*100:null;let signal='NEZNÁMÉ';if(sold===true)signal='SOLD OUT';else if(fall!==null&&fall>=30)signal='INVENTORY RYCHLE KLESÁ';else if(remain>0)signal='V PRODEJI';return{id:x.id,name:x.name||'Vstupenka',signal,remaining:remain||null,dropPct:fall===null?null:round(fall),guidance:signal==='SOLD OUT'||signal==='INVENTORY RYCHLE KLESÁ'?'Nespěchat s undercutem; zkontrolovat čerstvý market.':'Bez potvrzeného scarcity signálu.'}});
}

export function presaleOpportunityCalculator583(s=store.get(),targetRoiPct=25){
 const roi=Math.max(0,N(targetRoiPct))/100;return ticketBuyOpportunities(s).filter(personal).map(x=>{const expected=N(first(x.expectedResale,x.marketPrice,x.targetPrice)),fee=feeRate(x),maxBuy=expected>0?Math.floor(expected*(1-fee)/(1+roi)):null;return{...x,targetRoiPct:Math.round(roi*100),maxBuyAtTarget:maxBuy,decision:maxBuy&&N(first(x.buyPrice,x.price,x.cost))<=maxBuy?'PASS':'WAIT',note:maxBuy?`Pro ${Math.round(roi*100)}% ROI po procentním fee je max nákup ${money(maxBuy)} / ks.`:'Chybí očekávaná resale cena.'}});
}

export function eventCapitalLimit584(s=store.get()){
 const items=ticketItems(s),total=items.reduce((a,x)=>a+N(x.buy),0),map=new Map();for(const x of items){const key=x.event||x.name||'Event';map.set(key,(map.get(key)||0)+N(x.buy))}return[...map.entries()].map(([event,capital])=>{const pct=total>0?capital/total*100:0;return{event,capital,sharePct:round(pct),status:pct>=40?'STOP DALŠÍMU NÁKUPU':pct>=25?'POZOR':'OK'}}).sort((a,b)=>b.capital-a.capital);
}

export function ticketPortfolioCalendar585(s=store.get()){
 const milestones=[30,14,7,3,1];return ticketItems(s).flatMap(x=>{const event=Date.parse(first(x.date,x.eventDate));if(!Number.isFinite(event))return[];return[{id:x.id,name:x.name||'Vstupenka',type:'EVENT',date:new Date(event).toISOString().slice(0,10),days:dayDiff(new Date(event).toISOString())},...milestones.map(d=>({id:x.id,name:x.name||'Vstupenka',type:`T-${d}`,date:new Date(event-d*86400000).toISOString().slice(0,10),days:dayDiff(new Date(event-d*86400000).toISOString())}))]}).sort((a,b)=>a.days-b.days);
}

export function crossMarketCapitalRanking586(s=store.get()){
 const xtb=xtbOpportunityScores(s).map(x=>({domain:'XTB',key:`XTB:${x.ticker}`,name:x.name||x.ticker,score:round(x.score),currency:'NEPŘEVÁDĚT AUTOMATICKY',liquidity:'MARKET',reason:x.reason}));const tickets=presaleOpportunityCalculator583(s).map(x=>({domain:'TICKET',key:`TICKET:${x.id||x.name}`,name:x.name,score:round(x.score),currency:'CZK/ULOŽENÁ MĚNA',liquidity:'EVENT-DEPENDENT',reason:x.note}));return[...xtb,...tickets].sort((a,b)=>b.score-a.score).slice(0,10);
}

export function marketCommander587(s=store.get()){
 const started=performance.now(),risk=sequenceRiskBudget567(s,3),exact=exactTodayPlan561(s),reuse=capitalReusePlanner568(s),ranking=crossMarketCapitalRanking586(s),firstStep=risk.steps[0]||exact.now[0]||null,verify=exact.verify[0]||null,next=firstStep?{mode:'ACT',instruction:firstStep.instruction||firstStep.name||firstStep.ticker,confidence:firstStep.confidence??null,why:firstStep.riskGate?`Risk ${firstStep.riskBefore.overall} → ${firstStep.riskAfter.overall}`:firstStep.capitalEffect||firstStep.detail||'',price:firstStep.targetPrice||null,qty:firstStep.exactQty||null,currency:firstStep.capitalCurrency||firstStep.currency||null}:verify?{mode:'VERIFY',instruction:verify.instruction,confidence:verify.confidence,why:verify.detail||verify.nextStep||'',price:null,qty:null,currency:null}:{mode:'WAIT',instruction:'Dnes nevyrábět obchod.',confidence:null,why:'Žádná ověřená akce neprošla všemi gate.',price:null,qty:null,currency:null};const result={next,risk,exact,reuse,ranking,generatedAt:new Date().toISOString()};window.__KAMIL_MARKET_COMMANDER_587_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),mode:next.mode,riskSteps:risk.total};return result;
}

export function commanderDecision590(s=store.get()){
 const x=marketCommander587(s),step=x.risk.steps[0]||x.exact.now[0]||null,verify=x.exact.verify[0]||null,currency=U(first(step?.capitalCurrency,step?.currency,x.next.currency,'CZK')),amount=N(step?.capitalAmount),qtyValue=first(step?.exactQty,step?.qty,x.next.qty),price=first(step?.targetPrice,step?.price,x.next.price),after=x.risk.steps[1]?.instruction||step?.nextStep||verify?.nextStep||(x.next.mode==='ACT'?'Po ručním provedení obnov market data a spusť Commander znovu.':x.next.mode==='VERIFY'?'Doplň chybějící data a spusť Commander znovu.':'Počkej na nový market trigger nebo čerstvá data.');
 const result={mode:x.next.mode,what:x.next.instruction,howMuch:qtyValue?`${qtyValue} ks`:amount?fmt(amount,currency):'—',atPrice:price?fmt(price,currency):'—',why:x.next.why||'Bez dalšího potvrzeného důvodu.',whatNext:after,confidence:x.next.confidence??null,currency,technical:x};
 window.__KAMIL_COMMANDER_UX_590_LAST__={at:Date.now(),mode:result.mode,confidence:result.confidence};return result;
}

export const MARKET_587_ENGINES={
 capitalReusePlanner568,cashWaitingRoom569,buyOrderBuilder570,sellOrderBuilder571,portfolioHeatmap572,portfolioCleanupDetector573,thesisBreakDetector574,earningsPlaybook575,entryQualityTracker576,exitQualityTracker577,ticketMarketDepth578,ticketLiquidityScore579,ticketPriceBands580,ticketUndercutGuard581,ticketSelloutSignal582,presaleOpportunityCalculator583,eventCapitalLimit584,ticketPortfolioCalendar585,crossMarketCapitalRanking586,marketCommander587
};

const simpleRows=(rows,fn=x=>x.name||x.ticker||x.event||x.key)=>A(rows).slice(0,6).map(x=>`<div class="intel-row"><div class="intel-main"><b>${h(fn(x))}</b><span>${h(x.status||x.level||x.signal||x.note||x.reason||'')}</span></div></div>`).join('')||'<div class="empty">Bez relevantních uložených dat.</div>';

export async function openMarketCommander587(){
 const d=commanderDecision590(),x=d.technical,heat=portfolioHeatmap572(),liq=ticketLiquidityScore579(),bands=ticketPriceBands580(),reuse=capitalReusePlanner568(),body=`<div class="card"><div class="eyebrow">MARKET COMMANDER 59.0</div><div class="muted">ENGINE MARKET COMMANDER 58.7</div><h2>${h(d.what)}</h2><div class="metric-strip"><div class="metric"><span>CO</span><b>${h(d.what)}</b></div><div class="metric"><span>KOLIK</span><b>${h(d.howMuch)}</b></div><div class="metric"><span>ZA KOLIK</span><b>${h(d.atPrice)}</b></div></div><div class="intel-row"><div class="intel-main"><b>PROČ</b><span>${h(d.why)}</span></div></div><div class="intel-row"><div class="intel-main"><b>CO POTOM</b><span>${h(d.whatNext)}</span></div></div></div><details class="card"><summary><b>Technický detail</b> · readiness, confidence, risk a diagnostika</summary><div class="metric-strip"><div class="metric"><span>Režim</span><b class="${d.mode==='ACT'?'good':d.mode==='VERIFY'?'warn':''}">${h(d.mode)}</b></div><div class="metric"><span>Risk kroky</span><b>${x.risk.total}</b></div><div class="metric"><span>Confidence</span><b>${d.confidence??'—'}${d.confidence!==null?' %':''}</b></div><div class="metric"><span>Top ranking</span><b>${h(x.ranking[0]?.name||'—')}</b></div></div><div class="card"><div class="eyebrow">56.8–57.7 · XTB + KAPITÁL</div>${simpleRows(heat,v=>`${v.ticker} · heat ${v.heat}`)}</div><div class="card"><div class="eyebrow">57.8–58.5 · TICKETY</div>${simpleRows(liq,v=>`${v.name} · likvidita ${v.score}`)}${simpleRows(bands,v=>`${v.name} · ${v.status}`)}</div><div class="card"><div class="eyebrow">58.6 · CROSS-MARKET</div>${simpleRows(x.ranking,v=>`${v.domain} · ${v.name} · ${v.score}`)}</div><div class="card"><div class="eyebrow">56.8 · UVOLNĚNÝ KAPITÁL</div>${simpleRows(reuse.currencies,v=>`${v.currency} · net ${fmt(v.net,v.currency)}`)}</div></details><div class="decision-note">59.0 zjednodušuje pouze zobrazení. Výpočty zůstávají na stejných uložených datech a nic automaticky nenakupuje, neprodává, nepřevádí měny ani nepřecenňuje.</div>`;return modal('XTB + vstupenky / Market Commander 58.7',body,[{label:'Zavřít',value:null,primary:true}]);
}
