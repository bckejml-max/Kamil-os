const VERSION='543.2.0-fail-closed';
export const REQUIRED_REVISION='0034_betting_ledger543.sql';
const DISABLED_ERROR='REMOTE_BETTING_LEDGER_DISABLED';

function fail(status,error,extra={}){
 return {status,body:{ok:false,version:VERSION,error,status:error===DISABLED_ERROR?'disabled':'auth_required',storage:'private_local',writable:false,requiredRevision:REQUIRED_REVISION,...extra}};
}

export async function getBettingLedger543(){
 return {
  ok:false,
  version:VERSION,
  error:DISABLED_ERROR,
  status:'disabled',
  storage:'private_local',
  writable:false,
  requiredRevision:REQUIRED_REVISION,
  bets:[],
  bankrollCzk:0,
  unitCzk:0,
  analytics:{bankrollCzk:0,unitCzk:0,openCount:0,openExposureCzk:0,settledCount:0,wins:0,losses:0,profitCzk:0,roiPct:0,yieldPct:0,winRatePct:0,unitsProfit:null}
 };
}

export async function mutateBettingLedger543(){
 return fail(503,'REMOTE_BETTING_LEDGER_DISABLED');
}
