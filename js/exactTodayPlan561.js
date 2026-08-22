import {store} from './state.js';
import {h,money,modal} from './utils.js';
import {actionQueue559} from './actionQueue559.js';
import {xtbTradePlanner} from './xtbPlanner24.js';
import {ticketMinimumSafePrice,ticketRepricingLadder} from './marketSuite554.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const qtyOf=x=>Math.max(1,N(first(x?.qty,x?.quantity,1))||1);
const feeRate=x=>{const f=N(first(x?.feeRate,.12));return f>=0&&f<1?f:.12};
const round=v=>Math.round(N(v));

function fmt(v,currency='CZK'){
 if(!Number.isFinite(Number(v)))return '—';
 const c=U(currency||'CZK');
 try{return new Intl.NumberFormat('cs-CZ',{style:'currency',currency:c,maximumFractionDigits:c==='CZK'?0:2}).format(Number(v))}catch{return `${Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:2})} ${c}`}
}
function ladderTarget(ladder,row){
 const days=row.days??ladder?.days,steps=A(ladder?.steps).slice().sort((a,b)=>a.days-b.days);
 if(!steps.length)return null;
 if(days===null||days===undefined)return steps[steps.length-1]?.price||null;
 return (steps.find(x=>days<=x.days)||steps[steps.length-1])?.price||null;
}
function ticketItem(s,id){return A(s.ticketBook?.items).find(x=>String(x.id)===String(id))||{}}

function exactRow(row,s,planByTicker,ladderById,safeById){
 if(row.domain==='XTB'){
  const plan=planByTicker.get(U(row.ticker)),amount=N(plan?.amount)||null,qty=plan?.qty||null,action=U(row.verdict),currency=action==='BUY'?'CZK':U(plan?.currency||'');
  let capitalDirection=null,capitalAmount=null,capitalCurrency=currency||null,effect='';
  if(action==='BUY'){
   if(amount){capitalDirection='USE';capitalAmount=amount;effect=`Použije cca ${fmt(amount,'CZK')} z investičního rozpočtu${plan?.currency?` · exekuce na ${U(plan.currency)} účtu`:''}.`}
   else effect='Kapitál pro nákup nelze přesně vyčíslit bez spolehlivého sizingu.';
  }else if(action==='SELL'){
   if(amount&&currency){capitalDirection='RELEASE';capitalAmount=amount;effect=`Uvolní cca ${fmt(amount,currency)} na ${currency} účtu.`}
   else effect='Uvolněný kapitál nelze přesně vyčíslit bez spolehlivé hodnoty a měny pozice.';
  }else effect=row.detail||row.nextStep||'Bez kapitálového pohybu.';
  return{...row,capitalDirection,capitalAmount,capitalCurrency,capitalEffect:effect,exactQty:qty,conditionalNetRevenue:null,conditionalProfit:null,safePrice:null,targetPrice:null};
 }
 const item=ticketItem(s,row.id),qty=qtyOf(item),fee=feeRate(item),buy=N(first(item.buy,item.cost)),market=N(first(item.marketPrice,item.listPrice,item.price)),ladder=ladderById.get(row.id),safe=N(safeById.get(row.id)?.safePrice),target=U(row.verdict)==='REPRICE'?N(ladderTarget(ladder,row)):market,price=target||market;
 let net=null,profit=null,effect=row.detail||row.nextStep||'Bez kapitálového pohybu.',capitalDirection=null,capitalAmount=null;
 if(price>0){const gross=price*qty;net=round(gross*(1-fee));profit=round(net-buy)}
 if(U(row.verdict)==='SELL'){
  if(net!==null){capitalDirection='RELEASE';capitalAmount=net;effect=`Při prodeji za ${fmt(price)} / ks: čistý příjem ${fmt(net)} · P/L ${fmt(profit)}${safe?` · floor ${fmt(safe)} / ks`:''}.`}
  else effect='Čistý příjem z prodeje nelze spočítat bez ceny.';
 }else if(U(row.verdict)==='REPRICE'){
  effect=price>0?`Nastavit ${fmt(price)} / ks${safe?` · nepodlézt ${fmt(safe)} / ks`:''}${profit!==null?` · při následném prodeji za tuto cenu P/L ${fmt(profit)}`:''}.`:'Cílovou cenu nelze bezpečně spočítat bez repricing ladderu.';
 }
 return{...row,capitalDirection,capitalAmount,capitalCurrency:'CZK',capitalEffect:effect,exactQty:qty,conditionalNetRevenue:net,conditionalProfit:profit,safePrice:safe||null,targetPrice:price||null};
}

function flowSummary(rows,direction){
 const sums=new Map();
 for(const x of rows){if(x.capitalDirection!==direction||!x.capitalAmount||!x.capitalCurrency)continue;const c=U(x.capitalCurrency);sums.set(c,(sums.get(c)||0)+N(x.capitalAmount))}
 return[...sums.entries()].map(([c,v])=>fmt(v,c)).join(' + ')||'—';
}

export function exactTodayPlan561(s=store.get()){
 const started=performance.now(),queue=actionQueue559(s),planner=xtbTradePlanner(s),ladders=ticketRepricingLadder(s),safe=ticketMinimumSafePrice(s),planByTicker=new Map(A(planner.plans).map(x=>[U(x.ticker),x])),ladderById=new Map(A(ladders).map(x=>[x.id,x])),safeById=new Map(A(safe).map(x=>[x.id,x]));
 const now=queue.doNow.map(x=>exactRow(x,s,planByTicker,ladderById,safeById)),verify=queue.verify.map(x=>exactRow(x,s,planByTicker,ladderById,safeById)),wait=queue.wait.map(x=>exactRow(x,s,planByTicker,ladderById,safeById));
 const releaseText=flowSummary(now,'RELEASE'),useText=flowSummary(now,'USE'),summary=now.length?`Dnes máš ${now.length} ruční ${now.length===1?'krok':'kroky'} připravené k provedení.`:verify.length?`Nejdřív ověř ${verify.length} blokované ${verify.length===1?'rozhodnutí':'rozhodnutí'}.`:'Dnes není potřeba dělat žádný market krok.';
 const result={now,verify,wait,total:now.length+verify.length+wait.length,releaseText,useText,summary,generatedAt:new Date().toISOString()};
 window.__KAMIL_EXACT_TODAY_561_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),now:now.length,verify:verify.length,wait:wait.length};
 return result;
}

const row=(x,mode)=>`<div class="intel-row"><div class="intel-main"><b>${h(x.instruction)}</b><span>${h(x.capitalEffect||x.detail||x.nextStep||'Bez dalšího detailu.')}</span></div><div class="row-actions"><span class="decision-action ${mode==='now'?'good':mode==='verify'?'bad':'warn'}">${mode==='now'?'DNES':mode==='verify'?'OVĚŘ':'ČEKEJ'}</span><span class="status">${x.confidence}%</span></div></div>`;

export async function openExactTodayPlan561(){
 const x=exactTodayPlan561(),body=`<div class="metric-strip"><div class="metric"><span>Dnešní kroky</span><b class="good">${x.now.length}</b></div><div class="metric"><span>Uvolní kapitál</span><b>${h(x.releaseText)}</b></div><div class="metric"><span>Použije kapitál</span><b>${h(x.useText)}</b></div><div class="metric"><span>Blokery</span><b class="${x.verify.length?'bad':'good'}">${x.verify.length}</b></div></div><div class="card"><div class="eyebrow">EXACT TODAY PLAN 56.1</div><h2>${h(x.summary)}</h2><p>Jen ruční XTB a ticket kroky, které prošly Final Verdictem. Kapitál se nesčítá napříč měnami bez konverze.</p></div><div class="card"><div class="eyebrow">1 · UDĚLEJ DNES</div>${x.now.map(v=>row(v,'now')).join('')||'<div class="empty success-empty">Žádná ověřená market akce dnes není nutná.</div>'}</div><div class="card"><div class="eyebrow">2 · NEJDŘÍV OVĚŘ</div>${x.verify.map(v=>row(v,'verify')).join('')||'<div class="empty success-empty">Žádný blocker.</div>'}</div><div class="card"><div class="eyebrow">3 · DRŽ & ČEKEJ</div>${x.wait.slice(0,8).map(v=>row(v,'wait')).join('')||'<div class="empty">Bez čekajících položek.</div>'}</div><div class="decision-note">56.1 pouze počítá podmíněný kapitálový dopad z uložených dat. Neprovádí nákup, prodej, převod ani repricing. U ticketu je P/L matematika pro uvedenou cenu, ne predikce budoucího prodeje.</div>`;
 const choice=await modal('XTB + vstupenky / Exact Today Plan 56.1',body,[{label:'After Action 56.4',value:'preview',primary:true},{label:'Recheck Triggers 56.2',value:'recheck'},{label:'Zavřít',value:null}]);
 if(choice==='preview'){const m=await import('./afterActionPreview564.js');return m.openAfterActionPreview564()}
 if(choice==='recheck'){const m=await import('./recheckTriggers562.js');return m.openRecheckTriggers562()}
 return choice;
}
