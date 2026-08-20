# Mobile readiness notes

Kamil OS remains a browser/PWA application in 29.5, but new modules should keep domain logic independent from DOM/browser APIs so a future Capacitor shell can reuse the same engines.

Native-only concerns to isolate later: secure storage, file/photo picker, push notifications, background scheduling, auth deep links and app-store packaging.
