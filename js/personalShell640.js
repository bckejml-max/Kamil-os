import {qs,qsa} from './utils.js';
import {markPersonalUsage650} from './personalUsage650.js';

const TITLES={today:'DNES',inbox:'INBOX',tickets:'VSTUPENKY',betting:'SÁZENÍ',family:'RODINA',home:'DOMOV',money:'PENÍZE',more:'DOKUMENTY'};
const SHELL344={version:527,lazyLoaded:[],idleMarketStarted:false,healthy:true,at:Date.now()};
let bound=false,currentView='today';
const publish344=()=>{window.__KAMIL_PERSONAL_SHELL344__={...SHELL344,lazyLoaded:[...SHELL344.lazyLoaded]}};
const lazy=async(path,name)=>{const m=await import(path);if(!SHELL344.lazyLoaded.includes(path))SHELL344.lazyLoaded.push(path);publish344();return m[name]};

function apply(view='today',track=true){
 if(TITLES[view])currentView=view;
 const title=TITLES[currentView]||'KAMIL OS',page=qs('#pageTitle');
 if(page&&page.textContent!==title)page.textContent=title;
 document.title='Kamil OS';
 if(track)markPersonalUsage650('view',title);
 qsa('.version').forEach(x=>x.classList.add('hidden'));
}

function startMarketDeferred(){
 const run=async()=>{try{SHELL344.idleMarketStarted=true;publish344();const start=await lazy('./ticketMarketWatch656.js','startTicketMarketAuto656');start()}catch(error){SHELL344.healthy=false;publish344();console.warn('[personalShell640:ticket-market]',error)}};
 if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:2500});else setTimeout(run,1200)
}

export function bindPersonalShell640(){
 if(bound)return;bound=true;publish344();
 qsa('[data-personal-more]').forEach(b=>b.addEventListener('click',async()=>{markPersonalUsage650('action','more');const open=await lazy('./personalMore640.js','openPersonalMore640');open()}));
 window.addEventListener('kamil:view-change',e=>apply(e.detail,true));
 window.addEventListener('kamil:release-stamp',()=>apply(currentView,false));
 // Command Bar, Ctrl+N and Quick Add are canonical in app.js/viewRuntime41. Older
 // personal shell handlers used capture-phase interception and silently bypassed them.
 apply('today',true);startMarketDeferred();
 window.__KAMIL_PERSONAL_SHELL_BOUND__=true;
 window.__KAMIL_OS80_AUTO_MOUNT__=false;
 window.__KAMIL_PERSONAL_SHELL527__={canonicalCommand:true,canonicalCapture:true,at:Date.now()};
 publish344();
}
