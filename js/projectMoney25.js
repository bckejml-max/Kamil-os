const n=v=>Number(v||0);
const active=v=>!/hotov|archiv|done|closed/i.test(String(v||''));
const clamp0=v=>Math.max(0,n(v));
const hasNumber=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));

export const projectMoneyNote='Project Money používá jen ručně uložená finanční fakta u projektu. Neodhaduje budoucí náklady, marži, schválení ZL ani stav fakturace, který není zadaný.';

export function projectMoneyRow(project={}){
 const m=project.money&&typeof project.money==='object'?project.money:{};
 const contract=hasNumber(m.contractValue)?clamp0(m.contractValue):null;
 const approved=hasNumber(m.approvedChanges)?clamp0(m.approvedChanges):null;
 const pending=hasNumber(m.pendingClaims)?clamp0(m.pendingClaims):null;
 const invoiced=hasNumber(m.invoiced)?clamp0(m.invoiced):null;
 const paid=hasNumber(m.paid)?clamp0(m.paid):null;
 const knownCosts=hasNumber(m.knownCosts)?clamp0(m.knownCosts):null;
 const secured=contract===null&&approved===null?null:clamp0(contract)+clamp0(approved);
 const receivable=invoiced===null||paid===null?null:Math.max(0,invoiced-paid);
 const unbilled=secured===null||invoiced===null?null:Math.max(0,secured-invoiced);
 const coverage=[contract,approved,pending,invoiced,paid,knownCosts].filter(x=>x!==null).length;
 const issues=[];
 if(coverage===0)issues.push('Chybí finanční data');
 if(pending!==null&&pending>0)issues.push('Otevřené ZL / claimy');
 if(receivable!==null&&receivable>0)issues.push('Nevybraná fakturace');
 if(unbilled!==null&&unbilled>0)issues.push('Schválená hodnota bez fakturace');
 if(invoiced!==null&&paid!==null&&paid>invoiced)issues.push('Zaplaceno je vyšší než vyfakturováno – zkontrolovat data');
 const exposure=clamp0(pending)+clamp0(receivable)+clamp0(unbilled);
 let priority=coverage===0?65:40;
 if(pending>0)priority+=Math.min(25,Math.round(pending/100000));
 if(receivable>0)priority+=Math.min(25,Math.round(receivable/100000));
 if(unbilled>0)priority+=Math.min(20,Math.round(unbilled/200000));
 priority=Math.min(100,priority);
 const status=priority>=85?'CRITICAL':priority>=65?'RISK':priority>=45?'WATCH':'OK';
 const next=issues[0]||'Finanční data bez zjevné otevřené položky';
 return {projectId:project.id,name:project.name||'Projekt',owner:project.owner||null,contract,approved,pending,invoiced,paid,knownCosts,secured,receivable,unbilled,coverage,exposure,issues,priority,status,next,updatedAt:m.updatedAt||null};
}

export function projectMoney(s={}){
 const rows=(s.projects||[]).filter(p=>active(p.status)).map(projectMoneyRow).sort((a,b)=>b.priority-a.priority||b.exposure-a.exposure||String(a.name).localeCompare(String(b.name),'cs'));
 const known=rows.filter(x=>x.coverage>0),sum=k=>known.reduce((a,x)=>a+clamp0(x[k]),0);
 return {rows,totalProjects:rows.length,withData:known.length,missingData:rows.length-known.length,secured:sum('secured'),pending:sum('pending'),invoiced:sum('invoiced'),paid:sum('paid'),receivable:sum('receivable'),unbilled:sum('unbilled'),knownCosts:sum('knownCosts'),exposure:sum('exposure'),critical:rows.filter(x=>x.status==='CRITICAL').length,note:projectMoneyNote};
}
