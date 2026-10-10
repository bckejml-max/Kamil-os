const buckets=globalThis.__KAMIL_API_RATE_BUCKETS__||(globalThis.__KAMIL_API_RATE_BUCKETS__=new Map());

function clientId(req){
 const raw=req?.headers?.['x-vercel-forwarded-for']||req?.headers?.['x-forwarded-for']||req?.headers?.['x-real-ip']||req?.socket?.remoteAddress||'unknown';
 return String(Array.isArray(raw)?raw[0]:raw).split(',')[0].trim().slice(0,96)||'unknown';
}
function json429(res,retryAfter){
 res.statusCode=429;
 res.setHeader('content-type','application/json; charset=utf-8');
 res.setHeader('cache-control','no-store');
 res.setHeader('retry-after',String(Math.max(1,Math.ceil(retryAfter/1000))));
 res.end(JSON.stringify({ok:false,error:'RATE_LIMITED',retryAfterMs:retryAfter}));
}
export function rateLimit(req,res,{bucket='public',limit=60,windowMs=60000}={}){
 const now=Date.now(),id=clientId(req),key=`${bucket}:${id}`,prev=buckets.get(key);
 const state=!prev||now-prev.startedAt>=windowMs?{startedAt:now,count:0}:prev;
 if(state.count>=limit){json429(res,Math.max(1,windowMs-(now-state.startedAt)));return false}
 state.count+=1;buckets.set(key,state);
 res.setHeader('x-kamil-rate-limit',String(limit));
 res.setHeader('x-kamil-rate-remaining',String(Math.max(0,limit-state.count)));
 if(buckets.size>2048)for(const [k,v] of buckets)if(now-v.startedAt>=windowMs*2)buckets.delete(k);
 return true;
}
export const boundedItems=(items,max=12)=>Array.isArray(items)?items.slice(0,Math.max(0,max)):[];

export const publicApiGuard746=Object.freeze({perInstance:true,defaultWindowMs:60000,maxBatch:12});
