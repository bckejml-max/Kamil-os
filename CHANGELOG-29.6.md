# Kamil OS 29.6 — True Net Worth

## Nové
- nový True Net Worth ledger v Penězích
- automatické zdroje: hotovost, XTB účty, pohledávky, aktivní ticket inventory a čekající payout s reálně uloženým sell
- ruční majetek a závazky: nemovitost, auto, další účet, investice, hypotéka, úvěr, kreditka a další položky
- čisté jmění, majetek, závazky, likvidní a nelikvidní část zvlášť pro každou měnu
- volitelný společný součet do základní měny pouze tehdy, když je dostupný skutečný FX kurz
- explicitní denní snapshot historie; otevření aplikace samo historii nemění
- změna proti poslednímu staršímu snapshotu a připravený YTD základ

## Ochrany
- žádný automatický odhad ceny domu nebo auta
- ticket inventory je oceněný pořizovací cenou, ne vymyšlenou budoucí prodejní cenou
- payout bez skutečně uložené prodejní částky se do majetku nezapočítá
- různé měny se bez skutečného FX nesčítají
- ruční ocenění starší než 90 dní se označí jako datová mezera
- pokud nejsou evidované žádné závazky, Kamil OS na možné nadhodnocení čistého jmění upozorní

## Data / bezpečnost
- schema 42: `netWorthBook.items`, `netWorthBook.history`
- nové kolekce jsou součástí běžného Backup Guardu, preflightu a cloud conflict summary
- stávající Supabase tabulky i localStorage klíče zůstávají beze změny
- doménový Net Worth engine nemá DOM/browser závislost a je připravený pro pozdější Capacitor mobilní shell
