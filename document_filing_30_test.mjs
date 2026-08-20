import {documentFilingRecommendation,documentReminderPatch,documentFiling30Note} from './js/documentFiling30.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const now=new Date('2026-08-20T12:00:00Z');

const doc={id:'new-doc',title:'Záruka tepelné čerpadlo',category:'DOCUMENT',provider:'ACME s.r.o.',currency:'CZK',document:{kind:'WARRANTY',expiryDate:'2026-10-01',reminderDate:null},scanner30:{documentType:'WARRANTY'},status:'ACTIVE'};
const state={personalAdmin:{items:[
 doc,
 {id:'strong',title:'Záruka tepelné čerpadlo',category:'DOCUMENT',provider:'ACME s.r.o.',currency:'CZK',document:{expiryDate:'2026-10-01'},scanner30:{documentType:'WARRANTY'},status:'ACTIVE'},
 {id:'provider',title:'Jiná záruka',category:'DOCUMENT',provider:'ACME s.r.o.',currency:'CZK',document:{expiryDate:'2027-01-01'},status:'ACTIVE'},
 {id:'cross',title:'Záruka tepelné čerpadlo',category:'PAYMENT',provider:'ACME s.r.o.',currency:'CZK',nextDue:'2026-10-01',status:'ACTIVE'},
 {id:'archived',title:'Záruka tepelné čerpadlo',category:'DOCUMENT',provider:'ACME s.r.o.',status:'ARCHIVED'}
]}};
const beforeState=JSON.stringify(state),beforeDoc=JSON.stringify(doc);
let r=documentFilingRecommendation(doc,state,now);
assert(r.kind==='DOCUMENT_FILING_30'&&r.category==='DOCUMENT'&&r.filing.homeMode==='documents','document filing target');
assert(r.tracked.length===1&&r.tracked[0].kind==='EXPIRY'&&r.tracked[0].date==='2026-10-01','confirmed expiry tracked');
assert(r.due90.length===1&&r.overdue.length===0,'90-day tracking derived');
assert(r.canSetReminder===true&&r.gaps.some(x=>x.includes('Předstih není nastavený')),'reminder is offered but not invented');
assert(r.related[0].id==='strong'&&r.related[0].score===100,'strong same-register relation ranked first');
assert(r.related.some(x=>x.id==='provider'&&x.score===55),'provider-only same-register relation is transparent');
assert(!r.related.some(x=>x.id==='cross'||x.id==='archived'||x.id==='new-doc'),'cross-category archived and self excluded');
assert(JSON.stringify(state)===beforeState&&JSON.stringify(doc)===beforeDoc,'filing engine must not mutate sources');
const repeat=documentFilingRecommendation(doc,state,now);assert(JSON.stringify(repeat)===JSON.stringify(r),'filing recommendation deterministic');

r=documentFilingRecommendation({id:'pay',title:'Faktura',category:'PAYMENT',provider:'Energy',amount:null,nextDue:null},state,now);
assert(r.filing.homeMode==='payments'&&r.gaps.some(x=>x.includes('Částka není potvrzená'))&&r.gaps.some(x=>x.includes('splatnost')),'payment gaps disclose only missing confirmed data');
r=documentFilingRecommendation({id:'ins',title:'Pojistka',category:'INSURANCE',renewalDate:'2026-09-15'},state,now);
assert(r.tracked.some(x=>x.kind==='RENEWAL')&&r.gaps.some(x=>x.includes('Výpovědní termín není uložený')),'insurance notice period never inferred');
r=documentFilingRecommendation({id:'bad',title:'Unknown',category:'EVIL',nextDue:'2026-02-31'},state,now);
assert(r.category==='OTHER'&&r.tracked.length===0&&!JSON.stringify(r).includes('NaN'),'malformed category/date safe');

let p=documentReminderPatch(doc,'2026-09-10',now);assert(p.ok&&p.date==='2026-09-10'&&p.expiry==='2026-10-01'&&p.patch.document.reminderDate==='2026-09-10','explicit reminder patch');
assert(doc.document.reminderDate===null,'reminder patch does not mutate source');
assert(documentReminderPatch(doc,'2026-02-31',now).code==='INVALID_DATE','invalid calendar date rejected');
assert(documentReminderPatch(doc,'2026-08-19',now).code==='PAST_DATE','past reminder rejected');
assert(documentReminderPatch(doc,'2026-10-02',now).code==='AFTER_EXPIRY','after-expiry reminder rejected');
assert(documentReminderPatch({...doc,document:{}},'2026-09-10',now).code==='NO_EXPIRY','reminder requires explicit expiry');
assert(documentReminderPatch({...doc,category:'INSURANCE'},'2026-09-10',now).code==='NOT_DOCUMENT','no reminder patch for unrelated register');
assert(documentFiling30Note.includes('Bez výslovného potvrzení')&&documentFiling30Note.includes('žádná lhůta'),'safety note present');
console.log('DOCUMENT FILING 30.2 TEST PASS');
