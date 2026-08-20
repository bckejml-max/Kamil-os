import {capitalActionPlan} from './js/actionPlan25.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const now=new Date('2026-08-20T10:00:00Z');
const base={financePlan:{cashNow:100000,reserveFloor:50000,plannedInvestment:0,cashflow:[]},xtbReport:{asOf:null},xtbHub:{},xtbStrategy:{overrides:{}},ticketBook:{items:[],watchlist:[]}};

const protect=capitalActionPlan({...base,financePlan:{...base.financePlan,cashNow:40000}},now);
assert(protect.top.state==='DO_NOW','reserve breach must be first');
assert(protect.top.domain==='cash','reserve protection must be cash step');
assert(/Neinvestovat/.test(protect.top.title),'reserve step must explicitly stop new investing');

const hold=capitalActionPlan(base,now);
assert(hold.steps.some(x=>x.state==='WAIT'),'unused capital without evidence must be held');
assert(hold.steps.every(x=>!['EXECUTE','BUY_NOW','SELL_NOW','TRANSFER'].includes(x.state)),'plan must never auto-execute');
assert(/Neprovádí převody/.test(hold.note),'safety note must forbid execution');
console.log('ACTION PLAN QA PASS');
