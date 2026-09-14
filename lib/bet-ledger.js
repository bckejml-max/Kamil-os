export const LOCKED_BETS=Object.freeze([]);
function normalize(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function sameTeam(actual,expected){const a=normalize(actual);const e=normalize(expected);return !!a&&!!e&&(a===e||a.includes(e)||e.includes(a))}
function eventMatches(event,bet){return sameTeam(event?.home,bet.home)&&sameTeam(event?.away,bet.away)}
function lineMatches(selection,bet){if(bet.line==null)return true;return Math.abs(Number(selection?.line)-Number(bet.line))<0.001}
export function findLockedBet(event,market,selection){const marketType=String(market?.type||'').toUpperCase();const marketPeriod=String(market?.period||'').toUpperCase();const outcome=String(selection?.outcome||'').toUpperCase();return LOCKED_BETS.find(bet=>bet.status==='OPEN'&&bet.locked===true&&eventMatches(event,bet)&&marketType===bet.market&&marketPeriod===bet.period&&outcome===bet.selection&&lineMatches(selection,bet))||null}
export function decorateLedgerSelection(event,market,selection){const bet=findLockedBet(event,market,selection);if(!bet)return {...selection,existingBet:false,ledgerDecision:'AVAILABLE'};return {...selection,existingBet:true,ledgerBetId:bet.id,lockedStakeCzk:bet.stakeCzk,lockedOdds:bet.odds,ledgerDecision:'LOCKED_NO_ADD'}}
export function ledgerSummary(){return {persistence:'private_runtime',writable:false,openCount:0,knownTicketExposureCzk:0,rule:'Personal bets are never embedded in public source code. Canonical user bets live in private/local state only.'}}
export function publicLedger(){return []}
