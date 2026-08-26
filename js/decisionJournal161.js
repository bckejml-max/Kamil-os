import {store} from './state.js';
import {xtbBoard} from './live24.js';
import {loadTicketCloud660} from './ticketCloud660.js';
const KEY='kamil-os-decision-journal-161',A=v=>Array.isArray(v)?v:[],U=v=>String(v||'').toUpperCase(),N=v=>Number(v||0);
function read(){try{return A(JSON.parse(localStorage.getItem(KEY)||'[]'))}catch{return[]}}
function write(x){try{localStorage.setItem(KEY,JSON.stringify(x.slice(-1000)))}catch{}return x}
function day(){return new Date().toISOString().slice(0,10)}
function addUnique(rows,e){const k=`${e.kind}|${e.id}|${e.action}|${day()}`;if(rows.some(x=>x.key===k))return;rows.push({...e,key:k,createdAt:new Date().toISOString(),outcome:null,outcomeAt:null})}
export async function captureDecisionJournal161(){const s=store.get(),rows=read();for(const {p,d} of xtbBoard(s)){const action=U(d?.action);if(!action||['HOLD','WATCH','REVIEW'].includes(action))continue;addUnique(rows,{kind:'XTB',id:String(p.ticker||p.symbol||p.name||''),action,reason:String(d.reason||''),baselinePrice:N(p.marketPrice||p.currentPrice||p.price)||null,source:String(d.source||'RULE')})}let cloud=null;try{cloud=await loadTicketCloud660()}catch{}if(cloud?.ok)for(const r of cloud.inventory||[]){const snap=cloud.latest?.get(r.id),action=U(snap?.recommendation_code);if(!action||['HOLD','VERIFY_DATA'].includes(action))continue;addUnique(rows,{kind:'TICKET',id:String(r.id),label:String(r.event_name||''),action,reason:String(snap?.recommendation_reason||''),baselinePrice:N(snap?.market_price_czk)||null,source:'MARKET_SNAPSHOT'})}write(rows);window.__KAMIL_DECISION_JOURNAL161__={at:Date.now(),count:rows.length};return rows}
export function decisionJournal161(){return read()}
export const decisionJournal161Info={localOnly:true,dedup:'kind-id-action-day',realizedReturn:false};