# Kamil OS 66.0

Kamil OS je osobní **Daily Personal Assistant + Ticket Intelligence**. Hlavní uživatelské rozhraní je soustředěné do šesti oblastí: **Dnes / Rodina / Domov / Peníze / Dokumenty / Více**.

## Co je hlavní princip

Kamil OS není primárně dashboard. Má říct, **co má smysl udělat teď**, co může počkat a na co se čeká. Dnes proto zůstává decision-first: jedna hlavní akce, maximálně dvě vedlejší a stručný kontext pro zítřek, čekání a dokončené věci.

## Personal Intelligence 65.x–66.0

- Morning Launch: ranní přehled dne a splatných follow-upů.
- Tomorrow Radar: společný přehled úkolů, administrativy a kalendáře na zítra / 7 dní.
- Night Handoff: po 21:00 klidový režim, náhled zítřka a uzavření dne.
- Personal Data Vault: smlouvy, pojistky a další osobní evidence s auditovatelnými změnami.
- Globální hledání / otázky nad osobními daty.

## Ticket Intelligence 66.0

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
