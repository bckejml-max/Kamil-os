const arr=(v)=>Array.isArray(v)?v:[];
const obj=(v)=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const n=(v)=>Number.isFinite(Number(v))?Number(v):0;

export function profileBootstrap31(state={},meta={}){
 const counts={
  tasks:arr(state.tasks).length,
  personalAdmin:arr(state.personalAdmin?.items).length,
  family:arr(state.familyHome?.members).length,
  tickets:arr(state.ticketBook?.items).length+arr(state.ticketBook?.watchlist).length,
  debts:arr(state.debtBook?.items).length,
  goals:arr(state.personalGoals?.items).length,
  spending:arr(state.personalSpending?.transactions).length,
  netWorth:arr(state.netWorthBook?.items).length,
  assets:arr(state.assetBook?.items).length,
  xtbAccounts:Object.keys(obj(state.xtbHub?.accounts)).length,
 };
 const financeSignal=Math.abs(n(state.financePlan?.cashNow))+Math.abs(n(state.financePlan?.expectedIncome))+Math.abs(n(state.financePlan?.plannedInvestment));
 const xtbSignal=counts.xtbAccounts>0||n(state.xtbHub?.positionCount)>0||Math.abs(n(state.xtbReport?.czkValue))+Math.abs(n(state.xtbReport?.eurValue))>0;
 const itemSignal=Object.values(counts).reduce((a,b)=>a+b,0);
 const meaningful=itemSignal>0||financeSignal>0||xtbSignal;
 const cloudMode=String(state.meta?.cloudMode||meta.cloudMode||'local').toLowerCase()==='cloud';
 return {
  empty:!meaningful,
  meaningful,
  cloudMode,
  needsRecovery:!meaningful&&!cloudMode,
  counts,
  itemSignal,
  financeSignal,
  xtbSignal,
  recommendation:!meaningful&&!cloudMode?'CONNECT_OR_IMPORT':!meaningful&&cloudMode?'CHECK_CLOUD':'READY',
  note:'Detekce pouze pozná, zda toto zařízení obsahuje smysluplná osobní data. Nehádá, zda data existují v cloudu; cloud je dostupný až po autentizaci.'
 };
}

export const profileBootstrap31Note='Prázdný lokální profil se nesmí tvářit jako kompletní osobní dashboard. Kamil OS nabídne obnovu, ale nic nepřepíše bez přihlášení nebo importu.';
