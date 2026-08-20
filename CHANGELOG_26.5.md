# Kamil OS 26.5 — Backup & Recovery Guard

## 26.5.0 — Safer portable backups and guarded restore
- nový **Backup & Recovery Guard** ve Více → Záloha ukazuje stáří poslední zálohy, velikost přenosného exportu a kontrolní otisk aktuálního stavu
- nové zálohy používají verzovaný obal `KAMIL_OS_BACKUP` s verzí formátu, verzí aplikace, schematem, časem exportu, kontrolním otiskem a datovým payloadem
- přenosná záloha zachovává uživatelská data, ale záměrně čistí interní `undo` snapshoty, které obsahují starší plné kopie stavu, zbytečně zvětšují export a mohou nést historické osobní hodnoty
- samotná runtime **Undo historie je nově kompaktní**: každý snapshot obsahuje stav bez další vnořené Undo historie, takže jednotlivé kroky Undo zůstávají zachované, ale snapshoty už se nerekurzivně nenabalují do sebe
- migrace při načtení současně zploští starší vnořené Undo snapshoty bez smazání top-level kroků Undo
- payload se před otiskem normalizuje přes skutečný JSON round-trip, takže kontrolní otisk odpovídá přesně tomu, co je staženo do souboru
- import nového formátu odmítne soubor, pokud kontrolní otisk nesedí; staré prosté JSON exporty zůstávají podporované
- backup s novějším neznámým schematem se zablokuje místo nebezpečného downgradu
- před každou potvrzenou obnovou se automaticky stáhne samostatný **safety backup** současného stavu
- metadata poslední zálohy/obnovy se ukládají jen do existujícího lokálního `META_KEY`; nevzniká nové cloudové schema ani nový storage key
- JSON záloha zůstává nešifrovaná a UI na to výslovně upozorňuje; kontrolní otisk je ochrana proti náhodné změně nebo poškození, ne kryptografický podpis
- přidán samostatný `backup_guard_test.mjs`, runtime release-gate kontrola kompaktní Undo historie, GitHub Actions krok, static QA pravidla a offline cache modulu
- schema zůstává **v38**; Supabase URL/key/tabulky a legacy localStorage klíče se nemění
