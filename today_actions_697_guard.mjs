import fs from 'node:fs';
const fail=m=>{console.error(`OS697 guard: ${m}`);process.exitCode=1};
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const mod=read('./js/todayActions697.js'),page=read('./js/todayPage101.js'),release=read('./js/releaseMeta.js'),sw=read('./sw.js'),pkg=read('./package.json');
const version=release.match(/APP_VERSION='([^']+)'/)?.[1]||'';
for(const token of ['completePersonalAction641','postponePersonalActionToTomorrow642','openPersonalAction641','Hotovo','Zítra','__KAMIL_TODAY_ACTIONS697__'])if(!mod.includes(token))fail(`direct-action module missing ${token}`);
for(const token of ["appendTodayActions697","refreshTodayActions697"])if(!page.includes(token))fail(`Today page missing ${token}`);
if(/directDone\([^)]*(ticket|bet|buy|sell)/i.test(mod)||/directTomorrow\([^)]*(ticket|bet|buy|sell)/i.test(mod))fail('financial opportunity must not have one-click execution');
if(version.startsWith('697')){
 for(const token of ["const CACHE='kamil-os-697.0.0-core-r1'",'todayActions697.css','todayActions697.js'])if(!sw.includes(token))fail(`service worker missing ${token}`);
 if(!pkg.includes('today_actions_697_guard.mjs'))fail('release chain missing OS697 guard');
}
if(!process.exitCode)console.log(`OS697 direct actions guard OK · ${version}`);
