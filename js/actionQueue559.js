import {store} from './state.js';
import {h,money,modal} from './utils.js';
import {finalMarketVerdict558} from './finalMarketVerdict558.js';
import {ticketRepricingLadder,xtbBuyZones} from './marketSuite554.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const qtyOf=x=>Math.max(1,N(first(x?.qty,x?.quantity,1))||1);

function ticketTarget(ladder,row){
 const days=row.days??ladder?.days;
 const steps=A(ladder?.steps).slice().sort((a,b)=>a.days-b.days);
 if(!steps.length)return null;
 if(days===null||days===undefined)return steps[steps.length-1]?.price||null;
 return (steps.find(x=>days<=x.days)||steps[steps.length-1])?.price||null;
}

function detailFor(row,s,ladderById,buyZoneByTicker){
 if(row.domain==='XTB'){
  const zone=buyZoneByTicker.get(U(row.ticker)),size=row.size||'';
  if(row.verdict==='BUY')return{instruction:`Koupit ${size||'po ověření sizingu'} ${row.ticker||row.name}`.trim(),detail:zone?.good?`Preferovaná buy zóna ≤ ${zone.good}; ideál ${zone.ideal??'—'}.`:row.fx||'Použij planner sizing a aktuální cenu.'};
  if(row.verdict==='SELL')return{instruction:`Prodat ${size||'po ověření sizingu'} ${row.ticker||row.name}`.trim(),detail:row.fx||row.nextStep||'Ruční redukce pozice.'};
  if(row.verdict==='HOLD')return{instruction:`Držet ${row.ticker||row.name}`,detail:row.nextStep||'Bez akce.'};
  if(row.verdict==='WAIT')return{instruction:`Počkat s ${row.ticker||row.name}`,detail:row.nextStep||'Čekat na nový signál.'};
  return{instruction:`Nejdřív ověřit ${row.ticker||row.name}`,detail:A(row.reasons).join(' · ')||row.nextStep||'Chybí spolehlivý podklad.'};
 }
 const item=A(s.ticketBook?.items).find(x=>String(x.id)===String(row.id))||{},qty=qtyOf(item),ladder=ladderById.get(row.id),target=ticketTarget(ladder,row),market=N(row.market||ladder?.market),floor=N(row.floor||ladder?.floor);
 if(row.verdict==='REPRICE')return{instruction:target?`Přecenit ${qty} ks na ${money(target)} / ks`:`Přecenit ${qty} ks až po ověření ceny`,detail:[market?`market ${money(market)}/ks`:'',floor?`floor ${money(floor)}/ks`:'',row.days!==null&&row.days!==undefined?`${row.days} d do termínu`:'' ].filter(Boolean).join(' · ')};
 if(row.verdict==='SELL')return{instruction:`Prodat ${qty} ks ${row.name||'vstupenky'}`,detail:[market?`market ${money(market)}/ks`:'',floor?`nepodlézt ${money(floor)}/ks`:'',row.days!==null&&row.days!==undefined?`${row.days} d do termínu`:'' ].filter(Boolean).join(' · ')};
 if(row.verdict==='HOLD')return{instruction:`Držet ${qty} ks ${row.name||'vstupenky'}`,detail:row.nextStep||'Bez změny ceny.'};
 if(row.verdict==='WAIT')return{instruction:`Počkat s ${row.name||'vstupenkou'}`,detail:row.nextStep||'Čekat na nový market signál.'};
 return{instruction:`Nejdřív ověřit ${row.name||'vstupenku'}`,detail:A(row.reasons).join(' · ')||row.nextStep||'Chybí spolehlivý podklad.'};
}

export function actionQueue559(s=store.get()){
 const started=performance.now(),final=finalMarketVerdict558(s),ladders=ticketRepricingLadder(s),zones=xtbBuyZones(s),ladderById=new Map(ladders.map(x=>[x.id,x])),buyZoneByTicker=new Map(zones.map(x=>[U(x.ticker),x]));
 const rows=final.rows.map(x=>({...x,...detailFor(x,s,ladderById,buyZoneByTicker)}));
 const doNow=rows.filter(x=>['BUY','SELL','REPRICE'].includes(x.verdict)).sort((a,b)=>(b.priority||0)-(a.priority||0)||b.confidence-a.confidence);
 const verify=rows.filter(x=>x.verdict==='DO NOT ACT YET').sort((a,b)=>(b.priority||0)-(a.priority||0)||a.confidence-b.confidence);
 const wait=rows.filter(x=>['HOLD','WAIT'].includes(x.verdict)).sort((a,b)=>(b.priority||0)-(a.priority||0));
 const summary=doNow.length?`${doNow.length} konkrétní kroky jsou připravené k ručnímu provedení.`:verify.length?`Nejdřív ověř ${verify.length} blokované kroky.`:'Teď není potřeba nic provádět.';
 const result={rows,doNow,verify,wait,total:rows.length,summary,generatedAt:new Date().toISOString()};
 window.__KAMIL_ACTION_QUEUE_559_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),doNow:doNow.length,verify:verify.length,wait:wait.length};
 return result;
}

const row=(x,mode)=>`<div class="intel-row"><div class="intel-main"><b>${h(x.instruction)}</b><span>${h(x.detail||x.nextStep||'Bez dalšího detailu.')}</span></div><div class="row-actions"><span class="decision-action ${mode==='now'?'good':mode==='verify'?'bad':'warn'}">${mode==='now'?'UDĚLEJ TEĎ':mode==='verify'?'OVĚŘ':'DRŽ / ČEKEJ'}</span><span class="status">${x.confidence}%</span></div></div>`;

export async function openActionQueue559(){
 const x=actionQueue559(),body=`<div class="metric-strip"><div class="metric"><span>Udělej teď</span><b class="good">${x.doNow.length}</b></div><div class="metric"><span>Nejdřív ověř</span><b class="${x.verify.length?'bad':'good'}">${x.verify.length}</b></div><div class="metric"><span>Drž / čekej</span><b>${x.wait.length}</b></div><div class="metric"><span>Celkem</span><b>${x.total}</b></div></div><div class="card"><div class="eyebrow">ACTION QUEUE 55.9</div><h2>${h(x.summary)}</h2><p>Finální market verdikty převedené na konkrétní ruční kroky.</p></div><div class="card"><div class="eyebrow">UDĚLEJ TEĎ</div>${x.doNow.map(v=>row(v,'now')).join('')||'<div class="empty success-empty">Žádná ověřená akce teď není nutná.</div>'}</div><div class="card"><div class="eyebrow">NEJDŘÍV OVĚŘ</div>${x.verify.map(v=>row(v,'verify')).join('')||'<div class="empty success-empty">Žádný blocker.</div>'}</div><div class="card"><div class="eyebrow">DRŽ & ČEKEJ</div>${x.wait.map(v=>row(v,'wait')).join('')||'<div class="empty">Bez čekajících market položek.</div>'}</div><div class="decision-note">55.9 pouze řadí návrhy. Nic automaticky nenakupuje, neprodává ani nepřecenňuje. Ticket target cena se použije jen z uloženého repricing ladderu; chybějící sizing nebo cenu si Kamil OS nevymýšlí.</div>`;
 const choice=await modal('XTB + vstupenky / Action Queue 55.9',body,[{label:'Exact Today Plan 56.1',value:'today',primary:true},{label:'Zavřít',value:null}]);
 if(choice==='today'){const m=await import('./exactTodayPlan561.js');return m.openExactTodayPlan561()}
 return choice;
}
