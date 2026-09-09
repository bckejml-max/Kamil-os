import {installRuntimeOwnership1100,ownEvent1100,activateDomain1100} from './runtimeOwnership1100.js';

const VERSION='1230.0.0',OWNER='core.view-lifecycle1230';
const VIEW_DOMAIN={tickets:'tickets',betting:'betting',money:'finance'};
const state=globalThis.__KAMIL_VIEW_LIFECYCLE1230__||(globalThis.__KAMIL_VIEW_LIFECYCLE1230__={version:VERSION,installed:false,current:null,history:[]});
function mark(view){const next=String(view||'today'),domain=VIEW_DOMAIN[next]||'core',previous=state.current;state.current=next;state.history.push({from:previous,to:next,domain,at:Date.now()});if(state.history.length>100)state.history.shift();document.documentElement.dataset.activeView1230=next;document.documentElement.dataset.activeDomain1230=domain;activateDomain1100(domain);globalThis.dispatchEvent?.(new CustomEvent('kamil:domain-active1230',{detail:{view:next,domain,previous}}));return{view:next,domain,previous}}
function onView(e){mark(e?.detail)}
export function viewLifecycle1230(){return{version:VERSION,installed:state.installed,current:state.current,domain:VIEW_DOMAIN[state.current]||'core',history:state.history.slice(-30)}}
export function installViewLifecycle1230(){if(state.installed)return viewLifecycle1230();installRuntimeOwnership1100();activateDomain1100('core',[OWNER]);state.installed=true;ownEvent1100(OWNER,globalThis,'kamil:view-change',onView);const initial=document.querySelector('[data-view].on')?.dataset?.view||document.querySelector('[id^="view-"][class~="on"]')?.id?.replace(/^view-/,'')||'today';mark(initial);globalThis.__KAMIL_VIEW_LIFECYCLE1230_API__={snapshot:viewLifecycle1230,mark};return viewLifecycle1230()}
