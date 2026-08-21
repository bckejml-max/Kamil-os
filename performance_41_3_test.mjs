import assert from 'node:assert/strict';

class MemoryStorage {
  constructor(){this.map=new Map()}
  getItem(k){return this.map.has(k)?this.map.get(k):null}
  setItem(k,v){this.map.set(k,String(v))}
  removeItem(k){this.map.delete(k)}
  clear(){this.map.clear()}
}

globalThis.localStorage=new MemoryStorage();

const MAIN='kamil-os-state';
const COLD='kamil-os-41-2-cold-v1';
const BOOT='kamil-os-41-boot-summary';
const QUEUE='kamil-os-22-sync-queue';

const seed={
  meta:{schemaVersion:80},
  tasks:[{id:'task-1',title:'Keep me hot',status:'OPEN'}],
  tradeJournal:{trades:[{id:'trade-1',at:'2026-08-20',ticker:'ABC'}]},
  personalSpending:{transactions:[{id:'txn-1',amount:123}]},
  netWorthBook:{items:[{id:'nw-1',title:'Asset'}],history:[{id:'nwh-1',value:1000}]},
  importCenter:{history:[{id:'imp-1',at:'2026-08-20'}]},
  investmentBook:{history:[{id:'inv-1',total:2000}]},
  undo:[]
};
localStorage.setItem(MAIN,JSON.stringify(seed));
localStorage.setItem(QUEUE,JSON.stringify({at:new Date().toISOString(),payload:{huge:'x'.repeat(20000)}}));
localStorage.setItem(BOOT,JSON.stringify({tasks:1}));

const mod=await import(`./js/coldPartition42.js?test=${Date.now()}`);
const first=mod.compactLocalState42({force:true});
assert.equal(first.ok,true,'first compaction must succeed');
assert.equal(first.skipped,false,'forced compaction must run');
assert.ok(first.moved>=5,'cold histories must be moved');

const hot=JSON.parse(localStorage.getItem(MAIN));
assert.equal(hot.tasks.length,1,'hot task data must stay available');
assert.deepEqual(hot.tradeJournal.trades,[],'trade history must leave hot state');
assert.deepEqual(hot.personalSpending.transactions,[],'spending history must leave hot state');
assert.deepEqual(hot.netWorthBook.history,[],'net-worth history must leave hot state');
assert.equal(hot.netWorthBook.items.length,1,'net-worth ledger itself must stay hot');

const cold=JSON.parse(localStorage.getItem(COLD));
assert.equal(cold.money['tradeJournal.trades'].length,1,'trade history must survive in cold storage');
assert.equal(cold.money['personalSpending.transactions'].length,1,'spending history must survive in cold storage');
assert.equal(cold.money['netWorthBook.history'].length,1,'net-worth history must survive in cold storage');
assert.equal(cold.money['importCenter.history'].length,1,'import history must survive in cold storage');
assert.equal(cold.money['investmentBook.history'].length,1,'investment history must survive in cold storage');

const queue=JSON.parse(localStorage.getItem(QUEUE));
assert.equal(queue.pending,true,'sync queue must remain marked pending');
assert.equal('payload' in queue,false,'sync queue must not duplicate the whole state');
assert.ok(localStorage.getItem(QUEUE).length<200,'sync queue marker must stay tiny');

const boot=JSON.parse(localStorage.getItem(BOOT));
assert.equal(boot.storage.partitioned,true,'boot metadata must record partitioning');
assert.equal(boot.storage.layoutVersion,3,'boot metadata must record layout v3');

const reconstructed=mod.mergeColdState42(hot);
assert.equal(reconstructed.tradeJournal.trades.length,1,'cloud/backup merge must restore trade history');
assert.equal(reconstructed.personalSpending.transactions.length,1,'cloud/backup merge must restore spending history');
assert.equal(reconstructed.netWorthBook.history.length,1,'cloud/backup merge must restore net-worth history');

const second=mod.compactLocalState42();
assert.equal(second.ok,true,'repeat compaction check must succeed');
assert.equal(second.skipped,true,'repeat boot must skip JSON parsing/compaction when layout is ready');

console.log('KAMIL OS 41.3 PERFORMANCE STORAGE TEST PASS');
