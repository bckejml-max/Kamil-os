globalThis.localStorage={_d:new Map(),getItem(k){return this._d.has(k)?this._d.get(k):null},setItem(k,v){this._d.set(k,String(v))},removeItem(k){this._d.delete(k)}};
globalThis.document={querySelector(){return null},querySelectorAll(){return []}};
globalThis.window={dispatchEvent(){},addEventListener(){}};
globalThis.CustomEvent=class{constructor(type,opts){this.type=type;this.detail=opts?.detail}};

const {migrate}=await import('./js/state.js');
const {ticketEventGroups,ticketEventName,ticketEventStats}=await import('./js/ticketEvents25.js');
const assert=(x,m)=>{if(!x)throw new Error(m)};

const s=migrate({ticketBook:{items:[
 {id:'a',name:'Clash 17 - A2-5-13,14,15',date:'2026-10-24',qty:3,buy:3723,workflow:'HOLD',listPrice:1800},
 {id:'b',name:'Clash 17 - A3-8-20,21,22',date:'2026-10-24',qty:3,buy:3723,workflow:'LISTED',listPrice:1900},
 {id:'c',name:'ASAP - 415',date:'2026-10-04',qty:2,buy:5312,workflow:'SOLD',sell:7000,fees:300},
 {id:'d',name:'ASAP - 416',date:'2026-10-04',qty:2,buy:5076,workflow:'HOLD'}
]}});

assert(ticketEventName(s.ticketBook.items[0])==='Clash 17','seat suffix normalization');
const groups=ticketEventGroups(s);
assert(groups.length===2,'positions should aggregate into two events');
const clash=groups.find(g=>g.name==='Clash 17');
assert(clash.items.length===2&&clash.activeQty===6,'Clash positions aggregate');
assert(clash.capitalAtRisk===7446,'capital at risk aggregates');
assert(clash.projectedRevenue===11100,'only real listing prices are projected');
const asap=groups.find(g=>g.name==='ASAP');
assert(asap.soldQty===2&&asap.activeQty===2,'sold and open quantities separated');
assert(asap.realizedProfit===1388,'realized event profit uses sold item only');
assert(asap.projectedRevenue===null,'missing listing price must not be invented');
const stats=ticketEventStats(groups);
assert(stats.activeEvents===2&&stats.activeQty===8,'portfolio event stats');
console.log('TICKET EVENT AGGREGATION TEST PASS');
