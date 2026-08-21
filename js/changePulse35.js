import {waitingFor35} from './followUp35.js';

const DAY=86400000;
const when=x=>x?.at||x?.receivedAt||x?.createdAt||x?.updatedAt||x?.date||null;
const ms=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d.getTime():0};
const upper=v=>String(v||'').toUpperCase();
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('cs-CZ');
const after=(v,since)=>ms(v)>ms(since);
const labelTarget=label=>{const n=norm(label);if(/vstup|ticket|viagogo/.test(n))return'tickets';if(/xtb|invest|portfolio|penize|finance|efekta/.test(n))return'money';if(/e-mail|email|mail|inbox/.test(n))return'email';if(/faktur|zakaz|dodavat|reditel|pks|cpi|zbrojov|dochaz|cestak|pracov|waiting|follow-up/.test(n))return'director';if(/rodin|doklad|pojist|domov|auto|osob/.test(n))return'home';return'today'};
const labelKind=target=>({tickets:'Vstupenky',money:'Peníze',email:'E-mail',director:'Práce',home:'Osobní',today:'OS'})[target]||'OS';

export function changePulse35(state={},sinceRaw=null,now=new Date()){
 const fallback=new Date(now.getTime()-DAY),since=ms(sinceRaw)?new Date(sinceRaw):fallback,items=[];
 const push=x=>{if(!x?.title||!x?.at||!after(x.at,since))return;items.push(x)};

 for(const a of state.audit||[]){
  if(!a?.label||!after(a.at,since))continue;
  const target=labelTarget(a.label);push({id:`audit:${a.id||a.at}:${a.label}`,kind:labelKind(target),title:a.label,detail:'Změna uložená v Kamil OS',at:a.at,priority:58,target});
 }

 for(const m of state.inbox||[]){
  const at=m.receivedAt||m.createdAt||m.date||m.at;if(!after(at,since))continue;
  const incoming=m.direction?upper(m.direction)!=='OUTBOUND':true;if(!incoming)continue;
  const important=m.important===true||upper(m.priority)==='HIGH'||upper(m.importance)==='HIGH';
  push({id:`inbox:${m.id||at}`,kind:'E-mail',title:m.subject||m.title||'Nový e-mail',detail:`${m.from||m.sender||'Inbox'}${m.unread===false?'':' · nepřečtené'}`,at,priority:important?90:72,target:'email'});
 }

 const waiting=waitingFor35(state,now);
 for(const w of waiting.rows){
  if(!w.replyDetected||!after(w.replyAt,since))continue;
  push({id:`reply:${w.id}:${w.replyAt}`,kind:'Waiting For',title:`Přišla odpověď · ${w.title}`,detail:`${w.replyFrom?`Od ${w.replyFrom} · `:''}${w.linkConfidence?`shoda ${w.linkConfidence} % · `:''}čekání můžeš zkontrolovat a uzavřít.`,at:w.replyAt,priority:94,target:'email'});
 }

 const xtbAt=state.xtbHub?.asOf||state.xtbHub?.updatedAt||state.xtbHub?.report?.asOf||state.xtbReport?.asOf;
 if(after(xtbAt,since))push({id:`xtb:${xtbAt}`,kind:'Investice',title:'Aktualizovala se data XTB',detail:'Portfolio a doporučení používají novější import.',at:xtbAt,priority:68,target:'money'});
 const ticketAt=state.meta?.currentTicketSnapshotAt;
 if(after(ticketAt,since))push({id:`tickets:${ticketAt}`,kind:'Vstupenky',title:'Aktualizoval se stav vstupenek',detail:'Aktivní nabídky a ticket intelligence mají novější snapshot.',at:ticketAt,priority:67,target:'tickets'});

 const seen=new Set(),dedup=items.sort((a,b)=>b.priority-a.priority||ms(b.at)-ms(a.at)).filter(x=>{const key=`${x.kind}|${norm(x.title)}`;if(seen.has(key))return false;seen.add(key);return true});
 const high=dedup.filter(x=>x.priority>=85),emails=dedup.filter(x=>x.kind==='E-mail'||x.kind==='Waiting For'),finance=dedup.filter(x=>x.target==='money'),tickets=dedup.filter(x=>x.target==='tickets');
 return {since:since.toISOString(),until:now.toISOString(),items:dedup.slice(0,20),top:dedup.slice(0,5),total:dedup.length,high:high.length,emails:emails.length,finance:finance.length,tickets:tickets.length,note:'Change Pulse porovnává tuto relaci s posledním otevřením na tomto zařízení. Nové interní e-maily a rozpoznané odpovědi teď otevírá přímo v E-mail Control.'};
}
