import {test, expect} from '@playwright/test';
import {mkdir, writeFile} from 'node:fs/promises';

const BASE = process.env.KAMIL_AUDIT_URL || 'https://kamil-os-smoke.vercel.app/';
const OUT = 'visual-audit-output';
const VIEWS = ['today','tickets','family','home','money','more'];
const DEVICES = [
  {name:'desktop-1440x900', width:1440, height:900, mobile:false},
  {name:'desktop-1280x800', width:1280, height:800, mobile:false},
  {name:'mobile-390x844', width:390, height:844, mobile:true},
  {name:'mobile-430x932', width:430, height:932, mobile:true},
];

function slug(s){return String(s).replace(/[^a-z0-9_-]+/gi,'-').toLowerCase()}

async function settle(page, ms=1100){
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(ms);
}

async function screenshot(page, name){
  await page.screenshot({path:`${OUT}/${slug(name)}.png`, fullPage:false, animations:'disabled'});
}

async function goView(page, view){
  const selector = `button[data-view="${view}"]:visible`;
  const btn = page.locator(selector).first();
  if(await btn.count()){
    await btn.click({force:true});
  } else {
    await page.evaluate(v=>{
      window.dispatchEvent(new CustomEvent('kamil:navigate',{detail:{view:v}}));
    }, view);
  }
  await page.waitForTimeout(850);
}

async function resetScroll(page){
  await page.evaluate(()=>{
    try{document.scrollingElement?.scrollTo(0,0)}catch{}
    for(const el of document.querySelectorAll('main,.workspace,.view.on')){try{el.scrollTo?.(0,0)}catch{}}
  });
  await page.waitForTimeout(150);
}

async function scrollBottom(page){
  await page.evaluate(()=>{
    const main=document.querySelector('main');
    if(main && main.scrollHeight>main.clientHeight+40) main.scrollTop=main.scrollHeight;
    const se=document.scrollingElement;
    if(se && se.scrollHeight>se.clientHeight+40) se.scrollTop=se.scrollHeight;
  });
  await page.waitForTimeout(250);
}

async function measure(page, device, view){
  return page.evaluate(({device,view})=>{
    const css = el => el ? getComputedStyle(el) : null;
    const rect = el => {
      if(!el) return null;
      const r=el.getBoundingClientRect();
      return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),width:+r.width.toFixed(1),height:+r.height.toFixed(1),right:+r.right.toFixed(1),bottom:+r.bottom.toFixed(1)};
    };
    const visible = el => {
      if(!(el instanceof Element)) return false;
      const s=getComputedStyle(el), r=el.getBoundingClientRect();
      return s.display!=='none' && s.visibility!=='hidden' && +s.opacity!==0 && r.width>0 && r.height>0;
    };
    const label = el => {
      const txt=(el.getAttribute?.('aria-label')||el.textContent||'').replace(/\s+/g,' ').trim();
      return `${el.tagName.toLowerCase()}${el.id?'#'+el.id:''}${el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\s+/).slice(0,3).join('.'):''}${txt?' :: '+txt.slice(0,90):''}`;
    };
    const viewportW=innerWidth, viewportH=innerHeight;
    const all=[...document.querySelectorAll('body *')].filter(visible);
    const overflow=all.map(el=>({el,r:el.getBoundingClientRect()})).filter(x=>x.r.left < -2 || x.r.right > viewportW+2).slice(0,40).map(x=>({label:label(x.el),rect:rect(x.el)}));
    const interactives=all.filter(el=>el.matches('button,a,input,select,textarea,[role="button"],[tabindex]'));
    const smallTargets=interactives.map(el=>({el,r:el.getBoundingClientRect()})).filter(x=>x.r.width<44 || x.r.height<44).slice(0,40).map(x=>({label:label(x.el),rect:rect(x.el)}));
    const tinyText=all.map(el=>({el,s:css(el),r:el.getBoundingClientRect()})).filter(x=>{
      const t=(x.el.textContent||'').trim();
      const fs=parseFloat(x.s.fontSize||'0');
      return t && fs>0 && fs<12 && x.r.width>3 && x.r.height>3;
    }).slice(0,40).map(x=>({label:label(x.el),fontSize:x.s.fontSize,color:x.s.color,rect:rect(x.el)}));
    const active=document.querySelector('.view.on');
    const bottom=document.querySelector('#bottomNav');
    const main=document.querySelector('main');
    const sidebar=document.querySelector('.sidebar');
    const workspace=document.querySelector('.workspace');
    const command=document.querySelector('.command-wrap');
    const navVisible=[...document.querySelectorAll('#bottomNav button,#mainNav button')].filter(visible).map(el=>({label:(el.textContent||'').replace(/\s+/g,' ').trim(),rect:rect(el)}));
    const cardEls=active?[...active.querySelectorAll('.card,[class*="card"],[class*="panel"],[class*="tile"],article')].filter(visible):[];
    const headings=active?[...active.querySelectorAll('h1,h2,h3,h4')].filter(visible).map(el=>({text:(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,120),tag:el.tagName,fontSize:css(el).fontSize,fontWeight:css(el).fontWeight,rect:rect(el)})):[];
    const buttons=active?[...active.querySelectorAll('button,a,[role="button"]')].filter(visible):[];
    return {
      device, view,
      url:location.href,
      title:document.title,
      viewport:{width:viewportW,height:viewportH,dpr:devicePixelRatio},
      document:{clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,clientHeight:document.documentElement.clientHeight,scrollHeight:document.documentElement.scrollHeight},
      body:{clientWidth:document.body.clientWidth,scrollWidth:document.body.scrollWidth,clientHeight:document.body.clientHeight,scrollHeight:document.body.scrollHeight},
      main:{rect:rect(main),clientWidth:main?.clientWidth||0,scrollWidth:main?.scrollWidth||0,clientHeight:main?.clientHeight||0,scrollHeight:main?.scrollHeight||0,overflowY:css(main)?.overflowY||null},
      shell:{sidebar:rect(sidebar),workspace:rect(workspace),command:rect(command),bottomNav:rect(bottom),activeView:rect(active)},
      navVisible,
      counts:{visibleElements:all.length,interactive:interactives.length,cards:cardEls.length,headings:headings.length,buttons:buttons.length,horizontalOverflow:overflow.length,smallTargets:smallTargets.length,tinyText:tinyText.length},
      overflow,
      smallTargets,
      tinyText,
      headings,
      activeText:(active?.innerText||'').replace(/\n{3,}/g,'\n\n').trim().slice(0,6000),
    };
  }, {device,view});
}

test('total visual audit captures all main OS surfaces', async ({browser})=>{
  test.setTimeout(240000);
  await mkdir(OUT,{recursive:true});
  const report={base:BASE,createdAt:new Date().toISOString(),captures:[],special:[]};

  for(const device of DEVICES){
    const context=await browser.newContext({viewport:{width:device.width,height:device.height},deviceScaleFactor:1,isMobile:false,hasTouch:device.mobile});
    const page=await context.newPage();
    const consoleErrors=[];
    page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text())});
    page.on('pageerror',err=>consoleErrors.push(`PAGEERROR: ${err.message}`));
    await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
    await expect(page.locator('#appView')).toBeVisible({timeout:15000});
    await settle(page,1900);

    for(const view of VIEWS){
      await goView(page,view);
      await resetScroll(page);
      const topName=`${device.name}-${view}-top`;
      await screenshot(page,topName);
      const metrics=await measure(page,device,view);
      metrics.consoleErrors=[...consoleErrors];
      report.captures.push(metrics);

      const needsBottom=await page.evaluate(()=>{
        const main=document.querySelector('main'), se=document.scrollingElement;
        return !!((main&&main.scrollHeight>main.clientHeight+80)||(se&&se.scrollHeight>se.clientHeight+80));
      });
      if(needsBottom){
        await scrollBottom(page);
        await screenshot(page,`${device.name}-${view}-bottom`);
        await resetScroll(page);
      }
    }

    // Quick-add modal / overlay.
    await goView(page,'today');
    await resetScroll(page);
    const quick=page.locator('#quickAddBtn:visible');
    if(await quick.count()){
      await quick.click({force:true});
      await page.waitForTimeout(500);
      await screenshot(page,`${device.name}-quick-add-modal`);
      report.special.push({device:device.name,name:'quick-add-modal',text:(await page.locator('body').innerText()).slice(0,5000)});
      await page.keyboard.press('Escape').catch(()=>{});
      await page.waitForTimeout(250);
    }

    // Command surface with a benign query.
    const input=page.locator('#commandInput:visible');
    if(await input.count()){
      await input.fill('Allianz');
      const go=page.locator('#commandGo:visible');
      if(await go.count()) await go.click({force:true});
      await page.waitForTimeout(800);
      await screenshot(page,`${device.name}-command-results`);
      report.special.push({device:device.name,name:'command-results',text:(await page.locator('body').innerText()).slice(0,5000)});
    }

    // Advanced / personal More surface if present.
    const personalMore=page.locator('[data-personal-more]:visible').first();
    if(await personalMore.count()){
      await personalMore.click({force:true});
      await page.waitForTimeout(700);
      await screenshot(page,`${device.name}-personal-more`);
      report.special.push({device:device.name,name:'personal-more',text:(await page.locator('body').innerText()).slice(0,5000)});
    }

    report.special.push({device:device.name,name:'console-errors',errors:consoleErrors});
    await context.close();
  }

  await writeFile(`${OUT}/audit.json`,JSON.stringify(report,null,2));
});
