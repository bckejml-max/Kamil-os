(function(g){
 const CANONICAL='https://kamil-os-smoke.vercel.app';
 const LOCAL=new Set(['localhost','127.0.0.1','[::1]']);
 const kamilVercelHost=h=>/\.vercel\.app$/i.test(h)&&/^kamil-os-smoke(?:-|\.)/i.test(h);
 function canonicalTarget31(loc){
  if(!loc)return null;
  const protocol=String(loc.protocol||'').toLowerCase(),hostname=String(loc.hostname||'').toLowerCase(),origin=String(loc.origin||'');
  if(protocol==='file:'||LOCAL.has(hostname)||origin===CANONICAL)return null;
  if(!kamilVercelHost(hostname))return null;
  const path=String(loc.pathname||'/')||'/',search=String(loc.search||''),hash=String(loc.hash||'');
  return `${CANONICAL}${path}${search}${hash}`;
 }
 g.KamilCanonical31={CANONICAL,canonicalTarget31};
 try{const target=canonicalTarget31(g.location);if(target&&target!==g.location.href)g.location.replace(target)}catch{}
})(globalThis);
