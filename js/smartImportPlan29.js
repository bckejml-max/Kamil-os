import {buildImportPlan} from './smartImport29.js';
const ccy=v=>String(v||'CZK').toUpperCase();
const ticker=v=>String(v||'').toUpperCase();
const sameNum=(a,b)=>{if(a===null||a===undefined||a==='')return b===null||b===undefined||b==='';if(b===null||b===undefined||b==='')return false;return Math.abs(Number(a)-Number(b))<1e-9};
function findPosition(state,data){for(const account of Object.values(state.xtbHub?.accounts||{})){if(ccy(account?.currency)!==ccy(data.currency))continue;const p=(account?.positions||[]).find(x=>ticker(x.ticker||x.symbol)===ticker(data.ticker));if(p)return p}return null}
function sameXtb(existing,data){return !!existing&&String(existing.name||'')===String(data.name||'')&&String(existing.category||'')===String(data.category||'')&&sameNum(existing.value,data.value)&&sameNum(existing.volume,data.volume)&&sameNum(existing.net_profit_pct,data.net_profit_pct)}
export function buildSmartImportPlan(state={},preview={accepted:[]}){
 const base=buildImportPlan(state,preview),apply=[...base.apply],duplicates=[];let updateCount=0;
 for(const c of base.duplicates||[]){if(c.kind!=='XTB'){duplicates.push(c);continue}const existing=findPosition(state,c.data);if(existing&&!sameXtb(existing,c.data)){apply.push({...c,mode:'UPDATE'});updateCount++}else duplicates.push(c)}
 const newCount=apply.length-updateCount,byKind={};for(const c of apply)byKind[c.kind]=(byKind[c.kind]||0)+1;
 return {...base,apply,duplicates,byKind,total:apply.length,newCount,updateCount,duplicateCount:duplicates.length};
}
export const importPlanSafety='Stejný import je idempotentní. U XTB se změněná existující pozice aktualizuje, ale shodný snapshot se přeskočí jako duplicita.';
