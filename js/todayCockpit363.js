import {store} from './state.js';

const STATE363={version:363,healthy:true,mounted:false,queueSize:0,domains:0,at:Date.now()};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ensureCss(){if(document.querySelector('link[data-today-cockpit363]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./todayCockpit363.css';l.dataset.todayCockpit363='1';document.head.appendChild(l)}
function queueApi(){return window.__KAMIL_FOCUS_QUEUE335__||null}
function model(){
 const api=queueApi();api?.refresh?.();const q=api?.model?.queue||[],now=q[0]||null,next=q.slice(1,4),counts={};
 for(const x of q)counts[x.label]=(counts[x.label]||0)+1;
 const domains=Object.entries(counts).map(([label,count])=>({label,count}));
 const pressure=!now?'clear':Number(now.score)>=120?'critical':Number(now.score)>=95?'high':Number(now.score)>=75?'medium':'normal';
 return{version:363,queue:q,now,next,domains,pressure,sourceVersion:api?.model?.version||null,at:new Date().toISOString()};
}
function anchor(){const section=document.querySelector('#view-today');if(!section)return null;let host=section.querySelector('[data-today-cockpit-anchor363]');if(!host){host=document.createElement('div');host.dataset.todayCockpitAnchor363='1';section.prepend(host)}return host}
function action(x,label='Řešit'){if(!x)return'';return `<button type="button" data-cockpit363-open="${esc(x.key)}">${esc(label)}</button>`}
function html(m){
 if(!m.now)return `<section class="os363-cockpit clear" data-today-cockpit363><header><div><small>KAMIL OS · 363</small><h2>Dnes</h2><p>Řídicí cockpit</p></div><span>Klid</span></header><div class="os363-clear"><b>Nic teď nekřičí o pozornost.</b><span>Práce, peníze, vstupenky a osobní agenda jsou bez silné další akce.</span></div></section>`;
 const next=m.next.map((x,i)=>`<article class="os363-next"><b>${i+2}</b><div><small>${esc(x.label)}</small><strong>${esc(x.title)}</strong><span>${esc(x.reason)}</span></div>${action(x,'Otevřít')}</article>`).join('');
 const domains=m.domains.map(x=>`<span>${esc(x.label)} <b>${x.count}</b></span>`).join('');
 return `<section class="os363-cockpit ${esc(m.pressure)}" data-today-cockpit363><header><div><small>KAMIL OS · 363</small><h2>Dnes</h2><p>Jeden plán napříč celým OS</p></div><span>${m.queue.length} kroků</span></header><div class="os363-primary"><div class="os363-rank">1</div><div><small>UDĚLEJ TEĎ · ${esc(m.now.label).toUpperCase()}</small><h3>${esc(m.now.title)}</h3><p>${esc(m.now.reason)}</p></div>${action(m.now)}</div>${next?`<div class="os363-next-list"><div class="os363-subhead">Potom</div>${next}</div>`:''}${domains?`<div class="os363-domains">${domains}</div>`:''}<div class="os363-engine"><span>Focus Queue</span><b>prioritizační engine aktivní</b></div></section>`;
}
function open(key){const api=queueApi();if(typeof api?.open==='function')return api.open(key,api.model);return false}
function publish(m){STATE363.healthy=true;STATE363.mounted=!!document.querySelector('[data-today-cockpit363]');STATE363.queueSize=m.queue.length;STATE363.domains=m.domains.length;STATE363.at=Date.now();window.__KAMIL_TODAY_COCKPIT363__={...STATE363,model:m,refresh:renderSafe,open};document.documentElement.classList.toggle('os363-active',STATE363.mounted)}
function render(){const host=anchor();if(!host)return false;const m=model();host.innerHTML=html(m);publish(m);return true}
function renderSafe(){try{return render()}catch(error){console.error('[todayCockpit363]',error);STATE363.healthy=false;STATE363.at=Date.now();window.__KAMIL_TODAY_COCKPIT363__={...STATE363,error:String(error?.message||error),refresh:renderSafe,open};return false}}
let timer=0,bound=false;const schedule=(delay=80)=>{clearTimeout(timer);timer=setTimeout(renderSafe,delay)};
export function installTodayCockpit363(){ensureCss();document.documentElement.dataset.todayCockpit363='1';if(!bound){bound=true;document.addEventListener('click',e=>{const b=e.target.closest?.('[data-cockpit363-open]');if(!b)return;e.preventDefault();open(b.dataset.cockpit363Open)});window.addEventListener('kamil:view-change',e=>{if(!e.detail||e.detail==='today')schedule(30)});window.addEventListener('kamil:manager341-updated',()=>schedule(25));store.subscribe?.(()=>schedule())}schedule(60);setTimeout(()=>schedule(20),500);setTimeout(()=>schedule(20),1500)}
