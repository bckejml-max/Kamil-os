globalThis.localStorage={
 _d:new Map(),
 getItem(k){return this._d.has(k)?this._d.get(k):null},
 setItem(k,v){this._d.set(k,String(v))},
 removeItem(k){this._d.delete(k)}
};
const {migrate,store}=await import('./js/state.js');
const {signals,debtRemaining,ticketStatus}=await import('./js/intelligence.js');

const assert=(x,m)=>{if(!x)throw new Error(m)};
let legacy={tasks:[{title:'Test',status:'UDĚLAT'}],projects:null,ticketBook:{items:[{name:'Concert',buy:1000,date:'2026-08-20'}]},debtBook:{items:[{person:'Petr',amount:5000,payments:[{amount:1000}]}]}};
let m=migrate(legacy);
assert(m.meta.schemaVersion===34,'migration schema');
assert(Array.isArray(m.projects),'projects normalized');
assert(!!m.tasks[0].id,'task id');
assert(debtRemaining(m.debtBook.items[0])===4000,'debt remaining');
assert(ticketStatus({...m.ticketBook.items[0],workflow:'HOLD'}).score>=60,'ticket urgency');

store.replace(m,'test');
const before=store.get().tasks[0].status;
store.mutate('done',s=>s.tasks[0].status='HOTOVO',{cloud:false});
assert(store.get().tasks[0].status==='HOTOVO','mutation');
assert(store.undo(),'undo exists');
assert(store.get().tasks[0].status===before,'undo restored');

let sig=signals({...m,tasks:[{id:'x',title:'Overdue',status:'UDĚLAT',due:'2020-01-01',updatedAt:'2020-01-01'}]});
assert(sig.length>0&&sig[0].score>=85,'overdue intelligence');
console.log('FUNCTIONAL QA PASS');

const cloudSource=(await import('fs')).default.readFileSync('./js/cloud.js','utf8');
assert(cloudSource.includes("updated_at:clientUpdatedAt"),'cloud explicit updated_at');
assert(cloudSource.includes("select('updated_at')"),'cloud reads server updated_at');
console.log('CLOUD HARDENING QA PASS');

localStorage.removeItem('kamil-os-22-sync-queue');
store.replace(migrate({tasks:[],projects:[],ticketBook:{items:[]},debtBook:{items:[]}}),'durability-base');
store.clearQueue();store.dirty=false;
store.mutate('durable-change',s=>s.tasks.push({id:'dur',title:'Durable',status:'UDĚLAT'}),{cloud:true});
assert(!!store.readQueue(),'pending queue immediately after mutation');
assert(store.dirty===true,'dirty true for cloud mutation');
store.clearQueue();store.dirty=false;
store.mutate('cache-refresh',s=>{s.calendar={events:[],asOf:new Date().toISOString()}},{undo:false,cloud:false,audit:false});
assert(store.dirty===false,'cloud:false must stay clean');
assert(!store.readQueue(),'cloud:false must not queue sync');
console.log('DURABILITY QA PASS');
