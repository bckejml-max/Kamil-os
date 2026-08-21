const KEY='kamil-os-safe-boot-42-1';
const now=()=>Date.now();
export function safeBootState421(){try{return JSON.parse(sessionStorage.getItem(KEY)||'null')||{}}catch{return{}}}
export function markSafeBoot421(stage){const s={...safeBootState421(),[stage]:now()};try{sessionStorage.setItem(KEY,JSON.stringify(s))}catch{}return s}
export function armSafeBoot421(){markSafeBoot421('armed');const timer=setTimeout(()=>{const s=safeBootState421();if(s.interactive)return;document.documentElement.dataset.kamilSafeBoot='1';window.dispatchEvent(new CustomEvent('kamil:safe-boot',{detail:{reason:'interactive-timeout'}}));},6000);window.addEventListener('kamil:app-interactive',()=>{clearTimeout(timer);markSafeBoot421('interactive')},{once:true});return timer}
