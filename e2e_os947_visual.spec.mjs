import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

const rgb=n=>String(n||'');

test('OS947 desktop shell uses unified premium visual system',async({page})=>{
 await page.setViewportSize({width:1440,height:960});
 const errors=[];page.on('pageerror',e=>errors.push(String(e?.message||e)));
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:10000});
 await page.waitForFunction(()=>document.documentElement.classList.contains('theme-dark')&&getComputedStyle(document.querySelector('.sidebar')).position==='sticky');
 const shell=await page.evaluate(()=>{
  const style=s=>getComputedStyle(document.querySelector(s));
  const side=style('.sidebar'),cmd=style('.command-field'),active=style('#mainNav button.on');
  return{sidebarWidth:document.querySelector('.sidebar')?.getBoundingClientRect().width||0,sidebarBg:side.backgroundImage,sidebarBorder:side.borderRightColor,commandRadius:parseFloat(cmd.borderRadius),commandHeight:document.querySelector('.command-field')?.getBoundingClientRect().height||0,activeBg:active.backgroundImage,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
 });
 expect(shell.sidebarWidth).toBeGreaterThan(220);
 expect(shell.sidebarWidth).toBeLessThan(280);
 expect(shell.sidebarBg).toContain('linear-gradient');
 expect(rgb(shell.sidebarBorder)).not.toBe('rgba(0, 0, 0, 0)');
 expect(shell.commandRadius).toBeGreaterThanOrEqual(14);
 expect(shell.commandHeight).toBeGreaterThanOrEqual(44);
 expect(shell.activeBg).toContain('linear-gradient');
 expect(shell.overflow).toBeLessThanOrEqual(2);
 await page.waitForFunction(()=>!!window.__KAMIL_UX_FOUNDATION238__?.openQuickAdd,{timeout:10000});
 await page.locator('#quickAddBtn').click();
 await expect(page.locator('.ux238-addmenu')).toBeVisible({timeout:4000});
 const add=await page.locator('.ux238-add-card').evaluate(el=>({radius:parseFloat(getComputedStyle(el).borderRadius),bg:getComputedStyle(el).backgroundImage,width:el.getBoundingClientRect().width}));
 expect(add.radius).toBeGreaterThanOrEqual(18);
 expect(add.bg).toContain('linear-gradient');
 expect(add.width).toBeGreaterThan(400);
 expect(errors.filter(x=>/SyntaxError|Unexpected token|Cannot access .* before initialization/i.test(x))).toEqual([]);
});

test('OS947 mobile shell has stable six-item navigation and no overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:10000});
 await page.waitForFunction(()=>window.__KAMIL_MOBILE_NAV238__?.mobile===true);
 await page.waitForFunction(()=>{
  const nav=document.querySelector('#bottomNav');if(!nav)return false;
  const buttons=[...nav.querySelectorAll('button')].filter(b=>getComputedStyle(b).display!=='none');
  return buttons.length===6&&buttons.some(b=>b.hasAttribute('data-personal-more'))&&!buttons.some(b=>b.dataset.view==='more');
 },{timeout:10000});
 const mobile=await page.evaluate(()=>{
  const nav=document.querySelector('#bottomNav'),buttons=[...nav.querySelectorAll('button')].filter(b=>getComputedStyle(b).display!=='none');
  const labels=buttons.map(b=>b.textContent.trim());const s=getComputedStyle(nav);
  return{count:buttons.length,labels,width:nav.getBoundingClientRect().width,left:nav.getBoundingClientRect().left,radius:parseFloat(s.borderRadius),columns:s.gridTemplateColumns,sidebar:getComputedStyle(document.querySelector('.sidebar')).display,scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,docsVisible:buttons.some(b=>b.dataset.view==='more'),personalMore:buttons.some(b=>b.hasAttribute('data-personal-more'))};
 });
 expect(mobile.count).toBe(6);
 for(const label of ['Dnes','Vstupenky','Rodina','Domov','Peníze','Více'])expect(mobile.labels.some(x=>x.includes(label))).toBeTruthy();
 expect(mobile.docsVisible).toBeFalsy();
 expect(mobile.personalMore).toBeTruthy();
 expect(mobile.sidebar).toBe('none');
 expect(mobile.radius).toBeGreaterThanOrEqual(16);
 expect(mobile.left).toBeGreaterThan(0);
 expect(mobile.width).toBeLessThan(390);
 expect(mobile.scroll).toBeLessThanOrEqual(mobile.client+2);
});

test('OS947 cards and modal remain coherent after app modules settle',async({page})=>{
 await page.setViewportSize({width:1280,height:900});
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect(page.locator('#appView')).toBeVisible({timeout:10000});
 await page.waitForTimeout(1800);
 const card=page.locator('.card').first();
 if(await card.count()){
  const c=await card.evaluate(el=>({radius:parseFloat(getComputedStyle(el).borderRadius),border:getComputedStyle(el).borderTopColor,bg:getComputedStyle(el).backgroundImage}));
  expect(c.radius).toBeGreaterThanOrEqual(16);expect(c.bg).toContain('linear-gradient');expect(c.border).not.toBe('rgba(0, 0, 0, 0)');
 }
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('kamil:open-life-operator')));
 await page.waitForTimeout(300);
 const modal=page.locator('.modal-box').first();
 if(await modal.count()){
  const m=await modal.evaluate(el=>({radius:parseFloat(getComputedStyle(el).borderRadius),maxHeight:getComputedStyle(el).maxHeight,bg:getComputedStyle(el).backgroundImage}));
  expect(m.radius).toBeGreaterThanOrEqual(18);expect(m.bg).toContain('linear-gradient');expect(m.maxHeight).not.toBe('none');
 }
});
