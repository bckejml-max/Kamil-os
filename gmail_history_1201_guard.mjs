import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync(new URL('./api/ticket-gmail-sync.js',import.meta.url),'utf8');
assert.match(src,/readJsonBody/,'Gmail sync must accept a bounded JSON checkpoint body');
assert.match(src,/startHistoryId=/,'Gmail sync must use Gmail History API when a checkpoint exists');
assert.match(src,/historyTypes=messageAdded/,'Gmail sync must request only added-message history');
assert.match(src,/syncMode:'incremental'/,'Gmail sync must expose incremental mode');
assert.match(src,/syncMode:'full_fallback'/,'expired history must use bounded full fallback');
assert.match(src,/HISTORY_EXPIRED/,'fallback reason must be explicit');
assert.match(src,/error\.status=r\.status/,'Gmail HTTP status must survive into fallback logic');
assert.match(src,/checkpointFor\(historyId,messages\)/,'checkpoint must be built only after messages are processed');
assert.match(src,/committedAt/,'checkpoint must carry a commit timestamp');
assert.match(src,/orders\.viagogo\.com/,'incremental ticket history must re-check sender');
assert.match(src,/includes\('INBOX'\)/,'incremental inbox history must re-check the INBOX label');
assert.doesNotMatch(src,/checkpointFor\([^)]*\).*for\s*\(/s,'checkpoint must not be advanced before message processing');
console.log('OS1199-1201 Gmail history guard PASS: incremental sync, bounded fallback and post-processing checkpoint are enforced');
