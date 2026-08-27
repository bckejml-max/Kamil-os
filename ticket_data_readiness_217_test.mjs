import assert from 'node:assert/strict';
import {ticketDataReadiness217,TICKET_DATA_READINESS_VERSION_217} from './js/ticketDataReadinessModel217.js';

assert.equal(TICKET_DATA_READINESS_VERSION_217,217);
const desk=ticketDataReadiness217({rows:[
 {id:'a',name:'A',score:92,state:'VERIFY',missing:[{key:'transferCompatible'}]},
 {id:'b',name:'B',score:84,state:'VERIFY',missing:[{key:'transferCompatible'}]},
 {id:'c',name:'C',score:89,state:'VERIFY',missing:[{key:'resaleAllowed'}]},
 {id:'d',name:'D',score:88,state:'DATA NEEDED',market:'Viagogo'},
 {id:'e',name:'E',score:78,state:'DATA NEEDED',market:'Viagogo'},
 {id:'f',name:'F',score:95,state:'BLOCK'}
]});
assert.equal(desk.summary.tasks,4);
assert.equal(desk.summary.events,6);
assert.equal(desk.summary.actionable,3);
assert.equal(desk.summary.blocked,1);
const transfer=desk.rows.find(x=>x.key==='transferCompatible');
assert.ok(transfer);
assert.equal(transfer.count,2);
assert.equal(transfer.unlockable,2);
assert.equal(transfer.events.length,2);
const payout=desk.rows.find(x=>x.key==='payoutHistory');
assert.ok(payout);
assert.equal(payout.market,'Viagogo');
assert.equal(payout.count,2);
assert.equal(payout.unlockable,2);
const block=desk.rows.find(x=>x.key==='explicitBlock');
assert.ok(block);
assert.equal(block.unlockable,0);
assert.ok(block.next.includes('Neobcházet'));
assert.ok(desk.top.priority>=desk.rows.at(-1).priority);
console.log('OS 217 TICKET DATA READINESS PASS');
