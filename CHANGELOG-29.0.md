# Kamil OS 29.0 — Personal Autopilot Complete

## 29.0.0

- **One Screen Today**: Udělej dnes / Pozor na peníze / Blíží se / Co se změnilo.
- **Onboarding & Data Quality Wizard** nabízí nejvýše tři konkrétní mezery z již uložených dat a volitelné kategorie nevydává za povinnost.
- **Personal Inbox intake** je připravený pro explicitně osobní kalendář a bezpečný Gmail intake; pracovní/marketingové/nejisté zprávy se vynechávají.
- **Reminder Escalation** převádí skutečné uložené termíny na PŘIPRAVIT / NAPLÁNOVAT / ŘEŠIT / TEĎ / PO TERMÍNU bez vydávání interních prahů za odbornou lhůtu.
- **Goals & Sinking Funds**: cíl, již odloženo, datum, měsíční příspěvek, potřebné tempo; měny se nesčítají a nic se automaticky nepřevádí.
- **Cost History** se skládá pouze při skutečné změně uložené částky; cloud sync / restore / bulk replace se za zdražení nepovažuje.
- **Life Change Feed** ukazuje skutečné auditní změny, historii cen a vyřešený Personal Inbox.
- **Maintenance Templates** nabízí checklist pro auto, technologie domu, spotřebiče a nemovitost, ale nevymýšlí servisní intervaly.
- **Document Import Assistant** analyzuje pouze uživatelem předaný text/textový soubor, navrhne typ/částku/data a po potvrzení uloží jen kandidáta do Personal Inboxu. Citlivé identifikátory se nevytěžují.
- **Sensitive Vault**: lokální AES-GCM + PBKDF2-SHA256, oddělený storage key, žádný Supabase sync ani Ctrl+K index. Hesla, PIN/CVV, seed/recovery fráze a privátní klíče jsou blokované. Vault má vlastní šifrovaný export/import.
- **Search Everything 29** hledá i cíle a odpovídá na dotazy o cílech, skutečných změnách cen, change feedu, eskalaci a prioritách onboardingu.
- **Schema v40** aditivně přidává pouze `personalGoals.items`; existující osobní i historická pracovní data zůstávají zachována.
- Supabase URL, publishable key, tabulky a legacy localStorage klíče zůstávají beze změny.
- PWA shell, manifest, offline cache, static QA, integration, release gate a samostatné 29/Vault testy jsou aktualizované.

## Bezpečnostní hranice
- Kamil OS nic automaticky neplatí, neruší, neobchoduje ani neposílá.
- True background push při úplně zavřené aplikaci stále vyžaduje serverovou push infrastrukturu.
- PDF/fotka bez textové vrstvy nemá v této statické PWA předstíraný OCR parser.
- Sensitive Vault není v běžné Kamil OS záloze; používá vlastní šifrovaný export.
