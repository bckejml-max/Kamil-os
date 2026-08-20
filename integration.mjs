globalThis.localStorage={_d:new Map(),getItem(k){return this._d.has(k)?this._d.get(k):null},setItem(k,v){this._d.set(k,String(v))},removeItem(k){this._d.delete(k)}};
globalThis.document={querySelector(){return null},querySelectorAll(){return []}};globalThis.window={dispatchEvent(){},addEventListener(){}};globalThis.CustomEvent=class{constructor(type,opts){this.type=type;this.detail=opts?.detail}};globalThis.Notification={permission:'default'};
const {store,migrate}=await import('./js/state.js');
const {parse,search,execute}=await import('./js/command.js');
const {personalTimeline}=await import('./js/personalTimeline26.js');
const {personalMoney}=await import('./js/personalMoney26.js');
const {buildPersonalToday}=await import('./js/personalToday26.js');
const {emergencySnapshotText}=await import('./js/emergencyFile26.js');
const {autopilotSnapshot,personalQuery}=await import('./js/autopilot28.js');
const {xtbBoard,ticketDecision}=await import('./js/live24.js');
const {debtRemaining}=await import('./js/intelligence.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const liveNow=new Date().toISOString(),ref=new Date('2026-08-20T10:00:00+02:00');
store.replace(migrate({
 tasks:[{id:'p-task',title:'Objednat servis klimatizace',status:'UDĚLAT',area:'Osobní',due:'2026-08-21T09:00:00+02:00'},{id:'w-task',title:'Firemní report',status:'UDĚLAT',area:'Práce',due:'2026-08-21T09:00:00+02:00'}],
 projects:[{id:'legacy-project',name:'Nová Zbrojovka',status:'Aktivní'}],
 personalAdmin:{items:[
  {id:'bill1',title:'Elektřina',category:'PAYMENT',provider:'Dodavatel energie',amount:3000,currency:'CZK',cadence:'MONTHLY',nextDue:'2026-08-20',autoPay:false,status:'ACTIVE'},
  {id:'eur1',title:'Cloud úložiště',category:'SUBSCRIPTION',provider:'EU provider',amount:10,currency:'EUR',cadence:'MONTHLY',nextDue:'2026-08-28',status:'ACTIVE'},
  {id:'ins1',title:'Pojištění domu Allianz',category:'INSURANCE',provider:'Allianz',amount:12000,currency:'CZK',cadence:'YEARLY',noticeDate:'2026-08-25',renewalDate:'2026-09-20',status:'ACTIVE',insurance:{kind:'PROPERTY',insured:'Dům',policyNumber:'SECRET-7788'}},
  {id:'doc1',title:'Cestovní pas',category:'DOCUMENT',status:'ACTIVE',document:{kind:'PASSPORT',holder:'Kamil',number:'DOC-123',expiryDate:'2026-09-01'}}
 ]},
 familyHome:{members:[{id:'fam1',name:'Mia',relation:'CHILD',birthday:'2026-08-25',status:'ACTIVE'}]},
 emergencyFile:{contacts:[{id:'ec1',name:'Rodinný kontakt',role:'FAMILY',phone:'+420999888777',email:'kontakt@example.cz',status:'ACTIVE'}],assets:[{id:'ea1',title:'Modré nouzové desky',kind:'DOCUMENTS',location:'Skříň v pracovně',contact:'Rodina',status:'ACTIVE'}]},
 personalInbox:{items:[{id:'pi1',title:'Potvrdit domácí pojistku',source:'EMAIL',kind:'ACTION',status:'NEW'}]},assetBook:{items:[{id:'asset1',title:'Klimatizace',kind:'HOME_SYSTEM',nextServiceAt:'2026-08-24',status:'ACTIVE'}]},
 calendar:{events:[{id:'workcal',title:'Firemní porada',start:'2026-08-21T08:00:00+02:00',source:'Outlook'},{id:'perscal',title:'Rodinná návštěva',start:'2026-08-22T15:00:00+02:00',personal:true}]},
 financePlan:{currency:'CZK',cashNow:100000,reserveFloor:50000,plannedInvestment:0,cashflow:[{id:'cf1',label:'Nájem / hypotéka',amount:-20000,date:'2026-08-25',cadence:'monthly',active:true}]},
 xtbHub:{asOf:liveNow,accounts:{a1:{currency:'CZK',value:100000,positions:[{name:'FTSE All-World',ticker:'VWCE.DE',category:'ETF',value:60000,volume:20,net_profit_pct:1},{name:'Growth',ticker:'GROW.US',category:'STOCK',value:40000,volume:4,net_profit_pct:30}]}}},
 xtbStrategy:{overrides:{},liveAsOf:liveNow,live:{positions:{'GROW.US':{action:'SELL',confidence:90,priority:94,reason:'Live test'}}}},
 ticketBook:{items:[{id:'tk1',name:'Sparta Praha',workflow:'HOLD',qty:2,buy:2000,listPrice:1800,date:'2026-08-30'}],watchlist:[],intelligenceAsOf:liveNow,intelligence:{positions:{tk1:{action:'REPRICE',confidence:88,priority:92,reason:'Live ticket test'}}}},
 debtBook:{items:[{id:'d1',person:'Petr',amount:5000,payments:[],status:'OPEN'}]},audit:[]
}),'personal-integration');

assert(store.get().meta.schemaVersion===39,'schema migrated to v39');assert(store.get().projects[0].name==='Nová Zbrojovka','legacy work data preserved');assert(store.get().emergencyFile.contacts.length===1&&store.get().emergencyFile.assets.length===1,'emergency data preserved');assert(store.get().personalInbox.items.length===1&&store.get().assetBook.items.length===1,'autopilot data preserved');
const tl=personalTimeline(store.get(),ref);assert(tl.items.some(x=>x.title==='Elektřina'&&x.days===0),'personal bill in timeline');assert(tl.items.some(x=>x.title.includes('Mia')&&x.days===5),'family birthday in timeline');assert(tl.items.some(x=>x.title==='Rodinná návštěva'),'explicit personal calendar included');assert(!tl.items.some(x=>x.title==='Firemní porada'),'work calendar excluded');assert(!tl.items.some(x=>x.title==='Firemní report'),'work task excluded');assert(tl.items.some(x=>x.title==='Klimatizace'),'asset service in timeline');
const pm=personalMoney(store.get(),ref);assert(Math.round(pm.byCurrency.CZK.monthly)===4000,'CZK recurring costs separated');assert(Math.round(pm.byCurrency.EUR.monthly)===10,'EUR recurring costs separated');assert(!('totalMixed' in pm),'no mixed-currency total');
assert(search('allianz').some(x=>x.target==='home'&&x.homeMode==='insurance'),'insurance searchable');assert(search('mia').some(x=>x.kind==='Rodina'),'family searchable');assert(search('rodinný kontakt').some(x=>x.kind==='Nouzový kontakt'),'emergency contact name searchable');assert(search('modré nouzové desky').some(x=>x.kind==='Emergency File'),'emergency asset title searchable');assert(search('klimatizace').some(x=>x.kind==='Majetek'),'asset title searchable');assert(search('potvrdit domácí pojistku').some(x=>x.kind==='Personal Inbox'),'Personal Inbox title searchable');assert(search('999888777').length===0&&search('kontakt@example.cz').length===0&&search('skříň v pracovně').length===0,'Emergency File private detail not searchable');assert(search('vwce').some(x=>x.kind==='XTB'),'XTB searchable');assert(search('secret-7788').length===0&&search('doc-123').length===0,'sensitive identifiers not searchable');assert(search('nová zbrojovka').length===0,'legacy projects hidden from personal search');assert(parse('ukaž domov').type==='nav'&&parse('ukaž domov').target==='home','personal nav parser');assert(parse('ukaž emergency file').type==='nav','Emergency File nav parser');assert(parse('ukaž práci').type==='free','work nav removed');
const snapshot=emergencySnapshotText(store.get());assert(snapshot.includes('Rodinný kontakt')&&snapshot.includes('Modré nouzové desky'),'emergency snapshot useful');assert(!snapshot.includes('SECRET-7788')&&!snapshot.includes('DOC-123'),'emergency snapshot excludes sensitive identifiers');
assert(personalQuery('co končí do 30 dní',store.get(),{},ref),'copilot deadline query');assert(personalQuery('kolik můžu bezpečně investovat',store.get(),{},ref),'copilot investment query');
assert(xtbBoard(store.get()).some(x=>x.p.ticker==='GROW.US'&&x.d.action==='SELL'),'XTB live decisions preserved');assert(ticketDecision(store.get().ticketBook.items[0],store.get()).action==='REPRICE','ticket live decisions preserved');
const today=buildPersonalToday(store.get(),ref);assert(today.length<=5&&today.length>=2,'personal top five bounded');assert(today.every(x=>!['work','project'].includes(x.domain)),'no work domain in Personal Today');assert(today.some(x=>x.kind==='XTB'),'Personal Today can include XTB');assert(today.some(x=>x.kind==='Vstupenky'),'Personal Today can include tickets');
const ap=autopilotSnapshot(store.get(),{},ref);assert(ap.briefing.today.length<=3&&ap.briefing.week.length<=2,'Autopilot 3/2 briefing');assert(ap.inbox.items.some(x=>x.source==='EMAIL'),'email intake candidate surfaced');assert(ap.notifications.items.some(x=>x.title==='Klimatizace'),'asset alert surfaced');
execute('Petr splátka 500');assert(debtRemaining(store.get().debtBook.items[0])===4500,'personal receivable payment command');execute('Sparta prodáno');assert(store.get().ticketBook.items[0].workflow==='SOLD','ticket sold command');execute('Koupit plenky');assert(store.get().tasks.some(x=>x.title==='Koupit plenky'&&x.area==='Osobní'),'free command creates personal task');
console.log('PERSONAL AUTOPILOT INTEGRATION QA PASS');