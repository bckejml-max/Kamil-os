const PULSE_BASE='https://api.pulsescore.net/api/chance';
function json(res,status,body){res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.setHeader('cache-control','no-store');res.end(JSON.stringify(body))}
function requestUrl(req){return new URL(String(req.url||'/api/core70-health'),'https://kamil-os-smoke.vercel.app')}
function cleanSport(value){const sport=String(value||'soccer').trim().toLowerCase();return /^[a-z0-9-]+$/.test(sport)?sport:'soccer'}
function clampInt(value,fallback,min,max){const n=Number.parseInt(String(value??''),10);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback}
function num(value,fallback=null){const n=Number(value);return Number.isFinite(n)?n:fallback}
function priceOf(selection){for(const key of ['decimal','odds','price']){const n=Number(selection?.[key]);if(Number.isFinite(n)&&n>1)return n}return null}
function sourceEvents(payload){return Array.isArray(payload)?payload:Array.isArray(payload?.events)?payload.events:Array.isArray(payload?.data)?payload.data:[]}
function compactEvent(event){
 const markets=(Array.isArray(event?.markets)?event.markets:[]).filter(m=>m?.isActive!==false).map(market=>({
  id:market?.marketId??market?.id??null,
  type:market?.canonicalMarket??null,
  name:market?.rawName??market?.name??market?.marketName??market?.canonicalMarket??null,
  period:market?.period??null,
  line:market?.line??null,
  selections:(Array.isArray(market?.selections)?market.selections:[]).filter(s=>s?.isActive!==false).map(selection=>({
   id:selection?.selectionId??selection?.id??null,
   outcome:selection?.canonicalOutcome??null,
   name:selection?.rawName??selection?.name??selection?.label??selection?.outcome??null,
   line:selection?.line??selection?.handicap??market?.line??null,
   odds:priceOf(selection)
  })).filter(selection=>selection.odds)
 })).filter(market=>market.selections.length);
 return {
  id:event?.eventId??event?.id??null,
  sport:event?.sport??null,
  home:event?.home??event?.homeTeam??event?.competitors?.[0]?.name??null,
  away:event?.away??event?.awayTeam??event?.competitors?.[1]?.name??null,
  league:event?.league??event?.competition??event?.tournament??null,
  startTime:event?.startTime??event?.startsAt??event?.start??null,
  live:event?.live===true,
  markets
 };
}
function applyFilters(events,url){
 const eventQ=String(url.searchParams.get('event')||'').trim().toLowerCase();
 const marketQ=String(url.searchParams.get('market')||'').trim().toLowerCase();
 const minOdds=num(url.searchParams.get('minOdds'));
 const maxOdds=num(url.searchParams.get('maxOdds'));
 const days=clampInt(url.searchParams.get('days'),0,0,31);
 const now=Date.now(),until=days?now+days*86400000:null;
 return events.map(compactEvent).filter(event=>{
  if(days){const ts=Date.parse(event.startTime||'');if(!Number.isFinite(ts)||ts<now-3600000||ts>until)return false}
  if(eventQ&&!`${event.home||''} ${event.away||''} ${event.league||''}`.toLowerCase().includes(eventQ))return false;
  return true;
 }).map(event=>({
  ...event,
  markets:event.markets.filter(market=>{
   if(marketQ&&!`${market.type||''} ${market.name||''}`.toLowerCase().includes(marketQ))return false;
   market.selections=market.selections.filter(selection=>(minOdds===null||selection.odds>=minOdds)&&(maxOdds===null||selection.odds<=maxOdds));
   return market.selections.length>0;
  })
 })).filter(event=>event.markets.length>0);
}
async function chanceProxy(req,res,url){
 const key=process.env.PULSESCORE_API_KEY;
 if(!key)return json(res,503,{ok:false,error:'PULSESCORE_NOT_CONFIGURED'});
 const sport=cleanSport(url.searchParams.get('sport'));
 const mode=String(url.searchParams.get('mode')||'prematch').toLowerCase();
 const page=clampInt(url.searchParams.get('page'),1,1,10000);
 const limit=clampInt(url.searchParams.get('limit'),100,1,100);
 const compact=url.searchParams.get('compact')!=='0';
 const target=mode==='live'?`${PULSE_BASE}/live-events?sport=${encodeURIComponent(sport)}`:`${PULSE_BASE}/${encodeURIComponent(sport)}/events?page=${page}&limit=${limit}`;
 try{
  const upstream=await fetch(target,{headers:{'X-Secret':key,'Accept':'application/json'}});
  const text=await upstream.text();let payload;try{payload=JSON.parse(text)}catch{payload={raw:text.slice(0,4000)}}
  if(!upstream.ok)return json(res,upstream.status,{ok:false,error:'PULSESCORE_UPSTREAM_ERROR',status:upstream.status,target,details:payload});
  const rawEvents=sourceEvents(payload),events=applyFilters(rawEvents,url);
  const base={ok:true,provider:'pulsescore',bookmaker:'chance',sport,mode,fetchedAt:new Date().toISOString(),page:num(payload?.page,page),limit:num(payload?.limit,limit),total:num(payload?.total,rawEvents.length),totalPages:num(payload?.totalPages,1),hasNextPage:payload?.hasNextPage===true,rawCount:rawEvents.length,eventCount:events.length};
  return json(res,200,compact?{...base,events}:{...base,raw:payload,events});
 }catch(error){return json(res,502,{ok:false,error:'PULSESCORE_FETCH_FAILED',message:String(error?.message||error)})}
}
export default async function handler(req,res){
 if(req.method!=='GET')return json(res,405,{ok:false,error:'METHOD_NOT_ALLOWED'});
 const url=requestUrl(req);
 if(String(url.searchParams.get('source')||'').toLowerCase()==='chance')return chanceProxy(req,res,url);
 const viagogo=!!(process.env.VIAGOGO_CLIENT_ID&&process.env.VIAGOGO_CLIENT_SECRET);
 const gmail=!!(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.GOOGLE_REFRESH_TOKEN);
 const pulsescore=!!process.env.PULSESCORE_API_KEY;
 return json(res,200,{ok:true,version:'70.4-health',checks:{runtime_endpoint:true,viagogo_api:viagogo,gmail_api:gmail,pulsescore_api:pulsescore}})
}
