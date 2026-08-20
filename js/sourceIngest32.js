import {xtbPositions} from './decision24.js';
import {secRequestedFromPositions32,secTickerForPosition32,secSourceSummary32} from './secSource32.js';

const KEY='kamil-os-source-ingest-32';
const CACHE_MS=6*3600000;
let running=null,lastError=null;
const clone=v=>{try{return structuredClone(v)}catch{return JSON.parse(JSON.stringify(v??null))}};

export function readSourceIngest32(){
 try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&typeof x==='object'?x:null}catch{return null}
}
function writeSourceIngest32(value){try{localStorage.setItem(KEY,JSON.stringify(value))}catch{};return value}
export function secTickersFromState32(state={}){return secRequestedFromPositions32(xtbPositions(state),8)}
export function sourceEvidenceForPosition32(position={}){
 const ticker=secTickerForPosition32(position);if(!ticker)return [];
 const cache=readSourceIngest32();return (cache?.evidence||[]).filter(x=>x?.ticker===ticker).sort((a,b)=>Date.parse(b.asOf||0)-Date.parse(a.asOf||0));
}
export function sourceIngestStatus32(state={}){
 const cache=readSourceIngest32(),requested=secTickersFromState32(state),summary=secSourceSummary32(cache?.evidence||[],requested),at=Date.parse(cache?.fetchedAt||0),ageHours=Number.isFinite(at)?Math.max(0,(Date.now()-at)/3600000):null;
 return {...summary,fetchedAt:cache?.fetchedAt||null,ageHours,error:lastError,refreshing:!!running,fresh:ageHours!==null&&ageHours<=6,missing:cache?.missing||[],errors:cache?.errors||[]};
}
export async function refreshSecEvidence32(state={},opts={}){
 if(running)return running;
 const tickers=secTickersFromState32(state),cached=readSourceIngest32(),age=Date.now()-Date.parse(cached?.fetchedAt||0);
 if(!opts.force&&cached&&Number.isFinite(age)&&age>=0&&age<CACHE_MS)return {ok:true,cached:true,...clone(cached)};
 if(!tickers.length)return {ok:true,empty:true,evidence:[],requested:[]};
 running=(async()=>{
  try{
   const url=`/api/sec-filings?tickers=${encodeURIComponent(tickers.join(','))}`,response=await fetch(url,{headers:{Accept:'application/json'}}),json=await response.json().catch(()=>null);
   if(!response.ok||!json?.ok)throw new Error(json?.message||json?.error||`HTTP ${response.status}`);
   const payload={version:1,provider:'SEC_EDGAR',fetchedAt:json.fetchedAt||new Date().toISOString(),requested:tickers,evidence:Array.isArray(json.evidence)?json.evidence:[],missing:Array.isArray(json.missing)?json.missing:[],errors:Array.isArray(json.errors)?json.errors:[],contract:json.contract||{factsOnly:true}};
   writeSourceIngest32(payload);lastError=null;window.dispatchEvent(new CustomEvent('kamil:source-ingest',{detail:payload}));return {ok:true,...clone(payload)};
  }catch(error){lastError=String(error?.message||error);window.dispatchEvent(new CustomEvent('kamil:source-ingest',{detail:{ok:false,error:lastError}}));return {ok:false,error:lastError}}
  finally{running=null}
 })();return running;
}
export const sourceIngest32Info={provider:'SEC_EDGAR',storage:'device-local',cacheHours:6,autoTrade:false,factsOnly:true};
