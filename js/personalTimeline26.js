import {nextAnnualDate} from './familyHome25.js';

const DAY=86400000;
const active=x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const start=v=>{const d=new Date(v);if(!Number.isFinite(d.getTime()))return null;d.setHours(0,0,0,0);return d.getTime()};
const diff=(v,now=new Date())=>{const a=start(v),b=start(now);return a===null||b===null?null:Math.round((a-b)/DAY)};
const norm=v=>String(v||'').trim().toLocaleLowerCase('cs-CZ');
const personalCalendar=e=>e?.personal===true||norm(e?.area).includes('osob')||norm(e?.calendar).includes('osob')||norm(e?.source).includes('personal');
const score=days=>days===null?0:days<0?100:days===0?98:days<=3?92:days<=7?84:days<=30?68:days<=60?52:40;

function push(out,seen,{key,title,at,domain,type,target='home',homeMode='timeline',detail='',source='ULOŽENÁ DATA'},now){
 if(!at)return;const days=diff(at,now);if(days===null||days>90)return;
 const k=`${key}|${String(at).slice(0,10)}`;if(seen.has(k))return;seen.add(k);
 out.push({key:k,title:title||'Osobní termín',at:new Date(at).toISOString(),days,domain,type,target,homeMode,detail,priority:score(days),source});
}

export function personalTimeline(s={},now=new Date()){
 const out=[],seen=new Set(),add=data=>push(out,seen,data,now);
 for(const x of (s.personalAdmin?.items||[]).filter(active)){
  const title=x.title||'Osobní závazek',base=`admin:${x.id||title}`;
  add({key:`${base}:due`,title,at:x.nextDue,domain:'Platby',type:'Platba / kontrola',homeMode:'payments',detail:x.provider||''});
  add({key:`${base}:notice`,title,at:x.noticeDate||x.insurance?.noticeDate,domain:'Smlouvy',type:'Výpovědní termín',homeMode:'contracts',detail:x.provider||''});
  add({key:`${base}:renewal`,title,at:x.renewalDate||x.endDate||x.insurance?.renewalDate||x.insurance?.endDate,domain:x.category==='INSURANCE'?'Pojištění':'Smlouvy',type:'Výročí / expirace',homeMode:x.category==='INSURANCE'?'insurance':'contracts',detail:x.provider||''});
  add({key:`${base}:doc-expiry`,title,at:x.document?.expiryDate,domain:'Doklady',type:'Expirace',homeMode:'documents',detail:x.document?.holder||''});
  add({key:`${base}:doc-reminder`,title,at:x.document?.reminderDate,domain:'Doklady',type:'Začít řešit',homeMode:'documents',detail:x.document?.holder||''});
 }
 for(const m of (s.familyHome?.members||[]).filter(active)){
  const b=nextAnnualDate(m.birthday,now),a=nextAnnualDate(m.anniversary,now);
  add({key:`family:${m.id}:birthday`,title:`${m.name||'Rodina'} · narozeniny`,at:b,domain:'Rodina',type:'Narozeniny',homeMode:'family'});
  add({key:`family:${m.id}:anniversary`,title:`${m.name||'Rodina'} · výročí`,at:a,domain:'Rodina',type:'Výročí',homeMode:'family'});
 }
 for(const t of s.tasks||[]){if(t.status==='HOTOVO'||!t.due||!norm(t.area).includes('osob'))continue;add({key:`task:${t.id}`,title:t.title,at:t.due,domain:'Osobní',type:'Úkol',target:'today',homeMode:null,detail:t.area||''})}
 for(const x of s.ticketBook?.items||[]){if(!x?.date||String(x.workflow||'HOLD').toUpperCase()==='SOLD')continue;add({key:`ticket:${x.id}`,title:x.name||'Vstupenka',at:x.date,domain:'Vstupenky',type:'Akce',target:'tickets',homeMode:null,detail:`${Number(x.qty||1)} ks`})}
 for(const e of s.calendar?.events||[]){if(!personalCalendar(e))continue;const at=e?.start?.dateTime||e?.start?.date||e?.start||e?.date||e?.begin||e?.dtstart||null;add({key:`calendar:${e.id||e.uid||e.title||e.summary}`,title:e.title||e.summary||'Osobní kalendář',at,domain:'Kalendář',type:'Událost',target:'today',homeMode:null,detail:e.location||'',source:'OSOBNÍ KALENDÁŘ'})}
 out.sort((a,b)=>(a.days<0?0:1)-(b.days<0?0:1)||a.days-b.days||b.priority-a.priority||String(a.title).localeCompare(String(b.title),'cs'));
 const overdue=out.filter(x=>x.days<0),future=out.filter(x=>x.days>=0);
 return {items:out,overdue:overdue.length,due7:future.filter(x=>x.days<=7).length,due30:future.filter(x=>x.days<=30).length,due90:future.filter(x=>x.days<=90).length,next7:future.filter(x=>x.days<=7),next30:future.filter(x=>x.days<=30),next90:future,personalCalendarItems:out.filter(x=>x.source==='OSOBNÍ KALENDÁŘ').length,note:'Timeline používá jen uložené osobní termíny. Kalendář zahrne pouze události výslovně označené jako osobní; pracovní kalendář se do Personal OS nepřimíchává.'};
}
