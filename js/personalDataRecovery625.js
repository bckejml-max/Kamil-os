const ADMIN=[
 {id:'recovered-home-insurance-2026',title:'Pojištění domu Vlasatice — ověřit aktivitu',category:'pojištění nemovitosti',kind:'insurance',status:'VERIFY',amount:2600,annual:2600,start:'2026-03-25',nextAt:'2027-03-25',provider:'Pojišťovna VZP',source:'archive:Navrh_pojistne_smlouvy_2026',notes:'Archivní návrh: budova 2 600 Kč/rok; domácnost v dokumentu nesjednána. Aktivitu smlouvy ověřit podle platby/potvrzení.'},
 {id:'recovered-electricity-eon-2026',title:'E.ON elektřina Vlasatice — smlouva do 31.12.2027',category:'energie',kind:'utility',status:'ACTIVE_ARCHIVE',due:'2027-12-11',contractEnd:'2027-12-31',provider:'E.ON',source:'archive:Smlouva_elektrina_MAX_3_25',notes:'Smlouva na dobu určitou do 31.12.2027; výpověď bez automatického prodloužení nejpozději 20. den před koncem období.'},
 {id:'recovered-life-kamil-allianz',title:'Životní pojištění Kamil — Allianz',category:'životní pojištění',kind:'insurance',status:'VERIFY',amount:915,monthly:915,start:'2025-04-02',provider:'Allianz',source:'archive:Allianz_ZIVOT_Kamil',notes:'Archivní dokument uvádí variantu 915 Kč měsíčně. Ověřit, že smlouva je stále aktivní.'},
 {id:'recovered-life-tereza-nn',title:'Životní pojištění Tereza — NN Orange Risk',category:'životní pojištění',kind:'insurance',status:'VERIFY',amount:574,monthly:574,start:'2025-07-01',provider:'NN',source:'archive:NN_Orange_Risk',notes:'Archivní modelace/smluvní podklady uvádějí 574 Kč měsíčně. Ověřit aktuální aktivitu.'},
 {id:'recovered-auto-insurance',title:'Pojištění auta — ověřit aktuální smlouvu',category:'auto pojištění',kind:'insurance',status:'VERIFY',provider:'PVZP / Allianz',source:'archive:auto-insurance-proposals',notes:'V archivu jsou pojistné návrhy z let 2025–2026; bez spolehlivého potvrzení, který je aktuálně účinný.'},
 {id:'recovered-bank-coverage',title:'Bankovní data — MONETA pokryta 01–07/2026',category:'banky',kind:'bank-data',status:'VERIFY',provider:'MONETA',source:'archive:Wealth_OS_6_6_AUDIT_ZDROJU',notes:'Audit uvádí kompletní měsíční výpisy MONETA za leden–červenec 2026. U dalších bank byly v auditu chybějící nebo neověřené výpisy.'}
];

const ASSETS=[
 {id:'recovered-mortgage-2026-08',name:'Hypotéka — zůstatek jistiny 08/2026',category:'hypotéka',kind:'liability',status:'ARCHIVE_SNAPSHOT',value:-3424369.42,balance:3424369.42,monthly:17945,asOf:'2026-08-01',source:'archive:Wealth_OS_6_2_SCENARIO_CONTROL_TOWER',notes:'Poslední dohledaný model: jistina 3 424 369,42 Kč; pravidelná splátka 17 945 Kč.'},
 {id:'recovered-home-vlasatice',name:'Dům Vlasatice',category:'nemovitost',kind:'property',status:'KNOWN',source:'archive:property-documents',notes:'Nemovitost je známá z archivních smluv a projektových podkladů; aktuální tržní hodnotu 62.5 nedoplňuje bez čerstvého zdroje.'}
];

const GAPS=[
 {key:'home-policy-active',title:'Potvrdit aktivitu pojištění domu',reason:'Archiv obsahuje návrh a platební podmínky, ne samostatné potvrzení aktuálního stavu.'},
 {key:'household-cover',title:'Prověřit pojištění domácnosti',reason:'V dohledaném návrhu pro Vlasatice je pojištění domácnosti uvedeno jako nesjednané.'},
 {key:'life-policies-active',title:'Potvrdit životní pojistky',reason:'Máme smluvní/modelační podklady a pojistné, ale ne čerstvý výpis aktivních smluv.'},
 {key:'auto-policy-current',title:'Určit aktuální auto pojistku',reason:'V archivu je více pojistných návrhů; bez potvrzení nechci hádat, který nyní platí.'},
 {key:'bank-freshness',title:'Doplnit čerstvé bankovní výpisy',reason:'Dohledaný audit má úplné MONETA výpisy jen do července 2026 a u dalších bank mezery.'}
];

const dedupe=(live=[],recovered=[])=>{
 const ids=new Set((Array.isArray(live)?live:[]).map(x=>x?.id).filter(Boolean));
 return [...(Array.isArray(live)?live:[]),...recovered.filter(x=>!ids.has(x.id))];
};

export function personalDataRecovery625(s={}){
 return{admin:dedupe(s.personalAdmin?.items,ADMIN),assets:dedupe(s.assetBook?.items,ASSETS),gaps:GAPS.map(x=>({...x})),recovered:{admin:ADMIN.length,assets:ASSETS.length,gaps:GAPS.length},summary:`Obnoveno ${ADMIN.length+ASSETS.length} archivních osobních záznamů · ${GAPS.length} bodů k ověření`};
}

export function mergeRecoveredPersonalData625(s={}){
 const r=personalDataRecovery625(s);
 return{...s,personalAdmin:{...(s.personalAdmin||{}),items:r.admin},assetBook:{...(s.assetBook||{}),items:r.assets},personalRecovery625:{gaps:r.gaps,recovered:r.recovered,summary:r.summary}};
}
