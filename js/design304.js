const CSS='./design304.css';
function ensureCss(){if(document.querySelector('link[data-design304]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=CSS;l.dataset.design304='1';document.head.appendChild(l)}
function polishBrand(){document.documentElement.dataset.design='304';document.querySelectorAll('.sidebar-sub').forEach(x=>x.textContent='Personal Intelligence');const q=document.querySelector('#commandInput');if(q)q.placeholder='Zeptej se Kamil OS…';const go=document.querySelector('#commandGo');if(go)go.textContent='Spustit';}
function polishBrain(){const root=document.querySelector('[data-kamil-brain300]');if(!root)return;root.classList.add('os304-brain');const h=root.querySelector('.brain300-head small');if(h)h.textContent='KAMIL BRAIN · LIVE';}
function polishNav(){document.querySelectorAll('#mainNav button,#bottomNav button').forEach(b=>{const label=b.textContent.trim();if(label==='Dnes')b.title='Dnešní priority a Brain';if(label==='Peníze')b.title='Finance a investice';if(label==='Vstupenky')b.title='Ticket intelligence';if(label==='Život')b.title='Rodina, domov a dokumenty'});}
function enhance(){polishBrand();polishBrain();polishNav();window.__KAMIL_DESIGN304__={version:304,active:true,at:Date.now()}}
let t=0;const schedule=()=>{clearTimeout(t);t=setTimeout(enhance,80)};
export function installDesign304(){ensureCss();enhance();const host=document.querySelector('#appView')||document.body;new MutationObserver(schedule).observe(host,{childList:true,subtree:true});window.addEventListener('kamil:view-change',schedule);setTimeout(schedule,500)}
