const CLOSED=new Set(['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','SOLD','PAYOUT RECEIVED']);
const upper=v=>String(v||'').toUpperCase();
const open=x=>!CLOSED.has(upper(x?.status||x?.workflow));
const ms=v=>{const n=new Date(v||0).getTime();return Number.isFinite(n)?n:null};
const days=v=>{const t=ms(v);return t===null?null:Math.ceil((t-Date.now())/86400000)};
const text=x=>String(x??'').trim();
const title=x=>text(x?.title||x?.name||x?.subject||x?.eventName||'Bez názvu');
const due=x=>x?.due||x?.dueAt||x?.date||x?.deadline||x?.sellBy||null;
const SNAP='kamil-os-life42-snapshot';

export function universalInbox42(s={}){
 const out=[];
 const add=(source,arr,kind,base=40)=>{for(const x of arr||[]){if(!open(x))continue;const d=days(due(x)),priority=Number(x.priority||0),score=base+Math.min(25,priority)+(d!==null&&d<0?35:d===0?28:d<=2?20:d<=7?10:0);out.push({source,kind,id:x.id||x.uid||null,title:title(x),due:due(x),days:d,score,owner:text(x.owner||x.assignee||x.assignedTo),raw:x});}};
 add('tasks',s.tasks,'Úkol',45);
 add('inbox',s.inbox,'Inbox',38);
 add('personalInbox',s.personalInbox?.items,'Osobní inbox',36);
 add('directorWaiting',s.directorBook?.waiting,'Waiting For',50);
 add('delegations',s.delegations,'Delegace',48);
 add('personalAdmin',s.personalAdmin?.items,'Administrativa',42);
 for(const x of s.ticketBook?.items||[]){if(!['HOLD','LISTED'].includes(upper(x.workflow||'HOLD')))continue;const d=days(x.date),score=35+(d!==null&&d<=3?45:d!==null&&d<=10?25:0)+(upper(x.workflow)==='HOLD'?8:0);out.push({source:'tickets',kind:'Vstupenka',id:x.id||null,title:title(x),due:x.date||null,days:d,score,owner:'',raw:x});}
 return out.sort((a,b)=>b.score-a.score||((ms(a.due)||Infinity)-(ms(b.due)||Infinity)));
}

export function kamilBrain42(s={}){
 const inbox=universalInbox42(s),top=inbox.slice(0,3),overdue=inbox.filter(x=>x.days!==null&&x.days<0).length,waiting=inbox.filter(x=>x.kind==='Waiting For'||x.kind==='Delegace').length;
 const reasons=[];
 if(overdue)reasons.push(`${overdue} věcí je po termínu`);
 if(waiting)reasons.push(`${waiting} věcí čeká na člověka / odpověď`);
 const urgentTicket=inbox.find(x=>x.kind==='Vstupenka'&&x.days!==null&&x.days<=10);
 if(urgentTicket)reasons.push(`${urgentTicket.title} se blíží`);
 return {top,overdue,waiting,summary:top.length?`Dnes bych řešil ${top.length} věci v tomto pořadí. ${reasons.slice(0,2).join(' · ')||'Zbytek může počkat.'}`:'Nemáš žádnou zjevně urgentní věc.'};
}

export function changeFeed42(s={}){
 const now={tasks:(s.tasks||[]).filter(open).length,inbox:(s.inbox||[]).filter(open).length,waiting:[...(s.directorBook?.waiting||[]),...(s.delegations||[])].filter(open).length,tickets:(s.ticketBook?.items||[]).filter(x=>['HOLD','LISTED'].includes(upper(x.workflow||'HOLD'))).length,stamp:Date.now()};
 let prev=null;try{prev=JSON.parse(localStorage.getItem(SNAP)||'null')}catch{}
 const changes=[];
 if(prev){for(const [k,label] of [['tasks','úkoly'],['inbox','inbox'],['waiting','Waiting For'],['tickets','vstupenky']]){const delta=now[k]-Number(prev[k]||0);if(delta)changes.push({key:k,delta,label,text:`${label}: ${delta>0?'+':''}${delta}`});}}
 try{localStorage.setItem(SNAP,JSON.stringify(now))}catch{}
 return {changes,previousAt:prev?.stamp||null,current:now};
}

export function directorHealth42(s={}){
 const all=universalInbox42(s),work=all.filter(x=>['Úkol','Inbox','Waiting For','Delegace'].includes(x.kind)),overdue=work.filter(x=>x.days!==null&&x.days<0).length,urgent=work.filter(x=>x.score>=75).length,waiting=work.filter(x=>['Waiting For','Delegace'].includes(x.kind)).length;
 const score=Math.max(0,Math.min(100,100-overdue*10-urgent*5-Math.max(0,waiting-5)*2));
 const tone=score>=85?'good':score>=65?'warn':'bad';
 return {score,tone,overdue,urgent,waiting,text:score>=85?'Pobočka je pod kontrolou.':score>=65?'Několik věcí chce ředitelskou pozornost.':'Příliš mnoho otevřeného rizika — dnes je potřeba čistit frontu.'};
}

export function moneyAutopilot42(s={}){
 const p=s.financePlan||{},cash=Number(p.cashNow||p.cash||0),income=Number(p.expectedIncome||0),reserve=Number(p.reserveFloor||0),planned=Number(p.plannedInvestment||0),free=Math.max(0,cash+income-reserve-planned);
 const positions=s.investments?.items||s.portfolio?.items||s.assetBook?.items||[];
 return {cash,reserve,planned,free,count:positions.length,text:free>0?`Po rezervě a plánovaných investicích vidím přibližně ${Math.round(free).toLocaleString('cs-CZ')} Kč volného kapitálu.`:'Teď bych další kapitál neposílal ven bez kontroly rezervy.'};
}

export function ticketCockpit42(s={}){
 const items=(s.ticketBook?.items||[]).filter(x=>['HOLD','LISTED'].includes(upper(x.workflow||'HOLD')));
 const rows=items.map(x=>{const d=days(x.date),listed=upper(x.workflow)==='LISTED',price=Number(x.listPrice||0),buy=Number(x.buy||0),qty=Math.max(1,Number(x.qty||1)),floor=Number(x.floorPrice||0),prob=d===null?50:Math.max(15,Math.min(95,85-d*1.4+(listed?8:-5)));let action='DRŽET';if(d!==null&&d<=2)action='PRODAT / ZLEVNIT';else if(d!==null&&d<=10&&!listed)action='VYSTAVIT';else if(d!==null&&d<=10)action='HLÍDAT CENU';return {id:x.id,title:title(x),days:d,action,prob:Math.round(prob),price,buy,qty,floor,workflow:upper(x.workflow||'HOLD')};}).sort((a,b)=>(a.days??999)-(b.days??999));
 const risk=rows.reduce((n,x)=>n+x.buy,0);return {rows,risk,urgent:rows.filter(x=>x.days!==null&&x.days<=10).length};
}

export function relationshipMemory42(s={}){
 const map=new Map();const add=(name,item,dir)=>{name=text(name);if(!name)return;const k=name.toLocaleLowerCase('cs-CZ');if(!map.has(k))map.set(k,{name,oweMe:0,iOwe:0,items:[]});const r=map.get(k);dir==='oweMe'?r.oweMe++:r.iOwe++;r.items.push(title(item));};
 for(const x of s.directorBook?.waiting||[])if(open(x))add(x.owner||x.person||x.from||x.assignedTo,x,'oweMe');
 for(const x of s.delegations||[])if(open(x))add(x.owner||x.person||x.assignedTo,x,'oweMe');
 for(const x of s.tasks||[])if(open(x)&&x.assignedTo)add(x.assignedTo,x,'oweMe');
 for(const x of s.inbox||[])if(open(x)&&x.from)add(x.from,x,'iOwe');
 return [...map.values()].sort((a,b)=>(b.oweMe+b.iOwe)-(a.oweMe+a.iOwe)).slice(0,12);
}

export function meetingPrep42(s={}){
 const candidates=[...(s.calendar?.items||[]),...(s.meetings||[]),...(s.events||[])].filter(x=>{const d=days(x.start||x.date||x.when);return d!==null&&d>=0&&d<=7;}).sort((a,b)=>(ms(a.start||a.date)||0)-(ms(b.start||b.date)||0));
 const next=candidates[0]||null;const brain=kamilBrain42(s);
 return {next,title:next?title(next):'Žádná známá porada v příštích 7 dnech',when:next?(next.start||next.date||next.when):null,points:brain.top.slice(0,4).map(x=>x.title)};
}

export function shutdown42(s={}){
 const inbox=universalInbox42(s),urgent=inbox.filter(x=>x.score>=75),tomorrow=inbox.filter(x=>x.days===1),waiting=inbox.filter(x=>['Waiting For','Delegace'].includes(x.kind));
 return {urgent,tomorrow,waiting,ready:urgent.length===0,text:urgent.length?`Ještě bych nezavíral den: ${urgent.length} urgentních věcí zůstává otevřených.`:`Den můžeš uzavřít. Na zítra čeká ${tomorrow.length} věcí a Waiting For má ${waiting.length} položek.`};
}

export function searchLife42(s={},query=''){
 const q=text(query).toLocaleLowerCase('cs-CZ');if(!q)return [];
 const rows=universalInbox42(s).map(x=>({...x,search:`${x.title} ${x.kind} ${x.owner}`.toLocaleLowerCase('cs-CZ')}));
 const positions=[...(s.investments?.items||[]),...(s.portfolio?.items||[])].map(x=>({kind:'Investice',title:title(x),owner:'',source:'investment',id:x.id||null,search:`${title(x)} ${x.ticker||''}`.toLocaleLowerCase('cs-CZ'),raw:x}));
 return [...rows,...positions].filter(x=>x.search.includes(q)).slice(0,20);
}
