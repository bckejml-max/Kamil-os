import {store} from './state.js';
import {renderPersonalFamily640} from './personalFamily640.js';
import {enhanceFamilyVisual140} from './homeFamilyVisual140.js';
import {appendFamilyHub610} from './familyHub610.js';
import {personalDaysTo650} from './personalDate650.js';
import {isPersonalScope527} from './personalScope527.js';

const familyRe=/rodin|d[ií]t|dcera|manžel|manzel|mam|tat|babi|děd|ded/i,closed=x=>['DONE','CLOSED','ARCHIVED','RESOLVED'].includes(String(x?.status||'').toUpperCase());
function ensureStyle(){for(const [key,href] of [['homefamily140','./homeFamilyVisual140.css'],['upgrade610','./upgrade610.css']]){if(document.querySelector(`link[data-${key}]`))continue;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l)}}
export function familyModel140(s=store.get()){
 const days=personalDaysTo650,members=Array.isArray(s.familyHome?.members)?s.familyHome.members:[];
 const events=(s.calendar?.events||[]).filter(isPersonalScope527).map(x=>({...x,d:days(x.start||x.date||x.when)})).filter(x=>x.d!==null&&x.d>=0&&x.d<=30);
 const tasks=(s.tasks||[]).filter(isPersonalScope527).filter(x=>!closed(x)&&(familyRe.test(`${x.title||''} ${x.category||''} ${x.area||''}`)||String(x.area||'').toLowerCase()==='rodina')).map(x=>({...x,d:days(x.due)}));
 const urgent=[...events.filter(x=>x.d<=2).map(x=>({title:x.title||x.summary||'Událost',meta:x.d===0?'dnes':x.d===1?'zítra':`za ${x.d} d`})),...tasks.filter(x=>x.d!==null&&x.d<=3).map(x=>({title:x.title||x.name||'Úkol',meta:x.d<0?`${Math.abs(x.d)} d po termínu`:x.d===0?'dnes':x.d===1?'zítra':`za ${x.d} d`}))].slice(0,3);
 return{urgent,overdue:tasks.filter(x=>x.d!==null&&x.d<0).length,due7:events.filter(x=>x.d<=7).length+tasks.filter(x=>x.d!==null&&x.d>=0&&x.d<=7).length,tasks:tasks.length,members:members.length};
}
export function renderFamilyPage140(){ensureStyle();renderPersonalFamily640();appendFamilyHub610();try{enhanceFamilyVisual140(familyModel140())}catch(e){console.warn('[family140]',e)}}
