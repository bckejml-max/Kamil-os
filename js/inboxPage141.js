import {renderPersonalInbox690} from './personalInbox690.js';
import {enhanceInboxVisual141} from './inboxDocumentsVisual141.js';

let enrichmentScheduled=false,enrichmentRunning=false,bound=false;
const active=()=>!!document.querySelector('#view-inbox.on');

async function enrichInbox(){
 if(enrichmentRunning||!active())return false;
 enrichmentRunning=true;
 try{
  const mod=await import('./inboxHub660.js');
  if(!active())return false;
  mod.installInboxHub660?.();
  return !!(await mod.renderInboxHub660?.());
 }catch(e){console.warn('[inbox660] background enrichment failed',e);return false}
 finally{enrichmentRunning=false}
}
function scheduleEnrichment(delay=160){
 if(enrichmentScheduled||enrichmentRunning||!active())return;
 enrichmentScheduled=true;
 const run=()=>{enrichmentScheduled=false;if(active())void enrichInbox()};
 if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:1400});else setTimeout(run,delay);
}
function bindResume(){
 if(bound)return;bound=true;
 window.addEventListener('kamil:view-change',event=>{if(event.detail==='inbox')scheduleEnrichment(80)});
}

export async function renderInboxPage141(){
 bindResume();
 await renderPersonalInbox690();
 try{enhanceInboxVisual141()}catch(e){console.warn('[inbox141]',e)}
 window.__KAMIL_INBOX141__={healthy:true,core:'local-first',enrichment:'deferred',at:Date.now()};
 scheduleEnrichment();
 return true;
}
