# Football-Data count model

Independent count model for betting markets that can be derived from Football-Data match statistics.

Current metrics:
- corners (`HC`, `AC`)
- yellow cards (`HY`, `AY`)

Method:
- league home/away baselines
- recent venue-specific team samples
- prior shrinkage toward league means
- opponent attack/defence interaction
- Poisson probability on half-lines only

Safety:
- integer lines are not auto-modeled because push/refund EV requires separate handling
- red-card weighting and bookmaker card-point rules are not assumed
- market mapping must be verified against Chance canonical market names before production betting recommendations
