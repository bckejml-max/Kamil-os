import {parseAmount,parseDate,previewImport,buildImportPlan} from './js/smartImport29.js';
import {applySmartImport} from './js/smartImportApply29.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};

assert(parseAmount('1 234,56 Kč')===1234.56,'Czech amount');
assert(parseAmount('(99,90 EUR)')===-99.9,'negative parenthesis amount');
assert(parseDate('20.08.2026')==='2026-08-20','Czech date');

const state={personalSpending:{transactions:[]},ticketBook:{items:[]},personalAdmin:{items:[]},importCenter:{history:[]},xtbHub:{accounts:{main:{currency:'CZK',value:100000,positions:[{ticker:'VWCE.DE',name:'VWCE',value:60000,currency:'CZK'}]}}}};
const bank=`Datum;Popis;Částka;Měna\n20.08.2026;Lidl;-1 250,50;CZK\n21.08.2026;Netflix;-299;CZK\n22.08.2026;bez částky;;CZK`;
const bp=previewImport(bank,{fileName:'banka.csv'});assert(bp.source==='SPENDING','bank detected');assert(bp.accepted.length===2&&bp.rejected.length===1,'bank safe rows');assert(bp.accepted[0].data.category==='JÍDLO'&&bp.accepted[1].data.category==='PŘEDPLATNÉ','transparent spending categories');
const bplan=buildImportPlan(state,bp);assert(bplan.total===2&&bplan.duplicateCount===0,'bank import plan');applySmartImport(state,bplan,{at:'2026-08-20T12:00:00Z'});assert(state.personalSpending.transactions.length===2,'transactions applied');assert(state.importCenter.history.length===1&&state.importCenter.history[0].imported===2,'import history metadata');
const duplicatePlan=buildImportPlan(state,bp);assert(duplicatePlan.total===0&&duplicatePlan.duplicateCount===2,'bank duplicates blocked');

const revolut=`Completed Date,Description,Amount,Currency\n2026-08-19,Revolut card,-20.50,EUR`;
const rp=previewImport(revolut,{fileName:'revolut-export.csv'});assert(rp.source==='REVOLUT'&&rp.accepted[0].data.currency==='EUR','Revolut auto detection');

const xtb=`Symbol;Name;Market Value;Currency;Quantity;Profit %\nGROW.US;Growth Inc;40000;CZK;4;30`;
const xp=previewImport(xtb,{fileName:'xtb_positions.csv'});assert(xp.source==='XTB'&&xp.accepted.length===1,'XTB position detection');const xplan=buildImportPlan(state,xp);assert(xplan.total===1,'XTB new position planned');applySmartImport(state,xplan,{at:'2026-08-20T12:05:00Z'});assert(state.xtbHub.accounts.main.value===100000,'XTB import must preserve existing account total');assert(state.xtbHub.accounts.main.positionValue===100000,'position value stored separately');assert(state.xtbHub.accounts.main.positions.some(x=>x.ticker==='GROW.US'),'XTB position merged');

const tickets=`Akce;Datum;Kusy;Nákup;Měna;Se­ktor\nSparta - Plzeň;30.09.2026;4;8000;CZK;115`;
const tp=previewImport(tickets,{fileName:'tickets.csv',source:'TICKETS'});assert(tp.accepted.length===1&&tp.accepted[0].data.qty===4,'ticket import');const tplan=buildImportPlan(state,tp);applySmartImport(state,tplan,{at:'2026-08-20T12:10:00Z'});assert(state.ticketBook.items.length===1&&state.ticketBook.items[0].workflow==='HOLD','ticket applied safely');

const admin=`Název;Dodavatel;Částka;Měna;Periodicita;Splatnost;Kategorie\nInternet;ISP;799;CZK;měsíčně;25.09.2026;PAYMENT`;
const ap=previewImport(admin,{fileName:'admin.csv'});assert(ap.source==='ADMIN'&&ap.accepted[0].data.cadence==='MONTHLY','admin cadence');const aplan=buildImportPlan(state,ap);applySmartImport(state,aplan,{at:'2026-08-20T12:15:00Z'});assert(state.personalAdmin.items.length===1&&state.personalAdmin.items[0].amount===799,'admin applied');

assert(!('totalMixed' in bplan),'import plan never creates mixed-currency total');
console.log('SMART IMPORT CENTER 29.4 TEST PASS');
