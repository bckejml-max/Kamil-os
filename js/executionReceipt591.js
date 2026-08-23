import {store} from './state.js';
import {h,formModal,modal,uid} from './utils.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const tickerOf=x=>U(first(x?.ticker,x?.symbol,x?.name,''));
const domainOf=x=>U(x?.domain)==='XTB'?'XTB':/VSTUP|TICKET/.test(U(x?.domain))?'TICKET':x?.ticker?'XTB':x?.id?'TICKET':'UNKNOWN';
const num=v=>{const s=String(v??'').trim().replace(/\s/g,'').replace(',','.');if(!s)return null;const n=Number(s);return Number.isFinite(n)&&n>=0?n:null};
const fmt=(v,c='CZK')=>{if(v===null||v===undefined||!Number.isFinite(Number(v)))return '—';try{return new Intl.NumberFormat('cs-CZ',{style:'currency',currency:U(c||'CZK'),maximumFractionDigits:U(c)==='CZK'?0:2}).format(Number(v))}catch{return `${Number(v).toLocaleString('cs-CZ')} ${U(c)}`}};

export function executionActionKey591(action={}){
 const domain=domainOf(action);
 if(domain==='XTB')return `XTB:${tickerOf(action)}`;
 if(domain==='TICKET')return `TICKET:${String(first(action.id,action.ticketId,action.name,''))}`;
 return `UNKNOWN:${String(first(action.key,action.name,''))}`;
}

function xtbPosition(s,ticker){
 const t=U(ticker);for(const account of Object.values(s.xtbHub?.accounts||{})){const p=A(account?.positions).find(x=>tickerOf(x)===t);if(p)return{p,account}}
 return{p:A(s.xtbReport?.positions).find(x=>tickerOf(x)===t)||null,account:null};
}
function ticketItem(s,id){return A(s.ticketBook?.items).find(x=>String(x.id)===String(id))||null}

export function actionFingerprint591(s=store.get(),action={}){
 const domain=domainOf(action);
 if(domain==='XTB'){
  const ticker=tickerOf(action),{p,account}=xtbPosition(s,ticker),report=A(s.xtbReport?.positions).find(x=>tickerOf(x)===ticker)||null;
  return JSON.stringify({domain,ticker,hubAsOf:first(s.xtbHub?.asOf,null),reportAsOf:first(s.xtbReport?.asOf,null),accountCurrency:account?.currency||null,qty:first(p?.volume,p?.qty,p?.quantity,p?.units,null),hubValue:first(p?.value,p?.marketValue,null),reportValue:first(report?.valueCZK,report?.valueCzk,report?.marketValueCZK,null),reportProfit:first(report?.profitCZK,report?.profitCzk,report?.profit,null),price:first(p?.marketPrice,p?.currentPrice,p?.price,report?.marketPrice,report?.price,null)});
 }
 if(domain==='TICKET'){
  const id=first(action.id,action.ticketId),x=ticketItem(s,id);
  return JSON.stringify({domain,id:String(id??''),workflow:x?.workflow||null,qty:first(x?.qty,x?.quantity,null),listPrice:first(x?.listPrice,null),marketPrice:first(x?.marketPrice,null),marketCheckedAt:first(x?.marketCheckedAt,x?.marketUpdatedAt,x?.priceCheckedAt,null),transferStatus:x?.transferStatus||null,sellBy:first(x?.sellBy,x?.date,null)});
 }
 return JSON.stringify({domain:'UNKNOWN',key:executionActionKey591(action)});
}

export function latestExecutionReceipt591(s=store.get(),action={}){
 const key=executionActionKey591(action),rows=A(s.marketExecutionHistory?.receipts);for(let i=rows.length-1;i>=0;i--)if(rows[i]?.key===key)return rows[i];return null;
}
export function pendingExecutionReceipt591(s=store.get(),action={}){
 const receipt=latestExecutionReceipt591(s,action);if(!receipt?.fingerprint)return null;return receipt.fingerprint===actionFingerprint591(s,action)?receipt:null;
}
export function receiptRefreshInstruction591(action={}){
 return domainOf(action)==='XTB'?'Nahraj nový XTB import a spusť Commander znovu.':'Aktualizuj ticket inventory / list cenu a spusť Commander znovu.';
}

export function saveExecutionReceipt591(action={},values={}){
 const domain=domainOf(action),key=executionActionKey591(action),at=new Date().toISOString(),actualQty=num(values.actualQty),actualPrice=num(values.actualPrice),receipt={id:uid('market-exec'),at,domain,key,ticker:domain==='XTB'?tickerOf(action):null,idRef:domain==='TICKET'?first(action.id,action.ticketId):null,verdict:U(first(action.verdict,action.action,'')),instruction:first(action.instruction,action.what,action.name,''),currency:U(first(action.currency,action.capitalCurrency,'CZK')),proposedQty:first(action.proposedQty,action.exactQty,action.qty,null),proposedPrice:first(action.proposedPrice,action.targetPrice,action.price,null),proposedAmount:first(action.proposedAmount,action.capitalAmount,null),actualQty,actualPrice,note:String(values.note||'').trim().slice(0,500),fingerprint:actionFingerprint591(store.get(),action),source:'MANUAL_CONFIRMATION_59_1'};
 store.mutate('Market execution receipt 59.1',s=>{s.marketExecutionHistory=s.marketExecutionHistory||{receipts:[]};s.marketExecutionHistory.receipts=A(s.marketExecutionHistory.receipts);s.marketExecutionHistory.receipts.push(receipt);s.marketExecutionHistory.receipts=s.marketExecutionHistory.receipts.slice(-60)});
 window.__KAMIL_EXECUTION_RECEIPT_591_LAST__={at:Date.now(),key:receipt.key,verdict:receipt.verdict,actualQty,actualPrice};return receipt;
}

export async function currentCommanderAction591(){
 const m=await import('./marketCommander587.js'),d=m.commanderDecision590(store.get()),step=d.technical?.risk?.steps?.[0]||d.technical?.exact?.now?.[0]||null;
 if(d.mode!=='ACT'||!step)return{decision:d,action:null};
 const action={domain:step.domain,ticker:step.ticker,id:step.id,name:step.name,verdict:first(step.verdict,step.originalAction),instruction:first(step.instruction,d.what),currency:first(step.capitalCurrency,step.currency,d.currency,'CZK'),proposedQty:first(step.exactQty,step.qty,null),proposedPrice:first(step.targetPrice,step.price,null),proposedAmount:first(step.capitalAmount,null)};
 return{decision:d,action};
}

export async function openExecutionReceipt591(){
 const {decision,action}=await currentCommanderAction591();
 if(!action)return modal('Execution check-in 59.1','<div class="card"><div class="eyebrow">ŽÁDNÁ AKCE K POTVRZENÍ</div><h2>Commander teď nemá ruční ACT krok.</h2><p>Nic se nezapisuje. Nejdřív vyřeš VERIFY / WAIT stav nebo obnov data.</p></div>',[{label:'Zavřít',value:null,primary:true}]);
 const pending=pendingExecutionReceipt591(store.get(),action);if(pending)return modal('Execution check-in 59.1',`<div class="card"><div class="eyebrow">UŽ POTVRZENO</div><h2>${h(action.instruction)}</h2><p>Stejná ruční akce už má receipt z ${h(new Date(pending.at).toLocaleString('cs-CZ'))}. ${h(receiptRefreshInstruction591(action))}</p></div>`,[{label:'Zavřít',value:null,primary:true}]);
 const form=await formModal('Ručně provedená akce 59.1',`<div class="card"><div class="eyebrow">EXECUTION CHECK-IN</div><h2>${h(action.instruction)}</h2><p>Návrh: ${h(decision.howMuch)} · ${h(decision.atPrice)}. Zadej skutečně provedené hodnoty; prázdné pole zůstane neznámé.</p></div><label>Skutečné množství<input name="actualQty" inputmode="decimal" value="${h(action.proposedQty??'')}"></label><label>Skutečná cena za kus<input name="actualPrice" inputmode="decimal" value="${h(action.proposedPrice??'')}"></label><label>Poznámka<textarea name="note" rows="3" placeholder="volitelné"></textarea></label>`,{submitLabel:'Pokračovat k potvrzení',cancelLabel:'Zrušit'});
 if(!form)return null;
 const actualQty=num(form.actualQty),actualPrice=num(form.actualPrice),currency=U(action.currency||'CZK'),confirm=await modal('Potvrdit execution receipt',`<div class="card"><div class="eyebrow">JEN ZÁZNAM</div><h2>${h(action.instruction)}</h2><p>Množství: <b>${h(actualQty??'—')}</b> · skutečná cena: <b>${h(actualPrice===null?'—':fmt(actualPrice,currency))}</b>.</p><p>Toto pouze uloží ručně potvrzený záznam. Neupraví XTB pozici, ticket inventory, list cenu ani nic neodešle na burzu/prodejní platformu.</p></div>`,[{label:'Potvrdit záznam',value:'yes',primary:true},{label:'Zrušit',value:null}]);
 if(confirm!=='yes')return null;
 const receipt=saveExecutionReceipt591(action,{...form,actualQty,actualPrice});
 await modal('Execution receipt uložen',`<div class="empty success-empty">Ruční akce je zaznamenaná. Dokud se nezmění zdrojová market data, 59.1 ji nebude považovat za nový krok. ${h(receiptRefreshInstruction591(action))}</div>`,[{label:'Hotovo',value:null,primary:true}]);
 return receipt;
}
