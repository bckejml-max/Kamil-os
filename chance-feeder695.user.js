// ==UserScript==
// @name         Kamil OS Chance Feeder 695
// @namespace    https://kamil-os-smoke.vercel.app/
// @version      695.0.0
// @description  Reads visible Chance football odds in your browser and relays normalized 1X2 odds to Kamil OS.
// @match        https://www.chance.cz/*
// @match        https://chance.cz/*
// @match        https://kamil-os-smoke.vercel.app/*
// @run-at       document-idle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      kamil-os-smoke.vercel.app
// @updateURL    https://kamil-os-smoke.vercel.app/chance-feeder695.user.js
// @downloadURL  https://kamil-os-smoke.vercel.app/chance-feeder695.user.js
// ==/UserScript==

(function(){
'use strict';
const VERSION='695.0.0';
const STORE='kamil-chance-feed694';
const MODEL='https://kamil-os-smoke.vercel.app/api/market-history?source=chance_browser_model694&days=5&minEv=0.05&minEdgePp=4&autoModelLimit=3&poissonLimit=15&betsOnly=1';
const isOS=location.hostname==='kamil-os-smoke.vercel.app';
const isChance=/^(www\.)?chance\.cz$/i.test(location.hostname);
let lastFeedStamp='';
let badge=null;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
function hash(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
function splitTeams(name){const s=norm(name);for(const re of [/\s+[–—]\s+/,/\s+-\s+/,/\s+vs\.?\s+/i,/\s+v\s+/i]){const p=s.split(re);if(p.length===2&&p[0].trim()&&p[1].trim())return[p[0].trim(),p[1].trim()]}return[null,null]}
function oddsNumber(v){const s=norm(v).replace(',','.');if(!/^\d{1,3}\.\d{1,2}$/.test(s))return null;const n=Number(s);return n>1&&n<100?n:null}
function leafEventNodes(){return [...document.querySelectorAll('a,span,strong,b,div')].filter(el=>{
  if(el.childElementCount!==0)return false;
  const t=norm(el.textContent);
  if(t.length<5||t.length>120)return false;
  const [h,a]=splitTeams(t);
  return !!(h&&a&&h.length>1&&a.length>1);
})}
function oddsFromRow(row){
 const out=[];
 for(const el of row.querySelectorAll('button,[role="button"],a,span,div')){
  if(el.childElementCount>1)continue;
  const n=oddsNumber(el.textContent);
  if(n!==null&&!out.includes(n))out.push(n);
  if(out.length>=8)break;
 }
 return out;
}
function smallestOddsRow(node){
 let el=node;
 for(let i=0;i<7&&el;i++,el=el.parentElement){
  const text=norm(el.innerText||'');
  if(text.length>1800)continue;
  const odds=oddsFromRow(el);
  if(odds.length>=3)return{row:el,odds};
 }
 return null;
}
function makeEvent(name,odds){
 const [home,away]=splitTeams(name);if(!home||!away||odds.length<3)return null;
 const eventId=`dom:${hash(`${home}|${away}`)}`;
 const marketId=`dom:m:${hash(eventId+'|1x2')}`;
 const labels=[['HOME','1'],['DRAW','X'],['AWAY','2']];
 const selections=labels.map(([outcome,label],i)=>({selectionId:`${marketId}:${outcome}`,id:`${marketId}:${outcome}`,canonicalOutcome:outcome,outcome,rawName:label,name:label,line:null,odds:odds[i],isActive:true}));
 return{eventId,id:eventId,sport:'soccer',league:'',home,away,startTime:null,live:false,markets:[{marketId,id:marketId,canonicalMarket:'MATCH_RESULT',type:'MATCH_RESULT',rawName:'1X2',name:'1X2',period:'FULL_TIME',line:null,isActive:true,selections}]};
}
function scrapeVisible(){
 const events=[],seen=new Set();
 for(const node of leafEventNodes()){
  const name=norm(node.textContent);if(seen.has(name))continue;
  const hit=smallestOddsRow(node);if(!hit)continue;
  const event=makeEvent(name,hit.odds);if(!event)continue;
  seen.add(name);events.push(event);
  if(events.length>=120)break;
 }
 return events;
}
function setBadge(count,status='aktivní'){
 if(!badge){
  badge=document.createElement('div');badge.id='kamil-chance-feeder695';
  badge.style='position:fixed;right:10px;bottom:10px;z-index:2147483647;padding:7px 10px;border-radius:9px;background:#10283b;color:#8fe0ad;font:11px system-ui;border:1px solid #31536b;opacity:.92';
  document.body?.appendChild(badge);
 }
 if(badge)badge.textContent=`Kamil OS feeder 695 · ${count} zápasů · ${status}`;
}
function send(events){
 if(!events.length){setBadge(0,'čekám na fotbalové kurzy');return}
 setBadge(events.length,'odesílám');
 const body=JSON.stringify({capturedAt:new Date().toISOString(),events});
 GM_xmlhttpRequest({method:'POST',url:MODEL,headers:{'Content-Type':'application/json','Accept':'application/json'},data:body,timeout:30000,
  onload:r=>{try{const j=JSON.parse(r.responseText||'{}');if(j?.ok){j.feederVersion=VERSION;j.capturedEvents=events.length;j.relayedAt=new Date().toISOString();GM_setValue(STORE,j);setBadge(events.length,'přeneseno do OS')}else setBadge(events.length,'model chyba')}catch{setBadge(events.length,'chyba odpovědi')}},
  onerror:()=>setBadge(events.length,'síťová chyba'),ontimeout:()=>setBadge(events.length,'timeout')});
}
let lastSignature='';
function scan(){
 const events=scrapeVisible();
 const sig=events.map(e=>`${e.home}|${e.away}|${e.markets[0].selections.map(s=>s.odds).join(',')}`).join(';');
 setBadge(events.length,events.length?'nalezeno':'čekám na fotbalové kurzy');
 if(events.length&&sig!==lastSignature){lastSignature=sig;send(events)}
}
function chanceBoot(){
 const mount=()=>{if(!document.body)return setTimeout(mount,200);setBadge(0,'start');setTimeout(scan,800);setTimeout(scan,2500);setInterval(()=>{if(document.visibilityState==='visible')scan()},5000);new MutationObserver(()=>{clearTimeout(window.__kamil695t);window.__kamil695t=setTimeout(scan,700)}).observe(document.body,{childList:true,subtree:true,characterData:true})};
 mount();
}
async function osRelay(){
 const feed=await GM_getValue(STORE,null);const stamp=String(feed?.relayedAt||feed?.fetchedAt||'');
 if(feed&&stamp&&stamp!==lastFeedStamp){lastFeedStamp=stamp;window.postMessage({type:'KAMIL_CHANCE_FEED_694',payload:feed},location.origin)}
 window.postMessage({type:'KAMIL_CHANCE_FEEDER_READY_694',version:VERSION,at:Date.now()},location.origin);
}
if(isChance)chanceBoot();
if(isOS){setInterval(osRelay,1200);setTimeout(osRelay,100)}
})();
