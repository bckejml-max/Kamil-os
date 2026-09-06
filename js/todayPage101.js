import {renderDashboard1103} from './dashboardFx1103.js';
import {enhanceXtbReview110} from './xtbReview110.js';
import {renderPersonalToday640} from './personalToday640.js';
import {appendTodayHub650} from './todayHub650.js';
import {appendTodayPriority696,refreshTodayPriority696} from './todayPriority696.js';
import {appendTodayActions697,refreshTodayActions697} from './todayActions697.js';
import {appendOperatorSummary717} from './operator717.js';

const styles=[
 ['dashboard110','./dashboard110.css'],
 ['dashboard1103','./dashboard1103.css'],
 ['os164','./os164.css'],
 ['os181','./os181.css']
];
const addons=[
 ['./dataTrust163.js','enhanceDataTrust163'],
 ['./executiveCommand164.js','enhanceExecutiveCommand164'],
 ['./os181Suite.js','enhanceToday181'],
 ['./os181Final.js','enhanceToday181Final']
];

function ensureStyle(){
 for(const [key,href] of styles){
  if(document.querySelector(`link[data-${key}]`))continue;
  const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l);
 }
}
async function loadCanonicalAddons(){
 const loaded=[];
 for(const [path,fn] of addons){
  try{const mod=await import(path);if(typeof mod?.[fn]==='function'){await mod[fn]();loaded.push(path)}}
  catch(error){console.error(`[today canonical addon failed] ${path}`,error)}
 }
 window.__KAMIL_TODAY_717__={healthy:loaded.length===addons.length,loaded,priorityCockpit:true,directActions:true,operatorCenter:true,legacyAddonsRemoved:true,at:Date.now()};
}
function mountPriority(){
 try{appendTodayPriority696()}catch(error){console.error('[today696]',error)}
 try{appendTodayActions697()}catch(error){console.error('[today697]',error)}
 for(const ms of [80,260,700])setTimeout(()=>{try{refreshTodayPriority696()}catch(error){console.error('[today696 refresh]',error)};setTimeout(()=>{try{refreshTodayActions697()}catch(error){console.error('[today697 refresh]',error)};setTimeout(()=>appendOperatorSummary717().catch(error=>console.error('[operator717]',error)),35)},35)},ms);
}
export function renderTodayPage101(){
 ensureStyle();
 renderDashboard1103().then(async()=>{
  try{enhanceXtbReview110()}catch(error){console.error('[xtb review]',error)}
  try{appendTodayHub650()}catch(error){console.error('[today650]',error)}
  await loadCanonicalAddons();
  try{window.__KAMIL_TODAY_HUB650__?.refresh?.(20)}catch(error){console.error('[today650 refresh]',error)}
  mountPriority();
 }).catch(error=>{
  console.error('[dashboard core]',error);renderPersonalToday640();
  try{appendTodayHub650()}catch(fallbackError){console.error('[today650 fallback]',fallbackError)}
  mountPriority();
 });
}
