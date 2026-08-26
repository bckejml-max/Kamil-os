import {renderDashboard1103} from './dashboardFx1103.js';
import {enhanceXtbReview110} from './xtbReview110.js';
import {renderPersonalToday640} from './personalToday640.js';

function ensureStyle(){if(!document.querySelector('link[data-dashboard110]')){const l=document.createElement('link');l.rel='stylesheet';l.href='./dashboard110.css';l.dataset.dashboard110='1';document.head.appendChild(l)}if(!document.querySelector('link[data-dashboard1103]')){const l=document.createElement('link');l.rel='stylesheet';l.href='./dashboard1103.css';l.dataset.dashboard1103='1';document.head.appendChild(l)}}
export function renderTodayPage101(){ensureStyle();renderDashboard1103().then(()=>enhanceXtbReview110()).catch(e=>{console.error('[dashboard1103]',e);renderPersonalToday640()})}
