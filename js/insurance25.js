import {annualize,monthlyEquivalent} from './personalAdmin25.js';

const DAY=86400000;
const dayStart=v=>{const d=new Date(v);d.setHours(0,0,0,0);return d.getTime()};
const daysTo=(v,now=new Date())=>{if(!v)return null;const t=new Date(v).getTime();if(!Number.isFinite(t))return null;return Math.round((dayStart(t)-dayStart(now))/DAY)};
const hasNumber=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const active=x=>String(x.status||'ACTIVE').toUpperCase()!=='ARCHIVED';

export const INSURANCE_KINDS={LIFE:'Životní',ACCIDENT:'Úrazové',PROPERTY:'Nemovitost / domácnost',LIABILITY:'Odpovědnost',VEHICLE:'Auto',TRAVEL:'Cestovní',PET:'Zvíře',OTHER:'Ostatní'};
export const insuranceNote='Insurance Center vyhodnocuje jen uložené pojistky, termíny a limity. Neurčuje, zda je konkrétní pojistné krytí odborně dostatečné, a nic automaticky neruší ani nesjednává.';

export function insurancePolicy(x={},now=new Date()){
 const info=x.insurance&&typeof x.insurance==='object'?x.insurance:{};
 const expiry=info.endDate||x.endDate||x.renewalDate||null;
 const renewal=x.renewalDate||info.renewalDate||expiry;
 const notice=x.noticeDate||info.noticeDate||null;
 const renewalDays=daysTo(renewal,now),noticeDays=daysTo(notice,now),expiryDays=daysTo(expiry,now);
 const premium=hasNumber(x.amount)?Math.max(0,Number(x.amount)):null;
 const annualPremium=annualize(premium,x.cadence||'ONCE');
 const monthlyPremium=monthlyEquivalent(premium,x.cadence||'ONCE');
 const coverage=hasNumber(info.coverageAmount)?Math.max(0,Number(info.coverageAmount)):null;
 const deductible=hasNumber(info.deductible)?Math.max(0,Number(info.deductible)):null;
 const issues=[];
 if(expiryDays!==null&&expiryDays<0)issues.push('Pojistka má evidovanou expiraci po termínu');
 else if(expiryDays!==null&&expiryDays<=30)issues.push('Expirace / výročí do 30 dní');
 if(noticeDays!==null&&noticeDays<0&&expiryDays!==null&&expiryDays>=0)issues.push('Výpovědní termín už uplynul');
 else if(noticeDays!==null&&noticeDays>=0&&noticeDays<=30)issues.push('Výpovědní lhůta do 30 dní');
 if(!String(info.insured||'').trim())issues.push('Chybí pojištěná osoba / majetek');
 if(!String(info.kind||'').trim())issues.push('Chybí typ pojištění');
 if(!renewal&&!expiry)issues.push('Chybí výročí / expirace');
 if(premium===null)issues.push('Chybí pojistné');
 let priority=20;
 if(expiryDays!==null&&expiryDays<0)priority=100;
 else if(noticeDays!==null&&noticeDays>=0&&noticeDays<=14)priority=Math.max(priority,96);
 else if(expiryDays!==null&&expiryDays>=0&&expiryDays<=14)priority=Math.max(priority,90);
 else if(noticeDays!==null&&noticeDays<=30&&noticeDays>=0)priority=Math.max(priority,82);
 else if(expiryDays!==null&&expiryDays<=30&&expiryDays>=0)priority=Math.max(priority,76);
 if(issues.some(i=>i.startsWith('Chybí')))priority=Math.max(priority,55);
 const status=priority>=90?'URGENT':priority>=75?'SOON':priority>=50?'REVIEW':'OK';
 return {...x,insurance:info,kind:info.kind||'OTHER',kindLabel:INSURANCE_KINDS[info.kind]||INSURANCE_KINDS.OTHER,insured:info.insured||'',policyNumber:info.policyNumber||'',contact:info.contact||'',coverage,deductible,premium,annualPremium,monthlyPremium,renewal,expiry,notice,renewalDays,expiryDays,noticeDays,issues,priority,status};
}

export function insuranceCenter(s={},now=new Date()){
 const policies=(s.personalAdmin?.items||[]).filter(x=>active(x)&&x.category==='INSURANCE').map(x=>insurancePolicy(x,now)).sort((a,b)=>b.priority-a.priority||((a.expiryDays??9999)-(b.expiryDays??9999))||String(a.title||'').localeCompare(String(b.title||''),'cs'));
 const costs={};
 for(const p of policies){if(p.annualPremium===null||p.annualPremium<=0)continue;const c=p.currency||'CZK';costs[c]=costs[c]||{annual:0,monthly:0,count:0};costs[c].annual+=p.annualPremium;costs[c].monthly+=p.monthlyPremium||0;costs[c].count++}
 const urgent=policies.filter(x=>x.status==='URGENT').length;
 const due30=policies.filter(x=>(x.expiryDays!==null&&x.expiryDays>=0&&x.expiryDays<=30)||(x.noticeDays!==null&&x.noticeDays>=0&&x.noticeDays<=30)).length;
 const incomplete=policies.filter(x=>x.issues.some(i=>i.startsWith('Chybí'))).length;
 const insuredSubjects=new Set(policies.map(x=>String(x.insured||'').trim()).filter(Boolean));
 return {policies,total:policies.length,urgent,due30,incomplete,insuredSubjects:insuredSubjects.size,costs,note:insuranceNote};
}
