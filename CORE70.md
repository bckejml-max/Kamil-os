# Kamil OS Core 70

Core 70 zavádí jednoznačnou aktivní cestu pro hlavní části aplikace. Starší generační soubory mohou v repozitáři zůstat kvůli historii nebo migracím, ale nesmí se vracet do aktivního routingu bez explicitní migrace a smoke testu.

## Kanonické view moduly

- Dnes: `js/personalToday640.js`
- Inbox: `js/personalInbox690.js`
- Peníze / Wealth: `js/personalMoney640.js`
- Vstupenky: `js/ticketPage665.js`
- Rodina: `js/personalFamily640.js`
- Domov: `js/personalHome640.js`
- Dokumenty: `js/personalDocuments640.js`
- Runtime registry: `js/viewRuntime41.js`

## Kanonické služby

- Globální příkazy a hledání: `js/command.js` + `js/personalQuery29.js`
- Ticket cloud a scan orchestrace: `js/ticketCloud660.js`
- Waiting For: `js/personalWaiting650.js`
- Týdenní úklid: `js/personalWeekly700.js`
- Runtime diagnostika: `api/core70-health.js`
- Core UI: `core70.css`

## Pravidla datové důvěry

1. Automaticky získaná hodnota musí mít zdroj nebo jasně označený fallback.
2. Čas poslední kontroly musí být viditelný tam, kde stáří ovlivňuje rozhodnutí.
3. Neúplná data se nesmí prezentovat jako přesné čisté jmění nebo přesná tržní cena.
4. Technická chyba zdroje není obchodní doporučení.
5. Poslední funkční data lze zobrazit, ale musí být označena jako starší.

## Legacy politika

`js/ticketMarketWatch656.js` není součástí Core 70 service-worker shellu a není kanonickým ticketovým runtime modulem. Nové změny Viagogo/ticket scanu patří do `ticketCloud660.js`, API endpointů a `ticketPage665.js`.

Starší generační soubory se nemažou hromadně bez dependency auditu. Nejprve se odstraní z aktivního routingu/cache, poté je CI schopné zachytit regresi a teprve následně lze bezpečně fyzicky mazat.

## Release gate

Workflow `.github/workflows/core70.yml` kontroluje:

- existenci kanonických souborů,
- JavaScript syntaxi,
- aktivní Inbox/Command/Ticket routing,
- zákaz návratu mrtvé `ticket-market-watch-v673` route,
- zákaz legacy `ticketMarketWatch656.js` v aktivním service-worker shellu.
