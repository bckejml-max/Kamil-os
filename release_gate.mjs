
globalThis.localStorage={
 _d:new Map(),getItem(k){return this._d.has(k)?this._d.get(k):null},
 setItem(k,v){this._d.set(k,String(v))},removeItem(k){this._d.delete(k)}
};
Object.defineProperty(globalThis,'navigator',{value:{serviceWorker:{}},configurable:true});
const {validateState,repairState,migrate,store}=await import('./js/state.js');
const {runPreflight}=await import('./js/preflight.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};

const bad={tasks:{oops:true},projects:[],ticketBook:{items:[]},debtBook:{items:[]}};
const v=validateState(bad);
assert(v.ok===true,'recoverable shape');
assert(v.issues.length>0,'recoverable issue detected');
const repaired=repairState(bad).state;
assert(Array.isArray(repaired.tasks),'repair tasks');

assert(validateState(null).ok===false,'null backup fatal');

store.replace(migrate({tasks:[],projects:[],ticketBook:{items:[]},debtBook:{items:[]}}),'preflight');
const pf=runPreflight();
assert(pf.ok===true,'preflight ready');
console.log('RELEASE GATE QA PASS');
