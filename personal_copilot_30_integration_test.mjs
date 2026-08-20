import {personalQuery} from './js/personalQuery29.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const now=new Date('2026-08-20T12:00:00Z');
const s={financePlan:{currency:'CZK',cashNow:100000,reserveFloor:50000,plannedInvestment:25000},xtbStrategy:{closedTickers:{},rebalanceTargets:{broad:55,bond:12.5,satellite:32.5}},xtbHub:{asOf:'2026-08-20T10:00:00Z',accounts:{czk:{currency:'CZK',value:100000,positions:[{ticker:'CORE',name:'World ETF',category:'ETF',value:55000},{ticker:'BOND',name:'Bond ETF',category:'ETF',value:12500},{ticker:'SAT',name:'Stock',category:'STOCK',value:32500}]}}},ticketBook:{items:[],history:[],watchlist:[]},debtBook:{items:[]},netWorthBook:{items:[],history:[]},personalSpending:{transactions:[]},personalGoals:{items:[{id:'goal',title:'Rezerva navíc',targetAmount:100000,savedAmount:20000,currency:'CZK',status:'ACTIVE'}]},personalAdmin:{items:[]},familyHome:{members:[]},emergencyFile:{contacts:[],assets:[]},personalInbox:{items:[]},assetBook:{items:[]},calendar:{events:[]},tasks:[],projects:[],audit:[]};
let a=personalQuery('Jak jsem na tom?',s,{},now);assert(a?.kind==='PERSONAL_COPILOT_30'&&a.intent==='STATUS','personalQuery routes status to Copilot 30');
a=personalQuery('Co koupit za 25000 CZK?',s,{},now);assert(a?.kind==='PERSONAL_COPILOT_30'&&a.intent==='REBALANCE','personalQuery routes rebalancing to Copilot 30');
a=personalQuery('cíle',s,{},now);assert(a?.title==='Cíle a fondy'&&!a.kind,'legacy goal query remains available');
a=personalQuery('co řešit dnes',s,{},now);assert(a&&Array.isArray(a.lines),'legacy/base query remains available when Copilot does not own intent');
console.log('PERSONAL COPILOT 30.0 INTEGRATION PASS');
