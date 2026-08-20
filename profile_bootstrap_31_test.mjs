import {profileBootstrap31} from './js/profileBootstrap31.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const blank={meta:{schemaVersion:42},tasks:[],personalAdmin:{items:[]},familyHome:{members:[]},ticketBook:{items:[],watchlist:[]},debtBook:{items:[]},personalGoals:{items:[]},personalSpending:{transactions:[]},netWorthBook:{items:[]},assetBook:{items:[]},xtbHub:{accounts:{}},xtbReport:{czkValue:0,eurValue:0},financePlan:{cashNow:0,expectedIncome:0,plannedInvestment:0}};
let r=profileBootstrap31(blank,{});assert(r.empty&&r.needsRecovery&&r.recommendation==='CONNECT_OR_IMPORT','blank local profile must request recovery');
r=profileBootstrap31({...blank,financePlan:{...blank.financePlan,cashNow:20000}},{});assert(r.meaningful&&!r.needsRecovery&&r.financeSignal===20000,'finance data must make profile meaningful');
r=profileBootstrap31({...blank,ticketBook:{items:[{id:'x'}],watchlist:[]}},{});assert(r.counts.tickets===1&&!r.empty,'ticket data must make profile meaningful');
r=profileBootstrap31({...blank,xtbHub:{accounts:{czk:{currency:'CZK'}}}},{});assert(r.counts.xtbAccounts===1&&r.xtbSignal&&!r.empty,'XTB account must make profile meaningful');
r=profileBootstrap31({...blank,meta:{...blank.meta,cloudMode:'cloud'}},{});assert(r.empty&&!r.needsRecovery&&r.recommendation==='CHECK_CLOUD','connected empty cloud profile must not show local-connect prompt');
console.log('PROFILE BOOTSTRAP 31.2 TEST PASS');
