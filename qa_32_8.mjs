await import('./qa_32_7.mjs');
await import('./daily_profit_brief_32_test.mjs');
await import('./daily_profit_brief_32_static_test.mjs');
import fs from 'node:fs';
const t=f=>fs.readFileSync(f,'utf8'),assert=(x,m)=>{if(!x)throw new Error(m)},meta=t('js/releaseMeta.js'),config=t('js/config.js'),manifest=t('manifest.webmanifest'),sw=t('sw.js'),pre=t('js/preflight.js'),engine=t('js/dailyProfitBrief32.js'),ui=t('js/dailyProfitBriefUi32.js');
const vm=meta.match(/APP_VERSION='(\d+)\.(\d+)\.(\d+)'/),versionOk=vm&&(Number(vm[1])>32||(Number(vm[1])===32&&Number(vm[2])>=8));assert(versionOk,'release must retain 32.8+ Daily Profit Brief');assert(config.includes('SCHEMA_VERSION = 80'),'schema 80 must remain');assert(manifest.includes('Daily Profit Brief'),'Daily Profit Brief manifest capability missing');
const cache=sw.match(/kamil-os-(\d+)\.(\d+)\.(\d+)-shell-r\d+/),cacheOk=cache&&(Number(cache[1])>32||(Number(cache[1])===32&&Number(cache[2])>=8));assert(cacheOk&&sw.includes('./js/dailyProfitBrief32.js')&&sw.includes('./js/dailyProfitBriefUi32.js'),'32.8+ PWA shell missing');assert(pre.includes("import './dailyProfitBriefUi32.js'"),'32.8+ module not loaded');assert(engine.includes("contract:'READ_ONLY_DAILY_BRIEF'")&&engine.includes('neverMovesMoney:true'),'32.8 read-only safety missing');assert(ui.includes('DAILY PROFIT BRIEF 32.8'),'32.8 user-facing UI missing');
console.log('KAMIL OS 32.8+ STATIC QA PASS');
