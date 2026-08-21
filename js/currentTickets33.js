import {store} from './state.js';
import {uid} from './utils.js';

const SNAPSHOT='tickets-2026-08-21';
const CLOSED=new Set(['SOLD','PAYOUT WAIT','PAYOUT RECEIVED']);
const norm=v=>String(v||'').toLocaleLowerCase('cs-CZ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();

const CURRENT=[
 {sourceRow:85,match:['asap','415'],eventName:'ASAP Rocky · Praha',name:'ASAP Rocky · sektor 415',qty:2,buy:5312,date:'2026-10-04',platform:'Viagogo',workflow:'LISTED',listPrice:3499,listedQty:2,section:'415',viagogoRecommended:2220,listingPremiumPct:57},
 {sourceRow:86,match:['asap','416'],eventName:'ASAP Rocky · Praha',name:'ASAP Rocky · sektor 416',qty:2,buy:5076,date:'2026-10-04',platform:'Viagogo',workflow:'LISTED',listPrice:3499,listedQty:2,section:'416',viagogoRecommended:2220,listingPremiumPct:57},
 {sourceRow:87,match:['clash','a3','8'],eventName:'Clash 17',name:'Clash 17 · A3-8 · místa 20–22',qty:3,buy:3723,date:'2026-10-24',platform:'',workflow:'HOLD',listPrice:0,section:'A3-8'},
 {sourceRow:88,match:['clash','a2','3','1'],eventName:'Clash 17',name:'Clash 17 · A2-3 · místo 1',qty:1,buy:1241,date:'2026-10-24',platform:'',workflow:'HOLD',listPrice:0,section:'A2-3'},
 {sourceRow:89,match:['clash','a2','5','13'],eventName:'Clash 17',name:'Clash 17 · A2-5 · místa 13–15',qty:3,buy:3723,date:'2026-10-24',platform:'',workflow:'HOLD',listPrice:0,section:'A2-5'},
 {sourceRow:90,match:['clash','a2','5','18'],eventName:'Clash 17',name:'Clash 17 · A2-5 · místa 18–22',qty:5,buy:6205,date:'2026-10-24',platform:'',workflow:'HOLD',listPrice:0,section:'A2-5'},
 {sourceRow:91,match:['sparta','slavia','h10'],eventName:'Sparta Praha vs SK Slavia Praha',name:'Sparta Praha vs SK Slavia Praha · H10',qty:1,buy:960,date:'2026-08-30',platform:'Viagogo',workflow:'LISTED',listPrice:4999,listedQty:2,section:'H10',viagogoRecommended:2790,listingPremiumPct:79,inventoryWarning:'Excel eviduje 1 ks, aktivní nabídka na Viagogo ukazuje 2 ks.'},
 {sourceRow:92,match:['iheartradio'],eventName:'iHeartRadio Music Festival · Friday Pass',name:'iHeartRadio Music Festival · Friday Pass',qty:2,buy:5506,date:'2026-09-18',platform:'Viagogo',workflow:'LISTED',listPrice:4190,listedQty:2,section:'322',row:'F',inventorySection:'220',viagogoRecommended:2220,listingPremiumPct:89,inventoryWarning:'Excel má označení 220, aktivní nabídka na Viagogo ukazuje Section 322 / Row F.'},
 {sourceRow:93,match:['cesko','anglie','115'],eventName:'Česko vs Anglie',name:'Česko vs Anglie · 115',qty:4,buy:7516,date:'2026-09-29',platform:'',workflow:'HOLD',listPrice:0,section:'115'},
 {sourceRow:94,match:['cesko','spanelsko','c11'],eventName:'Česko vs Španělsko',name:'Česko vs Španělsko · C11',qty:4,buy:7516,date:'2026-11-12',platform:'',workflow:'HOLD',listPrice:0,section:'C11'},
 {sourceRow:95,match:['cesko','chorvatsko','115'],eventName:'Česko vs Chorvatsko',name:'Česko vs Chorvatsko · 115',qty:4,buy:7516,date:'2026-09-26',platform:'',workflow:'HOLD',listPrice:0,section:'115'},
 {sourceRow:96,match:['sparta','slavia','e4'],eventName:'Sparta Praha vs SK Slavia Praha',name:'Sparta Praha vs SK Slavia Praha · E4',qty:2,buy:2400,date:'2026-08-30',platform:'Viagogo',workflow:'LISTED',listPrice:3499,listedQty:2,section:'E4',viagogoRecommended:1485,listingPremiumPct:136}
];

function findExisting(items,seed){
 const direct=items.find(x=>x.snapshotSourceRow===seed.sourceRow&&x.snapshotTag===SNAPSHOT);
 if(direct)return direct;
 return items.find(x=>{
  const hay=norm(`${x.name||''} ${x.eventName||''} ${x.section||''} ${x.inventorySection||''}`);
  return seed.match.every(term=>hay.includes(norm(term)));
 });
}

function applySeed(target,seed){
 const wasClosed=CLOSED.has(String(target.workflow||'').toUpperCase());
 const extra={snapshotTag:SNAPSHOT,snapshotSource:'Excel · Flipování 2026',snapshotSourceRow:seed.sourceRow,snapshotAt:'2026-08-21',eventName:seed.eventName,name:seed.name,qty:seed.qty,buy:seed.buy,date:seed.date,section:seed.section||null,row:seed.row||null,inventorySection:seed.inventorySection||null,inventoryWarning:seed.inventoryWarning||null};
 Object.assign(target,extra);
 if(seed.platform)target.platform=seed.platform;else if(!target.platform)target.platform='';
 if(!wasClosed){target.workflow=seed.workflow;target.listPrice=Number(seed.listPrice||0);target.listedQty=seed.listedQty??null;target.listingSource=seed.workflow==='LISTED'?'Viagogo':null;target.listingSnapshotAt=seed.workflow==='LISTED'?'2026-08-21':null;target.viagogoRecommended=seed.viagogoRecommended??null;target.listingPremiumPct=seed.listingPremiumPct??null}
}

export function ticketSnapshotStatus33(state=store.get()){
 const items=Array.isArray(state?.ticketBook?.items)?state.ticketBook.items:[];
 const matched=CURRENT.filter(seed=>findExisting(items,seed)).length;
 return {snapshot:SNAPSHOT,total:CURRENT.length,matched,missing:Math.max(0,CURRENT.length-matched),ready:state?.meta?.currentTicketSnapshot===SNAPSHOT&&matched===CURRENT.length};
}

export function ensureCurrentTicketSnapshot33(){
 const before=ticketSnapshotStatus33(store.get());
 if(before.ready)return false;
 store.mutate('Načten aktuální snapshot vstupenek',s=>{
  s.meta=s.meta||{};
  s.ticketBook=s.ticketBook||{items:[],watchlist:[],history:[],review:[]};
  s.ticketBook.items=Array.isArray(s.ticketBook.items)?s.ticketBook.items:[];
  for(const seed of CURRENT){let item=findExisting(s.ticketBook.items,seed);if(!item){item={id:uid('ticket'),createdAt:new Date().toISOString()};s.ticketBook.items.push(item)}applySeed(item,seed)}
  s.meta.currentTicketSnapshot=SNAPSHOT;
  s.meta.currentTicketSnapshotAt=new Date().toISOString();
 });
 return true;
}

export const currentTicketSnapshot33Info={snapshot:SNAPSHOT,total:CURRENT.length,source:'Excel · Flipování 2026 + Viagogo snapshot 21. 8. 2026',policy:'read-only import until explicit ensureCurrentTicketSnapshot33()'};
