import {canonicalChanceLeague} from '../lib/chance-football-data-model.js';
import {footballDataLeague} from '../lib/football-data-poisson.js';

const PULSE_BASE='https://api.pulsescore.net/api/chance';
const PAGE_LIMIT=30;
const BATCH_SIZE=6;

function json(res,status,body,cache=false){
 res.statusCode=status;
 res.setHeader('content-type','application/json; charset=utf-8');
 res.setHeader('cache-control',cache?'public, s-maxage=300, stale-while-revalidate=600':'no-store');
 res.end(JSON.stringify(body));
}

function clampInt(value,fallback,min,max){
 const n=Number.parseInt(String(value??''),10);
 return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
}

function sourceEvents(payload){
 return Array.isArray(payload)?payload:Array.isArray(payload?.events)?payload.events:Array.isArray(payload?.data)?payload.data:[];
}

function supportedLeague(value){
 const canonical=canonicalChanceLeague(value);
 return footballDataLeague(canonical);
}

async function fetchPage(page,key){
 const target=`${PULSE_BASE}/soccer/events?page=${page}&limit=${PAGE_LIMIT}`;
 const response=await fetch(target,{headers:{'X-Secret':key,'Accept':'application/json'}});
 const text=await response.text();
 let payload;
 try{payload=JSON.parse(text)}catch{payload={}}
 if(!response.ok)throw new Error(`PULSESCORE_${response.status}`);
 return {page,payload,events:sourceEvents(payload)};
}

function summarizePage(item,now,until){
 const leagues=new Set();
 let supportedEvents=0;
 for(const event of item.events){
  const ts=Date.parse(event?.startTime??event?.startsAt??event?.start??'');
  if(!Number.isFinite(ts)||ts<=now||ts>until)continue;
  const leagueName=event?.league??event?.competition??event?.tournament??'';
  const league=supportedLeague(leagueName);
  if(!league)continue;
  supportedEvents+=1;
  leagues.add(`${league.code}:${league.name}`);
 }
 return {page:item.page,supportedEvents,leagues:[...leagues].sort()};
}

export default async function handler(req,res){
 if(req.method!=='GET')return json(res,405,{ok:false,error:'METHOD_NOT_ALLOWED'});
 const key=process.env.PULSESCORE_API_KEY;
 if(!key)return json(res,503,{ok:false,error:'PULSESCORE_NOT_CONFIGURED'});
 const url=new URL(String(req.url||'/api/chance-model-pages'),'https://kamil-os-smoke.vercel.app');
 const days=clampInt(url.searchParams.get('days'),5,1,14);
 const maxPages=clampInt(url.searchParams.get('maxPages'),40,1,60);
 const now=Date.now();
 const until=now+days*86400000;
 try{
  const first=await fetchPage(1,key);
  const totalPages=Math.min(maxPages,clampInt(first.payload?.totalPages,1,1,maxPages));
  const items=[first];
  for(let start=2;start<=totalPages;start+=BATCH_SIZE){
   const pages=[];
   for(let page=start;page<Math.min(start+BATCH_SIZE,totalPages+1);page+=1)pages.push(page);
   const batch=await Promise.all(pages.map(page=>fetchPage(page,key)));
   items.push(...batch);
  }
  const summaries=items.map(item=>summarizePage(item,now,until)).filter(item=>item.supportedEvents>0).sort((a,b)=>a.page-b.page);
  return json(res,200,{
   ok:true,
   provider:'pulsescore',
   bookmaker:'chance',
   sport:'soccer',
   days,
   fetchedAt:new Date().toISOString(),
   totalPages:Number(first.payload?.totalPages||totalPages),
   scannedPages:items.length,
   relevantPages:summaries.length,
   pages:summaries
  },true);
 }catch(error){
  return json(res,502,{ok:false,error:'CHANCE_PAGE_DISCOVERY_FAILED',message:String(error?.message||error)});
 }
}
