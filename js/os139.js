const txt=(el,sel)=>String(el?.querySelector(sel)?.textContent||'').trim();
function countRows(root,sel){return root.querySelectorAll(sel).length}
function target(root,key){const map={xtb:'.d110-portfolio',tickets:'.d110-grid-mid .d110-card:first-child',capital:'.d110-grid-mid .d110-card:nth-child(2)',today:'.d110-bottom .d110-card:nth-child(2)'};return root.querySelector(map[key])||null}
function focusCard(key,label,value,detail,tone='neutral'){return `<button class="os139-focus ${tone}" data-os139-jump="${key}"><small>${label}</small><b>${value||'—'}</b><span>${detail||''}</span></button>`}
function build(root){if(root.querySelector('.os139-exec'))return;const head=root.querySelector('.d110-head');if(!head)return;
 const xtb=root.querySelector('.d110-portfolio'),tickets=root.querySelector('.d110-grid-mid .d110-card:first-child'),capital=root.querySelector('.d110-grid-mid .d110-card:nth-child(2)'),today=root.querySelector('.d110-bottom .d110-card:nth-child(2)');
 const live=txt(root,'.d110-head .d110-status')||txt(root,'.d110-portfolio .d110-status');
 const positionCount=countRows(root,'.d110-portfolio .d110-tr');
 const ticketCount=countRows(root,'.d110-ticket');
 const actionCount=countRows(root,'.d110-bottom .d110-card:nth-child(2) .d110-row');
 const capitalTop=txt(capital,'.d110-cap b');
 const firstAction=txt(today,'.d110-row span');
 const firstActionCta=txt(today,'.d110-row b');
 const exec=document.createElement('section');exec.className='os139-exec';
 exec.innerHTML=`<div class="os139-hero"><div><div class="eyebrow">DNES · EXECUTIVE BRIEFING</div><h1>${actionCount?`${actionCount} věci k pozornosti`:'Dnešek je pod kontrolou'}</h1><p>${firstAction?`${firstAction}${firstActionCta?` · ${firstActionCta}`:''}`:'Nejdůležitější systémy jsou přehledně níže.'}</p></div><div class="os139-live"><i></i><span>${live||'stav trhu není potvrzený'}</span></div></div><div class="os139-focusgrid">${focusCard('xtb','XTB',positionCount?`${positionCount} pozic`:'—',live||'portfolio','blue')}${focusCard('tickets','Vstupenky',ticketCount?`${ticketCount} aktivních`:'—','aktuální portfolio','purple')}${focusCard('capital','Kapitál',capitalTop||'Čeká na data','další alokace','green')}${focusCard('today','Dnes',actionCount?`${actionCount} akcí`:'Čisto',firstAction||'nic urgentního',actionCount?'warn':'green')}</div><div class="os139-quick"><button data-os139-jump="xtb">Investice</button><button data-os139-jump="tickets">Vstupenky</button><button data-os139-jump="capital">Peníze</button><button data-os139-jump="today">Úkoly dnes</button></div>`;
 head.after(exec);
 exec.querySelectorAll('[data-os139-jump]').forEach(b=>b.addEventListener('click',()=>{const el=target(root,b.dataset.os139Jump);if(!el)return;el.scrollIntoView({behavior:'smooth',block:'start'});el.classList.add('os139-pulse');setTimeout(()=>el.classList.remove('os139-pulse'),900)}));
 root.classList.add('os139-mode');
 const toolbar=root.querySelector('.os122-toolbar');if(toolbar)toolbar.classList.add('os139-toolbar');
 window.__KAMIL_OS139__={at:Date.now(),positions:positionCount,tickets:ticketCount,actions:actionCount};
}
export function enhanceOS139(){const root=document.querySelector('.dashboard110');if(!root)return;build(root)}
