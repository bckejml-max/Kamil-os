const BOOKMAKER='Chance.cz';

const num=value=>{const n=Number(value);return Number.isFinite(n)?n:null};
const round=(value,digits=4)=>{if(!Number.isFinite(value))return null;const p=10**digits;return Math.round(value*p)/p};
const plain=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const slug=value=>plain(value).replace(/\s+/g,'-').slice(0,120)||'market';

function periodOf(name){
 const text=plain(name);
 if(/\b(ht|1h|first half|1st half|half time)\b/.test(text))return'FIRST_HALF';
 if(/\b(2h|second half|2nd half)\b/.test(text))return'SECOND_HALF';
 return'FULL_TIME';
}

function selectionId(eventId,type,outcome,line,label=''){
 const linePart=Number.isFinite(Number(line))?String(Number(line)):'na';
 return `oa692:${eventId}:${type}:${outcome}:${linePart}:${slug(label)}`;
}

function oddSelection(eventId,type,outcome,odds,{line=null,label=null,updatedAt=null}={}){
 const price=num(odds);
 if(!(price>1))return null;
 const resolvedLabel=label||outcome;
 return{id:selectionId(eventId,type,outcome,line,resolvedLabel),outcome,name:resolvedLabel,line:num(line),odds:price,updatedAt:updatedAt||null};
}

function lineMarkets(eventId,type,name,period,rows,updatedAt,{team=null}={}){
 const markets=[];
 for(const row of Array.isArray(rows)?rows:[]){
  const line=num(row?.hdp??row?.line);
  if(line===null)continue;
  const selections=[
   oddSelection(eventId,type,'OVER',row?.over,{line,label:`Více než ${line}`,updatedAt}),
   oddSelection(eventId,type,'UNDER',row?.under,{line,label:`Méně než ${line}`,updatedAt})
  ].filter(Boolean);
  if(selections.length<2)continue;
  markets.push({id:`oa692:${eventId}:${slug(name)}:${line}`,type,name,period,line,team,updatedAt:updatedAt||null,selections});
 }
 return markets;
}

function moneylineMarket(eventId,name,period,rows,updatedAt){
 const row=Array.isArray(rows)?rows[0]:null;
 if(!row)return[];
 const selections=[
  oddSelection(eventId,'MATCH_RESULT','HOME',row.home,{label:'1',updatedAt}),
  oddSelection(eventId,'MATCH_RESULT','DRAW',row.draw,{label:'0',updatedAt}),
  oddSelection(eventId,'MATCH_RESULT','AWAY',row.away,{label:'2',updatedAt})
 ].filter(Boolean);
 return selections.length>=2?[{id:`oa692:${eventId}:match-result`,type:'MATCH_RESULT',name,period:'FULL_TIME',line:null,updatedAt:updatedAt||null,selections}]:[];
}

function bttsMarket(eventId,name,period,rows,updatedAt){
 const row=Array.isArray(rows)?rows[0]:null;
 if(!row)return[];
 const selections=[
  oddSelection(eventId,'BOTH_TEAMS_TO_SCORE','YES',row.yes,{label:'Ano',updatedAt}),
  oddSelection(eventId,'BOTH_TEAMS_TO_SCORE','NO',row.no,{label:'Ne',updatedAt})
 ].filter(Boolean);
 return selections.length===2?[{id:`oa692:${eventId}:btts`,type:'BOTH_TEAMS_TO_SCORE',name,period,updatedAt:updatedAt||null,selections}]:[];
}

function spreadMarkets(eventId,name,period,rows,updatedAt){
 const markets=[];
 for(const row of Array.isArray(rows)?rows:[]){
  const homeLine=num(row?.hdp??row?.line);
  if(homeLine===null)continue;
  const awayLine=-homeLine;
  const selections=[
   oddSelection(eventId,'ASIAN_HANDICAP','HOME',row?.home,{line:homeLine,label:`1 ${homeLine>=0?'+':''}${homeLine}`,updatedAt}),
   oddSelection(eventId,'ASIAN_HANDICAP','AWAY',row?.away,{line:awayLine,label:`2 ${awayLine>=0?'+':''}${awayLine}`,updatedAt})
  ].filter(Boolean);
  if(selections.length!==2)continue;
  markets.push({id:`oa692:${eventId}:spread:${homeLine}`,type:'ASIAN_HANDICAP',name,period,line:homeLine,updatedAt:updatedAt||null,selections});
 }
 return markets;
}

export function normalizeOddsApiMarket692(eventId,market){
 const name=String(market?.name||'').trim();
 const text=plain(name);
 const period=periodOf(name);
 const updatedAt=market?.updatedAt||null;
 const rows=Array.isArray(market?.odds)?market.odds:[];
 if(period==='FULL_TIME'&&(text==='ml'||text==='moneyline'||text==='match result'))return moneylineMarket(eventId,name,period,rows,updatedAt);
 if(text.includes('both teams to score')&&period==='FULL_TIME')return bttsMarket(eventId,name,period,rows,updatedAt);
 if(period==='FULL_TIME'&&(text==='totals'||text==='goals over under'||text==='alternative goal line'||text==='alternative total goals'))return lineMarkets(eventId,'OVER_UNDER',name,period,rows,updatedAt);
 if(period==='FULL_TIME'&&text==='team total home')return lineMarkets(eventId,'HOME_OVER_UNDER',name,period,rows,updatedAt,{team:'HOME'});
 if(period==='FULL_TIME'&&text==='team total away')return lineMarkets(eventId,'AWAY_OVER_UNDER',name,period,rows,updatedAt,{team:'AWAY'});
 if(period==='FULL_TIME'&&text==='spread')return spreadMarkets(eventId,name,period,rows,updatedAt);
 if(period==='FULL_TIME'&&text==='corners totals')return lineMarkets(eventId,'CORNERS_OVER_UNDER',name,period,rows,updatedAt);
 if(period==='FULL_TIME'&&text==='bookings totals')return lineMarkets(eventId,'BOOKINGS_OVER_UNDER',name,period,rows,updatedAt);
 return[];
}

export function normalizeOddsApiEvent692(payload,bookmaker=BOOKMAKER){
 const id=payload?.id??null;
 if(id===null||id===undefined)return null;
 const rawMarkets=Array.isArray(payload?.bookmakers?.[bookmaker])?payload.bookmakers[bookmaker]:[];
 const markets=rawMarkets.flatMap(market=>normalizeOddsApiMarket692(id,market));
 const updatedTimes=rawMarkets.map(m=>Date.parse(m?.updatedAt||'')).filter(Number.isFinite);
 return{
  id:`oddsapi:${id}`,
  upstreamId:String(id),
  sport:payload?.sport?.slug||payload?.sport?.name||'football',
  home:payload?.home||null,
  away:payload?.away||null,
  league:payload?.league?.name||payload?.league?.slug||null,
  leagueSlug:payload?.league?.slug||null,
  startTime:payload?.date||null,
  live:String(payload?.status||'').toLowerCase()==='live',
  status:payload?.status||null,
  bookmaker,
  upstreamUpdatedAt:updatedTimes.length?new Date(Math.max(...updatedTimes)).toISOString():null,
  rawMarketCount:rawMarkets.length,
  mappedMarketCount:markets.length,
  markets
 };
}

export function normalizeOddsApiEvents692(payload,bookmaker=BOOKMAKER){
 return (Array.isArray(payload)?payload:[]).map(item=>normalizeOddsApiEvent692(item,bookmaker)).filter(event=>event&&event.home&&event.away&&event.markets.length);
}

function teamLike(a,b){const x=plain(a),y=plain(b);return !!x&&!!y&&(x===y||x.includes(y)||y.includes(x));}
function openBetMatches(event,market,selection,bet){
 if(String(bet?.status||'').toUpperCase()!=='OPEN')return false;
 const home=bet?.home||String(bet?.event||'').split(/\s+(?:vs|v|–|-)\s+/i)[0]||'';
 const away=bet?.away||String(bet?.event||'').split(/\s+(?:vs|v|–|-)\s+/i)[1]||'';
 if(!teamLike(event?.home,home)||!teamLike(event?.away,away))return false;
 if(String(bet?.market||'').toUpperCase()!==String(market?.type||'').toUpperCase())return false;
 if(String(bet?.selection||'').toUpperCase()!==String(selection?.outcome||'').toUpperCase())return false;
 if(bet?.line==null)return true;
 return Math.abs(Number(bet.line)-Number(selection?.line))<0.001;
}

export function applyOddsValueModel692(events,model={},options={}){
 const probabilities=model?.probabilities instanceof Map?model.probabilities:new Map(model?.probabilities||[]);
 const sources=model?.sources instanceof Map?model.sources:new Map(model?.sources||[]);
 const openBets=Array.isArray(options.openBets)?options.openBets:[];
 const minEv=Number.isFinite(Number(options.minEv))?Number(options.minEv):0.05;
 const minEdgePp=Number.isFinite(Number(options.minEdgePp))?Number(options.minEdgePp):4;
 const minOdds=Number.isFinite(Number(options.minOdds))?Number(options.minOdds):null;
 const maxOdds=Number.isFinite(Number(options.maxOdds))?Number(options.maxOdds):null;
 const betsOnly=options.betsOnly===true;
 const out=[];
 for(const event of Array.isArray(events)?events:[]){
  const markets=[];
  for(const market of Array.isArray(event?.markets)?event.markets:[]){
   const selections=[];
   for(const selection of Array.isArray(market?.selections)?market.selections:[]){
    const odds=num(selection?.odds);
    if(!(odds>1)||(minOdds!==null&&odds<minOdds)||(maxOdds!==null&&odds>maxOdds))continue;
    const p=probabilities.get(String(selection.id))??null;
    const implied=1/odds;
    const fair=p===null?null:1/p;
    const edge=p===null?null:(p-implied)*100;
    const ev=p===null?null:p*odds-1;
    const existingBet=openBets.some(bet=>openBetMatches(event,market,selection,bet));
    const decision=p===null?'WAITING_FOR_MODEL':existingBet?'NO_ADD':(ev>=minEv&&edge>=minEdgePp?'BET':'NO_BET');
    const row={...selection,impliedProbability:round(implied),modelProbability:p===null?null:round(p),fairOdds:fair===null?null:round(fair,3),edgePctPoints:edge===null?null:round(edge,2),ev:ev===null?null:round(ev),evPct:ev===null?null:round(ev*100,2),decision,modelSource:p===null?null:(sources.get(String(selection.id))||model?.meta?.provider||'automatic'),existingBet,ledgerDecision:existingBet?'LOCKED_NO_ADD':'AVAILABLE'};
    if(!betsOnly||row.decision==='BET')selections.push(row);
   }
   if(selections.length)markets.push({...market,selections});
  }
  if(markets.length)out.push({...event,markets});
 }
 return out;
}

export function chunkEventIds692(ids,size=10){
 const n=Math.max(1,Math.min(10,Number(size)||10));
 const unique=[...new Set((Array.isArray(ids)?ids:[]).map(String).filter(Boolean))];
 const chunks=[];
 for(let i=0;i<unique.length;i+=n)chunks.push(unique.slice(i,i+n));
 return chunks;
}

export const ODDS_API_BOOKMAKER692=BOOKMAKER;
