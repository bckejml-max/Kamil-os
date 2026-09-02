function mean(values){const clean=values.filter(Number.isFinite);return clean.length?clean.reduce((sum,value)=>sum+value,0)/clean.length:null}
function clamp(value,min,max){return Math.max(min,Math.min(max,value))}

const METRICS={
 corners:{homeFor:'homeCorners',awayFor:'awayCorners',minLambda:0.5,maxLambda:10},
 yellow_cards:{homeFor:'homeYellow',awayFor:'awayYellow',minLambda:0.2,maxLambda:6}
};

function metricConfig(metric){return METRICS[String(metric||'').toLowerCase()]||null}
function recentVenueMatches(matches,team,venue,limit=16){
 const filtered=(Array.isArray(matches)?matches:[]).filter(match=>venue==='home'?match.home===team:match.away===team);
 return filtered.slice(Math.max(0,filtered.length-limit));
}

export function estimateCountLambdas(matches,homeTeam,awayTeam,metric,{priorWeight=9,minVenueMatches=6,recentLimit=16}={}){
 const cfg=metricConfig(metric);
 if(!cfg||!Array.isArray(matches)||matches.length<40)return null;
 const usable=matches.filter(match=>Number.isFinite(match?.[cfg.homeFor])&&Number.isFinite(match?.[cfg.awayFor]));
 if(usable.length<40)return null;
 const leagueHome=mean(usable.map(match=>Number(match[cfg.homeFor])));
 const leagueAway=mean(usable.map(match=>Number(match[cfg.awayFor])));
 if(!Number.isFinite(leagueHome)||!Number.isFinite(leagueAway)||leagueHome<=0||leagueAway<=0)return null;
 const homeSample=recentVenueMatches(usable,homeTeam,'home',recentLimit);
 const awaySample=recentVenueMatches(usable,awayTeam,'away',recentLimit);
 if(homeSample.length<minVenueMatches||awaySample.length<minVenueMatches)return null;
 const homeFor=(homeSample.reduce((sum,m)=>sum+Number(m[cfg.homeFor]),0)+priorWeight*leagueHome)/(homeSample.length+priorWeight);
 const homeAgainst=(homeSample.reduce((sum,m)=>sum+Number(m[cfg.awayFor]),0)+priorWeight*leagueAway)/(homeSample.length+priorWeight);
 const awayFor=(awaySample.reduce((sum,m)=>sum+Number(m[cfg.awayFor]),0)+priorWeight*leagueAway)/(awaySample.length+priorWeight);
 const awayAgainst=(awaySample.reduce((sum,m)=>sum+Number(m[cfg.homeFor]),0)+priorWeight*leagueHome)/(awaySample.length+priorWeight);
 const homeAttack=homeFor/leagueHome;
 const homeDefense=homeAgainst/leagueAway;
 const awayAttack=awayFor/leagueAway;
 const awayDefense=awayAgainst/leagueHome;
 return {
  home:clamp(leagueHome*homeAttack*awayDefense,cfg.minLambda,cfg.maxLambda),
  away:clamp(leagueAway*awayAttack*homeDefense,cfg.minLambda,cfg.maxLambda),
  leagueHome,leagueAway,homeMatches:homeSample.length,awayMatches:awaySample.length,metric:String(metric).toLowerCase()
 };
}

function poissonCdf(lambda,k){
 if(!Number.isFinite(lambda)||lambda<=0||!Number.isInteger(k)||k<0)return 0;
 let term=Math.exp(-lambda);
 let sum=term;
 for(let i=1;i<=k;i+=1){term*=lambda/i;sum+=term}
 return clamp(sum,0,1);
}

export function poissonCountProbability(lambda,line,over=true){
 const n=Number(line);
 if(!Number.isFinite(lambda)||lambda<=0||!Number.isFinite(n))return null;
 const doubled=n*2;
 if(Math.abs(doubled-Math.round(doubled))>1e-8||Math.abs(Math.round(doubled)%2)!==1)return null;
 const cutoff=Math.floor(n);
 const under=poissonCdf(lambda,cutoff);
 return over?1-under:under;
}

export function totalCountProbability(lambdaHome,lambdaAway,line,over=true){
 if(!Number.isFinite(lambdaHome)||!Number.isFinite(lambdaAway))return null;
 return poissonCountProbability(lambdaHome+lambdaAway,line,over);
}

export function countMarketProbability(market,selection,lambdas){
 const type=String(market?.type||'').toUpperCase();
 const outcome=String(selection?.outcome||'').toUpperCase();
 const line=Number(selection?.line??market?.line);
 if(!['OVER','UNDER'].includes(outcome)||!Number.isFinite(line))return null;
 const over=outcome==='OVER';
 if(['CORNERS_OVER_UNDER','TOTAL_CORNERS'].includes(type))return totalCountProbability(lambdas?.home,lambdas?.away,line,over);
 if(['HOME_CORNERS_OVER_UNDER','HOME_CORNERS'].includes(type))return poissonCountProbability(lambdas?.home,line,over);
 if(['AWAY_CORNERS_OVER_UNDER','AWAY_CORNERS'].includes(type))return poissonCountProbability(lambdas?.away,line,over);
 if(['CARDS_OVER_UNDER','TOTAL_CARDS','YELLOW_CARDS_OVER_UNDER'].includes(type))return totalCountProbability(lambdas?.home,lambdas?.away,line,over);
 if(['HOME_CARDS_OVER_UNDER','HOME_CARDS','HOME_YELLOW_CARDS'].includes(type))return poissonCountProbability(lambdas?.home,line,over);
 if(['AWAY_CARDS_OVER_UNDER','AWAY_CARDS','AWAY_YELLOW_CARDS'].includes(type))return poissonCountProbability(lambdas?.away,line,over);
 return null;
}

export const countModelMetrics=Object.freeze(Object.keys(METRICS));
