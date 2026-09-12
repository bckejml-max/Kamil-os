import {renderPersonalFamily640} from './personalFamily640.js';
import {enhanceFamilyVisual140} from './homeFamilyVisual140.js';
import {ownEvent1100,schedule1100} from './runtimeOwnership1100.js';

const OWNER='family.page140';
let hubScheduled=false,hubRunning=false,bound=false;
const active=()=>!!document.querySelector('#view-family.on');

function ensureStyle(){
 if(!active())return;
 for(const [key,href] of [['homefamily140','./homeFamilyVisual140.css'],['upgrade610','./upgrade610.css']]){
  if(document.querySelector(`link[data-${key}]`))continue;
  const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l);
 }
}
function data(){
 const x=window.__KAMIL_PERSONAL_FAMILY_650_LAST__||{};
 const urgent=[...document.querySelectorAll('#ticketsView .family-action-row')].slice(0,3).map(el=>({title:el.querySelector('b')?.textContent||'Položka',meta:el.querySelector('.muted')?.textContent||''}));
 const m=[...document.querySelectorAll('#ticketsView .family-metrics .metric b')].map(el=>Number(el.textContent||0));
 return{urgent,overdue:m[0]||0,due7:m[1]||0,tasks:x.tasks||0,members:x.members||0};
}
async function enrichFamily(){
 if(hubRunning||!active())return false;
 hubRunning=true;
 try{
  const mod=await import('./familyHub610.js');
  if(!active())return false;
  return !!mod.appendFamilyHub610?.();
 }catch(e){console.warn('[family610] background enrichment failed',e);return false}
 finally{hubRunning=false}
}
function scheduleHub(delay=180){
 if(hubScheduled||hubRunning||!active())return;
 hubScheduled=true;
 schedule1100(OWNER,'hub',()=>{hubScheduled=false;if(active())void enrichFamily()},delay,{pauseWhenHidden:true});
}
function bindResume(){
 if(bound)return;bound=true;
 ownEvent1100(OWNER,window,'kamil:view-change',event=>{if(event.detail==='family'){ensureStyle();scheduleHub(80)}});
}
export function renderFamilyPage140(){
 bindResume();
 renderPersonalFamily640();
 ensureStyle();
 try{enhanceFamilyVisual140(data())}catch(e){console.warn('[family140]',e)}
 window.__KAMIL_FAMILY140__={healthy:true,core:'local-first',hub:'deferred',at:Date.now()};
 scheduleHub();
 return true;
}
