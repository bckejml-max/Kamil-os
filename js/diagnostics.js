import {APP_RELEASE} from './releaseMeta.js';

const KEY='kamil-os-diagnostics-v1';
let seq=0;
const safe=(value,max=1400)=>String(value??'').slice(0,max);
const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||'[]')}catch{return[]}};
const write=rows=>{try{sessionStorage.setItem(KEY,JSON.stringify(rows.slice(-20)))}catch{}};
const reportable=()=>{try{return location.hostname==='kamil-os-smoke.vercel.app'||location.hostname.endsWith('.vercel.app')}catch{return false}};
function report(row){
 if(!reportable())return;
 const view=document.querySelector('.view.on')?.id?.replace(/^view-/,'')||'';
 const body={release:row.release,scope:row.scope,name:row.name,route:location.pathname,view};
 fetch('/api/client-diagnostics',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),keepalive:true}).catch(()=>{});
}

export function recordDiagnostic(scope,error,meta={}){
 const row={
  id:`D${Date.now().toString(36)}-${(++seq).toString(36)}`,
  at:new Date().toISOString(),
  release:APP_RELEASE,
  scope:safe(scope,120),
  name:safe(error?.name||'Error',120),
  message:safe(error?.message||error||'Unknown error'),
  stack:safe(error?.stack||'',3000),
  meta:Object.fromEntries(Object.entries(meta||{}).map(([k,v])=>[safe(k,80),safe(v,300)]))
 };
 const rows=read();rows.push(row);write(rows);report(row);
 return row;
}
export function diagnosticText(id){
 const rows=read(),row=id?rows.find(x=>x.id===id):rows.at(-1);
 return row?JSON.stringify(row,null,2):'No diagnostic record available.';
}
export async function copyDiagnostic(id){
 const text=diagnosticText(id);
 try{await navigator.clipboard.writeText(text);return true}catch{return false}
}
export function recentDiagnostics(){return read()}
