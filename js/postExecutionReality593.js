import {store} from './state.js';
import {h,modal} from './utils.js';
import {executionReconciliation592} from './executionReconciliation592.js';

const A=v=>Array.isArray(v)?v:[];
const U=v=>String(v||'').toUpperCase();
const num=v=>{if(v===null||v===undefined||v==='')return null;const n=Number(v);return Number.isFinite(n)?n:null};
const approx=(a,b,t=.001)=>{const x=num(a),y=num(b);if(x===null||y===null)return false;return Math.abs(x-y)<=Math.max(.0001,Math.abs(y)*t)};
const round=(v,d=2)=>{const n=num(v);if(n===null)return null;const k=10**d;return Math.round(n*k)/k};
const fmtQty=v=>num(v)===null?'UNKNOWN':Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:4});
const fmtMoney=(v,c='CZK')=>{const n=num(v);if(n===null)return'UNKNOWN';try{return new Intl.NumberFormat('cs-CZ',{style:'currency',currency:U(c||'CZK'),maximumFractionDigits:U(c)==='CZK'?0:2}).format(n)}catch{return`${n.toLocaleString('cs-CZ',{maximumFractionDigits:2})} ${U(c||'CZK')}`}};
const labels={MATCH:'ODPOVÍDÁ',PARTIAL:'ČÁSTEČNĚ',MISMATCH:'NESOUHLASÍ',UNKNOWN:'UNKNOWN'};
const tones={MATCH:'good',PARTIAL:'warn',MISMATCH:'bad',UNKNOWN:'warn'};

function latestReceipts(s){const m=new Map();for(const r of A(s.marketExecutionHistory?.receipts))if(r?.key)m.set(r.key,r);return m}
function gross(q,p){const a=num(q),b=num(p);return a!==null&&b!==null?a*b:null}
function plannedGross(r){const explicit=num(r?.proposedAmount);return explicit!==null?explicit:gross(r?.proposedQty,r?.proposedPrice)}
function actualGross(r){return gross(r?.actualQty,r?.actualPrice)}
function qtyAfter(row){const raw=num(row?.current?.qty);if(raw!==null)return raw;return row?.code==='CONFIRMED'&&['SELL','TRIM'].includes(U(row?.verdict))?0:null}
function postWeight(s,row){
 if(U(row?.domain)!=='XTB')return null;
 const total=num(s.xtbReport?.czkValue),v=num(row?.current?.reportValue);
 if(row?.code==='CONFIRMED'&&['SELL','TRIM'].includes(U(row?.verdict))&&qtyAfter(row)===0)return 0;
 return total!==null&&total>0&&v!==null?round(v/total*100,1):null;
}
function stateDelta(row){
 const beforeQty=num(row?.before?.qty),afterQty=qtyAfter(row),beforeList=num(row?.before?.listPrice),afterList=num(row?.current?.listPrice);
 return{qtyBefore:beforeQty,qtyAfter:afterQty,qtyDelta:beforeQty!==null&&afterQty!==null?round(afterQty-beforeQty,4):null,listBefore:beforeList,listAfter:afterList,listDelta:beforeList!==null&&afterList!==null?round(afterList-beforeList,2):null,workflowBefore:row?.before?.workflow||null,workflowAfter:row?.current?.workflow||null};
}
function executionComparison(receipt,row){
 const proposedQty=num(receipt?.proposedQty),actualQty=num(receipt?.actualQty),proposedPrice=num(receipt?.proposedPrice),actualPrice=num(receipt?.actualPrice),pg=plannedGross(receipt),ag=actualGross(receipt),reasons=[],unknown=[];
 const qtyKnown=proposedQty!==null&&actualQty!==null,priceRelevant=['BUY','SELL','REPRICE','TRIM'].includes(U(row.verdict)),priceKnown=proposedPrice!==null&&actualPrice!==null;
 if(proposedQty!==null&&actualQty===null)unknown.push('skutečné execution množství');
 if(priceRelevant&&proposedPrice!==null&&actualPrice===null)unknown.push('skutečná execution cena');
 if(ag===null&&['BUY','SELL','TRIM'].includes(U(row.verdict)))unknown.push('hrubá hodnota transakce');
 if(['BUY','SELL','TRIM'].includes(U(row.verdict)))unknown.push('čistý cash po fees / FX');
 if(qtyKnown&&!approx(proposedQty,actualQty,.001))reasons.push(`množství plán ${fmtQty(proposedQty)} vs. receipt ${fmtQty(actualQty)}`);
 const priceDiffPct=priceKnown&&proposedPrice!==0?round((actualPrice-proposedPrice)/proposedPrice*100,2):null;
 if(priceDiffPct!==null&&Math.abs(priceDiffPct)>2)reasons.push(`cena se od plánu liší o ${priceDiffPct>0?'+':''}${priceDiffPct}%`);
 const grossDiff=pg!==null&&ag!==null?round(ag-pg,2):null;
 return{proposedQty,actualQty,proposedPrice,actualPrice,plannedGross:pg,actualGross:ag,grossDiff,priceDiffPct,reasons,unknown};
}
function realityStatus(row,cmp){
 if(row.code==='WAIT_REFRESH')return{code:'UNKNOWN',reason:'Bez nového zdrojového stavu nelze dopad po ruční akci ověřit.'};
 if(row.code==='MISMATCH')return{code:'MISMATCH',reason:'Nový zdrojový stav odporuje execution receiptu.'};
 if(row.code==='PARTIAL')return{code:'PARTIAL',reason:'Nový stav potvrzuje jen část očekávaného dopadu.'};
 if(row.code==='CONFIRMED'&&cmp.reasons.length)return{code:'PARTIAL',reason:'Zdrojový dopad je potvrzen, ale skutečné provedení se liší od původního plánu.'};
 if(row.code==='CONFIRMED')return{code:'MATCH',reason:'Nový zdrojový stav potvrzuje ruční akci a známé execution hodnoty neodporují plánu.'};
 return{code:'UNKNOWN',reason:'Dostupná data nestačí pro bezpečné vyhodnocení.'};
}
function buildRow(s,row,receipt){
 const cmp=executionComparison(receipt||{},row),state=stateDelta(row),status=realityStatus(row,cmp),weight=postWeight(s,row),unknown=[...cmp.unknown];
 if(U(row.domain)==='XTB'&&weight===null)unknown.push('post-action váha z CZK valuace');
 if(row.code==='WAIT_REFRESH')unknown.push('nový zdrojový stav');
 const evidence=[`59.2: ${row.status}`];
 if(state.qtyBefore!==null&&state.qtyAfter!==null)evidence.push(`qty ${fmtQty(state.qtyBefore)} → ${fmtQty(state.qtyAfter)}`);
 if(state.listBefore!==null&&state.listAfter!==null)evidence.push(`list ${fmtMoney(state.listBefore,row.currency)} → ${fmtMoney(state.listAfter,row.currency)}`);
 if(cmp.actualQty!==null)evidence.push(`receipt qty ${fmtQty(cmp.actualQty)}`);
 if(cmp.actualPrice!==null)evidence.push(`receipt cena ${fmtMoney(cmp.actualPrice,row.currency)}`);
 return{...row,realityCode:status.code,realityStatus:labels[status.code],realityTone:tones[status.code],realityReason:status.reason,receipt:receipt||null,comparison:cmp,state,postWeightPct:weight,evidence,unknown:[...new Set(unknown)]};
}

export function postExecutionReality593(s=store.get()){
 const started=performance.now(),rec=executionReconciliation592(s),receipts=latestReceipts(s),rows=rec.rows.map(x=>buildRow(s,x,receipts.get(x.key))),counts={match:0,partial:0,mismatch:0,unknown:0};
 for(const x of rows){if(x.realityCode==='MATCH')counts.match++;else if(x.realityCode==='PARTIAL')counts.partial++;else if(x.realityCode==='MISMATCH')counts.mismatch++;else counts.unknown++}
 const summary=!rows.length?'Zatím není co porovnávat.':counts.mismatch?`${counts.mismatch} ruční akce má skutečný stav v rozporu s receiptem.`:counts.partial?`${counts.partial} ruční akce odpovídá jen částečně původnímu plánu / novému stavu.`:counts.unknown?`${counts.unknown} ruční akce zatím nemá dost důkazů pro reality check.`:'Známé dopady posledních ručních akcí odpovídají plánu a novým zdrojovým datům.';
 const out={rows,counts,summary,total:rows.length,generatedAt:new Date().toISOString()};
 if(typeof window!=='undefined')window.__KAMIL_POST_EXECUTION_593_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),total:rows.length,...counts};
 return out;
}

const rowHtml=x=>{const c=x.comparison,s=x.state,capital=c.actualGross===null?'UNKNOWN':fmtMoney(c.actualGross,x.currency),impact=U(x.domain)==='XTB'?`qty ${fmtQty(s.qtyBefore)} → ${fmtQty(s.qtyAfter)} · post váha ${x.postWeightPct===null?'UNKNOWN':`${x.postWeightPct}%`}`:`inventory ${fmtQty(s.qtyBefore)} → ${fmtQty(s.qtyAfter)}${s.listBefore!==null||s.listAfter!==null?` · list ${fmtMoney(s.listBefore,x.currency)} → ${fmtMoney(s.listAfter,x.currency)}`:''}`;return`<div class="intel-row"><div class="intel-main"><b>${h(x.instruction)}</b><span>${h(`${x.realityReason} · ${impact}`)}</span><span>${h(`Plán qty/cena: ${fmtQty(c.proposedQty)} / ${fmtMoney(c.proposedPrice,x.currency)} · receipt: ${fmtQty(c.actualQty)} / ${fmtMoney(c.actualPrice,x.currency)} · doložitelná hrubá hodnota: ${capital}`)}</span>${x.unknown.length?`<span>${h(`UNKNOWN: ${x.unknown.join(' · ')}`)}</span>`:''}</div><div class="row-actions"><span class="decision-action ${x.realityTone}">${h(x.realityStatus)}</span></div></div>`};

export async function openPostExecutionReality593(){
 const x=postExecutionReality593(),body=`<div class="metric-strip"><div class="metric"><span>Odpovídá</span><b class="good">${x.counts.match}</b></div><div class="metric"><span>Částečně</span><b class="warn">${x.counts.partial}</b></div><div class="metric"><span>Nesouhlasí</span><b class="bad">${x.counts.mismatch}</b></div><div class="metric"><span>Unknown</span><b>${x.counts.unknown}</b></div></div><div class="card"><div class="eyebrow">POST-EXECUTION REALITY CHECK 59.3</div><h2>${h(x.summary)}</h2><p>59.3 odděluje původní plán, ručně potvrzený execution receipt a nový uložený zdrojový stav. UNKNOWN znamená, že změnu nelze z dostupných dat bezpečně doložit; není to odhad.</p></div><div class="card"><div class="eyebrow">PLÁN → RECEIPT → REALITA</div>${x.rows.slice(0,12).map(rowHtml).join('')||'<div class="empty">Zatím není co kontrolovat.</div>'}</div><div class="decision-note">Hrubá hodnota = pouze qty × ručně zadaná execution cena (nebo explicitní plánovaná částka). 59.3 z ní neodvozuje čistý broker cash, poplatky ani FX. XTB execution cenu nikdy nebere z aktuální portfolio ceny. Vše je read-only; nic se neobchoduje, neprodává ani nepřecenňuje.</div>`;
 const choice=await modal('XTB + vstupenky / Post-Execution Reality Check 59.3',body,[{label:'Blockery 59.4',value:'blockers',primary:true},{label:'Zavřít',value:null}]);
 if(choice==='blockers'){const m=await import('./commanderBlocker594.js');return m.openCommanderBlocker594()}
 return choice;
}
