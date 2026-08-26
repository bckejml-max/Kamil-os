import {renderPersonalFamily640} from './personalFamily640.js';
import {enhanceFamilyVisual140} from './homeFamilyVisual140.js';
function ensureStyle(){if(document.querySelector('link[data-homefamily140]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./homeFamilyVisual140.css';l.dataset.homefamily140='1';document.head.appendChild(l)}
function data(){const x=window.__KAMIL_PERSONAL_FAMILY_650_LAST__||{};const urgent=[...document.querySelectorAll('#ticketsView .family-action-row')].slice(0,3).map(el=>({title:el.querySelector('b')?.textContent||'Položka',meta:el.querySelector('.muted')?.textContent||''}));const m=[...document.querySelectorAll('#ticketsView .family-metrics .metric b')].map(el=>Number(el.textContent||0));return{urgent,overdue:m[0]||0,due7:m[1]||0,tasks:x.tasks||0,members:x.members||0}}
export function renderFamilyPage140(){ensureStyle();renderPersonalFamily640();try{enhanceFamilyVisual140(data())}catch(e){console.warn('[family140]',e)}}
