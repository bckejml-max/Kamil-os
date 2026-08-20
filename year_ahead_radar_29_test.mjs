const assert=(x,m)=>{if(!x)throw new Error(m)};
const {yearAheadRadar}=await import('./js/yearAheadRadar29.js');
const now=new Date('2026-08-20T10:00:00+02:00');
const state={
 financePlan:{currency:'CZK',cashflow:[
  {id:'salary',label:'Výplata',amount:30000,date:'2026-08-28',cadence:'monthly',active:true},
  {id:'rent',label:'Bydlení',amount:-20000,date:'2026-08-26',cadence:'monthly',active:true}
 ]},
 personalAdmin:{items:[
  {id:'net',title:'Internet',category:'SUBSCRIPTION',amount:650,currency:'CZK',cadence:'MONTHLY',nextDue:'2026-08-25',status:'ACTIVE'},
  {id:'eur',title:'Cloud EUR',category:'SUBSCRIPTION',amount:10,currency:'EUR',cadence:'MONTHLY',nextDue:'2026-09-02',status:'ACTIVE'},
  {id:'missing',title:'Neznámá platba',category:'PAYMENT',amount:null,currency:'CZK',cadence:'MONTHLY',nextDue:'2026-09-03',status:'ACTIVE'},
  {id:'doc',title:'Cestovní pas',category:'DOCUMENT',status:'ACTIVE',document:{expiryDate:'2026-12-01'}}
 ]},
 assetBook:{items:[{id:'heat',title:'Tepelné čerpadlo',kind:'HOME_SYSTEM',nextServiceAt:'2027-02-05',status:'ACTIVE'}]},
 familyHome:{members:[{id:'kid',name:'Mia',birthday:'2026-01-15',status:'ACTIVE'}]},
 personalGoals:{items:[
  {id:'holiday',title:'Dovolená',targetAmount:60000,savedAmount:30000,currency:'CZK',targetDate:'2026-12-20',monthlyContribution:5000,status:'ACTIVE'},
  {id:'eurgoal',title:'EUR fond',targetAmount:2000,savedAmount:500,currency:'EUR',monthlyContribution:50,status:'ACTIVE'}
 ]},
 ticketBook:{items:[{id:'ticket',name:'Koncert',workflow:'HOLD',qty:2,buy:4000,currency:'CZK',date:'2027-01-30'}]},
 tasks:[{id:'task',title:'Objednat revizi',area:'Osobní',status:'UDĚLAT',due:'2027-03-10'}],
 calendar:{events:[{id:'pers',title:'Rodinný víkend',personal:true,start:'2027-04-03'},{id:'work',title:'Firemní porada',personal:false,start:'2027-04-04'}]}
};
const r=yearAheadRadar(state,now);
assert(r.period.from==='2026-09-01'&&r.period.toExclusive==='2027-09-01'&&r.period.months===12,'12 full future months');
assert(r.months.length===12&&r.months[0].key==='2026-09'&&r.months[11].key==='2027-08','month buckets');
assert(r.totalInflowByCurrency.CZK===360000,'monthly salary projected 12 times');
assert(r.totalOutflowByCurrency.CZK===247800,'CZK outflows keep manual housing plus internet separate and complete');
assert(r.totalOutflowByCurrency.EUR===120,'EUR recurring costs stay separate');
assert(!('total' in r.totalOutflowByCurrency),'no mixed-currency total');
assert(r.coverage.missingAmountItems===1,'missing financial amount surfaced once');
assert(r.milestones.some(x=>x.title==='Cestovní pas'&&x.date==='2026-12-01'),'document expiry included');
assert(r.milestones.some(x=>x.title==='Tepelné čerpadlo'&&x.date==='2027-02-05'),'service included beyond 90 days');
assert(r.milestones.some(x=>x.title.includes('Mia')&&x.date==='2027-01-15'),'next annual family date included');
assert(r.milestones.some(x=>x.title==='Koncert'&&x.date==='2027-01-30'),'ticket event included');
assert(r.milestones.some(x=>x.title==='Objednat revizi'&&x.date==='2027-03-10'),'personal task included');
assert(r.milestones.some(x=>x.title==='Rodinný víkend')&&!r.milestones.some(x=>x.title==='Firemní porada'),'only explicit personal calendar included');
assert(r.goalPlanByCurrency.CZK===20000,'goal monthly plan stops after target month');
assert(r.goalPlanByCurrency.EUR===600,'goal without target spans all 12 months');
assert(r.ticketCapitalByCurrency.CZK===4000,'ticket exposure stays in its currency');
assert(r.peaksByCurrency.CZK&&r.peaksByCurrency.CZK.outflow===20650,'largest known CZK outflow month is computed without FX');
console.log('YEAR AHEAD RADAR 29.3 QA PASS');
