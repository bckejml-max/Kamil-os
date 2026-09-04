// ==UserScript==
// @name         Kamil OS Chance Feeder 694
// @namespace    https://kamil-os-smoke.vercel.app/
// @version      694.0.0
// @description  Captures Chance odds inside your own browser and relays only normalized odds to Kamil OS.
// @match        https://www.chance.cz/*
// @match        https://chance.cz/*
// @match        https://kamil-os-smoke.vercel.app/*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      kamil-os-smoke.vercel.app
// ==/UserScript==

(function(){
'use strict';
const VERSION='694.0.0';
const STORE='kamil-chance-feed694';
const MODEL='https://kamil-os-smoke.vercel.app/api/market-history?source=chance_browser_model694&days=5&minEv=0.05&minEdgePp=4&autoModelLimit=3&poissonLimit=15&betsOnly=1';
const isOS=location.hostname==='kamil-os-smoke.vercel.app';
const isChance=/^(www\.)?chance\.cz$/i.test(location.hostname);
const page=typeof unsafeWindow!=='undefined'?unsafeWindow:window;
const captured=new Map();
let modelTimer=null,lastPost=0,lastFeedStamp='';
const plain=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const text=(...xs)=>{for(const x of xs){if(typeof x==='string'&&x.trim())return x.trim()}return''};
const number=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null};
function hash(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
function parseDate(v){if(v==null)return null;if(typeof v==='number')return new Date(v<1e12?v*1000:v).toISOString();const s=String(v).trim();const n=Date.parse(s);return Number.isFinite(n)?new Date(n).toISOString():s.slice(0,80)}
function splitTeams(name){const s=String(name||'').trim();for(const re of [/\s+[–—]\s+/,/\s+-\s+/,/\s+vs\.?\s+/i,/\s+v\s+/i]){const p=s.split(re);if(p.length===2&&p[0].trim()&&p[1].trim())return[p[0].trim(),p[1].trim()]}return[null,null]}
function periodOf(name){const s=plain(name);if(/1\.?\s*(polo|half)|prvni polo|first half|1h/.test(s))return'FIRST_HALF';if(/2\.?\s*(polo|half)|druhy polo|second half|2h/.test(s))return'SECOND_HALF';return'FULL_TIME'}
function marketType(name){const s=plain(name);if(/oba.*(daji|daji gol|score)|btts/.test(s))return'BOTH_TEAMS_TO_SCORE';if(/roh/.test(s)&&/(pocet|total|vice|mene|over|under)/.test(s))return'CORNER_OVER_UNDER';if(/(zlut|kart)/.test(s)&&/(pocet|total|vice|mene|over|under)/.test(s))return'YELLOW_CARD_OVER_UNDER';if(/handicap/.test(s))return'ASIAN_HANDICAP';if(/vysledek|1x2|vitez zapasu|match result/.test(s))return'MATCH_RESULT';if(/gol|brank|total/.test(s)&&/(pocet|vice|mene|over|under)/.test(s))return'OVER_UNDER';return null}
function parseLine(obj,marketName,selectionName){for(const k of ['line','handicap','points','hdp']){const n=number(obj?.[k]);if(n!==null&&Math.abs(n)<100)return n}const s=`${marketName||''} ${selectionName||''}`.replace(/,/g,'.');const all=[...s.matchAll(/(?:^|\s)([-+]?\d+(?:\.5|\.25|\.75))(?:\s|$)/g)];if(all.length){const n=Number(all[all.length-1][1]);if(Number.isFinite(n))return n}return null}
function outcomeOf(type,name,home,away){const s=plain(name).trim(),h=plain(home),a=plain(away);if(type==='MATCH_RESULT'){if(s==='1'||s==='home'||(h&&s===h))return'HOME';if(s==='x'||s==='draw'||s==='remiza')return'DRAW';if(s==='2'||s==='away'||(a&&s===a))return'AWAY'}if(type==='BOTH_TEAMS_TO_SCORE'){if(/^(ano|yes)$/.test(s))return'YES';if(/^(ne|no)$/.test(s))return'NO'}if(type==='ASIAN_HANDICAP'){if(s==='1'||s.includes('domac')||(h&&s.includes(h)))return'HOME';if(s==='2'||s.includes('host')||(a&&s.includes(a)))return'AWAY'}if(/(vice|over|nad)/.test(s))return'OVER';if(/(mene|under|pod)/.test(s))return'UNDER';return null}
function oddsOf(o){for(const k of ['rate','odds','decimalOdds','decimal','price']){const n=number(o?.[k]);if(n>1&&n<1000)return n}return null}
function looksEventName(s){return /\s[–—-]\s|\svs\.?\s|\sv\s/i.test(String(s||''))}
function addOpportunity(raw,ctx){const odds=oddsOf(raw);if(!odds||!ctx.eventName)return;const [home,away]=splitTeams(ctx.eventName);if(!home||!away)return;const marketName=text(ctx.marketName,raw.eventTypeDescription,raw.marketName,'');const type=marketType(marketName);if(!type)return;const selName=text(raw.opportunityName,raw.fullName,raw.shortName,raw.name,raw.title,raw.label);const outcome=outcomeOf(type,selName,home,away);if(!outcome)return;const line=parseLine(raw,marketName,selName);const eventId=String(ctx.eventId||`browser:${hash(`${ctx.eventName}|${ctx.startTime||''}`)}`);const marketId=String(ctx.marketId||`browser:m:${hash(`${eventId}|${marketName}|${line??''}`)}`);const selectionId=String(raw.opportunityId||raw.id||`browser:s:${hash(`${marketId}|${selName}|${line??''}`)}`);let ev=captured.get(eventId);if(!ev){ev={eventId,id:eventId,sport:'soccer',league:ctx.league||'',home,away,startTime:ctx.startTime||null,live:false,markets:new Map()};captured.set(eventId,ev)}let m=ev.markets.get(marketId);if(!m){m={marketId,id:marketId,canonicalMarket:type,type,rawName:marketName,name:marketName,period:periodOf(marketName),line,isActive:true,selections:new Map()};ev.markets.set(marketId,m)}m.selections.set(selectionId,{selectionId,id:selectionId,canonicalOutcome:outcome,outcome,rawName:selName,name:selName,line,odds,isActive:true})}
function walk(node,ctx={},key=''){
 if(!node||typeof node!=='object')return;if(Array.isArray(node)){for(const x of node)walk(x,ctx,key);return}
 const next={...ctx};const name=text(node.matchName,node.title,node.name,node.eventName);
 const hasMatch=node.matchId!=null||node.dateClosed!=null||node.matchDate!=null||node.startTime!=null||node.startDate!=null||key.toLowerCase().includes('match');
 if(hasMatch&&name&&looksEventName(name)){next.eventName=name;next.eventId=node.matchId??node.id??next.eventId;next.startTime=parseDate(node.startTime??node.startDate??node.matchDate??node.dateClosed)??next.startTime}
 if(node.competitionName)next.league=text(node.competitionName,next.league);if(String(node.type||'').toUpperCase()==='COMPETITION'&&name)next.league=name;
 const hasMarket=node.eventTypeDescription||node.marketName||Array.isArray(node.opportunities)||key.toLowerCase().includes('event');
 if(hasMarket){const mn=text(node.eventTypeDescription,node.marketName,node.eventName,node.name);if(mn&&!looksEventName(mn))next.marketName=mn;next.marketId=node.eventId??node.marketId??node.id??next.marketId}
 addOpportunity(node,next);
 for(const [k,v] of Object.entries(node)){if(v&&typeof v==='object')walk(v,next,k)}
}
function serialEvents(){return[...captured.values()].slice(0,140).map(e=>({...e,markets:[...e.markets.values()].slice(0,40).map(m=>({...m,selections:[...m.selections.values()].slice(0,20)}))})).filter(e=>e.markets.length)}
function compactBody(){let events=serialEvents();let body=JSON.stringify({capturedAt:new Date().toISOString(),events});while(body.length>92000&&events.length>10){events=events.slice(0,Math.floor(events.length*.8));body=JSON.stringify({capturedAt:new Date().toISOString(),events})}return body}
function modelNow(){if(!captured.size)return;clearTimeout(modelTimer);modelTimer=setTimeout(()=>{const body=compactBody();GM_xmlhttpRequest({method:'POST',url:MODEL,headers:{'Content-Type':'application/json','Accept':'application/json'},data:body,timeout:30000,onload:r=>{try{const j=JSON.parse(r.responseText||'{}');if(j?.ok){j.feederVersion=VERSION;j.capturedEvents=JSON.parse(body).events.length;j.relayedAt=new Date().toISOString();GM_setValue(STORE,j)}}catch{}},onerror:()=>{},ontimeout:()=>{}})},700)}
function captureJson(data){try{walk(data,{});if(captured.size)modelNow()}catch{}}
function patchNetwork(){const f=page.fetch?.bind(page);if(f&&!page.__KAMIL_CHANCE_FETCH694__){page.__KAMIL_CHANCE_FETCH694__=true;page.fetch=async(...args)=>{const r=await f(...args);try{const url=String(args[0]?.url||args[0]||'');if(/\/rest\/offer\//i.test(url)){r.clone().json().then(captureJson).catch(()=>{})}}catch{}return r}}
 const X=page.XMLHttpRequest;if(X&&!X.prototype.__KAMIL_CHANCE_XHR694__){X.prototype.__KAMIL_CHANCE_XHR694__=true;const open=X.prototype.open,send=X.prototype.send;X.prototype.open=function(method,url,...rest){this.__kamilUrl694=String(url||'');return open.call(this,method,url,...rest)};X.prototype.send=function(...args){if(/\/rest\/offer\//i.test(this.__kamilUrl694||''))this.addEventListener('load',()=>{try{const d=this.responseType==='json'?this.response:JSON.parse(this.responseText||'null');captureJson(d)}catch{}});return send.apply(this,args)}}}
async function activeProbe(){try{const r=await page.fetch('/rest/offer/v2/offer?limit=9999',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({results:false,highlightAnyTime:false,limit:9999,type:'SUPERSPORT',id:16,fulltexts:[],matchIds:[],matchViewFilters:[]})});if(r.ok)captureJson(await r.clone().json())}catch{}try{const r=await page.fetch('/rest/offer/v1/matches/top',{credentials:'include',headers:{Accept:'application/json'}});if(r.ok)captureJson(await r.clone().json())}catch{}}
function chanceBoot(){patchNetwork();setTimeout(activeProbe,2500);setInterval(()=>{if(document.visibilityState==='visible')activeProbe()},10*60*1000);const badge=document.createElement('div');badge.id='kamil-chance-feeder694';badge.textContent='Kamil OS feeder 694 aktivní';badge.style='position:fixed;right:10px;bottom:10px;z-index:2147483647;padding:6px 9px;border-radius:9px;background:#10283b;color:#8fe0ad;font:11px system-ui;border:1px solid #31536b;opacity:.85';const mount=()=>document.body?document.body.appendChild(badge):setTimeout(mount,250);mount()}
async function osRelay(){const feed=await GM_getValue(STORE,null);const stamp=String(feed?.relayedAt||feed?.fetchedAt||'');if(feed&&stamp&&stamp!==lastFeedStamp){lastFeedStamp=stamp;page.postMessage({type:'KAMIL_CHANCE_FEED_694',payload:feed},location.origin)}page.postMessage({type:'KAMIL_CHANCE_FEEDER_READY_694',version:VERSION,at:Date.now()},location.origin)}
if(isChance)chanceBoot();if(isOS){setInterval(osRelay,1200);setTimeout(osRelay,50)}
})();
