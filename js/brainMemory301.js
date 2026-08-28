const KEY='kamil-os-brain-memory-301';
const MAX=250;
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
const write=rows=>{try{localStorage.setItem(KEY,JSON.stringify(rows.slice(0,MAX)))}catch{}};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const keyOf=x=>String(x?.source?.id||x?.id||norm(x?.title||x?.name||''));
export function rememberBrain301(candidate,event,meta={}){const rows=read();rows.unshift({id:`bm-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,entityKey:keyOf(candidate),title:candidate?.title||candidate?.name||'Položka',area:candidate?.area||'Osobní',event,confidence:Number(meta.confidence||candidate?.confidence||0),reason:meta.reason||candidate?.reason||candidate?.risk||null,at:new Date().toISOString()});write(rows);return rows[0]}
export function brainHistory301(candidate){const k=keyOf(candidate);return read().filter(x=>x.entityKey===k).slice(0,20)}
export function brainMemoryStats301(){const rows=read(),done=rows.filter(x=>x.event==='done').length,snooze=rows.filter(x=>x.event==='tomorrow').length;return{count:rows.length,done,snooze,last:rows[0]||null}}
export function confidence301(candidate){const score=Number(candidate?.score||candidate?.priority||candidate?.confidence||0),history=brainHistory301(candidate),done=history.filter(x=>x.event==='done').length,snooze=history.filter(x=>x.event==='tomorrow').length;let base=score?Math.max(45,Math.min(94,Math.round(score))):64;if(candidate?.days!=null&&candidate.days<0)base=Math.max(base,88);if(candidate?.risk)base=Math.max(base,82);base+=Math.min(4,done*2);base-=Math.min(8,snooze*2);return Math.max(40,Math.min(96,base))}
export function recentBrainMemory301(limit=6){return read().slice(0,limit)}
