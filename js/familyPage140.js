import {renderPersonalFamily640} from './personalFamily640.js';
import {enhanceFamilyVisual140} from './homeFamilyVisual140.js';
import {appendFamilyHub610} from './familyHub610.js';
function ensureStyle(){for(const [key,href] of [['homefamily140','./homeFamilyVisual140.css'],['upgrade610','./upgrade610.css']]){if(document.querySelector(`link[data-${key}]`))continue;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l)}}
function data(){const x=window.__KAMIL_PERSONAL_FAMILY_650_LAST__||{};const urgent=[...document.querySelectorAll('#ticketsView .family-action-row')].slice(0,3).map(el=>({title:el.querySelector('b')?.textContent||'Položka',meta:el.querySelector('.muted')?.textContent||''}));const m=[...document.querySelectorAll('#ticketsView .family-metrics .metric b')].map(el=>Number(el.textContent||0));return{urgent,overdue:m[0]||0,due7:m[1]||0,tasks:x.tasks||0,members:x.members||0}}
export function renderFamilyPage140(){ensureStyle();renderPersonalFamily640();appendFamilyHub610();try{enhanceFamilyVisual140(data())}catch(e){console.warn('[family610]',e)}}
