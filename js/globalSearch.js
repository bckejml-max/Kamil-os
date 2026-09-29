import {store} from './state.js';
import {buildActionTruth741} from './actionTruthEngine.js';

const A=v=>Array.isArray(v)?v:[];
const fold=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const match=(q,...vals)=>vals.some(v=>fold(v).includes(q));
const push=(out,row)=>{if(row.title&&row.route)out.push(row)};

export function globalSearch741(query,input=null){
 const q=fold(query).trim();if(q.length<2)return[];
 const s=input||store.get(),truth=buildActionTruth741(s),out=[];
 for(const x of A(s.tasks))if(match(q,x.title,x.notes,x.area,x.category,x.project))push(out,{kind:'Úkol',title:x.title||'Úkol',detail:[x.area,x.category,x.due].filter(Boolean).join(' · '),route:'inbox',id:'task:'+x.id});
 for(const x of A(s.projects))if(match(q,x.name,x.title,x.owner,x.status,x.risk))push(out,{kind:'Práce',title:x.name||x.title||'Zakázka',detail:[x.status,x.owner,x.deadline||x.due].filter(Boolean).join(' · '),route:'work',id:'project:'+x.id});
 for(const x of A(s.ticketBook?.items))if(match(q,x.name,x.eventName,x.market_status,x.workflow,x.issue))push(out,{kind:'Vstupenky',title:x.name||x.eventName||'Ticket',detail:[x.market_status||x.workflow,x.eventDate||x.date].filter(Boolean).join(' · '),route:'tickets',id:'ticket:'+x.id});
 for(const [i,x] of A(s.propertyBook?.candidates).entries())if(match(q,x.name,x.title,x.location,x.address,x.status,x.url))push(out,{kind:'Reality',title:x.name||x.title||'Kandidát',detail:[x.location,x.status].filter(Boolean).join(' · '),route:'property',id:'property:'+i});
 for(const x of A(s.bettingLedger?.bets))if(match(q,x.label,x.selection,x.event,x.market,x.league,x.category,x.bookmakers))push(out,{kind:'Sázení',title:x.label||x.selection||x.event||'Sázka',detail:[x.league,x.market,x.status].filter(Boolean).join(' · '),route:'betting',id:'bet:'+x.id});
 for(const x of A(s.personalAdmin?.items))if(match(q,x.title,x.provider,x.category,x.insurance?.insured,x.insurance?.policyNumber,x.notes))push(out,{kind:x.category==='INSURANCE'?'Pojištění':'Dokumenty',title:x.title||'Záznam',detail:[x.provider,x.insurance?.sourceStatus].filter(Boolean).join(' · '),route:'more',id:'admin:'+x.id});
 for(const x of A(s.familyHome?.members))if(match(q,x.name,x.title,x.relation,x.notes))push(out,{kind:'Rodina',title:x.name||x.title||'Rodina',detail:[x.relation,x.notes].filter(Boolean).join(' · '),route:'family',id:'family:'+x.id});
 for(const x of truth.waiting)if(match(q,x.title,x.detail,x.person))push(out,{kind:'Čekám',title:x.title,detail:x.detail||x.person||'',route:x.route,id:'waiting:'+x.id});
 for(const x of truth.actions)if(match(q,x.title,x.detail,x.why))push(out,{kind:'Akce',title:x.title,detail:x.why,route:x.route,id:'action:'+x.id});
 const seen=new Set();return out.filter(x=>{const k=x.id||x.kind+':'+x.title;if(seen.has(k))return false;seen.add(k);return true}).slice(0,12);
}

export function renderGlobalSearch741(query,box,input=null){
 const rows=globalSearch741(query,input);if(!rows.length)return false;
 box.classList.remove('hidden');
 box.innerHTML='<div class="os741-search-head"><b>Napříč Kamil OS</b><span>'+rows.length+' výsledků</span></div>'+rows.map(x=>'<button type="button" class="search-row os741-search-row" data-command-nav1332="'+h(x.route)+'"><div><b>'+h(x.title)+'</b><div class="muted">'+h(x.kind)+(x.detail?' · '+h(x.detail):'')+'</div></div><span>Otevřít →</span></button>').join('');
 return true;
}

export function resolveCommand741(query,input=null){
 const q=fold(query),truth=buildActionTruth741(input||store.get());
 if(/co (dnes )?(hori|hoří)|co je urgent|priorit/.test(q))return{route:'today',label:'Otevírám dnešní priority'};
 if(/cekam|čekám|follow.?up/.test(q))return{route:'inbox',label:'Otevírám čekání a follow-upy'};
 if(/neprodan|ticket|vstupenk/.test(q))return{route:'tickets',label:'Otevírám vstupenky'};
 if(/cash|hotovost|peniz|peněz|finance|spor/.test(q))return{route:'money',label:'Otevírám peníze'};
 if(/pojist|smlouv|dokument/.test(q))return{route:'more',label:'Otevírám dokumenty a pojištění'};
 if(/realit|byt|nemovit/.test(q))return{route:'property',label:'Otevírám reality'};
 if(/saz|sáz|kurz|bankroll/.test(q))return{route:'betting',label:'Otevírám sázení'};
 if(/zakaz|zakáz|prace|práce|projekt/.test(q))return{route:'work',label:'Otevírám práci'};
 if(/rodin|mia/.test(q))return{route:'family',label:'Otevírám rodinu'};
 if(/domov|dum|dům|servis|energie/.test(q))return{route:'home',label:'Otevírám domov'};
 if(/stara data|stará data|fresh|konflikt/.test(q))return{route:'today',label:'Datová jistota: '+truth.counts.stale+' stale · '+truth.counts.conflicts+' konfliktů'};
 if(/zitra|zítra/.test(q))return{route:'today',label:'Na zítra je '+truth.tomorrow.length+' položek'};
 if(/tyden|týden|weekly/.test(q))return{route:'today',label:'Za 7 dní: '+truth.weeklyReview.changes+' změn'};
 return null;
}
