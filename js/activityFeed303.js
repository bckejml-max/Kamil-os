import {recentBrainMemory301} from './brainMemory301.js';
const SEEN_KEY='kamil-os-activity-seen-303';
const title=x=>x?.label||x?.title||x?.message||x?.reason||x?.action||'Změna';
const at=x=>Date.parse(x?.at||x?.createdAt||x?.updatedAt||x?.timestamp||0)||0;
export function buildActivityFeed303(s={},now=Date.now()){const seen=Number(localStorage.getItem(SEEN_KEY)||0),rows=[];for(const x of s.audit||[])rows.push({kind:'audit',title:title(x),at:at(x),source:x});for(const x of recentBrainMemory301(12)||[])rows.push({kind:'decision',title:`${x.event==='done'?'Hotovo':'Odloženo'} · ${x.title||'Položka'}`,at:at(x),source:x});const uniq=new Set(),sorted=rows.filter(x=>x.at&&now-x.at<=7*86400000).sort((a,b)=>b.at-a.at).filter(x=>{const k=`${x.kind}:${x.title}:${x.at}`;if(uniq.has(k))return false;uniq.add(k);return true}).slice(0,30);return{rows:sorted,newRows:sorted.filter(x=>x.at>seen),seenAt:seen,lastAt:sorted[0]?.at||0}}
export function markActivitySeen303(now=Date.now()){try{localStorage.setItem(SEEN_KEY,String(now))}catch{}}
