import {renderPersonalHome640} from './personalHome640.js';
import {enhanceHomeVisual140} from './homeFamilyVisual140.js';
function data(){const x=window.__KAMIL_PERSONAL_HOME_650_LAST__||{};const urgent=[...document.querySelectorAll('#homeView .home-action-row')].slice(0,3).map(el=>({title:el.querySelector('b')?.textContent||'Položka',meta:el.querySelector('.muted')?.textContent||''}));return{urgent,overdue:x.overdue||0,next90:document.querySelector('#homeView .home-metrics .metric:nth-child(2) b')?.textContent||0,records:x.records||0,maintenance:x.maintenance||0}}
export function renderHomePage140(){renderPersonalHome640();try{enhanceHomeVisual140(data())}catch(e){console.warn('[home140]',e)}}
