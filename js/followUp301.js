const DAY=86400000;
const closed=x=>['DONE','HOTOVO','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','CANCELLED','CANCELED'].includes(String(x?.status||x?.workflow||'').toUpperCase());
const dateOf=x=>x?.followUpAt||x?.nextAt||x?.due||x?.dueAt||x?.deadline||null;
const title=x=>x?.title||x?.name||x?.summary||x?.person||'Follow-up';
export function buildFollowUps301(s={},now=Date.now()){const rows=[];for(const x of s.delegations||[]){if(closed(x))continue;const at=dateOf(x),t=Date.parse(at||'');if(!Number.isFinite(t))continue;const days=Math.ceil((t-now)/DAY),person=x.person||x.contact||x.owner||x.assignee||null;let urgency=days<0?95+Math.min(4,Math.abs(days)):days===0?90:days===1?72:days<=3?56:30;rows.push({id:x.id||title(x),title:title(x),person,at,days,urgency,reason:days<0?`${Math.abs(days)} d po follow-upu`:days===0?'Follow-up dnes':`Follow-up za ${days} d`,source:x,area:x.area||'Čekám'})}return rows.sort((a,b)=>b.urgency-a.urgency)}
export function followUpSummary301(s={},now=Date.now()){const rows=buildFollowUps301(s,now);return{rows,overdue:rows.filter(x=>x.days<0),today:rows.filter(x=>x.days===0),soon:rows.filter(x=>x.days>0&&x.days<=3),next:rows[0]||null}}
