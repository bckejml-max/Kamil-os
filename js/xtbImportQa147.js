import {store} from './state.js';
const N=v=>Number(v||0),A=v=>Array.isArray(v)?v:[];
const qty=p=>N(p?.quantity??p?.qty??p?.volume??p?.units??p?.shares);
const avg=p=>N(p?.open_price??p?.openPrice??p?.avgPrice??p?.averagePrice??p?.purchasePrice??p?.price_open);
const price=p=>N(p?.marketPrice??p?.currentPrice??p?.price);
const value=p=>N(p?.value??p?.marketValue);
const ticker=p=>String(p?.ticker||p?.symbol||'').trim().toUpperCase();
const status=p=>String(p?.status||'ACTIVE').trim().toUpperCase();
const closed=p=>p?.sold===true||['SOLD','CLOSED','ARCHIVED'].includes(status(p));
const rel=(a,b)=>Math.abs(a-b)/Math.max(1,Math.abs(b));
const ageDays=x=>{const t=Date.parse(x||'');return Number.isFinite(t)?Math.max(0,Math.floor((Date.now()-t)/86400000)):null};
function audit(){
 const s=store.get(),accounts=s.xtbHub?.accounts||s.xtbHub?.report?.accounts||{},issues=[],warnings=[],seen=new Map();let rows=0,active=0,closedRows=0,accountCount=0;
 for(const [accountId,a] of Object.entries(accounts)){accountCount++;const ccy=String(a?.currency||'').trim().toUpperCase();if(!ccy)issues.push({code:'ACCOUNT_CURRENCY',label:`Účet ${accountId}: chybí měna`});const positions=A(a?.positions);let sumValue=0;
  for(const p of positions){rows++;const t=ticker(p),q=qty(p),v=value(p),ap=avg(p),mp=price(p),isClosed=closed(p);if(isClosed){closedRows++;continue}active++;sumValue+=Math.max(0,v);
   if(!t)issues.push({code:'TICKER',label:`Účet ${accountId}: pozice bez tickeru`});
   if(!(q>0))issues.push({code:'QTY',label:`${t||'Pozice'}: neplatné množství`});
   if(!(v>0))issues.push({code:'VALUE',label:`${t||'Pozice'}: chybí/není kladná hodnota`});
   if(!(ap>0))warnings.push({code:'BASIS',label:`${t||'Pozice'}: chybí průměrná nákupní cena`});
   const key=`${accountId}|${t}`;if(t){const n=(seen.get(key)||0)+1;seen.set(key,n);if(n===2)issues.push({code:'DUPLICATE',label:`${t}: více aktivních řádků na účtu ${accountId}`})}
   if(q>0&&mp>0&&v>0){const expected=q*mp;if(rel(v,expected)>.12)warnings.push({code:'VALUE_MISMATCH',label:`${t}: hodnota se liší od množství × ceny o ${Math.round(rel(v,expected)*100)} %`})}
   const importedProfit=Number(p?.net_profit??p?.netProfit);if(Number.isFinite(importedProfit)&&q>0&&ap>0&&mp>0){const model=(mp-ap)*q;if(Math.abs(importedProfit-model)>Math.max(5,Math.abs(model)*.2))warnings.push({code:'PL_MISMATCH',label:`${t}: importovaný P/L se výrazně liší od modelu z ceny a cost basis`})}
  }
  const accountValue=N(a?.value??a?.totalValue??a?.marketValue),gap=accountValue>0&&sumValue>0?accountValue-sumValue:null;if(gap!==null&&Math.abs(gap)>Math.max(100,accountValue*.08))warnings.push({code:'ACCOUNT_GAP',label:`Účet ${accountId}: účetní hodnota se liší od součtu pozic; rozdíl může být hotovost (${Math.round(gap).toLocaleString('cs-CZ')})`})
 }
 const asOf=s.xtbHub?.asOf||s.xtbReport?.asOf||s.xtbHub?.updatedAt||null,age=ageDays(asOf);if(age===null)warnings.push({code:'ASOF',label:'XTB import nemá datum stavu'});else if(age>=2)warnings.push({code:'STALE',label:`XTB import je ${age} dní starý`});
 return{accountCount,rows,active,closedRows,issues,warnings,asOf,age};
}
function mount(a){const root=document.querySelector('.dashboard110');if(!root)return;const quality=[...root.querySelectorAll('.d110-bottom .d110-card')].find(x=>x.textContent.includes('DATOVÁ KVALITA'));if(!quality)return;quality.querySelector('[data-xtbimportqa147]')?.remove();const box=document.createElement('div');box.dataset.xtbimportqa147='1';box.innerHTML=`<div class="d110-kpi"><span>Integrita XTB importu</span><b class="${a.issues.length?'bad':a.warnings.length?'stale':'live'}">${a.issues.length?'CHYBA':a.warnings.length?'KONTROLA':'OK'}</b></div><div class="d110-kpi"><span>Aktivní / uzavřené řádky</span><b>${a.active} / ${a.closedRows}</b></div><div class="d110-kpi"><span>Import stáří</span><b class="${a.age!==null&&a.age<2?'live':'stale'}">${a.age===null?'—':a.age===0?'dnes':`${a.age} d`}</b></div>${a.issues.slice(0,3).map(x=>`<small class="bad">${x.label}</small>`).join('')}${a.warnings.slice(0,4).map(x=>`<small>${x.label}</small>`).join('')}`;quality.appendChild(box)}
export function enhanceXtbImportQa147(){const a=audit();mount(a);window.__KAMIL_XTB_IMPORT_QA147__={at:Date.now(),...a};return a}
