import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const api=await readFile(new URL('./api/ticket-gmail-sync.js',import.meta.url),'utf8');
const inbox=await readFile(new URL('./js/inboxHub660.js',import.meta.url),'utf8');
const vercel=await readFile(new URL('./vercel.json',import.meta.url),'utf8');

assert.match(api,/const uniqueIds=/,'OS1152 Gmail sync must deduplicate source message ids');
assert.match(api,/const uniqueRows=/,'OS1152 Gmail sync must deduplicate parsed rows');
assert.match(api,/checkpointFor/,'OS1153 Gmail sync must expose a durable checkpoint contract');
assert.match(api,/historyId/,'OS1153 Gmail checkpoint must carry Gmail historyId');
assert.match(api,/newestReceivedAt/,'OS1153 Gmail checkpoint must carry newest received timestamp');
assert.match(api,/ids=uniqueIds\(list\.messages\)/,'OS1152 Gmail source ids must be deduplicated before message detail fetches');
assert.match(api,/checkpoint,checkedAt/,'OS1153 successful Gmail responses must publish checkpoint with checkedAt');
assert.match(inbox,/mailDone/,'OS1152 Inbox must keep explicit completed-mail replay suppression');
assert.match(inbox,/\.filter\(x=>!mailDone\(s,x\.id\)\)/,'OS1152 completed Gmail messages must stay suppressed in Inbox');
assert.match(vercel,/"source": "\/api\/inbox-gmail-sync"/,'OS1152 Inbox Gmail endpoint rewrite must remain canonical');
assert.match(vercel,/ticket-gmail-sync\?mode=inbox/,'OS1152 Inbox Gmail rewrite must remain on authenticated Gmail handler');

console.log('OS1152/1153 Gmail replay and checkpoint guard PASS');
