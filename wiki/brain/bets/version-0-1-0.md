---
kind: bet
status: accepted
confidence: medium
appetite: small
adr: wiki/brain/adrs/versioning-and-releases.md
enola_intent:
  page:
    type: bet
    status: accepted
---

# Bet — Cut pi-brain v0.1.0

## What we are betting on

That tagging and releasing v0.1.0 now makes the current milestone usable and provides the version anchor needed for upstream template sync.

## Why now

The core contract (guardrails, autonomy, state preservation) is stable enough to ship. A release lets users pin to a version and lets us test the release workflow before adding more features.

## Appetite

Small. One release: tag, GitHub release notes, npm publish.

## Success looks like

- Git tag `v0.1.0` exists on `main`.
- GitHub release `v0.1.0` is published with release notes.
- npm package `pi-brain@0.1.0` is published (or the publish workflow is documented if credentials are not available).
- `package.json` version is updated to `0.1.0`.

### Signals to cut losses

- npm publish fails due to auth and cannot be resolved quickly.
- Release notes are too long or too vague.

## Related

- [ADR — Versioning and release strategy](../adrs/versioning-and-releases.md)
- `package.json`
