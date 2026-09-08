import {test, expect} from '@playwright/test';
import {mkdir, writeFile} from 'node:fs/promises';

const BASE=process.env.KAMIL_AUDIT_URL||'https://kamil-os-smoke.vercel.app/';
const OUT='visual-audit-output';
const DEVICES=[
  {name:'desktop-1440x900',width:1440,height:900,mobile:false},
  {name:'desktop-1280x800',width:1280,height:800,mobile:false},
  {name:'mobile-390x844',width:390,height:844,mobile:true},
  {name:'mobile-430x932',width:430,height:932,mobile:true},
];
function slug(s){return String(s).replace(/[^a-z0-9_-]+/gi,'-').toLowerCase()}
async function shot(page,name){await page.screenshot({path:`${OUT}/${slug(name)}.png`,fullPage:false,animations:'disabled'})}
async function reset(page){await page.evaluate(()=>{document.scrollingElement?.scrollTo(0,0);for(const e of document.querySelectorAll('main,.workspace,.view.on'))e.scrollTo?.(0,0)});await page.waitForTimeout(150)}
async function navByLabel(page,label){
  const btn=page.locator('#mainNav button:visible,#bottomNav button:visible').filter({hasText:label}).first();
  if(await btn.count()){await btn.click({force:true});await page.waitForTimeout(1200);return true}
  return false;
}
async function navData(page,view){
  const btn=page.locator(`button[data-view="${view}"]:visible`).first();
  if(await btn.count()){await btn.click({force:true});await page.waitForTimeout(1200);return true}
  return false;
}
async function snapshot(page,name){
  return page.evaluate(name=>{
    const active=document.querySelector('.view.on');
    const visible=el=>{if(!(el instanceof Element))return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity!==0&&r.width>0&&r.height>0};
    const nav=[...document.querySelectorAll('#mainNav button,#bottomNav button')].filter(visible).map(el=>({text:(el.textContent||'').replace(/\s+/g,' ').trim(),dataView:el.getAttribute('data-view'),personalMore:el.hasAttribute('data-personal-more'),class:el.className}));
    const r=active?.getBoundingClientRect();
    return {name,pageTitle:document.querySelector('#pageTitle')?.textContent?.trim()||'',activeId:active?.id||'',activeClass:active?.className||'',activeRect:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null,activeText:(active?.innerText||'').replace(/\n{3,}/g,'\n\n').slice(0,7000),nav,document:{clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth},body:{clientWidth:document.body.clientWidth,scrollWidth:document.body.scrollWidth}};
  },name);
}

test('extra visual surfaces and delayed modules',async({browser})=>{
  test.setTimeout(240000);
  await mkdir(OUT,{recursive:true});
  const report={createdAt:new Date().toISOString(),captures:[]};
  for(const d of DEVICES){
    const ctx=await browser.newContext({viewport:{width:d.width,height:d.height},deviceScaleFactor:1,hasTouch:d.mobile});
    const page=await ctx.newPage();
    const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
    await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
    await expect(page.locator('#appView')).toBeVisible({timeout:15000});
    await page.waitForTimeout(2200);

    if(!d.mobile){
      for(const label of ['Inbox','Sázení']){
        if(await navByLabel(page,label)){
          await reset(page);await page.waitForTimeout(1200);await shot(page,`${d.name}-${label}-top`);const s=await snapshot(page,label);s.device=d.name;s.errors=[...errors];report.captures.push(s);
        }
      }
    }

    if(await navData(page,'tickets')){
      await page.waitForTimeout(6000);await reset(page);await shot(page,`${d.name}-tickets-settled`);const s=await snapshot(page,'tickets-settled');s.device=d.name;s.errors=[...errors];report.captures.push(s);
    }

    await navData(page,'today');await reset(page);
    const input=page.locator('#commandInput:visible');
    if(await input.count()){
      await input.fill('Allianz');
      const go=page.locator('#commandGo:visible');
      if(await go.count())await go.click({force:true});else await input.press('Enter');
      await page.waitForTimeout(1000);await shot(page,`${d.name}-command-results-enter`);const s=await snapshot(page,'command-results-enter');s.device=d.name;s.errors=[...errors];report.captures.push(s);
      await page.keyboard.press('Escape').catch(()=>{});
    }

    // Open health / operations surface from the visible health control.
    const health=page.locator('button:visible').filter({hasText:/94|health/i}).first();
    if(await health.count()){
      await health.click({force:true});await page.waitForTimeout(700);await shot(page,`${d.name}-health-operations`);const s=await snapshot(page,'health-operations');s.device=d.name;s.errors=[...errors];report.captures.push(s);await page.keyboard.press('Escape').catch(()=>{});
    }

    await ctx.close();
  }
  await writeFile(`${OUT}/audit-extras.json`,JSON.stringify(report,null,2));
});
