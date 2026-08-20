# Kamil OS 32.2

Kamil OS je osobní **local-first Personal Autopilot**. Viditelné rozhraní je soustředěné do pěti hlavních oblastí: **Dnes / Peníze / Vstupenky / Domov / Více**. Aplikace funguje bez hesla a bez povinného cloudu; Supabase se načte až při existující cloud session nebo explicitním připojení.

## Copilot 2.0 Foundation 32.2
32.2 zavádí jednotné bezpečnostní pravidlo pro zapisovací příkazy v Command Baru: **UNDERSTAND → PROPOSE → PREVIEW → CONFIRM → EXECUTE**. Známé příkazy jako splátka pohledávky, označení vstupenky jako prodané nebo přesun/vytvoření osobního úkolu na zítra nejdřív vytvoří čistý návrh a zobrazí konkrétní náhled změny. State se během preview nemění.

Zápis vznikne až po explicitním tlačítku **Potvrdit změnu**. Před provedením se návrh znovu sestaví z aktuálních dat; pokud se dotčená entita mezitím změnila, fingerprint nesedí a zápis se zablokuje. Samotné provedení dál používá standardní `store.mutate`, takže zachovává undo, audit i sync cestu. Navigace, vyhledávání a read-only dotazy zůstávají okamžité. Neznámý příkaz dál nic nezapíše bez explicitního potvrzení vytvoření osobního úkolu.

## Data Engine v3 32.1
32.1 přidává bezpečný **dual-write dlouhé historie**. Decision Journal, Net Worth historie, ticket historie, Trade Journal a historie Smart Importů se dál zrcadlí do lokálního IndexedDB `kamil-os-data-v2` a při připojeném cloudu se stejné záznamy idempotentně ukládají také jako samostatné entity do `kamil_os_history`.

Cloudová historie má vlastní RLS a explicitní Data API oprávnění pouze **SELECT / INSERT / UPDATE** pro přihlášeného vlastníka. Klient nemá `DELETE`. Raw dokumenty, Vault ani auth tokeny nejsou v history allowlistu. Hlavní `kamil_os_state` se zatím nezkracuje — dual-write je ověřovací vrstva před budoucím cutoverem.

## Trust & Sync 32.0
32.0 zpevňuje login, cloudový state a multi-device synchronizaci. Magic link a reset hesla mají 60sekundový cooldown a srozumitelnou hlášku pro Supabase rate limit. Po úspěšném připojení je stav cloudu viditelný přímo v horní liště.

Cloud schema je **80**. Historický cloud schema 79 se po bezpečném načtení migruje a normalizovaný snapshot se znovu uloží. Pokud by cloud používal vyšší schema než aktuální aplikace, Kamil OS data neotevře ani nepřepíše a vyžádá aktuální verzi.

`undo` je od 32.0 čistě **device-local**. Do cloudového JSONu se už neposílají undo snapshoty ani transientní `cloudMode`, `preflight` a Smart Sync device metadata. Při načtení cloudu se lokální undo a UI state zachovají. Offline queue už při flushi nepřepisuje celý právě načtený state.

## Confirmed Merge 32.0
Ve **Více → Systém → Remote Change Inbox** lze otevřít náhled lokální vs. vzdálené verze položky. Vzdálená verze nebo vzdálené smazání se provede pouze po explicitním potvrzení a používá normální Kamil OS undo, audit a cloud writer.

Volitelný auto režim smí automaticky přijmout pouze **novou položku**, která na tomto zařízení vůbec neexistuje. `CONFLICT` ani `REMOTE_DELETE` se nikdy automaticky neaplikují.

## Smart Sync 31.4–31.5
Smart Sync vede vedle bezpečného celého cloud snapshotu append-only item-level shadow journal `kamil_os_changes`. Sleduje jen allowlist stabilních osobních položek s ID a vytváří sanitizované `UPSERT` / `DELETE` operace s per-device monotónním sequence.

Cloudová cesta pro čtení změn z jiných zařízení zůstává SELECT-only. Stažené payloady se před porovnáním znovu sanitizují; password/secret/token/CVV/seed/raw OCR/image klíče se do Remote Inboxu nedostanou.

## Data Recovery 31.2+
Kamil OS rozpozná, když běží na zařízení/browseru s prázdným lokálním profilem. Na Dnes zobrazí recovery kartu **„Tvoje data nejsou na tomto zařízení“**. Nejjednodušší obnova je přes **Připojit moje data → Poslat přihlašovací odkaz bez hesla**. Magic link používá existující Supabase účet, má `shouldCreateUser: false` a canonical redirect na `https://kamil-os-smoke.vercel.app/`.

## Dnes — Morning Command Center
- **Udělej dnes** — hlavní osobní kroky podle priority.
- **Pozor na peníze** — cashflow, rezerva a bezpečný investiční prostor.
- **Blíží se** — osobní termíny v režimu připravit → naplánovat → řešit → teď.
- **Co se změnilo** — Decision Delta porovnává aktuální rozhodnutí s posledním potvrzeným lokálním snapshotem.
- **Proč teď? / Kdy změnit názor?** — explainability + skutečné `when / buyRule / sellRule` z decision enginu.
- **Decision Journal** — auditní historie potvrzených doporučení a bezpečných pozorovaných metrik.

## Command Bar / Copilot
Ctrl+K umí hledat osobní administrativu, rodinu, majetek, cíle, XTB, vstupenky a pohledávky a odpovídat například na `jak jsem na tom`, `co se změnilo od minule`, `co jsme doporučili`, `co koupit za 25 000 Kč`, `jak jsou na tom vstupenky`, `co příští měsíc`, `12 měsíců dopředu` nebo `co chybí doplnit`.

Read-only příkaz může odpovědět nebo navigovat hned. Write příkaz musí nejprve ukázat náhled a čekat na explicitní potvrzení. Pokud Command Bar textu nerozumí, **nic automaticky nezapisuje** a nabídne vytvoření osobního úkolu pouze po potvrzení.

## Peníze / XTB
Kamil OS obsahuje 90denní cashflow, cíle a fondy, Spending Intelligence, True Net Worth, Portfolio Rebalancer, Portfolio Risk Map a XTB decision engine. Měny se bez skutečného FX kurzu nesčítají ani nepřepočítávají. Investiční rozhodnutí jsou oddělená na pravidlový AUTO výstup a volitelnou čerstvou live intelligence.

## Vstupenky
Ticket workflow pokrývá nákup, holding, listing, repricing, prodej a payout. Ticket Profit & ROI drží měny odděleně. Decision engine používá skutečně uložené datum akce, workflow, nákupní/list/floor/market cenu a případnou živou intelligence; chybějící tržní data nevymýšlí.

## Domov / dokumenty / rodina
Osobní administrativa zahrnuje pojištění, doklady, platby, smlouvy, rodinu, majetek, servis, Emergency File a Renewal Radar. Document Scanner umí lokální browser OCR obrázků přes připnutý Tesseract.js; raw obrázek ani raw OCR text se neukládají do běžného state. Sensitive Vault je oddělený, lokální a šifrovaný AES-GCM.

## Cloud a local-first režim
- schema: **80**
- hlavní state: `kamil_os_state`
- IndexedDB: `kamil-os-data-v2`
- cloud history dual-write: `kamil_os_history`
- Smart Sync shadow: `kamil_os_changes`
- kalendář cache: `kamil_calendar_cache`
- XTB cache: `kamil_xtb_data`
- localStorage klíče zůstávají kompatibilní
- `undo` je device-local a není součást cloud payloadu
- cloud je volitelný a používá RLS podle přihlášeného uživatele
- Supabase SDK se na čistém local-first startu nestahuje
- cloud s novějším schema se nikdy potichu nepřepíše
- konflikt ani vzdálené smazání se automaticky neaplikují
- cloudová historie nemá klientské DELETE oprávnění

## PWA a security
Kamil OS je statická PWA. Produkce používá main-only Vercel deployment policy, Content Security Policy, `nosniff`, frame deny, omezený referrer policy a browser permissions. Offline shell je cachovaný Service Workerem. Klient obsahuje pouze publishable Supabase key; `service_role`/secret key se do browseru nesmí dostat.

## QA
GitHub Actions spouští unit/integration regresi pro finance, XTB, vstupenky, dokumenty, rodinu, backup, risk, Decision Explainability/Next Trigger/Delta, Decision Journal, Data Recovery, Data Engine, Smart Sync a Remote Inbox. 32.0 přidává testy auth/cloud/confirmed merge, 32.1 cloud history/Data Engine a 32.2 pure write proposal + static zákaz legacy silent-write větví + Chromium potvrzení zápisu.

## Architektonický směr
32.x pokračuje v **Core v2**: compact cloud state, per-device undo, potvrzené multi-device merge, postupný přesun velkých historií mimo hlavní JSON a Copilot s povinným preview/confirm pro zápisy. Další velká vrstva je source-backed Live Brain a real-market Ticket Intelligence; žádná z nich nesmí obejít potvrzovací pravidla u mutací.
