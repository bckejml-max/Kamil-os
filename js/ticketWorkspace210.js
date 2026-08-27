const TAB_ORDER=['action','active','presale','analysis'];
const TAB_LABELS={action:'K akci',active:'Aktivní',presale:'Presale',analysis:'Analýza'};

function datasetText(el){return Object.keys(el?.dataset||{}).join(' ').toLowerCase()}
function category210(el){
 const d=datasetText(el);
 if(/actionpriority209|dailyqueue197|marketqueue191|repricingguard194/.test(d))return'action';
 if(/opportunity198|presaleradar199|presaleexecution200/.test(d))return'presale';
 if(/marketdesk190|ticketdetails|ticketintel|ticketsales|sale|settlement|accounting/.test(d))return'active';
 if(/payoutlearning192|profitfloor193|sellladder195|commander196|exposure201|riskbudget202|capitalallocator203|portfolioplanner204|learnednet205|profitconfidence206|riskadjusted207/.test(d))return'analysis';
 return'active';
}

function panels210(host){return [...host.children].filter(el=>el.nodeType===1&&!el.matches('[data-ticket-workspace210]')).map(el=>({el,tab:category210(el)}));}

export function installTicketWorkspace210(host=document.querySelector('#ticketIntelView')){
 if(!host)return null;
 let shell=host.querySelector('[data-ticket-workspace210]');
 if(!shell){
  shell=document.createElement('section');shell.dataset.ticketWorkspace210='1';shell.className='ticket-workspace210';
  shell.innerHTML=`<div class="ticket-workspace210-head"><div><div class="eyebrow">OS 210 · NO-SCROLL WORKSPACE</div><h1>Vstupenky</h1></div><div class="ticket-workspace210-count" data-ticket210-count></div></div><div class="ticket-workspace210-tabs" role="tablist">${TAB_ORDER.map((t,i)=>`<button type="button" data-ticket210-tab="${t}" class="${i===0?'on':''}">${TAB_LABELS[t]}</button>`).join('')}</div><div class="ticket-workspace210-pager"><button type="button" data-ticket210-prev aria-label="Předchozí panel">←</button><strong data-ticket210-title>Panel</strong><span data-ticket210-pos></span><button type="button" data-ticket210-next aria-label="Další panel">→</button></div>`;
  host.prepend(shell);
 }
 let tab=shell.dataset.activeTab||'action',index=Number(shell.dataset.panelIndex||0)||0;
 const render=()=>{
  const all=panels210(host),available=new Set(all.map(x=>x.tab));
  if(!available.has(tab))tab=TAB_ORDER.find(x=>available.has(x))||'active';
  const group=all.filter(x=>x.tab===tab);if(index>=group.length)index=Math.max(0,group.length-1);if(index<0)index=0;
  all.forEach(x=>{x.el.classList.add('ticket-panel210');x.el.classList.toggle('ticket-panel210-on',x.tab===tab&&group[index]?.el===x.el)});
  shell.querySelectorAll('[data-ticket210-tab]').forEach(b=>{const count=all.filter(x=>x.tab===b.dataset.ticket210Tab).length;b.classList.toggle('on',b.dataset.ticket210Tab===tab);b.disabled=count===0;b.textContent=`${TAB_LABELS[b.dataset.ticket210Tab]}${count?` · ${count}`:''}`});
  const current=group[index]?.el,title=current?.querySelector('h1,h2,h3')?.textContent?.trim()||TAB_LABELS[tab];
  shell.querySelector('[data-ticket210-title]').textContent=title;
  shell.querySelector('[data-ticket210-pos]').textContent=group.length?`${index+1} / ${group.length}`:'0 / 0';
  shell.querySelector('[data-ticket210-count]').textContent=`${all.length} panelů · bez scrollu`;
  shell.querySelector('[data-ticket210-prev]').disabled=group.length<2;
  shell.querySelector('[data-ticket210-next]').disabled=group.length<2;
  shell.dataset.activeTab=tab;shell.dataset.panelIndex=String(index);
 };
 shell.querySelectorAll('[data-ticket210-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.ticket210Tab;index=0;render()});
 shell.querySelector('[data-ticket210-prev]').onclick=()=>{const g=panels210(host).filter(x=>x.tab===tab);index=g.length?(index-1+g.length)%g.length:0;render()};
 shell.querySelector('[data-ticket210-next]').onclick=()=>{const g=panels210(host).filter(x=>x.tab===tab);index=g.length?(index+1)%g.length:0;render()};
 let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})});observer.observe(host,{childList:true});
 render();
 window.__KAMIL_TICKET_WORKSPACE210__={render,get tab(){return tab},get index(){return index}};
 return{render,destroy:()=>observer.disconnect()};
}
