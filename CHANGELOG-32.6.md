# Kamil OS 32.6 — Ticket Market Intelligence

- Adds event-level Repricing & Sell-by Intelligence on top of 32.5 Profit Control.
- Emits SET LIST, REPRICE, CHECK MARKET, SELL-BY, LIST, HOLD LISTING and TRANSFER REVIEW proposals.
- A price proposal is allowed only when the saved market observation is fresh for the current selling phase.
- Stale or missing market data always produces CHECK MARKET with no suggested price and no ladder.
- Repricing is stepped by phase, never below the configured floor, with explicit next-check timing.
- Sell-by discipline raises liquidity priority when the chosen/suggested sell-by date arrives.
- Existing ticket learning can increase review priority only after its evidence threshold; it does not manufacture prices.
- Event aggregation keeps all bundles for one event/date together.
- No automatic pricing, listing, transfer or sale.
- Schema remains 80 and all 32.5 FX/XTB safety remains intact.
