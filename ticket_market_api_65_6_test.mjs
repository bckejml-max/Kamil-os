import assert from 'node:assert/strict';
import handler from './api/ticket-market-watch.js';
const realFetch=globalThis.fetch;
globalThis.fetch=async(url)=>{
 const s=String(url);
 if(s.startsWith('https://api.frankfurter.app/'))return new Response(JSON.stringify({rates:{CZK:21.5}}),{status:200,headers:{'content-type':'application/json'}});
 if(s.includes('viagogo.com'))return new Response(`<html><body><h1>Test Event 2026</h1><div>Only 2% of tickets left</div><div>Section 405 Row 13 $180</div><div>Section 405 Row 14 $190</div><div>Section 405 Row 15 $220</div><div>Section 101 Row 9 $240</div><div>Showing 4 of 25</div></body></html>`,{status:200,headers:{'content-type':'text/html'}});
 throw new Error('unexpected fetch '+s);
};
const req={method:'POST',url:'https://kamil-os.test/api/ticket-market-watch',body:{items:[
 {id:'x',label:'Test Event - 405',event:'Test Event',date:'2026-09-19',section:'405',qty:3,buyEachCzk:1800,status:'NOT_LISTED',viagogoUrl:'https://www.viagogo.com/ww/E-1'},
 {id:'y',label:'Missing URL Event',event:'Missing URL Event',date:'2026-10-04',section:'A2',qty:2,buyEachCzk:2000,status:'NOT_LISTED'}
]}};
let status=0,payload=null,headers={};const res={setHeader:(k,v)=>headers[k]=v,status:n=>(status=n,{json:j=>payload=j})};
await handler(req,res);globalThis.fetch=realFetch;
assert.equal(status,200);assert.equal(payload.ok,true);assert.match(String(payload.version||''),/^\d+\.\d+$/,'API must expose a numeric major.minor contract version');assert.ok(Number(String(payload.version).split('.')[0])>=379,'ticket market API must not regress below row+quantity-aware v379');assert.equal(payload.results.length,2);
const x=payload.results.find(r=>r.id==='x');assert.equal(x.source.status,'ok');assert.ok(x.market,'valid Viagogo URL must produce market model');assert.equal(x.market.parser,'379-row-qty');assert.equal(x.market.quantityRequired,3);assert.equal(x.market.quantityMatched,false);assert.ok(Array.isArray(x.market.topPricesCzk)&&x.market.topPricesCzk.includes(3870));assert.equal(x.recommendation.code,'VERIFY_DATA');assert.match(x.recommendation.label,/OVĚŘIT/);
const y=payload.results.find(r=>r.id==='y');assert.equal(y.source.status,'missing');assert.equal(y.market,null);assert.equal(y.recommendation.code,'VERIFY_DATA');
assert.equal(payload.summary.total,2);assert.equal(payload.summary.sourcesOk,1);assert.equal(payload.summary.sourcesMissing,1);assert.equal(headers['Cache-Control'],'no-store');
console.log(`TICKET MARKET API CONTRACT PASS · ${payload.version}`);
