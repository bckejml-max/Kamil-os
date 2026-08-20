# Kamil OS 30.0 — Personal Copilot

## Co přidává
- jeden read-only Personal Copilot nad existujícími moduly Kamil OS
- cross-domain dotaz „Jak jsem na tom?“ propojující dnešní priority, True Net Worth, XTB risk a Ticket Profit
- dotazy na čisté jmění, portfolio riziko, skutečné výdaje, vstupenky, tento/příští měsíc a 12měsíční radar
- „Co koupit za X?“ používá výhradně uloženou cílovou alokaci Portfolio Rebalanceru
- rychlé otázky na Dnes a stejné dotazy přes globální command bar

## Bezpečnost
- Copilot je deterministický a read-only; žádná odpověď sama nic nezaplatí, neprodá ani neobchoduje
- bez částky odmítne vyrobit nákupní plán
- bez skutečného FX nevytváří globální XTB risk score ani falešný mixed-currency součet
- ticket listingová/cílová cena nikdy není realizovaný zisk
- odpovědi používají jen uložená data a existující pravidlové enginy; nevymýšlí confidence, live zdroj ani tržní cenu
- engine nemá DOM/browser závislosti a je připravený pro budoucí mobilní shell

## Release architektura
- Kamil OS 30.0.0, schema zůstává 42
- verze je od 30.0 v samostatném `js/releaseMeta.js`
- reusable `js/releaseStamp.js` odděluje release metadata od cloudové konfigurace
- `config.js` se při běžném release nemusí měnit
- PWA cache `kamil-os-30.0.0-shell-r1`
- engine test + integrační test + static QA + release gate
