const {app,BrowserWindow,shell}=require('electron');
const http=require('http');
const fs=require('fs');
const path=require('path');

const HOST='127.0.0.1';
const PORT=47823;
const WEB_ROOT=path.join(__dirname,'app');
let server=null;
let mainWindow=null;

const MIME={
  '.html':'text/html; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.webmanifest':'application/manifest+json; charset=utf-8',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.svg':'image/svg+xml',
  '.ico':'image/x-icon',
  '.woff':'font/woff',
  '.woff2':'font/woff2'
};

function safeFile(urlPath){
  let rel='index.html';
  try{
    const pathname=decodeURIComponent(new URL(urlPath,`http://${HOST}:${PORT}`).pathname||'/');
    rel=pathname==='/'?'index.html':pathname.replace(/^\/+/, '');
  }catch{}
  const normalized=path.normalize(rel).replace(/^(\.\.[/\\])+/, '');
  const file=path.join(WEB_ROOT,normalized);
  if(!file.startsWith(WEB_ROOT))return null;
  return file;
}

function headersFor(file){
  const ext=path.extname(file).toLowerCase();
  const base={
    'Content-Type':MIME[ext]||'application/octet-stream',
    'X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'strict-origin-when-cross-origin',
    'Cross-Origin-Opener-Policy':'same-origin',
    'Content-Security-Policy':"default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net; connect-src 'self' https://tswqfbkmxywxxczsoddr.supabase.co https://cdn.jsdelivr.net; worker-src 'self' blob: https://cdn.jsdelivr.net; font-src 'self' data:"
  };
  if(path.basename(file)==='index.html'||path.basename(file)==='sw.js'||ext==='.webmanifest')base['Cache-Control']='no-cache';
  else base['Cache-Control']='public, max-age=3600';
  if(path.basename(file)==='sw.js')base['Service-Worker-Allowed']='/';
  return base;
}

function startServer(){
  return new Promise((resolve,reject)=>{
    server=http.createServer((req,res)=>{
      if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return}
      let file=safeFile(req.url||'/');
      if(!file){res.writeHead(403);res.end('Forbidden');return}
      try{if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html')}catch{}
      fs.readFile(file,(err,data)=>{
        if(err){res.writeHead(err.code==='ENOENT'?404:500,{'Content-Type':'text/plain; charset=utf-8'});res.end(err.code==='ENOENT'?'Not found':'Server error');return}
        res.writeHead(200,headersFor(file));
        if(req.method==='HEAD')res.end();else res.end(data);
      });
    });
    server.once('error',reject);
    server.listen(PORT,HOST,()=>resolve(`http://${HOST}:${PORT}/`));
  });
}

function createWindow(url){
  mainWindow=new BrowserWindow({
    width:1440,
    height:960,
    minWidth:980,
    minHeight:700,
    show:false,
    backgroundColor:'#f5f7fa',
    title:'Kamil OS',
    autoHideMenuBar:true,
    webPreferences:{
      contextIsolation:true,
      nodeIntegration:false,
      sandbox:true,
      spellcheck:false
    }
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.once('ready-to-show',()=>mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({url:target})=>{
    if(target.startsWith(url))return {action:'allow'};
    shell.openExternal(target).catch(()=>{});
    return {action:'deny'};
  });
  mainWindow.webContents.on('will-navigate',(event,target)=>{
    if(target.startsWith(url))return;
    event.preventDefault();
    shell.openExternal(target).catch(()=>{});
  });
  mainWindow.loadURL(url);
}

const gotLock=app.requestSingleInstanceLock();
if(!gotLock){app.quit()}else{
  app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.focus()}});
  app.whenReady().then(async()=>{
    try{const url=await startServer();createWindow(url)}catch(error){console.error('Kamil OS local server failed',error);app.quit()}
  });
  app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow(`http://${HOST}:${PORT}/`)});
  app.on('before-quit',()=>{try{server?.close()}catch{}});
}
