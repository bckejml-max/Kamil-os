export const PERSONAL_MASTER_ID_1337='personal-assets-docs-2026-10-01-v1';

const now='2026-10-01T00:00:00.000Z';

export const ASSET_MASTER_ITEMS_1337=[
 {
  id:'recovered-home-vlasatice',name:'Dům Vlasatice 262',title:'Dům Vlasatice 262',category:'REAL_ESTATE',kind:'property',
  status:'ACTIVE',ownershipRole:'FAMILY_OWNED',ownerLabel:'rodinný majetek',value:null,currency:'CZK',
  source:'Kamil OS · rekonstrukce / projektová dokumentace',sourceStatus:'CONFIRMED',asOf:'2026-10-01',
  notes:'Probíhá rekonstrukce. Statický posudek je hotový; projektová dokumentace pro povolení se řeší s Eliškou Růžičkovou. Aktuální tržní hodnota není v OS vedena jako potvrzený údaj.',
  nextAction:'Počkat na cenovou kalkulaci projektové dokumentace; tržní hodnotu doplnit jen z čerstvého podkladu.'
 },
 {
  id:'asset-pasohlavky-157',name:'Dům Pasohlávky 157',title:'Dům Pasohlávky 157',category:'REAL_ESTATE',kind:'property',
  status:'ACTIVE',ownershipRole:'FAMILY_RELATED',ownerLabel:'Tereza + sestra',value:8000000,currency:'CZK',
  source:'uživatelsky potvrzený rodinný přehled',sourceStatus:'USER_CONFIRMED',asOf:'2026-09-01',
  notes:'Rodinný dům, dvě podlaží + sklep; přízemí opravené. Zahrada s altánem, kurníkem a bazénem. Hodnota cca 8 mil. Kč je orientační.',
  nextAction:'Bez akutní akce; hodnotu aktualizovat jen při prodeji, refinancování nebo pojistné revizi.'
 },
 {
  id:'asset-scala-8c46678',name:'Škoda Scala · 8C46678',title:'Škoda Scala · 8C46678',category:'VEHICLE',kind:'vehicle',
  status:'ACTIVE',ownershipRole:'USER_OWNED',ownerLabel:'Kamil',primaryDriver:'Tereza',value:null,currency:'CZK',
  source:'uživatelsky potvrzeno 1. 10. 2026 + registr pojištění',sourceStatus:'USER_CONFIRMED',asOf:'2026-10-01',
  details:{year:2019,firstRegistration:'2019-05-30',engine:'1.5 TSI',fuel:'benzín',powerKw:110,transmission:'DSG',odometerKm:105000},
  maintenance:[
   {kind:'brakes',label:'Brzdy',doneAt:'2026-09-30',status:'DONE'},
   {kind:'engine-oil',label:'Motorový olej + filtr',doneAt:'2026-09-01',approx:true,status:'DONE'},
   {kind:'spark-plugs',label:'Svíčky',status:'VERIFY'},
   {kind:'brake-fluid',label:'Brzdová kapalina',status:'VERIFY'},
   {kind:'dsg',label:'DSG servis / olej',status:'VERIFY'}
  ],
  notes:'Soukromé auto; běžně v něm jezdí Tereza. Brzdy jsou nové, olej měněný přibližně měsíc před 1. 10. 2026.',
  nextAction:'Při nejbližším servisu ověřit historii svíček, brzdové kapaliny a DSG servisu.'
 },
 {
  id:'asset-trinity-cash-2026-09',name:'Trinity Bank · hotovostní rezerva',title:'Trinity Bank · hotovostní rezerva',category:'CASH',kind:'bank-account',
  status:'SNAPSHOT',ownershipRole:'USER_OWNED',value:2000000,currency:'CZK',asOf:'2026-09-27',
  source:'uživatelsky potvrzený stav 27. 9. 2026',sourceStatus:'USER_CONFIRMED',
  notes:'Snapshot pro cash parking; nejde o živý bankovní feed.',
  nextAction:'Aktualizovat pouze při přesunu významné části hotovosti.'
 },
 {
  id:'asset-jt-cash-2026-09',name:'J&T Banka · hotovostní rezerva',title:'J&T Banka · hotovostní rezerva',category:'CASH',kind:'bank-account',
  status:'SNAPSHOT',ownershipRole:'USER_OWNED',value:2000000,currency:'CZK',asOf:'2026-09-27',
  source:'uživatelsky potvrzený stav 27. 9. 2026',sourceStatus:'USER_CONFIRMED',
  notes:'Snapshot pro cash parking; nejde o živý bankovní feed.',
  nextAction:'Aktualizovat pouze při přesunu významné části hotovosti.'
 },
 {
  id:'recovered-mortgage-2026-08',name:'Hypotéka',title:'Hypotéka',category:'LIABILITY',kind:'liability',
  status:'SNAPSHOT',ownershipRole:'HOUSEHOLD',value:-3424369.42,balance:3424369.42,monthly:17945,currency:'CZK',asOf:'2026-08-01',
  source:'Kamil OS · poslední potvrzený snapshot',sourceStatus:'SNAPSHOT',
  notes:'Poslední známý zůstatek jistiny 3 424 369,42 Kč a pravidelná splátka 17 945 Kč. Číslo není živý bankovní údaj.',
  nextAction:'Aktualizovat při další finanční revizi nebo před změnou fixace.'
 }
];

export const DOCUMENT_MASTER_ITEMS_1337=[
 {
  id:'doc-kamil-driver-licence',title:'Kamil · řidičský průkaz',section:'documents',recordType:'identity',
  validUntil:'2032-09-23',confidence:100,confidenceLabel:'POTVRZENO',sourceLabel:'uživatelsky potvrzeno 1. 10. 2026',
  sourceBasis:'Platnost řidičského průkazu potvrzena uživatelem.',nextAction:'Bez akce; řešit až před koncem platnosti.',freshnessDays:3650,
  seededFrom:'personal-master-1337',createdAt:now,updatedAt:now
 },
 {
  id:'doc-kamil-passport',title:'Kamil · cestovní pas',section:'documents',recordType:'identity',
  confidence:95,confidenceLabel:'POTVRZENO PŘIBLIŽNĚ',sourceLabel:'uživatelsky potvrzeno 1. 10. 2026',
  sourceBasis:'Uživatel uvedl platnost přibližně do roku 2033; přesný den není uložen.',nextAction:'Přesné datum doplnit jen před cestou nebo při další kontrole dokladů.',freshnessDays:1800,
  notes:'Platnost přibližně do roku 2033.',seededFrom:'personal-master-1337',createdAt:now,updatedAt:now
 },
 {
  id:'doc-tereza-id',title:'Tereza · občanský průkaz',section:'documents',recordType:'identity',
  confidence:100,confidenceLabel:'POTVRZENO',sourceLabel:'uživatelsky potvrzeno 1. 10. 2026',
  sourceBasis:'Uživatel uvedl platnost do roku 2034; přesný den není uložen.',nextAction:'Bez akutní akce.',freshnessDays:1800,
  notes:'Platnost do roku 2034.',seededFrom:'personal-master-1337',createdAt:now,updatedAt:now
 },
 {
  id:'doc-tereza-driver-licence',title:'Tereza · řidičský průkaz',section:'documents',recordType:'identity',
  confidence:100,confidenceLabel:'POTVRZENO',sourceLabel:'uživatelsky potvrzeno 1. 10. 2026',
  sourceBasis:'Uživatel uvedl platnost do roku 2034; přesný den není uložen.',nextAction:'Bez akutní akce.',freshnessDays:1800,
  notes:'Platnost do roku 2034.',seededFrom:'personal-master-1337',createdAt:now,updatedAt:now
 },
 {
  id:'doc-tereza-passport',title:'Tereza · cestovní pas',section:'documents',recordType:'identity',
  confidence:95,confidenceLabel:'POTVRZENO PŘIBLIŽNĚ',sourceLabel:'uživatelsky potvrzeno 1. 10. 2026',
  sourceBasis:'Uživatel uvedl platnost přibližně do roku 2033; přesný den není uložen.',nextAction:'Přesné datum doplnit jen před cestou nebo při další kontrole dokladů.',freshnessDays:1800,
  notes:'Platnost přibližně do roku 2033.',seededFrom:'personal-master-1337',createdAt:now,updatedAt:now
 },
 {
  id:'doc-vlasatice-project',title:'Vlasatice 262 · projektová dokumentace',section:'home',recordType:'project-docs',
  asOf:'2026-10-01',confidence:100,confidenceLabel:'POTVRZENO',sourceLabel:'PDF/DWG + statika + PENB + komunikace s projektantkou',
  sourceBasis:'Existuje zaměření/původní stav, návrh budoucího stavu, statický posudek a PENB. Dokumentace pro povolení zatím není kompletní.',
  nextAction:'Růžičková po telefonátu 1. 10. 2026 pošle cenovou kalkulaci; potom rozhodnout o rozsahu projektu a inženýringu.',freshnessDays:120,
  seededFrom:'personal-master-1337',createdAt:now,updatedAt:now
 }
];

const mergeById=(live=[],master=[])=>{
 const current=new Map((Array.isArray(live)?live:[]).map(x=>[x?.id,x]).filter(([id])=>id));
 const masterIds=new Set(master.map(x=>x.id));
 return [...master.map(x=>({...current.get(x.id),...x})),...(Array.isArray(live)?live:[]).filter(x=>!masterIds.has(x?.id))];
};

export function applyPersonalMaster1337(state){
 let changed=false;
 const assets=state.assetBook||(state.assetBook={items:[]});
 if(assets.masterId!==PERSONAL_MASTER_ID_1337){
  assets.items=mergeById(assets.items,ASSET_MASTER_ITEMS_1337);
  assets.masterId=PERSONAL_MASTER_ID_1337;
  assets.masterAt=now;
  changed=true;
 }
 const vault=state.personalVault||(state.personalVault={version:1,items:[],evidence:[]});
 vault.items=Array.isArray(vault.items)?vault.items:[];
 vault.evidence=Array.isArray(vault.evidence)?vault.evidence:[];
 if(vault.masterId!==PERSONAL_MASTER_ID_1337){
  vault.items=mergeById(vault.items,DOCUMENT_MASTER_ITEMS_1337);
  vault.masterId=PERSONAL_MASTER_ID_1337;
  vault.masterAt=now;
  changed=true;
 }
 return changed;
}
