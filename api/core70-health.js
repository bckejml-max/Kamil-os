const PULSE_BASE='https://api.pulsescore.net/api/chance';
function json(res,status,body){res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.setHeader('cache-control','no-store');res.end(JSON.stringify(body))}
function requestUrl(req){return new URL(String(req.url||'/api/core70-health'),'https://kamil-os-smoke.vercel.app')}
function cleanSport(value){const sport=String(value||'soccer').trim().toLowerCase();return /^[a-z0-9-]+$/.test(sport)?sport:'soccer'}
function clampInt(value,fallback,min,max){const n=Number.parseInt(String(value??''),10);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback}
function priceOf(selection){for(const key of ['decimal','odds','price']){const n=Number(selection?.[key]);if(Number.isFinite(n)&&n>1)return n}return null}
function normalizeEvents(payload){
 const source=Array.isArray(payload)?payload:Array.isArray(payload?.events)?payload.events:Array.isArray(payload?.data)?payload.data:[];
 return source.map(event=>({
  id:event?.id??event?.eventId??null,
  home:event?.home??event?.homeTeam??event?.competitors?.[0]?.name??null,
  away:event?.away??event?.awayTeam??event?.competitors?.[1]?.name??null,
  league:event?.league??event?.competition??event?.tournament??null,
  startTime:event?.startTime??event?.startsAt??event?.start??null,
  raw:event,
  markets:(Array.isArray(event?.markets)?event.markets:[]).map(market=>({
   name:market?.canonicalMarket??market?.name??market?.rawName??market?.marketName??null,
   period:market?.period??null,
   raw:market,
   selections:(Array.isArray(market?.selections)?market.selections:[]).map(selection=>({
    name:selection?.name??selection?.label??selection?.outcome??null,
    line:selection?.line??selection?.handicap??null,
    price:priceOf(selection),
    raw:selection
   })).filter(selection=>selection.price)
  })).filter(market=>market.selections.length)
 })).filter(event=>event.markets.length)
}
async function chanceProxy(req,res,url){
 const key=process.env.PULSESCORE_API_KEY;
 if(!key)return json(res,503,{ok:false,error:'PULSESCORE_NOT_CONFIGURED'});
 const sport=cleanSport(url.searchParams.get('sport'));
 const mode=String(url.searchParams.get('mode')||'prematch').toLowerCase();
 const page=clampInt(url.searchParams.get('page'),1,1,10000);
 const limit=clampInt(url.searchParams.get('limit'),100,1,100);
 const target=mode==='live'
  ?`${PULSE_BASE}/live-events?sport=${encodeURIComponent(sport)}`
  :`${PULSE_BASE}/${encodeURIComponent(sport)}/events?page=${page}&limit=${limit}`;
 try{
  const upstream=await fetch(target,{headers:{'X-Secret':key,'Accept':'application/json'}});
  const text=await upstream.text();let payload;try{payload=JSON.parse(text)}catch{payload={raw:text.slice(0,4000)}}
  if(!upstream.ok)return json(res,upstream.status,{ok:false,error:'PULSESCORE_UPSTREAM_ERROR',status:upstream.status,target,details:payload});
  const events=normalizeEvents(payload);
  return json(res,200,{ok:true,provider:'pulsescore',bookmaker:'chance',sport,mode,target,fetchedAt:new Date().toISOString(),payloadShape:Array.isArray(payload)?'array':Object.keys(payload||{}),rawCount:Array.isArray(payload)?payload.length:Array.isArray(payload?.events)?payload.events.length:Array.isArray(payload?.data)?payload.data.length:null,eventCount:events.length,events});
 }catch(error){return json(res,502,{ok:false,error:'PULSESCORE_FETCH_FAILED',message:String(error?.message||error)})}
}
export default async function handler(req,res){
 if(req.method!=='GET')return json(res,405,{ok:false,error:'METHOD_NOT_ALLOWED'});
 const url=requestUrl(req);
 if(String(url.searchParams.get('source')||'').toLowerCase()==='chance')return chanceProxy(req,res,url);
 const viagogo=!!(process.env.VIAGOGO_CLIENT_ID&&process.env.VIAGOGO_CLIENT_SECRET);
 const gmail=!!(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.GOOGLE_REFRESH_TOKEN);
 const pulsescore=!!process.env.PULSESCORE_API_KEY;
 return json(res,200,{ok:true,version:'70.3-health',checks:{runtime_endpoint:true,viagogo_api:viagogo,gmail_api:gmail,pulsescore_api:pulsescore}})
}
