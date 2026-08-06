---
title: "Record — pi-brain v0.3.1 release"
scope: brain
kind: record
status: current
confidence: high
sources:
  - package.json
  - wiki/brain/adrs/versioning-and-releases.md
  - wiki/brain/records/extension-cleanup-resource-conflicts.md
  - wiki/brain/constraints/explicit-approval-for-commits.md
  - wiki/brain/constraints/remote-promotion-requires-pr.md
created: 2026-07-27
updated: 2026-07-27
author: pi-brain-agent
enola_intent:
  page:
    type: record
    status: current
    scope:
    - brain
    anchors:
    - repo: pi-brain
      path: package.json
    - repo: pi-brain
      path: wiki/brain/adrs/versioning-and-releases.md
    - repo: pi-brain
      path: wiki/brain/constraints/explicit-approval-for-commits.md
    - repo: pi-brain
      path: wiki/brain/constraints/remote-promotion-requires-pr.md
    - repo: pi-brain
      path: wiki/brain/records/extension-cleanup-resource-conflicts.md
---

## Release

**pi-brain v0.3.1** was released on 2026-07-27.

- Git tag: [`v0.3.1`](https://github.com/misabegovic/pi-brain/releases/tag/v0.3.1)
- GitHub release: [pi-brain v0.3.1](https://github.com/misabegovic/pi-brain/releases/tag/v0.3.1)
- npm package: [`@misabegovic/pi-brain@0.3.1`](https://www.npmjs.com/package/@misabegovic/pi-brain/v/0.3.1)

## What's in v0.3.1

- **Extension cleanup and split-layout fixes** — removed duplicate prompt/theme registration from the extension bootstrap, relocated template-update helpers so `/brain:update` resolves them correctly, fixed package-root detection for the new `extensions/pi-brain/` layout, and cleared dead imports/parameters across the extension. Recorded in [Record — Extension cleanup: remove duplicate resource registration and dead code](extension-cleanup-resource-conflicts.md).
- **Stronger workflow guardrails** — added two active `must` constraints:
  - [Constraint — Explicit approval required for commits](../constraints/explicit-approval-for-commits.md): no local commit may be created without explicit user approval in the same turn.
  - [Constraint — Remote promotion requires a pull request](../constraints/remote-promotion-requires-pr.md): promoting local commits to the remote origin must go through a PR unless branch protection prevents it or the user explicitly overrides.
- **Template version bump** — new clones created with `/brain:setup` and this repo's own `brain.config.yml` now report `template_version: "v0.3.1"`.

## Related

- [ADR — Versioning and release strategy](../adrs/versioning-and-releases.md)
- [Record — pi-brain v0.3.0 release](version-0-3-0.md)
- `package.json`
