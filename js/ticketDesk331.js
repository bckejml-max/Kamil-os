// Ticket Redesign 500 + optional overlays.
// OS500 is the only critical path. Every later overlay loads after the desk is usable.
let loadPromise=null;
let installPromise=null;
let overlayPromise=null;
let styleNode=null;
let styleObserver=null;

const ASSET_REV='os1060-visual-unification';
const revised=url=>{const u=new URL(url);u.searchParams.set('rev',ASSET_REV);return u};
const ungzip=async url=>{
  const requestUrl=revised(url);
  const response=await fetch(requestUrl,{cache:'no-store'});
  if(!response.ok)throw new Error(`OS500 asset ${response.status}: ${requestUrl}`);
  const bytes=new Uint8Array(await response.arrayBuffer());
  const isGzip=bytes.length>1&&bytes[0]===0x1f&&bytes[1]===0x8b;
  if(!isGzip)return new TextDecoder().decode(bytes);
  if(typeof DecompressionStream!=='function')throw new Error('OS500 requires DecompressionStream for gzip assets');
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
};
const text=async url=>{const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`Ticket overlay asset ${response.status}: ${url}`);return response.text()};
function keepStyleLast(){if(!styleNode?.isConnected)return;if(document.head.lastElementChild!==styleNode)document.head.appendChild(styleNode)}
function noteFailure(list,label,error,phase='load'){const item={label,phase,message:String(error?.message||error),at:Date.now()};list.push(item);console.warn(`[ticketDesk331:${phase}] ${label}`,error);return item}
async function optionalText(url,label,failures){try{return await text(url)}catch(error){noteFailure(failures,label,error,'css');return''}}
async function optionalInstaller(url,fn,label,failures){try{const mod=await import(url);if(typeof mod?.[fn]!=='function')throw new Error(`Chybí export ${fn}`);return{label,fn,install:mod[fn]}}catch(error){noteFailure(failures,label,error,'module');return{label,fn,install:null}}}

const CSS_SPECS=[
  ['../ticketPolish501.css','OS501 CSS'],['../ticketLayout502.css','OS502 CSS'],['../ticketRail503.css','OS503 CSS'],
  ['../ticketEconomics506.css','OS506 CSS'],['../ticketDecision507.css','OS507 CSS'],['../ticketGrouping508.css','OS508 CSS'],
  ['../ticketEventDetail509.css','OS509 CSS'],['../ticketExecutive510.css','OS510 CSS'],['../ticketOperations524.css','OS511-524 CSS'],
  ['../ticketDesk353.css','OS353 dark desk CSS'],['../ticketDesk355.css','OS355 layout CSS'],['../ticketDesk356.css','OS356 seatmap CSS'],
  ['../ticketVisualUnification1060.css','OS1060 visual unification CSS']
];
const JS_SPECS=[
  ['./ticketRecoveryHydration188.js','installTicketRecoveryHydration188','OS188'],
  ['./ticketPolish501.js','installTicketPolish501','OS501'],['./ticketLayout502.js','installTicketLayout502','OS502'],
  ['./ticketRail503.js','installTicketRail503','OS503'],['./ticketStability504.js','installTicketStability504','OS504'],
  ['./ticketAnchor505.js','installTicketAnchor505','OS505'],['./ticketEconomics506.js','installTicketEconomics506','OS506'],
  ['./ticketDecision507.js','installTicketDecision507','OS507'],['./ticketOperations524.js','installTicketOperations524','OS511-524'],
  ['./ticketGrouping508.js','installTicketGrouping508','OS508'],['./ticketEventDetail509.js','installTicketEventDetail509','OS509'],
  ['./ticketExecutive510.js','installTicketExecutive510','OS510']
];

function publishCanonical331(extra={}){
  const previous=window.__KAMIL_TICKET_DESK331__||{};
  const healthy=extra.healthy??previous.healthy??true;
  const loading=extra.loading??previous.loading??false;
  window.__KAMIL_TICKET_DESK331__={...previous,version:331,healthy,loading,stable:!loading,renderer:'redesign500',portfolioVersion:window.__KAMIL_TICKET_PORTFOLIO340__?.version||previous.portfolioVersion||340,at:Date.now(),...extra};
}

async function loadRedesign(){
  if(loadPromise)return loadPromise;
  loadPromise=(async()=>{
    const [css,rawSource]=await Promise.all([
      ungzip(new URL('../ticketRedesign500.css.gz',import.meta.url)),
      ungzip(new URL('./ticketDesk331.redesign500.js.gz',import.meta.url))
    ]);
    styleNode=document.querySelector('style[data-ticket-redesign500]')||document.createElement('style');
    styleNode.dataset.ticketRedesign500='1';
    styleNode.textContent=css;
    document.head.appendChild(styleNode);
    if(!styleObserver){styleObserver=new MutationObserver(keepStyleLast);styleObserver.observe(document.head,{childList:true})}

    const base=new URL('./',import.meta.url);
    let source=rawSource.replace(/from\s+(['"])(\.\/[^'"]+)\1/g,(match,quote,path)=>`from ${quote}${new URL(path,base).href}${quote}`);
    source=source.replace(/data-ticket-side500(?![\w-])/g,'data-ticket-side500 data-focus459').replace(/data-ticket-tip500(?![\w-])/g,'data-ticket-tip500 data-focus459');
    const objectUrl=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
    try{const renderer=await import(objectUrl);if(typeof renderer.installTicketDesk331!=='function')throw new Error('OS500 renderer export missing');return{renderer,baseCss:css}}
    finally{setTimeout(()=>URL.revokeObjectURL(objectUrl),1000)}
  })().catch(error=>{loadPromise=null;throw error});
  return loadPromise;
}

async function loadOptionalOverlays(){
  if(overlayPromise)return overlayPromise;
  overlayPromise=(async()=>{
    const failures=[];
    const overlayCss=await Promise.all(CSS_SPECS.map(([path,label])=>optionalText(new URL(path,import.meta.url),label,failures)));
    if(styleNode?.isConnected){styleNode.textContent=[styleNode.textContent,...overlayCss].filter(Boolean).join('\n\n');keepStyleLast()}
    const installers=await Promise.all(JS_SPECS.map(([path,fn,label])=>optionalInstaller(new URL(path,import.meta.url).href,fn,label,failures)));
    const runtimeFailures=[];
    for(const item of installers){
      if(!item.install)continue;
      try{const r=item.install();if(r&&typeof r.then==='function')await r}catch(error){noteFailure(runtimeFailures,item.label,error,'install')}
    }
    const allFailures=[...failures,...runtimeFailures],healthy=allFailures.length===0;
    document.documentElement.dataset.ticketPolish501='1';
    document.documentElement.dataset.ticketDesk331Health=healthy?'ok':'degraded';
    window.__KAMIL_TICKET_POLISH501__={version:'501.0.0',healthy:!allFailures.some(x=>x.label==='OS501'||x.label==='OS501 CSS'),at:Date.now()};
    window.__KAMIL_TICKET_DESK526__={version:'526.0.2',healthy,failures:allFailures,optionalTotal:installers.length,optionalLoaded:installers.filter(x=>!!x.install).length,assetRevision:ASSET_REV,at:Date.now()};
    publishCanonical331({healthy:true,loading:false,stable:true,overlayHealthy:healthy,failures:allFailures});
    return healthy;
  })().catch(error=>{console.warn('[ticketDesk331] optional overlays failed',error);publishCanonical331({healthy:true,loading:false,stable:true,overlayHealthy:false,overlayError:String(error?.message||error)});return false});
  return overlayPromise;
}

function scheduleOptionalOverlays(){
  const run=()=>void loadOptionalOverlays();
  if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:2500});else setTimeout(run,500);
}

export function installTicketDesk331(){
  if(installPromise)return installPromise;
  publishCanonical331({loading:true,stable:false});
  installPromise=loadRedesign().then(async({renderer})=>{
    document.documentElement.dataset.ticketRedesign500='1';
    const result=renderer.installTicketDesk331();if(result&&typeof result.then==='function')await result;
    document.documentElement.dataset.ticketDesk331Health='ok';
    window.__KAMIL_TICKET_REDESIGN500__={version:'500.0.2',healthy:true,assetRevision:ASSET_REV,at:Date.now(),source:'critical-core-first'};
    window.__KAMIL_TICKET_DESK526__={version:'526.0.2',healthy:true,failures:[],optionalTotal:JS_SPECS.length,optionalLoaded:0,assetRevision:ASSET_REV,at:Date.now()};
    publishCanonical331({healthy:true,loading:false,stable:true,overlayHealthy:null,failures:[]});
    keepStyleLast();
    scheduleOptionalOverlays();
    return result;
  }).catch(error=>{installPromise=null;document.documentElement.dataset.ticketDesk331Health='fatal';publishCanonical331({healthy:false,loading:false,stable:false,error:String(error?.message||error)});console.error('[ticketRedesign500/526] activation failed',error);throw error});
  return installPromise;
}
