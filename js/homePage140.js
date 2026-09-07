import {store} from './state.js';
import {renderPersonalHome640} from './personalHome640.js';
import {enhanceHomeVisual140} from './homeFamilyVisual140.js';
import {personalHomeTimeline650} from './personalAssistant650.js';
import {personalVault640} from './personalVault640.js';
import {isPersonalScope527} from './personalScope527.js';

const maintRe=/servis|reviz|filtr|čerpad|cerpad|rekuper|klima|kom[ií]n|zahrad|oprava|údržb|udrzb|stk/i,closed=x=>['DONE','CLOSED','ARCHIVED','RESOLVED'].includes(String(x?.status||'').toUpperCase());
function ensureStyle(){if(document.querySelector('link[data-homefamily140]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./homeFamilyVisual140.css';l.dataset.homefamily140='1';document.head.appendChild(l)}
export function homeModel140(s=store.get()){
 const timeline=personalHomeTimeline650(s),vault=personalVault640(s),records=(vault.records||[]).filter(x=>x.section==='home');
 const maintenance=[...(s.personalAdmin?.items||[]),...(s.tasks||[])].filter(x=>!closed(x)&&isPersonalScope527(x)&&maintRe.test(`${x.title||''} ${x.name||''} ${x.category||''}`));
 const urgent=timeline.filter(x=>x.days<=30).slice(0,3).map(x=>({title:x.title,meta:x.days<0?`${Math.abs(x.days)} d po termínu`:x.days===0?'dnes':x.days===1?'zítra':`za ${x.days} d`}));
 return{urgent,overdue:timeline.filter(x=>x.days<0).length,next90:timeline.filter(x=>x.days>=0&&x.days<=90).length,records:records.length,maintenance:maintenance.length};
}
export function renderHomePage140(){ensureStyle();renderPersonalHome640();try{enhanceHomeVisual140(homeModel140())}catch(e){console.warn('[home140]',e)}}
