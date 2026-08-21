const url=process.env.KAMIL_E2E_BASE||'http://127.0.0.1:4173/';
const deadline=Date.now()+15000;
let last='';
while(Date.now()<deadline){
 try{
  const r=await fetch(url,{cache:'no-store'});
  if(r.ok){const text=await r.text();if(/<title>Kamil OS \d+\.\d+<\/title>/.test(text)){console.log(`E2E SERVER READY ${r.status}`);process.exit(0)}}
  last=`HTTP ${r.status}`;
 }catch(e){last=String(e?.message||e)}
 await new Promise(r=>setTimeout(r,200));
}
throw new Error(`E2E server not ready: ${url} (${last})`);
