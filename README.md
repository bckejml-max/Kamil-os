# Kamil OS 31.0

Kamil OS je osobní **local-first Personal Autopilot**. Viditelné rozhraní je soustředěné do pěti hlavních oblastí: **Dnes / Peníze / Vstupenky / Domov / Více**. Aplikace funguje bez hesla a bez povinného cloudu; Supabase se načte až při existující cloud session nebo explicitním připojení.

## Dnes — Morning Command Center
- **Udělej dnes** — hlavní osobní kroky podle priority.
- **Pozor na peníze** — cashflow, rezerva a bezpečný investiční prostor.
- **Blíží se** — osobní termíny v režimu připravit → naplánovat → řešit → teď.
- **Co se změnilo** — Decision Delta porovnává aktuální rozhodnutí s posledním potvrzeným lokálním snapshotem.
- **Proč teď? / Kdy změnit názor?** — explainability + skutečné `when / buyRule / sellRule` z původního decision enginu.

## Command Bar / Copilot
Ctrl+K umí hledat osobní administrativu, rodinu, majetek, cíle, XTB, vstupenky a pohledávky a odpovídat například na:
- `jak jsem na tom`
- `co se změnilo od minule`
- `co koupit za 25 000 Kč`
- `jak jsou na tom vstupenky`
- `co příští měsíc`
- `12 měsíců dopředu`
- `co chybí doplnit`

Pokud Command Bar textu nerozumí, **nic automaticky nezapisuje**. Nabídne vytvoření osobního úkolu pouze po explicitním potvrzení.

## Peníze / XTB
Kamil OS obsahuje 90denní cashflow, cíle a fondy, Spending Intelligence, True Net Worth, Portfolio Rebalancer, Portfolio Risk Map a XTB decision engine. Měny se bez skutečného FX kurzu nesčítají ani nepřepočítávají. Investiční rozhodnutí jsou oddělená na pravidlový AUTO výstup a volitelnou čerstvou live intelligence.

## Vstupenky
Ticket workflow pokrývá nákup, holding, listing, repricing, prodej a payout. Ticket Profit & ROI drží měny odděleně. Decision engine používá skutečně uložené datum akce, workflow, nákupní/list/floor/market cenu a případnou živou intelligence; chybějící tržní data nevymýšlí.

## Domov / dokumenty / rodina
Osobní administrativa zahrnuje pojištění, doklady, platby, smlouvy, rodinu, majetek, servis, Emergency File a Renewal Radar. Document Scanner umí lokální browser OCR obrázků přes připnutý Tesseract.js; raw obrázek ani raw OCR text se neukládají do běžného state. Sensitive Vault je oddělený, lokální a šifrovaný AES-GCM.

## System Health 31
Sekce **Více → Systém** zobrazuje diagnostiku:
- release + schema konzistenci,
- velikost local state a pending sync,
- stáří zálohy,
- stav lokální/cloud synchronizace,
- PWA/Service Worker,
- stáří XTB a ticket intelligence dat.

System Health je read-only diagnostika; nic sama neopravuje ani neposílá.

## Cloud a local-first režim
- schema: **42**
- hlavní state: `kamil_os_state`
- kalendář cache: `kamil_calendar_cache`
- XTB cache: `kamil_xtb_data`
- legacy localStorage klíče zůstávají kompatibilní
- cloud je volitelný a používá RLS podle přihlášeného uživatele
- pending sync snapshot se zapisuje lokálně už při změně state
- konflikt mezi cloudem a zařízením se nikdy nepřepíše potichu

## PWA a security
Kamil OS je statická PWA. Produkce používá main-only Vercel deployment policy, Content Security Policy, `nosniff`, frame deny, omezený referrer policy a browser permissions. Offline shell je cachovaný Service Workerem.

## QA
GitHub Actions spouští rozsáhlou sadu unit/integration testů pro finance, XTB, vstupenky, dokumenty, rodinu, backup, risk, Decision Explainability/Next Trigger/Delta a System Health. Od 31.0 je součástí release gate také **Playwright/Chromium E2E**, který ověřuje kritický local-first flow v reálném browseru.

## Architektonický směr
31.0 je **Core v2 Foundation**. Nové doménové enginy mají zůstávat pure a nezávislé na DOM/storage/network API. Browserové UI a transportní vrstvy se mají držet odděleně, aby bylo možné postupně přesunout velká historická data do robustnějšího úložiště a později použít stejné enginy v nativním shellu.
