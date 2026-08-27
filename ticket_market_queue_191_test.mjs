import assert from 'node:assert/strict';
import {TICKET_MARKET_QUEUE_VERSION_191,buildTicketMarketQueue191} from './js/ticketMarketQueueModel191.js';

assert.equal(TICKET_MARKET_QUEUE_VERSION_191,191);
const inventory=[
 {id:'a',event_name:'A',market_status:'NOT_LISTED',event_date:'2026-09-12',buy_each_czk:625},
 {id:'b',event_name:'B',market_status:'LISTED',event_date:'2026-09-12',ask_each_czk:1999,viagogo_url:'https://example.test/v'},
 {id:'c',event_name:'C',market_status:'PAID',event_date:'2026-09-12'}
];
const sources=new Map([['b',{consensus:{stubhub_url:'https://example.test/s'}}]]);
const q=buildTicketMarketQueue191(inventory,sources);
assert.equal(q.version,191);
assert.ok(q.actions.some(x=>x.ticketId==='a'&&x.code==='LIST_NOW'));
assert.ok(q.actions.some(x=>x.ticketId==='b'&&x.code==='COMPARE_MARKETS'));
assert.ok(!q.actions.some(x=>x.ticketId==='c'));
assert.ok(q.actions.every((x,i,a)=>i===0||a[i-1].priority>=x.priority));
console.log('OS 191 TICKET MARKET QUEUE PASS');
