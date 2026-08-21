import {test,expect} from '@playwright/test';

test('Kamil OS 40 shell, free-text Copilot and decision engines load without page errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(String(e?.message||e)));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.version').first()).toHaveText('40.0.0');
 await expect(page.locator('#todayView')).toBeVisible();
 await expect(page.locator('script[src="./js/focusActionUi35.js"]')).toHaveCount(1);
 await expect(page.locator('script[src="./js/changePulseUi35.js"]')).toHaveCount(1);
 await expect(page.locator('script[src="./js/todayBrainUi34.js"]')).toHaveCount(1);

 const engine=await page.evaluate(async()=>{
   const os=await import('./js/os40.js');
   const dc=await import('./js/decisionCenter36.js');
   const state={financePlan:{cashNow:100000,reserveFloor:50000,plannedInvestment:25000},ticketBook:{items:[]},xtbHub:{},xtbReport:{},xtbStrategy:{overrides:{}},tradeJournal:{trades:[]},tasks:[],projects:[],delegations:[],inbox:[],calendar:{events:[]}};
   const auto=os.autopilot40(state,new Date('2026-08-21T08:00:00Z'));
   const center=dc.decisionCenter36(state,new Date('2026-08-21T08:00:00Z'));
   return {version:auto.version,auto:auto.contract,center:center.contract,exports:['confidenceEngine40','riskEngine40','opportunityCost40','explainDecision40','whatIfSimulator40','guardrails40','universalInbox40','entityGraph40','directorIntelligence40','waitingAnalytics40','earlyWarning40','moneyBrain40','ticketPortfolioManager40','performanceAttribution40','forecastEngine40','morningBrief40','eveningReview40','copilot40','commandCenter40','autopilot40'].every(k=>typeof os[k]==='function')};
 });
 expect(engine.version).toBe('40.0');
 expect(engine.exports).toBe(true);
 expect(engine.auto.autoTrade).toBe(false);
 expect(engine.auto.autoReprice).toBe(false);
 expect(engine.auto.autoSend).toBe(false);
 expect(engine.auto.autoDelete).toBe(false);
 expect(engine.auto.criticalActionsRequireConfirmation).toBe(true);
 expect(engine.center.autoTrade).toBe(false);
 expect(engine.center.autoReprice).toBe(false);

 const input=page.locator('[data-copilot40-input]');
 await expect(input).toBeVisible({timeout:5000});
 await input.fill('Můžu investovat 25k?');
 await input.press('Enter');
 await expect(page.locator('[data-copilot40-answer]')).toContainText('Kamil Copilot:');
 await expect(page.locator('[data-copilot40-answer]')).toContainText('Money Brain');

 expect(errors).toEqual([]);
});

test('Kamil OS 40 PWA cache contains new and 35.1 integrated modules',async({request})=>{
 const sw=await (await request.get('http://127.0.0.1:4173/sw.js')).text();
 expect(sw).toContain("kamil-os-40.0.0-shell-r1");
 for(const asset of ['./js/os40.js','./js/decisionCenter36.js','./js/changePulse35.js','./js/changePulseUi35.js','./js/focusActionUi35.js'])expect(sw).toContain(asset);
});
