const START=performance.now();
function ensureQaCss(){if(document.querySelector('link[data-qa308],link[href="./qa308.css"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./qa308.css';l.dataset.qa308='css-only';document.head.appendChild(l)}
function nav(){const n=performance.getEntriesByType?.('navigation')?.[0];return n?{dns:Math.round(n.domainLookupEnd-n.domainLookupStart),connect:Math.round(n.connectEnd-n.connectStart),ttfb:Math.round(n.responseStart-n.requestStart),dom:Math.round(n.domContentLoadedEventEnd-n.startTime),load:Math.round(n.loadEventEnd-n.startTime)}:null}
function resources(){const rows=performance.getEntriesByType?.('resource')||[];const js=rows.filter(x=>/\.js(?:\?|$)/.test(x.name)),css=rows.filter(x=>/\.css(?:\?|$)/.test(x.name));return{total:rows.length,js:js.length,css:css.length,transferKb:Math.round(rows.reduce((a,x)=>a+Number(x.transferSize||0),0)/1024)}}
function readiness(){return{core:!!window.__KAMIL_CORE312__,intelligence:!!window.__KAMIL_INTELLIGENCE318__,domain:!!window.__KAMIL_DOMAIN_OS328__,health:!!window.__KAMIL_HEALTH329__}}
function sample(){const data={version:330,sinceInstallMs:Math.round(performance.now()-START),navigation:nav(),resources:resources(),domNodes:document.getElementsByTagName('*').length,readiness:readiness(),bootErrors:(window.__KAMIL_BOOT_ERRORS__||[]).length,at:new Date().toISOString()};window.__KAMIL_PERFORMANCE330__=data;return data}
function observeLongTasks(){if(!('PerformanceObserver'in window))return;try{const obs=new PerformanceObserver(list=>{const prev=window.__KAMIL_LONG_TASKS330__||[];for(const x of list.getEntries())prev.push({start:Math.round(x.startTime),duration:Math.round(x.duration)});window.__KAMIL_LONG_TASKS330__=prev.slice(-30)});obs.observe({type:'longtask',buffered:true})}catch{}}
function stabilizeTicketWrites338(){
 const host=document.querySelector('#ticketIntelView');if(!host||host.dataset.ticketWriteGuard338)return;
 const descriptor=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');if(!descriptor?.get||!descriptor?.set)return;
 let blockedLoading=0,blockedDuplicate=0;
 Object.defineProperty(host,'innerHTML',{configurable:true,enumerable:false,get(){return descriptor.get.call(this)},set(value){
  const next=String(value??''),current=descriptor.get.call(this),hasDesk=!!this.querySelector('.td331');
  if(hasDesk&&/Načítám Ticket Trading Desk/i.test(next)){blockedLoading++;return}
  if(current===next){blockedDuplicate++;return}
  descriptor.set.call(this,value)
 }});
 host.dataset.ticketWriteGuard338='1';
 window.__KAMIL_TICKET_WRITE_GUARD338__={version:338,get blockedLoading(){return blockedLoading},get blockedDuplicate(){return blockedDuplicate}};
}
export function installPerformance330(){ensureQaCss();observeLongTasks();stabilizeTicketWrites338();sample();setTimeout(sample,800);setTimeout(sample,2200);window.addEventListener('load',()=>setTimeout(sample,50),{once:true});window.addEventListener('kamil:view-change',()=>setTimeout(sample,120));window.__KAMIL_SAMPLE_PERFORMANCE330__=sample}
