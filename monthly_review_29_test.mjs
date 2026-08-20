globalThis.localStorage={_d:new Map(),getItem(k){return this._d.has(k)?this._d.get(k):null},setItem(k,v){this._d.set(k,String(v))},removeItem(k){this._d.delete(k)}};
Object.defineProperty(globalThis,'navigator',{value:{serviceWorker:{}},configurable:true});
const {migrate}=await import('./js/state.js');
const {personalMonthlyReview}=await import('./js/monthlyReview29.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const ref=new Date('2026-08-20T10:00:00+02:00');
const s=migrate({
 meta:{schemaVersion:40},
 financePlan:{cashNow:100000,reserveFloor:50000,currency:'CZK',plannedInvestment:0},
 personalGoals:{items:[
  {id:'g1',title:'Dovolená',type:'TRAVEL',targetAmount:60000,savedAmount:30000,currency:'CZK',targetDate:'2026-09-01',monthlyContribution:3000,status:'ACTIVE',contributions:[{id:'c1',amount:4000,at:'2026-08-05T08:00:00Z'}]},
  {id:'g2',title:'EUR fond',type:'OTHER',targetAmount:2000,savedAmount:400,currency:'EUR',status:'ACTIVE',contributions:[{id:'c2',amount:100,at:'2026-08-10T08:00:00Z'}]}
 ]},
 personalAdmin:{items:[
  {id:'internet',title:'Internet',category:'SUBSCRIPTION',amount:650,currency:'CZK',cadence:'MONTHLY',nextDue:'2026-08-22',status:'ACTIVE',priceHistory:[{at:'2026-07-01',amount:700,currency:'CZK',cadence:'MONTHLY'},{at:'2026-08-01',amount:650,currency:'CZK',cadence:'MONTHLY'}]},
  {id:'energy',title:'Energie',category:'UTILITY',amount:2500,currency:'CZK',cadence:'MONTHLY',nextDue:'2026-09-10',status:'ACTIVE',priceHistory:[{at:'2026-07-01',amount:2200,currency:'CZK',cadence:'MONTHLY'},{at:'2026-08-15',amount:2500,currency:'CZK',cadence:'MONTHLY'}]}
 ]},
 personalInbox:{items:[{id:'i1',title:'Doklad',status:'ACCEPTED',source:'MANUAL',updatedAt:'2026-08-12T12:00:00Z'}]},
 assetBook:{items:[]},familyHome:{members:[]},emergencyFile:{contacts:[],assets:[]},ticketBook:{items:[],watchlist:[]},debtBook:{items:[]},tasks:[],calendar:{events:[]},xtbHub:{accounts:{}}
});
const r=personalMonthlyReview(s,{lastBackupAt:'2026-08-03T08:00:00Z'},ref);
assert(r.period.key==='2026-08','calendar month key');
assert(r.goalProgressByCurrency.CZK===4000,'CZK goal progress preserved');
assert(r.goalProgressByCurrency.EUR===100,'EUR goal progress preserved');
assert(!('total' in r.goalProgressByCurrency),'currencies are not mixed');
assert(r.resolvedInbox.count===1,'resolved inbox counted from actual timestamp');
assert(r.costChanges.some(x=>x.title==='Internet'&&x.delta===-50),'actual price decrease captured');
assert(r.costChanges.some(x=>x.title==='Energie'&&x.delta===300),'actual price increase captured');
assert(r.progress.some(x=>x.kind==='BACKUP'),'backup this month counted as real progress');
assert(r.progress.some(x=>x.kind==='COST'&&x.title.includes('Internet')),'actual cost decrease surfaced as progress');
assert(r.attention.some(x=>x.title==='Internet'),'near payment escalated into review attention');
assert(r.upcoming.some(x=>x.title==='Energie'&&x.days>0),'next 31 days includes known upcoming due date');
assert(!JSON.stringify(r).includes('FX kurz'),'review does not invent FX conversion');
console.log('PERSONAL MONTHLY REVIEW 29.1 QA PASS');