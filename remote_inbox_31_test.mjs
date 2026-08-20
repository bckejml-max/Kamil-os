import {remoteInbox31} from './js/remoteInbox31.js';
import {syncProjection31} from './js/syncJournal31.js';
const assert=(x,m)=>{if(!x)throw new Error(m)};
const local=syncProjection31({tasks:[{id:'t1',title:'Lokální',status:'OPEN'},{id:'t2',title:'Smazat?',status:'OPEN'}],personalAdmin:{items:[]},ticketBook:{items:[]},debtBook:{items:[]},personalGoals:{items:[]},netWorthBook:{items:[]},personalSpending:{transactions:[]},assetBook:{items:[]},personalInbox:{items:[]}}).records;
const rows=[
 {id:'dev2:1',device_id:'dev2',seq:1,domain:'tasks',entity_id:'t1',op:'UPSERT',payload:{id:'t1',title:'Starší',status:'OPEN'},client_at:'2026-08-20T10:00:00Z',created_at:'2026-08-20T10:00:01Z'},
 {id:'dev2:2',device_id:'dev2',seq:2,domain:'tasks',entity_id:'t1',op:'UPSERT',payload:{id:'t1',title:'Vzdálená',status:'OPEN',token:'NESMI'},client_at:'2026-08-20T11:00:00Z',created_at:'2026-08-20T11:00:01Z'},
 {id:'dev2:3',device_id:'dev2',seq:3,domain:'tasks',entity_id:'t3',op:'UPSERT',payload:{id:'t3',title:'Nová'},client_at:'2026-08-20T12:00:00Z',created_at:'2026-08-20T12:00:01Z'},
 {id:'dev2:4',device_id:'dev2',seq:4,domain:'tasks',entity_id:'t2',op:'DELETE',payload:null,client_at:'2026-08-20T13:00:00Z',created_at:'2026-08-20T13:00:01Z'},
 {id:'dev2:5',device_id:'dev2',seq:5,domain:'tasks',entity_id:'gone',op:'DELETE',payload:null,client_at:'2026-08-20T14:00:00Z',created_at:'2026-08-20T14:00:01Z'}
];
const inbox=remoteInbox31(rows,local,['dev2:3']);
assert(inbox.total===4,'latest-per-entity collapse failed');assert(inbox.conflicts===1,'conflict count');assert(inbox.remoteNew===1,'remote new count');assert(inbox.remoteDeletes===1,'remote delete count');assert(inbox.same===1,'same delete count');assert(inbox.unseenCount===2,'seen tracking');
const conflict=inbox.items.find(x=>x.entityId==='t1');assert(conflict.kind==='CONFLICT'&&conflict.changedFields.includes('title'),'conflict diff missing');assert(!('token' in conflict.payload),'remote secret was not sanitized');assert(!JSON.stringify(inbox).includes('NESMI'),'blocked secret leaked');
assert(inbox.items.find(x=>x.entityId==='t3').seen,'seen id not honored');assert(inbox.items.find(x=>x.entityId==='gone').kind==='SAME','already deleted item should not demand attention');
console.log('KAMIL OS 31.5 REMOTE INBOX UNIT PASS');
