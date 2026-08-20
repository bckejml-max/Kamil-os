import fs from 'node:fs';
const assert=(x,m)=>{if(!x)throw new Error(m)},text=f=>fs.readFileSync(f,'utf8');
const brain=text('js/liveBrain32.js'),live=text('js/live24.js');
for(const bad of ['window.','document.','localStorage','fetch(','store.'])assert(!brain.includes(bad),'Live Brain trust engine must stay pure: '+bad);
assert(brain.includes("requires:['action','asOf','sourceUrls','confidence']")&&brain.includes("fallback:'RULE_ENGINE'")&&brain.includes('unsourcedOverride:false'),'source trust contract missing');
assert(brain.includes("['http:','https:']")&&brain.includes("issues.push('UNSOURCED')")&&brain.includes("issues.push('NO_CONFIDENCE')")&&brain.includes("issues.push('STALE')"),'trust gates incomplete');
assert(live.includes('liveSignalTrust32')&&live.includes("TRUSTED_FRESH"),'live decision layer must use trust gate');
assert(!live.includes("source:'ŽIVĚ',tone"),'legacy blind live merge must be removed');
console.log('KAMIL OS 32.3 LIVE BRAIN STATIC PASS');
