# Kamil OS 30.4 — Next Trigger

## Co je nové

- detail **Proč teď?** nově ukazuje také **Kdy změnit názor?**
- XTB rozhodnutí propouštějí do dnešního Top 3 skutečné `when`, `buyRule` a `sellRule` z existujícího decision enginu
- vstupenky propouštějí stejné skutečné timing / buy / sell podmínky z ticket decision enginu
- uživatel tak vedle aktuálního DRŽET / PŘIKOUPIT / PRODAT vidí i pravidlo, podle kterého se má rozhodnutí později změnit
- osobní, rodinné a administrativní priority bez strukturovaného obchodního pravidla žádný falešný trigger nedostanou

## Bezpečnost

- Next Trigger je čistě **read-only** vrstva
- nic samo neprodá, nekoupí, nevystaví ani nepřecení
- bez původního `when`, `buyRule` nebo `sellRule` nevymýšlí vlastní cenu, termín ani podmínku
- původní score a pořadí rozhodnutí se nemění
- engine nemá DOM, browser storage ani síťové závislosti

## Release

- verze: **30.4.0**
- state schema: **42** beze změny
- PWA cache: `kamil-os-30.4.0-shell-r1`
- nový modul: `js/decisionNext30.js`
- nové unit + integration testy a release gate 30.4
