import {APP_RELEASE,APP_VERSION} from '../js/releaseMeta.js';
import {rateLimit} from '../lib/api-request-guard.js';

export default function handler(req,res){
 if(!rateLimit(req,res,{bucket:'deployment-meta',limit:120,windowMs:60000}))return;
 if(req.method!=='GET'){res.statusCode=405;res.setHeader('content-type','application/json; charset=utf-8');res.end(JSON.stringify({ok:false,error:'METHOD_NOT_ALLOWED'}));return}
 res.setHeader('content-type','application/json; charset=utf-8');
 res.setHeader('cache-control','no-store');
 res.end(JSON.stringify({
  ok:true,
  release:APP_RELEASE,
  version:APP_VERSION,
  commit:process.env.VERCEL_GIT_COMMIT_SHA||null,
  deploymentId:process.env.VERCEL_DEPLOYMENT_ID||null,
  region:process.env.VERCEL_REGION||null,
  environment:process.env.VERCEL_ENV||null
 }));
}
