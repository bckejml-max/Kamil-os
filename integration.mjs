
globalThis.localStorage={
 _d:new Map(),getItem(k){return this._d.has(k)?this._d.get(k):null},
 setItem(k,v){this._d.set(k,String(v))},removeItem(k){this._d.delete(k)}
};
globalThis.document={
 querySelector(){return null},
 querySelectorAll(){return []}
};
globalThis.window={
 dispatchEvent(){},
 addEventListener(){},
};
globalThis.CustomEvent=class{constructor(type,opts){this.type=type;this.detail=opts?.detail}};
globalThis.Notification={permission:'default'};
const {store,migrate}=await import('./js/state.js');
const {parse,search,execute}=await import('./js/command.js');
const {debtRemaining}=await import('./js/intelligence.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};

store.replace(migrate({
 tasks:[{id:'t1',title:'Zbrojovka report',status:'UDĚLAT',area:'Práce'}],
 projects:[{id:'p1',name:'Nová Zbrojovka',next:'Kontrola'}],
 delegations:[{id:'w1',title:'Tereza – podklady',status:'WAITING',createdAt:new Date(Date.now()-8*86400000).toISOString()}],
 ticketBook:{items:[{id:'tk1',name:'Sparta Praha',workflow:'LISTED',buy:1000,date:'2026-09-01'}]},
 debtBook:{items:[{id:'d1',person:'Petr',amount:5000,payments:[],status:'OPEN'}]}
}),'integration');

assert(parse('ukaž dluhy').type==='nav','nav parser');
assert(parse('Petr splátka 500').type==='payment','payment parser');
assert(parse('Sparta prodáno').type==='sold','sold parser');
assert(parse('Zbrojovka report zítra').type==='tomorrow','tomorrow parser');
assert(parse('čekám na dodání rozvaděče').type==='waiting','waiting parser');
assert(parse('projekt Brno servis').type==='project','project parser');
assert(search('zbrojovka').length>=2,'global search tasks+projects');
assert(search('tereza').some(x=>x.kind==='Čekám'),'global search waiting');

execute('Petr splátka 500');
assert(debtRemaining(store.get().debtBook.items[0])===4500,'command payment');
execute('Sparta prodáno');
assert(store.get().ticketBook.items[0].workflow==='SOLD','command sold');
execute('Zbrojovka report zítra');
assert(!!store.get().tasks[0].due,'command tomorrow');

const soldAt=store.get().ticketBook.items[0].soldAt;
execute('Sparta prodáno');
assert(store.get().ticketBook.items[0].soldAt===soldAt,'sold idempotent');

console.log('COMMAND INTEGRATION QA PASS');
