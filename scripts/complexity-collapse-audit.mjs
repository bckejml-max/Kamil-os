import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT=process.cwd();
const SKIP=new Set(['.git','node_modules','test-results','playwright-report','.vercel']);
const TEXT_EXT=new Set(['.html','.js','.mjs','.css','.json','.md','.yml','.yaml','.txt','.toml']);
const rows=[];

function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(SKIP.has(ent.name))continue;
    const abs=path.join(dir,ent.name);
    const rel=path.relative(ROOT,abs).replaceAll('\\','/');
    if(ent.isDirectory())walk(abs);
    else rows.push({path:rel,size:fs.statSync(abs).size});
  }
}
walk(ROOT);

const root=rows.filter(x=>!x.path.includes('/'));
const numberedRuntime=rows.filter(x=>/\d{3,}/.test(path.basename(x.path))&&/\.(?:js|mjs|css)$/.test(x.path));
const rootCss=root.filter(x=>x.path.endsWith('.css'));
const rootMjs=root.filter(x=>x.path.endsWith('.mjs'));
const rootChangelogs=root.filter(x=>/^CHANGELOG.*\.md$/.test(x.path));

const texts=new Map();
for(const row of rows){
  if(!TEXT_EXT.has(path.extname(row.path)))continue;
  try{texts.set(row.path,fs.readFileSync(path.join(ROOT,row.path),'utf8'))}catch{}
}
const referencedElsewhere=file=>{
  const base=path.basename(file);
  for(const [p,content] of texts){
    if(p===file)continue;
    if(content.includes(base)||content.includes('./'+file)||content.includes('/'+file))return true;
  }
  return false;
};
const unreferencedRootCss=rootCss.filter(x=>!referencedElsewhere(x.path)).map(x=>x.path).sort();
const unreferencedRootChangelogs=rootChangelogs.filter(x=>x.path!=='CHANGELOG.md'&&!referencedElsewhere(x.path)).map(x=>x.path).sort();
const rootMjsCanonical=rootMjs.filter(x=>referencedElsewhere(x.path)).map(x=>x.path).sort();
const unreferencedRootMjs=rootMjs.filter(x=>!referencedElsewhere(x.path)).map(x=>x.path).sort();

const report={
  version:'742-audit-2',
  totalFiles:rows.length,
  rootFiles:root.length,
  rootCss:rootCss.length,
  rootMjs:rootMjs.length,
  rootChangelogs:rootChangelogs.length,
  numberedRuntime:numberedRuntime.length,
  unreferencedRootCssCount:unreferencedRootCss.length,
  unreferencedRootChangelogCount:unreferencedRootChangelogs.length,
  referencedRootMjsCount:rootMjsCanonical.length,
  unreferencedRootMjsCount:unreferencedRootMjs.length,
  unreferencedRootCss,
  unreferencedRootChangelogs,
  unreferencedRootMjs
};

const budgets={
  totalFiles:1411,
  rootFiles:663,
  rootCss:137,
  rootMjs:439,
  rootChangelogs:56,
  numberedRuntime:795
};
for(const [key,max] of Object.entries(budgets))assert.ok(report[key]<=max,`OS742 complexity budget exceeded: ${key}=${report[key]} > ${max}`);

console.log('OS742 complexity budget PASS',JSON.stringify({...report,unreferencedRootCss:undefined,unreferencedRootChangelogs:undefined,unreferencedRootMjs:undefined}));
if(unreferencedRootCss.length)console.log('OS742 unreferenced root CSS candidates:',unreferencedRootCss.join(', '));
if(unreferencedRootChangelogs.length)console.log('OS742 unreferenced root changelog candidates:',unreferencedRootChangelogs.join(', '));
if(unreferencedRootMjs.length)console.log('OS742 unreferenced root MJS candidates (first 120):',unreferencedRootMjs.slice(0,120).join(', '));
