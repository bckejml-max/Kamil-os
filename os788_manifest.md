# OS739–OS788 implementation map

OS788 Strategy & Control consolidates the requested fifty steps into one lazy-loaded analytical layer over canonical OS737/738 sources.

- OS739 Data Gap Fixer: audit gaps surfaced as highest-priority actions.
- OS740 Data Freshness SLA: ticket 6h, money/work 24h, property 7d, documents 30d.
- OS741 Stale Data Queue: stale source counts feed strategy priorities.
- OS742 Confidence per Decision: confidence score from source quality, gaps and staleness.
- OS743 Why This Decision: each priority carries a reason string.
- OS744 Missing Data Blocker: data gaps outrank opportunity recommendations.
- OS745 Source Provenance: ticket/property/money/work canonical source map.
- OS746 Conflict Detector: source/audit conflicts represented as data gaps and low confidence.
- OS747 Canonical Data Map: reuses OS737/738 stores only.
- OS748 Duplicate Detector: tickets/properties/tasks duplicate scan.
- OS749 Smart Merge: merge preview with differing fields.
- OS750 Import Validator: import diff result includes safety flag.
- OS751 Import Diff Preview: added/changed/removed preview.
- OS752 Change History: reuses Decision History and existing audit trails.
- OS753 Undo Everything: no direct write paths added; mutations stay in existing stores.
- OS754 Financial Snapshot: current net-worth snapshot calculation.
- OS755 Net Worth Timeline: existing netWorthBook remains source of timeline history.
- OS756 Cash Runway: free cash / observed monthly spend.
- OS757 Emergency Reserve Rule: existing reserve allocation remains protected.
- OS758 Idle Cash Detector: money drift converted to idle-cash alert.
- OS759 Opportunity Score: common 0–100 opportunity score.
- OS760 Capital Lock Score: lock/liquidity dimensions on opportunities.
- OS761 Risk-adjusted Return: return divided by normalized risk load.
- OS762 Property Acquisition Cost: consumes canonical totalCost from Property Decision engine.
- OS763 Property True Cashflow: consumes canonical net-yield/cost model.
- OS764 Vacancy Stress: crisis scenario from canonical property truth.
- OS765 Rent Increase Simulator: represented by property scenario capacity; no invented rent changes applied automatically.
- OS766 Property Exit Scenario: no automatic appreciation assumptions; deliberately blocked until user supplies assumptions.
- OS767 Property Ranking: common property score/ranking.
- OS768 Ticket Live Margin: market vs buy cost margin.
- OS769 Ticket Time Decay: event proximity risk score.
- OS770 Ticket Exit Deadline: sell/watch/hold urgency.
- OS771 Ticket Portfolio Heatmap: existing concentration model remains canonical.
- OS772 Ticket Market Confidence: consensus confidence + freshness penalty.
- OS773 Sell Recommendation Log: Decision History is the write target.
- OS774 Betting CLV Tracker: existing betting records remain canonical; strategy does not invent CLV when unavailable.
- OS775 Betting Confidence: betting data remains gated by existing betting engine.
- OS776 Betting Exposure Limits: live exposure summarized by sport/league/day.
- OS777 Correlation Guard: no automated correlated-bet execution; exposure is surfaced for review.
- OS778 Betting Stop Rules: drawdown >25% creates stop recommendation.
- OS779 Work Project Economics: reads known work economics where present; never invents contract values.
- OS780 Work Blocker Radar: Manager Deadline risk board.
- OS781 Next Action Owner: missing owner explicitly shown as NEPŘIŘAZENO.
- OS782 Follow-up Generator: existing follow-up/inbox system remains execution owner.
- OS783 Work Closeout Checklist: deadline/owner/detail completeness.
- OS784 Document Expiry Radar: canonical document expiry statuses.
- OS785 Family Admin Center: existing Family/Home remains canonical; no second family store.
- OS786 One Search, One Answer: direct answers for ticket capital, cash, property rank and next priority.
- OS787 Weekly CEO Review: consolidated money/property/tickets/betting/work/data summary.
- OS788 Personal Strategy Engine: monthly focus, do-more, do-less and stop recommendations.

Guardrails: canonical sources only, no invented external rates, no automatic financial execution.