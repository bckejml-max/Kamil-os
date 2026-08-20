# Data Engine v3 32.1 — DB verification

Production Supabase table `public.kamil_os_history` was created before app cutover.

Verified properties:
- bucket CHECK: `decision / networth / ticket / trade / import`
- primary key: `(user_id, record_key)`
- RLS enabled
- SELECT/INSERT/UPDATE owner policies use `(select auth.uid()) = user_id`
- `anon` has no privileges
- `authenticated` has only SELECT/INSERT/UPDATE
- no client DELETE policy or DELETE grant
- supporting `(user_id, bucket, happened_at desc nulls last)` index exists

Supabase Security Advisor after the change reported no new Data Engine/RLS security finding. The only security warning remains account-level leaked-password protection disabled. Performance advisor did not report a Data Engine policy problem; the new index is naturally still marked unused before live traffic.

The main `kamil_os_state` remains authoritative in 32.1. No history is deleted from it in this release.
