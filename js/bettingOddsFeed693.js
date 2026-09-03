const VERSION='693.0.0';
const HEALTH='/api/market-history?source=chance_odds_health693';
const SCAN_SOURCE='chance_odds693';
const PAGE_SOURCE='chance_odds_pages693';
const PULSE_STORE='kamil_pulse_budget_561';
const originalFetch=window.fetch.bind(window);
let provider={checkedAt:0,configured:false,ready:false,checking:null};

function apiUrl(source,from){
 const input=new URL(String(from),location.href);
 const out=new URL('/api/market-history',location.origin);
 out.searchParams.set('source',source);
 for(const [k,v] of input.searchParams.entries()){
  if(k==='source'||k==='sport'||k==='_')continue;
  out.searchParams.append(k,v);
 }
 return out.toString();
}
function resetPulseStop(){
 try{
  const raw=JSON.parse(localStorage.getItem(PULSE_STORE)||'{}');
  if(raw.providerExhausted===true||Number(raw.used||0)>=500){
   raw.providerExhausted=false;raw.providerStatus=null;raw.providerMessage=null;raw.providerAt=null;raw.used=0;raw.log=[];raw.updatedAt=new Date().toISOString();localStorage.setItem(PULSE_STORE,JSON.stringify(raw));
  }
 }catch{}
}
async function checkProvider(force=false){
 if(!force&&Date.now()-provider.checkedAt<5*60000)return provider;
 if(provider.checking)return provider.checking;
 provider.checking=(async()=>{
  try{
   const r=await originalFetch(`${HEALTH}&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});
   const j=await r.json().catch(()=>null);
   provider={checkedAt:Date.now(),configured:j?.configured===true,ready:r.ok&&j?.ready===true,provider:j?.provider||'odds-api.io',bookmaker:j?.bookmaker||'Chance.cz',checking:null};
   if(provider.ready)resetPulseStop();
  }catch{provider={checkedAt:Date.now(),configured:false,ready:false,checking:null}}
  publish();return provider;
 })();
 return provider.checking;
}
function managed(input){
 try{
  const raw=typeof input==='string'?input:input?.url;
  const u=new URL(String(raw),location.href);
  if(u.origin!==location.origin)return null;
  if(u.pathname==='/api/chance-model-pages')return{kind:'pages',url:apiUrl(PAGE_SOURCE,u)};
  if(u.pathname==='/api/core70-health'&&u.searchParams.get('source')==='chance')return{kind:'scan',url:apiUrl(SCAN_SOURCE,u)};
  return null;
 }catch{return null}
}
async function fetch693(input,init){
 const route=managed(input);
 if(!route)return originalFetch(input,init);
 const p=await checkProvider();
 if(!p.ready)return originalFetch(input,init);
 const response=await originalFetch(route.url,{...init,cache:'no-store',headers:{...(init?.headers||{}),Accept:'application/json'}});
 if(response.status===401||response.status===403||response.status===429||response.status>=500){
  const clone=response.clone();let data=null;try{data=await clone.json()}catch{}
  window.__KAMIL_ODDS_FEED693_LAST_ERROR__={status:response.status,error:data?.error||null,at:Date.now()};
 }
 return response;
}
function publish(){
 window.__KAMIL_ODDS_FEED693__={version:VERSION,...provider,at:Date.now()};
 const root=document.querySelector('#bettingView');if(!root)return;
 let box=root.querySelector('[data-bet693]');
 if(!box){box=document.createElement('section');box.dataset.bet693='1';box.style.cssText='padding:10px 12px;border:1px solid rgba(135,164,194,.14);border-radius:10px;background:rgba(7,19,31,.55);font-size:11px;color:#91a7ba';const anchor=root.querySelector('.bet144-metrics');anchor?.insertAdjacentElement('afterend',box)}
 if(!box)return;
 if(provider.ready)box.innerHTML='<b style="color:#8fe0ad">🟢 Chance feed 693</b> · Odds-API.io aktivní · PulseScore pouze fallback';
 else box.innerHTML='<b style="color:#f0c979">🟠 Chance feed 693 připraven</b> · chybí serverový <code>ODDS_API_IO_KEY</code> · zatím běží PulseScore fallback';
}
export async function installBettingOddsFeed693(){
 if(!window.__KAMIL_ODDS_FEED693_PATCHED__){window.__KAMIL_ODDS_FEED693_PATCHED__=true;window.fetch=fetch693}
 await checkProvider();
 const root=document.querySelector('#bettingView');if(root&&!root.__bet693Observer){let busy=false;const o=new MutationObserver(()=>{if(busy)return;busy=true;setTimeout(()=>{busy=false;publish()},120)});o.observe(root,{childList:true,subtree:true});root.__bet693Observer=o}
 return provider.ready;
}
installBettingOddsFeed693().catch(()=>{});
