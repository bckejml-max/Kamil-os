import {goalPlan,reminderEscalation,priceHistory} from './personalPlus29.js';
import {personalInbox,dataQuality} from './autopilot28.js';
import {capitalAllocation} from './capitalAllocation25.js';
import {backupHealth} from './backupGuard26.js';

const DAY=86400000;
const active=x=>String(x?.status||'ACTIVE').toUpperCase()!=='ARCHIVED';
const hasDate=v=>{const t=new Date(v||0).getTime();return Number.isFinite(t)&&t>0};
const monthStart=now=>new Date(now.getFullYear(),now.getMonth(),1);
const nextMonthStart=now=>new Date(now.getFullYear(),now.getMonth()+1,1);
const iso=d=>new Date(d).toISOString().slice(0,10);
const monthKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const inRange=(v,from,to)=>{if(!hasDate(v))return false;const t=new Date(v).getTime();return t>=from.getTime()&&t<to.getTime()};
const round=v=>Math.round(Number(v)||0);

function goalProgressThisMonth(s,from,to){
 const byCurrency={},items=[];
 for(const g of (s.personalGoals?.items||[]).filter(active)){
  const c=String(g.currency||'CZK').toUpperCase(),rows=(Array.isArray(g.contributions)?g.contributions:[]).filter(x=>inRange(x.at,from,to)&&Number.isFinite(Number(x.amount))&&Number(x.amount)>0),amount=rows.reduce((sum,x)=>sum+Number(x.amount),0);
  if(amount<=0)continue;
  byCurrency[c]=(byCurrency[c]||0)+amount;
  items.push({key:`goal:${g.id}`,kind:'GOAL',title:g.title||'Cíl',amount:round(amount),currency:c,count:rows.length,detail:`Skutečně zapsané příspěvky tento měsíc: ${rows.length}.`});
 }
 return {items,byCurrency};
}

function resolvedInboxThisMonth(s,from,to){
 const rows=(s.personalInbox?.items||[]).filter(x=>['ACCEPTED','DISMISSED'].includes(String(x.status||'').toUpperCase())&&inRange(x.updatedAt||x.createdAt,from,to));
 return {count:rows.length,accepted:rows.filter(x=>String(x.status).toUpperCase()==='ACCEPTED').length,dismissed:rows.filter(x=>String(x.status).toUpperCase()==='DISMISSED').length};
}

function costChangesThisMonth(s,from,to){
 const out=[];
 for(const x of priceHistory(s).items){
  const hist=Array.isArray(x.history)?x.history:[];
  for(let i=1;i<hist.length;i++){
   const prev=hist[i-1],cur=hist[i];if(!inRange(cur.at,from,to))continue;
   const delta=Number(cur.amount)-Number(prev.amount),pct=Number(prev.amount)!==0?delta/Number(prev.amount)*100:null;
   if(delta===0)continue;
   out.push({key:`cost:${x.id}:${cur.at}`,id:x.id,title:x.title,currency:String(cur.currency||x.currency||'CZK').toUpperCase(),cadence:String(cur.cadence||'ONCE').toUpperCase(),previous:Number(prev.amount),current:Number(cur.amount),delta,pct,at:cur.at,direction:delta>0?'UP':'DOWN'});
  }
 }
 return out.sort((a,b)=>Math.abs(Number(b.pct||0))-Math.abs(Number(a.pct||0))||new Date(b.at)-new Date(a.at));
}

function backupProgress(meta,from,to){
 const at=meta?.lastBackupAt;return inRange(at,from,to)?{key:'backup',kind:'BACKUP',title:'Přenosná záloha vytvořena',at,detail:'Backup Guard eviduje export v tomto měsíci.'}:null;
}

export function personalMonthlyReview(s={},meta={},now=new Date()){
 const ref=new Date(now),from=monthStart(ref),to=nextMonthStart(ref),daysLeft=Math.max(0,Math.ceil((to.getTime()-ref.getTime())/DAY));
 const goals=goalPlan(s,ref),reminders=reminderEscalation(s,ref),inbox=personalInbox(s,ref),quality=dataQuality(s,meta,ref),allocation=capitalAllocation(s,ref),backup=backupHealth(s,meta,ref);
 const goalProgress=goalProgressThisMonth(s,from,to),resolvedInbox=resolvedInboxThisMonth(s,from,to),costChanges=costChangesThisMonth(s,from,to),progress=[...goalProgress.items];
 if(resolvedInbox.count)progress.push({key:'inbox-resolved',kind:'INBOX',title:`Vyřešený Personal Inbox: ${resolvedInbox.count}`,detail:`Přijato ${resolvedInbox.accepted} · odloženo ${resolvedInbox.dismissed}.`});
 const bp=backupProgress(meta,from,to);if(bp)progress.push(bp);
 for(const x of costChanges.filter(x=>x.direction==='DOWN').slice(0,2))progress.push({key:`saving:${x.key}`,kind:'COST',title:`Zlevnění: ${x.title}`,amount:round(Math.abs(x.delta)),currency:x.currency,detail:`Skutečná uložená částka klesla z ${round(x.previous)} na ${round(x.current)} ${x.currency}.`});

 const attention=[];
 for(const x of reminders.items.filter(x=>x.days<0||x.priority>=90).slice(0,4))attention.push({key:`reminder:${x.key}`,priority:x.priority,title:x.title,detail:`${x.label} · ${x.detail}`,target:x.target||'home',mode:x.homeMode||'timeline',source:'TERMÍN'});
 for(const x of goals.items.filter(x=>x.priority>=70).slice(0,3))attention.push({key:`goal:${x.id}`,priority:x.priority,title:x.title,detail:x.reason,target:'money',mode:null,source:'CÍL'});
 if(allocation.unfundedPlan>0)attention.push({key:'unfunded-plan',priority:92,title:'Plánovaná investice přesahuje bezpečný prostor',detail:`Chybí ${round(allocation.unfundedPlan).toLocaleString('cs-CZ')} podle uloženého cashflow a rezervy.`,target:'money',mode:null,source:'PENÍZE'});
 if(allocation.cockpit?.urgent>0)attention.push({key:'ticket-risk',priority:91,title:`Urgentní ticket pozice: ${allocation.cockpit.urgent}`,detail:'Nejdřív zkontrolovat neprodanou zásobu před novým ticket kapitálem.',target:'tickets',mode:null,source:'VSTUPENKY'});
 if(inbox.total>0)attention.push({key:'personal-inbox',priority:78,title:`Personal Inbox: ${inbox.total} k prověření`,detail:'Jde o kandidáty; nic se bez potvrzení nepřepisuje do registrů.',target:'home',mode:'dashboard',source:'INBOX'});
 if(backup.status==='NO_BACKUP'||backup.status==='STALE')attention.push({key:'backup-health',priority:backup.status==='NO_BACKUP'?88:76,title:backup.label,detail:backup.ageDays===null?'Chybí evidovaný přenosný export.':`Poslední export je starý ${backup.ageDays} dní.`,target:'more',mode:'backup',source:'ZÁLOHA'});
 if(quality.high>0)attention.push({key:'data-quality',priority:74,title:`Kvalita dat: ${quality.high} důležitých mezer`,detail:'Jde jen o neúplnost již uložených dat, ne o domyšlené povinnosti.',target:'home',mode:'risk',source:'DATA'});
 const seen=new Set(),attentionSorted=attention.sort((a,b)=>b.priority-a.priority||String(a.title).localeCompare(String(b.title),'cs')).filter(x=>{if(seen.has(x.key))return false;seen.add(x.key);return true}).slice(0,8);

 const upcoming=reminders.items.filter(x=>x.days>=0&&x.days<=31).sort((a,b)=>a.days-b.days||b.priority-a.priority).slice(0,8).map(x=>({key:x.key,title:x.title,days:x.days,label:x.label,detail:x.detail,domain:x.domain,target:x.target||'home',mode:x.homeMode||'timeline'}));
 const status=attentionSorted.some(x=>x.priority>=90)?'ACTION':attentionSorted.length?'REVIEW':'CLEAR';
 return {
  period:{key:monthKey(ref),from:iso(from),toExclusive:iso(to),daysLeft},status,
  attention:attentionSorted,attentionCount:attentionSorted.length,
  progress,progressCount:progress.length,
  goalProgressByCurrency:goalProgress.byCurrency,resolvedInbox,costChanges,upcoming,
  backup,quality,inbox,goals,
  allocation:{status:allocation.status,safeBeforePlan:allocation.safeBeforePlan,unfundedPlan:allocation.unfundedPlan,cockpit:allocation.cockpit},
  note:'Měsíční review používá jen skutečně uložená data a změny. Měny ani různé periodicity nákladů se nesčítají do falešného společného součtu; nic se automaticky neplatí, nepřevádí ani neobchoduje.'
 };
}
