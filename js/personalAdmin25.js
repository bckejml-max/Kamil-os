const DAY=86400000;
const n=v=>Number(v||0);
const hasNumber=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const dayStart=v=>{const d=new Date(v);d.setHours(0,0,0,0);return d.getTime()};
const daysTo=(v,now=new Date())=>{if(!v)return null;const t=new Date(v).getTime();if(!Number.isFinite(t))return null;return Math.round((dayStart(t)-dayStart(now))/DAY)};

export const PERSONAL_CATEGORIES={
 INSURANCE:'Pojištění',PAYMENT:'Platba',SUBSCRIPTION:'Předplatné',UTILITY:'Energie / služby',LOAN:'Úvěr / hypotéka',DOCUMENT:'Doklad',VEHICLE:'Auto',HOME:'Dům / domácnost',FAMILY:'Rodina',FEE:'Poplatek / daň',OTHER:'Ostatní'
};
export const PERSONAL_CADENCES={ONCE:'Jednorázově',MONTHLY:'Měsíčně',QUARTERLY:'Čtvrtletně',SEMIANNUAL:'Pololetně',YEARLY:'Ročně'};
export const personalAdminNote='Personal Admin používá pouze ručně uložené osobní závazky. Nic neplatí, neruší smlouvy a nevytváří částky ani termíny, které nejsou zadané.';

export const annualize=(amount,cadence)=>{if(!hasNumber(amount))return null;const a=Math.max(0,Number(amount));return ({MONTHLY:12,QUARTERLY:4,SEMIANNUAL:2,YEARLY:1,ONCE:0}[cadence]??0)*a};
export const monthlyEquivalent=(amount,cadence)=>{const a=annualize(amount,cadence);return a===null?null:a/12};

export function personalAdminItem(x={},now=new Date()){
 const dueDays=daysTo(x.nextDue,now),renewalDays=daysTo(x.renewalDate||x.endDate,now),noticeDays=daysTo(x.noticeDate,now);
 const amount=hasNumber(x.amount)?Math.max(0,Number(x.amount)):null;
 const annual=annualize(amount,x.cadence||'ONCE');
 const monthly=monthlyEquivalent(amount,x.cadence||'ONCE');
 const issues=[];
 if(dueDays!==null&&dueDays<0)issues.push('Platba / kontrola po termínu');
 else if(dueDays!==null&&dueDays<=7)issues.push('Termín do 7 dní');
 if(noticeDays!==null&&noticeDays>=0&&noticeDays<=30)issues.push('Blíží se výpovědní lhůta');
 if(renewalDays!==null&&renewalDays>=0&&renewalDays<=30)issues.push('Výročí / expirace do 30 dní');
 if(!x.nextDue&&!x.renewalDate&&!x.endDate&&['INSURANCE','DOCUMENT','LOAN','UTILITY'].includes(x.category))issues.push('Chybí kontrolní termín');
 let priority=20;
 if(dueDays!==null&&dueDays<0)priority=100;
 else if(dueDays!==null&&dueDays<=7)priority=Math.max(priority,90);
 else if(dueDays!==null&&dueDays<=30)priority=Math.max(priority,70);
 if(noticeDays!==null&&noticeDays>=0&&noticeDays<=14)priority=Math.max(priority,92);
 else if(noticeDays!==null&&noticeDays<=30&&noticeDays>=0)priority=Math.max(priority,80);
 if(renewalDays!==null&&renewalDays>=0&&renewalDays<=14)priority=Math.max(priority,85);
 else if(renewalDays!==null&&renewalDays<=30&&renewalDays>=0)priority=Math.max(priority,72);
 if(issues.includes('Chybí kontrolní termín'))priority=Math.max(priority,55);
 const status=priority>=90?'URGENT':priority>=70?'SOON':priority>=50?'REVIEW':'OK';
 return {...x,amount,annual,monthly,dueDays,renewalDays,noticeDays,issues,priority,status,categoryLabel:PERSONAL_CATEGORIES[x.category]||PERSONAL_CATEGORIES.OTHER,cadenceLabel:PERSONAL_CADENCES[x.cadence]||PERSONAL_CADENCES.ONCE};
}

export function personalAdmin(s={},now=new Date()){
 const items=(s.personalAdmin?.items||[]).filter(x=>String(x.status||'ACTIVE').toUpperCase()!=='ARCHIVED').map(x=>personalAdminItem(x,now)).sort((a,b)=>b.priority-a.priority||((a.dueDays??9999)-(b.dueDays??9999))||String(a.title||'').localeCompare(String(b.title||''),'cs'));
 const recurring=items.filter(x=>x.annual!==null&&x.annual>0);
 const annualCost=recurring.reduce((a,x)=>a+x.annual,0),monthlyCost=recurring.reduce((a,x)=>a+x.monthly,0);
 const due30=items.filter(x=>x.dueDays!==null&&x.dueDays>=0&&x.dueDays<=30);
 const urgent=items.filter(x=>x.status==='URGENT');
 const insurance=items.filter(x=>x.category==='INSURANCE');
 const withoutTerm=items.filter(x=>x.issues.includes('Chybí kontrolní termín'));
 const knownAmounts=items.filter(x=>x.amount!==null).length;
 return {items,total:items.length,urgent:urgent.length,due30:due30.length,insurance:insurance.length,withoutTerm:withoutTerm.length,annualCost,monthlyCost,knownAmounts,note:personalAdminNote};
}
