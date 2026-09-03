import {publicLedger} from './bet-ledger.js';

const KEY='kamil:betting:ledger:543';
const VERSION='543.0.0';
const clean=(v,max=240)=>String(v??'').trim().slice(0,max);
const clamp=(v,min,max,fallback=null)=>{const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback};
const seed=()=>publicLedger().map(item=>({...item,source:item.source||'code-seed'}));

function config(){
 const url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL||process.env.REDIS_REST_URL||'';
 const token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN||process.env.REDIS_REST_TOKEN||'';
 return url&&token?{url:url.replace(/\/$/,''),token}:null;
}
async function cmd(c,args){const r=await fetch(c.url,{method:'POST',headers:{authorization:`Bearer ${c.token}`,'content-type':'application/json'},body:JSON.stringify(args)});if(!r.ok)throw new Error(`KV_${r.status}`);const p=await r.json();return p?.result}
function mergeSeed(bets){const map=new Map(seed().map(b=>[b.id,b]));for(const b of bets||[])map.set(b.id,b);return [...map.values()]}
async function load(){const c=config();if(!c)return{storage:'client_fallback',writable:false,bets:seed(),bankrollCzk:0,unitCzk:0};const raw=await cmd(c,['GET',KEY]);if(!raw)return{storage:'kv',writable:true,bets:seed(),bankrollCzk:0,unitCzk:0};try{const p=JSON.parse(raw);return{storage:'kv',writable:true,bets:mergeSeed(p.bets),bankrollCzk:Number(p.bankrollCzk||0),unitCzk:Number(p.unitCzk||0)}}catch{return{storage:'kv',writable:true,bets:seed(),bankrollCzk:0,unitCzk:0}}}
async function save(state){const c=config();if(!c)return false;await cmd(c,['SET',KEY,JSON.stringify({bets:state.bets,bankrollCzk:state.bankrollCzk,unitCzk:state.unitCzk,updatedAt:new Date().toISOString()})]);return true}
function normalize(input){
 const status=['OPEN','WIN','LOSS','VOID'].includes(String(input?.status||'OPEN').toUpperCase())?String(input.status||'OPEN').toUpperCase():'OPEN';
 const stakeCzk=clamp(input?.stakeCzk,0,10000000,0),odds=clamp(input?.odds,1.001,1000,null);
 const pnlCzk=status==='WIN'&&odds?stakeCzk*(odds-1):status==='LOSS'?-stakeCzk:status==='VOID'?0:clamp(input?.pnlCzk,-10000000,10000000,null);
 return {...input,id:clean(input?.id,120)||`bet-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,event:clean(input?.event,240),league:clean(input?.league,160)||null,market:clean(input?.market,120)||null,selection:clean(input?.selection,160)||null,label:clean(input?.label,240)||clean(input?.selection,160)||clean(input?.event,240),odds,stakeCzk,status,bookmaker:clean(input?.bookmaker,80)||'chance',placedAt:clean(input?.placedAt,60)||new Date().toISOString(),recordedAt:clean(input?.recordedAt,60)||new Date().toISOString(),settledAt:status==='OPEN'?null:(clean(input?.settledAt,60)||new Date().toISOString()),pnlCzk,locked:true,source:clean(input?.source,100)||'os543'};
}
function stats(bets,bankrollCzk=0,unitCzk=0){const settled=bets.filter(b=>['WIN','LOSS','VOID'].includes(b.status)),open=bets.filter(b=>b.status==='OPEN'),stake=settled.reduce((s,b)=>s+Number(b.stakeCzk||0),0),profit=settled.reduce((s,b)=>s+Number(b.pnlCzk||0),0),wins=settled.filter(b=>b.status==='WIN').length,losses=settled.filter(b=>b.status==='LOSS').length;return{bankrollCzk,unitCzk,openCount:open.length,openExposureCzk:open.reduce((s,b)=>s+Number(b.stakeCzk||0),0),settledCount:settled.length,wins,losses,profitCzk:Number(profit.toFixed(2)),roiPct:stake?Number((profit/stake*100).toFixed(2)):0,yieldPct:stake?Number((profit/stake*100).toFixed(2)):0,winRatePct:wins+losses?Number((wins/(wins+losses)*100).toFixed(2)):0,unitsProfit:unitCzk?Number((profit/unitCzk).toFixed(2)):null}}

export async function getBettingLedger543(){const state=await load();state.bets=mergeSeed(state.bets);return{ok:true,version:VERSION,...state,analytics:stats(state.bets,state.bankrollCzk,state.unitCzk)}}
export async function mutateBettingLedger543(input){const state=await load();state.bets=mergeSeed(state.bets);if(!state.writable)return{status:409,body:{ok:false,error:'SERVER_STORAGE_NOT_CONFIGURED',storage:state.storage,writable:false,fallback:'client'}};const action=clean(input?.action,60).toLowerCase();if(action==='add'){const bet=normalize(input.bet||input);const ix=state.bets.findIndex(x=>x.id===bet.id);if(ix>=0)state.bets[ix]={...state.bets[ix],...bet};else state.bets.push(bet);await save(state);return{status:200,body:{ok:true,bet,analytics:stats(state.bets,state.bankrollCzk,state.unitCzk)}}}if(action==='settle'){const bet=state.bets.find(x=>x.id===clean(input.id,120));if(!bet)return{status:404,body:{ok:false,error:'BET_NOT_FOUND'}};const status=String(input.status||'').toUpperCase();if(!['WIN','LOSS','VOID'].includes(status))return{status:400,body:{ok:false,error:'BAD_STATUS'}};Object.assign(bet,normalize({...bet,status,settledAt:new Date().toISOString()}));await save(state);return{status:200,body:{ok:true,bet,analytics:stats(state.bets,state.bankrollCzk,state.unitCzk)}}}if(action==='bankroll'){state.bankrollCzk=clamp(input.bankrollCzk,0,100000000,0);state.unitCzk=clamp(input.unitCzk,0,10000000,0);await save(state);return{status:200,body:{ok:true,bankrollCzk:state.bankrollCzk,unitCzk:state.unitCzk,analytics:stats(state.bets,state.bankrollCzk,state.unitCzk)}}}return{status:400,body:{ok:false,error:'UNKNOWN_ACTION'}}}
