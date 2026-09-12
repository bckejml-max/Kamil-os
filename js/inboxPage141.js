import {renderPersonalInbox690} from './personalInbox690.js';
import {enhanceInboxVisual141} from './inboxDocumentsVisual141.js';
import {ownEvent1100,schedule1100} from './runtimeOwnership1100.js';

let enrichmentScheduled=false,enrichmentRunning=false,bound=false;
const OWNER='inbox.page141';
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
 if(enrichmentScheduled||enrichmentRunning||!active())return false;
 enrichmentScheduled=true;
 schedule1100(OWNER,'enrich',()=>{enrichmentScheduled=false;if(active())void enrichInbox()},delay,{pauseWhenHidden:true});
 return true;
}
function bindResume(){
 if(bound)return;bound=true;
 ownEvent1100(OWNER,window,'kamil:view-change',event=>{if(event.detail==='inbox')scheduleEnrichment(80)});
}

export async function renderInboxPage141(){
 bindResume();
 await renderPersonalInbox690();
 try{enhanceInboxVisual141()}catch(e){console.warn('[inbox141]',e)}
 window.__KAMIL_INBOX141__={healthy:true,core:'local-first',enrichment:'deferred',owned:true,at:Date.now()};
 scheduleEnrichment();
 return true;
}
