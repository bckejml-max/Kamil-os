# Kamil OS 32.3 — Live Brain Foundation

## Source-backed trust gate
- Live XTB/ticket kandidát už nemůže přepsat pravidlové AUTO rozhodnutí pouze proto, že obsahuje `action`.
- Pro `TRUSTED_FRESH` jsou povinné: action, validní `asOf`, alespoň jeden HTTP(S) zdroj a číselná confidence.
- XTB freshness zůstává 48 hodin; ticket intelligence 30 hodin.
- Čas v budoucnosti nad malou toleranci se blokuje.
- Nevalidní/credential/javascript/data/ftp zdroje se nepřijmou.

## Bezpečný fallback
- `UNSOURCED`, `STALE`, `NO_CONFIDENCE`, `INVALID_ASOF` a `FUTURE_ASOF` live kandidáti nepřepisují AUTO.
- Blokovaný kandidát zachová pouze diagnostické trust metadata.
- Žádný auto-trading ani automatická změna state.
- 32.3 sama nevytváří ani nevymýšlí tržní zprávy; pouze ověřuje live signály, které Kamil OS skutečně dostane.

## UI
- Více → Systém → **Source Trust**.
- Zobrazuje ověřené vs. blokované live kandidáty pro XTB a vstupenky.
- Ukazuje důvody blokace: bez zdroje, zastaralé, bez confidence, neplatný/budoucí čas.

## Kompatibilita
- Cloud schema zůstává 80.
- Bez nové Supabase tabulky a bez migrace uložených dat.
- Trust & Sync 32.0, Data Engine 32.1 a Copilot confirmation 32.2 zůstávají aktivní.

## QA
- Pure trust-engine unit test.
- Static safety test.
- Integrační ticketDecision důkaz unsourced fallback / sourced override.
- Chromium System card + skutečná decision-path kontrola.
- Kompletní legacy regression + release gate.
