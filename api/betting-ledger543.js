import {getBettingLedger543,mutateBettingLedger543} from '../lib/betting-ledger543-store.js';

async function readBody(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>100000)throw new Error('BODY_TOO_LARGE')}if(!raw.trim())return{};try{return JSON.parse(raw)}catch{throw new Error('BAD_BODY')}}

export default async function handler(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('Cache-Control','private, no-store, max-age=0');
 if(req.method==='GET'){
  const body=await getBettingLedger543(req);
  const status=body?.ok?200:body?.error==='AUTH_REQUIRED'?401:body?.error==='REMOTE_BETTING_LEDGER_MIGRATION_REQUIRED'?503:502;
  return res.status(status).json(body);
 }
 if(req.method==='POST'||req.method==='PUT'){
  try{const result=await mutateBettingLedger543(await readBody(req),req);return res.status(result.status).json(result.body)}
  catch(error){const bad=['BAD_BODY','BODY_TOO_LARGE'].includes(String(error?.message||''));return res.status(bad?400:500).json({ok:false,error:bad?'BAD_BODY':'LEDGER_543_FAILED',writable:false})}
 }
 res.setHeader('Allow','GET, POST, PUT');
 return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED',writable:false});
}
