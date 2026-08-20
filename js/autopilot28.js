import {personalBriefing} from './personalToday26.js';
import {personalTimeline} from './personalTimeline26.js';
import {personalMoney} from './personalMoney26.js';
import {personalRiskCenter} from './personalRisk25.js';
import {renewalRadar} from './renewalRadar26.js';
import {capitalAllocation} from './capitalAllocation25.js';
import {nextAnnualDate} from './familyHome25.js';

const DAY=86400000;
const active=x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const hasNum=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const dateMs=v=>{if(v===null||v===undefined||v==='')return null;const t=new Date(v).getTime();return Number.isFinite(t)?t:null};
const dayDiff=(v,now=new Date())=>{const a=dateMs(v);if(a===null)return null;const x=new Date(a),y=new Date(now);x.setHours(0,0,0,0);y.setHours(0,0,0,0);return Math.round((x-y)/DAY)};
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs-CZ').trim();
const moneyCats=new Set(['PAYMENT','SUBSCRIPTION','UTILITY','LOAN','HOME','FEE','INSURANCE','VEHICLE','OTHER']);
const annualFactor={WEEKLY:52,MONTHLY:12,QUARTERLY:4,SEMIANNUAL:2,YEARLY:1,ONCE:0};
const dedupeBy=(arr,keyFn)=>{const seen=new Set();return arr.filter(x=>{const k=keyFn(x);if(seen.has(k))return false;seen.add(k);return true})};
const backupAge=(iso,now)=>{const t=dateMs(iso);return t===null?null:Math.max(0,Math.floor((new Date(now).getTime()-t)/DAY))};

export const ASSET_KINDS={VEHICLE:'Auto',HOME_SYSTEM:'Technologie domu',APPLIANCE:'Spotřebič',PROPERTY:'Nemovitost',OTHER:'Ostatní'};
export const INBOX_SOURCES={MANUAL:'Ručně',CALENDAR:'Kalendář',EMAIL:'E-mail',SYSTEM:'Kamil OS',OTHER:'Jiné'};
export const INBOX_KINDS={ACTION:'Akce',EVENT:'Událost',BILL:'Platba',CONTRACT:'Smlouva',DOCUMENT:'Doklad',OTHER:'Ostatní'};
export const autopilotNote='Personal Autopilot používá pouze uložená osobní data a explicitně osobní kalendář. Nic automaticky neplatí, neruší, neobchoduje ani neposílá.';

export function sanitizeInboxCandidate(x={}){
 const title=String(x.title||'').trim().slice(0,160),detail=String(x.detail||'').trim().slice(0,500);
 return {title,detail,source:INBOX_SOURCES[x.source]?x.source:'OTHER',kind:INBOX_KINDS[x.kind]?x.kind:'OTHER',sourceId:String(x.sourceId||'').slice(0,180),at:x.at&&dateMs(x.at)!==null?new Date(x.at).toISOString():null};
}

export function assetBook(s={},now=new Date()){
 const items=(s.assetBook?.items||[]).filter(active).map(x=>{
  const next=dayDiff(x.nextServiceAt,now),warranty=dayDiff(x.warrantyUntil,now);
  let priority=20,reason='Bez známého blízkého termínu.';
  if(next!==null){if(next<0){priority=98;reason=`Servis po termínu ${Math.abs(next)} dní.`}else if(next===0){priority=96;reason='Servisní termín dnes.'}else if(next<=7){priority=88;reason=`Servis za ${next} dní.`}else if(next<=30){priority=68;reason=`Servis za ${next} dní.`}}
  if(warranty!==null){if(warranty<0&&priority<55){priority=55;reason='Záruka už skončila.'}else if(warranty>=0&&warranty<=30&&priority<75){priority=75;reason=`Záruka končí za ${warranty} dní.`}else if(warranty>=0&&warranty<=90&&priority<58){priority=58;reason=`Záruka končí za ${warranty} dní.`}}
  return {...x,kindLabel:ASSET_KINDS[x.kind]||ASSET_KINDS.OTHER,nextServiceDays:next,warrantyDays:warranty,priority,reason};
 }).sort((a,b)=>b.priority-a.priority||String(a.title||'').localeCompare(String(b.title||''),'cs'));
 const byKind=Object.fromEntries(Object.keys(ASSET_KINDS).map(k=>[k,items.filter(x=>x.kind===k).length]));
 const valueByCurrency={},liabilityByCurrency={};
 for(const x of items){const c=String(x.currency||'CZK').toUpperCase();if(hasNum(x.estimatedValue)&&Number(x.estimatedValue)>0)valueByCurrency[c]=(valueByCurrency[c]||0)+Number(x.estimatedValue);if(hasNum(x.liabilityBalance)&&Number(x.liabilityBalance)>0)liabilityByCurrency[c]=(liabilityByCurrency[c]||0)+Number(x.liabilityBalance)}
 return {items,total:items.length,byKind,valueByCurrency,liabilityByCurrency,urgent:items.filter(x=>x.priority>=85).length,due30:items.filter(x=>x.nextServiceDays!==null&&x.nextServiceDays>=0&&x.nextServiceDays<=30).length};
}

export function dataQuality(s={},meta={},now=new Date()){
 const issues=[],add=(domain,title,detail,priority,target='home',homeMode='dashboard',id='')=>issues.push({domain,title,detail,priority,target,homeMode,id});
 for(const x of (s.personalAdmin?.items||[]).filter(active)){
  const cat=String(x.category||'OTHER').toUpperCase(),cad=String(x.cadence||'ONCE').toUpperCase(),title=x.title||'Osobní položka';
  if(moneyCats.has(cat)&&cad!=='ONCE'&&(!hasNum(x.amount)||Number(x.amount)<=0))add('Peníze',title,'Opakovaná položka nemá částku.',72,'home',cat==='INSURANCE'?'insurance':'contracts',x.id);
  if(moneyCats.has(cat)&&cad!=='ONCE'&&!x.nextDue)add('Termín',title,'Opakovaná položka nemá další platební/kontrolní termín.',66,'home',cat==='INSURANCE'?'insurance':'contracts',x.id);
  if(cat==='INSURANCE'&&!x.noticeDate&&!x.renewalDate)add('Pojištění',title,'Chybí výročí i poslední den pro výpověď.',78,'home','insurance',x.id);
  if(cat==='DOCUMENT'&&!x.document?.expiryDate&&!x.renewalDate)add('Doklady',title,'Chybí expirace nebo kontrolní termín.',82,'home','documents',x.id);
 }
 for(const x of (s.emergencyFile?.contacts||[]).filter(active))if(!String(x.phone||'').trim()&&!String(x.email||'').trim())add('Emergency File',x.name||'Nouzový kontakt','Kontakt nemá telefon ani e-mail.',88,'home','dashboard',x.id);
 for(const x of (s.emergencyFile?.assets||[]).filter(active))if(!String(x.location||'').trim())add('Emergency File',x.title||'Důležitá věc','Chybí informace, kde ji v nouzi najít.',68,'home','dashboard',x.id);
 for(const x of (s.assetBook?.items||[]).filter(active)){
  if(!String(x.location||'').trim())add('Majetek',x.title||'Majetek','Chybí umístění.',54,'home','dashboard',x.id);
  if(x.lastServiceAt&&!x.nextServiceAt)add('Servis',x.title||'Majetek','Je uložený poslední servis, ale ne další kontrolní termín.',64,'home','dashboard',x.id);
 }
 const age=backupAge(meta.lastBackupAt,now);if(age===null)add('Záloha','Chybí přenosná záloha','Ještě není evidovaný export Backup Guard.',86,'more',null,'backup');else if(age>30)add('Záloha','Záloha je starší než 30 dní',`Poslední export: ${meta.lastBackupAt}.`,74,'more',null,'backup');
 issues.sort((a,b)=>b.priority-a.priority||String(a.title).localeCompare(String(b.title),'cs'));
 const high=issues.filter(x=>x.priority>=75).length,medium=issues.filter(x=>x.priority>=60&&x.priority<75).length;
 return {issues,total:issues.length,high,medium,score:Math.max(0,100-Math.min(100,high*14+medium*5)),top:issues.slice(0,8),note:'Data Quality hodnotí pouze úplnost uložených údajů. Chybějící údaj neznamená, že daný závazek skutečně existuje nebo je problém.'};
}

function explicitPersonalCalendar(e){const z=norm(`${e?.area||''} ${e?.calendar||''} ${e?.source||''}`);return e?.personal===true||z.includes('osob')||z.includes('personal')}
export function personalInbox(s={},now=new Date()){
 const items=(s.personalInbox?.items||[]).filter(x=>String(x?.status||'NEW').toUpperCase()==='NEW').map(x=>({...x,sourceLabel:INBOX_SOURCES[x.source]||INBOX_SOURCES.OTHER,kindLabel:INBOX_KINDS[x.kind]||INBOX_KINDS.OTHER}));
 const storedKeys=new Set((s.personalInbox?.items||[]).map(x=>String(x.sourceId||'')).filter(Boolean));
 const calendarCandidates=[];
 for(const e of s.calendar?.events||[]){if(!explicitPersonalCalendar(e))continue;const at=e?.start?.dateTime||e?.start?.date||e?.start||e?.date||null,d=dayDiff(at,now);if(d===null||d<0||d>14)continue;const sourceId=`calendar:${e.id||e.uid||e.title||e.summary||at}`;if(storedKeys.has(sourceId))continue;calendarCandidates.push({id:sourceId,title:e.title||e.summary||'Osobní událost',detail:e.location||'',source:'CALENDAR',sourceLabel:INBOX_SOURCES.CALENDAR,kind:'EVENT',kindLabel:INBOX_KINDS.EVENT,sourceId,at,days:d,derived:true})}
 calendarCandidates.sort((a,b)=>a.days-b.days||String(a.title).localeCompare(String(b.title),'cs'));
 return {items,calendarCandidates,total:items.length+calendarCandidates.length,newStored:items.length,email:items.filter(x=>x.source==='EMAIL').length,calendar:calendarCandidates.length,note:'E-mailové kandidáty se objeví pouze pokud je bezpečný externí intake zapíše do Personal Inboxu. Statický klient sám Gmail nečte.'};
}

export function householdCockpit(s={},now=new Date()){
 const pm=personalMoney(s,now),allocation=capitalAllocation(s,now),assets=assetBook(s,now),primary=String(s.financePlan?.currency||'CZK').toUpperCase();
 const holdings={};const add=(c,v,label)=>{if(!hasNum(v)||Number(v)===0)return;c=String(c||primary).toUpperCase();holdings[c]=holdings[c]||{knownAssets:0,knownLiabilities:0,parts:[]};holdings[c].knownAssets+=Number(v);holdings[c].parts.push({label,value:Number(v)})};
 add(primary,s.financePlan?.cashNow,'Hotovost');
 for(const a of Object.values(s.xtbHub?.accounts||{}))add(a?.currency,a?.value,'XTB');
 for(const [c,v] of Object.entries(assets.valueByCurrency))add(c,v,'Majetek – uživatelský odhad');
 for(const [c,v] of Object.entries(assets.liabilityByCurrency)){holdings[c]=holdings[c]||{knownAssets:0,knownLiabilities:0,parts:[]};holdings[c].knownLiabilities+=Number(v);holdings[c].parts.push({label:'Zůstatek závazku k majetku',value:-Number(v)})}
 for(const [c,v] of Object.entries(holdings))v.knownNet=v.knownAssets-v.knownLiabilities;
 return {primary,recurring:pm.byCurrency||{},cashflow:pm.cashflow,allocation,holdings,assetValues:assets.valueByCurrency,assetLiabilities:assets.liabilityByCurrency,safeToDeploy:allocation.safeBeforePlan,newCapital:allocation.newCapital,note:'Součty se vedou po jednotlivých měnách. Hodnota majetku je zahrnuta jen pokud ji uživatel výslovně zadal; žádný FX kurz ani tržní cena se nevymýšlí.'};
}

export function familyProfiles(s={},now=new Date()){
 const members=(s.familyHome?.members||[]).filter(active),admin=(s.personalAdmin?.items||[]).filter(active);
 return members.map(m=>{
  const key=norm(m.name),linked=admin.filter(x=>{const text=norm(`${x.title||''} ${x.notes||''} ${x.insurance?.insured||''} ${x.document?.holder||''}`);return key&&text.includes(key)});
  const docs=linked.filter(x=>x.category==='DOCUMENT'),insurance=linked.filter(x=>x.category==='INSURANCE'),obligations=linked.filter(x=>x.category==='FAMILY'),birthday=nextAnnualDate(m.birthday,now),anniversary=nextAnnualDate(m.anniversary,now);
  const upcoming=[birthday&&{kind:'Narozeniny',at:birthday},anniversary&&{kind:'Výročí',at:anniversary}].filter(Boolean).map(x=>({...x,days:dayDiff(x.at,now)})).filter(x=>x.days!==null).sort((a,b)=>a.days-b.days);
  return {...m,documents:docs,insurance,obligations,linkedCount:linked.length,upcoming};
 });
}

export function notificationQueue(s={},meta={},now=new Date()){
 const risk=personalRiskCenter(s,now),timeline=personalTimeline(s,now),quality=dataQuality(s,meta,now),assets=assetBook(s,now),renewals=renewalRadar(s,now),rows=[];
 const add=(key,title,detail,priority,target='home',homeMode='dashboard',domain='Osobní')=>rows.push({key,title,detail,priority,target,homeMode,domain});
 for(const x of risk.top||[])if(x.priority>=80)add(`risk:${x.key}`,x.title,(x.reasons||[]).join(' · ')||x.reason,x.priority,'home','risk','Riziko');
 for(const x of timeline.items||[])if(x.days<=7)add(`timeline:${x.key}`,x.title,x.days<0?`${Math.abs(x.days)} dní po termínu`:x.days===0?'Dnes':`Za ${x.days} dní`,x.days<0?98:x.days===0?94:x.days<=3?88:80,x.target||'home',x.homeMode||'timeline',x.domain);
 for(const x of quality.top||[])if(x.priority>=75)add(`quality:${x.domain}:${x.id||x.title}`,x.title,x.detail,x.priority,x.target,x.homeMode,'Doplnit data');
 for(const x of assets.items||[])if(x.priority>=75)add(`asset:${x.id}`,x.title,x.reason,x.priority,'home','dashboard','Majetek');
 for(const x of renewals.rows||[])if(x.priority>=80)add(`renewal:${x.id}`,x.title,`${x.action}. ${x.reason}`,x.priority,'home',x.homeMode||'contracts','Smlouvy');
 const out=dedupeBy(rows.sort((a,b)=>b.priority-a.priority||String(a.title).localeCompare(String(b.title),'cs')),x=>norm(`${x.title}|${x.detail}`));
 return {items:out.slice(0,12),critical:out.filter(x=>x.priority>=90).length,important:out.filter(x=>x.priority>=80).length,top:out[0]||null,quality,timeline,assets,note:'Browserové upozornění může Kamil OS zobrazit jen při povolení prohlížečem a když je aplikace spuštěná. Skutečný background push vyžaduje serverovou push službu.'};
}

export function smartBriefing(s={},meta={},now=new Date()){
 const base=personalBriefing(s,now),notifications=notificationQueue(s,meta,now),quality=notifications.quality,inbox=personalInbox(s,now);
 const today=dedupeBy([...base.decisions.filter(x=>x.priority>=75),...notifications.items.filter(x=>x.priority>=88).map(x=>({title:x.title,reason:x.detail,priority:x.priority,target:x.target,homeMode:x.homeMode,kind:x.domain}))],x=>norm(x.title)).sort((a,b)=>b.priority-a.priority).slice(0,3);
 const used=new Set(today.map(x=>norm(x.title))),week=(base.timeline?.items||[]).filter(x=>x.days>=1&&x.days<=7&&!used.has(norm(x.title))).slice(0,2).map(x=>({title:x.title,reason:`${x.type} za ${x.days} dní`,priority:x.priority,target:x.target,homeMode:x.homeMode,kind:x.domain}));
 const risk=notifications.items.find(x=>x.priority>=75)||quality.top[0]||null;
 const quiet=!today.length&&!week.length&&!risk;
 const headline=quiet?'Osobní agenda je pod kontrolou.':today.length?`${today.length} věci mají dnes přednost.`:'Tento týden je dobré něco pohlídat.';
 return {headline,today,week,risk,inboxCount:inbox.total,qualityCount:quality.total,quiet,base,notifications,quality,inbox,note:autopilotNote};
}

export function familyShareSnapshot(s={},now=new Date(),{includeContacts=false}={}){
 const profiles=familyProfiles(s,now),assets=assetBook(s,now).items.filter(x=>['VEHICLE','HOME_SYSTEM','APPLIANCE','PROPERTY'].includes(x.kind));
 return {format:'KAMIL_OS_FAMILY_SHARE',version:1,createdAt:new Date(now).toISOString(),family:profiles.map(x=>({name:x.name,relation:x.relation,birthday:x.birthday||null,anniversary:x.anniversary||null,linkedCount:x.linkedCount})),homeAssets:assets.map(x=>({title:x.title,kind:x.kind,location:x.location||'',warrantyUntil:x.warrantyUntil||null,nextServiceAt:x.nextServiceAt||null,serviceContact:x.serviceContact||''})),emergency:includeContacts?(s.emergencyFile?.contacts||[]).filter(active).map(x=>({name:x.name,role:x.role,phone:x.phone||'',email:x.email||''})):[],note:'Read-only rodinný výřez. Neobsahuje XTB, vstupenky, pohledávky, čísla dokladů ani čísla pojistných smluv.'};
}

export function personalQuery(raw,s={},meta={},now=new Date()){
 const q=norm(raw);if(!q)return null;
 let m=q.match(/(?:konci|expiruje|termin).*?(\d{1,3})\s*(?:dni|dnu|d)/);if(m){const days=Math.min(90,Math.max(1,Number(m[1]))),tl=personalTimeline(s,now),rows=tl.items.filter(x=>x.days>=0&&x.days<=days).slice(0,12);return {title:`Co končí / čeká do ${days} dní`,lines:rows.map(x=>`${x.title} — ${x.days===0?'dnes':`za ${x.days} dní`} (${x.domain})`),note:rows.length?'Jen z uložených osobních termínů.':'V uložených osobních datech nic takového není.'}}
 if((q.includes('pojist')&&q.includes('roc'))||(q.includes('kolik')&&q.includes('pojist'))){const totals={};for(const x of (s.personalAdmin?.items||[]).filter(x=>active(x)&&x.category==='INSURANCE'&&hasNum(x.amount))){const f=annualFactor[String(x.cadence||'ONCE').toUpperCase()]||0;if(!f)continue;const c=String(x.currency||'CZK').toUpperCase();totals[c]=(totals[c]||0)+Number(x.amount)*f}return {title:'Známé roční pojistné',lines:Object.entries(totals).map(([c,v])=>`${Math.round(v).toLocaleString('cs-CZ')} ${c} / rok`),note:'Pouze pojistky se skutečně uloženou částkou a periodicitou; měny se nesčítají.'}}
 if(q.includes('auto')){const assets=assetBook(s,now),a=assets.items.filter(x=>x.kind==='VEHICLE'),admin=(s.personalAdmin?.items||[]).filter(x=>active(x)&&(x.category==='VEHICLE'||x.insurance?.kind==='VEHICLE'||['STK','VIGNETTE','SERVICE'].includes(x.document?.kind)));return {title:'Všechno kolem auta',lines:[...a.map(x=>`${x.title} — ${x.reason}`),...admin.map(x=>`${x.title} — ${x.provider||x.category||'evidence'}`)].slice(0,15),note:'Majetek + osobní administrativní položky související s autem.'}}
 if(q.includes('dum')||q.includes('domacnost')){const assets=assetBook(s,now),a=assets.items.filter(x=>['HOME_SYSTEM','APPLIANCE','PROPERTY'].includes(x.kind)),admin=(s.personalAdmin?.items||[]).filter(x=>active(x)&&['HOME','UTILITY'].includes(x.category));return {title:'Dům a domácnost',lines:[...a.map(x=>`${x.title} — ${x.reason}`),...admin.map(x=>`${x.title} — ${x.provider||x.category||'evidence'}`)].slice(0,15),note:'Pouze uložené domácí položky a majetek.'}}
 if((q.includes('stat penize')||q.includes('stoji penize'))&&q.includes('mesic')){const alerts=notificationQueue(s,meta,now),rows=alerts.items.filter(x=>['Platby','Smlouvy','Riziko','Majetek'].includes(x.domain)).slice(0,10);return {title:'Co může stát peníze tento měsíc',lines:rows.map(x=>`${x.title} — ${x.detail}`),note:'Pravidlový přehled z uložených termínů a rizik; není to předpověď neznámých výdajů.'}}
 if(q.includes('co chybi')||q.includes('doplnit data')||q.includes('data quality')){const quality=dataQuality(s,meta,now);return {title:'Co chybí doplnit',lines:quality.top.map(x=>`${x.title} — ${x.detail}`),note:quality.note}}
 if(q.includes('co mam dnes')||q.includes('dnes resit')||q.includes('co resit')){const brief=smartBriefing(s,meta,now);return {title:'Co řešit dnes',lines:brief.today.map(x=>`${x.title} — ${x.reason||'řešit'}`),note:brief.today.length?brief.note:'Nic zásadního dnes nevychází.'}}
 if(q.includes('kolik stoji zivot')||q.includes('mesicni naklady')||q.includes('mesicne platim')){const pm=personalMoney(s,now);return {title:'Známé měsíční náklady',lines:Object.entries(pm.byCurrency||{}).map(([c,v])=>`${Math.round(v.monthly||0).toLocaleString('cs-CZ')} ${c} / měsíc`),note:pm.note}}
 if(q.includes('bezpecne invest')||q.includes('kolik investovat')){const c=capitalAllocation(s,now);return {title:'Bezpečný investiční prostor',lines:[`Před plánovanou investicí: ${c.safeBeforePlan.toLocaleString('cs-CZ')} ${String(s.financePlan?.currency||'CZK').toUpperCase()}`,`Nový bezpečný kapitál po už plánované investici: ${c.newCapital.toLocaleString('cs-CZ')} ${String(s.financePlan?.currency||'CZK').toUpperCase()}`],note:c.blockers.join(' · ')||c.note}}
 return null;
}

export function autopilotSnapshot(s={},meta={},now=new Date()){
 const briefing=smartBriefing(s,meta,now),assets=briefing.notifications.assets;
 return {briefing,notifications:briefing.notifications,quality:briefing.quality,inbox:briefing.inbox,money:householdCockpit(s,now),assets,family:familyProfiles(s,now),note:autopilotNote};
}
