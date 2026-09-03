import {publicLedger} from '../lib/bet-ledger.js';

const KEY='kamil:betting:ledger:543';
const VERSION='543.0.0';

function json(res,status,body){res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.setHeader('cache-control','no-store');res.end(JSON.stringify(body))}
function clampNum(value,min,max,fallback=null){const n=Number(value);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback}
function cleanText(value,max=240){return String(value??'').trim().slice(0,max)}
function id(){return `bet-${Date.now()}-${Math.random().toString(36).slice(2,9)}`}
async function body(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>100000)throw new Error('BODY_TOO_LARGE')}if(!raw)return{};return JSON.parse(raw)}
function seed(){return publicLedger().map(item=>({...item,source:item.source||'code-seed'}))}
function normalizeBet(input){
 const status=['OPEN','WIN','LOSS','VOID'].includes(String(input?.status||'OPEN').toUpperCase())?String(input.status||'OPEN').toUpperCase():'OPEN';
 const stakeCzk=clampNum(input?.stakeCzk,0,10000000,0);
 const odds=clampNum(input?.odds,1.001,1000,null);
 const pnlCzk=status==='WIN'&&odds?stakeCzk*(odds-1):status==='LOSS'?-stakeCzk:status==='VOID'?0:clampNum(input?.pnlCzk,-10000000,10000000,null);
 return {
  id:cleanText(input?.id,120)||id(),eventId:cleanText(input?.eventId,120)||null,event:cleanText(input?.event,240),home:cleanText(input?.home,120)||null,away:cleanText(input?.away,120)||null,
  league:cleanText(input?.league,160)||null,sport:cleanText(input?.sport,60)||'soccer',market:cleanText(input?.market,120)||null,period:cleanText(input?.period,60)||'FULL_TIME',selection:cleanText(input?.selection,160)||null,
  label:cleanText(input?.label,240)||cleanText(input?.selection,160)||cleanText(input?.event,240),line:input?.line==null?null:clampNum(input.line,-10000,10000,null),odds,stakeCzk,status,bookmaker:cleanText(input?.bookmaker,80)||'chance',
  modelProbability:clampNum(input?.modelProbability,0,1,null),fairOdds:clampNum(input?.fairOdds,1.001,1000,null),edgePctPoints:clampNum(input?.edgePctPoints,-100,100,null),evPct:clampNum(input?.evPct,-1000,10000,null),minOdds:clampNum(input?.minOdds,1.001,1000,null),confidence:clampNum(input?.confidence,0,100,null),units:clampNum(input?.units,0,100,null),
  closingOdds:clampNum(input?.closingOdds,1.001,1000,null),placedAt:cleanText(input?.placedAt,60)||new Date().toISOString(),recordedAt:cleanText(input?.recordedAt,60)||new Date().toISOString(),settledAt:status==='OPEN'?null:(cleanText(input?.settledAt,60)||new Date().toISOString()),pnlCzk,
  source:cleanText(input?.source,100)||'os543',locked:true,notes:cleanText(input?.notes,500)||null
 };
}
function analytics(bets,bankrollCzk=0,unitCzk=0){
 const settled=bets.filter(b=>['WIN','LOSS','VOID'].includes(String(b.status)));
 const open=bets.filter(b=>String(b.status)==='OPEN');
 const stakedSettled=settled.reduce((s,b)=>s+Number(b.stakeCzk||0),0);
 const profit=settled.reduce((s,b)=>s+Number(b.pnlCzk||0),0);
 const wins=settled.filter(b=>b.status==='WIN').length,losses=settled.filter(b=>b.status==='LOSS').length,voids=settled.filter(b=>b.status==='VOID').length;
 const by=(key)=>Object.values(bets.reduce((map,b)=>{const name=cleanText(b?.[key],160)||'Nezařazeno';const row=map[name]||(map[name]={name,bets:0,settled:0,stakeCzk:0,pnlCzk:0});row.bets++;if(b.status!=='OPEN'){row.settled++;row.stakeCzk+=Number(b.stakeCzk||0);row.pnlCzk+=Number(b.pnlCzk||0)}return map},{})).map(r=>({...r,roiPct:r.stakeCzk?Number((r.pnlCzk/r.stakeCzk*100).toFixed(2)):0})).sort((a,b)=>b.pnlCzk-a.pnlCzk);
 return {bankrollCzk,unitCzk,openCount:open.length,openExposureCzk:open.reduce((s,b)=>s+Number(b.stakeCzk||0),0),settledCount:settled.length,wins,losses,voids,profitCzk:Number(profit.toFixed(2)),roiPct:stakedSettled?Number((profit/stakedSettled*100).toFixed(2)):0,yieldPct:stakedSettled?Number((profit/stakedSettled*100).toFixed(2)):0,winRatePct:(wins+losses)?Number((wins/(wins+losses)*100).toFixed(2)):0,unitsProfit:unitCzk?Number((profit/unitCzk).toFixed(2)):null,byMarket:by('market'),byLeague:by('league')};
}
function kvConfig(){
 const url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL||process.env.REDIS_REST_URL||'';
 const token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN||process.env.REDIS_REST_TOKEN||'';
 return url&&token?{url:url.replace(/\/$/,''),token}:null;
}
async function kvCommand(config,args){
 const response=await fetch(config.url,{method:'POST',headers:{authorization:`Bearer ${config.token}`,'content-type':'application/json'},body:JSON.stringify(args)});
 if(!response.ok)throw new Error(`KV_${response.status}`);
 const payload=await response.json();return payload?.result;
}
async function readState(){
 const config=kvConfig();
 if(!config)return{mode:'client_fallback',writable:false,bets:seed(),bankrollCzk:0,unitCzk:0};
 const raw=await kvCommand(config,['GET',KEY]);
 if(!raw)return{mode:'kv',writable:true,bets:seed(),bankrollCzk:0,unitCzk:0};
 try{const parsed=JSON.parse(raw);return{mode:'kv',writable:true,bets:Array.isArray(parsed?.bets)?parsed.bets:seed(),bankrollCzk:Number(parsed?.bankrollCzk||0),unitCzk:Number(parsed?.unitCzk||0)}}catch{return{mode:'kv',writable:true,bets:seed(),bankrollCzk:0,unitCzk:0}}
}
async function saveState(state){const config=kvConfig();if(!config)return false;await kvCommand(config,['SET',KEY,JSON.stringify({bets:state.bets,bankrollCzk:state.bankrollCzk,unitCzk:state.unitCzk,updatedAt:new Date().toISOString()})]);return true}
function mergeSeed(bets){const map=new Map(seed().map(b=>[b.id,b]));for(const b of bets||[])map.set(b.id,b);return [...map.values()]}

export default async function handler(req,res){
 try{
  if(req.method==='OPTIONS'){res.statusCode=204;res.end();return}
  const state=await readState();state.bets=mergeSeed(state.bets);
  if(req.method==='GET')return json(res,200,{ok:true,version:VERSION,storage:state.mode,writable:state.writable,bets:state.bets,analytics:analytics(state.bets,state.bankrollCzk,state.unitCzk),bankrollCzk:state.bankrollCzk,unitCzk:state.unitCzk});
  if(req.method!=='POST'&&req.method!=='PUT')return json(res,405,{ok:false,error:'METHOD_NOT_ALLOWED'});
  const input=await body(req);const action=cleanText(input?.action,60).toLowerCase();
  if(!state.writable)return json(res,409,{ok:false,error:'SERVER_STORAGE_NOT_CONFIGURED',storage:state.mode,writable:false,fallback:'client',message:'OS543 API je zapisovatelné po připojení Vercel KV/Upstash. Klient má bezpečný lokální persistentní fallback.'});
  if(action==='add'){
   const bet=normalizeBet(input.bet||input);const ix=state.bets.findIndex(item=>item.id===bet.id);if(ix>=0)state.bets[ix]={...state.bets[ix],...bet};else state.bets.push(bet);await saveState(state);return json(res,200,{ok:true,bet,analytics:analytics(state.bets,state.bankrollCzk,state.unitCzk)});
  }
  if(action==='settle'){
   const bet=state.bets.find(item=>item.id===cleanText(input.id,120));if(!bet)return json(res,404,{ok:false,error:'BET_NOT_FOUND'});const status=String(input.status||'').toUpperCase();if(!['WIN','LOSS','VOID'].includes(status))return json(res,400,{ok:false,error:'BAD_STATUS'});Object.assign(bet,normalizeBet({...bet,status,closingOdds:input.closingOdds??bet.closingOdds,settledAt:new Date().toISOString()}));await saveState(state);return json(res,200,{ok:true,bet,analytics:analytics(state.bets,state.bankrollCzk,state.unitCzk)});
  }
  if(action==='bankroll'){
   state.bankrollCzk=clampNum(input.bankrollCzk,0,100000000,0);state.unitCzk=clampNum(input.unitCzk,0,10000000,0);await saveState(state);return json(res,200,{ok:true,bankrollCzk:state.bankrollCzk,unitCzk:state.unitCzk,analytics:analytics(state.bets,state.bankrollCzk,state.unitCzk)});
  }
  return json(res,400,{ok:false,error:'UNKNOWN_ACTION'});
 }catch(error){return json(res,500,{ok:false,error:'LEDGER_543_FAILED',message:String(error?.message||error)})}
}
