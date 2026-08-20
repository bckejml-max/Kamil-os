import {renderAutopilot} from './autopilotUi28.js';

const later=view=>queueMicrotask(()=>renderAutopilot(view));
document.addEventListener('click',e=>{
 if(e.target.closest('[data-home-mode],[data-home-back]'))later('home');
 if(e.target.closest('[data-more26],#more26Back'))later('more');
 if(e.target.closest('[data-xtb-detail],#xtbBack25'))later('money');
});
window.addEventListener('kamil:home-open',()=>later('home'));
window.addEventListener('kamil:navigate',e=>later(e.detail));
