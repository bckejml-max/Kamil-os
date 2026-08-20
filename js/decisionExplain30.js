const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
const clean=(v,max=500)=>String(v??'').trim().slice(0,max);
const has=v=>v!==null&&v!==undefined&&v!=='';

export function decisionExplain30(decision={}){
 const score=clamp(decision.priority),raw=decision.explain&&typeof decision.explain==='object'?decision.explain:{},facts=[];
 const add=v=>{const x=clean(v);if(x&&!facts.includes(x))facts.push(x)};
 if(Array.isArray(raw.facts))raw.facts.forEach(add);
 if(!facts.length)add(decision.reason||decision.detail||'');
 const engine=clean(raw.engine||decision.kind||decision.source||'PRIORITIZAČNÍ ENGINE',120)||'PRIORITIZAČNÍ ENGINE';
 const rule=clean(raw.rule,700)||`Priorita ${score}/100 je převzatá z existujícího rozhodovacího výstupu; Kamil OS 30.3 ji nepřepočítává.`;
 return {score,engine,rule,facts:facts.slice(0,6),source:has(decision.source)?clean(decision.source,160):null,confidence:has(decision.confidence)?decision.confidence:null,note:'Vysvětlení používá jen skutečné pole rozhodnutí a metadata, která vytvořil původní scoring engine. 30.3 pořadí ani score nemění.'};
}

export const decisionExplain30Note='„Proč teď?“ je auditní vrstva nad existujícím scoringem. Nevymýšlí termíny, zdroje ani confidence a nepřepočítává prioritu.';
