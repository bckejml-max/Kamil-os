import {store} from './state.js';
import {h,modal} from './utils.js';
import {exactTodayPlan561} from './exactTodayPlan561.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const round=(v,d=1)=>{const n=Number(v);if(!Number.isFinite(n))return null;const k=10**d;return Math.round(n*k)/k};
const fmt=(v,currency='CZK')=>{if(!Number.isFinite(Number(v)))return '—';const c=U(currency||'CZK');try{return new Intl.NumberFormat('cs-CZ',{style:'currency',currency:c,maximumFractionDigits:c==='CZK'?0:2}).format(Number(v))}catch{return `${Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:2})} ${c}`}};
const tickerOf=x=>U(first(x?.ticker,x?.symbol,x?.name,''));

function hubPosition(s,ticker){
 for(const [accountKey,account] of Object.entries(s.xtbHub?.accounts||{})){
  const p=A(account?.positions).find(x=>tickerOf(x)===U(ticker));
  if(p)return{p,currency:U(first(account?.currency,accountKey,''))};
 }
 return{p:null,currency:null};
}
function reportPosition(s,ticker){return A(s.xtbReport?.positions).find(x=>tickerOf(x)===U(ticker))||null}
function reportValueCzk(p){return N(first(p?.valueCZK,p?.valueCzk,p?.marketValueCZK,p?.marketValueCzk,p?.czkValue))||null}
function currentQty(p){return N(first(p?.volume,p?.qty,p?.quantity,p?.units))||null}
function weightStatus(w){if(!Number.isFinite(Number(w)))return 'NEZNÁMÉ';if(w>=12)return 'VYSOKÁ KONCENTRACE';if(w>=10)return 'POZOR';return 'OK'}

function previewXtb(row,s,totalCzk){
 const rp=reportPosition(s,row.ticker),hub=hubPosition(s,row.ticker),qtyBefore=currentQty(hub.p),qtyStep=N(row.exactQty)||null,explicitWeight=N(first(rp?.weightPct,rp?.weight))||null;
 let posCzk=reportValueCzk(rp);if(!posCzk&&explicitWeight&&totalCzk)posCzk=totalCzk*explicitWeight/100;
 const weightBefore=posCzk&&totalCzk?round(posCzk/totalCzk*100):explicitWeight||null,action=U(row.verdict),amountCzk=row.capitalCurrency==='CZK'&&N(row.capitalAmount)>0?N(row.capitalAmount):null;
 let deltaCzk=null,qtyAfter=qtyBefore,reason='';
 if(action==='BUY'){
  if(amountCzk)deltaCzk=amountCzk;else reason='BUY nelze převést do CZK preview bez spolehlivé CZK částky.';
  if(qtyBefore!==null&&qtyStep!==null)qtyAfter=qtyBefore+qtyStep;
 }else if(action==='SELL'){
  if(posCzk&&qtyBefore&&qtyStep){deltaCzk=-Math.min(posCzk,posCzk*Math.min(1,qtyStep/qtyBefore));}
  else if(amountCzk)deltaCzk=-Math.min(posCzk||amountCzk,amountCzk);
  else reason='SELL nelze převést do váhového preview bez CZK hodnoty pozice a prodávaného množství.';
  if(qtyBefore!==null&&qtyStep!==null)qtyAfter=Math.max(0,qtyBefore-qtyStep);
 }
 const canSimulate=posCzk!==null&&totalCzk>0&&deltaCzk!==null,newPos=canSimulate?Math.max(0,posCzk+deltaCzk):null,newTotal=canSimulate?Math.max(0,totalCzk+deltaCzk):null,weightAfter=canSimulate&&newTotal>0?round(newPos/newTotal*100):null;
 return{domain:'XTB',name:row.name||row.ticker,ticker:row.ticker,action,confidence:row.confidence,canSimulate,qtyBefore,qtyStep,qtyAfter,posCzkBefore:posCzk,posCzkAfter:newPos,totalCzkBefore:totalCzk||null,totalCzkAfter:newTotal,weightBefore,weightAfter,concentrationBefore:weightStatus(weightBefore),concentrationAfter:weightStatus(weightAfter),capitalEffect:row.capitalEffect,reason:reason||'Simulace používá uloženou CZK valuaci; nejde o exekuci ani budoucí cenu.'};
}

function previewTicket(row,s){
 const item=A(s.ticketBook?.items).find(x=>String(x.id)===String(row.id))||{},qtyBefore=Math.max(0,N(first(item.qty,item.quantity,1))),step=Math.max(0,N(row.exactQty)||qtyBefore),action=U(row.verdict),qtyAfter=action==='SELL'?Math.max(0,qtyBefore-step):qtyBefore,target=N(row.targetPrice)||null,safe=N(row.safePrice)||null,net=row.conditionalNetRevenue===null?null:N(row.conditionalNetRevenue),profit=row.conditionalProfit===null?null:N(row.conditionalProfit);
 return{domain:'Vstupenky',id:row.id,name:row.name||item.name||'Vstupenka',action,confidence:row.confidence,qtyBefore,qtyStep:step,qtyAfter,targetPrice:target,safePrice:safe,conditionalNetRevenue:net,conditionalProfit:profit,capitalEffect:row.capitalEffect,reason:action==='SELL'?`Po navrženém prodeji zbude ${qtyAfter} ks.`:action==='REPRICE'?`Inventory zůstává ${qtyAfter} ks; mění se jen nabídková cena.`:'Bez změny inventory.'};
}

export function afterActionPreview564(s=store.get()){
 const started=performance.now(),plan=exactTodayPlan561(s),totalCzk=N(s.xtbReport?.czkValue),xtb=plan.now.filter(x=>x.domain==='XTB').map(x=>previewXtb(x,s,totalCzk)),tickets=plan.now.filter(x=>x.domain==='Vstupenky').map(x=>previewTicket(x,s));
 const simulated=xtb.filter(x=>x.canSimulate),unknown=xtb.filter(x=>!x.canSimulate),concentrationWarnings=simulated.filter(x=>x.concentrationAfter==='VYSOKÁ KONCENTRACE'),ticketSales=tickets.filter(x=>x.action==='SELL'),ticketReprices=tickets.filter(x=>x.action==='REPRICE'),ticketNet=ticketSales.reduce((a,x)=>a+N(x.conditionalNetRevenue),0),ticketProfit=ticketSales.reduce((a,x)=>a+N(x.conditionalProfit),0);
 const summary=!plan.now.length?'Žádná ověřená akce k simulaci.':concentrationWarnings.length?`${concentrationWarnings.length} XTB kroků by po simulaci nechalo vysokou koncentraci.`:`Simulace ${plan.now.length} dnešních ručních kroků je připravená.`;
 const result={plan,xtb,tickets,simulated,unknown,concentrationWarnings,ticketSales,ticketReprices,ticketNet,ticketProfit,summary,total:plan.now.length,generatedAt:new Date().toISOString()};window.__KAMIL_AFTER_ACTION_564_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),total:plan.now.length,xtb:xtb.length,tickets:tickets.length,unknown:unknown.length};return result;
}

const xtbRow=x=>`<div class="intel-row"><div class="intel-main"><b>${h(`${x.action} ${x.ticker||x.name}`)}</b><span>${h(x.canSimulate?[`váha ${x.weightBefore??'—'} % → ${x.weightAfter??'—'} %`,`qty ${x.qtyBefore??'—'} → ${x.qtyAfter??'—'}`,x.capitalEffect,x.concentrationAfter].filter(Boolean).join(' · '):x.reason)}</span></div><div class="row-actions"><span class="decision-action ${x.canSimulate?(x.concentrationAfter==='VYSOKÁ KONCENTRACE'?'warn':'good'):'warn'}">${h(x.canSimulate?'PREVIEW':'NEÚPLNÉ')}</span><span class="status">${x.confidence}%</span></div></div>`;
const ticketRow=x=>`<div class="intel-row"><div class="intel-main"><b>${h(`${x.action} ${x.name}`)}</b><span>${h([`inventory ${x.qtyBefore} → ${x.qtyAfter}`,x.targetPrice?`cena ${fmt(x.targetPrice)} / ks`:'',x.safePrice?`floor ${fmt(x.safePrice)} / ks`:'',x.conditionalNetRevenue!==null?`net ${fmt(x.conditionalNetRevenue)}`:'',x.conditionalProfit!==null?`P/L ${fmt(x.conditionalProfit)}`:''].filter(Boolean).join(' · '))}</span></div><div class="row-actions"><span class="decision-action good">PREVIEW</span><span class="status">${x.confidence}%</span></div></div>`;

export async function openAfterActionPreview564(){
 const x=afterActionPreview564(),body=`<div class="metric-strip"><div class="metric"><span>Kroky</span><b>${x.total}</b></div><div class="metric"><span>XTB concentration</span><b class="${x.concentrationWarnings.length?'warn':'good'}">${x.concentrationWarnings.length}</b></div><div class="metric"><span>Ticket net při SELL</span><b>${h(fmt(x.ticketNet))}</b></div><div class="metric"><span>Ticket P/L při SELL</span><b class="${x.ticketProfit<0?'bad':'good'}">${h(fmt(x.ticketProfit))}</b></div></div><div class="card"><div class="eyebrow">AFTER ACTION PREVIEW 56.4</div><h2>${h(x.summary)}</h2><p>Co by se matematicky změnilo, kdybys ručně provedl dnešní ověřené XTB + ticket kroky.</p></div><div class="card"><div class="eyebrow">XTB · PŘED → PO</div>${x.xtb.map(xtbRow).join('')||'<div class="empty">Žádná dnešní XTB akce.</div>'}</div><div class="card"><div class="eyebrow">VSTUPENKY · PŘED → PO</div>${x.tickets.map(ticketRow).join('')||'<div class="empty">Žádná dnešní ticket akce.</div>'}</div><div class="decision-note">56.4 je pouze statická simulace nad uloženými daty. Nezapisuje změny a nic nenakupuje, neprodává ani nepřecenňuje. XTB váhový preview se zobrazí jen tam, kde existuje spolehlivá CZK valuace; měny se svévolně nepřevádějí.</div>`;
 const choice=await modal('XTB + vstupenky / After Action 56.4',body,[{label:'Best Next Move 56.5',value:'best',primary:true},{label:'Zavřít',value:null}]);
 if(choice==='best'){const m=await import('./bestNextMove565.js');return m.openBestNextMove565()}
 return choice;
}
