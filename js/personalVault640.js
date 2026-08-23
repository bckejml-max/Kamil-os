import {store} from './state.js';
import {personalDataConfidence626} from './personalDataConfidence626.js';
import {evidenceLedger630,confirmEvidence630} from './personalEvidenceLedger630.js';

const DAY=86400000;
const nowIso=()=>new Date().toISOString();
const num=v=>Number.isFinite(Number(v))?Number(v):null;
const daysBetween=(a,b=Date.now())=>{const t=Date.parse(a||'');return Number.isFinite(t)?Math.floor((b-t)/DAY):null};
const daysUntil=(a,b=Date.now())=>{const t=Date.parse(a||'');return Number.isFinite(t)?Math.ceil((t-b)/DAY):null};

const META={
 'recovered-home-insurance-2026':{section:'home',recordType:'insurance',title:'Pojištění domu Vlasatice',provider:'PVZP',annualAmount:2600,reviewAt:'2027-03-25',sourceLabel:'Archivní návrh pojistné smlouvy',nextAction:'Potvrdit, že smlouva je stále aktivní a kryje současný stav rekonstrukce.',freshnessDays:365},
 'recovered-electricity-eon-2026':{section:'home',recordType:'utility',title:'Elektřina E.ON — Vlasatice',provider:'E.ON',validUntil:'2027-12-31',noticeBy:'2027-12-11',sourceLabel:'Smlouva E.ON',nextAction:'Před 11. 12. 2027 rozhodnout o prodloužení nebo změně dodavatele.'},
 'recovered-life-kamil-allianz':{section:'documents',recordType:'insurance',title:'Životní pojištění Kamil',provider:'Allianz',monthlyAmount:915,asOf:'2026-07-31',freshnessDays:180,sourceLabel:'Allianz smluvní podklady + audit platby',nextAction:'Při dalším bankovním výpisu potvrdit pravidelnou platbu 915 Kč.'},
 'recovered-life-tereza-nn':{section:'documents',recordType:'insurance',title:'Životní pojištění Tereza',provider:'NN',monthlyAmount:574,asOf:'2025-07-01',freshnessDays:180,sourceLabel:'NN Orange Risk smluvní podklady',nextAction:'Najít novější platbu 574 Kč nebo potvrzení pojišťovny.'},
 'recovered-auto-insurance':{section:'documents',recordType:'insurance',title:'Pojištění auta',provider:'Neurčeno',sourceLabel:'Archiv více pojistných návrhů',nextAction:'Najít aktuální zelenou kartu nebo poslední zaplacené pojistné s číslem smlouvy.',freshnessDays:30},
 'recovered-bank-coverage':{section:'money',recordType:'bank-data',title:'Bankovní data — MONETA',provider:'MONETA',asOf:'2026-07-31',freshnessDays:45,sourceLabel:'Audit zdrojů + výpis 2026/7',nextAction:'Doplnit další uzavřený měsíční výpis; ostatní banky zůstávají neúplné.'},
 'recovered-mortgage-2026-08':{section:'money',recordType:'mortgage',title:'Hypotéka',provider:'',balance:3424369.42,monthlyAmount:17945,asOf:'2026-08-01',freshnessDays:45,sourceLabel:'Wealth OS modelový registr 01.08.2026',nextAction:'Po další splátce aktualizovat skutečný zůstatek jistiny.'},
 'recovered-home-vlasatice':{section:'home',recordType:'property',title:'Dům Vlasatice',provider:'',sourceLabel:'Kupní / stavební dokumentace',nextAction:'Doplnit pouze aktuální tržní hodnotu, pokud ji chceme používat ve financích.'}
};

const evidenceMap=s=>{
 const stateItems=Array.isArray(s?.personalVault?.evidence)?s.personalVault.evidence:[];
 const local=evidenceLedger630().items||[];
 const all=[...stateItems,...local].sort((a,b)=>String(b.confirmedAt||'').localeCompare(String(a.confirmedAt||'')));
 return new Map(all.map(x=>[x.id,x]));
};

export function buildRecoveryVaultSeed640(s=store.get()){
 const confidence=personalDataConfidence626(s);
 return confidence.records.map(r=>{
  const m=META[r.id]||{};
  return {
   id:r.id,title:m.title||r.title||r.name||r.id,section:m.section||'documents',recordType:m.recordType||r.kind||'record',
   provider:m.provider??r.provider??'',monthlyAmount:num(m.monthlyAmount??r.monthly),annualAmount:num(m.annualAmount??r.annual),
   balance:num(m.balance??r.balance),validUntil:m.validUntil||r.contractEnd||null,noticeBy:m.noticeBy||null,reviewAt:m.reviewAt||null,
   asOf:m.asOf||r.asOf||r.confidenceFreshness||null,freshnessDays:m.freshnessDays||null,
   confidence:Number(r.confidence||50),confidenceLabel:r.confidenceLabel||'OVĚŘIT',
   source:r.source||null,sourceLabel:m.sourceLabel||r.source||'Archivní zdroj',sourceBasis:r.confidenceBasis||r.notes||'',
   nextAction:m.nextAction||r.confidenceNext||'Ověřit čerstvým zdrojem.',seededFrom:'recovery-62.5',createdAt:nowIso(),updatedAt:nowIso()
  };
 });
}

export function ensurePersonalVault640(){
 const s=store.get(),existing=Array.isArray(s.personalVault?.items)?s.personalVault.items:[];
 if(existing.length)return personalVault640(s);
 const seed=buildRecoveryVaultSeed640(s),legacyEvidence=evidenceLedger630().items||[];
 store.mutate('Personal Data Vault 64.0 — migrace osobních dat',x=>{
  x.personalVault={...(x.personalVault||{}),version:1,items:seed,evidence:legacyEvidence,migratedAt:x.personalVault?.migratedAt||nowIso(),updatedAt:nowIso()};
 },{undo:false,cloud:true,audit:true});
 return personalVault640(store.get());
}

export function vaultRecordStatus640(record,evidence=null,now=Date.now()){
 const base=Number(record?.confidence||0),age=evidence?.confirmedAt?daysBetween(evidence.confirmedAt,now):null,maxEvidence=Number(record?.freshnessDays||365);
 const proofFresh=!!evidence&&(age===null||age<=maxEvidence);
 const effective=proofFresh?Math.max(base,Number(evidence.after||95)):base;
 const until=daysUntil(record?.validUntil,now),notice=daysUntil(record?.noticeBy,now),review=daysUntil(record?.reviewAt,now);
 const snapshotAge=record?.asOf?daysBetween(record.asOf,now):null;
 let code='OK',label='V pořádku',severity=0,detail='Údaj je v pořádku podle uložených podkladů.';
 if(until!==null&&until<0){code='EXPIRED';label='Po platnosti';severity=100;detail=`Platnost skončila před ${Math.abs(until)} dny.`}
 else if(notice!==null&&notice<=30){code='NOTICE';label='Rozhodnout';severity=92;detail=notice<0?'Termín pro rozhodnutí už minul.':`Rozhodnutí nejpozději za ${notice} dní.`}
 else if(until!==null&&until<=45){code='EXPIRING';label='Brzy končí';severity=88;detail=`Platnost končí za ${until} dní.`}
 else if(snapshotAge!==null&&record?.freshnessDays&&snapshotAge>record.freshnessDays){code='STALE';label='Aktualizovat';severity=82;detail=`Poslední stav je ${snapshotAge} dní starý.`}
 else if(effective<65){code='VERIFY';label='Ověřit';severity=96;detail='Nemáme spolehlivé potvrzení aktuálního stavu.'}
 else if(effective<85){code='CHECK';label='Potvrdit';severity=72;detail='Máme podklady, ale chybí čerstvé potvrzení.'}
 else if(review!==null&&review<=45){code='REVIEW';label='Zkontrolovat';severity=65;detail=review<0?'Výroční kontrola je po termínu.':`Kontrola za ${review} dní.`}
 return{code,label,severity,detail,effectiveConfidence:effective,evidenceFresh:proofFresh,daysUntil:until,daysToNotice:notice,snapshotAge};
}

export function personalVault640(s=store.get()){
 const items=Array.isArray(s.personalVault?.items)&&s.personalVault.items.length?s.personalVault.items:buildRecoveryVaultSeed640(s),emap=evidenceMap(s);
 const records=items.map(v=>({...v,status:vaultRecordStatus640(v,emap.get(v.id))}));
 const action=records.filter(v=>v.status.severity>0).sort((a,b)=>b.status.severity-a.status.severity);
 const coverage=records.length?Math.round(records.reduce((a,v)=>a+v.status.effectiveConfidence,0)/records.length):0;
 const monthlyKnown=records.reduce((a,v)=>a+(num(v.monthlyAmount)||0)+(num(v.annualAmount)||0)/12,0);
 const annualKnown=records.reduce((a,v)=>a+(num(v.annualAmount)||0)+(num(v.monthlyAmount)||0)*12,0);
 const insurance=records.filter(v=>v.recordType==='insurance');
 const insuranceAnnual=insurance.reduce((a,v)=>a+(num(v.annualAmount)||0)+(num(v.monthlyAmount)||0)*12,0);
 return{records,action,coverage,monthlyKnown,annualKnown,insurance,insuranceAnnual,evidence:emap,cloudReady:!!s.meta?.cloudMode,summary:`${records.length} osobních záznamů · pokrytí ${coverage}%`};
}

export function confirmVaultRecord640(id,note='Potvrzeno uživatelem v Personal Data Vault 64.0'){
 const x=personalVault640(),record=x.records.find(v=>v.id===id);if(!record)return null;
 const after=Math.max(95,record.status.effectiveConfidence);
 const proof=confirmEvidence630({id:record.id,title:record.title,note,before:record.status.effectiveConfidence,after,proofType:'uživatelsky potvrzený aktuální doklad / údaj'});
 store.mutate(`Potvrzen osobní údaj: ${record.title}`,s=>{
  s.personalVault=s.personalVault||{version:1,items:[],evidence:[]};
  const target=(s.personalVault.items||[]).find(v=>v.id===id);if(target){target.lastVerifiedAt=proof.confirmedAt;target.updatedAt=proof.confirmedAt}
 },{undo:true,cloud:true,audit:true});
 return proof;
}

export function personalVaultRecord640(id,s=store.get()){return personalVault640(s).records.find(v=>v.id===id)||null;}
