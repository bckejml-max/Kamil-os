import {safeMode43,setSafeMode43,recordCrash43,quarantine43} from './platform43.js';

const KEY='kamil-os-platform431-guard';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return{}}};
const write=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}return x};
let started=false,observer=null,lastBeat=performance.now(),beatTimer=null,watchdog=null;
function note(type,data={}){const x=read();x.events=[...(Array.isArray(x.events)?x.events:[]),{at:new Date().toISOString(),type,...data}].slice(-30);write(x)}
function maybeTrip(reason,duration=0){const x=read(),now=Date.now(),recent=(x.trips||[]).filter(t=>now-Number(t.at||0)<10*60*1000);recent.push({at:now,reason,duration});x.trips=recent.slice(-8);write(x);if(recent.length>=3&&!safeMode43()){setSafeMode43(true);note('auto-safe-mode',{reason});window.dispatchEvent(new CustomEvent('kamil:stability-warning',{detail:{reason,duration}}))}}
function observeLongTasks(){if(typeof PerformanceObserver==='undefined')return;try{observer=new PerformanceObserver(list=>{for(const e of list.getEntries()){const duration=Math.round(Number(e.duration)||0);if(duration<250)continue;note('long-task',{duration});maybeTrip('long-task',duration)}});observer.observe({entryTypes:['longtask']})}catch{}}
function startHeartbeat(){beatTimer=setInterval(()=>{lastBeat=performance.now()},500);watchdog=setInterval(()=>{const lag=performance.now()-lastBeat-500;if(document.visibilityState==='visible'&&lag>1200){note('event-loop-lag',{duration:Math.round(lag)});maybeTrip('event-loop-lag',Math.round(lag))}},1000)}
function onError(e){const message=String(e?.error?.message||e?.message||'runtime error');recordCrash43(message,'window');note('error',{message:message.slice(0,160)});const x=read();x.errors=(Number(x.errors)||0)+1;write(x);if(x.errors>=3)quarantine43('runtime-extensions',message.slice(0,120))}
function onReject(e){const message=String(e?.reason?.message||e?.reason||'unhandled rejection');recordCrash43(message,'promise');note('rejection',{message:message.slice(0,160)})}
export function guardSummary431(){const x=read();return {events:Array.isArray(x.events)?x.events:[],trips:Array.isArray(x.trips)?x.trips:[],errors:Number(x.errors)||0,autoSafeMode:safeMode43()}}
export function resetGuard431(){write({events:[],trips:[],errors:0});return guardSummary431()}
export function startStability431(){if(started)return;started=true;observeLongTasks();startHeartbeat();window.addEventListener('error',onError);window.addEventListener('unhandledrejection',onReject);window.addEventListener('beforeunload',()=>{try{observer?.disconnect();clearInterval(beatTimer);clearInterval(watchdog)}catch{}},{once:true})}
startStability431();
