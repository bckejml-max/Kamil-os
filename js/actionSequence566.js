import {store} from './state.js';
import {h,modal} from './utils.js';
import {bestNextMove565} from './bestNextMove565.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const clone=v=>typeof structuredClone==='function'?structuredClone(v):JSON.parse(JSON.stringify(v));
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const tickerOf=x=>U(first(x?.ticker,x?.symbol,x?.name,''));
const fmt=(v,currency='CZK')=>{if(!Number.isFinite(Number(v)))return '—';const c=U(currency||'CZK');try{return new Intl.NumberFormat('cs-CZ',{style:'currency',currency:c,maximumFractionDigits:c==='CZK'?0:2}).format(Number(v))}catch{return `${Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:2})} ${c}`}};
const actionable=x=>['BUY','SELL','REPRICE'].includes(U(x?.verdict));

function setQty(p,v){if(!p)return;if('volume'in p)p.volume=v;else if('qty'in p)p.qty=v;else if('quantity'in p)p.quantity=v;else p.units=v}
function getQty(p){return N(first(p?.volume,p?.qty,p?.quantity,p?.units))}
function findHub(s,ticker){for(const account of Object.values(s.xtbHub?.accounts||{})){const i=A(account?.positions).findIndex(x=>tickerOf(x)===U(ticker));if(i>=0)return{account,index:i,p:account.positions[i]}}return null}
function findReport(s,ticker){const rows=A(s.xtbReport?.positions),index=rows.findIndex(x=>tickerOf(x)===U(ticker));return index>=0?{rows,index,p:rows[index]}:null}
function setReportValue(p,v){if(!p||!Number.isFinite(Number(v)))return;if('valueCZK'in p)p.valueCZK=v;else if('valueCzk'in p)p.valueCzk=v;else p.valueCZK=v}

function applyXtb(s,row){
 const p=row.preview;if(!p?.canSimulate)return{ok:false,stop:true,note:'Další krok nelze bezpečně přepočítat: chybí spolehlivá CZK valuace.'};
 const hub=findHub(s,row.ticker),report=findReport(s,row.ticker),qtyBefore=N(p.qtyBefore),qtyAfter=N(p.qtyAfter),posBefore=N(p.posCzkBefore),posAfter=N(p.posCzkAfter),totalAfter=N(p.totalCzkAfter),delta=posAfter-posBefore;
 if(hub){setQty(hub.p,qtyAfter);const accountCurrency=U(first(hub.account?.currency,''));if(accountCurrency==='CZK'&&Number.isFinite(Number(hub.p.value)))hub.p.value=Math.max(0,N(hub.p.value)+delta);if(accountCurrency==='CZK'&&Number.isFinite(Number(hub.account.value)))hub.account.value=Math.max(0,N(hub.account.value)+delta);if(qtyAfter<=0)hub.account.positions.splice(hub.index,1)}
 if(report){const ratio=qtyBefore>0?Math.max(0,Math.min(1,qtyAfter/qtyBefore)):1;setReportValue(report.p,posAfter);if(Number.isFinite(Number(report.p.profitCZK)))report.p.profitCZK=N(report.p.profitCZK)*ratio;if(Number.isFinite(Number(report.p.profitCzk)))report.p.profitCzk=N(report.p.profitCzk)*ratio;if(qtyAfter<=0)report.rows.splice(report.index,1)}
 if(s.xtbReport&&Number.isFinite(Number(s.xtbReport.czkValue)))s.xtbReport.czkValue=Math.max(0,totalAfter);
 return{ok:true,stop:false,note:`XTB simulace: ${qtyBefore||'—'} → ${qtyAfter||0} ks · váha ${p.weightBefore??'—'} % → ${p.weightAfter??'—'} %.`};
}

function applyTicket(s,row){
 const items=A(s.ticketBook?.items),i=items.findIndex(x=>String(x.id)===String(row.id));if(i<0)return{ok:false,stop:true,note:'Ticket už v simulovaném inventory není.'};
 const item=items[i],action=U(row.verdict),qtyBefore=getQty(item)||Math.max(1,N(item.qty)||1);
 if(action==='REPRICE'){
  const target=N(row.targetPrice||row.preview?.targetPrice);if(!target)return{ok:false,stop:true,note:'Bez podložené target ceny nelze repricing virtuálně aplikovat.'};item.listPrice=target;return{ok:true,stop:false,note:`Ticket simulace: inventory ${qtyBefore} ks zůstává · list price → ${fmt(target)} / ks.`};
 }
 if(action==='SELL'){
  const step=Math.min(qtyBefore,Math.max(1,N(row.exactQty||row.preview?.qtyStep)||qtyBefore)),qtyAfter=Math.max(0,qtyBefore-step);setQty(item,qtyAfter);if(Number.isFinite(Number(item.buy))&&qtyBefore>0)item.buy=N(item.buy)*(qtyAfter/qtyBefore);if(qtyAfter<=0)item.workflow='SOLD';return{ok:true,stop:false,note:`Ticket simulace: inventory ${qtyBefore} → ${qtyAfter} ks.`};
 }
 return{ok:false,stop:true,note:'Nepodporovaná ticket akce.'};
}

function flowAdd(map,row){if(!row.capitalDirection||!row.capitalAmount||!row.capitalCurrency)return;const c=U(row.capitalCurrency),x=map.get(c)||{release:0,use:0};if(row.capitalDirection==='RELEASE')x.release+=N(row.capitalAmount);if(row.capitalDirection==='USE')x.use+=N(row.capitalAmount);map.set(c,x)}
function flowText(map){return[...map.entries()].map(([c,x])=>`${c}: +${fmt(x.release,c)} / -${fmt(x.use,c)}${x.release||x.use?` · net ${fmt(x.release-x.use,c)}`:''}`).join(' · ')||'Bez potvrzeného cash flow.'}

export function actionSequence566(s=store.get(),limit=3){
 const started=performance.now(),virtual=clone(s),done=new Set(),flows=new Map(),steps=[],skipped=[];let stopReason='';
 const max=Math.max(1,Math.min(5,Number(limit)||3));
 for(let guard=0;guard<12&&steps.length<max;guard++){
  const ranked=bestNextMove565(virtual),candidate=A(ranked.rows).find(x=>actionable(x)&&!done.has(x.key));
  if(!candidate)break;done.add(candidate.key);
  const before={xtbCzkValue:N(virtual.xtbReport?.czkValue)||null,activeTickets:A(virtual.ticketBook?.items).filter(x=>!['SOLD','CANCELLED'].includes(U(x.workflow))).length};
  const applied=candidate.domain==='XTB'?applyXtb(virtual,candidate):applyTicket(virtual,candidate);
  if(!applied.ok){skipped.push({...candidate,reason:applied.note});if(applied.stop){stopReason=applied.note;break}continue}
  flowAdd(flows,candidate);
  const after={xtbCzkValue:N(virtual.xtbReport?.czkValue)||null,activeTickets:A(virtual.ticketBook?.items).filter(x=>!['SOLD','CANCELLED'].includes(U(x.workflow))).length};
  steps.push({...candidate,sequence:steps.length+1,recalcNote:applied.note,stateBefore:before,stateAfter:after});
  if(applied.stop){stopReason=applied.note;break}
 }
 const nextRanked=stopReason?null:bestNextMove565(virtual),next=A(nextRanked?.rows).find(x=>actionable(x)&&!done.has(x.key))||null,summary=steps.length?`Sekvence ${steps.length} ručních kroků je přepočítaná po každém virtuálním provedení.`:'Teď není bezpečná akční sekvence k provedení.';
 const result={steps,skipped,next,stopReason,flowText:flowText(flows),summary,total:steps.length,generatedAt:new Date().toISOString()};
 window.__KAMIL_ACTION_SEQUENCE_566_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),steps:steps.length,stopped:!!stopReason,next:next?.key||null};return result;
}

const row=x=>`<div class="intel-row"><div class="intel-main"><b>${h(`${x.sequence}. ${x.instruction||x.name||x.ticker}`)}</b><span>${h(`${x.recalcNote} · score ${x.score}/100 · confidence ${x.confidence}%`)}</span></div><div class="row-actions"><span class="decision-action good">KROK ${x.sequence}</span></div></div>`;

export async function openActionSequence566(){
 const x=actionSequence566(),body=`<div class="metric-strip"><div class="metric"><span>Kroky</span><b class="good">${x.total}</b></div><div class="metric"><span>Další po sekvenci</span><b>${h(x.next?.instruction||x.next?.name||'—')}</b></div><div class="metric"><span>Stop</span><b class="${x.stopReason?'warn':'good'}">${x.stopReason?'ANO':'NE'}</b></div></div><div class="card"><div class="eyebrow">ACTION SEQUENCE 56.6</div><h2>${h(x.summary)}</h2><p>Po každém kroku se další pořadí znovu počítá nad virtuálně změněným portfoliem / ticket inventory.</p></div><div class="card"><div class="eyebrow">1 → 2 → 3</div>${x.steps.map(row).join('')||'<div class="empty success-empty">Žádná ověřená akce teď není nutná.</div>'}</div><div class="card"><div class="eyebrow">KAPITÁL PO SEKVENCI</div><p>${h(x.flowText)}</p>${x.stopReason?`<p class="warn">${h(x.stopReason)}</p>`:''}</div><div class="decision-note">56.6 je pouze virtuální sekvence. Stav se nikam nezapisuje a nic se neobchoduje ani nepřecenňuje. Uvolněný kapitál se automaticky nepřelévá mezi tickety a XTB ani mezi měnami; bez spolehlivé CZK valuace se sekvence raději zastaví.</div>`;
 return modal('XTB + vstupenky / Action Sequence 56.6',body,[{label:'Zavřít',value:null,primary:true}]);
}
