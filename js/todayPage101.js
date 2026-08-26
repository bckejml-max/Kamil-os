import {renderDashboard1103} from './dashboardFx1103.js';
import {enhanceXtbReview110} from './xtbReview110.js';
import {enhanceOS111} from './os111.js';
import {enhanceOS112} from './os112.js';
import {enhanceOS113} from './os113.js';
import {enhanceOS114} from './os114.js';
import {renderPersonalToday640} from './personalToday640.js';

function ensureStyle(){
 const styles=[['dashboard110','./dashboard110.css'],['dashboard1103','./dashboard1103.css'],['os111','./os111.css'],['os112','./os112.css'],['os113','./os113.css'],['os114','./os114.css']];
 for(const [key,href] of styles){if(!document.querySelector(`link[data-${key}]`)){const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l)}}
}
export function renderTodayPage101(){ensureStyle();renderDashboard1103().then(()=>{enhanceXtbReview110();return enhanceOS111()}).then(()=>enhanceOS112()).then(()=>enhanceOS113()).then(()=>enhanceOS114()).catch(e=>{console.error('[dashboard114]',e);renderPersonalToday640()})}
