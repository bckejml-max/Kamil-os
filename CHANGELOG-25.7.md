# Kamil OS 25.7 — Capital Allocation

## Co je nové
- Nový Capital Allocation engine propojuje Cashflow 90 dní, XTB Portfolio Audit a Ticket Sell Cockpit.
- Počítá bezpečně nasaditelný nový kapitál z nižšího z dnešního a 90denního headroomu nad rezervním minimem.
- Už naplánovaná investice se odečítá dřív, než vznikne nový volný kapitál.
- XTB dostane návrh jen při použitelném a nezastaralém importu a pokud portfolio skutečně potřebuje rebalancing.
- Ticket rozpočet vznikne pouze při čerstvém live BUY signálu a bez urgentní neprodané zásoby; navíc je omezen 15% bezpečnostním limitem nového kapitálu.
- Pokud není dostatečně čerstvý nebo silný důvod, peníze zůstávají v hotovosti.

## Bezpečnost
- Capital Allocation nic neposílá, neprovádí XTB obchody a nenakupuje vstupenky.
- Nevymýšlí budoucí cashflow, ceny ani tržní fakta.
- U každého bucketu zobrazuje původ rozhodnutí: uložený plán, XTB import, čerstvá live ticket intelligence nebo pravidlový fallback.
- Supabase URL, publishable key, tabulky, schema version i legacy localStorage klíče zůstávají beze změny.

## QA
- Nový `capital_allocation_test.mjs` ověřuje 90denní rezervní ochranu, odečtení plánované investice, blokaci zastaralého XTB importu, live-only ticket budget a blokaci nových ticket nákupů při urgentní zásobě.
- Statický QA nově hlídá Cashflow 90 i Capital Allocation moduly, shell a PWA cache.
- Verze aplikace a PWA cache: 25.7.0.
