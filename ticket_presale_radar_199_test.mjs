import assert from 'node:assert/strict';
import {ticketPresaleStage199,ticketPresaleCandidate199,buildTicketPresaleRadar199,TICKET_PRESALE_RADAR_VERSION_199} from './js/ticketPresaleRadarModel199.js';

const now=Date.parse('2026-08-27T12:00:00Z');
assert.equal(TICKET_PRESALE_RADAR_VERSION_199,199);
assert.equal(ticketPresaleStage199('2026-08-27T18:00:00Z',now).stage,'TODAY');
assert.equal(ticketPresaleStage199('2026-08-29T06:00:00Z',now).stage,'D-1');
assert.equal(ticketPresaleStage199('2026-08-30T12:00:00Z',now).stage,'D-3');
assert.equal(ticketPresaleStage199('2026-09-03T12:00:00Z',now).stage,'D-7');

const verified={resaleAllowed:true,transferCompatible:true,officialSaleStatus:'ON_SALE',restrictionsVerifiedAt:'2026-08-27T10:00:00Z'};
const payout={learnedPayoutRatio:.875,payoutSamples:4,payoutConfidence:'MEDIUM'};
const strong={id:'derby',name:'Derby',eventDate:'2026-09-20',presaleAt:'2026-08-29T06:00:00Z',officialPriceCzk:1000,marketPriceCzk:1900,confidenceScore:90,competitorCount:5,sameSectionCount:3,...verified,...payout};
const target=ticketPresaleCandidate199(strong,now);
assert.equal(target.action,'BUY TARGET');
assert.equal(target.opportunity.netSafeMaxBuyPrice,1100);
assert.ok(target.priority>=70);

const missingPayout=ticketPresaleCandidate199({...strong,id:'nopayout',learnedPayoutRatio:undefined,payoutSamples:undefined,payoutConfidence:undefined},now);
assert.equal(missingPayout.opportunity.action,'DATA NEEDED');
assert.equal(missingPayout.action,'DATA NEEDED');

const unverified=ticketPresaleCandidate199({...strong,id:'verify',resaleAllowed:undefined,transferCompatible:undefined,officialSaleStatus:undefined,restrictionsVerifiedAt:undefined},now);
assert.equal(unverified.opportunity.action,'VERIFY');
assert.notEqual(unverified.action,'BUY TARGET');

const noData=ticketPresaleCandidate199({...strong,id:'nodata',officialPriceCzk:0,marketPriceCzk:0,presaleAt:'2026-08-27T20:00:00Z'},now);
assert.equal(noData.action,'DATA NEEDED');
assert.notEqual(noData.opportunity.action,'BUY');

const far=ticketPresaleCandidate199({...strong,id:'far',presaleAt:'2026-09-25T10:00:00Z'},now);
assert.equal(far.action,'PLAN');

const scan=buildTicketPresaleRadar199([strong,{...strong,id:'nodata',name:'No data',officialPriceCzk:0,marketPriceCzk:0,presaleAt:'2026-08-27T20:00:00Z'},{...strong,id:'far',name:'Far',presaleAt:'2026-09-25T10:00:00Z'}],now);
assert.equal(scan.version,199);
assert.equal(scan.rows.length,3);
assert.equal(scan.summary.buyTargets,1);
assert.equal(scan.summary.dataNeeded,1);
assert.ok(scan.rows[0].priority>=scan.rows[1].priority);
console.log('OS 199 TICKET PRESALE RADAR PASS');
