const DAY=86400000;
const active=v=>!/hotov|archiv|done|closed/i.test(String(v||''));
const dayDiff=(v,now)=>{const t=new Date(v).getTime();if(!Number.isFinite(t))return null;const a=new Date(now);a.setHours(0,0,0,0);const b=new Date(t);b.setHours(0,0,0,0);return Math.round((b-a)/DAY)};
const missingNext=p=>!String(p.next||'').trim()||/doplnit další krok|chybi|chybí/i.test(String(p.next||''));
export function projectHealth(state={},now=new Date()){
 const tasks=(state.tasks||[]).filter(t=>active(t.status));
 return (state.projects||[]).filter(p=>active(p.status)).map(p=>{
  const linked=tasks.filter(t=>t.projectId===p.id),overdue=linked.filter(t=>{const d=dayDiff(t.due,now);return d!==null&&d<0}).length;
  const due=dayDiff(p.deadline,now),risk=String(p.risk||'LOW').toUpperCase();let score=100;const reasons=[];
  if(risk==='HIGH'){score-=30;reasons.push('vysoké uložené riziko')}else if(risk==='MEDIUM'){score-=12;reasons.push('střední uložené riziko')}
  if(due!==null&&due<0){score-=30;reasons.push(`deadline ${Math.abs(due)} dní po termínu`)}else if(due!==null&&due<=7){score-=15;reasons.push(`deadline za ${due} dní`)}else if(due!==null&&due<=14){score-=7;reasons.push(`deadline za ${due} dní`)}
  if(overdue){score-=Math.min(30,overdue*8);reasons.push(`${overdue} úkolů po termínu`)}
  if(missingNext(p)){score-=18;reasons.push('chybí konkrétní další krok')}
  if(!String(p.owner||'').trim()){score-=8;reasons.push('chybí odpovědná osoba')}
  score=Math.max(0,Math.min(100,score));const status=score<50?'CRITICAL':score<70?'RISK':score<85?'WATCH':'HEALTHY';
  return {projectId:p.id,name:p.name||'Projekt',score,status,overdue,openTasks:linked.length,deadline:p.deadline||null,owner:p.owner||null,reasons,summary:reasons.length?reasons.join(' · '):'Bez zjištěného rizika podle uložených dat.'};
 }).sort((a,b)=>a.score-b.score||b.overdue-a.overdue||a.name.localeCompare(b.name,'cs'));
}
export const projectHealthNote='Skóre používá pouze uložená projektová data a úkoly. Chybějící finanční nebo externí fakta nepředpokládá.';
