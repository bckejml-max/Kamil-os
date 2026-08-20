import {dataQuality,smartBriefing,householdCockpit,assetBook,personalInbox,autopilotNote} from './autopilot28.js';
import {personalTimeline} from './personalTimeline26.js';
import {capitalAllocation} from './capitalAllocation25.js';

const DAY=86400000;
const active=x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const hasNum=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs-CZ').trim();
const startDay=v=>{const d=new Date(v);if(!Number.isFinite(d.getTime()))return null;d.setHours(0,0,0,0);return d};
const dayDiff=(v,now=new Date())=>{const a=startDay(v),b=startDay(now);return !a||!b?null:Math.round((a-b)/DAY)};
const fmtDate=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d.toISOString().slice(0,10):null};
const round=v=>Math.round(Number(v)||0);

export const GOAL_TYPES={RESERVE:'Rezerva',PURCHASE:'Nákup',TRAVEL:'Dovolená',HOME:'Dům',CAR:'Auto',OTHER:'Ostatní'};
export const reminderNote='Eskalace je pouze pravidlová připomínka nad uloženými termíny. Neznamená právní, servisní ani jinou odbornou lhůtu.';
export const maintenanceNote='Servisní šablony jsou jen checklist. Kamil OS z nich sám nevytváří termín; konkrétní interval vždy potvrď podle výrobce, smlouvy nebo skutečné potřeby.';
export const importNote='Import Assistant používá pouze text, který mu předáš. Navržené údaje se nikdy neuloží bez potvrzení a citlivé identifikátory se automaticky nevytěžují.';

function monthsUntil(date,now=new Date()){
 const d=startDay(date),n=startDay(now);if(!d||!n)return null;
 if(d<=n)return 0;
 return Math.max(1,(d.getFullYear()-n.getFullYear())*12+d.getMonth()-n.getMonth()+(d.getDate()>n.getDate()?1:0));
}

export function goalPlan(s={},now=new Date()){
 const items=(s.personalGoals?.items||[]).filter(active).map(x=>{
  const target=hasNum(x.targetAmount)?Math.max(0,Number(x.targetAmount)):null,saved=hasNum(x.savedAmount)?Math.max(0,Number(x.savedAmount)):0,remaining=target===null?null:Math.max(0,target-saved),months=monthsUntil(x.targetDate,now),requiredMonthly=remaining===null||months===null?null:(months===0?remaining:remaining/months),pct=target&&target>0?Math.min(100,saved/target*100):null;
  let status='TRACK',priority=25,reason='Cíl je evidovaný.';
  if(target===null){status='DATA';priority=58;reason='Chybí cílová částka.'}
  else if(remaining===0){status='DONE';priority=5;reason='Cílová částka je pokrytá.'}
  else if(x.targetDate&&months===0){status='DUE';priority=92;reason='Cílové datum je dnes nebo po termínu.'}
  else if(x.targetDate&&requiredMonthly!==null&&hasNum(x.monthlyContribution)&&Number(x.monthlyContribution)<requiredMonthly){status='BEHIND';priority=76;reason='Uložený měsíční příspěvek je nižší než tempo potřebné k cíli.'}
  else if(!x.targetDate){status='NO_DATE';priority=45;reason='Cíl nemá cílové datum.'}
  return {...x,typeLabel:GOAL_TYPES[x.type]||GOAL_TYPES.OTHER,targetAmount:target,savedAmount:saved,remaining,monthsLeft:months,requiredMonthly,progressPct:pct,status,priority,reason,currency:String(x.currency||'CZK').toUpperCase()};
 }).sort((a,b)=>b.priority-a.priority||String(a.targetDate||'9999').localeCompare(String(b.targetDate||'9999'))||String(a.title||'').localeCompare(String(b.title||''),'cs'));
 const byCurrency={};for(const x of items){if(x.targetAmount===null)continue;const c=x.currency;byCurrency[c]=byCurrency[c]||{target:0,saved:0,remaining:0};byCurrency[c].target+=x.targetAmount;byCurrency[c].saved+=x.savedAmount;byCurrency[c].remaining+=x.remaining||0}
 return {items,total:items.length,attention:items.filter(x=>x.priority>=70).length,byCurrency,note:'Cíle a fondy jsou plán. Peníze se nikam automaticky nepřevádějí a měny se nesčítají.'};
}

const profileFor=x=>{
 const d=norm(`${x.domain||''} ${x.type||''}`);
 if(d.includes('platb'))return {prepare:14,plan:7,action:3,urgent:0};
 if(d.includes('doklad')||d.includes('smlouv')||d.includes('pojist'))return {prepare:60,plan:30,action:14,urgent:3};
 if(d.includes('servis')||d.includes('auto')||d.includes('dum')||d.includes('domov'))return {prepare:60,plan:30,action:14,urgent:3};
 return {prepare:30,plan:14,action:7,urgent:2};
};
function stage(days,p){
 if(days<0)return {stage:'OVERDUE',label:'PO TERMÍNU',priority:100};
 if(days<=p.urgent)return {stage:'URGENT',label:'TEĎ',priority:94};
 if(days<=p.action)return {stage:'ACTION',label:'ŘEŠIT',priority:86};
 if(days<=p.plan)return {stage:'PLAN',label:'NAPLÁNOVAT',priority:72};
 if(days<=p.prepare)return {stage:'PREPARE',label:'PŘIPRAVIT',priority:56};
 return {stage:'WATCH',label:'HLÍDAT',priority:30};
}
export function reminderEscalation(s={},now=new Date()){
 const tl=personalTimeline(s,now),rows=[];
 for(const x of tl.items){if(x.days===null||x.days>90)continue;const p=profileFor(x),st=stage(x.days,p);rows.push({...x,...st,profile:p,detail:x.days<0?`${Math.abs(x.days)} dní po termínu`:x.days===0?'termín dnes':`za ${x.days} dní`})}
 for(const a of assetBook(s,now).items){if(a.nextServiceDays===null||a.nextServiceDays>90)continue;const p={prepare:60,plan:30,action:14,urgent:3},st=stage(a.nextServiceDays,p);rows.push({key:`asset-service:${a.id}`,title:a.title,domain:'Servis',type:'Servis / kontrola',days:a.nextServiceDays,target:'home',homeMode:'dashboard',source:'MAJETEK',...st,profile:p,detail:a.reason})}
 const seen=new Set(),items=rows.sort((a,b)=>b.priority-a.priority||a.days-b.days).filter(x=>{const k=`${norm(x.title)}|${x.days}|${x.domain}`;if(seen.has(k))return false;seen.add(k);return true});
 return {items,urgent:items.filter(x=>x.priority>=90).length,action:items.filter(x=>x.stage==='ACTION').length,plan:items.filter(x=>x.stage==='PLAN').length,top:items.slice(0,10),note:reminderNote};
}

export function priceHistory(s={}){
 const rows=[];
 for(const x of (s.personalAdmin?.items||[]).filter(active)){
  const hist=Array.isArray(x.priceHistory)?x.priceHistory:[];
  const clean=hist.filter(h=>hasNum(h.amount)).sort((a,b)=>new Date(a.at||0)-new Date(b.at||0));
  if(!clean.length)continue;
  const first=clean[0],last=clean[clean.length-1],prev=clean.length>1?clean[clean.length-2]:null;
  const delta=prev?Number(last.amount)-Number(prev.amount):0,deltaPct=prev&&Number(prev.amount)!==0?delta/Number(prev.amount)*100:null,totalDelta=Number(last.amount)-Number(first.amount),totalPct=Number(first.amount)!==0?totalDelta/Number(first.amount)*100:null;
  rows.push({id:x.id,title:x.title||'Osobní položka',provider:x.provider||'',category:x.category||'OTHER',currency:String(last.currency||x.currency||'CZK').toUpperCase(),current:Number(last.amount),previous:prev?Number(prev.amount):null,delta,deltaPct,totalDelta,totalPct,entries:clean.length,history:clean});
 }
 rows.sort((a,b)=>Math.abs(Number(b.deltaPct||0))-Math.abs(Number(a.deltaPct||0))||String(a.title).localeCompare(String(b.title),'cs'));
 return {items:rows,changed:rows.filter(x=>x.previous!==null&&x.delta!==0).length,top:rows.filter(x=>x.previous!==null&&x.delta!==0).slice(0,8),note:'Historie ceny vzniká jen ze skutečně uložených změn částky. Bez historie Kamil OS žádné zdražení ani zlevnění nedopočítává.'};
}

export function changeFeed(s={},now=new Date(),days=30){
 const since=new Date(now).getTime()-Math.max(1,days)*DAY,rows=[];
 for(const a of s.audit||[]){const t=new Date(a.at||0).getTime();if(!Number.isFinite(t)||t<since)continue;if(!/osob|pojist|platb|doklad|rodin|domov|vstup|xtb|invest|majet|cil|cíl|inbox|servis|zalo|zálo/i.test(a.label||''))continue;rows.push({key:`audit:${a.id||a.at}`,at:a.at,title:a.label||'Osobní změna',kind:'ZMĚNA',source:'AUDIT'})}
 for(const x of priceHistory(s).items){for(const h of x.history.slice(-5)){const t=new Date(h.at||0).getTime();if(!Number.isFinite(t)||t<since)continue;rows.push({key:`price:${x.id}:${h.at}`,at:h.at,title:`${x.title}: ${Number(h.amount).toLocaleString('cs-CZ')} ${h.currency||x.currency}`,kind:'CENA',source:'HISTORIE CEN'})}}
 for(const x of s.personalInbox?.items||[]){if(!['ACCEPTED','DISMISSED'].includes(String(x.status||'').toUpperCase()))continue;const t=new Date(x.updatedAt||x.createdAt||0).getTime();if(!Number.isFinite(t)||t<since)continue;rows.push({key:`inbox:${x.id}`,at:x.updatedAt||x.createdAt,title:`Inbox: ${x.title}`,kind:x.status==='ACCEPTED'?'PŘIJATO':'VYŘEŠENO',source:x.source||'INBOX'})}
 const seen=new Set(),items=rows.sort((a,b)=>new Date(b.at)-new Date(a.at)).filter(x=>{if(seen.has(x.key))return false;seen.add(x.key);return true}).slice(0,30);
 return {items,total:items.length,days,note:'Feed je historie skutečných uložených změn. Nevyrábí události jen tím, že se obrazovka znovu načte.'};
}

export const MAINTENANCE_TEMPLATES={
 VEHICLE:[{key:'manufacturer-service',label:'Servis podle plánu výrobce'},{key:'tyres',label:'Pneumatiky / sezónní kontrola'},{key:'stk',label:'STK / evidovaný kontrolní termín'},{key:'insurance',label:'Pojištění / výročí'}],
 HOME_SYSTEM:[{key:'manufacturer-service',label:'Servis podle výrobce'},{key:'filter',label:'Filtr / spotřební materiál'},{key:'inspection',label:'Kontrola / revize podle dokumentace'}],
 APPLIANCE:[{key:'warranty',label:'Konec záruky'},{key:'care',label:'Údržba podle návodu'}],
 PROPERTY:[{key:'insurance',label:'Pojištění nemovitosti'},{key:'inspection',label:'Revize / kontrolní termín'},{key:'service',label:'Pravidelný servis vybavení'}],
 OTHER:[{key:'service',label:'Další servis / kontrola'},{key:'warranty',label:'Konec záruky'}]
};
export const maintenanceTemplatesFor=asset=>({asset,items:MAINTENANCE_TEMPLATES[asset?.kind]||MAINTENANCE_TEMPLATES.OTHER,note:maintenanceNote});

function parseCzechDate(raw){
 const m=String(raw||'').match(/\b([0-3]?\d)[.\/-]\s*([01]?\d)[.\/-]\s*(20\d{2})\b/);if(!m)return null;const d=new Date(Number(m[3]),Number(m[2])-1,Number(m[1]));return Number.isFinite(d.getTime())?fmtDate(d):null;
}
export function documentImportHints(text=''){
 const raw=String(text||'').slice(0,50000),q=norm(raw),lines=raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),hints={};
 let category='OTHER';if(/pojist|pojisteni|pojištění/.test(q))category='INSURANCE';else if(/faktura|vyuctovani|vyúčtování|splatnost/.test(q))category='PAYMENT';else if(/smlouva|predplat|předplat|tarif/.test(q))category='SUBSCRIPTION';else if(/stk|technick/.test(q))category='DOCUMENT';
 const amountMatch=raw.match(/(?:částka|celkem|k úhradě|k uhrade|pojistné|pojistne)[^\d]{0,20}([\d\s]+(?:[,.]\d{1,2})?)\s*(Kč|CZK|EUR|€|USD|\$)/i)||raw.match(/([\d\s]+(?:[,.]\d{1,2})?)\s*(Kč|CZK|EUR|€|USD|\$)/i);
 if(amountMatch){const amount=Number(amountMatch[1].replace(/\s/g,'').replace(',','.'));if(Number.isFinite(amount)){hints.amount=amount;hints.currency=/€|EUR/i.test(amountMatch[2])?'EUR':/\$|USD/i.test(amountMatch[2])?'USD':'CZK'}}
 const dateMatches=[...raw.matchAll(/\b([0-3]?\d)[.\/-]\s*([01]?\d)[.\/-]\s*(20\d{2})\b/g)].map(m=>parseCzechDate(m[0])).filter(Boolean);
 if(dateMatches.length)hints.dates=[...new Set(dateMatches)].slice(0,6);
 hints.category=category;hints.title=lines[0]?.slice(0,120)||'';hints.provider=lines.slice(0,6).find(x=>/s\.r\.o\.|a\.s\.|pojišť|pojist|energie|telecom|mobil|banka/i.test(x))?.slice(0,120)||'';
 const sensitiveMarkers=[/číslo\s+smlouvy/i,/rodné\s+číslo/i,/číslo\s+dokladu/i,/iban/i,/variabilní\s+symbol/i].filter(r=>r.test(raw)).length;
 return {ok:raw.trim().length>0,hints,confidence:Object.keys(hints).length>=4?'MEDIUM':'LOW',sensitiveMarkers,note:importNote};
}

export function onboardingWizard(s={},meta={},now=new Date()){
 const q=dataQuality(s,meta,now),steps=q.top.slice(0,3).map((x,i)=>({rank:i+1,title:x.title,detail:x.detail,priority:x.priority,target:x.target,homeMode:x.homeMode,source:'DATA QUALITY'}));
 const coverage={personalAdmin:(s.personalAdmin?.items||[]).filter(active).length,family:(s.familyHome?.members||[]).filter(active).length,assets:(s.assetBook?.items||[]).filter(active).length,emergency:(s.emergencyFile?.contacts||[]).filter(active).length,goals:(s.personalGoals?.items||[]).filter(active).length,inbox:personalInbox(s,now).total};
 const optional=[];if(!coverage.personalAdmin)optional.push('Pokud máš pravidelné osobní platby nebo smlouvy, přidej první položku.');if(!coverage.assets)optional.push('Pokud chceš hlídat servis nebo záruku, přidej první auto / zařízení.');if(!coverage.emergency)optional.push('Pokud chceš nouzový přehled, přidej kontakt pro Emergency File.');if(!coverage.goals)optional.push('Pokud spoříš na konkrétní věc, založ cíl / fond.');
 const score=q.score,complete=q.total===0&&coverage.personalAdmin+coverage.family+coverage.assets+coverage.emergency+coverage.goals>0;
 return {steps,coverage,optional:optional.slice(0,3),score,complete,note:'Onboarding nikdy netvrdí, že chybějící kategorie musí existovat. Povinné kroky vznikají jen z již uložených neúplných dat; ostatní jsou označené jako volitelné.'};
}

export function oneScreenAutopilot(s={},meta={},now=new Date()){
 const briefing=smartBriefing(s,meta,now),money=householdCockpit(s,now),escalation=reminderEscalation(s,now),changes=changeFeed(s,now,14),quality=dataQuality(s,meta,now),goals=goalPlan(s,now),allocation=capitalAllocation(s,now);
 const moneyAlerts=[];if(money.cashflow.status==='RISK')moneyAlerts.push(`Cashflow podle známých dat prolomí rezervu${money.cashflow.belowReserveDate?` od ${money.cashflow.belowReserveDate}`:''}.`);if(allocation.unfundedPlan>0)moneyAlerts.push(`Plánovaná investice přesahuje bezpečný prostor o ${round(allocation.unfundedPlan).toLocaleString('cs-CZ')} ${money.primary}.`);if(goals.attention)moneyAlerts.push(`${goals.attention} cílů potřebuje kontrolu tempa.`);
 const approaching=escalation.items.filter(x=>x.days>=0).slice(0,5),quiet=briefing.quiet&&!moneyAlerts.length&&!quality.high&&!escalation.urgent;
 return {doToday:briefing.today.slice(0,3),moneyAlerts:moneyAlerts.slice(0,3),approaching,changes:changes.items.slice(0,6),quiet,briefing,money,escalation,quality,goals,note:autopilotNote};
}
