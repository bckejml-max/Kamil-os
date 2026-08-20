# Kamil OS 31.3

Kamil OS je osobní **local-first Personal Autopilot**. Viditelné rozhraní je soustředěné do pěti hlavních oblastí: **Dnes / Peníze / Vstupenky / Domov / Více**. Aplikace funguje bez hesla a bez povinného cloudu; Supabase se načte až při existující cloud session nebo explicitním připojení.

## Data Engine 31.3
Kamil OS má první vrstvu robustnějšího lokálního úložiště: **IndexedDB history mirror** `kamil-os-data-v2`. Do něj se nedestruktivně zrcadlí vybrané dlouhé historie:
- Decision Journal,
- Net Worth historie,
- ticket historie,
- Trade Journal,
- historie Smart Importů.

31.3 je záměrně **mirror-first**. Primární state, schema 42, cloud sync i Backup Guard zůstávají beze změny a z hlavního state se nic nemaže. IndexedDB tak může bezpečně začít sbírat starší záznamy, které by jinak při budoucím capování historie zmizely. Raw dokumenty, Vault, auth tokeny ani jiné citlivé úložiště se do tohoto mirroru nezařazují.

Stav mirroru je vidět v **Více → Systém → IndexedDB history mirror** včetně počtů podle domény a posledního mirroru. Pokud IndexedDB není dostupné, aplikace pokračuje v původním localStorage režimu.

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
Sekce **Více → Systém** zobrazuje diagnostiku release/schema konzistence, velikosti local state + pending sync, stáří zálohy, lokální/cloud synchronizace, PWA/Service Workeru, stáří XTB/ticket intelligence dat a od 31.3 také Data Engine status. System Health je read-only diagnostika; nic sama neopravuje ani neposílá.

## Cloud a local-first režim
- schema: **42**
- hlavní state: `kamil_os_state`
- IndexedDB history mirror: `kamil-os-data-v2`
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
GitHub Actions spouští rozsáhlou sadu unit/integration testů pro finance, XTB, vstupenky, dokumenty, rodinu, backup, risk, Decision Explainability/Next Trigger/Delta, System Health, Decision Journal, Profile Bootstrap a Data Engine. Playwright/Chromium E2E ověřuje local-first recovery i **skutečný zápis a čtení historického záznamu z IndexedDB**.

## Architektonický směr
31.x je **Core v2**. Nové doménové enginy zůstávají pure a nezávislé na DOM/storage/network API. 31.3 připravuje cestu k pozdějšímu přesunu velkých historických dat mimo hlavní JSON state, ale samotný destruktivní přesun se provede až po samostatné migrační a backup vrstvě.
