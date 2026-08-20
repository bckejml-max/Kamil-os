import {householdBills} from './householdBills25.js';
import {insuranceCenter} from './insurance25.js';
import {documentsCenter} from './documents25.js';
import {familyHome} from './familyHome25.js';

export const personalRiskNote='Personal Risk Center skládá pouze pravidlové signály z ručně uložených osobních dat. Skóre není pravděpodobnost škody ani odborný finanční, právní nebo pojistný posudek.';

const severity=priority=>priority>=95?'CRITICAL':priority>=80?'HIGH':priority>=60?'MEDIUM':'LOW';
const label=s=>({CRITICAL:'KRITICKÉ',HIGH:'VYSOKÉ',MEDIUM:'STŘEDNÍ',LOW:'NÍZKÉ'}[s]||s);

function candidate({key,title,domain,priority=0,reason='',detail='',date=null,financial=false,source=''}){
 const p=Math.max(0,Math.min(100,Number(priority)||0)),sev=severity(p);
 return {key,title:title||'Osobní riziko',domain,priority:p,severity:sev,severityLabel:label(sev),reason,detail,date,financial:!!financial,source};
}

function merge(items=[]){
 const map=new Map();
 for(const x of items){
  if(!x?.key)continue;
  const prev=map.get(x.key);
  if(!prev){map.set(x.key,{...x,reasons:[x.reason].filter(Boolean),domains:[x.domain].filter(Boolean)});continue}
  const better=x.priority>prev.priority?x:prev;
  map.set(x.key,{...better,reasons:[...new Set([...(prev.reasons||[]),x.reason].filter(Boolean))],domains:[...new Set([...(prev.domains||[]),x.domain].filter(Boolean))],financial:prev.financial||x.financial});
 }
 return [...map.values()].sort((a,b)=>b.priority-a.priority||String(a.title||'').localeCompare(String(b.title||''),'cs'));
}

export function personalRiskCenter(s={},now=new Date()){
 const bills=householdBills(s,now),insurance=insuranceCenter(s,now),documents=documentsCenter(s,now),home=familyHome(s,now);
 const raw=[];
 for(const x of bills.items){
  if(x.priority<50)continue;
  raw.push(candidate({key:`admin:${x.id}`,title:x.title,domain:'Platby',priority:x.priority,reason:x.issues[0]||'Platební závazek vyžaduje kontrolu',detail:x.autoPay?'Automatická platba':'Ruční platba / neznámé',date:x.nextDue||null,financial:true,source:'HOUSEHOLD_BILLS'}));
 }
 for(const x of insurance.policies){
  if(x.priority<50)continue;
  raw.push(candidate({key:`admin:${x.id}`,title:x.title,domain:'Pojištění',priority:x.priority,reason:x.issues[0]||'Pojistka vyžaduje kontrolu',detail:x.insured||x.provider||'',date:x.expiry||x.renewal||x.notice||null,financial:x.premium!==null,source:'INSURANCE'}));
 }
 for(const x of documents.items){
  if(x.priority<50)continue;
  raw.push(candidate({key:`admin:${x.id}`,title:x.title,domain:'Doklady',priority:x.priority,reason:x.issues[0]||'Doklad / termín vyžaduje kontrolu',detail:x.holder||x.kindLabel||'',date:x.expiry||x.reminder||null,financial:false,source:'DOCUMENTS'}));
 }
 for(const x of home.obligations){
  if(x.priority<50)continue;
  raw.push(candidate({key:`admin:${x.id}`,title:x.title,domain:'Domov',priority:x.priority,reason:x.issues[0]||'Domácí závazek vyžaduje kontrolu',detail:x.provider||'',date:x.date||null,financial:x.amount!==null&&x.amount!==undefined,source:'FAMILY_HOME'}));
 }
 const items=merge(raw),critical=items.filter(x=>x.severity==='CRITICAL').length,high=items.filter(x=>x.severity==='HIGH').length,medium=items.filter(x=>x.severity==='MEDIUM').length;
 const financial=items.filter(x=>x.financial).length,admin=items.length-financial;
 const score=Math.max(0,100-Math.min(100,critical*25+high*12+medium*5));
 return {items,total:items.length,critical,high,medium,financial,admin,score,top:items.slice(0,5),note:personalRiskNote};
}
