# Kamil OS 28.0 — Personal Autopilot

## 28.0.0 — From dashboard to personal autopilot

- nové **Osobní Autopilot Dnes**: 3 věci dnes / 2 tento týden / 1 riziko, bez pracovních projektů
- nový **Personal Inbox** se schema-safe `personalInbox.items`; kandidáty lze potvrdit na osobní úkol nebo vyřešit bez automatického zápisu do jiných registrů
- explicitně osobní kalendář může nabídnout událost do Inboxu; pracovní kalendář se bez označení `personal` nepřimíchává
- připraven bezpečný intake event `kamil:intake-candidate`; statický klient sám Gmail nečte a nepředstírá serverový mailový backend
- nový **Notification Engine** deduplikuje osobní rizika, termíny, smlouvy, majetek a datové mezery; režim IMPORTANT / ALL / OFF
- browserové upozornění je pouze best-effort při běžícím klientu; skutečný closed-app push je výslovně označen jako serverová funkce, která zatím není součástí statického PWA
- nový **Household Money Cockpit**: známé měsíční/roční náklady, 90denní likvidita, bezpečný investiční prostor a uživatelsky zadaná hodnota majetku/závazků po jednotlivých měnách
- odstraněn historický pevný fallback EUR/CZK 24,5 z `netWorth()`; bez skutečného FX se cizí měna do CZK součtu nezapočítá
- nový **Scenario Lab 12 měsíců** pro jednorázové/měsíční výdaje a příjmy, měsíční investici a výpadek příjmu; čistý výpočet bez mutace stavu a bez domyšleného FX
- nový **Asset Book** se schema-safe `assetBook.items`: auto, technologie domu, spotřebič, nemovitost; servis, záruka, umístění, kontakt a uživatelský odhad hodnoty/závazku
- Asset Book se propisuje do 90denní osobní timeline přes skutečně uložené servisní a záruční termíny
- nové **Rodinné profily** z explicitních vazeb podle jména u držitele dokladu, pojištěné osoby nebo osobní položky
- nový sanitizovaný **Family Share** JSON; neobsahuje XTB, vstupenky, pohledávky ani čísla dokladů/pojistných smluv
- nové **Data Quality Center** hlídá chybějící částky, termíny, expirace, smluvní okna, nouzové kontakty, servisní mezery a stáří přenosné zálohy
- **Ctrl+K Search Everything 2.0** umí kromě hledání i pravidlové odpovědi nad vlastními daty: termíny do N dní, roční pojistné, auto/dům, data quality, dnešní priority, životní náklady a bezpečný investiční prostor
- uživatelské označení **Renewal Radar** nahrazeno běžným `Smlouvy k prověření`
- Autopilot je napojen do hlavního render cyklu; nová centrální vrstva nepoužívá MutationObserver polling
- Cloud conflict summary, preflight a Backup Guard nově počítají Personal Inbox a Asset Book
- schema zvýšeno pouze aditivně na **v39**; Supabase URL/key/tabulky a legacy storage klíče zůstávají beze změny
- nový static QA 28.0, integrační coverage, Autopilot engine test, Scenario Lab test a release gate
