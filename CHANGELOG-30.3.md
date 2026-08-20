# Kamil OS 30.3 — Proč teď?

## Co je nové

- Na kartě **Udělej dnes** má každé aktuální rozhodnutí tlačítko **Proč teď?**.
- Detail ukazuje skutečné priority, scoring engine, pravidlo a fakta, která jsou v rozhodnutí opravdu k dispozici.
- U osobní timeline jsou pravidla transparentní: po termínu 96, dnes 90, osobní úkol v horizontu 1–7 dní 82, rodinný termín 68 a ostatní osobní termín 64.
- Cashflow RISK zůstává 100 a TIGHT 82; 30.3 tato čísla jen vysvětluje.
- U Personal Risk, Renewal Radar, XTB a vstupenek je výslovně uvedeno, že score pochází z původního enginu. 30.3 nepředstírá rozpad, který původní engine neposkytuje.

## Bezpečnost a auditovatelnost

- 30.3 **nemění score ani pořadí rozhodnutí**.
- Nevymýšlí termín, zdroj ani confidence, pokud je původní rozhodnutí neposkytuje.
- Fallback používá jen skutečný `reason` / `detail`.
- Explainability engine je čistý modul bez DOM, browser storage a sítě.
- UI je read-only: žádné `store.mutate`, lokální zápisy ani síťové write operace.
- Tlačítko je navázané na stabilní identitu rozhodnutí, ne na pořadí řádku; při změně Top 3 proto nevysvětlí jinou položku.

## Release

- Verze: **30.3.0**
- State schema: **42** beze změny
- PWA cache: `kamil-os-30.3.0-shell-r1`
- Nové moduly: `decisionExplain30.js`, `decisionExplainUi30.js`
- Release QA před changelogem: 51/51 hlavních kroků SUCCESS + cleanup + Complete job SUCCESS.
