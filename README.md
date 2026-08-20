# Kamil OS

Kamil OS **29.0** je osobní autopilot. Viditelné rozhraní zůstává pouze osobní: **Dnes / Peníze / Vstupenky / Domov / Více**. Starší pracovní data se při migraci nemažou, ale Personal OS je nezobrazuje ani dále nerozvíjí.

## 29.0 — Personal Autopilot Complete

### Dnes — jedna obrazovka
Dnes je zjednodušené na čtyři otázky:
- **Udělej dnes** — maximálně tři hlavní osobní kroky.
- **Pozor na peníze** — rezerva, známé cashflow a bezpečný investiční prostor.
- **Blíží se** — připravit → naplánovat → řešit → teď / po termínu.
- **Co se změnilo** — skutečný osobní change feed z auditu, Inboxu a historie cen.

Pracovní projekty a pracovní úkoly se do osobního Today nevracejí.

### Onboarding & Data Quality
Onboarding nabídne maximálně tři konkrétní datové mezery u již existujících osobních záznamů. Kategorie, které uživatel ještě vůbec neeviduje, jsou pouze volitelné a formulované jako „pokud…“ — Kamil OS nevymýšlí, že daný závazek musí existovat.

### Personal Inbox — Gmail + kalendář
Personal Inbox přijímá ruční kandidáty, explicitně osobní kalendářové události a bezpečný externí Gmail intake. Gmail automatizace vybírá pouze jednoznačně osobní/rodinné/domácí administrativní zprávy a explicitně vynechává práci, projekty, nákup/procurement, marketing a nejasné zprávy. Do Kamil OS ukládá jen krátký kandidát, ne celý e-mail ani přílohy.

Kandidáty nikdy nesmí obsahovat hesla, bezpečnostní kódy, PIN/CVV, celé identifikátory dokladů, čísla pojistných smluv, recovery/seed fráze nebo jiné přístupové tajemství. Inbox nic sám neprovádí; kandidát se potvrzuje nebo zahazuje.

Calendar Sync zachovává explicitní `personal` flag. Importovaný Outlook/ICS kalendář „Kalendář“ a pracovní kalendáře jsou `personal=false`, takže se do osobního autopilotu nepřimíchají jen podle názvu události.

### Reminder Escalation
Termíny už nejsou jen jeden alarm. Pravidlově se posouvají přes stavy **PŘIPRAVIT / NAPLÁNOVAT / ŘEŠIT / TEĎ / PO TERMÍNU**. Prahy se liší podle typu položky. Jde pouze o interní připomínkovou logiku nad uloženým termínem — není vydávána za právní, servisní nebo jinou odbornou lhůtu.

Browserová upozornění fungují jen po povolení a při běžícím klientu. Skutečný push při úplně zavřené PWA dál vyžaduje serverovou push službu; aplikace nepředstírá, že ji má.

### Cíle & fondy
V Penězích lze evidovat cílovou částku, už odloženou částku, měnu, cílové datum a skutečný měsíční příspěvek. Kamil OS počítá zbývající částku a potřebné tempo. Měny se nikdy nesčítají a systém žádné peníze automaticky nepřevádí.

### Historie nákladů
U osobních plateb a smluv se při **skutečné změně uložené částky** skládá historie ceny. Cloud sync, obnova zálohy a jiný bulk replace se za změnu ceny nepovažují. Bez skutečné historie Kamil OS netvrdí, že něco zdražilo nebo zlevnilo.

### Servisní šablony
Auto, technologie domu, spotřebiče a nemovitost mohou dostat servisní checklist. Šablona nabízí témata jako servis podle výrobce, pneumatiky, STK, záruka nebo revize, ale **nevymýšlí intervaly**. Konkrétní datum se uloží jen pokud ho uživatel zná a potvrdí.

### Import Assistant
Do Import Assistantu lze vložit text smlouvy, pojistky nebo faktury, případně textový soubor. Pravidlově navrhne typ, částku/měnu a nalezená data. Návrh se nikdy nezapíše přímo do evidence — pouze jako kandidát do Personal Inboxu po potvrzení. Citlivé identifikátory se detekují, ale záměrně se nevytěžují.

Skenovanou fotografii nebo PDF bez textové vrstvy statická PWA nepředstírá, že umí bezpečně OCR zpracovat bez dalšího lokálního/backend OCR řešení.

### Sensitive Vault
Sensitive Vault je oddělený od běžného Kamil OS state:
- pouze na zařízení,
- AES-GCM,
- klíč z fráze přes PBKDF2-SHA256,
- fráze se drží jen v paměti otevřené stránky,
- není synchronizován do Supabase,
- není součástí běžné JSON zálohy ani Ctrl+K search.

Vault je určený jen pro citlivé identifikátory. Hesla, PINy, CVV, seed/recovery fráze a privátní klíče záměrně odmítá. Má vlastní **šifrovaný export/import**, takže lze bezpečně přenést ciphertext na jiné zařízení a odemknout původní frází.

### Household Money + Scenario Lab
Zůstává 90denní cashflow, bezpečný investiční prostor a 12měsíční Scenario Lab pro jednorázový výdaj/příjem, nový měsíční náklad/příjem/investici nebo výpadek příjmu. Scénáře nic neukládají ani neprovádějí. Cizí měny bez skutečného FX kurzu se nesčítají ani nepřepočítávají.

Starší `netWorth()` nemá pevný fallback EUR/CZK. Pokud skutečný FX chybí, EUR část se do CZK součtu nezapočte a výstup se označí jako neúplný.

### Ctrl+K — Search Everything + osobní copilot
Ctrl+K umí hledat osobní administrativu, rodinu, majetek, cíle, Personal Inbox, XTB, vstupenky a pohledávky a pravidlově odpovídat například na:
- `co řešit dnes`
- `co končí do 60 dní`
- `co je po termínu`
- `co chybí doplnit`
- `ukaž cíle a fondy`
- `co zdražilo`
- `co se změnilo`
- `kolik stojí život`
- `kolik můžu bezpečně investovat`

Vault, čísla dokladů, pojistné identifikátory, Emergency File telefon/e-mail/umístění a další citlivé detaily se do globálního search indexu nepřidávají.

### Emergency File, Family Share a Backup Guard
Emergency File zůstává nouzový orientační přehled bez hesel/PINů a bez čísel dokladů/pojistek. Family Share je sanitizovaný read-only výřez bez XTB, vstupenek a citlivých identifikátorů.

Backup & Recovery Guard exportuje verzovaný state s fingerprintem a bez interních Undo snapshotů, podporuje starší JSON a blokuje neznámé novější schema. **Sensitive Vault je z běžného backupu záměrně vyloučen** a má vlastní šifrovanou zálohu.

## Data a kompatibilita
Schema **40** proti v39 aditivně přidává pouze:
- `personalGoals.items`

Stávající `personalAdmin`, `familyHome`, `emergencyFile`, `personalInbox`, `assetBook`, XTB, vstupenky i historická pracovní data zůstávají zachována. Supabase URL, publishable key, tabulky a legacy localStorage klíče se v 29.0 nemění.
