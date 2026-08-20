import fs from 'fs';
const need=(file,parts)=>{const s=fs.readFileSync(file,'utf8');for(const p of parts)if(!s.includes(p))throw new Error(`${file} missing ${p}`)};
need('js/familyHome25.js',['familyHome','nextAnnualDate','FAMILY_RELATIONS','familyHomeNote','Chybí kontrolní termín']);
need('js/familyHomeUi25.js',['FAMILY & HOME / 25.17','Rodina & domov','familyHome25Tile','kamil:family-home-open']);
need('index.html',['js/familyHomeUi25.js','25.17.0']);
need('sw.js',['js/familyHome25.js','js/familyHomeUi25.js','25.17.0']);
need('manifest.webmanifest',['Kamil OS 25.17']);
console.log('FAMILY HOME STATIC OK');
