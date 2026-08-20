# Kamil OS

Kamil OS 26.5 je osobní command center. Viditelné rozhraní je záměrně pouze osobní: **Dnes / Peníze / Vstupenky / Domov / Více**.

## Personal OS 26
- **Dnes**: osobní briefing a Top 5 rozhodnutí bez pracovních projektů; urgentní smluvní okno z Renewal Radaru může vstoupit přímo do prioritní fronty.
- **Peníze**: XTB, cashflow 90 dní, capital allocation, známé životní náklady po měnách a **Scenario Simulator**.
- **Vstupenky**: sell cockpit, buy radar, event agregace a lessons.
- **Domov**: platby, pojištění, smlouvy, doklady, auto, dům, rodina, osobní rizika, 90denní timeline, Renewal Radar a **Emergency File**.
- **Více**: záloha, nastavení a systém; od 26.5 obsahuje **Backup & Recovery Guard**.
- **Ctrl+K**: osobní Search Everything; nouzové kontakty a názvy Emergency File jsou dohledatelné, ale telefon, e-mail, umístění, čísla smluv a dokladů se do search indexu nepřidávají.

## Backup & Recovery Guard 26.5
Nové exporty používají verzovaný obal s datem, verzí aplikace, schematem a kontrolním otiskem. Přenosná záloha zachová uživatelská data, ale záměrně odstraní interní `undo` snapshoty, které obsahují starší plné kopie stavu a mohou soubor výrazně nafukovat. Import podporuje i staré prosté JSON exporty. Nový formát před obnovou ověří kontrolní otisk a backup z novějšího neznámého schematu se odmítne místo nebezpečného downgradu. Před každou potvrzenou obnovou aplikace automaticky stáhne safety backup aktuálního stavu.

JSON záloha není šifrovaná; musí být uložena bezpečně. Kontrolní otisk slouží pro detekci náhodné změny nebo poškození souboru, není kryptografickým podpisem.

## Emergency File 26.4
V Domově je nouzový orientační přehled: **komu zavolat** a **kde najít důležité věci**. Používá vlastní aditivní `emergencyFile.contacts` a `emergencyFile.assets`, zároveň jen počítá existující evidované pojistky, doklady, dům, auto a rodinu bez kopírování jejich citlivých identifikátorů. Exportovaný textový přehled nikdy nevypisuje čísla pojistných smluv ani dokladů. UI výslovně blokuje text vypadající jako heslo, PIN, CVV, seed/recovery fráze nebo privátní klíč.

## Scenario Simulator 26.3
V Penězích lze nanečisto zadat **mimořádný výdaj, novou investici nebo mimořádný příjem** a porovnat stav před/po: minimum hotovosti v 90 dnech, rezervní headroom, zbývající bezpečný kapitál a konečný 90denní zůstatek. Simulace pracuje pouze s dočasnou kopií state, nic neukládá ani neprovádí a cizí měnu bez skutečného FX kurzu odmítne.

Renewal Radar používá jen uložené částky, periodicitu, výpovědní termíny a výročí. Roční spend k prověření není odhad úspory, měny se nesčítají a Kamil OS nic automaticky neruší ani neobjednává.

Starší pracovní data se při migraci nemažou. Zůstávají v uloženém stavu a exportu zálohy kvůli zpětné kompatibilitě, ale Personal OS je nezobrazuje ani dále nerozvíjí.

Cloud je volitelný. Lokální data používají stávající storage klíče a cloudový stav stávající Supabase tabulku; schema **38** zůstává stejné jako v 26.4. Supabase URL/key/tabulky a legacy localStorage klíče zůstávají beze změny.