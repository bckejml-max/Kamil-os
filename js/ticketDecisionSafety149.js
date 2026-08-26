const N=v=>Number(v||0),U=v=>String(v||'').toUpperCase();
const ACTIONABLE=new Set(['LIST','REPRICE','LOWER','RAISE']);
export function ticketDecisionSafety149(ticket={},decision={}){
 const action=U(decision.action),pricing=decision.pricingPlan||{},quality=decision.dataQuality||{};
 if(!ACTIONABLE.has(action))return decision;
 if(U(decision.source)==='RUČNĚ')return decision;
 const issues=[];
 if(quality.ready===false)issues.push(...(quality.criticalMissing||[]).map(x=>x.label||x.key).filter(Boolean));
 if(!pricing.marketFresh)issues.push('market cena není čerstvá');
 if(!pricing.marketSourced)issues.push('market cena nemá ověřený zdroj');
 if(decision.liveTrust==='UNTRUSTED'||decision.liveTrustIssues?.length)issues.push('živý signál neprošel trust kontrolou');
 if(decision.multiMarketConflict===true)issues.push('resale zdroje se výrazně rozcházejí');
 if(N(decision.multiMarketConfidence)>0&&N(decision.multiMarketConfidence)<65)issues.push(`market confidence jen ${Math.round(N(decision.multiMarketConfidence))} %`);
 const unique=[...new Set(issues)];if(!unique.length)return {...decision,decisionSafety149:'PASS'};
 return {...decision,action:'REVIEW',tone:'warn',priority:Math.max(92,N(decision.priority)),when:'Nejdřív ověřit market data',reason:`Automatická akce ${action} byla zablokována: ${unique.join('; ')}.`,sellRule:'Obnov relevantní market/sekci a teprve potom měň listing.',decisionSafety149:'BLOCKED',decisionSafetyIssues:unique,blockedAction:action};
}
