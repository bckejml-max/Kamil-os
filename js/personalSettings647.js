import {store} from './state.js';
import {h,modal,formModal,downloadJson,toast} from './utils.js';
import {personalVault640} from './personalVault640.js';

const AREAS=[['family','Rodina'],['home','Domov'],['money','Peníze'],['admin','Administrativa']];
const WORK_RE=/zak[aá]zk|faktur|dodavat|pks|cpi|zbrojov|pracovn|xtb|ticket|vstupenk/i;
const auditText=x=>String(x?.reason||x?.title||x?.action||x?.label||x?.message||'Změna');
const auditAt=x=>x?.at||x?.createdAt||x?.time||x?.timestamp||null;
const fmtDate=v=>v?new Date(v).toLocaleString('cs-CZ'):'—';

export function personalSettings647(s=store.get()){
 const p=s.personalSettings||{},priorityArea=AREAS.some(x=>x[0]===p.priorityArea)?p.priorityArea:'none';
 const vault=personalVault640(s),recentAudit=(s.audit||[]).filter(x=>!WORK_RE.test(auditText(x))).slice(-12).reverse();
 const missing=vault.records.filter(x=>x.status.severity>0).length;
 return{priorityArea,cloud:s.meta?.cloudMode==='cloud',lastCloudAt:s.meta?.lastCloudAt||null,lastMutationAt:s.meta?.lastMutationAt||null,coverage:vault.coverage,records:vault.records.length,missing,recentAudit,summary:`${vault.coverage}% dat · ${missing} položek k aktualizaci`};
}

export function savePriorityArea647(area='none'){
 const clean=AREAS.some(x=>x[0]===area)?area:'none';
 store.mutate('Nastavena hlavní osobní priorita',s=>{s.personalSettings=s.personalSettings||{};s.personalSettings.priorityArea=clean;s.personalSettings.updatedAt=new Date().toISOString()},{undo:true,cloud:true,audit:true});
 return clean;
}

export function exportPersonalData647(s=store.get()){
 const payload={exportedAt:new Date().toISOString(),version:'64.7',personalSettings:s.personalSettings||{},tasks:(s.tasks||[]).filter(x=>!WORK_RE.test(`${x.title||''} ${x.category||''} ${x.area||''}`)),delegations:(s.delegations||[]).filter(x=>!WORK_RE.test(`${x.title||''} ${x.category||''}`)),personalAdmin:s.personalAdmin||{items:[]},personalInbox:s.personalInbox||{items:[]},personalGoals:s.personalGoals||{items:[]},personalSpending:s.personalSpending||{transactions:[]},familyHome:s.familyHome||{members:[]},personalVault:s.personalVault||{items:[],evidence:[]},calendar:{...(s.calendar||{}),events:(s.calendar?.events||[]).filter(x=>!WORK_RE.test(`${x.title||x.summary||''} ${x.category||''}`))}};
 downloadJson(`kamil-os-personal-${new Date().toISOString().slice(0,10)}.json`,payload);return payload;
}

export async function openPersonalSettings647(){
 const x=personalSettings647(),opts=[['none','Bez zvýhodnění'],...AREAS].map(([id,label])=>`<option value="${id}" ${x.priorityArea===id?'selected':''}>${h(label)}</option>`).join('');
 const body=`<div class="form-grid"><label>Co má mít malou prioritu navíc<select name="priorityArea" autofocus>${opts}</select></label><div class="decision-note">Termíny a skutečná naléhavost mají vždy přednost. Tohle jen pomáhá rozhodnout mezi podobně důležitými věcmi.</div></div>`;
 const result=await formModal('Osobní nastavení',body,{submitLabel:'Uložit prioritu'});
 if(result){savePriorityArea647(result.priorityArea);toast('Osobní priorita uložena.');return result.priorityArea}return null;
}

export async function openPersonalDataHealth647(){
 const x=personalSettings647();
 const audit=x.recentAudit.length?x.recentAudit.map(a=>`<div class="row"><div><b>${h(auditText(a))}</b><div class="muted">${h(fmtDate(auditAt(a)))}</div></div></div>`).join(''):'<div class="empty">Zatím bez osobních změn v auditu.</div>';
 const body=`<div class="metric-strip"><div class="metric"><span>Pokrytí dat</span><b>${x.coverage}%</b></div><div class="metric"><span>K aktualizaci</span><b>${x.missing}</b></div><div class="metric"><span>Záznamů</span><b>${x.records}</b></div><div class="metric"><span>Cloud</span><b>${x.cloud?'Připojen':'Jen toto zařízení'}</b></div></div><div class="card"><div class="eyebrow">SYNCHRONIZACE</div><div class="row"><span>Poslední cloud sync</span><b>${h(fmtDate(x.lastCloudAt))}</b></div><div class="row"><span>Poslední změna</span><b>${h(fmtDate(x.lastMutationAt))}</b></div></div><div class="card"><div class="eyebrow">POSLEDNÍ OSOBNÍ ZMĚNY</div>${audit}</div>`;
 const choice=await modal('Stav osobních dat',body,[{label:'Exportovat osobní data',value:'export',primary:true},{label:'Zavřít',value:null}]);
 if(choice==='export'){exportPersonalData647();toast('Export osobních dat vytvořen.');return 'export'}return choice;
}
