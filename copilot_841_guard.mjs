import fs from 'node:fs';
const f='js/commandCopilot840.js';
if(!fs.existsSync(f))throw new Error('missing commandCopilot840.js');
const c=fs.readFileSync(f,'utf8');
for(const x of ['canHandleCopilot841','normalizeShortcut','/cash','/tickets','/property','/bets','/week','30\\s*minut','constrainedAnswer841',"polish:'841'","readOnly:true"]){if(!c.includes(x))throw new Error(`missing ${x}`)}
if(/dispatchEvent\(new KeyboardEvent/.test(c))throw new Error('unsafe recursive Enter fallback detected');
if(!c.includes("if(!raw||!canHandleCopilot841(raw))return"))throw new Error('strict command routing missing');
console.log('OS841 Copilot polish guard OK');
