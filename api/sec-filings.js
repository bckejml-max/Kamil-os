import {SEC_SOURCE_32,secRequestedTickers32,secTickerIndex32,secMaterialEvidence32} from '../js/secSource32.js';

const USER_AGENT='KamilOS/32.4 (+https://kamil-os-smoke.vercel.app/)';
const TICKER_CACHE_MS=6*3600000;
let tickerCache={at:0,index:null};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function getJson(url){
 const response=await fetch(url,{headers:{'User-Agent':USER_AGENT,'Accept':'application/json'}});
 if(!response.ok)throw new Error(`SEC ${response.status}`);
 return response.json();
}
async function tickerIndex(){
 if(tickerCache.index&&Date.now()-tickerCache.at<TICKER_CACHE_MS)return tickerCache.index;
 const json=await getJson(SEC_SOURCE_32.tickerMapUrl),index=secTickerIndex32(json);tickerCache={at:Date.now(),index};return index;
}
function requested(req){
 const raw=req.query?.tickers??req.query?.ticker??'';
 const values=Array.isArray(raw)?raw:String(raw).split(',');
 return secRequestedTickers32(values,SEC_SOURCE_32.maxTickers);
}

export default async function handler(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('Cache-Control','public, s-maxage=900, stale-while-revalidate=3600');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'})}
 const tickers=requested(req);if(!tickers.length)return res.status(400).json({ok:false,error:'NO_TICKERS'});
 try{
  const index=await tickerIndex(),evidence=[],missing=[],errors=[];
  for(let i=0;i<tickers.length;i++){
   const ticker=tickers[i],meta=index.get(ticker);
   if(!meta){missing.push(ticker);continue}
   try{
    const submissions=await getJson(`${SEC_SOURCE_32.submissionsBase}/CIK${meta.cik10}.json`);
    evidence.push(...secMaterialEvidence32(submissions,ticker));
   }catch(error){errors.push({ticker,error:String(error?.message||error).slice(0,80)})}
   if(i<tickers.length-1)await sleep(125);
  }
  const fetchedAt=new Date().toISOString();
  return res.status(200).json({ok:true,provider:SEC_SOURCE_32.provider,fetchedAt,requested:tickers,evidence,missing,errors,contract:{factsOnly:true,investmentAction:false,sourceAuthenticityConfidence:true}});
 }catch(error){return res.status(502).json({ok:false,error:'SEC_UPSTREAM',message:String(error?.message||error).slice(0,120)})}
}
