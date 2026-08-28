export const TICKET_PAYOUT_LEARNING_VERSION_192=279;

const n=v=>Number(v||0);
const arr=v=>Array.isArray(v)?v:[];
const median=values=>{const a=arr(values).filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const status=row=>String(row?.market_status??row?.marketStatus??row?.workflow??row?.status??'').trim().toUpperCase().replace(/[ -]+/g,'_');
const SETTLED=new Set(['PAYOUT_RECEIVED','PAID','SETTLED','COMPLETED','SOLD_PAID']);
const ACTIVE_OR_PROJECTED=new Set(['LISTED','ACTIVE','NOT_LISTED','HOLD','SOLD','SOLD_UNDELIVERED','SOLD_WAITING_PAYMENT','PAYOUT_WAIT','PENDING']);
export function ticketPayoutSettlementGate192(row={}){const st=status(row),recorded=Date.parse(row.payout_recorded_at??row.payoutRecordedAt??row.settled_at??row.settledAt??'');const explicit=SETTLED.has(st),blocked=ACTIVE_OR_PROJECTED.has(st);return{settled:explicit&&!blocked,status:st||null,recordedAt:Number.isFinite(recorded)?new Date(recorded).toISOString():null,reason:blocked?'UNSETTLED_STATUS':explicit?'SETTLED_STATUS':'UNKNOWN_STATUS'}}

export function inferTicketMarketplace192(row={}){
 const explicit=String(row.marketplace||row.sale_marketplace||row.saleMarketplace||row.market||'').trim().toLowerCase();
 if(explicit.includes('viagogo'))return'Viagogo';
 if(explicit.includes('stubhub'))return'StubHub';
 if(explicit.includes('ticketswap'))return'TicketSwap';
 const source=String(row.source_name||row.sourceName||'').toLowerCase();
 if(source.includes('viagogo'))return'Viagogo';
 if(source.includes('stubhub'))return'StubHub';
 if(source.includes('ticketswap'))return'TicketSwap';
 const vg=Boolean(row.viagogo_url||row.viagogoUrl),sh=Boolean(row.stubhub_url||row.stubhubUrl);
 if(vg&&!sh)return'Viagogo';
 if(sh&&!vg)return'StubHub';
 return'Unknown';
}

function payoutSample(row={}){
 const gate=ticketPayoutSettlementGate192(row);if(!gate.settled)return null;
 const gross=n(row.sell_total_czk??row.sellTotalCzk??row.sell_total??row.sellTotal);
 const payout=n(row.payout_received_czk??row.payoutReceivedCzk??row.actualPayoutCzk);
 const fee=n(row.marketplace_fee_czk??row.marketplaceFeeCzk);
 if(!(gross>0))return null;
 let net=0,source='';
 if(payout>0){net=payout;source='payout'}
 else if(fee>=0&&fee<gross){net=gross-fee;source='fee'}
 if(!(net>0))return null;
 const ratio=net/gross;
 if(!(ratio>0&&ratio<=1.05))return null;
 return{market:inferTicketMarketplace192(row),gross,net,ratio:clamp(ratio,0,1),feeRate:clamp(1-ratio,0,1),source,id:row.id||null,settlement:gate};
}

function summarize(samples=[]){
 const ratios=samples.map(x=>x.ratio),fees=samples.map(x=>x.feeRate);
 const ratio=median(ratios),feeRate=median(fees);
 const count=samples.length;
 return{count,ratio,feeRate,confidence:count>=8?'HIGH':count>=4?'MEDIUM':count>=2?'LOW':'VERY_LOW',grossCzk:samples.reduce((s,x)=>s+x.gross,0),netCzk:samples.reduce((s,x)=>s+x.net,0)};
}

export function buildTicketPayoutLearning192(inventory=[]){
 const source=arr(inventory),samples=source.map(payoutSample).filter(Boolean),rejected=source.length-samples.length;
 const byMarket={};
 for(const market of ['Viagogo','StubHub','TicketSwap','Unknown']){
  const group=samples.filter(x=>x.market===market);
  if(group.length)byMarket[market]=summarize(group);
 }
 const known=samples.filter(x=>x.market!=='Unknown');
 return{version:TICKET_PAYOUT_LEARNING_VERSION_192,totalSamples:samples.length,rejectedSamples:rejected,knownMarketSamples:known.length,global:summarize(samples),knownGlobal:summarize(known),byMarket,samples,settledOnly:true};
}

export function estimateTicketNet192(row={},learning,market='Viagogo'){
 const qty=Math.max(1,n(row.qty)||1),askEach=n(row.ask_each_czk??row.askEachCzk??row.listPrice),gross=askEach*qty;
 if(!(gross>0))return{ok:false,reason:'NO_ASK',market,gross:null,net:null,ratio:null,source:null,confidence:'NONE'};
 const exact=learning?.byMarket?.[market];
 let stats=null,source=null;
 if(exact?.count>=1){stats=exact;source=`${market} history`}
 else if(learning?.knownGlobal?.count>=2){stats=learning.knownGlobal;source='cross-market history'}
 else if(learning?.global?.count>=3){stats=learning.global;source='all payout history'}
 if(!stats?.ratio)return{ok:false,reason:'INSUFFICIENT_HISTORY',market,gross,net:null,ratio:null,source:null,confidence:'NONE'};
 return{ok:true,market,gross,net:Math.round(gross*stats.ratio),ratio:stats.ratio,feeRate:stats.feeRate,source,confidence:stats.confidence,samples:stats.count};
}

export function buildTicketNetDesk192(inventory=[]){
 const learning=buildTicketPayoutLearning192(inventory);
 const active=arr(inventory).filter(x=>['LISTED','NOT_LISTED'].includes(status(x)));
 const rows=active.map(row=>({
  id:row.id,name:row.event_name||row.eventName||row.name||'Vstupenka',section:row.section||'',qty:Math.max(1,n(row.qty)||1),askEach:n(row.ask_each_czk??row.askEachCzk??row.listPrice)||null,
  viagogo:estimateTicketNet192(row,learning,'Viagogo'),stubhub:estimateTicketNet192(row,learning,'StubHub')
 }));
 return{learning,rows};
}
