import fs from 'node:fs';
const fail=message=>{console.error(`OS467 guard: ${message}`);process.exitCode=1};
const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const boot=read('./js/instantShell64.js'),mod=read('./js/commandCenter467.js'),css=read('./commandCenter467.css');
for(const token of ["'./commandCenter467.js','installCommandCenter467'",'optionalImport'])if(!boot.includes(token))fail(`boot missing ${token}`);
for(const token of ['__KAMIL_COMMAND_CENTER467__','data-command-center467','buildFinanceCommand258','dueFollowups','waitingPeople','markContact','openPerson'])if(!mod.includes(token))fail(`module missing ${token}`);
for(const token of ['.os467-grid','@media(max-width:760px)','@media(max-width:420px)'])if(!css.includes(token))fail(`responsive CSS missing ${token}`);
if(!process.exitCode)console.log('OS467 command center guard OK');
