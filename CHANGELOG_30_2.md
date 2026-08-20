# Kamil OS 30.2 — Smart Filing & Follow-up

## Nové
- Po potvrzeném uložení z Document Scanneru se otevře Smart Filing follow-up.
- Ukáže skutečný cílový registr: Platby, Pojištění, Doklady nebo Smlouvy a předplatná.
- Vypíše jen termíny, které jsou opravdu uložené, včetně informace zda jsou do 90 dní nebo po termínu.
- Transparentně ukáže datové mezery místo domýšlení částek a lhůt.
- Najde silně související aktivní položky pouze ve stejném registru a vysvětlí důvody shody.
- U dokumentu s potvrzenou expirací lze ručně zadat vlastní datum předstihu; datum není předvyplněné.

## Safety
- Související položky se nikdy automaticky neslučují ani nepřepisují.
- Archivované a cross-category položky nejsou kandidáti na shodu.
- Výpovědní, právní, servisní ani jiné lhůty se z výročí/expirace nedopočítávají.
- Neplatná kalendářní data jsou odmítnuta; datum připomínky v minulosti nebo po expiraci se neuloží.
- Smart Filing engine je browser/network/store independent a nemutuje vstupní state.
- Scanner privacy z 30.1 zůstává zachována: raw obrázek, raw OCR text, filename a hodnoty citlivých identifikátorů se nevrací do filing vrstvy.

## Release
- Verze: **30.2.0**
- Schema: **42** (beze změny)
- PWA shell cache: `kamil-os-30.2.0-shell-r1`
- Nové moduly: `js/documentFiling30.js`, `js/documentFilingUi30.js`
- QA: engine test, integration s Documents & Expiry Center, static 30.2 QA a release gate.
