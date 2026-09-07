import {store} from './state.js';
import {clone,uid} from './utils.js';

const A=v=>Array.isArray(v)?v:[],N=v=>Number(v),badNum=v=>v!==undefined&&v!==null&&v!==''&&!Number.isFinite(N(v));
const collections=s=>[
 ['tasks',A(s.tasks),'task'],['projects',A(s.projects),'project'],['tickets',A(s.ticketBook?.items),'ticket'],['ticket-watch',A(s.ticketBook?.watchlist),'ticket-watch'],['properties',A(s.propertyBook?.candidates||s.propertyBook?.items),'property'],['debts',A(s.debtBook?.items),'debt'],['admin',A(s.personalAdmin?.items),'personal'],['family',A(s.familyHome?.members),'family'],['inbox',A(s.personalInbox?.items),'inbox'],['assets',A(s.assetBook?.items),'asset'],['goals',A(s.personalGoals?.items),'goal']
];
function normalizeIds(s){for(const [,rows,prefix] of collections(s))for(const x of rows)if(x&&typeof x==='object'&&!x.id)x.id=uid(prefix)}
function numberRule(issues,fatal,path,v,{min=null,max=null}={}){if(v===undefined||v===null||v==='')return;if(badNum(v)){fatal.push(`${path}: není číslo`);return}const n=N(v);if(min!==null&&n<min)fatal.push(`${path}: ${n} < ${min}`);if(max!==null&&n>max)fatal.push(`${path}: ${n} > ${max}`)}
export function validateEntityContracts(s=store.get()){
 const issues=[],fatal=[],seen=new Set();normalizeIds(s);
 for(const [domain,rows] of collections(s))for(const x of rows){if(!x||typeof x!=='object'){fatal.push(`${domain}: neplatná položka`);continue}if(seen.has(x.id))fatal.push(`duplicitní canonical id ${x.id}`);seen.add(x.id)}
 for(const x of A(s.ticketBook?.items)){numberRule(issues,fatal,`ticket.${x.id}.qty`,x.qty,{min:0});for(const k of ['buyPrice','purchasePrice','cost','pricePaid','marketPrice','currentPrice','askPrice','listPrice','fees'])numberRule(issues,fatal,`ticket.${x.id}.${k}`,x[k],{min:0})}
 for(const x of A(s.propertyBook?.candidates||s.propertyBook?.items)){for(const k of ['price','purchasePrice','askingPrice','rent','monthlyRent','expectedRent','monthlyCost','fund','hoa'])numberRule(issues,fatal,`property.${x.id}.${k}`,x[k],{min:0})}
 const bets=[s.bettingBook?.bets,s.betBook?.items,s.bets,s.betLedger?.items].find(Array.isArray)||[];for(const x of bets){numberRule(issues,fatal,`bet.${x.id||'?'}.stake`,x.stake??x.amount,{min:0});numberRule(issues,fatal,`bet.${x.id||'?'}.odds`,x.odds??x.price,{min:0});numberRule(issues,fatal,`bet.${x.id||'?'}.probability`,x.modelProbability??x.probability??x.modelProb,{min:0,max:1})}
 for(const x of A(s.personalAdmin?.items)){if(x.document?.validUntil&&Number.isNaN(Date.parse(x.document.validUntil)))issues.push(`document.${x.id}.validUntil: neplatné datum`);if(x.insurance?.premium!==undefined)numberRule(issues,fatal,`insurance.${x.id}.premium`,x.insurance.premium,{min:0})}
 return{ok:fatal.length===0,issues,fatal,checkedAt:new Date().toISOString()};
}
export function installStateContracts(){
 if(window.__KAMIL_STATE_CONTRACTS__?.installed)return true;const original=store.mutate.bind(store);
 store.mutate=(label,fn,options)=>original(label,s=>{const before=clone(s);try{fn(s);normalizeIds(s);const report=validateEntityContracts(s);window.__KAMIL_ENTITY_CONTRACT_REPORT__=report;if(!report.ok){for(const k of Object.keys(s))delete s[k];Object.assign(s,before);throw new Error(`Datový kontrakt zablokoval změnu: ${report.fatal.slice(0,3).join('; ')}`)}if(report.issues.length)console.warn('[state-contracts]',report.issues)}catch(error){if(JSON.stringify(s)!==JSON.stringify(before)){for(const k of Object.keys(s))delete s[k];Object.assign(s,before)}throw error}},options);
 window.__KAMIL_STATE_CONTRACTS__={installed:true,validate:validateEntityContracts,canonicalIds:true,rollbackInvalidMutation:true,at:Date.now()};return true;
}
