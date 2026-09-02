// Ticket Redesign 500 + Visual Polish 501 + Layout Fix 502 + Right Rail 503 + Stability 504 + Anchor 505 + Economics 506 + Decision 507 + Grouping 508 + Event Detail 509 + Executive 510 + Operations 511-524 loader.
// OS500 is critical. Later overlays are isolated so one optional failure cannot take down the Ticket desk.
let loadPromise=null;
let installPromise=null;
let styleNode=null;
let styleObserver=null;

const ungzip=async url=>{
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw new Error(`OS500 asset ${response.status}: ${url}`);
  if(typeof DecompressionStream!=='function')throw new Error('OS500 requires DecompressionStream');
  const stream=response.body.pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
};
const text=async url=>{const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`Ticket overlay asset ${response.status}: ${url}`);return response.text()};
function keepStyleLast(){if(!styleNode?.isConnected)return;if(document.head.lastElementChild!==styleNode)document.head.appendChild(styleNode)}
function noteFailure(list,label,error,phase='load'){const item={label,phase,message:String(error?.message||error),at:Date.now()};list.push(item);console.warn(`[ticketDesk331:${phase}] ${label}`,error);return item}
async function optionalText(url,label,failures){try{return await text(url)}catch(error){noteFailure(failures,label,error,'css');return''}}
async function optionalInstaller(url,fn,label,failures){try{const mod=await import(url);if(typeof mod?.[fn]!=='function')throw new Error(`Chybí export ${fn}`);return{label,fn,install:mod[fn]}}catch(error){noteFailure(failures,label,error,'module');return{label,fn,install:null}}}

async function loadRedesign(){
  if(loadPromise)return loadPromise;
  loadPromise=(async()=>{
    const failures=[];
    const [css,rawSource]=await Promise.all([
      ungzip(new URL('../ticketRedesign500.css.gz',import.meta.url)),
      ungzip(new URL('./ticketDesk331.redesign500.js.gz',import.meta.url))
    ]);
    const cssSpecs=[
      ['../ticketPolish501.css','OS501 CSS'],['../ticketLayout502.css','OS502 CSS'],['../ticketRail503.css','OS503 CSS'],
      ['../ticketEconomics506.css','OS506 CSS'],['../ticketDecision507.css','OS507 CSS'],['../ticketGrouping508.css','OS508 CSS'],
      ['../ticketEventDetail509.css','OS509 CSS'],['../ticketExecutive510.css','OS510 CSS'],['../ticketOperations524.css','OS511-524 CSS']
    ];
    const jsSpecs=[
      ['./ticketPolish501.js','installTicketPolish501','OS501'],['./ticketLayout502.js','installTicketLayout502','OS502'],
      ['./ticketRail503.js','installTicketRail503','OS503'],['./ticketStability504.js','installTicketStability504','OS504'],
      ['./ticketAnchor505.js','installTicketAnchor505','OS505'],['./ticketEconomics506.js','installTicketEconomics506','OS506'],
      ['./ticketDecision507.js','installTicketDecision507','OS507'],['./ticketGrouping508.js','installTicketGrouping508','OS508'],
      ['./ticketEventDetail509.js','installTicketEventDetail509','OS509'],['./ticketExecutive510.js','installTicketExecutive510','OS510'],
      ['./ticketOperations524.js','installTicketOperations524','OS511-524']
    ];
    const overlayCss=await Promise.all(cssSpecs.map(([path,label])=>optionalText(new URL(path,import.meta.url),label,failures)));
    const installers=await Promise.all(jsSpecs.map(([path,fn,label])=>optionalInstaller(new URL(path,import.meta.url).href,fn,label,failures)));

    styleNode=document.querySelector('style[data-ticket-redesign500]')||document.createElement('style');
    styleNode.dataset.ticketRedesign500='1';
    styleNode.textContent=[css,...overlayCss].filter(Boolean).join('\n\n');
    document.head.appendChild(styleNode);
    if(!styleObserver){styleObserver=new MutationObserver(keepStyleLast);styleObserver.observe(document.head,{childList:true})}

    const base=new URL('./',import.meta.url);
    let source=rawSource.replace(/from\s+(['"])(\.\/[^'"]+)\1/g,(match,quote,path)=>`from ${quote}${new URL(path,base).href}${quote}`);
    source=source.replace(/data-ticket-side500(?![\w-])/g,'data-ticket-side500 data-focus459').replace(/data-ticket-tip500(?![\w-])/g,'data-ticket-tip500 data-focus459');
    const objectUrl=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
    try{const renderer=await import(objectUrl);if(typeof renderer.installTicketDesk331!=='function')throw new Error('OS500 renderer export missing');return{renderer,installers,failures}}
    finally{setTimeout(()=>URL.revokeObjectURL(objectUrl),1000)}
  })().catch(error=>{loadPromise=null;throw error});
  return loadPromise;
}

export function installTicketDesk331(){
  if(installPromise)return installPromise;
  installPromise=loadRedesign().then(async({renderer,installers,failures})=>{
    document.documentElement.dataset.ticketRedesign500='1';
    const result=renderer.installTicketDesk331();if(result&&typeof result.then==='function')await result;
    const runtimeFailures=[];
    for(const item of installers){if(!item.install)continue;try{const r=item.install();if(r&&typeof r.then==='function')await r}catch(error){noteFailure(runtimeFailures,item.label,error,'install')}}
    const allFailures=[...failures,...runtimeFailures],healthy=allFailures.length===0;
    document.documentElement.dataset.ticketPolish501='1';
    document.documentElement.dataset.ticketDesk331Health=healthy?'ok':'degraded';
    window.__KAMIL_TICKET_REDESIGN500__={version:'500.0.0',healthy:true,at:Date.now(),source:'exact-approved-patch'};
    window.__KAMIL_TICKET_POLISH501__={version:'501.0.0',healthy:!allFailures.some(x=>x.label==='OS501'||x.label==='OS501 CSS'),at:Date.now()};
    window.__KAMIL_TICKET_DESK526__={version:'526.0.0',healthy,failures:allFailures,optionalTotal:installers.length,optionalLoaded:installers.filter(x=>!!x.install).length,at:Date.now()};
    keepStyleLast();return result
  }).catch(error=>{installPromise=null;document.documentElement.dataset.ticketDesk331Health='fatal';console.error('[ticketRedesign500/526] activation failed',error);throw error});
  return installPromise;
}
