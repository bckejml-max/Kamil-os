import {loadTicketCloud660} from './ticketCloud660.js';
const VERSION=376,FEE=.15,n=x=>Number(x||0),round10=x=>Math.round(n(x)/10)*10,fmt=x=>n(x)>0?`${Math.round(n(x)).toLocaleString('cs-CZ')} Kč`:'—';
const conf=s=>Math.max(0,Math.min(100,Math.round(n(s?.multi_market_confidence)||n(s?.confidence_score)||0)));
const ageHours=s=>{const t=Date.parse(s?.checked_at||s?.official_checked_at||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/36e5):null};
const ageLabel=h=>h===null?'čas neznámý':h<1?'< 1 h':h<24?`${Math.round(h)} h`:`${Math.round(h/24)} d`;
function ensureCss(){if(document.querySelector('link[data-ticket-price374]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./ticketPrice374.css';l.dataset.ticketPrice374='1';document.head.appendChild(l)}
function marketModel(r,s){
 const buy=n(r?.buy_each_czk),ask=n(r?.ask_each_czk),q=Math.max(1,n(r?.qty)||1),c=conf(s),conflict=!!s?.multi_market_conflict,age=ageHours(s),stale=age===null||age>24;
 const primary=n(s?.market_price_czk),vg=n(s?.viagogo_price_czk),sh=n(s?.stubhub_price_czk),median=n(s?.median_price_czk),same=n(s?.same_section_count),rawConf=String(s?.confidence||'').toLowerCase();
 let market=0,source='',sourceClass='';
 if(primary&&same>0){market=primary;source='stejný sektor';sourceClass='section'}
 else if(vg&&sh&&!conflict){market=(vg+sh)/2;source='Viagogo + StubHub';sourceClass='consensus'}
 else if(sh&&c>=65){market=sh;source='StubHub';sourceClass='resale'}
 else if(primary){market=primary;source=rawConf.includes('event-floor')||rawConf.includes('official-api')?'minimum celé akce':'Viagogo';sourceClass=rawConf.includes('event-floor')||rawConf.includes('official-api')?'event-floor':'resale'}
 else if(median){market=median;source='medián trhu';sourceClass='median'}
 const sectionTrusted=sourceClass==='section'||sourceClass==='consensus';
 const explicit=n(s?.recommended_ask_czk);
 let recommended=0,method='';
 if(!stale&&!conflict&&c>=65&&(sectionTrusted||!r?.section)){if(explicit){recommended=explicit;method='model'}else if(market){recommended=round10(market*.99);method='trh −1 %'}}
 const minSell=buy?Math.ceil((buy/(1-FEE))/10)*10:0;
 const netProfit=recommended&&buy?(recommended*(1-FEE)-buy)*q:null;
 const quality=conflict?'CONFLICT':stale?'STALE':!market?'MISSING':sectionTrusted&&c>=80?'HIGH':sectionTrusted&&c>=65?'MEDIUM':'LOW';
 const blockedReason=conflict?'zdroje se rozcházejí':stale?`cena stará ${ageLabel(age)}`:market&&!sectionTrusted&&r?.section?'není cena stejného sektoru':c<65?'nízká confidence':!market?'chybí trh':'';
 return{buy,ask,q,c,market:market?round10(market):0,source,sourceClass,recommended:recommended?round10(recommended):0,minSell,netProfit,quality,method,conflict,stale,age,ageText:ageLabel(age),blockedReason,vg,sh};
}
function cell(label,value,cls='',sub=''){return `<div class="td331-price ${cls}"><span>${label}</span><b>${value}</b>${sub?`<small>${sub}</small>`:''}</div>`}
function paintCard(card,r,s){const m=marketModel(r,s),flow=card.querySelector('.td331-priceflow');if(!flow)return;flow.classList.add('td374-priceflow');flow.innerHTML=[cell('Nákup / ks',fmt(m.buy)),cell('Trh / ks',fmt(m.market),['LOW','STALE'].includes(m.quality)?'low-confidence':'',m.market?`${m.source} · ${m.ageText}`:'bez trhu'),cell('Moje cena / ks',fmt(m.ask)),cell('Min. prodej / ks',fmt(m.minSell),'floor','break-even při 15 %'),cell('Doporučit / ks',fmt(m.recommended),'recommended',m.recommended?`${m.method} · conf. ${m.c} %`:(m.blockedReason||'bez doporučení')),cell('Čistý P/L',m.netProfit===null?'—':`${m.netProfit>=0?'+':''}${fmt(m.netProfit)}`,m.netProfit===null?'':m.netProfit>=0?'positive':'negative',m.netProfit===null?'':`za ${m.q} ks`)].join('');
 card.dataset.priceQuality=m.quality;card.dataset.priceAge=m.stale?'stale':'fresh';const signal=card.querySelector('.td331-signal>b');if(signal)signal.textContent=m.netProfit===null?'—':`${m.netProfit>=0?'+':''}${fmt(m.netProfit)}`;
 const strong=card.querySelector('.td331-signal strong');if(strong)strong.textContent=m.quality==='HIGH'?'Cena ověřena':m.quality==='MEDIUM'?'Cena použitelná':m.quality==='STALE'?'Cena je stará':m.quality==='CONFLICT'?'Zdroje se rozcházejí':m.quality==='LOW'?'Cena jen orientační':'Tržní cena chybí';
 const small=card.querySelector('.td331-signal small');if(small)small.textContent=`${m.source||'bez zdroje'} · ${m.ageText} · confidence ${m.c||'—'} %`;
 const reason=card.querySelector('.td331-reason');if(reason){const base=s?.recommendation_reason||s?.source_message||'';const note=!m.market?'Chybí ověřená tržní cena — nic si nedopočítávám.':m.blockedReason?`Trh ${fmt(m.market)}, ale doporučení blokováno: ${m.blockedReason}.`:`Trh ${fmt(m.market)} (${m.source}), stáří ${m.ageText}, confidence ${m.c} %.`;reason.textContent=`${note}${base?` · ${base}`:''}`}}
 return m;
}
function paintSummary(host,models){const valid=models.filter(x=>x?.netProfit!==null),net=valid.reduce((a,x)=>a+x.netProfit,0),fresh=models.filter(x=>!x?.stale&&x?.market).length,stats=host.querySelectorAll('.td331-stat');if(stats[1]){const span=stats[1].querySelector('span'),b=stats[1].querySelector('b'),small=stats[1].querySelector('small');if(span)span.textContent='Potenciální čistý zisk';if(b)b.textContent=valid.length?`${net>=0?'+':''}${Math.round(net).toLocaleString('cs-CZ')} Kč`:'—';if(small)small.textContent=`${valid.length} doporučení · ${fresh}/${models.length} čerstvých cen`}}
let busy=false,timer=0,lastSig='';
async function refresh(){if(busy)return;const host=document.querySelector('#ticketIntelView');if(!host||!host.querySelector('.td331-ticket'))return;busy=true;try{const cloud=await loadTicketCloud660();if(!cloud?.ok)return;const byId=new Map((cloud.inventory||[]).map(x=>[String(x.id),x])),models=[];for(const card of host.querySelectorAll('[data-inventory-card]')){const id=card.querySelector('[data-ticket-detail]')?.dataset.ticketDetail,r=byId.get(String(id));if(!r)continue;models.push(paintCard(card,r,cloud.latest?.get(r.id)||null))}paintSummary(host,models);const sig=models.map(x=>`${x.market}:${x.recommended}:${x.netProfit}:${x.quality}:${Math.round(n(x.age))}`).join('|');if(sig!==lastSig){lastSig=sig;document.documentElement.dataset.ticketPrice374='1';document.documentElement.dataset.ticketPrice376='1';window.__KAMIL_TICKET_PRICE374__={version:VERSION,healthy:true,models,at:Date.now(),feeEstimatePct:15};window.__KAMIL_TICKET_PRICE376__=window.__KAMIL_TICKET_PRICE374__;window.dispatchEvent(new CustomEvent('kamil:ticket-price374-updated',{detail:{count:models.length,version:VERSION}}))}}catch(error){window.__KAMIL_TICKET_PRICE376__={version:VERSION,healthy:false,error:String(error?.message||error),at:Date.now()}}finally{busy=false}}
function schedule(ms=250){clearTimeout(timer);timer=setTimeout(refresh,ms)}
export function installTicketPriceIntelligence374(){if(document.documentElement.dataset.ticketPrice374Installed==='1')return;document.documentElement.dataset.ticketPrice374Installed='1';ensureCss();window.addEventListener('kamil:view-change',e=>{if(e.detail==='tickets')schedule(550)});window.addEventListener('kamil:ticket-refresh375-done',()=>schedule(300));window.addEventListener('kamil:ticket-targets372-updated',()=>schedule(300));const host=document.querySelector('#ticketIntelView');if(host){const mo=new MutationObserver(()=>schedule(180));mo.observe(host,{childList:true});window.__KAMIL_TICKET_PRICE374_OBSERVER__=mo}schedule(1000)}
