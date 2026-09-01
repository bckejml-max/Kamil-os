# Kamil OS – Ticket Redesign 500 – QA

## Automatické kontroly

- `npm run test:release` – PASS
- `node qa.mjs` – PASS
- `node ticket_market_desk_190_test.mjs` – PASS
- `node ticket_profit_confidence_206_test.mjs` – PASS
- `node ticket_flicker_338_test.mjs` – PASS
- `node ticket_recovery_hydration_188_test.mjs` – PASS
- `node --check` pro všechny změněné JavaScriptové soubory a `sw.js` – PASS

## Vizuální a interakční kontrola

Ověřeno v Chromiu přes Playwright na desktopu 1600 × 1100 a mobilu 390 × 844.

- bez horizontálního přetékání
- 5 KPI bloků
- přepínání Přehled / Nákupy / Prodeje / Inventář / Příležitosti
- tabulkové i kartové zobrazení
- filtry a volba sloupců
- ruční přidání vstupenky
- Commander „Dnes řešit“
- graf a doporučovací panely
- desktopová horní a mobilní spodní navigace

## Poznámka k původnímu projektu

Při celém bootu se v konzoli objevuje starší chyba modulu `js/os119.js` v části Dnes (`Unexpected identifier 'NEPŘIKUPOVAT'`). Je přítomná už v dodaném původním ZIPu, redesign Vstupenek ji nevytvořil a sekci Vstupenky neblokuje.
