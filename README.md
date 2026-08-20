# Kamil OS

Kamil OS 26.0 je osobní command center. Viditelné rozhraní je záměrně pouze osobní: **Dnes / Peníze / Vstupenky / Domov / Více**.

## Personal OS 26
- **Dnes**: osobní briefing a Top 5 rozhodnutí bez pracovních projektů.
- **Peníze**: XTB, cashflow 90 dní, capital allocation a známé životní náklady po měnách.
- **Vstupenky**: sell cockpit, buy radar, event agregace a lessons.
- **Domov**: platby, pojištění, smlouvy, doklady, auto, dům, rodina, osobní rizika a 90denní timeline.
- **Více**: pouze záloha, nastavení a systém.
- **Ctrl+K**: osobní Search Everything; citlivá čísla smluv/dokladů nejsou indexována.

Starší pracovní data se při migraci nemažou. Zůstávají v uloženém stavu a exportu zálohy kvůli zpětné kompatibilitě, ale Personal OS je nezobrazuje ani dále nerozvíjí.

Cloud je volitelný. Lokální data používají stávající storage klíče a cloudový stav stávající Supabase tabulku; schema 37 pouze aditivně formalizuje `personalAdmin`, `familyHome` a `personalSettings`.