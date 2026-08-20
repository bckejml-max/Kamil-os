const DAY=86400000;
const n=v=>Number(v||0);
const activeStatus=v=>!/hotov|archiv|done|closed/i.test(String(v||''));
const validTime=v=>{const t=new Date(v).getTime();return Number.isFinite(t)?t:null};
const startDay=v=>{const d=new Date(v);d.setHours(0,0,0,0);return d.getTime()};
const daysFrom=(raw,now)=>{const t=validTime(raw);if(t===null)return null;return Math.round((startDay(t)-startDay(now))/DAY)};
const high=v=>String(v||'').toUpperCase()==='HIGH';
const risk=v=>String(v||'LOW').toUpperCase();
const missingNext=p=>!String(p.next||'').trim()||/doplnit další krok|chybi|chybí/i.test(String(p.next||''));

export function directorOS(s={},now=new Date()){
 const tasks=(s.tasks||[]).filter(t=>activeStatus(t.status));
 const projects=(s.projects||[]).filter(p=>activeStatus(p.status));
 const waits=(s.delegations||[]).filter(w=>activeStatus(w.status)&&String(w.status||'WAITING').toUpperCase()!=='DONE');
 const queue=[];
 const push=x=>queue.push({...x,priority:Math.max(0,Math.min(100,n(x.priority)))});

 for(const t of tasks){
  const dd=daysFrom(t.due,now),assigned=!!String(t.owner||'').trim();
  if(dd!==null&&dd<0){
   push({id:`task:${t.id}`,kind:'TASK',title:t.title||'Úkol po termínu',priority:high(t.priority)?98:assigned?88:92,action:assigned?'ESKALOVAT':'UDĚLAT',reason:assigned?`Úkol je po termínu a má odpovědnou osobu ${t.owner}. Neber ho automaticky zpět; nejdřív vyžádej stav.`:'Úkol je po termínu a nemá jasně uvedenou odpovědnou osobu.',owner:t.owner||null,due:t.due||null,projectId:t.projectId||null,source:'ULOŽENÁ DATA'});
   continue;
  }
  if(high(t.priority)&&!assigned&&(dd===null||dd<=7))push({id:`task:${t.id}`,kind:'TASK',title:t.title||'Prioritní úkol',priority:dd!==null&&dd<=1?94:86,action:'ROZHODNOUT',reason:'Vysoká priorita bez uvedené odpovědné osoby. Ředitelská práce je určit vlastníka nebo další krok.',owner:null,due:t.due||null,projectId:t.projectId||null,source:'ULOŽENÁ DATA'});
 }

 for(const p of projects){
  const dd=daysFrom(p.deadline,now),r=risk(p.risk),noNext=missingNext(p);
  if(r==='HIGH')push({id:`project-risk:${p.id}`,kind:'PROJECT',title:p.name||'Rizikový projekt',priority:dd!==null&&dd<0?99:95,action:'ROZHODNOUT',reason:`Projekt má vysoké uložené riziko${dd!==null?` a deadline ${dd<0?`${Math.abs(dd)} dní po termínu`:`za ${dd} dní`}`:''}.`,owner:p.owner||null,due:p.deadline||null,projectId:p.id,source:'ULOŽENÁ DATA'});
  if(noNext)push({id:`project-next:${p.id}`,kind:'PROJECT',title:p.name||'Projekt bez dalšího kroku',priority:r==='HIGH'?94:82,action:'URČIT KROK',reason:'Aktivní projekt nemá konkrétní další krok. Bez něj nejde řídit odpovědnost ani progres.',owner:p.owner||null,due:p.deadline||null,projectId:p.id,source:'PRAVIDLO'});
  if(dd!==null&&dd>=0&&dd<=14&&r!=='HIGH')push({id:`project-deadline:${p.id}`,kind:'PROJECT',title:p.name||'Blížící se deadline',priority:dd<=3?93:dd<=7?87:80,action:'PROVĚŘIT',reason:`Deadline projektu je za ${dd} dní. Prověř stav a blokace dřív, než vznikne eskalace.`,owner:p.owner||null,due:p.deadline||null,projectId:p.id,source:'ULOŽENÁ DATA'});
 }

 for(const w of waits){
  const dd=daysFrom(w.followUpAt,now);if(dd===null||dd>0)continue;
  push({id:`wait:${w.id}`,kind:'WAIT',title:w.title||'Čekání bez odpovědi',priority:dd<0?90:84,action:'FOLLOW-UP',reason:dd<0?`Kontrolní termín čekání je ${Math.abs(dd)} dní po termínu.`:'Dnes je naplánovaný follow-up.',owner:w.person||null,due:w.followUpAt||null,projectId:null,source:'ULOŽENÁ DATA'});
 }

 queue.sort((a,b)=>b.priority-a.priority||String(a.title).localeCompare(String(b.title),'cs'));
 const dedup=[];const seen=new Set();for(const x of queue){const key=`${x.kind}:${x.title}:${x.action}`;if(seen.has(key))continue;seen.add(key);dedup.push(x)}
 const top=dedup.slice(0,7),critical=dedup.filter(x=>x.priority>=95).length,escalations=dedup.filter(x=>['ESKALOVAT','FOLLOW-UP'].includes(x.action)).length,decisions=dedup.filter(x=>['ROZHODNOUT','URČIT KROK'].includes(x.action)).length;
 return {items:top,total:dedup.length,critical,escalations,decisions,projects:projects.length,tasks:tasks.length,waits:waits.length,summary:top.length?`Ředitelská fronta má ${top.length} prioritních zásahů. Nejdřív řeš rozhodnutí a eskalace, ne běžnou operativu.`:'Žádná ředitelská eskalace podle uložených dat. Můžeš řídit dopředu místo hašení.',note:'Director OS používá pouze uložené projekty, úkoly a Čekám na. Nevytváří stav projektu, termíny ani odpovědnost, které v datech nejsou.'};
}
