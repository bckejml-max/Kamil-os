import {annualize,monthlyEquivalent} from './personalAdmin25.js';

const DAY=86400000;
const dayStart=v=>{const d=new Date(v);d.setHours(0,0,0,0);return d.getTime()};
const daysTo=(v,now=new Date())=>{if(!v)return null;const t=new Date(v).getTime();if(!Number.isFinite(t))return null;return Math.round((dayStart(t)-dayStart(now))/DAY)};
const hasNumber=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const lifecycle=x=>String(x?.insurance?.lifecycle||(String(x?.status||'ACTIVE').toUpperCase()==='ARCHIVED'?'HISTORY':'ACTIVE')).toUpperCase();

export const INSURANCE_KINDS={LIFE:'Životní',ACCIDENT:'Úrazové',PROPERTY:'Nemovitost / domácnost',LIABILITY:'Odpovědnost',VEHICLE:'Auto',TRAVEL:'Cestovní',PET:'Zvíře',OTHER:'Ostatní'};
export const INSURANCE_LIFECYCLES={ACTIVE:'Aktivní',UPCOMING:'Začíná',TERMINATING:'Ukončované',REVIEW:'Ověřit',OFFER:'Nabídka',HISTORY:'Historie'};
export const insuranceNote='Insurance Center eviduje potvrzené smlouvy, nabídky a historii odděleně. Nabídka není aktivní pojistka a stav „ověřit“ není potvrzení platnosti.';

export function insurancePolicy(x={},now=new Date()){
 const info=x.insurance&&typeof x.insurance==='object'?x.insurance:{},lc=lifecycle(x);
 const expiry=info.endDate||x.endDate||x.renewalDate||null,renewal=x.renewalDate||info.renewalDate||expiry,notice=x.noticeDate||info.noticeDate||null;
 const renewalDays=daysTo(renewal,now),noticeDays=daysTo(notice,now),expiryDays=daysTo(expiry,now),startDays=daysTo(info.startDate,now);
 const premium=hasNumber(x.amount)?Math.max(0,Number(x.amount)):null,annualPremium=annualize(premium,x.cadence||'ONCE'),monthlyPremium=monthlyEquivalent(premium,x.cadence||'ONCE');
 const coverage=hasNumber(info.coverageAmount)?Math.max(0,Number(info.coverageAmount)):null,deductible=hasNumber(info.deductible)?Math.max(0,Number(info.deductible)):null;
 const issues=[];
 if(lc==='REVIEW')issues.push('Aktuální stav je potřeba ověřit');
 if(lc==='TERMINATING')issues.push('Čeká se na potvrzení ukončení / zániku');
 if(lc==='UPCOMING'&&startDays!==null)issues.push(startDays>=0?`Počátek pojištění za ${startDays} dní`:'Počátek už nastal — ověřit aktivaci');
 if(['ACTIVE','UPCOMING'].includes(lc)){
  if(expiryDays!==null&&expiryDays<0)issues.push('Pojistka má evidovanou expiraci po termínu');
  else if(expiryDays!==null&&expiryDays<=30)issues.push('Expirace / výročí do 30 dní');
  if(noticeDays!==null&&noticeDays<0&&expiryDays!==null&&expiryDays>=0)issues.push('Výpovědní termín už uplynul');
  else if(noticeDays!==null&&noticeDays>=0&&noticeDays<=30)issues.push('Výpovědní lhůta do 30 dní');
  if(!String(info.insured||'').trim())issues.push('Chybí pojištěná osoba / majetek');
  if(!String(info.kind||'').trim())issues.push('Chybí typ pojištění');
  if(premium===null)issues.push('Chybí pojistné');
 }
 let priority=20;
 if(lc==='REVIEW')priority=90;
 else if(lc==='TERMINATING')priority=82;
 else if(lc==='UPCOMING'&&startDays!==null&&startDays<=45)priority=72;
 if(expiryDays!==null&&expiryDays<0&&lc==='ACTIVE')priority=100;
 else if(noticeDays!==null&&noticeDays>=0&&noticeDays<=14&&lc==='ACTIVE')priority=Math.max(priority,96);
 else if(expiryDays!==null&&expiryDays>=0&&expiryDays<=14&&lc==='ACTIVE')priority=Math.max(priority,90);
 else if(noticeDays!==null&&noticeDays<=30&&noticeDays>=0&&lc==='ACTIVE')priority=Math.max(priority,82);
 else if(expiryDays!==null&&expiryDays<=30&&expiryDays>=0&&lc==='ACTIVE')priority=Math.max(priority,76);
 if(issues.some(i=>i.startsWith('Chybí')))priority=Math.max(priority,55);
 const status=priority>=90?'URGENT':priority>=75?'SOON':priority>=50?'REVIEW':'OK';
 return {...x,insurance:info,lifecycle:lc,lifecycleLabel:INSURANCE_LIFECYCLES[lc]||lc,kind:info.kind||'OTHER',kindLabel:INSURANCE_KINDS[info.kind]||INSURANCE_KINDS.OTHER,insured:info.insured||'',policyNumber:info.policyNumber||'',contact:info.contact||'',coverage,deductible,premium,annualPremium,monthlyPremium,renewal,expiry,notice,startDate:info.startDate||null,startDays,renewalDays,expiryDays,noticeDays,issues,priority,status};
}

export function insuranceCenter(s={},now=new Date()){
 const all=(s.personalAdmin?.items||[]).filter(x=>x.category==='INSURANCE').map(x=>insurancePolicy(x,now)).sort((a,b)=>b.priority-a.priority||String(a.title||'').localeCompare(String(b.title||''),'cs'));
 const policies=all.filter(x=>['ACTIVE','UPCOMING','TERMINATING','REVIEW'].includes(x.lifecycle));
 const offers=all.filter(x=>x.lifecycle==='OFFER');
 const history=all.filter(x=>x.lifecycle==='HISTORY');
 const costs={},activeCosts={},upcomingCosts={};
 const addCost=(bucket,p)=>{if(p.annualPremium===null||p.annualPremium<=0)return;const c=p.currency||'CZK';bucket[c]=bucket[c]||{annual:0,monthly:0,count:0};bucket[c].annual+=p.annualPremium;bucket[c].monthly+=p.monthlyPremium||0;bucket[c].count++};
 for(const p of policies.filter(x=>['ACTIVE','UPCOMING'].includes(x.lifecycle))){addCost(costs,p);if(p.lifecycle==='ACTIVE')addCost(activeCosts,p);else if(p.lifecycle==='UPCOMING')addCost(upcomingCosts,p)}
 const urgent=policies.filter(x=>x.status==='URGENT').length;
 const due30=policies.filter(x=>(x.expiryDays!==null&&x.expiryDays>=0&&x.expiryDays<=30)||(x.noticeDays!==null&&x.noticeDays>=0&&x.noticeDays<=30)).length;
 const incomplete=policies.filter(x=>x.issues.some(i=>i.startsWith('Chybí'))).length;
 const insuredSubjects=new Set(policies.map(x=>String(x.insured||'').trim()).filter(Boolean));
 return {all,policies,offers,history,total:policies.length,active:policies.filter(x=>x.lifecycle==='ACTIVE').length,upcoming:policies.filter(x=>x.lifecycle==='UPCOMING').length,terminating:policies.filter(x=>x.lifecycle==='TERMINATING').length,review:policies.filter(x=>x.lifecycle==='REVIEW').length,urgent,due30,incomplete,insuredSubjects:insuredSubjects.size,costs,activeCosts,upcomingCosts,note:insuranceNote};
}
