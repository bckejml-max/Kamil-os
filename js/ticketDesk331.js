// Ticket Redesign 500 + Visual Polish 501 + Layout Fix 502 loader.
// OS500 stays byte-for-byte in the compressed asset; 501/502 are reversible overlays.
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

const text=async url=>{
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw new Error(`Ticket overlay asset ${response.status}: ${url}`);
  return response.text();
};

function keepStyleLast(){
  if(!styleNode?.isConnected)return;
  if(document.head.lastElementChild!==styleNode)document.head.appendChild(styleNode);
}

async function loadRedesign(){
  if(loadPromise)return loadPromise;
  loadPromise=(async()=>{
    const [css,polishCss,layoutCss,rawSource,polishMod,layoutMod]=await Promise.all([
      ungzip(new URL('../ticketRedesign500.css.gz',import.meta.url)),
      text(new URL('../ticketPolish501.css',import.meta.url)),
      text(new URL('../ticketLayout502.css',import.meta.url)),
      ungzip(new URL('./ticketDesk331.redesign500.js.gz',import.meta.url)),
      import(new URL('./ticketPolish501.js',import.meta.url).href),
      import(new URL('./ticketLayout502.js',import.meta.url).href)
    ]);

    styleNode=document.querySelector('style[data-ticket-redesign500]')||document.createElement('style');
    styleNode.dataset.ticketRedesign500='1';
    styleNode.textContent=`${css}\n\n/* OS501 visual polish */\n${polishCss}\n\n/* OS502 layout fix */\n${layoutCss}`;
    document.head.appendChild(styleNode);
    if(!styleObserver){
      styleObserver=new MutationObserver(keepStyleLast);
      styleObserver.observe(document.head,{childList:true});
    }

    const base=new URL('./',import.meta.url);
    let source=rawSource.replace(/from\s+(['"])(\.\/[^'"]+)\1/g,(match,quote,path)=>`from ${quote}${new URL(path,base).href}${quote}`);
    // UI421 treats data-focus459 as canonical; keep OS500 side panels outside diagnostics.
    source=source.replace(/data-ticket-side500(?![\w-])/g,'data-ticket-side500 data-focus459')
                 .replace(/data-ticket-tip500(?![\w-])/g,'data-ticket-tip500 data-focus459');

    const objectUrl=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
    try{
      const renderer=await import(objectUrl);
      if(typeof renderer.installTicketDesk331!=='function')throw new Error('OS500 renderer export missing');
      if(typeof polishMod.installTicketPolish501!=='function')throw new Error('OS501 polish export missing');
      if(typeof layoutMod.installTicketLayout502!=='function')throw new Error('OS502 layout export missing');
      return{renderer,polishMod,layoutMod};
    }finally{
      setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
    }
  })().catch(error=>{loadPromise=null;throw error});
  return loadPromise;
}

export function installTicketDesk331(){
  if(installPromise)return installPromise;
  installPromise=loadRedesign().then(({renderer,polishMod,layoutMod})=>{
    const result=renderer.installTicketDesk331();
    polishMod.installTicketPolish501();
    layoutMod.installTicketLayout502();
    document.documentElement.dataset.ticketRedesign500='1';
    document.documentElement.dataset.ticketPolish501='1';
    window.__KAMIL_TICKET_REDESIGN500__={version:'500.0.0',healthy:true,at:Date.now(),source:'exact-approved-patch'};
    window.__KAMIL_TICKET_POLISH501__={version:'501.0.0',healthy:true,at:Date.now()};
    keepStyleLast();
    return result;
  }).catch(error=>{
    installPromise=null;
    console.error('[ticketRedesign500/501/502] activation failed',error);
    throw error;
  });
  return installPromise;
}
