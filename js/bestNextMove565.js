import {store} from './state.js';
import {h,modal} from './utils.js';
import {afterActionPreview564} from './afterActionPreview564.js';

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(v||0);
const U=v=>String(v||'').toUpperCase();
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,N(v)));
const round=(v,d=1)=>{const k=10**d;return Math.round(N(v)*k)/k};
const fmt=(v,currency='CZK')=>{if(!Number.isFinite(Number(v)))return '—';const c=U(currency||'CZK');try{return new Intl.NumberFormat('cs-CZ',{style:'currency',currency:c,maximumFractionDigits:c==='CZK'?0:2}).format(Number(v))}catch{return `${Number(v).toLocaleString('cs-CZ',{maximumFractionDigits:2})} ${c}`}};
const keyOf=x=>x.domain==='XTB'?`XTB:${U(x.ticker||x.name)}`:`TICKET:${x.id||x.name}`;

function urgencyPoints(x){
 if(x.domain!=='Vstupenky'||x.days===null||x.days===undefined)return 0;
 const d=N(x.days);if(d<=1)return 20;if(d<=3)return 17;if(d<=7)return 13;if(d<=14)return 8;if(d<=30)return 4;return 0;
}
function previewByKey(preview){
 const m=new Map();for(const x of A(preview?.xtb))m.set(`XTB:${U(x.ticker||x.name)}`,x);for(const x of A(preview?.tickets))m.set(`TICKET:${x.id||x.name}`,x);return m;
}
function scoreCandidate(row,preview){
 const priority=clamp(row.priority),confidence=clamp(row.confidence),reasons=[],warnings=[];
 const priorityPts=round(priority*.45),confidencePts=round(confidence*.35),urgencyPts=urgencyPoints(row);let adjustment=0;
 reasons.push(`priorita ${priority}/100 → ${priorityPts} b`);reasons.push(`confidence ${confidence}% → ${confidencePts} b`);if(urgencyPts)reasons.push(`časová urgence → +${urgencyPts} b`);
 if(row.domain==='XTB'){
  if(preview?.canSimulate&&Number.isFinite(Number(preview.weightBefore))&&Number.isFinite(Number(preview.weightAfter))){
   const before=N(preview.weightBefore),after=N(preview.weightAfter),action=U(row.verdict);
   if(action==='SELL'&&after<before){const gain=Math.min(10,Math.max(2,round((before-after)*1.5)));adjustment+=gain;reasons.push(`snižuje váhu ${before}% → ${after}% → +${gain} b`)}
   if(action==='BUY'&&preview.concentrationAfter==='OK'){adjustment+=4;reasons.push('BUY po simulaci nezvedá koncentraci nad 10 % → +4 b')}
   if(preview.concentrationAfter==='POZOR'){adjustment-=8;warnings.push('Po akci by váha byla v pásmu POZOR.');}
   if(preview.concentrationAfter==='VYSOKÁ KONCENTRACE'){adjustment-=20;warnings.push('Po akci by zůstala vysoká koncentrace.');}
  }else{adjustment-=8;warnings.push('Dopad na XTB váhu nejde spolehlivě dopočítat.');}
  if(row.capitalDirection==='RELEASE'&&N(row.capitalAmount)>0){adjustment+=4;reasons.push(`uvolní kapitál ${fmt(row.capitalAmount,row.capitalCurrency||'CZK')} → +4 b`)}
 }else{
  const action=U(row.verdict),profit=preview?.conditionalProfit;
  if(action==='SELL'&&profit!==null&&profit!==undefined){if(N(profit)>0){adjustment+=6;reasons.push(`podmíněný P/L ${fmt(profit)} → +6 b`)}else if(N(profit)<0){adjustment-=10;warnings.push(`Podmíněný P/L je ${fmt(profit)}.`)}}
  if(['SELL','REPRICE'].includes(action)&&N(preview?.targetPrice)>0&&N(preview?.safePrice)>0){if(N(preview.targetPrice)>=N(preview.safePrice)){adjustment+=4;reasons.push('navržená cena drží floor → +4 b')}else{adjustment-=20;warnings.push('Navržená cena je pod floor.');}}
 }
 const score=round(Math.max(0,Math.min(100,priorityPts+confidencePts+urgencyPts+adjustment)));
 return{...row,key:keyOf(row),score,scoreParts:{priority:priorityPts,confidence:confidencePts,urgency:urgencyPts,adjustment:round(adjustment)},reasons,warnings,preview:preview||null};
}

export function rankBestNextMove565(preview){
 const byKey=previewByKey(preview),rows=A(preview?.plan?.now).map(x=>scoreCandidate(x,byKey.get(keyOf(x)))).sort((a,b)=>b.score-a.score||N(b.priority)-N(a.priority)||N(b.confidence)-N(a.confidence)||String(a.name||a.ticker).localeCompare(String(b.name||b.ticker),'cs'));
 const winner=rows[0]||null,runnerUp=rows[1]||null,margin=winner&&runnerUp?round(winner.score-runnerUp.score):winner?winner.score:null,selection=winner?(runnerUp?(margin>=12?'JASNÉ':margin>=5?'DOBRÉ':'TĚSNÉ'):'JEDINÁ AKCE'):'ŽÁDNÁ AKCE';
 return{rows,winner,runnerUp,margin,selection,total:rows.length};
}

export function bestNextMove565(s=store.get()){
 const started=performance.now(),preview=afterActionPreview564(s),ranked=rankBestNextMove565(preview),winner=ranked.winner;
 const summary=!winner?'Teď není žádný bezpečně ověřený krok k provedení.':ranked.selection==='TĚSNÉ'?`${winner.instruction||winner.name} má nejlepší skóre, ale náskok je malý.`:`Nejlepší další krok: ${winner.instruction||winner.name}.`;
 const result={...ranked,preview,summary,generatedAt:new Date().toISOString()};window.__KAMIL_BEST_MOVE_565_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),total:ranked.total,score:winner?.score??null,selection:ranked.selection};return result;
}

const candidateRow=(x,i)=>`<div class="intel-row"><div class="intel-main"><b>${h(`${i+1}. ${x.instruction||x.name||x.ticker}`)}</b><span>${h([...x.reasons,...x.warnings].join(' · '))}</span></div><div class="row-actions"><span class="decision-action ${i===0?'good':'warn'}">${i===0?'BEST':'ALTERNATIVA'}</span><span class="status">${x.score}/100</span></div></div>`;

export async function openBestNextMove565(){
 const x=bestNextMove565(),w=x.winner,body=`<div class="metric-strip"><div class="metric"><span>Best score</span><b class="${w?'good':''}">${w?w.score:'—'}</b></div><div class="metric"><span>Náskok</span><b>${x.margin===null?'—':x.margin}</b></div><div class="metric"><span>Výběr</span><b>${h(x.selection)}</b></div><div class="metric"><span>Kandidáti</span><b>${x.total}</b></div></div><div class="card"><div class="eyebrow">BEST NEXT MOVE 56.5</div><h2>${h(x.summary)}</h2>${w?`<p><b>${h(w.instruction||w.name||w.ticker)}</b> · ${h(w.domain)} · confidence ${w.confidence}% · priorita ${w.priority||0}/100.</p><p>${h([...w.reasons,...w.warnings].join(' · '))}</p>`:'<div class="empty success-empty">Nevyrábět akci jen proto, aby se něco dělo.</div>'}</div><div class="card"><div class="eyebrow">POŘADÍ PROVEDITELNÝCH KROKŮ</div>${x.rows.map(candidateRow).join('')||'<div class="empty">Žádné kandidáty.</div>'}</div><div class="decision-note">56.5 řadí pouze kroky, které už prošly Final Verdictem. Score je priorita provedení, ne pravděpodobnost zisku ani predikce ceny. Nic automaticky nenakupuje, neprodává, nepřevádí ani nepřecenňuje.</div>`;
 const choice=await modal('XTB + vstupenky / Best Next Move 56.5',body,[{label:'Action Sequence 56.6',value:'sequence',primary:true},{label:'Zavřít',value:null}]);
 if(choice==='sequence'){const m=await import('./actionSequence566.js');return m.openActionSequence566()}
 return choice;
}
