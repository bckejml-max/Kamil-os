# Kamil OS 25.9 — Director OS

## Co je nové
- Nový Director OS v Práci vytváří prioritní ředitelskou frontu z existujících úkolů, projektů a položek „Čekám na“.
- Rozlišuje operativu od skutečné ředitelské práce: rozhodnutí, určení vlastníka, eskalace, follow-up a rizikové projekty.
- Delegovaný úkol po termínu se nevrací automaticky uživateli; Director OS doporučí nejdřív eskalaci a vyžádání stavu.
- Aktivní projekt s vysokým rizikem, chybějícím dalším krokem nebo blízkým deadlinem se dostane do fronty podle priority.
- Položky „Čekám na“ se objeví až v den follow-upu nebo po jeho překročení.
- Fronta je omezená na sedm nejdůležitějších zásahů a je seřazená deterministicky podle priority.

## Bezpečnost a data
- Director OS pouze čte existující projekty, úkoly a delegace; nevymýšlí odpovědnost, termíny ani stav projektu.
- Nemění Supabase URL/key/tabulky, schema version ani legacy localStorage keys.
- Neprovádí žádné automatické e-maily, delegování ani jiné externí akce.

## QA
- `director_os_test.mjs` ověřuje eskalaci delegovaného skluzu, rozhodnutí u prioritního úkolu bez vlastníka, vysoké riziko projektu, chybějící další krok, overdue follow-up a ignorování hotových úkolů.
- Test je zapojený do GitHub QA workflow.
- Shell, manifest a PWA cache jsou sjednocené na 25.9.0.
