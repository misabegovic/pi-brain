---
kind: record
status: current
confidence: high
decided_by: wiki/brain/adrs/versioning-and-releases.md
implemented_in:
  - https://github.com/misabegovic/pi-brain/releases/tag/v0.1.0
---

# Record — pi-brain v0.1.0 release

## What this is

The current state of the pi-brain v0.1.0 release.

## Current truth

- Git tag `v0.1.0` exists on `main`.
- GitHub release `v0.1.0` is published at https://github.com/misabegovic/pi-brain/releases/tag/v0.1.0.
- `package.json` version is `0.1.0`.
- npm package `@misabegovic/pi-brain@0.1.0` was prepared. Initial publish attempts failed because the unscoped name `pi-brain` is already taken on npm by another package, and later because of 2FA requirements. The package is now configured as `@misabegovic/pi-brain` and ready to publish.

## Release contents

- Default guardrails against eager implementation.
- Smarter autonomy with batched auto-connect and brain identity prompt.
- `brain-state` runner that preserves custom content via markers.
- Shaped upstream template sync (pitch, PRD, ADR, bet).

## Origin

- Decision: [ADR — Versioning and release strategy](../adrs/versioning-and-releases.md)
- Commitment: [Bet — Cut pi-brain v0.1.0](../bets/version-0-1-0.md)

## Related

- [Record — Stronger default guardrails against eager implementation](stronger-default-implementation-guardrails.md)
- [Record — Smarter autonomy for pi-brain clones](smarter-autonomy.md)
- [Record — brain-state preserves custom content](brain-state-preserves-custom-content.md)
