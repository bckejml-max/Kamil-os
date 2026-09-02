const PULSE_BASE = 'https://api.pulsescore.net/api/chance';

function clampInt(value, fallback, min, max) {
  const n = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function cleanSport(value) {
  const sport = String(value || 'soccer').trim().toLowerCase();
  return /^[a-z0-9-]+$/.test(sport) ? sport : 'soccer';
}

function activeOnly(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const events = Array.isArray(payload.events) ? payload.events : Array.isArray(payload.data) ? payload.data : null;
  if (!events) return payload;

  const cleaned = events.map((event) => ({
    ...event,
    markets: Array.isArray(event.markets)
      ? event.markets
          .filter((market) => market?.isActive !== false)
          .map((market) => ({
            ...market,
            selections: Array.isArray(market.selections)
              ? market.selections.filter((selection) => selection?.isActive !== false && Number(selection?.odds) > 1)
              : market.selections,
          }))
          .filter((market) => !Array.isArray(market.selections) || market.selections.length > 0)
      : event.markets,
  }));

  return Array.isArray(payload.events)
    ? { ...payload, events: cleaned }
    : { ...payload, data: cleaned };
}

export default async function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  res.setHeader('content-type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  const apiKey = process.env.PULSESCORE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      error: 'PULSESCORE_NOT_CONFIGURED',
      action: 'Add PULSESCORE_API_KEY in Vercel Project Settings -> Environment Variables.',
    });
  }

  const sport = cleanSport(req.query?.sport);
  const mode = String(req.query?.mode || 'prematch').toLowerCase();
  const page = clampInt(req.query?.page, 1, 1, 10000);
  const limit = clampInt(req.query?.limit, 100, 1, 100);

  const target = mode === 'live'
    ? `${PULSE_BASE}/live-events?sport=${encodeURIComponent(sport)}&page=${page}&limit=${limit}`
    : `${PULSE_BASE}/${encodeURIComponent(sport)}/events?page=${page}&limit=${limit}`;

  try {
    const upstream = await fetch(target, {
      headers: {
        'X-Secret': apiKey,
        accept: 'application/json',
      },
    });

    const text = await upstream.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text.slice(0, 2000) };
    }

    if (!upstream.ok) {
      return res.status(upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502).json({
        ok: false,
        error: 'PULSESCORE_UPSTREAM_ERROR',
        status: upstream.status,
        details: payload,
      });
    }

    const cleaned = activeOnly(payload);
    const eventCount = Array.isArray(cleaned?.events)
      ? cleaned.events.length
      : Array.isArray(cleaned?.data)
        ? cleaned.data.length
        : null;

    return res.status(200).json({
      ok: true,
      bookmaker: 'chance',
      sport,
      mode,
      fetchedAt: new Date().toISOString(),
      eventCount,
      ...cleaned,
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: 'PULSESCORE_FETCH_FAILED',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
