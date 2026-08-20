# Kamil OS

Kamil OS 26.4 je osobní command center. Viditelné rozhraní je záměrně pouze osobní: **Dnes / Peníze / Vstupenky / Domov / Více**.

## Personal OS 26
- **Dnes**: osobní briefing a Top 5 rozhodnutí bez pracovních projektů; urgentní smluvní okno z Renewal Radaru může vstoupit přímo do prioritní fronty.
- **Peníze**: XTB, cashflow 90 dní, capital allocation, známé životní náklady po měnách a **Scenario Simulator**.
- **Vstupenky**: sell cockpit, buy radar, event agregace a lessons.
- **Domov**: platby, pojištění, smlouvy, doklady, auto, dům, rodina, osobní rizika, 90denní timeline, Renewal Radar a nový **Emergency File**.
- **Více**: pouze záloha, nastavení a systém.
- **Ctrl+K**: osobní Search Everything; nouzové kontakty a názvy Emergency File jsou dohledatelné, ale telefon, e-mail, umístění, čísla smluv a dokladů se do search indexu nepřidávají.

## Emergency File 26.4
V Domově vznikl nouzový orientační přehled: **komu zavolat** a **kde najít důležité věci**. Používá vlastní aditivní `emergencyFile.contacts` a `emergencyFile.assets`, zároveň jen počítá existující evidované pojistky, doklady, dům, auto a rodinu bez kopírování jejich citlivých identifikátorů. Exportovaný textový přehled nikdy nevypisuje čísla pojistných smluv ani dokladů. UI výslovně blokuje text vypadající jako heslo, PIN, CVV, seed/recovery fráze nebo privátní klíč.

## Scenario Simulator 26.3
V Penězích lze nanečisto zadat **mimořádný výdaj, novou investici nebo mimořádný příjem** a porovnat stav před/po: minimum hotovosti v 90 dnech, rezervní headroom, zbývající bezpečný kapitál a konečný 90denní zůstatek. Simulace pracuje pouze s dočasnou kopií state, nic neukládá ani neprovádí a cizí měnu bez skutečného FX kurzu odmítne.

Renewal Radar používá jen uložené částky, periodicitu, výpovědní termíny a výročí. Roční spend k prověření není odhad úspory, měny se nesčítají a Kamil OS nic automaticky neruší ani neobjednává.

Starší pracovní data se při migraci nemažou. Zůstávají v uloženém stavu a exportu zálohy kvůli zpětné kompatibilitě, ale Personal OS je nezobrazuje ani dále nerozvíjí.

Cloud je volitelný. Lokální data používají stávající storage klíče a cloudový stav stávající Supabase tabulku; schema **38** aditivně přidává `emergencyFile.contacts` a `emergencyFile.assets`. Supabase URL/key/tabulky a legacy localStorage klíče zůstávají beze změny.