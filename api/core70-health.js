import fs from 'node:fs';
import path from 'node:path';

const required=['js/viewRuntime41.js','js/personalToday640.js','js/personalInbox690.js','js/personalMoney640.js','js/ticketPage665.js','js/ticketCloud660.js','js/command.js','core70.css'];
const checkFiles=()=>required.map(file=>({file,ok:fs.existsSync(path.join(process.cwd(),file))}));
export default async function handler(req,res){
 res.setHeader('cache-control','no-store');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
 const files=checkFiles(),missing=files.filter(x=>!x.ok).map(x=>x.file),viagogo=!!(process.env.VIAGOGO_CLIENT_ID&&process.env.VIAGOGO_CLIENT_SECRET);
 let release=null;try{const raw=fs.readFileSync(path.join(process.cwd(),'js/releaseMeta.js'),'utf8');release=raw.match(/APP_VERSION='([^']+)'/)?.[1]||null}catch{}
 return res.status(missing.length?500:200).json({ok:!missing.length,version:'70.0-health',release,checks:{canonical_files:!missing.length,viagogo_api:viagogo},missing,files:files.filter(x=>!x.ok)});
}
