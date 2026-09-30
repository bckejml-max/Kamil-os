# Kamil OS 744.0.0

Kamil OS je osobní **Daily Personal Assistant + Ticket Intelligence**. Hlavní uživatelské rozhraní má deset přímo dostupných oblastí: **Dnes / Úkoly / Práce / Vstupenky / Peníze / Reality / Sázení / Rodina / Domov / Dokumenty**.

## Co je hlavní princip

Kamil OS není primárně dashboard. Má říct, **co má smysl udělat teď**, co může počkat a na co se čeká. Dnes proto zůstává decision-first: jedna hlavní akce, maximálně dvě vedlejší a stručný kontext pro zítřek, čekání a dokončené věci.

## Personal Intelligence

- Morning Launch: ranní přehled dne a splatných follow-upů.
- Tomorrow Radar: společný přehled úkolů, administrativy a kalendáře na zítra / 7 dní.
- Night Handoff: po 21:00 klidový režim, náhled zítřka a uzavření dne.
- Personal Data Vault: smlouvy, pojistky a další osobní evidence s auditovatelnými změnami.
- Globální hledání / otázky nad osobními daty.

## Ticket Intelligence

Ticket Intelligence je oddělená privátní vrstva nad ticket inventory a Viagogo market snapshoty. Serverový monitoring běží nezávisle na otevřené aplikaci a ukládá tržní snapshoty pro aktivní pozice.

Barevná logika importované tabulky:

- červená = nenabízím,
- žlutá = nabízím,
- modrá = prodáno, ale nedoručeno,
- bílá = prodáno/doručeno, čekám na peníze,
- zelená = peníze přijaté.

Profit Commander ukazuje nákup, tržní pásmo, vlastní nabídkovou cenu, doporučenou cenu, hrubý potenciál před seller poplatky a ROI. Doporučení jsou **VYSTAVIT / DRŽET / ZLEVNIT / ZDRAŽIT** podle dostupných dat a času do akce.

## Bezpečnostní kontrakt

Kamil OS **automaticky nevystavuje, nepřecenňuje, netransferuje ani neprodává vstupenky**. Market/Ticket Intelligence navrhuje akci, ale změny na tržišti zůstávají explicitní a ruční.

Privátní ticket inventory a snapshoty nejsou publikované do veřejného repozitáře. Supabase data jsou oddělená od veřejného frontend kódu a chráněná přes RLS.

## QA

Aktuální release má statické guardy, core/cloud safety testy a Playwright E2E pro osobní flow i Ticket Intelligence. Legacy market enginy zůstávají kompatibilní a nesmí převzít hlavní osobní Home.


## Runtime 740.0

- Jeden kanonický runtime stylesheet: `os-canonical.css`; devět duplicitních historických runtime CSS vrstev bylo fyzicky odstraněno a zůstává jen Git historie.
- Dnes se při startu nerehydratuje z dvoudenního HTML snapshotu. Startovní shell je neutrální a skutečný obsah kreslí jediný kanonický renderer.
- Rodina má vlastní DOM host `familyView`; už nesdílí historický identifikátor `ticketsView`.
- Mobilní navigace drží všech deset oblastí přímo viditelných v rozložení 5×2.

- Metadata všech 10 hlavních sekcí jsou v jediném `js/viewRegistry.js`; app shell ani view runtime už nedrží vlastní kopie map.
- Aktivní sekce má deep-link přes `?view=` a funguje Back/Forward.
- Pád rendereru vytvoří bezpečný diagnostický záznam, nabídne opakování a zkopírování diagnostiky bez mazání dat.
- Nové očíslované JS/CSS/MJS patch soubory jsou v CI zakázané; stávající legacy názvy jsou zmražené allowlistem.


## Runtime 741.0

- Jeden **Action Truth Engine** skládá priority napříč Úkoly, Prací, Vstupenkami, Penězi, Realitami, Sázením, Rodinou, Domovem a Dokumenty. Dnes už nevytváří vlastní paralelní prioritu.
- Každá doporučená akce má jednotné skóre, deduplikaci a vysvětlení **Proč to vidím?**. Dnes navíc ukazuje Follow-upy, Zítra, co může počkat, datovou jistotu a denní/týdenní review.
- `dataSourceRegistry.js` drží master ID, freshness a konflikty pro klíčové zdroje. Zastaralá nebo konfliktní data se nesmí tvářit jako čerstvá.
- Command bar má kontext podle sekce, historii, oblíbené příkazy, globální hledání napříč OS a umí z výsledku rovnou založit navazující úkol.
- Peníze mají reconciliation, volnou hotovost a úrokovou příležitost z uložených sazeb. Vstupenky mají lifecycle, realizovaný/čekající profit, kapitál a transfer risk. Sázení má koncentraci, settlement audit a historické segmenty. Reality mají lifecycle, compare lock a reverzibilní cleanup. Práce má blocker/closeout kontrolu.
- Dokumenty obsahují 90denní pojistný radar, datovou integritu, 30denní obnovitelný koš a interní repo-debt dashboard.
- CI hlídá architektonický budget, repo-health snapshot, canonical CSS konflikty a OS741 browser/accessibility/layout kontrakty.


## Runtime 743.0

- Backup health ověřuje skutečný export → JSON → import round-trip a porovnává canonical fingerprint; test je součástí povinného structural release gate.
- Vizuální regression pokrývá všech 10 hlavních sekcí na desktopu i mobilu pomocí deterministických screenshot hashů.
- Každá změna canonical layoutu musí projít explicitní aktualizací vizuální baseline; náhodný CSS/layout drift shodí browser QA.


## Runtime 744.0

- Plný `test:release` má na pull requestu jediného vlastníka: canonical browser workflow. Ticket a Control workflow už celý release neopakují.
- Ticket QA a Control QA jsou scoped podle změněných souborů a při nerelevantní změně se nespouštějí.
- Ticket/Control QA už neinstalují Chromium; browser testy vlastní pouze canonical browser workflow.
- Runtime a release guardy jsou řízené jedním manifestem `scripts/qa-suites.mjs` místo obřích ručních příkazů v `package.json`.
- CI budget hlídá duplicitu release suite, concurrency cancellation, affected scopes a existenci všech guard souborů.
- Docs-only změny nespouštějí plný browser ani production source guard.
