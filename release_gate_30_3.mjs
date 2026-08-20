import fs from 'fs';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const {buildPersonalToday}=await import('./js/personalToday26.js');
const {decisionExplain30}=await import('./js/decisionExplain30.js');
const {documentScanCandidate,documentRecordDraft}=await import('./js/documentScanner30.js');
const {documentFilingRecommendation,documentReminderPatch}=await import('./js/documentFiling30.js');
const {documentsCenter}=await import('./js/documents25.js');
const {personalCopilot30}=await import('./js/personalCopilot30.js');
const meta=fs.readFileSync('js/releaseMeta.js','utf8'),config=fs.readFileSync('js/config.js','utf8'),html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert(meta.includes("APP_VERSION='30.3.0'")&&meta.includes("APP_RELEASE='30.3'"),'30.3 release metadata mismatch');
assert(config.includes('SCHEMA_VERSION = 42'),'30.3 schema mismatch');
assert(html.includes('./js/decisionExplainUi30.js')&&html.includes('./js/documentScannerUi30.js')&&html.includes('./js/documentFilingUi30.js')&&html.includes('./js/personalCopilotUi30.js'),'30.3 shell runtime missing');
assert(sw.includes('kamil-os-30.3.0-shell-r1')&&sw.includes('decisionExplain30.js')&&sw.includes('decisionExplainUi30.js'),'30.3 PWA explainability runtime missing');

const now=new Date('2026-08-20T10:00:00+02:00');
const todayState={financePlan:{currency:'CZK',cashNow:200000,reserveFloor:50000,cashflow:[]},tasks:[{id:'over',title:'A po termínu',area:'Osobní',status:'UDĚLAT',due:'2026-08-19'},{id:'today',title:'B dnes',area:'Osobní',status:'UDĚLAT',due:'2026-08-20'},{id:'soon',title:'C brzy',area:'Osobní',status:'UDĚLAT',due:'2026-08-21'}],personalAdmin:{items:[]},familyHome:{members:[]},assetBook:{items:[]},emergencyFile:{contacts:[],assets:[]},ticketBook:{items:[],watchlist:[]},calendar:{events:[]},debtBook:{items:[]},xtbHub:{accounts:{}},xtbStrategy:{closedTickers:{}},audit:[]};
const todayBefore=JSON.stringify(todayState),decisions=buildPersonalToday(todayState,now);assert(JSON.stringify(todayState)===todayBefore,'30.3 decision build mutated state');
const overdue=decisions.find(x=>x.title==='A po termínu'),dueToday=decisions.find(x=>x.title==='B dnes'),soon=decisions.find(x=>x.title==='C brzy');
assert(overdue?.priority===96&&overdue.explain?.rule.includes('priorita 96'),'30.3 overdue score explanation mismatch');
assert(dueToday?.priority===90&&dueToday.explain?.rule.includes('priorita 90'),'30.3 today score explanation mismatch');
assert(soon?.priority===82&&soon.explain?.rule.includes('priorita 82'),'30.3 near-task score explanation mismatch');
for(const d of decisions){const e=decisionExplain30(d);assert(e.score===d.priority&&e.score>=0&&e.score<=100,'30.3 explanation changed score');assert(e.engine&&e.rule,'30.3 explanation missing provenance')}
const fallback=decisionExplain30({priority:999,reason:'Skutečný důvod'});assert(fallback.score===100&&fallback.source===null&&fallback.confidence===null,'30.3 fallback metadata unsafe');assert(fallback.facts.length===1&&fallback.facts[0]==='Skutečný důvod','30.3 fallback invented fact');assert(!fallback.rule.toLocaleLowerCase('cs-CZ').includes('termín'),'30.3 fallback invented due-date reason');

const raw=`Záruční list\nACME s.r.o.\nPlatnost do 15.10.2026\nČíslo dokladu 99887766\nIBAN CZ1201000000001234567899`;
const scan=documentScanCandidate(raw,{name:'secret_99887766.png',type:'image/png',size:12345,method:'OCR'});assert(scan.ok&&scan.candidate.type==='WARRANTY','30.1 scanner regression in 30.3');
const draft=documentRecordDraft(scan,{title:'Tepelné čerpadlo · záruka',category:'DOCUMENT',provider:'ACME s.r.o.',expiryDate:'2026-10-15'},now);assert(draft.ok,'30.1 reviewed draft regression in 30.3');
const record={id:'new',...draft.record,status:'ACTIVE'},existing={id:'old',title:'Tepelné čerpadlo · servis',category:'DOCUMENT',provider:'ACME s.r.o.',document:{kind:'SERVICE',expiryDate:'2027-01-10'},status:'ACTIVE'},cross={id:'cross',title:'ACME faktura',category:'PAYMENT',provider:'ACME s.r.o.',status:'ACTIVE'},filingState={personalAdmin:{items:[record,existing,cross]}},filingBefore=JSON.stringify(filingState);
const filing=documentFilingRecommendation(record,filingState,now);assert(filing.related.length===1&&filing.related[0].id==='old'&&!filing.related.some(x=>x.id==='cross'),'30.2 safe related matching regression in 30.3');assert(JSON.stringify(filingState)===filingBefore,'30.2 filing mutation regression in 30.3');assert(!JSON.stringify(filing).includes('99887766')&&!JSON.stringify(filing).includes('CZ1201000000001234567899'),'scanner secret resurfaced through filing');
assert(documentReminderPatch(record,'2026-02-31',now).code==='INVALID_DATE','30.2 invalid date regression');const reminder=documentReminderPatch(record,'2026-09-20',now);assert(reminder.ok,'30.2 explicit reminder regression');const next=structuredClone(filingState);next.personalAdmin.items[0].document=reminder.patch.document;assert(documentsCenter(next,now).items.find(x=>x.id==='new')?.reminder==='2026-09-20','30.2 reminder integration regression');

const copilotState={financePlan:{currency:'CZK',cashNow:100000,reserveFloor:50000,plannedInvestment:25000},xtbStrategy:{closedTickers:{},rebalanceTargets:{broad:55,bond:12.5,satellite:32.5}},xtbHub:{asOf:'2026-08-20T10:00:00Z',accounts:{czk:{currency:'CZK',value:100000,positions:[{ticker:'CORE',name:'World ETF',category:'ETF',value:55000},{ticker:'BOND',name:'Bond ETF',category:'ETF',value:12500},{ticker:'SAT',name:'Stock',category:'STOCK',value:32500}]}}},ticketBook:{history:[],watchlist:[],items:[]},debtBook:{items:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},personalAdmin:{items:[]},familyHome:{members:[]},emergencyFile:{contacts:[],assets:[]},personalInbox:{items:[]},assetBook:{items:[]},personalGoals:{items:[]},calendar:{events:[]},tasks:[],projects:[],audit:[]};
assert(personalCopilot30('Jak jsem na tom?',copilotState,{},now)?.kind==='PERSONAL_COPILOT_30','30.0 Personal Copilot regression in 30.3');
console.log('KAMIL OS 30.3 RELEASE GATE PASS');
