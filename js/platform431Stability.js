import {safeMode43,setSafeMode43,recordCrash43,quarantine43} from './platform43.js';

const KEY='kamil-os-platform431-guard';
const HEARTBEAT_MS=500,LAG_TRIP_MS=1200,SEVERE_LAG_MS=2500,INCIDENT_COALESCE_MS=1200;
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return{}}};
const write=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}return x};
let started=false,observer=null,lastBeat=performance.now(),watchdog=null;
function note(type,data={}){const x=read();x.events=[...(Array.isArray(x.events)?x.events:[]),{at:new Date().toISOString(),type,...data}].slice(-30);write(x)}
export function heartbeatLag431(now,previous,expected=HEARTBEAT_MS){return Math.max(0,Math.round(Number(now||0)-Number(previous||0)-Number(expected||0)))}
function maybeTrip(reason,duration=0){const x=read(),now=Date.now(),recent=(x.trips||[]).filter(t=>now-Number(t.at||0)<10*60*1000);const last=recent[recent.length-1];if(last&&now-Number(last.at||0)<INCIDENT_COALESCE_MS){last.duration=Math.max(Number(last.duration||0),Number(duration||0));last.reasons=Array.from(new Set([...(Array.isArray(last.reasons)?last.reasons:[last.reason].filter(Boolean)),reason]));last.reason=last.reasons.join('+');last.at=now}else recent.push({at:now,reason,reasons:[reason],duration});x.trips=recent.slice(-8);write(x);if(recent.length>=3&&!safeMode43()){setSafeMode43(true);note('auto-safe-mode',{reason,duration,incidents:recent.length});window.dispatchEvent(new CustomEvent('kamil:stability-warning',{detail:{reason,duration,incidents:recent.length}}))}}
function observeLongTasks(){if(typeof PerformanceObserver==='undefined')return;try{observer=new PerformanceObserver(list=>{for(const e of list.getEntries()){const duration=Math.round(Number(e.duration)||0);if(duration<250)continue;note('long-task',{duration});maybeTrip('long-task',duration)}});observer.observe({entryTypes:['longtask']})}catch{}}
function startHeartbeat(){lastBeat=performance.now();watchdog=setInterval(()=>{const now=performance.now(),lag=heartbeatLag431(now,lastBeat);lastBeat=now;if(document.visibilityState!=='visible'||lag<=LAG_TRIP_MS)return;note('event-loop-lag',{duration:lag,severe:lag>=SEVERE_LAG_MS});maybeTrip(lag>=SEVERE_LAG_MS?'severe-event-loop-lag':'event-loop-lag',lag)},HEARTBEAT_MS)}
function onError(e){const message=String(e?.error?.message||e?.message||'runtime error');recordCrash43(message,'window');note('error',{message:message.slice(0,160)});const x=read();x.errors=(Number(x.errors)||0)+1;write(x);if(x.errors>=3)quarantine43('runtime-extensions',message.slice(0,120))}
function onReject(e){const message=String(e?.reason?.message||e?.reason||'unhandled rejection');recordCrash43(message,'promise');note('rejection',{message:message.slice(0,160)})}
export function guardSummary431(){const x=read();return {events:Array.isArray(x.events)?x.events:[],trips:Array.isArray(x.trips)?x.trips:[],errors:Number(x.errors)||0,autoSafeMode:safeMode43(),sentinel:{heartbeatMs:HEARTBEAT_MS,lagTripMs:LAG_TRIP_MS,severeLagMs:SEVERE_LAG_MS,incidentCoalesceMs:INCIDENT_COALESCE_MS}}}
export function resetGuard431(){write({events:[],trips:[],errors:0});return guardSummary431()}
export function startStability431(){if(started)return;started=true;observeLongTasks();startHeartbeat();window.addEventListener('error',onError);window.addEventListener('unhandledrejection',onReject);window.addEventListener('beforeunload',()=>{try{observer?.disconnect();clearInterval(watchdog)}catch{}},{once:true})}
startStability431();
