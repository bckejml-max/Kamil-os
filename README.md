# Kamil OS 31.5

Kamil OS je osobní **local-first Personal Autopilot**. Viditelné rozhraní je soustředěné do pěti hlavních oblastí: **Dnes / Peníze / Vstupenky / Domov / Více**. Aplikace funguje bez hesla a bez povinného cloudu; Supabase se načte až při existující cloud session nebo explicitním připojení.

## Remote Change Inbox 31.5
Ve **Více → Systém → Remote Change Inbox** Kamil OS bezpečně ukazuje poslední item-level shadow změny z ostatních zařízení. Inbox je v 31.5 striktně **read-only**: vzdálený UPSERT ani DELETE se nikdy automaticky neaplikuje do hlavního state.

Inbox seskupí nejnovější změnu pro každou položku a rozliší **Konflikt / Nová vzdálená položka / Vzdálené smazání / Už shodné**. U konfliktu ukáže názvy změněných top-level polí, ale žádný merge sám neprovede. Stažený cloudový payload se před porovnáním znovu sanitizuje; blokované password/secret/token/CVV/seed/raw OCR/image klíče se nezobrazují.

Stav `přečteno` je pouze lokální metadata v IndexedDB. Nezapisuje se do `kamil_os_state` ani do cloudového journalu. V čistě lokálním režimu Remote Inbox kvůli sobě nestahuje Supabase SDK.

## Smart Sync 31.4
Smart Sync vede vedle bezpečného celého cloud snapshotu append-only item-level shadow journal `kamil_os_changes`. Sleduje jen allowlist stabilních osobních položek s ID a vytváří sanitizované `UPSERT` / `DELETE` operace s per-device monotónním sequence.

`kamil_os_state` zůstává autoritativní snapshot. Klient smí do shadow tabulky pouze **SELECT + INSERT**; nemá UPDATE/DELETE a `anon` nemá žádná práva. Remote operace se v 31.4 ani 31.5 automaticky neslučují.

## Data Engine 31.3
Kamil OS má první vrstvu robustnějšího lokálního úložiště: **IndexedDB history mirror** `kamil-os-data-v2`. Do něj se nedestruktivně zrcadlí vybrané dlouhé historie:
- Decision Journal,
- Net Worth historie,
- ticket historie,
- Trade Journal,
- historie Smart Importů.

31.3 je záměrně **mirror-first**. Primární state, schema 42, cloud sync i Backup Guard zůstávají beze změny a z hlavního state se nic nemaže. Raw dokumenty, Vault, auth tokeny ani jiné citlivé úložiště se do tohoto mirroru nezařazují.

## Data Recovery 31.2
Kamil OS rozpozná, když běží na zařízení/browseru s prázdným lokálním profilem. Takový stav se netváří jako hotový osobní dashboard: na Dnes se zobrazí recovery karta **„Tvoje data nejsou na tomto zařízení“**.

Nejjednodušší obnova je přes **Připojit moje data → Poslat přihlašovací odkaz bez hesla**. Magic link používá existující Supabase účet, má `shouldCreateUser: false` a po kliknutí se vrací na kanonickou produkční adresu `https://kamil-os-smoke.vercel.app/`. Stav **„Jen toto zařízení“** je v lokálním režimu klikací. E-mail posledního cloudového účtu se může lokálně předvyplnit; heslo se neukládá.

## Dnes — Morning Command Center
- **Udělej dnes** — hlavní osobní kroky podle priority.
- **Pozor na peníze** — cashflow, rezerva a bezpečný investiční prostor.
- **Blíží se** — osobní termíny v režimu připravit → naplánovat → řešit → teď.
- **Co se změnilo** — Decision Delta porovnává aktuální rozhodnutí s posledním potvrzeným lokálním snapshotem.
- **Proč teď? / Kdy změnit názor?** — explainability + skutečné `when / buyRule / sellRule` z původního decision enginu.
- **Decision Journal** — auditní historie potvrzených doporučení a bezpečných pozorovaných metrik.

## Decision Journal 31.1
Journal ukládá, co Kamil OS v okamžiku snapshotu skutečně doporučil: doménu, věc, akci, prioritu, důvod, další trigger a zdroj. Pro XTB může bezpečný snapshot obsahovat P/L %, váhu, hodnotu a měnu; pro tickety workflow, dny do akce a známé buy/list/market/floor hodnoty.

Journal má pevný allowlist pozorovaných polí, maximálně 250 záznamů a identické snapshoty neduplikuje. Změna P/L nebo workflow se zobrazuje jako **pozorovaný posun**, nikoli jako zpětně vymyšlený důkaz správnosti doporučení. Decision Delta baseline zůstává lokální; Decision Journal je součást běžného state, backupu a případného cloud syncu.

## Command Bar / Copilot
Ctrl+K umí hledat osobní administrativu, rodinu, majetek, cíle, XTB, vstupenky a pohledávky a odpovídat například na `jak jsem na tom`, `co se změnilo od minule`, `co jsme doporučili`, `co koupit za 25 000 Kč`, `jak jsou na tom vstupenky`, `co příští měsíc`, `12 měsíců dopředu` nebo `co chybí doplnit`.

Pokud Command Bar textu nerozumí, **nic automaticky nezapisuje**. Nabídne vytvoření osobního úkolu pouze po explicitním potvrzení.

## Peníze / XTB
Kamil OS obsahuje 90denní cashflow, cíle a fondy, Spending Intelligence, True Net Worth, Portfolio Rebalancer, Portfolio Risk Map a XTB decision engine. Měny se bez skutečného FX kurzu nesčítají ani nepřepočítávají. Investiční rozhodnutí jsou oddělená na pravidlový AUTO výstup a volitelnou čerstvou live intelligence.

## Vstupenky
Ticket workflow pokrývá nákup, holding, listing, repricing, prodej a payout. Ticket Profit & ROI drží měny odděleně. Decision engine používá skutečně uložené datum akce, workflow, nákupní/list/floor/market cenu a případnou živou intelligence; chybějící tržní data nevymýšlí.

## Domov / dokumenty / rodina
Osobní administrativa zahrnuje pojištění, doklady, platby, smlouvy, rodinu, majetek, servis, Emergency File a Renewal Radar. Document Scanner umí lokální browser OCR obrázků přes připnutý Tesseract.js; raw obrázek ani raw OCR text se neukládají do běžného state. Sensitive Vault je oddělený, lokální a šifrovaný AES-GCM.

## System Health 31
Sekce **Více → Systém** zobrazuje diagnostiku release/schema konzistence, velikosti local state + pending sync, stáří zálohy, lokální/cloud synchronizace, PWA/Service Workeru, stáří XTB/ticket intelligence dat, Data Engine, Smart Sync a Remote Change Inbox. System Health je read-only diagnostika; nic sama neopravuje ani neposílá.

## Cloud a local-first režim
- schema: **42**
- hlavní state: `kamil_os_state`
- IndexedDB: `kamil-os-data-v2`
- Smart Sync shadow: `kamil_os_changes`
- kalendář cache: `kamil_calendar_cache`
- XTB cache: `kamil_xtb_data`
- legacy localStorage klíče zůstávají kompatibilní
- cloud je volitelný a používá RLS podle přihlášeného uživatele
- Supabase SDK se na čistém local-first startu nestahuje
- nový browser s prázdným state cloud automaticky nepřepisuje
- konflikt mezi cloudem a zařízením se nikdy nepřepíše potichu

## PWA a security
Kamil OS je statická PWA. Produkce používá main-only Vercel deployment policy, Content Security Policy, `nosniff`, frame deny, omezený referrer policy a browser permissions. Offline shell je cachovaný Service Workerem. Klient obsahuje pouze publishable Supabase key; `service_role`/secret key se do browseru nesmí dostat.

## QA
GitHub Actions spouští rozsáhlou sadu unit/integration testů pro finance, XTB, vstupenky, dokumenty, rodinu, backup, risk, Decision Explainability/Next Trigger/Delta, System Health, Decision Journal, Profile Bootstrap, Data Engine, Smart Sync a Remote Change Inbox. Playwright/Chromium E2E ověřuje local-first recovery, IndexedDB history mirror, item-level outbox a viditelnost Remote Inboxu bez načtení Supabase SDK v local-only režimu.

## Architektonický směr
31.x je **Core v2**. Nové doménové enginy zůstávají pure a oddělené od DOM/storage/network API. 31.4 přidal bezpečný shadow journal, 31.5 pouze jeho read-only multi-device observability. Teprve další samostatná verze může zavést uživatelem potvrzené merge — ne automatický konflikt resolver.
