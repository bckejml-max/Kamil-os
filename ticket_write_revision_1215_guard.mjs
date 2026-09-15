import assert from 'node:assert/strict';
import {prepareTicketTransaction1213,commitTicketTransaction1213} from './lib/ticket-transaction1213.js';

const base={id:'ticket-race',state:'listed',purchased:2,listed:2,sold:0,transferred:0,revision:7,events:[]};
const tx=prepareTicketTransaction1213(base,{eventId:'race-1',type:'buyer',qty:1},{now:Date.parse('2026-09-15T20:00:00Z')});
assert.equal(tx.expectedRevision,7);
assert.equal(tx.nextRevision,8);
assert.equal(tx.next.revision,8);
assert.equal(base.revision,7,'prepare must not mutate current revision');

let seenMeta=null;
const committed=await commitTicketTransaction1213({current:base,event:{eventId:'race-2',type:'buyer',qty:1},persist:async(next,meta)=>{seenMeta=meta;assert.equal(next.revision,8);return{ok:true}}});
assert.equal(committed.committed,true);
assert.deepEqual(seenMeta,{expectedRevision:7,nextRevision:8,eventId:'race-2'});

await assert.rejects(
 ()=>commitTicketTransaction1213({current:base,event:{eventId:'race-3',type:'buyer',qty:1},persist:async()=>({conflict:true,currentRevision:8})}),
 error=>error?.code==='TICKET_WRITE_CONFLICT'&&error?.detail?.expectedRevision===7,
 'storage compare-and-swap conflict must fail closed'
);

const replayBase=tx.next;
const replay=prepareTicketTransaction1213(replayBase,{eventId:'race-1',type:'buyer',qty:1});
assert.equal(replay.replay,true);
assert.equal(replay.expectedRevision,8);
assert.equal(replay.nextRevision,8,'replay must not advance revision');

assert.throws(()=>prepareTicketTransaction1213({...base,revision:-1},{eventId:'race-invalid',type:'buyer',qty:1}),/TICKET_REVISION_INVALID/);
console.log('OS1215 PASS: ticket writes carry monotonic revision metadata and stale persistence conflicts fail closed');
