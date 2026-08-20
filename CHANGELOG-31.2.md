# Kamil OS 31.2 — Data Recovery

## Problém
Kamil OS je local-first, takže nový browser nebo jiná doména může mít prázdný localStorage, i když osobní data existují v Supabase. Supabase session je navíc vázaná na origin; přihlášení na náhodné Vercel deployment URL se nepřenese na stabilní `kamil-os-smoke.vercel.app`.

## Co je nové
- prázdný lokální profil se už netváří jako kompletní dashboard
- recovery karta na Dnes: `Tvoje data nejsou na tomto zařízení.`
- klikací stav `Jen toto zařízení`
- passwordless připojení přes Supabase magic link
- magic link používá `shouldCreateUser: false`
- všechny auth/recovery redirecty míří na kanonickou produkční adresu `https://kamil-os-smoke.vercel.app/`
- volitelné přihlášení heslem zůstává
- poslední použitý cloudový e-mail se může lokálně předvyplnit; heslo se neukládá
- Supabase SDK zůstává lazy a na čistém local-first startu se nestahuje

## Bezpečnost
- schema zůstává 42
- RLS model se nemění
- žádný service-role/secret key v klientu
- magic link nevytváří nové uživatele
- prázdný browser nic automaticky nezapisuje do cloudu bez autentizace
- existující conflict resolution zůstává aktivní

## QA
- Profile Bootstrap unit test
- Cloud Recovery static/security test
- Chromium E2E: prázdný browser → recovery karta → passwordless auth view, stále bez eager Supabase requestu
- všechny předchozí decision/finance/ticket/admin testy zůstávají
- release gate 31.2
