import {store} from './state.js';
import {h,modal} from './utils.js';
import {exactTodayPlan561} from './exactTodayPlan561.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&x!=='')??null;
const keyOf=x=>x.domain==='XTB'?`XTB:${U(x.ticker||x.name)}`:`TICKET:${x.id||x.name}`;
const pct=(a,b)=>a&&Number.isFinite(N(a))?Math.round((N(b)-N(a))/Math.abs(N(a))*1000)/10:null;
const fmt=v=>Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:2});
const bucketRows=(p,bucket)=>A(p).map(x=>({...x,bucket}));

export function buildDecisionSnapshot563(s=store.get()){
 const p=exactTodayPlan561(s),ticketById=new Map(A(s.ticketBook?.items).map(x=>[String(x.id),x])),xtbAsOf=first(s.xtbReport?.asOf,s.xtbHub?.asOf,null);
 const rows=[...bucketRows(p.now,'NOW'),...bucketRows(p.verify,'VERIFY'),...bucketRows(p.wait,'WAIT')].map(x=>{
  const t=x.domain==='Vstupenky'?ticketById.get(String(x.id))||{}:{};
  return{key:keyOf(x),domain:x.domain,name:x.name||x.ticker||'—',ticker:x.ticker||null,id:x.id||null,verdict:U(x.verdict||x.originalAction||'WAIT'),bucket:x.bucket,confidence:N(x.confidence),readiness:x.readiness||null,severity:x.severity||null,targetPrice:x.targetPrice??null,safePrice:x.safePrice??null,market:x.domain==='Vstupenky'?N(first(t.marketPrice,t.listPrice,t.price))||null:null,exactQty:x.exactQty??null,capitalAmount:x.capitalAmount??null,capitalCurrency:x.capitalCurrency||null,xtbAsOf:x.domain==='XTB'?xtbAsOf:null,marketCheckedAt:x.domain==='Vstupenky'?first(t.marketCheckedAt,t.marketUpdatedAt,t.priceCheckedAt,null):null};
 });
 return{at:new Date().toISOString(),xtbAsOf,rows};
}

function diffRow(prev,cur){
 const reasons=[];let score=0;
 if(!prev){return{type:'NEW',score:80,reasons:['Nová položka v market plánu.']}}
 if(!cur){return{type:'REMOVED',score:80,reasons:['Položka už není v aktivním market plánu.']}}
 if(U(prev.verdict)!==U(cur.verdict)){reasons.push(`Verdikt ${prev.verdict||'—'} → ${cur.verdict||'—'}`);score+=70}
 if(prev.bucket!==cur.bucket){reasons.push(`Fronta ${prev.bucket||'—'} → ${cur.bucket||'—'}`);score+=45}
 if((prev.readiness||'')!==(cur.readiness||'')){reasons.push(`Readiness ${prev.readiness||'—'} → ${cur.readiness||'—'}`);score+=35}
 if(N(prev.confidence)!==N(cur.confidence)){const d=N(cur.confidence)-N(prev.confidence);reasons.push(`Confidence ${N(prev.confidence)} → ${N(cur.confidence)} (${d>=0?'+':''}${d})`);score+=Math.min(25,Math.abs(d))}
 if(prev.domain==='Vstupenky'){
  if(N(prev.market)!==N(cur.market)){const d=pct(prev.market,cur.market);reasons.push(`Market ${prev.market?fmt(prev.market):'—'} → ${cur.market?fmt(cur.market):'—'} Kč${d===null?'':` (${d>=0?'+':''}${d} %)`}`);score+=Math.abs(d||0)>=5?30:15}
  if(N(prev.targetPrice)!==N(cur.targetPrice)){reasons.push(`Target ${prev.targetPrice?fmt(prev.targetPrice):'—'} → ${cur.targetPrice?fmt(cur.targetPrice):'—'} Kč`);score+=25}
  if(N(prev.safePrice)!==N(cur.safePrice)){reasons.push(`Floor ${prev.safePrice?fmt(prev.safePrice):'—'} → ${cur.safePrice?fmt(cur.safePrice):'—'} Kč`);score+=20}
  if(prev.marketCheckedAt!==cur.marketCheckedAt&&cur.marketCheckedAt){reasons.push('Market kontrola je novější.');score+=10}
 }else if(prev.xtbAsOf!==cur.xtbAsOf&&cur.xtbAsOf){reasons.push('XTB import je novější.');score+=10}
 return{type:reasons.length?'CHANGED':'SAME',score,reasons};
}

export function decisionChangeTracker563(s=store.get()){
 const started=performance.now(),current=buildDecisionSnapshot563(s),history=A(s.marketDecisionHistory?.snapshots),previous=history.length?history[history.length-1]:null;
 const prevMap=new Map(A(previous?.rows).map(x=>[x.key,x])),curMap=new Map(current.rows.map(x=>[x.key,x])),keys=new Set([...prevMap.keys(),...curMap.keys()]);
 const rows=[...keys].map(key=>{const prev=prevMap.get(key)||null,cur=curMap.get(key)||null,d=diffRow(prev,cur),base=cur||prev;return{key,...base,previous:prev,current:cur,...d,level:d.score>=70?'ZÁSADNÍ':d.score>=30?'VÝZNAMNÁ':d.score>0?'MALÁ':'BEZE ZMĚNY'};}).sort((a,b)=>b.score-a.score||String(a.name).localeCompare(String(b.name),'cs'));
 const changed=rows.filter(x=>x.type!=='SAME'),major=rows.filter(x=>x.score>=70),priceChanges=rows.filter(x=>A(x.reasons).some(r=>/^Market |^Target |^Floor /.test(r)));
 const summary=!previous?'Zatím není uložený baseline. Ulož první snapshot až po vlastní kontrole.':major.length?`${major.length} zásadní změny od posledního snapshotu.`:changed.length?`${changed.length} změn od poslední kontroly.`:'Verdikty se od posledního snapshotu nezměnily.';
 const result={current,previous,rows,changed,major,priceChanges,total:rows.length,summary,generatedAt:new Date().toISOString()};
 window.__KAMIL_CHANGE_563_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),hasBaseline:!!previous,changed:changed.length,major:major.length};
 return result;
}

export function saveDecisionSnapshot563(){
 const snap=buildDecisionSnapshot563(store.get());
 store.mutate('Market snapshot 56.3',s=>{s.marketDecisionHistory=s.marketDecisionHistory||{snapshots:[]};s.marketDecisionHistory.snapshots=A(s.marketDecisionHistory.snapshots);s.marketDecisionHistory.snapshots.push(snap);s.marketDecisionHistory.snapshots=s.marketDecisionHistory.snapshots.slice(-12)});
 return snap;
}

const row=x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.name||x.ticker)}</b><span>${h(x.reasons.length?x.reasons.join(' · '):'Beze změny.')}</span></div><div class="row-actions"><span class="decision-action ${x.score>=70?'bad':x.score>=30?'warn':'good'}">${h(x.level)}</span>${x.current?.confidence!==undefined?`<span class="status">${x.current.confidence}%</span>`:''}</div></div>`;

export async function openDecisionChangeTracker563(){
 const x=decisionChangeTracker563(),body=`<div class="metric-strip"><div class="metric"><span>Zásadní</span><b class="${x.major.length?'bad':'good'}">${x.major.length}</b></div><div class="metric"><span>Změny</span><b>${x.changed.length}</b></div><div class="metric"><span>Cena / floor</span><b>${x.priceChanges.length}</b></div><div class="metric"><span>Baseline</span><b>${x.previous?'ANO':'NE'}</b></div></div><div class="card"><div class="eyebrow">DECISION CHANGE TRACKER 56.3</div><h2>${h(x.summary)}</h2><p>Porovnává aktuální XTB + ticket verdikty pouze s posledním ručně uloženým snapshotem.</p></div><div class="card"><div class="eyebrow">CO SE ZMĚNILO</div>${x.changed.map(row).join('')||'<div class="empty success-empty">Žádná změna.</div>'}</div>${x.previous?`<div class="card"><div class="eyebrow">BEZE ZMĚNY</div>${x.rows.filter(v=>v.type==='SAME').slice(0,8).map(row).join('')||'<div class="empty">Všechny položky se změnily.</div>'}</div>`:''}<div class="decision-note">56.3 nic nesleduje na pozadí. Snapshot se uloží jen po dvou explicitních kliknutích; zápis je auditovaný a undoable. Žádný obchod, prodej ticketu ani repricing se neprovádí.</div>`;
 const choice=await modal('XTB + vstupenky / Změny 56.3',body,[{label:'Uložit nový snapshot',value:'save',primary:true},{label:'Zavřít',value:null}]);
 if(choice!=='save')return choice;
 const ok=await modal('Potvrdit market snapshot','<div class="card"><div class="eyebrow">RUČNÍ BASELINE</div><h2>Uložit současné verdikty jako nový výchozí bod?</h2><p>Příští Change Tracker porovná změny proti tomuto snapshotu.</p></div>',[{label:'Potvrdit uložení',value:'yes',primary:true},{label:'Zrušit',value:null}]);
 if(ok==='yes'){saveDecisionSnapshot563();return modal('Snapshot uložen','<div class="empty success-empty">Nový market baseline je uložen. Příští porovnání ukáže změny proti němu.</div>',[{label:'Hotovo',value:null,primary:true}])}
 return null;
}
