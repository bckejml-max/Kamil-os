const {autopilotSnapshot,dataQuality,personalInbox,householdCockpit,familyProfiles,personalQuery,familyShareSnapshot,assetBook}=await import('./js/autopilot28.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const ref=new Date('2026-08-20T10:00:00+02:00');
const s={
 meta:{schemaVersion:39},
 financePlan:{currency:'CZK',cashNow:200000,reserveFloor:100000,plannedInvestment:25000,cashflow:[]},
 personalAdmin:{items:[
  {id:'ins',title:'Pojištění domu',category:'INSURANCE',provider:'Allianz',amount:12000,currency:'CZK',cadence:'YEARLY',nextDue:'2026-09-01',status:'ACTIVE',insurance:{kind:'PROPERTY',insured:'Dům'}},
  {id:'doc',title:'Pas Kamil',category:'DOCUMENT',status:'ACTIVE',document:{kind:'PASSPORT',holder:'Kamil',number:'SECRET-DOC'}},
  {id:'eur',title:'Cloud',category:'SUBSCRIPTION',amount:10,currency:'EUR',cadence:'MONTHLY',nextDue:'2026-08-25',status:'ACTIVE'}
 ]},
 familyHome:{members:[{id:'fam',name:'Kamil',relation:'SELF',birthday:'1990-08-25',status:'ACTIVE'}]},
 emergencyFile:{contacts:[{id:'ec',name:'Servis',status:'ACTIVE'}],assets:[]},
 personalInbox:{items:[{id:'mail',title:'Potvrdit pojistku',source:'EMAIL',kind:'ACTION',sourceId:'gmail:1',status:'NEW'}]},
 assetBook:{items:[{id:'car',title:'Rodinné auto',kind:'VEHICLE',location:'Garáž',nextServiceAt:'2026-08-22',estimatedValue:300000,liabilityBalance:100000,currency:'CZK',status:'ACTIVE'}]},
 calendar:{events:[{id:'pc',title:'Rodinná návštěva',start:'2026-08-23',personal:true},{id:'wc',title:'Firemní porada',start:'2026-08-23',source:'Outlook'}]},
 tasks:[],projects:[{id:'legacy',name:'Work'}],ticketBook:{items:[],watchlist:[]},debtBook:{items:[]},xtbHub:{accounts:{}},xtbReport:{},xtbStrategy:{overrides:{}},learning:{typeBias:{},feedback:[]},audit:[],undo:[]
};
const q=dataQuality(s,{},ref);assert(q.issues.some(x=>x.title==='Pojištění domu'),'insurance data gap');assert(q.issues.some(x=>x.title==='Pas Kamil'),'document expiry gap');assert(q.issues.some(x=>x.title==='Servis'),'emergency contact channel gap');
const inbox=personalInbox(s,ref);assert(inbox.items.some(x=>x.source==='EMAIL'),'email candidate retained');assert(inbox.calendarCandidates.some(x=>x.title==='Rodinná návštěva'),'personal calendar candidate');assert(!inbox.calendarCandidates.some(x=>x.title==='Firemní porada'),'work calendar excluded');
const assets=assetBook(s,ref);assert(assets.items[0].priority>=85,'near service is urgent');assert(assets.valueByCurrency.CZK===300000&&assets.liabilityByCurrency.CZK===100000,'asset values separate');
const money=householdCockpit(s,ref);assert(money.recurring.CZK.yearly===12000,'CZK recurring');assert(money.recurring.EUR.monthly===10,'EUR recurring separate');assert(money.holdings.CZK.knownNet===400000,'cash + asset - liability known net');
const profiles=familyProfiles(s,ref);assert(profiles[0].documents.length===1,'document linked by holder');
let a=personalQuery('co končí do 60 dní',s,{},ref);assert(a&&a.lines.some(x=>x.includes('Rodinné auto')),'query deadlines includes asset service');
a=personalQuery('kolik platím ročně za pojistky',s,{},ref);assert(a&&a.lines.some(x=>x.includes('12 000')||x.includes('12 000')),'insurance annual query');
a=personalQuery('co chybí doplnit',s,{},ref);assert(a&&a.lines.length>=2,'data quality query');
a=personalQuery('všechno kolem auta',s,{},ref);assert(a&&a.lines.some(x=>x.includes('Rodinné auto')),'car query');
const share=familyShareSnapshot(s,ref);const text=JSON.stringify(share);assert(!text.includes('SECRET-DOC'),'share excludes document number');assert(!text.includes('xtb')&&!text.includes('ticketBook'),'share excludes finance/tickets');
const snap=autopilotSnapshot(s,{},ref);assert(snap.briefing.today.length<=3&&snap.briefing.week.length<=2,'3/2 briefing bounds');assert(snap.notifications.items.some(x=>x.title==='Rodinné auto'),'asset alert reaches notifications');
console.log('PERSONAL AUTOPILOT 28 QA PASS');
