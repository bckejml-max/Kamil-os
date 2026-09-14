import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('./api/ticket-gmail-sync.js',import.meta.url),'utf8');
assert.match(src,/readJsonBody/,'Gmail sync must accept a bounded JSON checkpoint body');
assert.match(src,/startHistoryId=/,'Gmail sync must use Gmail History API when a checkpoint exists');
assert.match(src,/historyTypes=messageAdded/,'Gmail sync must request only added-message history');
assert.match(src,/MAX_HISTORY_PAGES=3/,'Gmail history pagination must have a hard safety cap');
assert.match(src,/nextPageToken/,'Gmail sync must consume history pagination');
assert.match(src,/pageToken=/,'Gmail sync must request subsequent history pages');
assert.match(src,/HISTORY_PAGE_LIMIT/,'incomplete history pagination must fail closed');
assert.match(src,/syncMode:'incremental'/,'Gmail sync must expose incremental mode');
assert.match(src,/syncMode:'full_fallback'/,'expired history must use bounded full fallback');
assert.match(src,/HISTORY_EXPIRED/,'fallback reason must be explicit');
assert.match(src,/error\.status=r\.status/,'Gmail HTTP status must survive into fallback logic');
assert.match(src,/checkpointFor\(historyId,messages\)/,'checkpoint must be built only after messages are processed');
assert.match(src,/committedAt/,'checkpoint must carry a commit timestamp');
assert.match(src,/orders\.viagogo\.com/,'incremental ticket history must re-check sender');
assert.match(src,/includes\('INBOX'\)/,'incremental inbox history must re-check the INBOX label');
assert.match(src,/for\(let i=0;i<ids\.length;i\+=8\)/,'message detail fetching must be bounded in batches');

for(const marker of ['async function inboxMode','async function ticketMode']){
 const start=src.indexOf(marker);assert.ok(start>=0,`${marker} missing`);
 const end=src.indexOf(marker==='async function inboxMode'?'async function ticketMode':'export default async function handler',start+marker.length);
 const body=src.slice(start,end<0?src.length:end),loop=body.indexOf('for(let i=0;i<ids.length;i+=8)'),checkpoint=body.indexOf('checkpoint=checkpointFor(historyId,messages)');
 assert.ok(loop>=0&&checkpoint>loop,`${marker}: checkpoint must be created after message detail processing`);
}
console.log('OS1199-1201 Gmail history guard PASS: incremental pagination, bounded fallback and post-processing checkpoint are enforced');
