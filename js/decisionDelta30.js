const clean=(v,max=700)=>String(v??'').trim().slice(0,max);
const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
const keyOf=d=>`${clean(d?.domain,80)}|${clean(d?.id||d?.title,180)}`;
const triggerSig=d=>[d?.when,d?.buyRule,d?.sellRule].map(x=>clean(x)).join('|');

export function decisionSnapshot30(decisions=[],now=new Date()){
 const at=new Date(now);const iso=Number.isFinite(at.getTime())?at.toISOString():new Date().toISOString();
 const items=(Array.isArray(decisions)?decisions:[]).map(d=>({
  key:keyOf(d),title:clean(d?.title,180)||'Rozhodnutí',domain:clean(d?.domain,80),kind:clean(d?.kind,100),
  priority:clamp(d?.priority),action:clean(d?.action,40)||null,reason:clean(d?.reason,500)||null,
  when:clean(d?.when,500)||null,buyRule:clean(d?.buyRule,700)||null,sellRule:clean(d?.sellRule,700)||null,
  target:clean(d?.target,80)||null,homeMode:clean(d?.homeMode,80)||null
 })).filter(x=>x.key!=='|').slice(0,12);
 return {version:1,at:iso,items};
}

export function decisionDelta30(currentDecisions=[],baseline=null,now=new Date()){
 const current=decisionSnapshot30(currentDecisions,now),prior=baseline&&baseline.version===1&&Array.isArray(baseline.items)?baseline:null;
 if(!prior)return {initialized:false,baselineAt:null,current,items:[],attention:0,headline:'Výchozí stav ještě není uložený.',note:'Decision Delta porovnává jen uložený lokální baseline s aktuálním rozhodovacím výstupem. Bez baseline nic nedopočítává.'};
 const before=new Map(prior.items.map(x=>[x.key,x])),after=new Map(current.items.map(x=>[x.key,x])),changes=[];
 const add=(type,title,detail,priority,item,previous=null)=>changes.push({type,title,detail:clean(detail,700),priority:clamp(priority),domain:item?.domain||previous?.domain||'',target:item?.target||previous?.target||null,homeMode:item?.homeMode||previous?.homeMode||null,key:item?.key||previous?.key||'',current:item||null,previous:previous||null});
 for(const item of current.items){
  const prev=before.get(item.key);
  if(!prev){add('NEW',item.title,item.action?`Nově v prioritách · ${item.action} · priorita ${item.priority}/100`:`Nově v prioritách · priorita ${item.priority}/100`,Math.max(72,item.priority),item);continue}
  if((prev.action||null)!==(item.action||null)&&(prev.action||item.action)){
   add('ACTION',item.title,`Akce se změnila: ${prev.action||'—'} → ${item.action||'—'}. ${item.reason||''}`,Math.max(92,item.priority),item,prev);continue
  }
  const delta=item.priority-prev.priority,up=(prev.priority<75&&item.priority>=75)||(prev.priority<90&&item.priority>=90),down=(prev.priority>=75&&item.priority<75)||(prev.priority>=90&&item.priority<90);
  if(delta>=10||up){add('UP',item.title,`Priorita vzrostla ${prev.priority} → ${item.priority}/100. ${item.reason||''}`,Math.max(82,item.priority),item,prev);continue}
  if(delta<=-10||down){add('DOWN',item.title,`Priorita klesla ${prev.priority} → ${item.priority}/100.`,58,item,prev);continue}
  if(triggerSig(prev)!==triggerSig(item)&&(item.when||item.buyRule||item.sellRule||prev.when||prev.buyRule||prev.sellRule)){
   add('TRIGGER',item.title,'Změnilo se pravidlo pro další krok / nákup / prodej.',Math.max(68,Math.min(88,item.priority)),item,prev);
  }
 }
 for(const prev of prior.items){if(after.has(prev.key))continue;add('OUT',prev.title,`Vypadlo z aktuálního Top ${current.items.length||5}; to samo o sobě neznamená, že je věc vyřešená.`,prev.priority>=90?68:45,null,prev)}
 const order={ACTION:5,UP:4,NEW:3,TRIGGER:2,DOWN:1,OUT:0};
 changes.sort((a,b)=>b.priority-a.priority||(order[b.type]||0)-(order[a.type]||0)||a.title.localeCompare(b.title,'cs'));
 const attention=changes.filter(x=>x.priority>=75).length;
 return {initialized:true,baselineAt:prior.at||null,current,items:changes.slice(0,12),attention,headline:changes.length?`${changes.length} změn od poslední kontroly.`:'Rozhodnutí se od poslední kontroly nezměnila.',note:'Baseline je uložený jen na tomto zařízení. Decision Delta sleduje změnu akce, významný skok priority, nový/vypadlý bod a změnu skutečných when / buyRule / sellRule; nevymýšlí tržní data ani důvod změny.'};
}

export const decisionDelta30Note='„Co se změnilo?“ porovnává rozhodovací snapshoty, ne jen auditní historii. Vypadnutí z Top priorit není automaticky označeno jako vyřešené.';
