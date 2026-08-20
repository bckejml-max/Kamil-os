# Kamil OS 29.1 — Personal Monthly Review

## 29.1.0

- **Měsíční review** je nový vstup přímo na Dnes. Hlavní obrazovka zůstává čistá; detail se otevře až po kliknutí.
- Review pracuje s aktuálním kalendářním měsícem a odděluje **co uzavřít / skutečný posun / změny uložených nákladů / dalších 31 dní**.
- Příspěvky do cílů se počítají jen ze skutečně uložených `contributions` a agregují se **po jednotlivých měnách**. CZK, EUR a USD se nikdy nesčítají do falešného společného součtu.
- Změny nákladů vznikají jen z reálné `priceHistory`. Různé periodicity nákladů se nesčítají a bez historie se žádná úspora ani zdražení nevymýšlí.
- Skutečný posun zahrnuje pouze doložené události v daném měsíci: zapsaný příspěvek do cíle, vyřešený Personal Inbox, vytvořený Backup Guard export nebo reálné snížení uložené ceny.
- Vrstva **Co uzavřít** propojuje Reminder Escalation, cíle, Capital Allocation, urgentní ticket zásobu, Personal Inbox, Backup Guard a Data Quality. Každá položka má bezpečný deep-link do správné osobní části.
- Pokud plánovaná investice přesahuje bezpečný prostor nad rezervou nebo existuje urgentní ticket zásoba, review to zvýrazní před novým nasazením kapitálu.
- Schema zůstává **v40**. Supabase URL, publishable key, tabulky a legacy localStorage klíče se nemění; nevzniká nová synchronizovaná datová struktura.
- Monthly Review nic automaticky neplatí, nepřevádí, neinvestuje, neobchoduje ani nenakupuje/prodává vstupenky.
- Přidán `js/monthlyReview29.js`, samostatný `monthly_review_29_test.mjs`, static QA coverage, GitHub Actions krok, PWA cache a verze **29.1.0**.
