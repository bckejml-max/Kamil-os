import assert from 'node:assert/strict';import {documentsCenter,documentItem} from './js/documents25.js';
const now=new Date('2026-08-20T12:00:00Z');
const s={personalAdmin:{items:[
 {id:'1',title:'Občanka',category:'DOCUMENT',status:'ACTIVE',document:{kind:'ID',holder:'Kamil',expiryDate:'2026-08-25'}},
 {id:'2',title:'STK',category:'DOCUMENT',status:'ACTIVE',document:{kind:'STK',holder:'Auto',expiryDate:'2026-10-10'}},
 {id:'3',title:'Bez termínu',category:'DOCUMENT',status:'ACTIVE',document:{kind:'WARRANTY'}},
 {id:'4',title:'Archiv',category:'DOCUMENT',status:'ARCHIVED',document:{kind:'PASSPORT',expiryDate:'2026-08-21'}}
]}};
const a=documentsCenter(s,now);assert.equal(a.total,3);assert.equal(a.due30,1);assert.equal(a.due60,2);assert.equal(a.due90,2);assert.equal(a.missing,1);assert.equal(a.items[0].title,'Občanka');assert.equal(a.items[0].status,'URGENT');
const expired=documentItem({title:'Pas',category:'DOCUMENT',document:{kind:'PASSPORT',holder:'Kamil',expiryDate:'2026-08-01'}},now);assert.equal(expired.status,'URGENT');assert.ok(expired.issues.some(x=>x.includes('po expiraci')));
console.log('documents expiry OK');
