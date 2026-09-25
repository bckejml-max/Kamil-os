const canonicalOrder=['./productReset1300.css','./os1400.css','./os1500.css'];
const styleByHref=href=>[...document.querySelectorAll('link[rel="stylesheet"]')].find(x=>{
 const raw=x.getAttribute('href')||'';
 return raw===href||x.href.endsWith(href.replace('./','/'));
})||null;
const promote=href=>{const link=styleByHref(href);if(link&&document.head.lastElementChild!==link)document.head.appendChild(link);return link};

export function restoreCanonicalProductStyles(){
 for(const href of canonicalOrder)promote(href);
 return canonicalOrder.every(styleByHref);
}

export async function loadProductAdvancedStyles(hrefs=[]){
 const unique=[...new Set((hrefs||[]).filter(Boolean))];
 await Promise.all(unique.map(href=>new Promise(resolve=>{
  const found=styleByHref(href);
  if(found){
   document.head.appendChild(found);
   resolve(found);
   return;
  }
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=href;
  link.dataset.productAdvanced='1';
  link.addEventListener('load',()=>resolve(link),{once:true});
  link.addEventListener('error',()=>resolve(link),{once:true});
  document.head.appendChild(link);
 })));
 // Keep the product-level reset above legacy advanced styles while the advanced surface is open.
 promote('./productReset1300.css');
 return true;
}
