import assert from 'node:assert/strict';
import handler from './api/ticket-market-watch.js';
const realFetch=globalThis.fetch;
globalThis.fetch=async(url)=>{
 const s=String(url);
 if(s.startsWith('https://api.frankfurter.app/'))return new Response(JSON.stringify({rates:{CZK:21.5}}),{status:200,headers:{'content-type':'application/json'}});
 if(s.includes('viagogo.com'))return new Response(`<html><body><h1>Test Event</h1><div>Only 2% of tickets left</div><div>Section 405 Row 13 3 tickets together $180 incl. fees</div><div>Section 101 Row 9 2 tickets together $240 incl. fees</div><div>Showing 2 of 25</div></body></html>`,{status:200,headers:{'content-type':'text/html'}});
 throw new Error('unexpected fetch '+s);
};
const req={method:'POST',url:'https://kamil-os.test/api/ticket-market-watch',json:async()=>({items:[{id:'x',label:'Synthetic Event - 405',section:'405',qty:3,buyEachCzk:1800,status:'NOT_LISTED',viagogoUrl:'https://www.viagogo.com/ww/E-1'}]})};
let status=0,payload=null,headers={};const res={setHeader:(k,v)=>headers[k]=v,status:n=>(status=n,{json:j=>payload=j})};
await handler(req,res);globalThis.fetch=realFetch;
assert.equal(status,200);assert.equal(payload.ok,true);assert.equal(payload.results.length,1);assert.equal(payload.results[0].market.confidence,'section');assert.equal(payload.results[0].market.price,180);assert.equal(payload.results[0].market.priceCzk,3870);assert.equal(payload.results[0].market.supplyPct,2);assert.equal(payload.results[0].recommendation.label,'VYSTAVIT');assert.equal(headers['Cache-Control'],'no-store');
console.log('KAMIL OS 65.6 TICKET MARKET API PASS');
