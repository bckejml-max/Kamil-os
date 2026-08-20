import {secTickerForPosition32,secTickerIndex32,secMaterialEvidence32} from './js/secSource32.js';
import {ticketPhase32,ticketDataQuality32,ticketPricingPlan32,tuneTicketDecision32} from './js/ticketTuning32.js';
import {tuneXtbDecision32} from './js/xtbTuning32.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};

assert(secTickerForPosition32({ticker:'TSM.US',name:'TSMC'})==='TSM','US ticker normalized');
assert(secTickerForPosition32({ticker:'1YD.DE',name:'Broadcom Inc'})==='AVGO','Broadcom XTB alias mapped');
assert(secTickerForPosition32({ticker:'BRYN.DE',name:'Berkshire'})==='BRK-B','Berkshire XTB alias mapped');
const idx=secTickerIndex32({0:{ticker:'TSM',cik_str:1046179,title:'Taiwan Semiconductor'}});assert(idx.get('TSM')?.cik10==='0001046179','SEC CIK padded');
const filings=secMaterialEvidence32({cik:1046179,name:'Taiwan Semiconductor',filings:{recent:{form:['6-K','4'],filingDate:['2026-08-20','2026-08-20'],acceptanceDateTime:['20260820153000','20260820150000'],accessionNumber:['0001046179-26-000001','0001046179-26-000002'],primaryDocument:['x.htm','y.htm'],primaryDocDescription:['Current report','Insider']}}},'TSM',{now:new Date('2026-08-21T00:00:00Z')});
assert(filings.length===1&&filings[0].form==='6-K'&&filings[0].confidence===100&&filings[0].confidenceMeaning==='SOURCE_AUTHENTICITY','SEC material evidence normalized');assert(filings[0].sourceUrl.startsWith('https://www.sec.gov/Archives/edgar/data/'),'SEC official source generated');

let phase=ticketPhase32({date:new Date(Date.now()+2*86400000).toISOString()});assert(phase.code==='EXIT'&&phase.nextCheckHours===6,'ticket exit phase');
const ticket={id:'t',name:'Test',workflow:'LISTED',qty:2,buy:2000,buy1:1000,date:new Date(Date.now()+20*86400000).toISOString(),listPrice:0,marketPrice:1500,floorPrice:1100,transferStatus:'READY'};
const quality=ticketDataQuality32(ticket);assert(!quality.ready&&quality.criticalMissing.some(x=>x.key==='listPrice'),'listed ticket missing list price is critical');
const pricing=ticketPricingPlan32(ticket);assert(pricing.recommendedListPricePerTicket>=1100&&pricing.priceBasis==='MARKET_INPUT','market-backed ticket target');
let td=tuneTicketDecision32(ticket,{action:'HOLD',priority:50,when:'Držet',reason:'x',sellRule:'x'});assert(td.action==='REVIEW'&&td.priority>=94&&td.dataQuality.score<100,'missing listed price forces review');
const tuned=tuneXtbDecision32({ticker:'ABC.US',category:'STOCK',net_profit_pct:45,weightPct:8,value:100000,volume:10},{action:'TRIM',priority:90,source:'AUTO'},{xtbHub:{asOf:new Date().toISOString()}},[{form:'8-K',asOf:new Date().toISOString(),freshUntil:new Date(Date.now()+3600000).toISOString(),sourceUrls:['https://sec.example'],sourceUrl:'https://sec.example'}]);
assert(tuned.execution.trimPct>=30&&tuned.execution.trimQty>0,'XTB trim sizing tuned');assert(tuned.reviewBeforeTrade&&tuned.evidence.count===1,'SEC evidence requires review before trade');assert(!tuned.execution.blocked,'fresh XTB import not blocked');
const stale=tuneXtbDecision32({ticker:'ABC.US',category:'STOCK',value:10000,volume:1},{action:'SELL',priority:99},{xtbHub:{asOf:'2026-01-01T00:00:00Z'}},[]);assert(stale.execution.blocked,'stale XTB data blocks execution');
console.log('KAMIL OS 32.4 MARKET EDGE UNIT PASS');
