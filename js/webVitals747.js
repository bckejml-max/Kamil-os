const KEY='kamil-os-web-vitals747';
const state={started:false,supported:false,ttfbMs:null,fcpMs:null,lcpMs:null,cls:0,interactionMaxMs:null,updatedAt:null};
let observers=[];

const round=(v,d=1)=>Number.isFinite(Number(v))?Number(Number(v).toFixed(d)):null;
const persist=()=>{state.updatedAt=new Date().toISOString();try{sessionStorage.setItem(KEY,JSON.stringify(state))}catch{};window.__KAMIL_WEB_VITALS747__={...state}};
const observe=(type,handler,options={})=>{
 try{
  const o=new PerformanceObserver(list=>{for(const e of list.getEntries())handler(e);persist()});
  o.observe({type,buffered:true,...options});observers.push(o);return true;
 }catch{return false}
};
export function startWebVitals747(){
 if(state.started)return {...state};
 state.started=true;state.supported=typeof PerformanceObserver!=='undefined';
 try{
  const nav=performance.getEntriesByType('navigation')[0];if(nav)state.ttfbMs=round(nav.responseStart-nav.requestStart);
  const paints=performance.getEntriesByType('paint');const fcp=paints.find(x=>x.name==='first-contentful-paint');if(fcp)state.fcpMs=round(fcp.startTime);
 }catch{}
 if(state.supported){
  observe('largest-contentful-paint',e=>{state.lcpMs=round(e.startTime)});
  observe('layout-shift',e=>{if(!e.hadRecentInput)state.cls=round(Number(state.cls||0)+Number(e.value||0),4)});
  observe('event',e=>{const d=Number(e.duration||0);if(d>Number(state.interactionMaxMs||0))state.interactionMaxMs=round(d)});
 }
 persist();return {...state};
}
export function webVitalsSnapshot747(){
 if(!state.started)startWebVitals747();
 return {...state};
}
export function stopWebVitals747(){for(const o of observers)try{o.disconnect()}catch{}observers=[]}
