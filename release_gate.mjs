globalThis.localStorage={
 _d:new Map(),getItem(k){return this._d.has(k)?this._d.get(k):null},
 setItem(k,v){this._d.set(k,String(v))},removeItem(k){this._d.delete(k)}
};
Object.defineProperty(globalThis,'navigator',{value:{serviceWorker:{}},configurable:true});
const {validateState,repairState,migrate,store}=await import('./js/state.js');
const {runPreflight}=await import('./js/preflight.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};

const bad={tasks:{oops:true},projects:[],ticketBook:{items:[]},debtBook:{items:[]},personalAdmin:{items:{}},familyHome:{members:{}},emergencyFile:{contacts:{},assets:{}}};
const v=validateState(bad);assert(v.ok===true,'recoverable shape');assert(v.issues.length>=4,'recoverable personal issues detected');
const repaired=repairState(bad).state;assert(Array.isArray(repaired.tasks),'repair tasks');assert(Array.isArray(repaired.personalAdmin.items),'repair personal admin');assert(Array.isArray(repaired.familyHome.members),'repair family');assert(Array.isArray(repaired.emergencyFile.contacts),'repair emergency contacts');assert(Array.isArray(repaired.emergencyFile.assets),'repair emergency assets');assert(repaired.personalSettings.maskSensitive===true,'sensitive default');
assert(validateState(null).ok===false,'null backup fatal');
store.replace(migrate({tasks:[],projects:[],ticketBook:{items:[],watchlist:[]},debtBook:{items:[]},personalAdmin:{items:[]},familyHome:{members:[]},emergencyFile:{contacts:[],assets:[]}}),'preflight');
assert(store.get().meta.schemaVersion===38,'schema 38');const pf=runPreflight();assert(pf.ok===true,'preflight ready');
console.log('PERSONAL OS RELEASE GATE QA PASS');
