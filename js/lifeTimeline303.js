const DAY=86400000;
const closed=x=>['DONE','HOTOVO','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','CANCELLED','CANCELED'].includes(String(x?.status||x?.workflow||'').toUpperCase());
const title=x=>x?.title||x?.name||x?.summary||x?.person||'Položka';
const dateOf=x=>x?.due||x?.dueAt||x?.deadline||x?.followUpAt||x?.nextAt||x?.date||x?.start||x?.when||x?.validUntil||x?.reviewAt||null;
const days=(v,now)=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.ceil((t-now)/DAY):null};
const area=(x,kind)=>x?.area||x?.category||({task:'Úkol',waiting:'Čekám',admin:'Administrativa',calendar:'Kalendář'}[kind]||'Život');
export function buildLifeTimeline303(s={},now=Date.now()){const rows=[],add=(x,kind)=>{if(!x||closed(x))return;const at=dateOf(x),d=days(at,now);if(d===null||d<-14||d>60)return;rows.push({id:`${kind}:${x.id||title(x)}`,kind,title:title(x),area:area(x,kind),at,days:d,source:x})};for(const x of s.tasks||[])add(x,'task');for(const x of s.delegations||[])add(x,'waiting');for(const x of s.personalAdmin?.items||[])add(x,'admin');for(const x of s.calendar?.events||[])add(x,'calendar');rows.sort((a,b)=>a.days-b.days||String(a.title).localeCompare(String(b.title),'cs'));return{rows,overdue:rows.filter(x=>x.days<0),today:rows.filter(x=>x.days===0),week:rows.filter(x=>x.days>0&&x.days<=7),later:rows.filter(x=>x.days>7)}}
export function timelineLabel303(x){return x.days<0?`${Math.abs(x.days)} d po termínu`:x.days===0?'Dnes':x.days===1?'Zítra':`Za ${x.days} d`}
