import {personalCopilot30,personalCopilot30Note} from './js/personalCopilot30.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const now=new Date('2026-08-20T12:00:00Z');
const base={
 financePlan:{currency:'CZK',cashNow:100000,reserveFloor:50000,plannedInvestment:25000,expectedIncome:0},
 xtbStrategy:{closedTickers:{},rebalanceTargets:{broad:55,bond:12.5,satellite:32.5}},
 xtbHub:{asOf:'2026-08-20T10:00:00Z',accounts:{czk:{currency:'CZK',value:100000,positions:[{ticker:'VWCE.DE',name:'World ETF',category:'ETF',value:55000,qty:10},{ticker:'AGGH.DE',name:'Aggregate Bond ETF',category:'ETF',value:12500,qty:5},{ticker:'NVDA.US',name:'Nvidia',category:'STOCK',value:32500,qty:2}]}}},
 ticketBook:{history:[],watchlist:[],items:[{id:'sold',name:'Prodáno',buy:1000,sell:1500,fees:100,currency:'CZK',workflow:'PAYOUT WAIT',soldAt:'2026-08-19'},{id:'open',name:'Otevřeno',buy:2000,listPrice:1500,qty:2,currency:'CZK',workflow:'LISTED',date:'2026-09-10'}]},
 debtBook:{items:[]},netWorthBook:{items:[{id:'loan',title:'Závazek',side:'LIABILITY',value:20000,currency:'CZK',status:'ACTIVE'}],history:[]},
 personalSpending:{transactions:[{id:'a',date:'2026-08-05',amount:-2000,currency:'CZK',category:'JIDLO',description:'Market'},{id:'b',date:'2026-07-05',amount:-1000,currency:'CZK',category:'JIDLO',description:'Market'},{id:'c',date:'2026-08-06',amount:-5000,currency:'CZK',category:'PŘEVOD',description:'Převod vlastní účet'}]},
 personalAdmin:{items:[]},familyHome:{members:[]},emergencyFile:{contacts:[],assets:[]},personalInbox:{items:[]},assetBook:{items:[]},personalGoals:{items:[]},calendar:{events:[]},tasks:[],projects:[],audit:[]
};
let a=personalCopilot30('Jak jsem na tom?',base,{},now);assert(a?.kind==='PERSONAL_COPILOT_30'&&a.intent==='STATUS','cross-domain status intent');assert(a.lines.some(x=>x.includes('Čisté jmění CZK'))&&a.lines.some(x=>x.includes('Vstupenky CZK')),'status composes net worth and tickets');
a=personalCopilot30('Jak je na tom portfolio?',base,{},now);assert(a?.intent==='PORTFOLIO_RISK'&&a.lines.some(x=>x.includes('Risk score')),'portfolio risk answer');
const mixed=structuredClone(base);mixed.xtbHub.accounts.eur={currency:'EUR',value:1000,positions:[{ticker:'EUNL.DE',name:'MSCI World ETF',category:'ETF',value:1000}]};a=personalCopilot30('portfolio riziko',mixed,{},now);assert(a.lines.some(x=>x.includes('chybí skutečný FX')),'missing FX explicitly hides global risk');assert(!a.lines.some(x=>x.includes('Risk score')),'no fake global score without FX');
a=personalCopilot30('Co koupit za 25 000 Kč?',base,{},now);assert(a?.intent==='REBALANCE'&&a.lines.some(x=>x.includes('VWCE.DE')),'rebalancer gives existing ticker plan');assert(!a.lines.some(x=>/prodat\s+\d/i.test(x)),'copilot rebalancer does not generate sale');
a=personalCopilot30('Co koupit?',base,{},now);assert(a?.intent==='REBALANCE'&&a.lines[0].includes('Doplň částku'),'rebalancer refuses amount guessing');
a=personalCopilot30('Jak jsou na tom vstupenky?',base,{},now);assert(a?.intent==='TICKETS'&&a.lines.some(x=>x.includes('realizovaný P/L 400 CZK'))&&a.lines.some(x=>x.includes('čekající payout 1 500 CZK')||x.includes('čekající payout 1 500 CZK')),'ticket answer separates realized and payout');
a=personalCopilot30('Jak utrácím?',base,{},now);assert(a?.intent==='SPENDING'&&a.lines.some(x=>x.includes('2 000 CZK')||x.includes('2 000 CZK')),'spending uses actual expenses');assert(!a.lines.some(x=>x.includes('7 000 CZK')||x.includes('7 000 CZK')),'transfer is not spending');
a=personalCopilot30('Co příští měsíc?',base,{},now);assert(a?.intent==='NEXT_MONTH'&&a.lines.length>0,'next month composed');
assert(personalCopilot30('náhodný text bez známého záměru',base,{},now)===null,'unknown query falls through');
assert(personalCopilot30Note.includes('read-only')&&personalCopilot30Note.includes('nevymýšlí'),'safety note present');
console.log('PERSONAL COPILOT 30.0 TEST PASS');
