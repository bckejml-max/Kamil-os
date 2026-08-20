# Kamil OS 25.5 — Ticket Learning Engine

## Co je nové
- BUY radar nově používá realizovanou historii z Ticket Lessons jako doplňkový risk filtr.
- Historie začne měnit rozhodnutí až od minimálně 4 realizovaných obchodů celkem.
- Kategorie začne ovlivňovat BUY až od minimálně 3 realizovaných obchodů ve stejné kategorii.
- Slabá kategorie může automatický BUY změnit na REVIEW, ale ne na tvrdé SKIP.
- Learning Engine doporučuje maximální velikost prvního nákupu podle dosavadní historie.
- Čerstvá live intelligence zůstává autoritou pro akci; historie jí může pouze omezit velikost pozice.

## Bezpečnost rozhodování
- 1–2 staré obchody nikdy nemění BUY verdikt.
- Neprodané vstupenky se do learningu nepoužívají — zdrojem jsou výhradně realizované obchody z Ticket Lessons.
- Slabá historická kategorie nezpůsobí automatické NEKUPOVAT; pouze vyžádá REVIEW.
- Live BUY se historií nepřepisuje.

## QA
- nový `ticket_learning_test.mjs`
- test minimálního vzorku
- test slabé kategorie a capu 2 ks
- test ochrany čerstvého live BUY
- test je zapojený do GitHub Actions QA

## PWA
- verze 25.5.0
- nový learning modul je součástí offline cache
