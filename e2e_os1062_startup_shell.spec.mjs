import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

async function withoutJavaScript(page){
 await page.route(/\.js(?:\?.*)?$/,route=>route.abort());
}

test('OS1062 desktop first frame is dark before application JavaScript runs',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await withoutJavaScript(page);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const first=await page.evaluate(()=>{
  const root=document.documentElement,body=getComputedStyle(document.body),side=getComputedStyle(document.querySelector('.sidebar')),top=getComputedStyle(document.querySelector('.topbar')),cmd=getComputedStyle(document.querySelector('.command-field')),banner=document.querySelector('#updateBanner');
  banner.classList.remove('hidden');const bannerStyle=getComputedStyle(banner);
  return{
   className:root.className,
   dataTheme:root.dataset.theme||null,
   scheme:getComputedStyle(root).colorScheme,
   bodyBg:body.backgroundImage,
   bodyColor:body.color,
   sidebarBg:side.backgroundColor,
   topBg:top.backgroundColor,
   commandBg:cmd.backgroundColor,
   bannerBg:bannerStyle.backgroundColor,
   bannerColor:bannerStyle.color,
   overflow:root.scrollWidth-root.clientWidth
  };
 });
 expect(first.className).toContain('theme-light');
 expect(first.dataTheme).toBeNull();
 expect(first.scheme).toBe('dark');
 expect(first.bodyBg).not.toContain('rgb(245, 247, 250)');
 expect(first.bodyColor).not.toBe('rgb(23, 32, 42)');
 expect(first.sidebarBg).not.toBe('rgb(255, 255, 255)');
 expect(first.topBg).not.toBe('rgba(255, 255, 255, 0.92)');
 expect(first.commandBg).not.toBe('rgb(255, 255, 255)');
 expect(first.bannerBg).not.toBe('rgb(255, 255, 255)');
 expect(first.bannerColor).not.toBe('rgb(17, 24, 39)');
 expect(first.overflow).toBeLessThanOrEqual(2);
});

test('OS1062 mobile first frame already exposes canonical six-item navigation',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await withoutJavaScript(page);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 const mobile=await page.evaluate(()=>{
  const nav=document.querySelector('#bottomNav'),buttons=[...document.querySelectorAll('#bottomNav button')].filter(b=>getComputedStyle(b).display!=='none'),rect=nav.getBoundingClientRect(),style=getComputedStyle(nav);
  return{
   count:buttons.length,
   labels:buttons.map(b=>b.textContent.trim()),
   docsVisible:buttons.some(b=>b.dataset.view==='more'),
   personalMore:buttons.some(b=>b.hasAttribute('data-personal-more')),
   family:buttons.some(b=>b.dataset.view==='family'),
   width:rect.width,left:rect.left,right:innerWidth-rect.right,
   columns:style.gridTemplateColumns,
   radius:parseFloat(style.borderRadius),
   bg:style.backgroundColor,
   overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
  };
 });
 expect(mobile.count).toBe(6);
 for(const label of ['Dnes','Vstupenky','Rodina','Domov','Peníze','Více'])expect(mobile.labels.some(x=>x.includes(label))).toBeTruthy();
 expect(mobile.docsVisible).toBeFalsy();
 expect(mobile.personalMore).toBeTruthy();
 expect(mobile.family).toBeTruthy();
 expect(mobile.width).toBeLessThan(390);
 expect(mobile.left).toBeGreaterThan(0);
 expect(mobile.right).toBeGreaterThan(0);
 expect(mobile.radius).toBeGreaterThanOrEqual(16);
 expect(mobile.bg).not.toBe('rgb(255, 255, 255)');
 expect(mobile.overflow).toBeLessThanOrEqual(2);
});
