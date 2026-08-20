import fs from 'node:fs';
const need=(file,text)=>{const s=fs.readFileSync(file,'utf8');if(!s.includes(text))throw new Error(`${file} missing ${text}`)};
for(const f of ['js/personalAdmin25.js','js/personalAdminUi25.js','personal_admin_test.mjs'])if(!fs.existsSync(f))throw new Error('Missing '+f);
need('index.html','js/personalAdminUi25.js');need('index.html','25.13.0');need('js/config.js',"APP_VERSION = '25.13.0'");need('manifest.webmanifest','Kamil OS 25.13');need('sw.js','kamil-os-25.13.0');need('sw.js','personalAdmin25.js');need('sw.js','personalAdminUi25.js');
const core=fs.readFileSync('js/personalAdmin25.js','utf8');for(const x of ['PERSONAL_CATEGORIES','INSURANCE','UTILITY','DOCUMENT','personalAdmin','costsByCurrency','Nic neplatí'])if(!core.includes(x))throw new Error('Personal Admin core missing '+x);
const ui=fs.readFileSync('js/personalAdminUi25.js','utf8');for(const x of ['PERSONAL ADMIN / 25.13','Osobní administrace','AUTOPAY','Měny se nikdy nesčítají dohromady','data-personal-edit'])if(!ui.includes(x))throw new Error('Personal Admin UI missing '+x);
console.log('PERSONAL ADMIN STATIC OK');
