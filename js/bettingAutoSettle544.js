const STORE='kamil_betting_ledger_543';
const RESULT_API='/api/market-history?source=bet_results';
const VERSION='544.0.0';
const SETTLEABLE=new Set(['MATCH_RESULT','MATCH_ODDS','BOTH_TEAMS_TO_SCORE','OVER_UNDER','TOTAL_GOALS','HOME_OVER_UNDER','AWAY_OVER_UNDER','TEAM_TOTALS','ASIAN_HANDICAP','MATCH_HANDICAP']);
const norm=v=>String(v||'').toUpperCase();
function read(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return{bets:[]}}}
function write(s){localStorage.setItem(STORE,JSON.stringify({...s,updatedAt:new Date().toISOString()}))}
function number(v){const n=Number(v);return Number.isFinite(n)?n:null}
function settleFromScore(bet,fixture){
 const hg=number(fixture?.homeGoals),ag=number(fixture?.awayGoals);if(hg===null||ag===null)return null;
 const market=norm(bet.market),sel=norm(bet.selection||bet.label),line=number(bet.line);
 if(!SETTLEABLE.has(market))return null;
 if(market==='MATCH_RESULT'||market==='MATCH_ODDS'){
  if(sel.includes('HOME')||sel.includes('DOM')||sel.includes('1'))return hg>ag?'WIN':'LOSS';
  if(sel.includes('DRAW')||sel.includes('REM')||sel==='X')return hg===ag?'WIN':'LOSS';
  if(sel.includes('AWAY')||sel.includes('HOST')||sel.includes('2'))return ag>hg?'WIN':'LOSS';
 }
 if(market==='BOTH_TEAMS_TO_SCORE'){
  const yes=hg>0&&ag>0;if(sel.includes('YES')||sel.includes('ANO'))return yes?'WIN':'LOSS';if(sel.includes('NO')||sel.includes('NE'))return !yes?'WIN':'LOSS';
 }
 if(['OVER_UNDER','TOTAL_GOALS'].includes(market)&&line!==null){const total=hg+ag;if(sel.includes('OVER')||sel.includes('NAD'))return total>line?'WIN':'LOSS';if(sel.includes('UNDER')||sel.includes('POD'))return total<line?'WIN':'LOSS'}
 if(market==='HOME_OVER_UNDER'&&line!==null){if(sel.includes('OVER')||sel.includes('NAD'))return hg>line?'WIN':'LOSS';if(sel.includes('UNDER')||sel.includes('POD'))return hg<line?'WIN':'LOSS'}
 if(market==='AWAY_OVER_UNDER'&&line!==null){if(sel.includes('OVER')||sel.includes('NAD'))return ag>line?'WIN':'LOSS';if(sel.includes('UNDER')||sel.includes('POD'))return ag<line?'WIN':'LOSS'}
 if(['ASIAN_HANDICAP','MATCH_HANDICAP'].includes(market)&&line!==null){
  if(sel.includes('HOME')||sel.includes('DOM'))return hg+line>ag?'WIN':'LOSS';
  if(sel.includes('AWAY')||sel.includes('HOST'))return ag+line>hg?'WIN':'LOSS';
 }
 return null;
}
async function fetchMatches(bets){try{const r=await fetch(RESULT_API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({bets})});return r.ok?await r.json():null}catch{return null}}
function observedClv(bet){const betOdds=number(bet.odds),close=number(bet.closingOdds||bet.lastObservedOdds);if(!betOdds||!close)return null;return (betOdds/close-1)*100}
function syncView(state,summary){
 const root=document.querySelector('#bettingView');if(!root)return;
 let box=root.querySelector('[data-bet544]');if(!box){box=document.createElement('section');box.dataset.bet544='1';box.style.cssText='padding:10px 12px;border:1px solid rgba(96,165,250,.12);border-radius:10px;background:rgba(7,19,31,.5);font-size:10px;color:#8198ab';const anchor=root.querySelector('[data-bet543]');anchor?.insertAdjacentElement('afterend',box)}
 if(box)box.innerHTML=`<b style="color:#dce8f1">OS544 Auto-settlement</b> · ${summary.settled} automaticky uzavřeno · ${summary.pending} čeká · ${summary.skipped} nepodporovaných · CLV: poslední pozorovaný kurz, dokud nemáme 24/7 closing snapshot.`;
 window.__KAMIL_BETTING_AUTOSETTLE544__={version:VERSION,...summary,at:Date.now()};
}
export async function runBettingAutoSettle544(){
 const state=read();state.bets=Array.isArray(state.bets)?state.bets:[];
 const open=state.bets.filter(b=>norm(b.status||'OPEN')==='OPEN');if(!open.length){syncView(state,{settled:0,pending:0,skipped:0});return}
 const payload=await fetchMatches(open);let settled=0,pending=0,skipped=0;
 const matches=new Map((payload?.matches||[]).map(m=>[String(m.betId),m]));
 for(const bet of open){
  const market=norm(bet.market);if(!SETTLEABLE.has(market)){skipped++;continue}
  const hit=matches.get(String(bet.id));if(!hit||norm(hit.fixture?.status)!=='FT'){pending++;continue}
  const result=settleFromScore(bet,hit.fixture);if(!result){pending++;continue}
  bet.status=result;bet.settledAt=new Date().toISOString();bet.resultSource='api-football';bet.finalScore=`${hit.fixture.homeGoals}:${hit.fixture.awayGoals}`;bet.resultFixtureId=hit.fixture.fixtureId;bet.matchConfidence=hit.confidence;
  bet.pnlCzk=result==='WIN'?Number(bet.stakeCzk||0)*(Number(bet.odds||0)-1):-Number(bet.stakeCzk||0);
  bet.observedClvPct=observedClv(bet);settled++;
 }
 if(settled)write(state);syncView(state,{settled,pending,skipped});
}
function boot(){runBettingAutoSettle544();setInterval(runBettingAutoSettle544,15*60*1000)}
boot();
