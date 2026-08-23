import assert from 'node:assert/strict';
import handler from './api/ticket-market-watch.js';
const realFetch=globalThis.fetch;
globalThis.fetch=async(url)=>{
 const s=String(url);
 if(s.startsWith('https://api.frankfurter.app/'))return new Response(JSON.stringify({rates:{CZK:21.5}}),{status:200,headers:{'content-type':'application/json'}});
 if(s.includes('/search?')||s.includes('/cz/search?'))return new Response(`<html><body><a href="/ww/E-2">Synthetic Discovery Event tickets</a></body></html>`,{status:200,headers:{'content-type':'text/html'}});
 if(s.includes('/E-2'))return new Response(`<html><body><h1>Synthetic Discovery Event 2026</h1><div>Section A2 $150</div><div>Section A2 $170</div><div>20 listings</div></body></html>`,{status:200,headers:{'content-type':'text/html'}});
 if(s.includes('viagogo.com'))return new Response(`<html><body><h1>Test Event 2026</h1><div>Only 2% of tickets left</div><div>Section 405 Row 13 $180</div><div>Section 405 Row 14 $190</div><div>Section 405 Row 15 $220</div><div>Section 101 Row 9 $240</div><div>Showing 4 of 25</div></body></html>`,{status:200,headers:{'content-type':'text/html'}});
 throw new Error('unexpected fetch '+s);
};
const req={method:'POST',url:'https://kamil-os.test/api/ticket-market-watch',json:async()=>({items:[
 {id:'x',label:'Test Event - 405',event:'Test Event',date:'2026-09-19',section:'405',qty:3,buyEachCzk:1800,status:'NOT_LISTED',viagogoUrl:'https://www.viagogo.com/ww/E-1'},
 {id:'y',label:'Synthetic Discovery Event - A2',event:'Synthetic Discovery Event',date:'2026-10-04',section:'A2',qty:2,buyEachCzk:2000,status:'NOT_LISTED'}
]})};
let status=0,payload=null,headers={};const res={setHeader:(k,v)=>headers[k]=v,status:n=>(status=n,{json:j=>payload=j})};
await handler(req,res);globalThis.fetch=realFetch;
assert.equal(status,200);assert.equal(payload.ok,true);assert.equal(payload.version,'66.0');assert.equal(payload.results.length,2);
const x=payload.results.find(r=>r.id==='x');assert.equal(x.market.confidence,'section');assert.equal(x.market.marketPriceCzk,3870);assert.equal(x.market.medianPriceCzk,4085);assert.deepEqual(x.market.topPricesCzk,[3870,4085,4730]);assert.equal(x.market.competitorCount,25);assert.equal(x.market.sameSectionCount,3);assert.equal(x.market.supplyPct,2);assert.equal(x.recommendation.label,'VYSTAVIT');assert.ok(x.recommendation.recommendedAskCzk>0);assert.ok(Number.isFinite(x.recommendation.projectedGrossRoi));
const y=payload.results.find(r=>r.id==='y');assert.equal(y.market.discovered,true);assert.match(y.market.resolvedUrl,/E-2/);assert.equal(y.source.status,'ok');
assert.equal(headers['Cache-Control'],'no-store');
console.log('KAMIL OS 66.0 TICKET INTELLIGENCE API PASS');
