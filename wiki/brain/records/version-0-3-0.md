---
title: "Record — pi-brain v0.3.0 release"
scope: brain
kind: record
status: current
confidence: high
sources:
  - package.json
  - wiki/brain/adrs/versioning-and-releases.md
  - wiki/brain/adrs/adr-pi-tool-wrapper-override.md
  - wiki/brain/adrs/adr-live-status-widget-refresh.md
created: 2026-07-27
updated: 2026-07-27
author: pi-brain-agent
---

## Release

**pi-brain v0.3.0** was released on 2026-07-27.

- Git tag: [`v0.3.0`](https://github.com/misabegovic/pi-brain/releases/tag/v0.3.0)
- GitHub release: [pi-brain v0.3.0](https://github.com/misabegovic/pi-brain/releases/tag/v0.3.0)
- npm package: [`@misabegovic/pi-brain@0.3.0`](https://www.npmjs.com/package/@misabegovic/pi-brain/v/0.3.0) published.

## What's in v0.3.0

- **Tool-wrapper policy** — pi-brain overrides of basic pi tools must wrap, not replace, the base tool. Implemented in `extensions/pi-brain/tool-wrapper.ts` and dogfooded on `brain_capture`.
- **Live status widget refresh** — the brain-status widget re-renders automatically after state-changing brain tools or direct edits to `wiki/_state/inbox.md` / `wiki/_state/auto-ingest-batch.json`.
- **Grooming** — archived the delivered `embed-pi-brain-default-behaviour` bet and emptied a 53-item inbox backlog.

## Related

- [ADR — Versioning and release strategy](../adrs/versioning-and-releases.md)
- [ADR — Wrap, Don't Replace](../adrs/adr-pi-tool-wrapper-override.md)
- [ADR — Live-refresh the brain status widget](../adrs/adr-live-status-widget-refresh.md)
- `package.json`
