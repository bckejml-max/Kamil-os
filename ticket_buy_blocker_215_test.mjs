import assert from 'node:assert/strict';
import {ticketBuyBlocker215,buildTicketBuyBlocker215,TICKET_BUY_BLOCKER_VERSION_215} from './js/ticketBuyBlockerModel215.js';

const verify=ticketBuyBlocker215({id:'v',name:'Verify',score:90,action:'VERIFY',compliance:{missing:['resaleAllowed','transferCompatible'],verified:false},buyFinance:{market:'Viagogo'}});
assert.equal(TICKET_BUY_BLOCKER_VERSION_215,215);
assert.equal(verify.state,'VERIFY');
assert.ok(verify.reason.includes('resale'));
assert.ok(verify.next.includes('resale'));

const data=ticketBuyBlocker215({id:'d',name:'Data',score:90,action:'DATA NEEDED',compliance:{verified:true,missing:[]},buyFinance:{market:'Viagogo',samples:1},grossSpreadCeiling:1200,maxBuyPrice:null});
assert.equal(data.state,'DATA NEEDED');
assert.ok(data.reason.includes('Viagogo'));
assert.equal(data.netSafeMaxBuyPrice,null);
assert.equal(data.grossSpreadCeiling,1200);
assert.ok(data.next.includes('payout'));

const blocked=ticketBuyBlocker215({id:'b',name:'Blocked',score:95,action:'BLOCK',compliance:{resaleAllowed:false,transferCompatible:true,officialSaleStatus:'ON_SALE',missing:[]}});
assert.equal(blocked.state,'BLOCK');
assert.ok(blocked.reason.includes('resale není povolený'));

const ready=ticketBuyBlocker215({id:'r',name:'Ready',score:95,action:'BUY',compliance:{verified:true,missing:[]},buyFinance:{market:'Viagogo',samples:5},netSafeMaxBuyPrice:1000});
assert.equal(ready.state,'READY');

const now=Date.parse('2026-08-27T12:00:00Z');
const common={name:'Derby',eventDate:'2026-09-20',officialPriceCzk:1000,marketPriceCzk:1900,confidenceScore:90,competitorCount:5,sameSectionCount:3};
const desk=buildTicketBuyBlocker215({inventory:[],latest:new Map(),watchlist:[
 {...common,id:'verify'},
 {...common,id:'data',resaleAllowed:true,transferCompatible:true,officialSaleStatus:'ON_SALE',restrictionsVerifiedAt:'2026-08-27T10:00:00Z'},
 {...common,id:'block',resaleAllowed:false,transferCompatible:true,officialSaleStatus:'ON_SALE',restrictionsVerifiedAt:'2026-08-27T10:00:00Z'}
]},now);
assert.equal(desk.version,215);
assert.equal(desk.summary.total,3);
assert.equal(desk.summary.verify,1);
assert.equal(desk.summary.dataNeeded,1);
assert.equal(desk.summary.blocked,1);
assert.equal(desk.rows[0].state,'BLOCK');
console.log('OS 215 TICKET BUY BLOCKER PASS');
