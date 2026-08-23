import {store} from './state.js';
import {uid,toast} from './utils.js';
import {openPersonalAction641} from './personalActionExecution641.js';
import {openVaultEdit641} from './personalVaultEdit641.js';

const iso=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?new Date(t).toISOString():null};
const minusDay=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?new Date(t-86400000).toISOString():null};

export function prepareFamilyEvent644(event={}){
 const eventId=String(event.id||event.title||event.summary||'');if(!eventId)return null;
 const title=`Připravit: ${event.title||event.summary||'rodinná událost'}`;
 let created=null;
 store.mutate(`Přidána příprava rodinné události: ${title}`,s=>{
  s.tasks=Array.isArray(s.tasks)?s.tasks:[];
  const existing=s.tasks.find(x=>String(x.sourceEventId||'')===eventId&&String(x.status||'OPEN').toUpperCase()!=='DONE');
  if(existing){created=existing;return}
  created={id:uid('family-prep'),title,status:'OPEN',category:'Rodina',area:'Rodina',due:minusDay(event.start||event.date||event.when)||iso(event.start||event.date||event.when),sourceEventId:eventId,createdAt:new Date().toISOString()};
  s.tasks.push(created);
 },{undo:true,cloud:true,audit:true});
 toast(created?.sourceEventId===eventId?'Příprava je v osobních úkolech.':'Příprava už existuje.');return created;
}

export function maintenanceAction644(item,source='task'){
 if(!item)return null;const id=String(item.id||item.title||item.name||'');
 return{id:`${source}:${id}`,kind:source==='admin'?'admin':'task',title:item.title||item.name||'Údržba',why:'Domácí údržba nebo servis.',next:'Vyřešit, odložit nebo označit hotovo.',minutes:Number(item.estimateMinutes||15),route:'home'};
}

export function openMaintenance644(item,source='task'){return openPersonalAction641(maintenanceAction644(item,source));}
export function editHomeRecord644(recordId){return openVaultEdit641(recordId);}
