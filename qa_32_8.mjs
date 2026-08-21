await import('./qa_32_7.mjs');
await import('./daily_profit_brief_32_test.mjs');
await import('./daily_profit_brief_32_static_test.mjs');
import fs from 'node:fs';
const t=f=>fs.readFileSync(f,'utf8'),assert=(x,m)=>{if(!x)throw new Error(m)},meta=t('js/releaseMeta.js'),config=t('js/config.js'),manifest=t('manifest.webmanifest'),sw=t('sw.js'),pre=t('js/preflight.js'),engine=t('js/dailyProfitBrief32.js'),ui=t('js/dailyProfitBriefUi32.js');
assert(meta.includes("APP_VERSION='32.8.0'")&&meta.includes("APP_RELEASE='32.8'"),'32.8 release metadata missing');assert(config.includes('SCHEMA_VERSION = 80'),'schema 80 must remain');assert(manifest.includes('Kamil OS 32.8')&&manifest.includes('Daily Profit Brief'),'32.8 manifest missing');
assert(sw.includes('kamil-os-32.8.0-shell-r1')&&sw.includes('./js/dailyProfitBrief32.js')&&sw.includes('./js/dailyProfitBriefUi32.js'),'32.8 PWA shell missing');assert(pre.includes("import './dailyProfitBriefUi32.js'"),'32.8 module not loaded');assert(engine.includes("contract:'READ_ONLY_DAILY_BRIEF'")&&engine.includes('neverMovesMoney:true'),'32.8 read-only safety missing');assert(ui.includes('DAILY PROFIT BRIEF 32.8'),'32.8 user-facing UI missing');
console.log('KAMIL OS 32.8 STATIC QA PASS');
