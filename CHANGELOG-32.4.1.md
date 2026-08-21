# Kamil OS 32.4.1

Runtime hardening hotfix for Market Edge server functions.

- SEC and public quote endpoints parse request query strings through the standard WHATWG `URL` / `URLSearchParams` API.
- Removes application reliance on framework `req.query` parsing in both new 32.4 server functions.
- Keeps all 32.4 Market Edge, XTB, ticket tuning, Recovery Shield and no-auto-trading contracts unchanged.
- PWA shell/version bumped to 32.4.1 so production diagnostics can distinguish the hotfix.
