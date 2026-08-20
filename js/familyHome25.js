const DAY=86400000;
const dayStart=v=>{const d=new Date(v);d.setHours(0,0,0,0);return d.getTime()};
const daysTo=(v,now=new Date())=>{if(!v)return null;const t=new Date(v).getTime();if(!Number.isFinite(t))return null;return Math.round((dayStart(t)-dayStart(now))/DAY)};
const active=x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const norm=v=>String(v||'').trim().toLocaleLowerCase('cs-CZ');

export const FAMILY_RELATIONS={PARTNER:'Partner/ka',CHILD:'Dítě',PARENT:'Rodič',GRANDPARENT:'Prarodič',SIBLING:'Sourozenec',OTHER:'Rodina / blízký'};
export const familyHomeNote='Family & Home Center používá jen ručně uložené rodinné osoby a domácí závazky. Neodvozuje zdravotní, právní ani pojistné závěry a nic automaticky neobjednává.';

export function nextAnnualDate(raw,now=new Date()){
 if(!raw)return null;
 const d=new Date(raw);if(!Number.isFinite(d.getTime()))return null;
 const y=now.getFullYear(),m=d.getMonth(),day=d.getDate();
 const build=year=>{const last=new Date(year,m+1,0).getDate();return new Date(year,m,Math.min(day,last),12,0,0,0)};
 let out=build(y);if(dayStart(out)<dayStart(now))out=build(y+1);return out.toISOString();
}

export function familyMember(x={},now=new Date()){
 const birthdayNext=nextAnnualDate(x.birthday,now),birthdayDays=daysTo(birthdayNext,now);
 const anniversaryNext=nextAnnualDate(x.anniversary,now),anniversaryDays=daysTo(anniversaryNext,now);
 const nextDates=[
  birthdayDays===null?null:{kind:'Narozeniny',at:birthdayNext,days:birthdayDays},
  anniversaryDays===null?null:{kind:'Výročí',at:anniversaryNext,days:anniversaryDays}
 ].filter(Boolean).sort((a,b)=>a.days-b.days);
 const next=nextDates[0]||null;
 return {...x,relationLabel:FAMILY_RELATIONS[x.relation]||FAMILY_RELATIONS.OTHER,birthdayNext,birthdayDays,anniversaryNext,anniversaryDays,next};
}

export function homeObligation(x={},now=new Date()){
 const date=x.nextDue||x.renewalDate||x.endDate||null,days=daysTo(date,now),issues=[];
 if(days!==null&&days<0)issues.push('Termín je po datu');
 else if(days!==null&&days<=7)issues.push('Termín do 7 dní');
 else if(days!==null&&days<=30)issues.push('Termín do 30 dní');
 else if(days!==null&&days<=90)issues.push('Termín do 90 dní');
 if(!date)issues.push('Chybí kontrolní termín');
 let priority=20;
 if(days!==null&&days<0)priority=100;
 else if(days!==null&&days<=7)priority=90;
 else if(days!==null&&days<=30)priority=72;
 else if(days!==null&&days<=90)priority=50;
 if(!date)priority=Math.max(priority,55);
 const status=priority>=90?'URGENT':priority>=70?'SOON':priority>=50?'REVIEW':'OK';
 return {...x,date,days,issues,priority,status};
}

export function familyHome(s={},now=new Date()){
 const members=(s.familyHome?.members||[]).filter(active).map(x=>familyMember(x,now)).sort((a,b)=>(a.next?.days??9999)-(b.next?.days??9999)||String(a.name||'').localeCompare(String(b.name||''),'cs'));
 const obligations=(s.personalAdmin?.items||[]).filter(x=>active(x)&&['HOME','FAMILY'].includes(x.category)).map(x=>homeObligation(x,now)).sort((a,b)=>b.priority-a.priority||((a.days??9999)-(b.days??9999))||String(a.title||'').localeCompare(String(b.title||''),'cs'));
 const upcoming=members.flatMap(m=>[
  m.birthdayDays!==null&&m.birthdayDays<=60?{memberId:m.id,name:m.name,kind:'Narozeniny',at:m.birthdayNext,days:m.birthdayDays}:null,
  m.anniversaryDays!==null&&m.anniversaryDays<=60?{memberId:m.id,name:m.name,kind:'Výročí',at:m.anniversaryNext,days:m.anniversaryDays}:null
 ].filter(Boolean)).sort((a,b)=>a.days-b.days);
 const urgent=obligations.filter(x=>x.status==='URGENT').length,due30=obligations.filter(x=>x.days!==null&&x.days>=0&&x.days<=30).length,withoutTerm=obligations.filter(x=>x.days===null).length;
 const linkedSubjects=new Set();
 for(const p of s.personalAdmin?.items||[]){if(!active(p))continue;const subject=norm(p.insurance?.insured||p.document?.owner);if(subject)linkedSubjects.add(subject)}
 const memberLinks=members.map(m=>({id:m.id,name:m.name,linked:linkedSubjects.has(norm(m.name))}));
 return {members,obligations,upcoming,totalMembers:members.length,urgent,due30,withoutTerm,linkedMembers:memberLinks.filter(x=>x.linked).length,memberLinks,note:familyHomeNote};
}
