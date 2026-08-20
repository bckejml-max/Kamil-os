import {personalAdmin} from './personalAdmin25.js';

const REVIEWABLE=new Set(['SUBSCRIPTION','UTILITY','INSURANCE','LOAN','HOME','VEHICLE','FEE']);
const WINDOW_EXPECTED=new Set(['SUBSCRIPTION','UTILITY','INSURANCE']);
const n=v=>Number(v||0);
const providerKey=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const stateLabel=s=>({MISSED_NOTICE:'PO TERMÍNU',ACT_NOW:'ROZHODNOUT',REVIEW_SOON:'PROVĚŘIT',DATA_GAP:'DOPLNIT DATA',REVIEW:'PROVĚŘIT',WATCH:'HLÍDAT'}[s]||s);
const homeMode=x=>x.category==='INSURANCE'?'insurance':x.category==='VEHICLE'?'car':x.category==='HOME'?'house':'contracts';
const nearestDays=x=>[x.noticeDays,x.renewalDays].filter(v=>v!==null&&v!==undefined&&v>=0).sort((a,b)=>a-b)[0]??99999;

export const renewalRadarNote='Renewal & Savings Radar používá pouze uložené částky, periodicitu a termíny. Roční spend k prověření není odhad úspory. Kamil OS nezná konkurenční cenu, nic automaticky neruší, nepřepisuje ani neobjednává.';

function rowFor(x,providerCount){
 let priority=25,state='WATCH',action='Ponechat pod kontrolou';
 const reasons=[],notice=x.noticeDays,renewal=x.renewalDays,annual=x.annual;
 const raise=(p,s,a,reason)=>{if(p>priority){priority=p;state=s;action=a}if(reason)reasons.push(reason)};

 if(notice!==null&&notice!==undefined){
  if(notice<0&&notice>=-30&&(renewal===null||renewal===undefined||renewal>=0))raise(98,'MISSED_NOTICE','Prověřit možnosti ještě dnes',`Výpovědní termín uplynul před ${Math.abs(notice)} dny.`);
  else if(notice>=0&&notice<=14)raise(94,'ACT_NOW','Rozhodnout před výpovědním termínem',`Na výpovědní termín zbývá ${notice} dní.`);
  else if(notice<=30&&notice>=0)raise(86,'REVIEW_SOON','Prověřit pokračování nebo změnu',`Výpovědní okno končí za ${notice} dní.`);
  else if(notice<=60&&notice>=0)raise(72,'REVIEW_SOON','Naplánovat kontrolu závazku',`Výpovědní termín je za ${notice} dní.`);
  else if(notice<-30&&(renewal===null||renewal===undefined))raise(64,'DATA_GAP','Aktualizovat smluvní termíny','Uložený výpovědní termín je starší a chybí aktuální výročí.');
 }

 if(renewal!==null&&renewal!==undefined){
  if(renewal<0)raise(68,'REVIEW','Ověřit aktuální stav po výročí',`Uložené výročí je ${Math.abs(renewal)} dní po termínu.`);
  else if(renewal<=14)raise(90,'ACT_NOW','Prověřit před prodloužením',`Výročí / konec je za ${renewal} dní.`);
  else if(renewal<=30)raise(82,'REVIEW_SOON','Prověřit podmínky před výročím',`Výročí / konec je za ${renewal} dní.`);
  else if(renewal<=60)raise(70,'REVIEW_SOON','Naplánovat kontrolu před výročím',`Výročí / konec je za ${renewal} dní.`);
  else if(renewal<=90)raise(58,'REVIEW','Připravit kontrolu závazku',`Výročí / konec je za ${renewal} dní.`);
 }

 const missingWindow=WINDOW_EXPECTED.has(x.category)&&x.cadence!=='ONCE'&&(notice===null||notice===undefined)&&(renewal===null||renewal===undefined);
 if(missingWindow)raise(64,'DATA_GAP','Zjistit výročí a výpovědní lhůtu','Opakovaný závazek nemá uložené výročí ani výpovědní termín.');

 const nearWindow=(notice!==null&&notice!==undefined&&notice>=0&&notice<=30)||(renewal!==null&&renewal!==undefined&&renewal>=0&&renewal<=45);
 if(x.autoPay&&nearWindow)raise(Math.max(priority,priority>=90?priority:88),priority>=90?state:'REVIEW_SOON',priority>=90?action:'Rozhodnout před další automatickou platbou','Platba je označená jako automatická a současně se blíží smluvní okno.');

 if(providerCount>1){
  raise(Math.max(priority,58),state==='WATCH'?'REVIEW':state,state==='WATCH'?'Prověřit všechny závazky u poskytovatele':action,`U stejného poskytovatele jsou evidované ${providerCount} aktivní opakované závazky; ověř, že je každý záměrný.`);
 }

 if(!reasons.length&&annual!==null&&annual>0)reasons.push('Aktivní opakovaný závazek bez blízkého rozhodovacího okna.');
 return {...x,priority,state,stateLabel:stateLabel(state),action,reasons,reason:reasons[0]||'Bez zvláštního signálu.',annualSpend:annual,monthlySpend:x.monthly,providerCount,missingWindow,homeMode:homeMode(x),source:'ULOŽENÁ DATA / PRAVIDLO'};
}

export function renewalRadar(s={},now=new Date()){
 const admin=personalAdmin(s,now);
 const candidates=admin.items.filter(x=>REVIEWABLE.has(x.category)&&((x.cadence||'ONCE')!=='ONCE'||x.noticeDays!==null||x.renewalDays!==null));
 const providers=new Map();
 for(const x of candidates){const k=providerKey(x.provider);if(!k)continue;providers.set(k,(providers.get(k)||0)+1)}
 const rows=candidates.map(x=>rowFor(x,providers.get(providerKey(x.provider))||0)).sort((a,b)=>b.priority-a.priority||nearestDays(a)-nearestDays(b)||String(a.title||'').localeCompare(String(b.title||''),'cs'));
 const actionable=rows.filter(x=>x.priority>=75),review=rows.filter(x=>x.priority>=58),dataGaps=rows.filter(x=>x.missingWindow),due30=rows.filter(x=>(x.noticeDays!==null&&x.noticeDays>=0&&x.noticeDays<=30)||(x.renewalDays!==null&&x.renewalDays>=0&&x.renewalDays<=30));
 const reviewSpendByCurrency={};
 for(const x of review){if(x.annualSpend===null||x.annualSpend<=0)continue;const c=x.currency||'CZK';reviewSpendByCurrency[c]=n(reviewSpendByCurrency[c])+x.annualSpend}
 const providerGroups=[...providers.values()].filter(x=>x>1).length;
 return {rows,top:rows.slice(0,8),actionable:actionable.length,due30:due30.length,dataGaps:dataGaps.length,providerGroups,reviewSpendByCurrency,note:renewalRadarNote};
}
