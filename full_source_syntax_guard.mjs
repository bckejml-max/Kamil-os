import {readdirSync} from 'node:fs';
import {join,relative} from 'node:path';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const skip=new Set(['node_modules','.git','.vercel','dist','build','coverage','release','tmp','.cache']);
const files=[];
function walk(dir){
  for(const entry of readdirSync(dir,{withFileTypes:true})){
    if(skip.has(entry.name))continue;
    const full=join(dir,entry.name);
    if(entry.isDirectory()){walk(full);continue}
    if(!entry.isFile()||!/[.]m?js$/i.test(entry.name))continue;
    files.push(relative(root,full));
  }
}
walk(root);
files.sort();
const failures=[];
for(const file of files){
  try{execFileSync(process.execPath,['--check',file],{stdio:'pipe'})}
  catch(error){failures.push({file,stderr:String(error?.stderr||error?.message||error)})}
}
if(failures.length){
  for(const item of failures){
    console.error('\nSYNTAX FAIL',item.file);
    console.error(item.stderr.trim());
  }
  throw new Error(`Full source syntax guard failed for ${failures.length} file(s)`);
}
console.log(`Full source syntax guard PASS (${files.length} JS/MJS files)`);
