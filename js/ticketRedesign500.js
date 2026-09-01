const VERSION='500.0.0';
let bound=false;
let observer=null;

function ensureCss(){
  let link=document.querySelector('link[data-ticket-redesign500]');
  if(!link){
    link=document.createElement('link');
    link.rel='stylesheet';
    link.href='./ticketRedesign500.css';
    link.dataset.ticketRedesign500='1';
    document.head.appendChild(link);
  }else if(document.head.lastElementChild!==link){
    document.head.appendChild(link);
  }
  return link;
}

function publish(){
  document.documentElement.dataset.ticketRedesign500='1';
  window.__KAMIL_TICKET_REDESIGN500__={version:VERSION,healthy:true,at:Date.now()};
}

export function installTicketRedesign500(){
  const link=ensureCss();
  publish();
  if(bound)return;
  bound=true;
  observer=new MutationObserver(()=>{
    if(link.isConnected&&document.head.lastElementChild!==link)document.head.appendChild(link);
  });
  observer.observe(document.head,{childList:true});
  window.addEventListener('kamil:view-change',e=>{
    const d=e?.detail;
    if(d==='tickets'||d?.view==='tickets'){
      ensureCss();
      publish();
    }
  });
}
