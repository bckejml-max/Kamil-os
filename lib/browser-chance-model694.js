import {decorateLedgerSelection,ledgerSummary} from './bet-ledger.js';
import {resolveAutoBettingModels} from './auto-betting-model.js';

const txt=(v,n=180)=>String(v??'').slice(0,n);
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const round=(v,d=4)=>{if(!Number.isFinite(v))return null;const p=10**d;return Math.round(v*p)/p};
const clamp=(v,fallback,min,max)=>{const n=Number.parseInt(String(v??''),10);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback};
const halfLine=v=>{const n=Number(v);return Number.isFinite(n)&&n>=0&&Math.abs(n*2-Math.round(n*2))<1e-8&&Math.abs(Math.round(n*2)%2)===1};
const halfHandicap=v=>{const n=Number(v);return Number.isFinite(n)&&Math.abs(n*2-Math.round(n*2))<1e-8&&Math.abs(Math.round(n*2)%2)===1};

function cleanSelection(raw,eventId,marketId,index){
 const odds=num(raw?.odds??raw?.price??raw?.decimal);
 if(!(odds>1&&odds<1000))return null;
 const outcome=txt(raw?.canonicalOutcome??raw?.outcome,32).toUpperCase();
 const line=num(raw?.line??raw?.handicap);
 const name=txt(raw?.rawName??raw?.name??raw?.label,120);
 const selectionId=txt(raw?.selectionId??raw?.id??`browser:${eventId}:${marketId}:${index}`,220);
 return{selectionId,id:selectionId,canonicalOutcome:outcome,outcome,rawName:name,name,line,odds,isActive:true};
}
function cleanMarket(raw,eventId,index){
 const marketId=txt(raw?.marketId??raw?.id??`browser:${eventId}:m:${index}`,220);
 const type=txt(raw?.canonicalMarket??raw?.type,64).toUpperCase();
 if(!type)return null;
 const name=txt(raw?.rawName??raw?.name??type,160);
 const period=txt(raw?.period??'FULL_TIME',32).toUpperCase()||'FULL_TIME';
 const selections=(Array.isArray(raw?.selections)?raw.selections:[]).slice(0,40).map((s,i)=>cleanSelection(s,eventId,marketId,i)).filter(Boolean);
 if(!selections.length)return null;
 return{marketId,id:marketId,canonicalMarket:type,type,rawName:name,name,period,line:num(raw?.line),isActive:true,selections};
}
function cleanEvent(raw,index){
 const eventId=txt(raw?.eventId??raw?.id??`browser-event-${index}`,220);
 const home=txt(raw?.home??raw?.homeTeam,120),away=txt(raw?.away??raw?.awayTeam,120);
 if(!home||!away)return null;
 const markets=(Array.isArray(raw?.markets)?raw.markets:[]).slice(0,60).map((m,i)=>cleanMarket(m,eventId,i)).filter(Boolean);
 if(!markets.length)return null;
 return{eventId,id:eventId,sport:txt(raw?.sport??'soccer',40),league:txt(raw?.league??raw?.competition??'',160),home,away,startTime:txt(raw?.startTime??raw?.startsAt??raw?.start??'',80),live:raw?.live===true,markets};
}
function modelable(m,s){
 if(String(m?.period||'').toUpperCase()!=='FULL_TIME')return false;
 const type=String(m?.canonicalMarket||m?.type||'').toUpperCase(),outcome=String(s?.canonicalOutcome||s?.outcome||'').toUpperCase(),line=s?.line??m?.line;
 if(type==='MATCH_RESULT')return['HOME','DRAW','AWAY'].includes(outcome);
 if(type==='BOTH_TEAMS_TO_SCORE')return['YES','NO'].includes(outcome);
 if(['OVER_UNDER','HOME_OVER_UNDER','AWAY_OVER_UNDER','CORNER_OVER_UNDER','YELLOW_CARD_OVER_UNDER'].includes(type))return['OVER','UNDER'].includes(outcome)&&halfLine(line);
 if(type==='ASIAN_HANDICAP')return['HOME','AWAY'].includes(outcome)&&halfHandicap(line);
 return false;
}
function decorate(events,auto,minEv,minEdgePp){
 const probs=new Map(auto?.probabilities||[]),sources=new Map(auto?.sources||[]);
 return events.map(event=>({...event,markets:event.markets.map(market=>({...market,selections:market.selections.map(selection=>{
  const p=probs.get(String(selection.selectionId))??null,implied=1/selection.odds,fair=p?1/p:null,edge=p===null?null:(p-implied)*100,ev=p===null?null:p*selection.odds-1;
  const decision=p===null?'WAITING_FOR_MODEL':(ev>=minEv&&edge>=minEdgePp?'BET':'NO_BET');
  const valued={...selection,impliedProbability:round(implied),modelProbability:p===null?null:round(p),fairOdds:fair===null?null:round(fair,3),edgePctPoints:edge===null?null:round(edge,2),ev:ev===null?null:round(ev),evPct:ev===null?null:round(ev*100,2),decision,modelSource:p===null?null:(sources.get(String(selection.selectionId))||auto?.meta?.provider||'automatic')};
  return decorateLedgerSelection(event,market,valued);
 })}))}));
}

export async function modelBrowserChance694(input={},query={}){
 const minEv=Number(query.minEv??0.05),minEdgePp=Number(query.minEdgePp??4),betsOnly=String(query.betsOnly??'1')==='1';
 const now=Date.now(),days=clamp(query.days,5,1,14),until=now+days*86400000;
 const events=(Array.isArray(input?.events)?input.events:[]).slice(0,300).map(cleanEvent).filter(Boolean).filter(e=>{const t=Date.parse(e.startTime||'');return !Number.isFinite(t)||(t>now&&t<=until)});
 const candidates=events.filter(e=>e.markets.some(m=>m.selections.some(s=>modelable(m,s))));
 const auto=await resolveAutoBettingModels(candidates,{apiFootballKey:process.env.API_FOOTBALL_KEY||process.env.API_SPORTS_KEY||'',apiFootballLimit:clamp(query.autoModelLimit,3,1,10),poissonLimit:clamp(query.poissonLimit,15,1,30)});
 let modeled=decorate(events,auto,minEv,minEdgePp);
 if(betsOnly)modeled=modeled.map(e=>({...e,markets:e.markets.map(m=>({...m,selections:m.selections.filter(s=>s.decision==='BET'&&!s.existingBet)})).filter(m=>m.selections.length)})).filter(e=>e.markets.length);
 return{ok:true,version:'694.0.0',provider:'chance-browser',bookmaker:'Chance.cz',sport:'soccer',mode:'prematch',fetchedAt:new Date().toISOString(),sourceCapturedAt:input?.capturedAt||null,strictFutureFilter:true,page:1,limit:events.length,total:events.length,totalPages:1,hasNextPage:false,rawCount:events.length,eventCount:modeled.length,ledger:ledgerSummary(),value:{minEv,minEvPct:round(minEv*100,2),minEdgePp,betsOnly,automaticModelProbabilities:auto?.probabilities?.size||0,modelProvider:auto?.meta?.provider||'automatic',autoModel:auto?.meta||{}},events:modeled};
}
