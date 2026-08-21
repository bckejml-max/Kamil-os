await import('./release_gate_32_5.mjs');
const now=new Date(),day=86400000,iso=x=>new Date(x).toISOString().slice(0,10),fresh=now.toISOString(),assert=(x,m)=>{if(!x)throw new Error(m)};
const {ticketMarketPlan32,ticketEventMarketIntel32,ticketMarketIntel32Contract}=await import('./js/ticketMarketIntel32.js');
const base={name:'Gate Event - A',date:iso(now.getTime()+20*day),workflow:'LISTED',qty:2,buy:2000,buy1:1000,listPrice:2000,marketPrice:1500,marketCheckedAt:fresh,marketSourceUrl:'https://example.com/market',floorPrice:1100,transferStatus:'READY',sellBy:iso(now.getTime()+10*day)};
let plan=ticketMarketPlan32({id:'fresh',...base},{ticketBook:{items:[],history:[]}},now);assert(plan.action==='REPRICE'&&plan.suggestedPricePerTicket>=1100&&plan.suggestedPricePerTicket<2000,'fresh repricing gate failed');
plan=ticketMarketPlan32({id:'stale',...base,marketCheckedAt:new Date(now.getTime()-200*3600000).toISOString()},{ticketBook:{items:[],history:[]}},now);assert(plan.action==='CHECK_MARKET'&&plan.suggestedPricePerTicket===null&&plan.ladder.length===0,'stale price firewall failed');
const state={ticketBook:{items:[{id:'a',...base},{id:'b',...base,name:'Gate Event - B',workflow:'HOLD',listPrice:0}],history:[]}},events=ticketEventMarketIntel32(state,now);assert(events.totalEvents===1&&events.events[0].qty===4,'event aggregation gate failed');
assert(!ticketMarketIntel32Contract.autoPrice&&!ticketMarketIntel32Contract.autoSell&&ticketMarketIntel32Contract.requiresFreshMarketForPrice&&!ticketMarketIntel32Contract.staleMarketCanDrivePrice,'ticket market contract failed');
console.log('KAMIL OS 32.6 RELEASE GATE PASS');
