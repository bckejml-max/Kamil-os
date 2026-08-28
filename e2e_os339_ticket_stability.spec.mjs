import {test,expect} from '@playwright/test';
const BASE='http://127.0.0.1:4173';

test('Tickets settle without continuous DOM replacement',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.message||e)));
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  const nav=page.locator('[data-view="tickets"]').first();
  await nav.click();
  const host=page.locator('#ticketIntelView');
  await expect(host).toBeVisible();
  await page.waitForTimeout(1400);
  const result=await page.evaluate(async()=>{
    const host=document.querySelector('#ticketIntelView');
    if(!host)return {missing:true};
    let childMutations=0,htmlChanges=0,last=host.innerHTML;
    const observer=new MutationObserver(records=>{
      childMutations+=records.filter(r=>r.type==='childList').length;
      if(host.innerHTML!==last){htmlChanges++;last=host.innerHTML}
    });
    observer.observe(host,{childList:true,subtree:false});
    await new Promise(r=>setTimeout(r,1800));
    observer.disconnect();
    return {
      missing:false,
      childMutations,
      htmlChanges,
      desk:!!host.querySelector('.td331'),
      legacy:!!host.querySelector('[data-ticket-workspace210],.ticket-page-687,.ticket-workspace210')
    };
  });
  expect(result.missing).toBe(false);
  expect(result.desk).toBe(true);
  expect(result.legacy).toBe(false);
  expect(result.childMutations).toBeLessThanOrEqual(1);
  expect(result.htmlChanges).toBeLessThanOrEqual(1);
  expect(errors.filter(x=>/SyntaxError|Unexpected token/i.test(x))).toEqual([]);
});
