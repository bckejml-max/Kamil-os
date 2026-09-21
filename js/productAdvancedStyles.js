export async function loadProductAdvancedStyles(hrefs=[]){
 const unique=[...new Set((hrefs||[]).filter(Boolean))];
 await Promise.all(unique.map(href=>new Promise(resolve=>{
  const found=[...document.querySelectorAll('link[rel="stylesheet"]')].find(x=>x.getAttribute('href')===href);
  if(found){resolve(found);return}
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=href;
  link.dataset.productAdvanced='1';
  link.addEventListener('load',()=>resolve(link),{once:true});
  link.addEventListener('error',()=>resolve(link),{once:true});
  document.head.appendChild(link);
 })));
 const product=document.querySelector('link[data-product-reset1300]');
 if(product&&document.head.lastElementChild!==product)document.head.appendChild(product);
 return true;
}
