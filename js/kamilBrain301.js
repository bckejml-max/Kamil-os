import {store} from './state.js';
import {installKamilBrain300,buildKamilBrain300} from './kamilBrain300.js';
import {rememberBrain301,confidence301,brainMemoryStats301} from './brainMemory301.js';
import {followUpSummary301} from './followUp301.js';
import {ownEvent1100,ownObserver1100,schedule1100} from './runtimeOwnership1100.js';

const OWNER='today.brain301';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function allCandidates(m){return [m?.now,...(m?.next||[]),...(m?.waiting||[]),...(m?.risk||[])].filter(Boolean)}
function candidateFor(node,m){const id=node?.closest?.('[data-brain-item]')?.dataset?.brainItem||'';return allCandidates(m).find(x=>String(x.id||x.title||'')===id)||allCandidates(m).find(x=>norm(x.title)===norm(id))||null}
function enhance(){const root=document.querySelector('[data-kamil-brain300]');if(!root)return;const m=buildKamilBrain300(),follow=followUpSummary301(store.get()),memory=brainMemoryStats301();root.querySelector('.brain300-head small')?.replaceChildren(document.createTextNode('KAMIL BRAIN · v301'));
 for(const item of root.querySelectorAll('[data-brain-item]')){const c=candidateFor(item,m);if(!c)continue;let badge=item.querySelector('[data-brain-confidence301]');if(!badge){badge=document.createElement('span');badge.dataset.brainConfidence301='1';badge.className='brain300-confidence';item.querySelector('b')?.insertAdjacentElement('afterend',badge)}badge.textContent=`${confidence301(c)}%`;badge.title='Jistota doporučení'}
 const kpis=root.querySelector('.brain300-kpis');if(kpis){let slot=kpis.querySelector('[data-brain-memory301]');if(!slot){slot=document.createElement('span');slot.dataset.brainMemory301='1';kpis.appendChild(slot)}slot.innerHTML=`<b>${memory.count}</b><small>rozhodnutí</small>`}
 const waiting=root.querySelector('.brain300-zone:nth-of-type(3)');if(waiting&&follow.rows.length&&!m.waiting?.length){waiting.querySelector('.brain300-clear')?.replaceChildren(document.createTextNode(`${follow.rows.length} follow-upů čeká v radaru.`))}
 window.__KAMIL_BRAIN301__={version:301,confidence:true,memory,followups:follow,at:Date.now()}}
function schedule(){schedule1100(OWNER,'enhance',enhance,70,{pauseWhenHidden:true})}
let bound=false;
export function installKamilBrain301(){installKamilBrain300();if(!bound){bound=true;ownEvent1100(OWNER,document,'click',e=>{const btn=e.target.closest?.('[data-brain-action]');if(!btn)return;const m=buildKamilBrain300(),c=candidateFor(btn,m);if(!c)return;const a=btn.dataset.brainAction;if(a==='done'||a==='tomorrow')rememberBrain301(c,a==='done'?'done':'tomorrow',{confidence:confidence301(c)});schedule1100(OWNER,'post-action',schedule,120,{pauseWhenHidden:true})},{capture:true});store.subscribe?.(()=>schedule());ownEvent1100(OWNER,window,'kamil:view-change',schedule);const host=document.querySelector('#todayView')||document.body;ownObserver1100(OWNER,host,{childList:true,subtree:true},schedule)}schedule();schedule1100(OWNER,'boot-500',schedule,500,{pauseWhenHidden:true})}
