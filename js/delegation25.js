const DAY=86400000;
const validTime=v=>{const t=new Date(v).getTime();return Number.isFinite(t)?t:null};
const startDay=v=>{const d=new Date(v);d.setHours(0,0,0,0);return d.getTime()};
const dayDelta=(raw,now)=>{const t=validTime(raw);if(t===null)return null;return Math.round((startDay(t)-startDay(now))/DAY)};
const ageDays=(raw,now)=>{const t=validTime(raw);if(t===null)return null;return Math.max(0,Math.floor((now.getTime()-t)/DAY))};
const active=w=>!/done|hotov|closed|archiv/i.test(String(w.status||'WAITING'));

export function delegationCenter(s={},now=new Date()){
 const rows=(s.delegations||[]).filter(active).map(w=>{
  const due=dayDelta(w.followUpAt,now),age=ageDays(w.createdAt,now),last=ageDays(w.lastContactAt,now);
  let state='WAITING',priority=40,action='ČEKAT',reason='Follow-up zatím není potřeba.';
  if(due!==null&&due<0){state='OVERDUE';priority=Math.min(100,88+Math.min(10,Math.abs(due)));action='FOLLOW-UP';reason=`Kontrolní termín je ${Math.abs(due)} dní po termínu.`}
  else if(due===0){state='DUE';priority=84;action='FOLLOW-UP';reason='Dnes je naplánovaný follow-up.'}
  else if(due===null&&age!==null&&age>=7){state='STALE';priority=Math.min(82,70+Math.floor(age/3));action='NAPLÁNOVAT';reason=`Čekání běží ${age} dní bez kontrolního termínu.`}
  else if(due!==null&&due<=2){state='SOON';priority=62;action='PŘIPRAVIT';reason=`Follow-up je za ${due} ${due===1?'den':'dny'}.`}
  if(last!==null&&last===0&&['OVERDUE','DUE'].includes(state)){priority=Math.max(55,priority-25);reason+=' Kontakt už byl dnes zaznamenán.'}
  return {id:w.id,title:w.title||'Čekám na odpověď',person:w.person||'',state,priority,action,reason,followUpAt:w.followUpAt||null,createdAt:w.createdAt||null,lastContactAt:w.lastContactAt||null,ageDays:age,dueDays:due,source:'ULOŽENÁ DATA'};
 }).sort((a,b)=>b.priority-a.priority||String(a.title).localeCompare(String(b.title),'cs'));
 const overdue=rows.filter(x=>x.state==='OVERDUE').length,due=rows.filter(x=>x.state==='DUE').length,stale=rows.filter(x=>x.state==='STALE').length;
 const contactedToday=rows.filter(x=>ageDays(x.lastContactAt,now)===0).length;
 return {rows,total:rows.length,overdue,due,stale,contactedToday,needsAction:rows.filter(x=>['FOLLOW-UP','NAPLÁNOVAT'].includes(x.action)).length,summary:overdue?`${overdue} delegací je po kontrolním termínu. Začni follow-upy, ne přebíráním práce zpět.`:due?`${due} delegací má follow-up dnes.`:stale?`${stale} delegací čeká bez kontrolního termínu.`:rows.length?'Delegace jsou pod kontrolou podle uložených termínů.':'Nemáš žádné aktivní položky Čekám na.',note:'Delegation Center pracuje jen s uloženými delegacemi a termíny. Nic neposílá ani neeskaluje automaticky.'};
}
