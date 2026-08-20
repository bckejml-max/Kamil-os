const DAY=86400000;
const dayStart=v=>{const d=new Date(v);d.setHours(0,0,0,0);return d.getTime()};
const daysTo=(v,now=new Date())=>{if(!v)return null;const t=new Date(v).getTime();if(!Number.isFinite(t))return null;return Math.round((dayStart(t)-dayStart(now))/DAY)};
const active=x=>String(x.status||'ACTIVE').toUpperCase()!=='ARCHIVED';

export const DOCUMENT_KINDS={ID:'Občanský průkaz',PASSPORT:'Cestovní pas',DRIVER:'Řidičský průkaz',STK:'STK / technická',VIGNETTE:'Dálniční známka',REVISION:'Revize / kontrola',WARRANTY:'Záruka',SERVICE:'Servisní termín',HEALTH_CARD:'Kartička / průkaz',OTHER:'Ostatní'};
export const documentsNote='Documents & Expiry Center používá pouze ručně uložené termíny. Neobjednává obnovu, servis ani úřední úkon a nevymýšlí zákonné lhůty.';

export function documentItem(x={},now=new Date()){
 const d=x.document&&typeof x.document==='object'?x.document:{};
 const expiry=d.expiryDate||x.renewalDate||x.endDate||x.nextDue||null;
 const reminder=d.reminderDate||null;
 const expiryDays=daysTo(expiry,now),reminderDays=daysTo(reminder,now);
 const issues=[];
 if(expiryDays===null)issues.push('Chybí expirace / kontrolní termín');
 else if(expiryDays<0)issues.push('Termín je po expiraci');
 else if(expiryDays<=30)issues.push('Expirace do 30 dní');
 else if(expiryDays<=60)issues.push('Expirace do 60 dní');
 else if(expiryDays<=90)issues.push('Expirace do 90 dní');
 if(reminderDays!==null&&reminderDays<0&&expiryDays!==null&&expiryDays>=0)issues.push('Plánovaný předstih už uplynul');
 if(!String(d.holder||'').trim()&&['ID','PASSPORT','DRIVER','HEALTH_CARD'].includes(d.kind))issues.push('Chybí držitel');
 let priority=20;
 if(expiryDays!==null&&expiryDays<0)priority=100;
 else if(expiryDays!==null&&expiryDays<=14)priority=95;
 else if(expiryDays!==null&&expiryDays<=30)priority=88;
 else if(expiryDays!==null&&expiryDays<=60)priority=72;
 else if(expiryDays!==null&&expiryDays<=90)priority=58;
 if(reminderDays!==null&&reminderDays<=7&&reminderDays>=0)priority=Math.max(priority,90);
 if(expiryDays===null)priority=Math.max(priority,55);
 const status=priority>=90?'URGENT':priority>=70?'SOON':priority>=50?'REVIEW':'OK';
 return {...x,document:d,kind:d.kind||'OTHER',kindLabel:DOCUMENT_KINDS[d.kind]||DOCUMENT_KINDS.OTHER,holder:d.holder||'',number:d.number||'',issuer:d.issuer||'',expiry,reminder,expiryDays,reminderDays,issues,priority,status};
}

export function documentsCenter(s={},now=new Date()){
 const items=(s.personalAdmin?.items||[]).filter(x=>active(x)&&(x.category==='DOCUMENT'||(x.document&&typeof x.document==='object'))).map(x=>documentItem(x,now)).sort((a,b)=>b.priority-a.priority||((a.expiryDays??99999)-(b.expiryDays??99999))||String(a.title||'').localeCompare(String(b.title||''),'cs'));
 return {items,total:items.length,expired:items.filter(x=>x.expiryDays!==null&&x.expiryDays<0).length,due30:items.filter(x=>x.expiryDays!==null&&x.expiryDays>=0&&x.expiryDays<=30).length,due60:items.filter(x=>x.expiryDays!==null&&x.expiryDays>=0&&x.expiryDays<=60).length,due90:items.filter(x=>x.expiryDays!==null&&x.expiryDays>=0&&x.expiryDays<=90).length,missing:items.filter(x=>x.expiryDays===null).length,note:documentsNote};
}
