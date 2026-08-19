# Real Cloud Audit — 22.3.1

Ověřeno proti produkčnímu Supabase projektu `Appka`.

## Produkční data
- `kamil_os_state`: 1 uživatelský stav
- současný cloud: 2 úkoly, 4 projekty, 8 ticket pozic, 5 dluhových položek
- ticket pole odpovídají novému workflow: buy, date, fees, listPrice, platform, qty, sell, transferStatus, workflow, payoutStatus…
- debt pole odpovídají novému workflow: amount, payments, lastContactAt, promisedAt, status…

## RLS
- `kamil_os_state`: SELECT / INSERT / UPDATE / DELETE pouze vlastní `auth.uid()`
- calendar/XTB cache: pouze přihlášený vlastník podle auth e-mailu
- veřejné EXECUTE oprávnění na `rls_auto_enable()` bylo odebráno
- po opravě bezpečnostní advisor hlásí už jen globální Auth volbu „Leaked Password Protection Disabled“

## Cloud hardening
Produkční `updated_at` měl pouze DEFAULT a při UPDATE nebyl garantovaně čerstvý.
Opraveno dvěma vrstvami:
1. klient 22.3.1 posílá explicitní `updated_at` a přečte serverovou hodnotu zpět;
2. produkční DB má BEFORE UPDATE trigger `kamil_os_state_set_updated_at`.

Tím je conflict guard založený na časech použitelný i při více zařízeních.
