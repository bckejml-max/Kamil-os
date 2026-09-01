// Ticket Redesign 500 loader. The exact approved renderer is stored compressed
// next to this module to keep the GitHub update atomic and preserve the tested source.
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

function keepStyleLast(){
  if(!styleNode?.isConnected)return;
  if(document.head.lastElementChild!==styleNode)document.head.appendChild(styleNode);
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
    if(!styleObserver){
      styleObserver=new MutationObserver(keepStyleLast);
      styleObserver.observe(document.head,{childList:true});
    }

    const base=new URL('./',import.meta.url);
    let source=rawSource.replace(/from\s+(['"])(\.\/[^'"]+)\1/g,(match,quote,path)=>`from ${quote}${new URL(path,base).href}${quote}`);
    // UI421 in the current production shell already treats data-focus459 as core.
    // Add the compatibility marker so its cleanup pass keeps OS500 side panels in place.
    source=source.replace(/data-ticket-side500(?![\w-])/g,'data-ticket-side500 data-focus459')
                 .replace(/data-ticket-tip500(?![\w-])/g,'data-ticket-tip500 data-focus459');

    const objectUrl=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
    try{
      const mod=await import(objectUrl);
      if(typeof mod.installTicketDesk331!=='function')throw new Error('OS500 renderer export missing');
      return mod;
    }finally{
      setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
    }
  })().catch(error=>{loadPromise=null;throw error});
  return loadPromise;
}

export function installTicketDesk331(){
  if(installPromise)return installPromise;
  installPromise=loadRedesign().then(mod=>{
    const result=mod.installTicketDesk331();
    document.documentElement.dataset.ticketRedesign500='1';
    window.__KAMIL_TICKET_REDESIGN500__={version:'500.0.0',healthy:true,at:Date.now(),source:'exact-approved-patch'};
    keepStyleLast();
    return result;
  }).catch(error=>{
    installPromise=null;
    console.error('[ticketRedesign500] activation failed',error);
    throw error;
  });
  return installPromise;
}
