import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const index=read('index.html');
const css=read('os1500.css');
const app=read('js/app.js');
const runtime=read('js/viewRuntime41.js');
const advancedStyles=read('js/productAdvancedStyles.js');
const today=read('js/todayPage2000.js');
const personalQuery=read('js/personalQuery29.js');
const work=read('js/workPage1300.js');
const tickets=read('js/ticketOverview.js');
const ticketPortfolio=read('js/ticketPortfolio32.js');
const money=read('js/moneyOverview.js');
const moneyAdvanced=read('js/personalMoney640.js');
const insurance=read('js/insurance25.js');
const insuranceUi=read('js/insuranceUi25.js');
const vault=read('js/personalVault640.js');
const insuranceMaster=read('js/insuranceMaster1336.js');
const personalAssistant=read('js/personalAssistant650.js');
const property=read('js/propertyPage1300.js');
const propertyHub=read('js/propertyHub620.js');
const betting=read('js/bettingOverview.js');
const family=read('js/familyPage140.js');
const home=read('js/homePage140.js');
const documents=read('js/documentsPage141.js');
const sw=read('sw.js');

assert.match(index,/data-os1500="1"/,'OS1500 shell flag missing');
assert.match(index,/os1400\.css[\s\S]*os1500\.css/,'OS1500 must load after OS1400');
assert.match(runtime,/restoreCanonicalProductStyles/,'runtime must restore the canonical stylesheet stack');
assert.match(advancedStyles,/canonicalOrder=\['\.\/productReset1300\.css','\.\/os1400\.css','\.\/os1500\.css'\]/,'canonical stylesheet order must be explicit');
assert.match(advancedStyles,/export function restoreCanonicalProductStyles/,'advanced style loader must expose canonical restore');
assert.doesNotMatch(runtime,/family:\['\.\/personal64\.css'|home:\['\.\/personal64\.css'|more:\['\.\/personal64\.css'/,'canonical personal views must not load legacy personal CSS');

for(const route of ['inbox','work','tickets','money','property','betting','family','home','more']){
 assert.match(today,new RegExp("route:'"+route+"'"),'Today must expose '+route);
}
assert.match(today,/9 oblastí/,'Today must show all nine product areas');assert.match(today,/os1600-areas/,'Today must render all areas as a compact direct grid');
assert.match(today,/usabilityReset:1500/);
assert.match(today,/activeTickets=tickets\.filter\(x=>!x\.issue/,'Today must exclude disputed tickets from active counts');
assert.match(today,/activeTicketQty=d\.activeTickets\.reduce/,'Today ticket card must display active quantity, not ticket-task or row count');
assert.match(today,/data-today1300-insurance/,'Today insurance priorities must deep-link to Insurance Center');
assert.match(app,/x=>!x\.issue&&\['HOLD','LISTED'\]/,'quick shell must exclude disputed tickets from active count');
assert.match(personalQuery,/!x\.issue&&\['HOLD','LISTED'\]/,'command bar ticket capital must exclude disputed tickets');

assert.match(work,/data-work1300-risk/);
assert.match(work,/data-work1300-project/);
assert.match(work,/Pracovní riziko/);
assert.match(work,/Zakázka/);
const workCenter=read('js/workCommandCenter440.js');
assert.match(workCenter,/CLOSED_EXACT/,'Work must treat explicit handed-over Czech project statuses as closed');
assert.doesNotMatch(work,/data-work1300-today/,'Work risks must not bounce back to Today');

assert.match(tickets,/function primaryAction/,'Ticket primary CTA must be contextual');
assert.match(tickets,/data-ticket-event/,'Ticket events must be directly actionable');
assert.match(tickets,/dynamicPrimary:true/);
assert.match(ticketPortfolio,/!x\?\.issue/,'disputed ticket rows must not inflate active inventory');
assert.match(ticketPortfolio,/sectionLike32/,'ticket event naming must preserve matchup identity while stripping seat/section suffixes');
assert.match(money,/!x\.issue&&\['HOLD','LISTED','OPEN'\]/,'Money must exclude disputed tickets from active asset value');
assert.match(moneyAdvanced,/!x\.issue&&\['HOLD','LISTED'\]/,'advanced Money must exclude disputed tickets from ticket capital');
assert.match(moneyAdvanced,/x\.status\?\.code!=='ARCHIVED'&&x\.recordType!=='insurance'/,'advanced Money recurring list must hide archived recovery insurance');
assert.match(moneyAdvanced,/insurance\.policies\.filter\(x=>x\.lifecycle==='ACTIVE'/,'advanced Money recurring list must source active insurance from Insurance Center');
assert.match(moneyAdvanced,/openInsuranceCenter/,'Money insurance rows must open Insurance Center directly');
assert.match(moneyAdvanced,/x\.cadence==='YEARLY'/,'Money recurring rows must preserve actual insurance payment cadence');
assert.match(insurance,/activeCosts/,'Insurance Center must expose current insurance costs separately');
assert.match(insurance,/upcomingCosts/,'Insurance Center must expose upcoming insurance costs separately');
assert.match(insurance,/startDays<0\?60:startDays<=45\?76:20/,'confirmed upcoming insurance must classify as SOON before start, REVIEW only after a missed start');
assert.match(insurance,/needsAction=lc==='UPCOMING'/,'Insurance Center must distinguish informational upcoming state from actionable issues');
assert.match(insuranceUi,/AKTUÁLNÍ STAV SMLUV/,'Insurance Center lifecycle heading must not overstate review/terminating policies as active');
assert.match(vault,/SUPERSEDED_INSURANCE_RECOVERY_640/,'superseded recovery insurance must be archived once canonical insurance registry exists');
assert.match(insuranceMaster,/kamil-allianz-life/,'canonical insurance registry must include Kamil Allianz life policy');
assert.match(insuranceMaster,/vlasatice-pvzp-home/,'canonical insurance registry must include Vlasatice property insurance recovery');
assert.match(personalAssistant,/insuranceCenter\(s\)/,'personal assistant must read insurance from canonical Insurance Center');

assert.match(property,/data-property-candidate/,'Property shortlist must be clickable');
assert.match(property,/openPropertyDetail620/);
assert.match(propertyHub,/export function openPropertyDetail620/);
assert.match(propertyHub,/filter\(isActivePropertyCandidate472\)/,'Property Hub must exclude explicitly closed candidates from the active shortlist');

assert.match(betting,/data-betting-open-index/,'Open bets must be directly inspectable');
assert.match(betting,/openTickets=open\.reduce/,'Betting must distinguish ticket count from aggregated positions');
assert.match(today,/bettingTickets:d\.bet\.tickets/,'Today must expose betting ticket count separately from positions');
assert.match(betting,/detail:'betting-task'/,'Betting task must retain betting scope');
assert.match(betting,/directRows:true/);

assert.match(family,/data-family-page1500/);
assert.doesNotMatch(family,/data-family-filter/,'Family canonical page must not hide content behind filters');
assert.match(home,/data-home-page1500/);
assert.match(home,/insuranceCenter\(s\)/,'Home must read current property insurance from Insurance Center');
assert.match(home,/openInsuranceCenter/,'Home insurance cards must open Insurance Center directly');
assert.match(home,/homeAmount=x=>x\.source==='insurance'/,'Home insurance cards must preserve actual payment cadence');
assert.match(home,/x\.status\?\.code!=='ARCHIVED'/,'Home must hide archived recovery records from current cards');
assert.doesNotMatch(home,/data-home-filter/,'Home canonical page must not hide content behind filters');
assert.match(documents,/data-documents-page1500/);
assert.match(documents,/insuranceAction=\[\.\.\.\(insurance\.actions\|\|\[\]\)\]/,'Documents top status must use canonical actionable Insurance Center rows');
assert.match(documents,/actionTotal=counts\.action\+insuranceAction\.length/,'Documents action count must combine vault and insurance actions');
assert.doesNotMatch(documents,/data-doc-filter/,'Documents canonical page must not hide content behind filters');

assert.match(app,/betting:'betting-task'/,'shell quick add must support betting');
assert.match(app,/sameHost\?\.dataset\.productAdvanced==='1'/,'clicking the active nav item must exit advanced detail');
assert.match(runtime,/type==='betting-task'/,'runtime capture must preserve betting scope');
assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/,'mobile primary nav must expose all destinations without a hidden menu');
assert.match(css,/grid-template-rows:repeat\(2,minmax\(0,1fr\)\)!important/,'mobile primary nav must keep all ten destinations visible');
assert.match(css,/font-size:8\.8px!important/,'mobile primary nav labels must remain readable');
assert.match(sw,/os1500\.css/,'service worker must precache OS1500');

console.log('OS1500 product usability guard PASS');
