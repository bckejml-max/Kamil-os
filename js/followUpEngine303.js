import {store} from './state.js';
import {buildFollowUps301} from './followUp301.js';
const DAY=86400000;
export function buildFollowUpEngine303(s=store.get(),now=Date.now()){const rows=buildFollowUps301(s,now).filter(x=>x.days<=7).map(x=>({...x,stage:x.days<0?'OVERDUE':x.days===0?'TODAY':x.days<=2?'NEXT':'SOON'}));return{rows,overdue:rows.filter(x=>x.stage==='OVERDUE'),today:rows.filter(x=>x.stage==='TODAY'),next:rows.filter(x=>x.stage==='NEXT'),soon:rows.filter(x=>x.stage==='SOON')}}
function mutateDelegation(id,fn,label){let changed=false;store.mutate(label,s=>{const row=(s.delegations||[]).find(x=>String(x.id||'')===String(id));if(!row)return;fn(row);row.updatedAt=new Date().toISOString();changed=true});return changed}
export function completeFollowUp303(id){return mutateDelegation(id,row=>{row.status='DONE';row.completedAt=new Date().toISOString()},'Follow-up hotovo')}
export function snoozeFollowUp303(id,days=1){return mutateDelegation(id,row=>{const d=new Date();d.setDate(d.getDate()+Math.max(1,Number(days)||1));d.setHours(9,0,0,0);row.followUpAt=d.toISOString()},`Follow-up odložen +${days}d`)}
export function touchFollowUp303(id){return mutateDelegation(id,row=>{row.lastFollowUpAt=new Date().toISOString();row.followUpAt=new Date(Date.now()+DAY).toISOString()},'Follow-up kontaktován')}
