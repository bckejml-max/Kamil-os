const base=(process.env.KAMIL_OS_URL||'https://kamil-os-smoke.vercel.app').replace(/\/$/,'');
const attempts=Number(process.env.CANARY_ATTEMPTS||48),delay=Number(process.env.CANARY_DELAY_MS||5000),sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function text(path){const r=await fetch(`${base}/${path}`,{cache:'no-store',headers:{'cache-control':'no-cache'}});if(!r.ok)throw new Error(`${path}: HTTP ${r.status}`);return r.text()}
let meta='';for(let i=0;i<attempts;i++){try{meta=await text('js/releaseMeta.js');if(meta.includes("APP_BUILD='consolidation-repair-50'"))break}catch{}if(i<attempts-1)await sleep(delay)}
if(!meta.includes("APP_BUILD='consolidation-repair-50'"))throw new Error(`Production did not expose consolidation build after ${attempts} checks`);
const [index,runtime,tickets,money,router]=await Promise.all([text('index.html'),text('js/consolidationRuntime.js'),text('js/ticketPage100.js'),text('js/moneyPage100.js'),text('js/commandRouter.js')]);
const need=(ok,msg)=>{if(!ok)throw new Error(`Production canary: ${msg}`)};
need(index.includes('id="view-inbox"')&&index.includes('id="view-betting"'),'canonical static views missing');
need(index.includes('./js/consolidationRuntime.js'),'central runtime missing from live shell');
need(!index.includes('src="./js/bettingBootstrap543.js'),'global betting bootstrap returned');
need(runtime.includes('installStateContracts();installCommandRouter();'),'live runtime contracts missing');
need(tickets.includes('loadTicketAdvancedAnalytics'),'live ticket on-demand gate missing');
need(money.includes('loadMoneyAdvanced100'),'live money on-demand gate missing');
need(router.includes("owner:'central'"),'live central command ownership missing');
console.log(`Production canary PASS · ${base} · consolidation-repair-50`);
