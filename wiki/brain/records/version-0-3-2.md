---
title: "Record — pi-brain v0.3.2 release"
scope: brain
kind: record
status: current
confidence: high
sources:
  - package.json
  - wiki/brain/adrs/versioning-and-releases.md
  - wiki/brain/records/tap-pi-extension-surface.md
  - wiki/brain/adrs/local-first-brain-self-maintenance.md
created: 2026-07-27
updated: 2026-07-27
author: pi-brain-agent
---

## Release

**pi-brain v0.3.2** was released on 2026-07-27.

- Git tag: [`v0.3.2`](https://github.com/misabegovic/pi-brain/releases/tag/v0.3.2)
- GitHub release: [pi-brain v0.3.2](https://github.com/misabegovic/pi-brain/releases/tag/v0.3.2)
- npm package: [`@misabegovic/pi-brain@0.3.2`](https://www.npmjs.com/package/@misabegovic/pi-brain/v/0.3.2)

## What's in v0.3.2

- **Extension surface initiative** — implemented all seven phases of [Record — Tap pi's full extension surface for pi-brain](tap-pi-extension-surface.md): compaction harvest, context injection, tool-result enrichment, entry renderers, shortcuts/flags, event bus, and session shutdown. Each phase is gated by a flag in `brain.config.yml`.
- **Local-first self-maintenance workflow** — recorded in [ADR — Local-first brain self-maintenance workflow](../adrs/local-first-brain-self-maintenance.md) and reflected in the updated `explicit-approval-for-commits` constraint.
- **`.env` ignored** — `.env` added to `.gitignore` so per-clone secrets stay local.

## Related

- [ADR — Versioning and release strategy](../adrs/versioning-and-releases.md)
- [Record — Tap pi's full extension surface for pi-brain](tap-pi-extension-surface.md)
- [ADR — Local-first brain self-maintenance workflow](../adrs/local-first-brain-self-maintenance.md)
- `package.json`
