export const INSURANCE_MASTER_ID_1336='insurance-registry-2026-10-01-v3';

const policy=(id,title,provider,amount,cadence,lifecycle,kind,insured,policyNumber,extra={})=>({
 id:'ins-master-'+id,title,category:'INSURANCE',provider,amount,currency:'CZK',cadence,
 nextDue:extra.nextDue||null,renewalDate:extra.renewalDate||null,noticeDate:extra.noticeDate||null,
 autoPay:extra.autoPay??false,notes:extra.notes||'',status:lifecycle==='HISTORY'?'ARCHIVED':'ACTIVE',
 createdAt:extra.createdAt||'2026-09-23T00:00:00.000Z',updatedAt:'2026-09-25T12:10:00.000Z',
 insurance:{kind,insured,policyNumber,contact:extra.contact||'',coverageAmount:extra.coverageAmount??null,deductible:extra.deductible??null,
 lifecycle,startDate:extra.startDate||null,source:extra.source||'',sourceStatus:extra.sourceStatus||'CONFIRMED'}
});

export const INSURANCE_MASTER_ITEMS_1336=[
 policy('fiat-croma-5520931006','Fiat Croma · Auto & pohoda','UNIQA',3868,'YEARLY','ACTIVE','VEHICLE','Fiat Croma · 1BP6451','5520931006',{
  startDate:'2026-09-10',renewalDate:'2027-09-10',coverageAmount:60000000,deductible:5000,
  notes:'Povinné ručení 60/60 mil. Kč + poškození zvířetem 100 000 Kč. Zkontrolovat dokončení vstupní fotodokumentace.',
  source:'Gmail + pojistná smlouva UNIQA',sourceStatus:'CONFIRMED'
 }),
 policy('roomster-26160739','Škoda Roomster','Pillow',4116,'YEARLY','ACTIVE','VEHICLE','Škoda Roomster · 3E73347','26160739',{
  startDate:'2026-06-12',renewalDate:'2027-06-12',coverageAmount:70000000,deductible:0,
  notes:'Povinné ručení 70 mil. Kč; střet se zvířetem, přírodní události, skla a asistence. V červnu 2026 Pillow připomínal fotodokumentaci a tachometr — ověřit, že je uzavřeno.',
  source:'Gmail · Pillow pojistka',sourceStatus:'CONFIRMED'
 }),
 policy('saxo-23520959','Citroën Saxo','Pillow',2436,'YEARLY','ACTIVE','VEHICLE','Citroën Saxo · 1E54778','23520959',{
  startDate:'2025-05-06',renewalDate:'2027-05-06',coverageAmount:70000000,
  notes:'Aktuální výroční období 6. 5. 2026–5. 5. 2027. Povinné ručení 70 mil. Kč + asistence.',
  source:'Gmail · výroční dopis Pillow 29. 4. 2026',sourceStatus:'CONFIRMED'
 }),
 policy('scala-798495213','Škoda Scala · MojeAuto','Allianz',null,'YEARLY','REVIEW','VEHICLE','Škoda Scala · 8C46678','798495213',{
  notes:'Poslední doložená zelená karta byla do 6. 3. 2026. V aktuálních podkladech nemám nové potvrzení období po tomto datu — ověřit aktuální smlouvu / cenu.',
  source:'Gmail · Allianz potvrzení a zelená karta',sourceStatus:'VERIFY'
 }),
 policy('kamil-allianz-life','Kamil · Allianz ŽIVOT','Allianz',915,'MONTHLY','HISTORY','LIFE','Kamil','',{
  notes:'Původní životní smlouva. Uživatel 1. 10. 2026 potvrdil, že staré smlouvy jsou vypovězené; nahrazuje je rodinná NN Orange Risk 3350409671 od 1. 11. 2026.',
  source:'Allianz smluvní dokumentace + uživatelské potvrzení 1. 10. 2026',sourceStatus:'TERMINATED'
 }),
 policy('vlasatice-pvzp-home','Dům Vlasatice · pojištění nemovitosti','Pojišťovna VZP',2600,'YEARLY','REVIEW','PROPERTY','Dům Vlasatice','',{
  startDate:'2026-03-25',renewalDate:'2027-03-25',
  notes:'Archivní návrh uvádí budovu za 2 600 Kč/rok. Aktivitu smlouvy a rozsah krytí rekonstrukce je potřeba potvrdit aktuální platbou nebo potvrzením pojišťovny.',
  source:'Archivní návrh pojistné smlouvy 2026',sourceStatus:'VERIFY'
 }),
 policy('roomster-allianz-799685843','Škoda Roomster · Allianz','Allianz',null,'YEARLY','HISTORY','VEHICLE','Škoda Roomster','799685843',{
  notes:'Starší autopojištění sjednané v březnu 2025; později je pro Roomster doložena nová Pillow smlouva 26160739.',
  source:'Gmail · Allianz/Srovnejto 19. 3. 2025',sourceStatus:'SUPERSEDED'
 }),
 policy('tereza-nn-3350409671','Rodina · NN Orange Risk','NN',2000,'MONTHLY','UPCOMING','LIFE','Kamil + Tereza + Mia','3350409671',{
  startDate:'2026-11-01',renewalDate:'2027-11-01',contact:'Alena Vlachová / OVB',
  notes:'Nová rodinná riziková životní smlouva. Počátek 1. 11. 2026, pojistné 2 000 Kč/měs. Kamil: invalidita I/II/III 0,5/1/3 mil. Kč, smrt klesající 2,19 mil. Kč, závažná onemocnění 0,5 mil. Kč, TNU Premium 0,2 mil. Kč. Tereza: invalidita I/II/III 0,5/1/3 mil. Kč, smrt 0,4 mil. Kč, závažná onemocnění 0,5 mil. Kč, TNU Premium 0,2 mil. Kč. Mia: závažná onemocnění 2 mil. Kč + TNU dítěte Premium 0,2 mil. Kč.',
  source:'Gmail 23. 9. 2026 · Smlouva Rizikové životní pojištění (16).pdf',sourceStatus:'CONFIRMED'
 }),
 policy('tereza-allianz-060817864','Tereza · Allianz ŽIVOT','Allianz',null,'MONTHLY','HISTORY','LIFE','Tereza','060817864',{
  notes:'Původní životní pojištění. Uživatel 1. 10. 2026 potvrdil, že staré smlouvy jsou vypovězené; nahrazuje je rodinná NN 3350409671.',
  source:'Allianz smlouva + uživatelské potvrzení 1. 10. 2026',sourceStatus:'TERMINATED'
 }),
 policy('tereza-nn-old-3350318872','Tereza · NN Orange Risk (původní)','NN',574,'MONTHLY','HISTORY','LIFE','Tereza','3350318872',{
  notes:'Původní NN smlouva za 574 Kč/měs. Uživatel 1. 10. 2026 potvrdil výpověď; nahrazuje ji rodinná NN 3350409671.',
  source:'NN smlouva 3350318872 + uživatelské potvrzení 1. 10. 2026',sourceStatus:'TERMINATED'
 }),
 policy('kb-elan-life','Rizikové životní ELÁN k hypotéce','Komerční pojišťovna',200,'MONTHLY','HISTORY','LIFE','Kamil','9016002757',{
  notes:'Původní ELÁN: 200 Kč/měs., smrt 10 000 Kč + klesající 870 536 Kč, invalidita I/II/III klesající 224 000 Kč. Uživatel 1. 10. 2026 potvrdil výpověď.',
  source:'Dodatek ELÁN 9016002757 + uživatelské potvrzení 1. 10. 2026',sourceStatus:'TERMINATED'
 }),
 policy('pasohlavky-rixo-7613','Pasohlávky 157 · MaxDomov VIP','RIXO / nabídka',7613,'YEARLY','OFFER','PROPERTY','Dům + domácnost · Pasohlávky 157','',{
  notes:'Pouze nabídka ze srovnání 17. 9. 2026. Není evidována jako sjednaná smlouva.',
  source:'RIXO nsure nabídka 17. 9. 2026',sourceStatus:'OFFER'
 }),
 policy('pasohlavky-rixo-7949','Pasohlávky 157 · Nemovitost Maxi','RIXO / nabídka',7949,'YEARLY','OFFER','PROPERTY','Dům + domácnost · Pasohlávky 157','',{
  notes:'Pouze nabídka ze srovnání 17. 9. 2026. Není evidována jako sjednaná smlouva.',
  source:'RIXO nsure nabídka 17. 9. 2026',sourceStatus:'OFFER'
 }),
 policy('renault-807858575','Renault Mégane · MojeAuto','Allianz',null,'YEARLY','HISTORY','VEHICLE','Renault Mégane · 8AN9702','807858575',{
  notes:'Pojištění bylo ukončeno po prodeji vozidla v srpnu 2026.',
  source:'Gmail · žádost a potvrzení ukončení 7. 8. 2026',sourceStatus:'TERMINATED'
 }),
 policy('roomster-old-6182779824','Škoda Roomster · NAŠE AUTO','ČSOB Pojišťovna',null,'YEARLY','HISTORY','VEHICLE','Škoda Roomster · 3E73347','6182779824',{
  notes:'Starší pojistka; žádost o zánik potvrzena v březnu 2025.',
  source:'Gmail · potvrzení zániku 25. 3. 2025',sourceStatus:'TERMINATED'
 }),
 policy('property-9923612612','Pojištění majetku · 9923612612','Generali Česká pojišťovna',null,'YEARLY','HISTORY','PROPERTY','Majetek','9923612612',{
  notes:'Historická smlouva; v prosinci 2025 evidován zánik pojištění.',
  source:'Gmail · Zánik pojištění 5. 12. 2025',sourceStatus:'TERMINATED'
 }),
 policy('property-3951905545','Dům + domácnost · Kostelní 40','',null,'YEARLY','HISTORY','PROPERTY','Rodinný dům a domácnost · Kostelní 40','3951905545',{
  notes:'Pojištění domu/domácnosti KOMFORT; výpověď ke konci pojistného období odeslána 17. 12. 2025.',
  source:'Gmail + dokument k pojistné smlouvě',sourceStatus:'TERMINATED'
 }),
 policy('travel-3350204613','Cestovní pojištění 2025','',null,'ONCE','HISTORY','TRAVEL','Cestovní pojištění','3350204613',{
  notes:'Jednorázové cestovní pojištění, zaplaceno; platnost začala 30. 4. 2025.',
  source:'Gmail · potvrzení platby 29. 4. 2025',sourceStatus:'EXPIRED'
 })
];

export function applyInsuranceMaster1336(state){
 const pa=state.personalAdmin||(state.personalAdmin={items:[]});
 if(pa.insuranceMasterId===INSURANCE_MASTER_ID_1336)return false;
 const others=(pa.items||[]).filter(x=>x?.category!=='INSURANCE'||!String(x.id||'').startsWith('ins-master-'));
 const old=new Map((pa.items||[]).map(x=>[x.id,x]));
 pa.items=[...INSURANCE_MASTER_ITEMS_1336.map(x=>({...x,...(old.get(x.id)||{}),...x,insurance:{...(old.get(x.id)?.insurance||{}),...x.insurance}})),...others];
 pa.insuranceMasterId=INSURANCE_MASTER_ID_1336;
 pa.insuranceMasterAt='2026-09-25T12:10:00.000Z';
 return true;
}
