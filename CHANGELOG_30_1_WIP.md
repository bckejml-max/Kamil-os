# Kamil OS 30.1 — Document Scanner (WIP)

Privacy-first dokumentový scanner pro mobilní PWA.

- foto z kamery, obrázek nebo textový soubor
- OCR v prohlížeči; první načtení OCR knihovny/jazykových dat vyžaduje internet
- před uložením vždy ruční kontrola a potvrzení
- raw obrázek, raw OCR text ani filename se neukládají do běžného Kamil OS state
- citlivé identifikátory se pouze označí jako přítomné; jejich hodnoty se záměrně nevytěžují
- fingerprint pro upozornění na duplicitu vzniká jen z bezpečných metadat
- PDF zatím přes screenshot nebo vložený text

Release shell/verze/PWA budou doplněny až po zelených engine + integration testech.
