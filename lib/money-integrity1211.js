import {dedupeTransactions1206,moneyReconciliation1205} from './os-recovery1202.js';

export const MONEY_INTEGRITY_VERSION='1211.1.0';
const CURRENCY=/^[A-Z]{3}$/;
const amountFields=['amountCzk','amount','valueCzk','value','priceCzk','stakeCzk','payoutCzk','profitCzk'];
const dateFields=['date','dueDate','scheduledAt','expectedDate','at','ts','timestamp','createdAt','updatedAt'];

const finite=v=>Number.isFinite(Number(v));
const present=(obj,key)=>Object.prototype.hasOwnProperty.call(obj||{},key)&&obj?.[key]!==null&&obj?.[key]!=='';
export function moneyAmount1211(row){for(const key of amountFields)if(present(row,key))return{key,value:Number(row[key]),valid:finite(row[key])};return{key:null,value:null,valid:true}}
export function moneyDate1211(row){for(const key of dateFields)if(present(row,key)){const ms=Date.parse(String(row[key]));return{key,value:row[key],valid:Number.isFinite(ms),ms}}return{key:null,value:null,valid:true,ms:null}}
export function validateMoneyRow1211(row,{scheduled=false}={}){
 const issues=[];
 if(!row||typeof row!=='object'||Array.isArray(row))return{ok:false,issues:['ROW_NOT_OBJECT'],critical:true};
 const amount=moneyAmount1211(row),date=moneyDate1211(row),currency=present(row,'currency')?String(row.currency).trim().toUpperCase():null;
 if(!amount.valid)issues.push('NON_FINITE_AMOUNT');
 if(!date.valid)issues.push('INVALID_DATE');
 if(currency&&!CURRENCY.test(currency))issues.push('INVALID_CURRENCY');
 if(scheduled){
  const direction=String(row.direction||row.type||row.kind||'').toUpperCase();
  if(!amount.key)issues.push('MISSING_AMOUNT');
  else if(amount.value<=0)issues.push('SCHEDULED_AMOUNT_NOT_POSITIVE');
  if(!date.key)issues.push('MISSING_DATE');
  if(!/(INCOME|INFLOW|RECEIV|PAYOUT|EXPENSE|OUTFLOW|PAYMENT|OBLIG)/.test(direction))issues.push('AMBIGUOUS_DIRECTION');
 }
 return{ok:issues.length===0,issues,critical:issues.some(x=>['NON_FINITE_AMOUNT','INVALID_DATE','INVALID_CURRENCY','SCHEDULED_AMOUNT_NOT_POSITIVE','MISSING_AMOUNT','MISSING_DATE'].includes(x)),amount,date,currency};
}
export function normalizeMoneyRow1211(row){if(!row||typeof row!=='object'||Array.isArray(row))return row;const out={...row};if(typeof out.id==='string')out.id=out.id.trim();if(typeof out.currency==='string')out.currency=out.currency.trim().toUpperCase();for(const key of amountFields)if(present(out,key)&&finite(out[key])){const n=Number(out[key]);out[key]=Object.is(n,-0)?0:n}return out}
export function moneyIntegrityScan1211(rows,{scheduled=false}={}){
 const input=Array.isArray(rows)?rows:[],valid=[],invalid=[],issues=[];
 for(let index=0;index<input.length;index++){
  const row=input[index],check=validateMoneyRow1211(row,{scheduled});
  if(check.ok)valid.push(row);else{invalid.push({index,row,issues:check.issues,critical:check.critical});issues.push(...check.issues.map(code=>({index,code})))}
 }
 const dedupe=scheduled?{transactions:input.slice(),duplicates:[]}:dedupeTransactions1206(input),canonical=dedupe.transactions,duplicates=dedupe.duplicates;
 return{version:MONEY_INTEGRITY_VERSION,ok:invalid.length===0&&duplicates.length===0,total:input.length,validCount:valid.length,invalidCount:invalid.length,duplicateCount:duplicates.length,valid,invalid,duplicates,canonical,issues};
}
export function assertMoneyReconciliation1211({expected,actual,tolerance=.01}={}){
 if(!finite(expected)||!finite(actual))throw new Error('MONEY_RECONCILIATION_INPUT_INVALID');
 const base=moneyReconciliation1205({accounts:[{balanceCzk:Number(actual)}],expectedTotalCzk:Number(expected)}),limit=Math.max(0,Number(tolerance)||0),result={...base,expected:Number(expected),actual:Number(actual),tolerance:limit,ok:Math.abs(base.diff)<=limit};
 if(!result.ok){const error=new Error('MONEY_RECONCILIATION_MISMATCH');error.code='MONEY_RECONCILIATION_MISMATCH';error.detail=result;throw error}return result;
}
export function cashflowSafety1211(state={}){
 const scheduled=moneyIntegrityScan1211(state?.scheduledPayments,{scheduled:true});
 const transactions=moneyIntegrityScan1211(state?.personalSpending?.transactions||[]);
 const critical=scheduled.invalid.some(x=>x.critical)||transactions.invalid.some(x=>x.critical);
 return{version:MONEY_INTEGRITY_VERSION,ok:!critical&&transactions.duplicateCount===0,critical,scheduled,transactions,generatedAt:new Date().toISOString()};
}
