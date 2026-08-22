import {os42,agentLayer42} from './os42.js';
import {decisionCenter36,recordDecisionMemory36} from './decisionCenter36.js';
const A=v=>Array.isArray(v)?v:[],N=v=>Number(v||0),U=v=>String(v||'').toUpperCase();
export const OS43_VERSION='43.0';
export const OS43_CONTRACT={autoSend:false,autoTrade:false,autoReprice:false,autoDelete:false,proposalOnly:true,criticalActionsRequireConfirmation:true};
const normalize=(x,source)=>({id:x.id||`${source}:${x.title||Math.random()}`,title:x.title||x.name||'Bez názvu',target:x.target||'today',source,priority:N(x.priority||x.score||x.severity||50),reason:x.reason||x.nextStep||'',impactCzk:x.impactCzk??null,blocked:!!x.blocked,action:x.action||'REVIEW'});
export function nextBestActions43(state={},now=new Date()){
 const o=os42(state,now),d=decisionCenter36(state,now),rows=[];
 A(d.rows).forEach(x=>rows.push(normalize(x,'DECISION')));
 A(o.sla.rows).filter(x=>x.severity>=60).forEach(x=>rows.push(normalize({...x,id:`sla:${x.id||x.title}`,title:`${x.kind}: ${x.title||x.text||x.person}`,priority:x.severity,target:x.kind==='ČEKÁNÍ'?'waiting':'today',reason:x.breach?'Po termínu.':'Blíží se termín.',action:'RESOLVE'},'SLA')));
 A(o.opportunities).forEach(x=>rows.push(normalize({...x,id:`opp:${x.kind}:${x.title}`,priority:x.score,reason:'Příležitost zachycená Opportunity Radarem.',action:'REVIEW'},'OPPORTUNITY')));
 const dedup=new Map();for(const r of rows){const prev=dedup.get(r.id);if(!prev||r.priority>prev.priority)dedup.set(r.id,r)}
 const ranked=[...dedup.values()].sort((a,b)=>b.priority-a.priority||Number(b.impactCzk||0)-Number(a.impactCzk||0)).slice(0,10).map((x,i)=>({...x,rank:i+1,urgency:x.priority>=90?'TEĎ':x.priority>=75?'DNES':x.priority>=60?'BRZY':'SLEDOVAT'}));
 return {rows:ranked,top:ranked[0]||null,critical:ranked.filter(x=>x.priority>=90).length,totalImpactCzk:ranked.reduce((s,x)=>s+Math.max(0,N(x.impactCzk)),0)};
}
export function executionBrief43(state={},request='Vyřeš dnešek',now=new Date()){
 const queue=nextBestActions43(state,now),agent=agentLayer42(state,request,now),top=queue.rows.slice(0,5);
 return {headline:queue.top?`Teď: ${queue.top.title}`:'Dnes není kritická fronta.',top,agentPlan:A(agent.plan),requiresConfirmation:true,contract:OS43_CONTRACT};
}
export function markAction43(state={},row={},status='DONE',now=new Date()){
 if(!row?.id)return null;const s=U(status);if(!['DONE','SNOOZED','IGNORED'].includes(s))return null;
 return recordDecisionMemory36(state,{id:row.id,title:row.title,domain:row.source||'OS43',action:row.action||'REVIEW',priority:row.priority,impactCzk:row.impactCzk},s,now);
}
export function dailyScore43(state={},now=new Date()){
 const o=os42(state,now),q=nextBestActions43(state,now);let score=100;score-=Math.min(35,q.critical*10);score-=Math.min(25,o.sla.breaches*6);score-=Math.min(20,Math.round(o.risk.total/5));score=Math.max(0,Math.min(100,score));return {score,label:score>=80?'KLID':score>=60?'ŘÍDIT':'ZÁSAH',queue:q.rows.length,critical:q.critical,sla:o.sla.breaches,risk:o.risk.total};
}
export function os43(state={},now=new Date()){return {version:OS43_VERSION,contract:OS43_CONTRACT,queue:nextBestActions43(state,now),brief:executionBrief43(state,'Vyřeš dnešek',now),score:dailyScore43(state,now)}}
