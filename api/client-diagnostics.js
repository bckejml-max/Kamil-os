import {rateLimit} from '../lib/api-request-guard.js';

const json=(res,status,body)=>{res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.setHeader('cache-control','no-store');res.end(JSON.stringify(body))};
const clean=(value,max=120)=>String(value??'').replace(/[^a-zA-Z0-9_:.\-\/ ]+/g,'?').slice(0,max);
function payload(body={}){
 return {
  release:clean(body.release,32),
  scope:clean(body.scope,96),
  name:clean(body.name||'Error',64),
  route:clean(body.route||'/',120),
  view:clean(body.view||'',32),
  at:new Date().toISOString()
 };
}
export default async function handler(req,res){
 if(!rateLimit(req,res,{bucket:'client-diagnostics',limit:20,windowMs:60000}))return;
 if(req.method!=='POST')return json(res,405,{ok:false,error:'METHOD_NOT_ALLOWED'});
 const size=Number(req.headers?.['content-length']||0);
 if(size>4096)return json(res,413,{ok:false,error:'PAYLOAD_TOO_LARGE'});
 let body=req.body||{};
 if(typeof body==='string'){try{body=JSON.parse(body)}catch{return json(res,400,{ok:false,error:'INVALID_JSON'})}}
 if(!body||typeof body!=='object'||Array.isArray(body))return json(res,400,{ok:false,error:'INVALID_BODY'});
 const event=payload(body);
 console.error('[client-diagnostic]',JSON.stringify(event));
 return json(res,202,{ok:true,accepted:true});
}
