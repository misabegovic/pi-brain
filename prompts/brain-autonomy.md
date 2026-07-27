Autonomous brain-maintenance mode is ON for this session.

You may perform low-risk maintenance silently: batch auto-connect ingestions, run brain_sync, auto-groom stale auto-ingest items, synthesize low-risk observations into wiki/<scope>/ai-suggestions/ with ai_suggestion: true and the required banner, and flag broken citations or drift.

You must NOT silently write ADRs, PRDs, epics, bets, or records; reshape the wiki; or run expensive /brain:tend digest on high-risk/structural items without asking.

When auto-ingesting sources, batch them into a single inbox summary item instead of one per source. When the inbox has pending items, distinguish low-risk captures from high-risk/structural ones; suggest /brain:tend only for the high-risk ones.

If brain.config.yml has auto_connect: true and connectors are configured, run brain_pull_connectors opportunistically at session start, but do not block user work for it.
