# Kamil OS 29.3 — Year Ahead Radar

## 29.3.0

- Na **Dnes** přibyl nový vstup **12 měsíců**, který ukazuje dvanáct celých budoucích kalendářních měsíců.
- Radar bezpečně rozvíjí pouze položky s výslovně uloženou periodicitou (`WEEKLY`, `MONTHLY`, `QUARTERLY`, `SEMIANNUAL`, `YEARLY`). Jednorázový termín se nikdy sám neopakuje.
- Přehled zahrnuje známé osobní platby, ruční cashflow, výpovědní a obnovovací termíny, expirace dokladů, servis a záruky, rodinná výročí, osobní úkoly, explicitně osobní kalendář, cílová data a aktivní ticket akce.
- Rodinné narozeniny a výročí se zobrazí jako skutečný nejbližší roční výskyt v horizontu; pracovní úkoly a pracovní kalendář se nepřimíchávají.
- Známé příjmy, výdaje, plánované příspěvky do cílů a ticket kapitál zůstávají **po jednotlivých měnách**. CZK, EUR a USD se nesčítají do falešného společného čísla a žádný FX kurz se nevymýšlí.
- U každé měny radar ukáže měsíc s nejvyššími známými výdaji. Jde pouze o součet skutečně uložených budoucích závazků, nikoli predikci neznámých nákladů.
- Chybějící částka nebo datum se zobrazí jako mezera v datech a není skrytě nahrazena nulou ani odhadem.
- Cíl s uloženým `monthlyContribution` se plánuje po měsících; pokud má skutečné cílové datum v horizontu, plán po tomto měsíci nepokračuje.
- Schema zůstává **v40**. Supabase konfigurace, tabulky a legacy localStorage klíče se nemění; nevzniká nová synchronizovaná datová struktura.
- Radar je read-only: nic automaticky neplatí, nepřevádí, neinvestuje ani neobchoduje.
- Přidán `js/yearAheadRadar29.js`, samostatný engine test, migrační integrační test, static QA, GitHub Actions coverage, PWA cache a verze **29.3.0**.
