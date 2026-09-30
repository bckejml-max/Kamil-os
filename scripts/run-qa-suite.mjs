import {spawnSync} from 'node:child_process';
import {QA_SUITES} from './qa-suites.mjs';

const name=process.argv[2]||'release',suite=QA_SUITES[name];
if(!suite){console.error('Unknown QA suite: '+name);process.exit(2)}
const npm=process.platform==='win32'?'npm.cmd':'npm';
for(const file of suite.files){
 console.log('\n[qa:'+name+'] '+file);
 const r=spawnSync(process.execPath,[file],{stdio:'inherit'});
 if(r.status!==0)process.exit(r.status||1);
}
if(suite.structural){
 console.log('\n[qa:'+name+'] structural');
 const r=spawnSync(npm,['run','test:structural'],{stdio:'inherit'});
 if(r.status!==0)process.exit(r.status||1);
}
console.log('\n[qa:'+name+'] PASS · '+suite.files.length+' files');
