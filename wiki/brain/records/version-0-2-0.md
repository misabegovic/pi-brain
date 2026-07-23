---
kind: record
status: current
confidence: high
decided_by: wiki/brain/adrs/versioning-and-releases.md
implemented_in:
  - https://github.com/misabegovic/pi-brain/releases/tag/v0.2.0
---

# Record — pi-brain v0.2.0 release

## What this is

The current state of the pi-brain v0.2.0 release.

## Current truth

- Git tag `v0.2.0` exists on `main`.
- GitHub release `v0.2.0` is published at https://github.com/misabegovic/pi-brain/releases/tag/v0.2.0.
- `package.json` version is `0.2.0`.
- npm package `@misabegovic/pi-brain@0.2.0` was prepared but requires the user's OTP to publish.

## Release contents

- `/brain:update` command for pulling upstream template updates into existing clones.
- `template_version` field in `brain.config.yml`.
- Plain-language shape requests default to `/brain:shape` forward mode.
- Smarter autonomy, brain-state preservation, and default guardrails from v0.1.0.

## Origin

- Decision: [ADR — Versioning and release strategy](../adrs/versioning-and-releases.md)
- Commitment: [Bet — Cut pi-brain v0.1.0](../bets/version-0-1-0.md)

## Related

- [Record — Upstream template sync](upstream-template-sync.md)
- [Record — Plain-language shape requests default to forward mode](plain-language-triggers-shape.md)
- [Record — Smarter autonomy for pi-brain clones](smarter-autonomy.md)
- [Record — brain-state preserves custom content](brain-state-preserves-custom-content.md)
