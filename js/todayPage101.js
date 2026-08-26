import {renderDashboard1103} from './dashboardFx1103.js';
import {enhanceXtbReview110} from './xtbReview110.js';
import {enhanceOS111} from './os111.js';
import {enhanceOS112} from './os112.js';
import {enhanceOS113} from './os113.js';
import {enhanceOS114} from './os114.js';
import {enhanceOS115} from './os115.js';
import {enhanceOS116} from './os116.js';
import {enhanceOS117} from './os117.js';
import {enhanceOS118} from './os118.js';
import {enhanceOS119} from './os119.js';
import {renderPersonalToday640} from './personalToday640.js';

function ensureStyle(){
 const styles=[['dashboard110','./dashboard110.css'],['dashboard1103','./dashboard1103.css'],['os111','./os111.css'],['os112','./os112.css'],['os113','./os113.css'],['os114','./os114.css'],['os115','./os115.css'],['os116','./os116.css'],['os117','./os117.css'],['os118','./os118.css'],['os119','./os119.css']];
 for(const [key,href] of styles){if(!document.querySelector(`link[data-${key}]`)){const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(`data-${key}`,'1');document.head.appendChild(l)}}
}
export function renderTodayPage101(){ensureStyle();renderDashboard1103().then(()=>{enhanceXtbReview110();return enhanceOS111()}).then(()=>enhanceOS112()).then(()=>enhanceOS113()).then(()=>enhanceOS114()).then(()=>enhanceOS115()).then(()=>enhanceOS116()).then(()=>enhanceOS117()).then(()=>enhanceOS118()).then(()=>enhanceOS119()).catch(e=>{console.error('[dashboard119]',e);renderPersonalToday640()})}
