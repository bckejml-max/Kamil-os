import {store} from './state.js';

const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const closed=x=>['DONE','CLOSED','ARCHIVED','RESOLVED','PAID','CANCELLED','CANCELED'].includes(String(x?.status||x?.workflow||'').toUpperCase());
let index=null,revision=0,builtRevision=-1;
const add=(out,kind,title,detail,target,id,extra={})=>{const text=norm(`${title||''} ${detail||''} ${kind||''}`);if(text)out.push({kind,title:String(title||'Položka'),detail:String(detail||''),target,id,text,...extra})};
function build(){
 const s=store.get(),out=[];
 for(const x of s.tasks||[])if(!closed(x))add(out,'Úkol',x.title||x.name,x.area||x.category,'today',x.id);
 for(const x of s.projects||[])if(!closed(x))add(out,'Projekt',x.title||x.name,x.nextAction||x.status,'today',x.id);
 for(const x of s.personalInbox?.items||[])if(!closed(x))add(out,'Inbox',x.title||x.name,x.source||x.kind,'inbox',x.id);
 for(const x of s.personalAdmin?.items||[])if(!closed(x))add(out,'Administrativa',x.title||x.name,[x.provider,x.counterparty,x.category].filter(Boolean).join(' · '),'home',x.id);
 for(const x of s.familyHome?.members||[])add(out,'Rodina',x.name||x.title,[x.relation,x.notes].filter(Boolean).join(' · '),'family',x.id);
 for(const x of s.ticketBook?.items||[])add(out,'Vstupenka',x.name||x.eventName||x.event,[x.venue,x.city,x.workflow].filter(Boolean).join(' · '),'tickets',x.id);
 for(const x of s.debtBook?.items||[])if(!closed(x))add(out,'Pohledávka',x.person||x.reason,[x.amount,x.status].filter(v=>v!==undefined&&v!==null).join(' · '),'money',x.id);
 for(const x of s.propertyBook?.candidates||s.propertyBook?.items||[])add(out,'Reality',x.title||x.name||x.address,[x.price,x.rent,x.city].filter(v=>v!==undefined&&v!==null).join(' · '),'money',x.id);
 for(const x of s.documentBook?.items||s.documents?.items||[])add(out,'Dokument',x.title||x.name,[x.type,x.provider,x.counterparty].filter(Boolean).join(' · '),'more',x.id);
 for(const account of Object.values(s.xtbHub?.accounts||{}))for(const x of account?.positions||[])add(out,'XTB',x.ticker||x.name,[x.name,x.category,account.currency].filter(Boolean).join(' · '),'money',x.ticker||x.name);
 index=out;builtRevision=revision;window.__KAMIL_SEARCH_INDEX__={revision,count:out.length,at:Date.now()};return out;
}
export function globalSearchIndex(){return index&&builtRevision===revision?index:build()}
export function searchGlobalIndex(q='',limit=15){
 const n=norm(q);if(!n)return[];const terms=n.split(/\s+/).filter(Boolean);return globalSearchIndex().map(x=>({x,score:terms.reduce((s,t)=>s+(x.text.includes(t)?1:0),0)+(x.text.startsWith(n)?2:0)})).filter(x=>x.score>=terms.length).sort((a,b)=>b.score-a.score||a.x.title.localeCompare(b.x.title,'cs')).slice(0,limit).map(x=>x.x)
}
export function openSearchHit(hit){if(!hit)return false;window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:hit.target||'today'}));return true}
store.subscribe(()=>{revision++;index=null});
