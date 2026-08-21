import {directorBriefing34} from './director34.js';
import {personalTimeline} from './personalTimeline26.js';
import {waitingFor35} from './followUp35.js';

const DAY=86400000;
const start=v=>{const d=new Date(v);if(!Number.isFinite(d.getTime()))return null;d.setHours(12,0,0,0);return d};
const diff=(v,now=new Date())=>{const a=start(v),b=start(now);return !a||!b?null:Math.round((a-b)/DAY)};
const ymd=v=>{const d=start(v);return d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:null};
const title=x=>x?.title||x?.name||x?.subject||'Termín';
const active=x=>!['DONE','HOTOVO','CLOSED','ARCHIVED','SOLD','PAYOUT RECEIVED'].includes(String(x?.status||x?.workflow||'').toUpperCase())&&!x?.done&&!x?.completed;
const score=d=>d===null?0:d<0?100:d===0?98:d<=2?94:d<=7?86:d<=14?76:d<=30?66:d<=60?54:44;

function add(out,seen,{id,title:label,at,domain,kind,target='today',detail='',source='ULOŽENÁ DATA'},now){
 const days=diff(at,now);if(days===null||days>90||days<-30)return;const date=ymd(at),key=`${id||label}|${date}`;if(seen.has(key))return;seen.add(key);out.push({id:id||key,title:label||'Termín',date,days,domain,kind,target,detail,source,priority:score(days)});
}

export function deadlineRadar35(state={},now=new Date()){
 const out=[],seen=new Set(),push=x=>add(out,seen,x,now),director=directorBriefing34(state,now),personal=personalTimeline(state,now),waiting=waitingFor35(state,now);
 for(const x of director.deadlines||[])push({id:`director:${x.id}`,title:x.title,at:x.due,domain:'Práce',kind:'Měsíční termín',target:'director',detail:x.note,source:'DIRECTOR MODE'});
 for(const x of state.tasks||[]){if(!active(x)||!x.due)continue;push({id:`task:${x.id}`,title:title(x),at:x.due,domain:x.scope==='work'||String(x.area||'').toLowerCase().includes('prac')?'Práce':'Úkoly',kind:'Úkol',target:x.scope==='work'?'director':'today',detail:x.project||x.area||'',source:'ÚKOLY'})}
 for(const x of personal.items||[])push({id:x.key,title:x.title,at:x.at,domain:x.domain,kind:x.type,target:x.target||'home',detail:x.detail||'',source:x.source});
 for(const x of waiting.rows||[]){if(!x.nextFollowUpAt)continue;push({id:`followup:${x.id}`,title:`Follow-up · ${x.title}`,at:x.nextFollowUpAt,domain:'Follow-up',kind:'Čekám na',target:'waiting',detail:x.person?`Čekám na ${x.person}`:x.reason,source:'WAITING FOR'})}
 for(const x of state.calendar?.events||[]){const at=x?.start?.dateTime||x?.start?.date||x?.start||x?.date||x?.at||null;if(!at)continue;const label=x.title||x.summary||'Kalendář';push({id:`calendar:${x.id||x.uid||label}`,title:label,at,domain:'Kalendář',kind:'Událost',target:'today',detail:x.location||'',source:'KALENDÁŘ'})}
 const rows=out.sort((a,b)=>(a.days<0?0:1)-(b.days<0?0:1)||a.days-b.days||b.priority-a.priority||a.title.localeCompare(b.title,'cs-CZ'));
 const overdue=rows.filter(x=>x.days<0),today=rows.filter(x=>x.days===0),week=rows.filter(x=>x.days>0&&x.days<=7),month=rows.filter(x=>x.days>7&&x.days<=30),quarter=rows.filter(x=>x.days>30&&x.days<=90);
 return {rows,overdue,today,week,month,quarter,total:rows.length,critical:rows.filter(x=>x.priority>=90).length,next:rows.find(x=>x.days>=0)||null,note:'Deadline Radar spojuje pracovní termíny, osobní administrativu, úkoly, follow-upy, vstupenky a kalendář do jednoho 90denního pohledu. Duplicitní termíny se sloučí.'};
}
