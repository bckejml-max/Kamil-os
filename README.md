# Kamil OS

Kamil OS **28.0** je osobní autopilot. Viditelné rozhraní je záměrně pouze osobní: **Dnes / Peníze / Vstupenky / Domov / Více**. Starší pracovní data se při migraci nemažou, ale Personal OS je nezobrazuje ani dále nerozvíjí.

## Personal Autopilot 28.0

### Dnes — co opravdu řešit
- **3 věci dnes / 2 tento týden / 1 riziko** z uložených osobních dat.
- **Personal Inbox** pro nové kandidáty z ručního zápisu, explicitně osobního kalendáře a bezpečného externího intake.
- Inbox nic automaticky nepřepisuje: kandidát lze potvrdit na osobní úkol nebo označit jako vyřešený.
- Pracovní Outlook/kalendář se do osobního intake nepřimíchává bez explicitního označení `personal` / osobní.

### Peníze — domácí cockpit
- známé opakované životní náklady po **jednotlivých měnách**,
- 90denní cashflow a bezpečný investiční prostor,
- uživatelsky zadaný majetek a jeho závazky po měnách,
- **Scenario Lab 12 měsíců**: jednorázový výdaj/příjem, nový měsíční výdaj/příjem, měsíční investice nebo výpadek příjmu,
- scénáře běží jen nad dočasným výpočtem a nic neukládají ani neprovádějí,
- cizí měna se bez skutečného FX kurzu nesčítá ani nepřepočítává.

Starší `netWorth()` už také nemá pevný záložní EUR/CZK kurz. Pokud skutečný FX chybí, EUR část se do CZK součtu nezapočte a výstup se označí jako neúplný.

### Domov — Asset Book, rodina a data quality
- **Asset Book**: auto, technologie domu, spotřebiče a nemovitost; lze evidovat umístění, záruku, poslední/další servis, servisní kontakt a vlastní orientační hodnotu/zůstatek závazku.
- Asset Book se propisuje do osobní 90denní timeline přes skutečně uložené servisní a záruční termíny.
- **Rodinné profily** skládají jen explicitní vazby podle jména uvedeného u pojištěné osoby, držitele dokladu nebo osobní položky.
- **Data Quality Center** ukazuje chybějící částky, termíny, expirace, smluvní okna, nouzové kontakty bez spojení, servisní mezery a stav přenosné zálohy.
- **Family Share** vytvoří sanitizovaný read-only JSON výřez rodiny a domácího majetku. Neobsahuje XTB, vstupenky, pohledávky ani čísla dokladů a pojistných smluv.

### Smlouvy k prověření
Původní technický název Renewal Radar je v UI nahrazen normálním **Smlouvy k prověření**. Funkce hlídá jen skutečně uložené výročí, výpovědní termíny, periodicitu, autopay a známý roční spend. Známý spend není vydáván za „odhad úspory“ a systém nic automaticky neruší.

### Ctrl+K — Search Everything + osobní copilot
Ctrl+K dál hledá konkrétní pojistku, platbu, doklad, rodinu, majetek, Personal Inbox, XTB a vstupenku. Navíc umí pravidlově odpovědět nad vlastními daty například na:
- `co končí do 60 dní`
- `kolik platím ročně za pojistky`
- `všechno kolem auta`
- `dům / domácnost`
- `co může stát peníze tento měsíc`
- `co chybí doplnit`
- `co mám dnes řešit`
- `kolik stojí život`
- `kolik můžu bezpečně investovat`

Tahle vrstva je záměrně deterministická a lokální, nehraje si na externí AI bez backendu a nevymýšlí chybějící fakta.

## Upozornění
Kamil OS skládá jednu deduplikovanou frontu z osobních rizik, timeline, smluv, majetku a datových mezer. V Nastavení lze zvolit `IMPORTANT`, `ALL` nebo `OFF`. Browserové upozornění je možné jen po udělení oprávnění a při běžícím klientu. **Skutečný push při úplně zavřené aplikaci vyžaduje serverovou push službu a klient nepředstírá, že ji má.**

## Intake z Gmailu a kalendáře
- Explicitně osobní kalendářové události lze bezpečně nabídnout v Personal Inboxu.
- Aplikace má rozhraní `kamil:intake-candidate` pro bezpečný externí intake.
- Statický klient sám Gmail nečte. Živý Gmail intake musí kandidáty dodat autorizovaná externí automatizace/backend; tím se zabrání tomu, aby browserová aplikace držela mailová oprávnění nebo si sama klasifikovala pracovní poštu jako osobní.

## Emergency File
V Domově je nouzový orientační přehled **komu zavolat** a **kde najít důležité věci**. Neukládá hesla/PINy a textový nouzový přehled nevypisuje čísla dokladů ani pojistných smluv.

## Backup & Recovery Guard
Nové exporty používají verzovaný obal s datem, verzí aplikace, schematem a kontrolním otiskem. Přenosná záloha zachová uživatelská data, ale odstraní interní Undo snapshoty. Import podporuje i staré JSON exporty, ověří fingerprint a odmítne backup z novějšího neznámého schematu. Před potvrzenou obnovou se stáhne safety backup současného stavu.

JSON záloha není šifrovaná a musí být uložena bezpečně. Kontrolní otisk detekuje náhodnou změnu/poškození; není kryptografický podpis.

## Data a kompatibilita
Schema **39** aditivně přidává pouze:
- `personalInbox.items`
- `assetBook.items`

Stávající `personalAdmin`, `familyHome`, `emergencyFile`, XTB, vstupenky i historická data zůstávají zachována. Supabase URL, publishable key, tabulky a legacy localStorage klíče se v 28.0 nemění.
