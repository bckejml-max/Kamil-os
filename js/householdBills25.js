import {annualize,monthlyEquivalent,PERSONAL_CATEGORIES} from './personalAdmin25.js';

const DAY=86400000;
const BILL_CATEGORIES=new Set(['PAYMENT','SUBSCRIPTION','UTILITY','LOAN','HOME','FEE']);
const dayStart=v=>{const d=new Date(v);d.setHours(0,0,0,0);return d.getTime()};
const daysTo=(v,now=new Date())=>{if(!v)return null;const t=new Date(v).getTime();if(!Number.isFinite(t))return null;return Math.round((dayStart(t)-dayStart(now))/DAY)};
const active=x=>String(x.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const hasNumber=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));

export const householdBillsNote='Household Bills používá stejná ručně uložená data jako Personal Admin. Tlačítko Zaplaceno pouze zaznamená potvrzení uživatele a u opakované položky posune evidovaný termín o jednu periodu; žádnou platbu neprovede.';

function addMonthsSafe(raw,months){
 if(!raw)return null;const d=new Date(`${String(raw).slice(0,10)}T12:00:00`);if(!Number.isFinite(d.getTime()))return null;
 const wanted=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+months);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(wanted,last));return d.toISOString().slice(0,10);
}
export function nextBillDue(raw,cadence){
 if(!raw)return null;
 if(cadence==='MONTHLY')return addMonthsSafe(raw,1);
 if(cadence==='QUARTERLY')return addMonthsSafe(raw,3);
 if(cadence==='SEMIANNUAL')return addMonthsSafe(raw,6);
 if(cadence==='YEARLY')return addMonthsSafe(raw,12);
 return null;
}

export function householdBill(x={},now=new Date()){
 const amount=hasNumber(x.amount)?Math.max(0,Number(x.amount)):null,currency=x.currency||'CZK',cadence=x.cadence||'ONCE';
 const dueDays=daysTo(x.nextDue,now),annual=annualize(amount,cadence),monthly=monthlyEquivalent(amount,cadence);
 const issues=[];
 if(dueDays!==null&&dueDays<0)issues.push('Po termínu');
 else if(dueDays!==null&&dueDays===0)issues.push('Splatnost dnes');
 else if(dueDays!==null&&dueDays<=7)issues.push('Splatnost do 7 dní');
 else if(dueDays!==null&&dueDays<=30)issues.push('Splatnost do 30 dní');
 if(!x.nextDue&&cadence!=='ONCE')issues.push('Chybí další termín');
 if(amount===null)issues.push('Chybí částka');
 let priority=20;
 if(dueDays!==null&&dueDays<0)priority=100;
 else if(dueDays===0)priority=96;
 else if(dueDays!==null&&dueDays<=7)priority=88;
 else if(dueDays!==null&&dueDays<=30)priority=68;
 if(!x.autoPay&&dueDays!==null&&dueDays<=7)priority=Math.min(100,priority+5);
 if(issues.includes('Chybí další termín'))priority=Math.max(priority,55);
 const status=priority>=95?'URGENT':priority>=80?'SOON':priority>=50?'REVIEW':'OK';
 return {...x,amount,currency,cadence,dueDays,annual,monthly,issues,priority,status,categoryLabel:PERSONAL_CATEGORIES[x.category]||'Ostatní',nextAfterPayment:nextBillDue(x.nextDue,cadence)};
}

export function householdBills(s={},now=new Date()){
 const items=(s.personalAdmin?.items||[]).filter(x=>active(x)&&BILL_CATEGORIES.has(x.category)).map(x=>householdBill(x,now)).sort((a,b)=>b.priority-a.priority||((a.dueDays??9999)-(b.dueDays??9999))||String(a.title||'').localeCompare(String(b.title||''),'cs'));
 const costs={};for(const x of items){if(x.annual===null||x.annual<=0)continue;const c=x.currency;costs[c]=costs[c]||{monthly:0,annual:0,count:0};costs[c].monthly+=x.monthly||0;costs[c].annual+=x.annual;costs[c].count++}
 const overdue=items.filter(x=>x.dueDays!==null&&x.dueDays<0).length,due7=items.filter(x=>x.dueDays!==null&&x.dueDays>=0&&x.dueDays<=7).length,due30=items.filter(x=>x.dueDays!==null&&x.dueDays>=0&&x.dueDays<=30).length;
 const manualDue7=items.filter(x=>!x.autoPay&&x.dueDays!==null&&x.dueDays>=0&&x.dueDays<=7).length,autopay=items.filter(x=>x.autoPay).length,subscriptions=items.filter(x=>x.category==='SUBSCRIPTION').length;
 return {items,total:items.length,overdue,due7,due30,manualDue7,autopay,subscriptions,costs,note:householdBillsNote};
}
