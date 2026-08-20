# Kamil OS 32.4 — Market Edge

32.4 soustředí další vývoj na dvě nejdůležitější rozhodovací oblasti: **XTB** a **vstupenky**. Release zároveň přidává automatický Recovery Shield, aby další tuning nestál na jediném cloudovém snapshotu.

## XTB — Market Edge

- Oficiální **SEC EDGAR** filing ingestion přes serverový `/api/sec-filings`.
- SEC vrstva je facts-only: filing sám nikdy nevytváří BUY / SELL.
- XTB tickery se mapují na SEC tickery včetně aliasů Broadcom a Berkshire.
- Až 16 akciových pozic na jeden refresh; SEC requesty jsou sekvenční a rate-limit friendly.
- Device-local SEC cache na 6 hodin.
- Nová veřejná quote vrstva `/api/market-quotes` pro čerstvý cenový kontext.
- Quote je výslovně **PUBLIC / THIRD-PARTY**, není vydáván za exchange-direct feed.
- Quote nikdy nemění decision action a nikdy neobchází blokaci starého XTB importu.
- Execution tuning převádí BUY na tři tranše a TRIM / SELL na konkrétní návrh velikosti kroku.
- BUY / TRIM / SELL je blokovaný, pokud je stav účtu v XTB starší než 48 hodin.
- Nové SEC podání před akčním obchodem vyvolá review-before-trade, ne automatickou změnu názoru.

## Vstupenky — Pricing & Sell-by Radar

- Časové fáze WATCH / TEST MARKET / ACTIVE SELL / DEFEND / LIQUIDITY / EXIT.
- Každá fáze má vlastní interval kontroly trhu a repricing cadence.
- LISTED vstupenka bez skutečné list ceny je explicitní REVIEW problém.
- Market cena má vlastní freshness; čím blíž akce, tím rychleji expiruje.
- Stará market cena zůstává pouze jako reference a nesmí řídit nový listing.
- Rozlišení `SOURCED_MARKET`, `MANUAL_MARKET`, `STALE_MARKET`, `INTERNAL_TARGET`.
- Tuning modal ukládá list / market / floor cenu, sell-by, platformu, transfer status a market source URL.
- Pricing radar ukazuje kapitál v riziku, market coverage, stale markety a balíky v aktivním prodejním okně.
- Interní target je vždy viditelně označený jako interní; není vydáván za skutečnou tržní cenu.

## Recovery Shield

- Automaticky maximálně jeden recovery snapshot denně z autoritativního `kamil_os_state`.
- Před každým restore vznikne samostatný `PRE_RESTORE` snapshot současného cloudového stavu.
- Restore vyžaduje dvoukrokové potvrzení.
- Snapshoty respektují future-schema guard a compact cloud payload bez device-local undo.
- `kamil_os_snapshots` je pro authenticated klienta append-only: pouze SELECT + INSERT, žádný UPDATE / DELETE / TRUNCATE.

## Bezpečnostní invarianty

- Schema zůstává 80.
- Žádný auto-trading.
- SEC filing není investiční verdikt.
- Public quote není investiční verdikt.
- Unsourced / stale live signal nepřepisuje pravidlové rozhodnutí.
- Copilot write flow zůstává UNDERSTAND → PROPOSE → PREVIEW → CONFIRM → EXECUTE.
- Remote CONFLICT ani DELETE se automaticky neaplikují.
- Recovery snapshoty klient nemaže.
