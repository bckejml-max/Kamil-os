import assert from 'node:assert/strict';
import {ticketImportPreview183,ticketImportResult183} from './js/ticketImportReport183.js';

const diff={
 added:[{id:'new'}],
 changed:[{statusChanged:true},{statusChanged:false}],
 removed:[
  {id:'active',market_status:'LISTED'},
  {id:'waiting',market_status:'SOLD_WAITING_PAYMENT'},
  {id:'paid',market_status:'PAYOUT_RECEIVED'}
 ]
};
const preview=ticketImportPreview183(diff);
assert.deepEqual(preview,{added:1,changed:2,statusChanged:1,removedActive:1,preservedClosed:2,protectedSettlement:1});
const result=ticketImportResult183({count:12,removed:1,preservedClosed:2},diff);
assert.equal(result.imported,12);
assert.equal(result.removedActive,1);
assert.equal(result.preservedClosed,2);
assert.equal(result.protectedSettlement,1);
assert.equal(result.accountingProtected,true);
console.log('OS 183 TICKET IMPORT REPORT PASS');
