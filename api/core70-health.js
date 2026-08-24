export default async function handler(req,res){
 res.setHeader('cache-control','no-store');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
 const viagogo=!!(process.env.VIAGOGO_CLIENT_ID&&process.env.VIAGOGO_CLIENT_SECRET);
 return res.status(200).json({ok:true,version:'70.1-health',checks:{runtime_endpoint:true,viagogo_api:viagogo},note:'Canonical frontend files are verified by Core 70 CI smoke tests; runtime health only reports production-safe checks.'});
}
