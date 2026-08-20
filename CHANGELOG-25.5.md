# Kamil OS 25.5 — Ticket Learning Engine

## 25.5.0 — History-informed ticket buying
- BUY radar nově používá pouze realizovanou ticketovou historii z Ticket Lessons jako opatrnou sekundární vrstvu rozhodování.
- historie začne ovlivňovat velikost nákupu až od minimálně 4 realizovaných obchodů celkem; kategorie začne měnit automatický BUY až od 3 realizovaných obchodů v dané kategorii.
- slabší kategorie s dostatečným vzorkem může pravidlový BUY zpomalit na REVIEW a doporučit menší první pozici.
- čerstvá živá intelligence zůstává autoritativní pro samotný verdikt; historie ji nesmí přepsat, pouze může doporučit konzervativnější počet kusů.
- doporučená velikost nákupu je odvozena z realizovaného ROI/win-rate a nikdy nevymýšlí tržní cenu ani poptávku.
- přidaný modul `ticketLearning25.js`, samostatný Node test pro malý vzorek / slabou kategorii / live precedence a CI krok v GitHub Actions.
- aplikace, manifest a PWA cache sjednoceny na 25.5.0; schema a existující Supabase/localStorage struktura se nemění.

Bezpečnost: 25.5 nic automaticky nekupuje ani nelistuje. Historie je pouze rozhodovací brzda a sizing doporučení, ne náhrada živého trhu.
