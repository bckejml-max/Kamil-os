# Kamil OS 30.1 — Document Scanner

## Nové
- Document Scanner v sekci **Více**: foto z mobilní kamery, výběr obrázku/souboru nebo vložený text.
- Obrázkové OCR běží v prohlížeči přes připnutou verzi Tesseract.js; první načtení knihovny a jazykových dat vyžaduje internet.
- Rozpoznává typ dokumentu, bezpečný název/poskytovatele, částku, měnu a data s kontextem (splatnost, expirace, výročí/obnova, vystavení).
- Před uložením je vždy review formulář; automaticky navrženou hodnotu lze opravit nebo odstranit.
- Duplicate guard upozorní na pravděpodobně znovu importovaný dokument.

## Privacy & safety
- Raw obrázek se neukládá do běžného Kamil OS state.
- Raw OCR text se po review zahodí.
- Filename se neukládá; zůstává jen přípona, MIME typ, velikost a metoda importu.
- Rodné číslo, číslo dokladu/smlouvy/účtu/karty, IBAN, variabilní symbol a PIN/heslo se pouze označí jako přítomné; jejich hodnoty se záměrně nevytěžují.
- Citlivý řádek nemůže automaticky skončit jako title/provider.
- Duplicate fingerprint vzniká jen z bezpečných metadat, ne z celého raw OCR textu.
- Kategorie a měna jsou omezené na existující bezpečné hodnoty; malformed override spadne na `OTHER/CZK`.
- PDF se v 30.1 automaticky nerasterizuje; použije se screenshot stránky nebo vložený text.

## Release
- Verze: **30.1.0**
- Schema: **42** (beze změny)
- PWA shell cache: `kamil-os-30.1.0-shell-r1`
- Nové moduly: `js/documentScanner30.js`, `js/documentScannerUi30.js`
- QA: engine privacy test + safe-state integration + static 30.1 gate + release gate.
