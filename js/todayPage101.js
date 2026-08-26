import {renderDashboard110} from './dashboard110.js';
import {enhanceXtbReview110} from './xtbReview110.js';
import {renderPersonalToday640} from './personalToday640.js';

function ensureStyle(){if(document.querySelector('link[data-dashboard110]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./dashboard110.css';l.dataset.dashboard110='1';document.head.appendChild(l)}
export function renderTodayPage101(){ensureStyle();renderDashboard110().then(()=>enhanceXtbReview110()).catch(e=>{console.error('[dashboard110]',e);renderPersonalToday640()})}
