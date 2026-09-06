import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const fail=m=>{console.error(`OS738 guard: ${m}`);process.exitCode=1};
const read=p=>fs.readFileSync(p,'utf8');
execFileSync(process.execPath,['--check','js/dataTruthAudit738.js'],{stdio:'pipe'});
const mod=read('js/dataTruthAudit738.js'),more=read('js/personalMore640.js');
for(const token of ['buildDataTruthAudit738','openDataTruthAudit738','LIVE CLOUD','LOCAL FALLBACK','propertyBook?.candidates','loadTicketCloud660','ticketIncomplete','score'])if(!mod.includes(token))fail(`audit missing ${token}`);
for(const token of ['Data Truth Audit','dataTruthAudit738.js','openDataTruthAudit738'])if(!more.includes(token))fail(`More wiring missing ${token}`);
if(!process.exitCode)console.log('OS738 data truth audit guard OK');
