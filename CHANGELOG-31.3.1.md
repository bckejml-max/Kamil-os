# Kamil OS 31.3.1 — Canonical Auth Hotfix

## Oprava
- Kamil OS rozpozná staré Vercel deployment hosty a přesměruje je na `https://kamil-os-smoke.vercel.app`.
- Přesměrování zachová `pathname`, query parametry i URL hash, tedy i Supabase auth/recovery tokeny.
- Kanonická produkční adresa se sama nepřesměrovává; localhost/127.0.0.1 zůstává pro QA beze změny.
- Magic link dál používá `emailRedirectTo` na kanonickou adresu a `shouldCreateUser: false`.

## Důvod
Auth logy ukázaly, že login proběhl přes starý immutable Vercel deployment host. Tento hotfix brání tomu, aby nové deployment odkazy nebo staré směrování znovu rozdělily session mezi více originů.

## Omezení
Pokud Supabase e-mailová šablona používá přímo projektový `SiteURL` namísto `RedirectTo`, je potřeba opravit i Auth URL Configuration / šablonu v Supabase. Aplikační guard je druhá ochranná vrstva, ne náhrada chybného projektového Site URL.

## QA
- canonical redirect unit test
- preservation query/hash auth parametrů
- statický security gate
- plný legacy regression suite
- release gate 31.3.1
