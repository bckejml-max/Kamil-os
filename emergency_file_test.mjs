const assert=(x,m)=>{if(!x)throw new Error(m)};
const {emergencyFile,emergencySnapshotText,containsSecretLike}=await import('./js/emergencyFile26.js');

const base={
 emergencyFile:{
  contacts:[
   {id:'c1',name:'Rodina',role:'FAMILY',phone:'+420123456789',email:'',notes:'',status:'ACTIVE'},
   {id:'c2',name:'Bez spojení',role:'OTHER',phone:'',email:'',notes:'',status:'ACTIVE'},
   {id:'c3',name:'Archiv',role:'OTHER',phone:'123',status:'ARCHIVED'}
  ],
  assets:[
   {id:'a1',title:'Pojistné smlouvy',kind:'INSURANCE',location:'Modré desky v pracovně',contact:'Pojišťovna',notes:'',status:'ACTIVE'},
   {id:'a2',title:'Náhradní klíče',kind:'KEYS',location:'',contact:'',notes:'',status:'ACTIVE'}
  ]
 },
 personalAdmin:{items:[
  {id:'p1',category:'INSURANCE',status:'ACTIVE'},
  {id:'p2',category:'DOCUMENT',status:'ACTIVE',insurance:{policyNumber:'SECRET-POLICY'}},
  {id:'p3',category:'HOME',status:'ACTIVE'},
  {id:'p4',category:'VEHICLE',status:'ACTIVE'},
  {id:'p5',category:'INSURANCE',status:'ARCHIVED'}
 ]},
 familyHome:{members:[{id:'f1',name:'Mia',status:'ACTIVE'},{id:'f2',name:'Archiv',status:'ARCHIVED'}]}
};

let e=emergencyFile(base);
assert(e.totalContacts===2,'archived contact excluded');
assert(e.totalAssets===2,'active assets counted');
assert(e.contactsWithoutChannel===1,'missing contact channel detected');
assert(e.assetsWithoutLocation===1,'missing asset location detected');
assert(e.sources.insurance===1&&e.sources.documents===1&&e.sources.home===1&&e.sources.vehicle===1,'existing personal records summarized');
assert(e.sources.familyMembers===1,'active family member summarized');
assert(e.score<100&&e.score>0,'completeness score reacts to gaps');
assert(e.gaps.length>=2,'gaps surfaced');

const snap=emergencySnapshotText(base);
assert(snap.includes('Rodina')&&snap.includes('Pojistné smlouvy'),'snapshot contains useful orientation');
assert(!snap.includes('SECRET-POLICY'),'snapshot never exports policy/document identifiers');
assert(!snap.includes('policyNumber'),'snapshot does not expose sensitive field names');

assert(containsSecretLike('PIN 1234')===true,'PIN-like secret detected');
assert(containsSecretLike('seed phrase word word')===true,'seed phrase marker detected');
assert(containsSecretLike('modré desky v pracovně')===false,'normal location not blocked');

const risky=structuredClone(base);risky.emergencyFile.assets[0].notes='heslo: tajne';
e=emergencyFile(risky);assert(e.secretFlags===1,'secret-like note flagged');assert(e.gaps.some(x=>x.includes('přístupové tajemství')),'secret warning surfaced');

console.log('EMERGENCY FILE QA PASS');
