# Log

Append-only operations log for this pi-brain instance.
- 2026-07-27: Drafted PRD — Embed pi-brain as default pi behaviour (wiki/brain/prds/embed-pi-brain-default-behaviour.md)
- 2026-07-27: Accepted ADR — Embed pi-brain as default pi behaviour (wiki/brain/adrs/embed-pi-brain-default-behaviour.md)
- 2026-07-27: Accepted bet — Embed pi-brain as default pi behaviour (wiki/brain/bets/embed-pi-brain-default-behaviour.md)
- 2026-07-27: Implemented all phases of "Embed pi-brain as default pi behaviour" — package-resolved resources, global install tiers, ungated weave, compaction harvest, loop-participation prototypes, docs, tests, and v0.3.0 structural split.
- 2026-07-27: Accepted ADR and implemented tool-wrapper policy — pi-brain overrides of basic pi tools must wrap, not replace, the base tool (wiki/brain/adrs/adr-pi-tool-wrapper-override.md, extensions/pi-brain/tool-wrapper.ts).
- 2026-07-27: Groomed inbox — removed 52 resolved/duplicate/noise items, kept auto-ingest batch for tending. Archived delivered bet to wiki/brain/_archive/bets/embed-pi-brain-default-behaviour.md (superseded by record).
- 2026-07-27: Fixed runtime error in extensions/pi-brain/hooks.ts: added missing imports countInboxItems (./utils.ts) and getPackageRoot (./resources.ts). Extension now loads and briefing fires.
- 2026-07-27: Decision recorded — aborted pi-brain → pi-mind rebrand; keep pi-brain name and use scoped npm package @misabegovic/pi-brain.
- 2026-07-27: Tended inbox — auto-ingest batch for sources/doc/2026-07-27--pi-brain-embed-plan-md.md was already synthesized into the Embed pi-brain default behaviour record; batch cleared and inbox emptied.
- 2026-07-27: Accepted ADR and implemented live status widget refresh — brain status widget re-renders after state-changing brain tools or direct edits to inbox/auto-ingest state files (wiki/brain/adrs/adr-live-status-widget-refresh.md, wiki/brain/records/live-status-widget-refresh.md, extensions/pi-brain/hooks.ts).
- 2026-07-27: Released pi-brain v0.3.0 — git tag, GitHub release, and npm package `@misabegovic/pi-brain@0.3.0` published. Record: wiki/brain/records/version-0-3-0.md.
