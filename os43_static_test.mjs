import assert from 'node:assert/strict';
import {OS43_VERSION,nextBestActions43,dailyScore43,markAction43} from './js/os43.js';
assert.equal(OS43_VERSION,'43.0');
const state={tasks:[{id:'t1',title:'Po termínu',due:'2026-08-20',status:'OPEN'}],delegations:[],ticketBook:{items:[]},decisionMemory36:{items:[]}};
const now=new Date('2026-08-22T09:00:00+02:00');
const q=nextBestActions43(state,now);assert.ok(Array.isArray(q.rows));
const score=dailyScore43(state,now);assert.ok(score.score>=0&&score.score<=100);
const row={id:'test:1',title:'Test',source:'OS43',action:'REVIEW',priority:80};const m=markAction43(state,row,'SNOOZED',now);assert.equal(m.status,'SNOOZED');assert.ok(state.decisionMemory36.items.length===1);
console.log('OS43 static tests OK');
