import {test,expect} from '@playwright/test';
import {createHash} from 'node:crypto';
import fs from 'node:fs';

const BASE='http://127.0.0.1:4173';
const VIEWS=['today','inbox','work','tickets','money','property','betting','family','home','more'];
const baseline=JSON.parse(fs.readFileSync('visual-baseline.json','utf8'));
const FIXED=Date.parse('2026-09-30T08:00:00Z');

async function stabilize(page,width,height){
 await page.setViewportSize({width,height});
 await page.addInitScript(fixed=>{
  const RealDate=Date;
  class FrozenDate extends RealDate{
   constructor(...args){super(...(args.length?args:[fixed]))}
   static now(){return fixed}
  }
  FrozenDate.parse=RealDate.parse;FrozenDate.UTC=RealDate.UTC;
  globalThis.Date=FrozenDate;
 },FIXED);
 await page.goto(BASE,{waitUntil:'domcontentloaded'});
 await expect.poll(()=>page.evaluate(()=>window.__KAMIL_BOOT_BUDGET343__?.complete),{timeout:15000}).toBe(true);
 await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important} html{scroll-behavior:auto!important}'});
}
async function viewHash(page,view){
 const nav=page.locator((await page.viewportSize()).width<600?'#bottomNav [data-view="'+view+'"]':'#mainNav [data-view="'+view+'"]');
 await nav.click();
 await expect(page.locator('#view-'+view)).toHaveClass(/on/);
 await expect.poll(()=>page.evaluate(v=>document.querySelector('#view-'+v+' [data-view-ready], #view-'+v+' > div[data-view-ready]')!==null,v).catch(()=>true),{timeout:4000}).toBeTruthy().catch(()=>{});
 await page.evaluate(()=>window.scrollTo(0,0));
 const png=await page.screenshot({fullPage:false,animations:'disabled'});
 return createHash('sha256').update(png).digest('hex');
}

for(const mode of ['desktop','mobile']){
 test('visual baseline · '+mode+' · all ten canonical views',async({page})=>{
  const size=baseline.viewport[mode];await stabilize(page,size.width,size.height);
  const actual={},missing=[],mismatch=[];
  for(const view of VIEWS){
   const hash=await viewHash(page,view);actual[view]=hash;
   const expectedHash=baseline.hashes[mode+'-'+view];
   if(!expectedHash)missing.push(view);else if(expectedHash!==hash)mismatch.push({view,expected:expectedHash,actual:hash});
  }
  console.log('VISUAL_BASELINE '+mode+' '+JSON.stringify(actual));
  expect(missing,'Missing visual baseline entries; update visual-baseline.json from VISUAL_BASELINE logs').toEqual([]);
  expect(mismatch,'Canonical visual regression detected').toEqual([]);
 });
}
