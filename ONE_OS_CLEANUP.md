# One OS cleanup architecture

Kamil OS uses exactly five GitHub Actions workflows. `repo_hygiene_guard.mjs` enforces this inventory and fails the release if another workflow is added without an explicit architecture change.

## Canonical pipelines

- `os333-browser.yml` — canonical release chain, syntax, migrated legacy guards, performance checks and browser smoke.
- `qa.yml` — deep ticket/data integrity regression suite.
- `os1047-control-operations.yml` — unified Control Plane + Control Operations contracts and browser smoke.
- `vercel-production-333.yml` — production validation, deployment and real POST smoke for Gmail sync.
- `desktop.yml` — Windows desktop build/publish; intentionally separate because it runs on Windows and publishes installer artifacts.

## Rules

1. A new feature does not get a new workflow by default. Add its static guard to `npm run test:release`, browser coverage to OS333, or deep data coverage to `qa.yml`.
2. Provider health must distinguish configured from verified/healthy state. `provider_health_contract_guard.mjs` protects this rule.
3. Serverless API code must not use legacy `req.query`, `url.parse()` or the `querystring` module. `api_runtime_guard.mjs` protects this rule.
4. Production deploys must execute real endpoint smoke tests, not only build successfully.
5. Historical guard files may remain as compatibility tests, but their orchestration belongs to the canonical pipelines above.
6. Runtime timer/listener counts are reported by `repo_hygiene_guard.mjs` on every release to make boot growth visible.
7. Any future workflow split requires a concrete platform/runtime reason comparable to the Windows desktop build; historical OS numbering is not a reason.

## Cleanup result

The September 2026 cleanup migrated the coverage from Assistant 53, Command 50, Core70, Performance 41.3, Personal/Home, Betting 691/692, Today 696/697, Operator 717, Truth 737/738, Strategy 788–790, Copilot 840–842, Self-Improving 892, Proposal 943–946, Visual 947, One OS 967/977, Legacy Cleanup 987 and Control Plane 1037 into the five canonical pipelines.
