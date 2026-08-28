import {test,expect} from '@playwright/test';

const BASE=process.env.BASE_URL||'http://127.0.0.1:4173';

test('tickets have one render owner and do not blink',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await expect(page.locator('#appView')).toBeVisible({timeout:10000});

  await page.evaluate(()=>document.querySelector('[data-view="tickets"]')?.click());
  const host=page.locator('#ticketIntelView');
  await expect(host).toBeVisible({timeout:10000});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.dataset.ticketDesk331||''),{timeout:10000}).toBe('1');

  await page.waitForTimeout(2200);
  await expect(host).toHaveAttribute('data-ticket-render-owner','ticketDesk331');

  const probe=await page.evaluate(()=>{
    const el=document.querySelector('#ticketIntelView');
    if(!el)return null;
    window.__ticket338Mutations=0;
    window.__ticket338LoadingFlashes=0;
    const observer=new MutationObserver(()=>{
      window.__ticket338Mutations++;
      if(/Načítám Ticket Trading Desk/i.test(el.textContent||''))window.__ticket338LoadingFlashes++;
    });
    observer.observe(el,{childList:true,subtree:true,characterData:true});
    window.__ticket338Observer=observer;
    return {html:el.innerHTML,hasDesk:!!el.querySelector('.td331')};
  });
  expect(probe).not.toBeNull();

  // Covers the 12 s OS333 ticket self-heal interval plus margin.
  await page.waitForTimeout(13000);
  const result=await page.evaluate(()=>{
    window.__ticket338Observer?.disconnect();
    const el=document.querySelector('#ticketIntelView');
    return {
      mutations:Number(window.__ticket338Mutations||0),
      loadingFlashes:Number(window.__ticket338LoadingFlashes||0),
      owner:el?.getAttribute('data-ticket-render-owner')||'',
      hasDesk:!!el?.querySelector('.td331'),
      hasLegacyWorkspace:!!el?.querySelector('[data-ticket-workspace210],.ticket-workspace210')
    };
  });

  expect(result.owner).toBe('ticketDesk331');
  expect(result.hasLegacyWorkspace).toBe(false);
  expect(result.loadingFlashes).toBe(0);
  expect(result.mutations).toBeLessThanOrEqual(2);
  expect(pageErrors.filter(x=>/SyntaxError|Unexpected token|Cannot access .* before initialization/i.test(x))).toEqual([]);
});
