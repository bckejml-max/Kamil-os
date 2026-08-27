import {buildTicketOpportunityScanner198} from './ticketOpportunityModel198.js';

export const TICKET_BUY_BLOCKER_VERSION_215=215;
const text=v=>String(v??'').trim();
const LABELS={resaleAllowed:'ověřit, že pořadatel dovoluje resale',transferCompatible:'ověřit způsob a kompatibilitu transferu',officialSaleStatus:'ověřit stav oficiálního prodeje',restrictionsVerifiedAt:'uložit datum posledního ověření omezení'};

export function ticketBuyBlocker215(row={}){
 const action=text(row.action).toUpperCase();
 const compliance=row.compliance||{};
 const finance=row.buyFinance||{};
 const missing=(compliance.missing||[]).map(x=>({key:x,label:LABELS[x]||x}));
 let state='READY',title='BUY je odemčený',reason='Compliance i payout podmínky jsou splněné.',next='Použij net-safe max BUY a portfolio risk limity.';
 if(action==='VERIFY'){
  state='VERIFY';title='Nejdřív ověř pravidla prodeje';
  reason=missing.length?`Chybí ${missing.map(x=>x.label).join(', ')}.`:'Resale nebo transfer způsobilost není dostatečně ověřená.';
  next=missing[0]?.label||'Ověř resale a transfer podmínky u pořadatele a marketplace.';
 }else if(action==='BLOCK'){
  state='BLOCK';title='BUY je zablokovaný';
  const why=[];
  if(compliance.resaleAllowed===false)why.push('resale není povolený');
  if(compliance.transferCompatible===false)why.push('transfer není kompatibilní');
  if(compliance.officialSaleStatus&&['CLOSED','CANCELLED','CANCELED','SUSPENDED','BLOCKED','OFF_SALE'].includes(compliance.officialSaleStatus))why.push(`official sale: ${compliance.officialSaleStatus}`);
  reason=why.length?why.join(' · '):'Některá explicitní podmínka BUY není splněná.';
  next='Nenakupovat, dokud se podmínka legitimně nezmění a není znovu ověřená.';
 }else if(action==='DATA NEEDED'){
  state='DATA NEEDED';title='Chybí payout data pro bezpečný BUY';
  const market=finance.market||'marketplace';
  const samples=Number(finance.samples||0)||0;
  reason=`Pro ${market} není dost ověřené payout historie pro net-safe cenu${samples?` (${samples} vzorek/vzorky)`:''}.`;
  next='Doplnit skutečně dokončené prodeje s payoutem; nepoužívat hrubý spread jako bezpečnou nákupní cenu.';
 }else if(action!=='BUY'){
  state=action||'WATCH';title='BUY teď není kandidát';reason=`Opportunity akce je ${action||'WATCH'}.`;next='Pouze sledovat; neměnit na BUY bez splnění safety podmínek.';
 }
 return {id:row.id||'',name:row.name||row.event_name||'Ticket',score:Number(row.score||0)||0,state,title,reason,next,missing,market:finance.market||null,payoutSamples:Number(finance.samples||0)||0,netSafeMaxBuyPrice:row.netSafeMaxBuyPrice??row.maxBuyPrice??null,grossSpreadCeiling:row.grossSpreadCeiling??null,sourceAction:action||null};
}

export function buildTicketBuyBlocker215(input={},now=Date.now()){
 const scanner=buildTicketOpportunityScanner198(input,now);
 const rows=(scanner.rows||[]).map(ticketBuyBlocker215).filter(x=>['VERIFY','BLOCK','DATA NEEDED'].includes(x.state)).sort((a,b)=>{
  const p={BLOCK:3,VERIFY:2,'DATA NEEDED':1};return (p[b.state]||0)-(p[a.state]||0)||b.score-a.score;
 });
 return {version:TICKET_BUY_BLOCKER_VERSION_215,scanner,rows,summary:{blocked:rows.filter(x=>x.state==='BLOCK').length,verify:rows.filter(x=>x.state==='VERIFY').length,dataNeeded:rows.filter(x=>x.state==='DATA NEEDED').length,total:rows.length}};
}
