import {store} from './state.js';
import {h,modal} from './utils.js';
import {finalMarketVerdict558} from './finalMarketVerdict558.js';
import {xtbBuyZones,ticketRepricingLadder,ticketMinimumSafePrice} from './marketSuite554.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const round=(v,d=2)=>{if(v===null||v===undefined||v==='')return null;const n=Number(v);if(!Number.isFinite(n))return null;const k=10**d;return Math.round(n*k)/k};
const fmt=v=>v===null||v===undefined?'—':Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:2});
const ticketItems=s=>A(s.ticketBook?.items);

function ladderTarget(ladder,days){
 const steps=A(ladder?.steps).slice().sort((a,b)=>a.days-b.days);
 if(!steps.length)return null;
 if(days===null||days===undefined)return steps[steps.length-1]?.price??null;
 return (steps.find(x=>days<=x.days)||steps[steps.length-1])?.price??null;
}

export function buildDecisionSnapshot563(s=store.get()){
 const final=finalMarketVerdict558(s),zones=new Map(xtbBuyZones(s).map(x=>[U(x.ticker),x])),ladders=new Map(ticketRepricingLadder(s).map(x=>[String(x.id),x])),safe=new Map(ticketMinimumSafePrice(s).map(x=>[String(x.id),x])),tickets=new Map(ticketItems(s).map(x=>[String(x.id),x]));
 const xtbAsOf=first(s.xtbReport?.asOf,s.xtbHub?.asOf,null);
 const rows=final.rows.map(x=>{
  if(x.domain==='XTB'){
   const z=zones.get(U(x.ticker))||{};
   return{key:`XTB:${U(x.ticker||x.name)}`,domain:'XTB',ticker:x.ticker||null,id:null,name:x.name||x.ticker||'XTB',verdict:x.verdict,originalAction:x.originalAction,readiness:x.readiness||null,confidence:N(x.confidence),severity:x.severity||'OK',market:round(z.reference),target:round(z.good),floor:null,days:null,sourceAt:xtbAsOf};
  }
  const item=tickets.get(String(x.id))||{},ladder=ladders.get(String(x.id))||{},floor=safe.get(String(x.id))?.safePrice??x.floor??null,market=first(item.marketPrice,item.listPrice,item.price,x.market,null),days=x.days??ladder.days??null,target=ladderTarget(ladder,days),sourceAt=first(item.marketCheckedAt,item.marketUpdatedAt,item.priceCheckedAt,null);
  return{key:`TICKET:${String(x.id||x.name)}`,domain:'Vstupenky',ticker:null,id:x.id??null,name:x.name||item.name||'Vstupenka',verdict:x.verdict,originalAction:x.originalAction,readiness:x.readiness||null,confidence:N(x.confidence),severity:x.severity||'OK',market:round(market),target:round(target),floor:round(floor),days,sourceAt};
 });
 return{id:`market-${Date.now()}`,at:new Date().toISOString(),xtbAsOf,rows};
}

function numericChange(label,before,after,unit=''){
 const a=round(before),b=round(after);if(a===b)return null;
 return`${label} ${fmt(a)}${unit} → ${fmt(b)}${unit}`;
}

function comparePair(before,after){
 const details=[],flags=[];
 if(!before&&after)return{type:'NEW',material:true,verdictChanged:false,details:['Nová market položka'],flags:['NEW']};
 if(before&&!after)return{type:'REMOVED',material:true,verdictChanged:false,details:['Položka už není v aktivním market setu'],flags:['REMOVED']};
 const verdictChanged=before.verdict!==after.verdict;
 if(verdictChanged){details.push(`${before.verdict} → ${after.verdict}`);flags.push('VERDICT')}
 if(before.readiness!==after.readiness){details.push(`readiness ${before.readiness||'—'} → ${after.readiness||'—'}`);flags.push('READINESS')}
 if(before.severity!==after.severity){details.push(`konflikt ${before.severity||'OK'} → ${after.severity||'OK'}`);flags.push('CONFLICT')}
 const confDelta=N(after.confidence)-N(before.confidence);if(confDelta!==0){details.push(`confidence ${N(before.confidence)} % → ${N(after.confidence)} % (${confDelta>0?'+':''}${confDelta})`);flags.push('CONFIDENCE')}
 const market=numericChange('market',before.market,after.market);if(market){details.push(market);flags.push('MARKET')}
 const target=numericChange('target',before.target,after.target);if(target){details.push(target);flags.push('TARGET')}
 const floor=numericChange('floor',before.floor,after.floor);if(floor){details.push(floor);flags.push('FLOOR')}
 const sourceChanged=String(before.sourceAt||'')!==String(after.sourceAt||'');
 if(sourceChanged&&!details.length){details.push('Data byla obnovena, ale finální verdikt zůstal stejný.');flags.push('REFRESH')}
 const material=verdictChanged||flags.some(x=>['READINESS','CONFLICT','MARKET','TARGET','FLOOR'].includes(x))||Math.abs(confDelta)>=5;
 return{type:verdictChanged?'VERDICT_CHANGE':material?'MATERIAL_CHANGE':sourceChanged?'DATA_REFRESH':'UNCHANGED',material,verdictChanged,details,flags};
}

export function decisionChangeTracker563(s=store.get()){
 const started=performance.now(),current=buildDecisionSnapshot563(s),history=A(s.marketDecisionHistory?.snapshots),baseline=history[0]||null;
 if(!baseline){const result={current,baseline:null,changes:[],material:[],refreshOnly:[],unchanged:current.rows.length,needsBaseline:true,total:current.rows.length,summary:'Chybí referenční snapshot. Ulož současný stav jako baseline až po ručním potvrzení.',generatedAt:new Date().toISOString()};window.__KAMIL_CHANGE_TRACKER_563_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),changes:0,needsBaseline:true};return result}
 const before=new Map(A(baseline.rows).map(x=>[x.key,x])),after=new Map(A(current.rows).map(x=>[x.key,x])),keys=[...new Set([...before.keys(),...after.keys()])],changes=[];
 for(const key of keys){const b=before.get(key)||null,a=after.get(key)||null,c=comparePair(b,a);if(c.type==='UNCHANGED')continue;const row=a||b;changes.push({...row,before:b,after:a,...c})}
 const material=changes.filter(x=>x.material),refreshOnly=changes.filter(x=>!x.material),unchanged=Math.max(0,keys.length-changes.length),verdictChanges=changes.filter(x=>x.verdictChanged).length;
 changes.sort((a,b)=>(b.verdictChanged?1:0)-(a.verdictChanged?1:0)||(b.material?1:0)-(a.material?1:0)||N(a.after?.confidence)-N(b.after?.confidence));
 const summary=verdictChanges?`${verdictChanges} finální verdikty se od baseline změnily.`:material.length?`${material.length} market položek má materiální změnu.`:refreshOnly.length?`Data se obnovila, ale bez materiální změny verdiktu.`:'Od baseline se nic podstatného nezměnilo.';
 const result={current,baseline,changes,material,refreshOnly,unchanged,needsBaseline:false,total:keys.length,summary,generatedAt:new Date().toISOString()};window.__KAMIL_CHANGE_TRACKER_563_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),changes:changes.length,material:material.length,verdictChanges,needsBaseline:false};return result;
}

function saveBaseline563(snapshot){
 store.mutate('Market 56.3 · uložit decision baseline',s=>{s.marketDecisionHistory=s.marketDecisionHistory&&typeof s.marketDecisionHistory==='object'?s.marketDecisionHistory:{snapshots:[]};s.marketDecisionHistory.snapshots=A(s.marketDecisionHistory.snapshots);s.marketDecisionHistory.snapshots.unshift(snapshot);s.marketDecisionHistory.snapshots=s.marketDecisionHistory.snapshots.slice(0,12)});
}

const changeRow=x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.name||x.ticker)}</b><span>${h(x.details.join(' · '))}</span></div><div class="row-actions"><span class="decision-action ${x.verdictChanged?'bad':x.material?'warn':'good'}">${h(x.verdictChanged?'ZMĚNA VERDIKTU':x.material?'ZMĚNA':'REFRESH')}</span>${x.after?.confidence!==undefined?`<span class="status">${x.after.confidence}%</span>`:''}</div></div>`;

export async function openDecisionChangeTracker563(){
 const x=decisionChangeTracker563(),baselineText=x.baseline?new Date(x.baseline.at).toLocaleString('cs-CZ'):'není uložený',body=`<div class="metric-strip"><div class="metric"><span>Změny</span><b class="${x.material.length?'warn':'good'}">${x.material.length}</b></div><div class="metric"><span>Refresh only</span><b>${x.refreshOnly.length}</b></div><div class="metric"><span>Beze změny</span><b>${x.unchanged}</b></div><div class="metric"><span>Baseline</span><b>${h(baselineText)}</b></div></div><div class="card"><div class="eyebrow">DECISION CHANGE TRACKER 56.3</div><h2>${h(x.summary)}</h2><p>Porovnání je jen proti poslednímu ručně uloženému baseline. Samotné otevření nic nezapisuje.</p></div><div class="card"><div class="eyebrow">CO SE ZMĚNILO</div>${x.changes.map(changeRow).join('')||'<div class="empty success-empty">Žádná změna proti baseline.</div>'}</div><div class="decision-note">56.3 nic nesleduje na pozadí. Baseline se uloží pouze po explicitním potvrzení a zápis jde přes standardní Undo + audit.</div>`;
 const choice=await modal('XTB + vstupenky / Decision Changes 56.3',body,[{label:x.baseline?'Uložit nový baseline':'Uložit první baseline',value:'baseline',primary:true},{label:'Zavřít',value:null}]);
 if(choice!=='baseline')return choice;
 if(!x.current.rows.length)return modal('Baseline 56.3','<div class="card"><h2>Není co uložit</h2><p>Nejdřív potřebujeme alespoň jednu XTB nebo ticket market položku.</p></div>',[{label:'Zavřít',value:null,primary:true}]);
 const confirm=await modal('Potvrdit market baseline',`<div class="card"><div class="eyebrow">EXPLICITNÍ ZÁPIS</div><h2>Uložit současný market stav jako baseline?</h2><p>Uloží se ${x.current.rows.length} rozhodovacích řádků. Předchozí baseline zůstane v historii a změnu lze vrátit přes Undo.</p></div>`,[{label:'Ano, uložit baseline',value:'save',primary:true},{label:'Zrušit',value:null}]);
 if(confirm==='save'){saveBaseline563(x.current);return openDecisionChangeTracker563()}
 return null;
}
