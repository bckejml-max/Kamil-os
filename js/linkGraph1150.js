import {store} from './state.js';

const VERSION='1150.0.0';
const A=v=>Array.isArray(v)?v:[];
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const tokens=v=>new Set(norm(v).split(' ').filter(x=>x.length>=3));
const overlap=(a,b)=>{const A1=tokens(a),B1=tokens(b);if(!A1.size||!B1.size)return 0;let hit=0;for(const x of A1)if(B1.has(x))hit++;return hit/Math.min(A1.size,B1.size)};
const title=x=>x?.title||x?.name||x?.subject||x?.event_name||x?.summary||'';
function collect(s){const out=[];const add=(kind,rows)=>A(rows).forEach((x,i)=>out.push({kind,id:String(x?.id||i),title:title(x),raw:x}));add('task',s.tasks);add('inbox',s.personalInbox?.items);add('waiting',s.delegations);add('admin',s.personalAdmin?.items);add('ticket',s.ticketBook?.items);add('calendar',s.calendar?.events);return out.filter(x=>norm(x.title))}
export function linkGraph1150(s=store.get()){const rows=collect(s),links=[];for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){const a=rows[i],b=rows[j];if(a.kind===b.kind&&a.id===b.id)continue;const score=overlap(a.title,b.title);if(score>=.72)links.push({a:{kind:a.kind,id:a.id,title:a.title},b:{kind:b.kind,id:b.id,title:b.title},score:Math.round(score*100),reason:'silná shoda názvu / tématu'})}links.sort((a,b)=>b.score-a.score);return{version:VERSION,count:links.length,duplicates:links.filter(x=>x.score>=90),links:links.slice(0,50),generatedAt:new Date().toISOString()}}
export function installLinkGraph1150(){globalThis.__KAMIL_LINK_GRAPH1150_API__={snapshot:linkGraph1150};globalThis.__KAMIL_LINK_GRAPH1150__=linkGraph1150();return globalThis.__KAMIL_LINK_GRAPH1150__}
