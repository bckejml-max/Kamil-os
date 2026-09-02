const BASE='https://api.pulsescore.net/api/chance/soccer/events?page=1&limit=1';

function json(res,status,body){
  res.statusCode=status;
  res.setHeader('content-type','application/json; charset=utf-8');
  res.setHeader('cache-control','no-store');
  res.end(JSON.stringify(body));
}

async function attempt(url,options){
  try{
    const response=await fetch(url,options);
    const text=await response.text();
    let body=null;
    try{body=JSON.parse(text)}catch{body=text.slice(0,180)}
    return {ok:response.ok,status:response.status,body};
  }catch(error){
    return {ok:false,status:0,error:String(error?.message||error)};
  }
}

export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{ok:false,error:'METHOD_NOT_ALLOWED'});
  const key=String(process.env.PULSESCORE_API_KEY||'').trim();
  if(!key)return json(res,503,{ok:false,error:'PULSESCORE_NOT_CONFIGURED'});

  const header=await attempt(BASE,{headers:{'X-Secret':key,'Accept':'application/json'},cache:'no-store'});
  if(header.ok)return json(res,200,{ok:true,authMode:'x-secret',status:header.status});

  const url=new URL(BASE);url.searchParams.set('key',key);
  const query=await attempt(url.toString(),{headers:{Accept:'application/json'},cache:'no-store'});
  if(query.ok)return json(res,200,{ok:true,authMode:'query-key',status:query.status,headerStatus:header.status});

  return json(res,502,{ok:false,error:'PULSESCORE_AUTH_FAILED',headerStatus:header.status,queryStatus:query.status,headerMessage:header.body?.message||header.body?.error||null,queryMessage:query.body?.message||query.body?.error||null});
}
