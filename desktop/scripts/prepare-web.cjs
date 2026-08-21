const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'../..');
const out=path.resolve(__dirname,'../app');
const dirs=['js','icons','assets'];
const files=['index.html','manifest.webmanifest','sw.js'];
const rootExtensions=new Set(['.css','.png','.svg','.ico']);

function copyDir(src,dst){
  if(!fs.existsSync(src))return;
  fs.mkdirSync(dst,{recursive:true});
  for(const entry of fs.readdirSync(src,{withFileTypes:true})){
    if(entry.name==='node_modules'||entry.name==='.git')continue;
    const from=path.join(src,entry.name),to=path.join(dst,entry.name);
    if(entry.isDirectory())copyDir(from,to);
    else fs.copyFileSync(from,to);
  }
}

fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});

for(const name of files){
  const src=path.join(root,name);
  if(fs.existsSync(src))fs.copyFileSync(src,path.join(out,name));
}
for(const entry of fs.readdirSync(root,{withFileTypes:true})){
  if(!entry.isFile())continue;
  const ext=path.extname(entry.name).toLowerCase();
  if(rootExtensions.has(ext))fs.copyFileSync(path.join(root,entry.name),path.join(out,entry.name));
}
for(const dir of dirs)copyDir(path.join(root,dir),path.join(out,dir));

if(!fs.existsSync(path.join(out,'index.html')))throw new Error('index.html se nepodařilo připravit pro desktop build.');
console.log(`Kamil OS web bundle připraven: ${out}`);
