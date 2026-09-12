import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {join,relative} from 'node:path';

const ROOT=new URL('./js/',import.meta.url);
async function walk(url){
 const rows=await readdir(url,{withFileTypes:true});
 const out=[];
 for(const row of rows){
  const child=new URL(`${row.name}${row.isDirectory()?'/':''}`,url);
  if(row.isDirectory())out.push(...await walk(child));
  else if(row.isFile()&&row.name.endsWith('.js'))out.push(child);
 }
 return out;
}
const offenders=[];
for(const file of await walk(ROOT)){
 const src=await readFile(file,'utf8');
 const count=(src.match(/\bsetInterval\s*\(/g)||[]).length;
 if(count)offenders.push({file:relative(new URL('.',import.meta.url).pathname,file.pathname),count});
}
assert.equal(offenders.length,0,`OS1107 raw interval regression: ${JSON.stringify(offenders)}`);
console.log('OS1107 zero-interval guard PASS: raw setInterval count is 0 across js/');
