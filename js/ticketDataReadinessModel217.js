import {buildTicketBuyBlocker215} from './ticketBuyBlockerModel215.js';

export const TICKET_DATA_READINESS_VERSION_217=217;
const text=v=>String(v??'').trim();
const labelFor=(key,market='')=>{
 const labels={
  resaleAllowed:'Ověřit, zda je resale povolený',
  transferCompatible:'Ověřit kompatibilitu transferu',
  officialSaleStatus:'Ověřit stav oficiálního prodeje',
  restrictionsVerifiedAt:'Uložit datum ověření omezení'
 };
 if(key==='payoutHistory')return `Doplnit skutečný payout${market?` · ${market}`:''}`;
 if(key==='explicitBlock')return 'Prověřit explicitní zákaz / blokaci';
 return labels[key]||key;
};
const priorityFor=(type,count,maxScore)=>{
 const base=type==='explicitBlock'?95:type==='resaleAllowed'?88:type==='transferCompatible'?86:type==='officialSaleStatus'?82:type==='payoutHistory'?78:type==='restrictionsVerifiedAt'?72:60;
 return Math.min(100,Math.round(base+Math.min(8,Math.max(0,count-1)*2)+Math.min(5,Math.max(0,maxScore-70)/6)));
};

export function ticketDataReadiness217(blockerDesk={}){
 const groups=new Map();
 const add=(key,market,row)=>{
  const id=`${key}:${text(market).toUpperCase()}`;
  if(!groups.has(id))groups.set(id,{id,key,market:market||null,label:labelFor(key,market),events:[],count:0,maxScore:0,states:new Set()});
  const g=groups.get(id);g.count+=1;g.maxScore=Math.max(g.maxScore,Number(row.score||0)||0);g.states.add(row.state);g.events.push({id:row.id,name:row.name,score:Number(row.score||0)||0,state:row.state});
 };
 for(const row of blockerDesk.rows||[]){
  if(row.state==='VERIFY'){
   if(row.missing?.length){for(const m of row.missing)add(m.key,null,row)}
   else add('resaleAllowed',null,row);
  }else if(row.state==='DATA NEEDED')add('payoutHistory',row.market||'marketplace',row);
  else if(row.state==='BLOCK')add('explicitBlock',null,row);
 }
 const rows=[...groups.values()].map(g=>{
  const events=[...new Map(g.events.map(e=>[e.id||e.name,e])).values()].sort((a,b)=>b.score-a.score);
  const priority=priorityFor(g.key,events.length,g.maxScore);
  const unlockable=events.filter(e=>e.state!=='BLOCK').length;
  const next=g.key==='payoutHistory'?'Doplň dokončené prodeje se skutečným payoutem; pak znovu přepočítej net-safe BUY.':g.key==='explicitBlock'?'Neobcházet blokaci; pouze znovu ověřit, pokud se legitimně změnily podmínky.':'Ověř u pořadatele / marketplace a ulož výsledek do kandidáta.';
  return {id:g.id,key:g.key,market:g.market,label:g.label,count:events.length,unlockable,maxScore:g.maxScore,priority,states:[...g.states],events,next};
 }).sort((a,b)=>b.priority-a.priority||b.unlockable-a.unlockable||b.maxScore-a.maxScore);
 const impacted=new Set(rows.flatMap(r=>r.events.map(e=>e.id||e.name)));
 const actionable=rows.filter(r=>r.key!=='explicitBlock');
 return {version:TICKET_DATA_READINESS_VERSION_217,rows,summary:{tasks:rows.length,actionable:actionable.length,blocked:rows.filter(r=>r.key==='explicitBlock').length,events:impacted.size,potentialUnlocks:actionable.reduce((s,r)=>s+r.unlockable,0)},top:rows[0]||null};
}

export function buildTicketDataReadiness217(input={},now=Date.now()){
 const blockers=buildTicketBuyBlocker215(input,now);
 return {...ticketDataReadiness217(blockers),blockers};
}
