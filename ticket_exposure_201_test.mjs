import assert from 'node:assert/strict';
import {buildTicketExposure201,ticketExposureGuard201,applyTicketExposureToExecution201,TICKET_EXPOSURE_VERSION_201} from './js/ticketExposureModel201.js';

const inventory=[
 {market_status:'LISTED',event_name:'Sparta vs Jablonec',event_date:'2026-09-12',club:'Sparta Praha',sport:'football',buy_total_czk:3000},
 {market_status:'LISTED',event_name:'Sparta vs Plzen',event_date:'2026-09-20',club:'Sparta Praha',sport:'football',buy_total_czk:2500},
 {market_status:'NOT_LISTED',event_name:'Concert X',event_date:'2026-09-12',artist:'Artist X',category:'music',buy_total_czk:1500}
];
const exposure=buildTicketExposure201(inventory,20000);
assert.equal(exposure.version,TICKET_EXPOSURE_VERSION_201);
assert.equal(exposure.invested,7000);
const candidate={event_name:'Sparta vs Slavia',event_date:'2026-09-12',club:'Sparta Praha',sport:'football'};
const guard=ticketExposureGuard201(candidate,exposure,{eventCapPct:20,groupCapPct:35,dateCapPct:30,categoryCapPct:60});
assert.equal(guard.ok,true);
// group cap 35% of 20k = 7k; already 5.5k => only 1.5k remains, tighter than date/category/event.
assert.equal(guard.remainingBudget,1500);
assert.equal(guard.binding.dimension,'group');
const adjusted=applyTicketExposureToExecution201(candidate,{verdict:'EXECUTE',buyPrice:625,maxQty:6,deployCapital:3750},exposure,{eventCapPct:20,groupCapPct:35,dateCapPct:30,categoryCapPct:60});
assert.equal(adjusted.maxQty,2);
assert.equal(adjusted.deployCapital,1250);
const saturated=buildTicketExposure201([...inventory,{market_status:'LISTED',event_name:'Sparta vs Banik',event_date:'2026-10-01',club:'Sparta Praha',sport:'football',buy_total_czk:1500}],20000);
const blocked=applyTicketExposureToExecution201(candidate,{verdict:'EXECUTE',buyPrice:625,maxQty:6},saturated,{groupCapPct:35});
assert.equal(blocked.verdict,'CONCENTRATED');
assert.equal(blocked.maxQty,0);
console.log('OS 201 TICKET EXPOSURE PASS');
