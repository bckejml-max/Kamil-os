# Kamil OS 32.5 — Profit Control

## XTB
- FX-aware portfolio valuation; cross-currency positions are never silently summed as the same unit.
- Missing FX blocks precise allocation score and contribution recommendations.
- Public quote ingestion now requests required FX pairs (for example EURCZK=X) alongside security quotes.
- Exact next-contribution proposal uses the configured planned investment, fresh XTB import, complete FX and current portfolio gaps.
- Estimated share counts are shown only when a fresh public quote and FX conversion are available.
- No auto-trading; all outputs are proposals only.

## Tickets
- Active ticket bundles are consolidated by event and date.
- Event-level exposure shows quantity, capital at risk, listing coverage, fresh-market coverage and transfer readiness.
- Action Queue prioritizes missing list price, stale/no market, floor/sell-by, transfer readiness, proximity and capital concentration.
- No automatic pricing or selling; stale market data cannot drive a new price.

## Today
- Short Profit Control queue combines the highest-priority XTB and ticket actions into one daily view.

## Safety
- Schema stays 80.
- Market/FX API responses remain outside service-worker cache.
- Existing Live Brain, Copilot confirmation, Recovery Shield and confirmed remote-merge invariants remain enforced.
