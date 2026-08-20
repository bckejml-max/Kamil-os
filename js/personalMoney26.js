import {personalAdmin,PERSONAL_CATEGORIES} from './personalAdmin25.js';
import {cashflow90} from './cashflow25.js';

const ESSENTIAL=new Set(['LOAN','UTILITY','INSURANCE','FEE','HOME']);

export function personalMoney(s={},now=new Date()){
 const admin=personalAdmin(s,now),byCategory={},byCurrency={};
 let recurringKnown=0,recurringMissing=0;
 for(const x of admin.items){
  const recurring=x.cadence&&x.cadence!=='ONCE';
  if(recurring&&x.amount===null)recurringMissing++;
  if(x.monthly===null||x.monthly<=0)continue;
  recurringKnown++;
  const c=x.currency||'CZK',cat=x.category||'OTHER';
  byCurrency[c]=byCurrency[c]||{monthly:0,annual:0,essentialMonthly:0,count:0};
  byCurrency[c].monthly+=x.monthly;byCurrency[c].annual+=x.annual||0;byCurrency[c].count++;
  if(ESSENTIAL.has(cat))byCurrency[c].essentialMonthly+=x.monthly;
  byCategory[cat]=byCategory[cat]||{label:PERSONAL_CATEGORIES[cat]||PERSONAL_CATEGORIES.OTHER,byCurrency:{}};
  byCategory[cat].byCurrency[c]=(byCategory[cat].byCurrency[c]||0)+x.monthly;
 }
 const cf=cashflow90(s,now);
 return {
  byCurrency,byCategory,recurringKnown,recurringMissing,cashflow:cf,
  primaryCurrency:String(s.financePlan?.currency||'CZK').toUpperCase(),
  note:'Náklad života se počítá pouze z opakovaných osobních položek se skutečně zadanou částkou. Měny se nikdy nesčítají ani automaticky nepřepočítávají.'
 };
}
