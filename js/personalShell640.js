import {h,qs,qsa,modal} from './utils.js';
import {markPersonalUsage650} from './personalUsage650.js';

const TITLES={today:'DNES',inbox:'INBOX',tickets:'VSTUPENKY',betting:'SÁZENÍ',family:'RODINA',home:'DOMOV',money:'PENÍZE',more:'DOKUMENTY'};
const OS80_RE=/command center|centrum|ředitel|reditel/i;
const SHELL344={version:344,lazyLoaded:[],idleMarketStarted:false,healthy:true,at:Date.now()};
let bound=false,currentView='today';
const nav=v=>window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:v}));
const publish344=()=>{window.__KAMIL_PERSONAL_SHELL344__={...SHELL344,lazyLoaded:[...SHELL344.lazyLoaded]}};
const lazy=async(path,name)=>{const m=await import(path);if(!SHELL344.lazyLoaded.includes(path))SHELL344.lazyLoaded.push(path);publish344();return m[name]};

function ensureCleanup695(){
 if(document.querySelector('#os695-cleanup-style'))return;
 const style=document.createElement('style');
 style.id='os695-cleanup-style';
 style.textContent=`
@media(max-width:850px){
 #bottomNav{grid-template-columns:repeat(5,minmax(0,1fr))!important}
 #bottomNav [data-view="betting"],
 #bottomNav [data-view="family"],
 #bottomNav [data-view="home"],
 #bottomNav [data-view="more"]{display:none!important}
 #bottomNav [data-personal-more]{display:grid!important;place-items:center;min-width:0;max-width:100%;overflow:hidden}
}
`;
 document.head.appendChild(style);
 const bottom=qs('#bottomNav');
 if(bottom){bottom.dataset.os695='stable-five';bottom.setAttribute('aria-label','Hlavní navigace: Dnes, Inbox, Vstupenky, Peníze a Více')}
 qsa('[data-personal-more]').forEach(b=>{b.title='Více oblastí a nastavení';b.setAttribute('aria-label','Více oblastí a nastavení')});
 window.__KAMIL_OS695_CLEANUP__={healthy:true,mobileNav:'today,inbox,tickets,money,more',at:Date.now()};
}

function apply(view='today',track=true){
 if(TITLES[view])currentView=view;
 const title=TITLES[currentView]||'KAMIL OS',page=qs('#pageTitle');
 if(page&&page.textContent!==title)page.textContent=title;
 document.title='Kamil OS';
 if(track)markPersonalUsage650('view',title);
 qsa('.version').forEach(x=>x.classList.add('hidden'));
}

async function openResult(result){
 if(!result)return null;
 markPersonalUsage650('action','search-result');
 if(result.type==='data'){const open=await lazy('./personalDocuments640.js','openVaultRecord640');return open(result.id)}
 if(result.type==='waiting'){const open=await lazy('./personalWaiting650.js','openPersonalWaiting650');return open()}
 if(result.route==='documents')return nav('more');
 if(['today','inbox','tickets','betting','family','home','money','more'].includes(result.route))return nav(result.route);
 return nav('today');
}

async function askGlobal(){
 const input=qs('#commandInput'),q=input?.value.trim();
 if(!q){input?.focus();return null}
 markPersonalUsage650('action','ask-or-search');
 if(OS80_RE.test(q)){
  if(input)input.value='';
  const open=await lazy('./personalCommand800.js','openCommandCenter800');
  return open();
 }
 const [answerLifeOperator298,answerPersonalQuestion640]=await Promise.all([
  lazy('./lifeOperator298.js','answerLifeOperator298'),
  lazy('./personalAsk640.js','answerPersonalQuestion640')
 ]);
 const operator=answerLifeOperator298(q),a=operator||answerPersonalQuestion640(q);
 if(input)input.value='';
 const body=`<div class="card"><div class="eyebrow">${operator?'KAMIL AI OPERATOR':'KAMIL OS'}</div><h2>${h(a.title)}</h2>${a.body?`<p>${h(a.body)}</p>`:''}${a.lines?.length?`<div>${a.lines.map(x=>`<div class="row"><span>${h(x)}</span></div>`).join('')}</div>`:''}${a.note?`<p class="muted">${h(a.note)}</p>`:''}</div>`;
 const buttons=(a.results||[]).slice(0,6).map((r,i)=>({label:`Otevřít · ${r.title}`,value:`result:${i}`,primary:i===0}));
 buttons.push({label:'Zavřít',value:null,primary:!buttons.length});
 const choice=await modal(operator?'Kamil AI Operator':'Kamil OS',body,buttons);
 if(String(choice||'').startsWith('result:'))return openResult(a.results[Number(choice.split(':')[1])]);
 return choice;
}

function bindCommand(){
 const input=qs('#commandInput'),go=qs('#commandGo');
 if(input){
  input.placeholder='Zeptej se: co dnes řešit, co stojí, volné peníze, které vstupenky…';
  input.oninput=null;
  input.onkeydown=e=>{
   if(e.key==='Enter'){e.preventDefault();askGlobal()}
   if(e.key==='Escape'){input.value='';input.blur()}
  };
 }
 if(go){go.textContent='Najít / zeptat se';go.onclick=askGlobal}
}

function startMarketDeferred(){
 const run=async()=>{try{SHELL344.idleMarketStarted=true;publish344();const start=await lazy('./ticketMarketWatch656.js','startTicketMarketAuto656');start()}catch(error){SHELL344.healthy=false;publish344();console.warn('[personalShell640:ticket-market]',error)}};
 if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:2500});else setTimeout(run,1200)
}

export function bindPersonalShell640(){
 if(bound)return;bound=true;publish344();ensureCleanup695();
 qsa('[data-personal-more]').forEach(b=>b.addEventListener('click',async()=>{markPersonalUsage650('action','more');const open=await lazy('./personalMore640.js','openPersonalMore640');open()}));
 window.addEventListener('kamil:view-change',e=>apply(e.detail,true));
 window.addEventListener('kamil:release-stamp',()=>apply(currentView,false));
 bindCommand();
 apply('today',true);startMarketDeferred();
 window.__KAMIL_PERSONAL_SHELL_BOUND__=true;
 window.__KAMIL_OS80_AUTO_MOUNT__=false;
 window.__KAMIL_PERSONAL_SHELL527__={canonicalCommand:true,canonicalCapture:true,at:Date.now()};
 publish344();
}
