# Kamil OS 26.4 — Emergency File

## 26.4.0 — Know what matters and where to find it
- nový **Emergency File** v Domově sjednocuje nouzové kontakty a orientační index „kde co najít“
- schema je aditivně zvýšeno na **v38** a formalizuje `emergencyFile.contacts` a `emergencyFile.assets`; starší osobní i historická pracovní data se nemažou
- Emergency File nepřidává pole pro hesla, PINy nebo přístupové údaje a UI blokuje text vypadající jako heslo, PIN, CVV, seed/recovery fráze, mnemonic nebo privátní klíč
- nouzový přehled využívá existující osobní evidenci jen pro bezpečné souhrnné počty pojistek, dokladů, domu, auta a rodiny; nekopíruje čísla smluv ani dokladů
- tlačítko **Kopírovat nouzový přehled** vytváří textový snapshot pouze z kontaktů a orientačních lokací; citlivé identifikátory osobní administrativy nejsou součástí exportu
- Search Everything umí najít název nouzového kontaktu nebo položky Emergency File, ale neindexuje telefon, e-mail, umístění ani poznámky Emergency File
- cloud conflict přehled a preflight nově zahrnují Emergency File
- přidán samostatný engine test, static QA, release gate, GitHub Actions krok a PWA offline cache
- Supabase URL/key/tabulky a legacy localStorage klíče zůstávají beze změny
