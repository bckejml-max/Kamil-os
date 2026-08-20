# Kamil OS 31.1 — Decision Journal

## Co je nové
- nový **Decision Journal** ukládá potvrzené rozhodovací snapshoty a umožňuje ručně zapsat aktuální Top
- při `Zkontrolováno` v Decision Delta se bezpečně zapíšou pouze skutečně změněné aktuální rozhodovací body
- Journal si pamatuje akci, prioritu, důvod, `when / buyRule / sellRule`, zdroj a omezený safe observed snapshot
- XTB snapshot může nést P/L %, váhu, hodnotu a měnu; ticket snapshot může nést workflow, dny do akce a známé buy/list/market/floor hodnoty
- `Co jsme doporučili?`, `historie rozhodnutí` a `Decision Journal` fungují přes Command Bar / Copilot
- na Dnes je nový přístup do Decision Journalu s počtem záznamů a změn akce

## Privacy / interpretace
- observed data mají pevný allowlist; neznámá pole se do Journalu nezapíšou
- raw dokumenty, hesla, PIN/CVV, seed/recovery fráze ani jiné tajné hodnoty Journal nepřijímá
- změna P/L nebo ticket workflow je pouze pozorovaný posun, ne tvrzení, že předchozí doporučení bylo správné nebo špatné
- maximálně 250 journal snapshotů; identický snapshot stejné věci se neduplikuje

## Kompatibilita
- schema zůstává **42**: `decisionJournal` je volitelná backward-compatible část state a starší klient ji při round-trip nemaže
- cloud/localStorage klíče a Supabase tabulky beze změny
- Decision Delta baseline zůstává lokální; Journal je naopak součástí běžného state/backup/cloud syncu

## QA
- unit test Decision Journal
- XTB + ticket integration test s pozorovanými metrikami
- privacy allowlist test
- Playwright E2E ověřuje otevření Journalu v reálném browseru
- release gate 31.1

## Release
- verze **31.1.0**
- PWA cache `kamil-os-31.1.0-shell-r1`
- nové moduly: `js/decisionJournal31.js`, `js/decisionJournalUi31.js`
