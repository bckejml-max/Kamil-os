import {store} from './state.js';
import {h,modal} from './utils.js';
import {recheckTriggers562} from './recheckTriggers562.js';
import {commanderDecision590} from './marketCommander587.js';
import {postExecutionReality593} from './postExecutionReality593.js';

const A=v=>Array.isArray(v)?v:[];
const U=v=>String(v||'').toUpperCase();
const WORK_RE=/zak[aá]zk|faktur|dodavat|cest[aá]k|doch[aá]zk|ředitel|reditel|pks|cpi|zbrojov|\bzl\b|projektov[aá] karta|pracovn/i;
const personal=x=>!WORK_RE.test(`${x?.title||''} ${x?.name||''} ${x?.subject||''} ${x?.area||''} ${x?.category||''} ${x?.project||''} ${x?.event||''} ${x?.instruction||''}`);

function realityBlockers(s){
 const x=postExecutionReality593(s),rank={MISMATCH:0,PARTIAL:1,UNKNOWN:2,MATCH:9};
 return A(x.rows).filter(personal).filter(r=>r.realityCode!=='MATCH').map(r=>({
  source:'REALITY',priority:rank[r.realityCode]??5,key:r.key||r.id||r.ticker,name:r.instruction||r.key||'Ruční market akce',status:r.realityCode,
  when:r.realityCode==='UNKNOWN'?'TEĎ / PO REFRESHI':'TEĎ',
  text:r.realityCode==='MISMATCH'?`Vyřeš rozpor mezi execution receiptem a novým zdrojovým stavem: ${r.realityReason}`:r.realityCode==='PARTIAL'?`Prověř částečně potvrzenou ruční akci: ${r.realityReason}`:`Obnov zdrojová data; reality check zatím nemá dost důkazů. ${r.realityReason}`
 }));
}

function recheckBlockers(s){
 const x=recheckTriggers562(s),rows=[...A(x.verifyNow),...A(x.waiting)].filter(personal);
 return rows.map((r,i)=>({source:'RECHECK',priority:r.mode==='VERIFY_NOW'?10+i:30+i,key:r.id||r.ticker||r.name,name:r.name||r.ticker||'Market položka',status:r.mode,when:r.primary?.when||'PŘI NOVÝCH DATECH',text:r.primary?.text||r.nextStep||'Doplň chybějící data a spusť Commander znovu.'}));
}

export function commanderBlockerResolver594(s=store.get()){
 const started=performance.now(),decision=commanderDecision590(s),rows=[...realityBlockers(s),...recheckBlockers(s)].sort((a,b)=>a.priority-b.priority),top=rows[0]||null;
 const result=top?{blocked:true,top,rows,decision,summary:`Nejdřív vyřeš: ${top.text}`}:{blocked:false,top:null,rows:[],decision,summary:decision.mode==='ACT'?'Žádný známý blocker. Commander má ruční ACT krok.':'Žádný konkrétní blocker není známý; čekej na nový market trigger nebo čerstvá data.'};
 if(typeof window!=='undefined')window.__KAMIL_BLOCKER_594_LAST__={ms:Math.round((performance.now()-started)*10)/10,at:Date.now(),blocked:result.blocked,total:rows.length,source:top?.source||null,status:top?.status||null};
 return result;
}

const row=x=>`<div class="intel-row"><div class="intel-main"><b>${h(x.name)}</b><span>${h(`${x.when}: ${x.text}`)}</span></div><div class="row-actions"><span class="decision-action ${x.source==='REALITY'?'bad':'warn'}">${h(x.source)}</span></div></div>`;

export async function openCommanderBlocker594(){
 const x=commanderBlockerResolver594(),body=`<div class="metric-strip"><div class="metric"><span>Blokováno</span><b class="${x.blocked?'bad':'good'}">${x.blocked?'ANO':'NE'}</b></div><div class="metric"><span>Známé blokery</span><b>${x.rows.length}</b></div><div class="metric"><span>Commander režim</span><b>${h(x.decision.mode)}</b></div></div><div class="card"><div class="eyebrow">COMMANDER BLOCKER RESOLVER 59.4</div><h2>${h(x.summary)}</h2>${x.top?`<p><b>${h(x.top.when)}</b> · ${h(x.top.name)}</p>`:'<p>Žádný konkrétní blocker není potřeba řešit teď.</p>'}</div><div class="card"><div class="eyebrow">POŘADÍ ODBLOKOVÁNÍ</div>${x.rows.slice(0,8).map(row).join('')||'<div class="empty success-empty">Bez známých blockerů.</div>'}</div><div class="decision-note">59.4 pouze řadí už existující blokery z Post-Execution Reality 59.3 a Recheck Triggers 56.2. Nic nesleduje na pozadí, nic neopravuje automaticky a nic neobchoduje, neprodává ani nepřecenňuje.</div>`;
 return modal('XTB + vstupenky / Commander Blocker Resolver 59.4',body,[{label:'Zavřít',value:null,primary:true}]);
}
