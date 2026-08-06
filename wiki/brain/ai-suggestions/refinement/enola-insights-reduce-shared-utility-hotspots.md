---
title: Audit shared utility hotspots flagged by enola
description: Enola flagged extractSimpleYamlValue, readEnolaConfig, requireBrain, pathExists, and getMarkdownFiles as god classes / hotspots. Audit whether dependents can use more focused APIs or whether the utilities belong in more specific modules.
kind: refinement
status: closed
confidence: high
source: enola analysis of extensions/pi-brain
enola_intent:
  page:
    type: refinement
    status: closed
---

# Audit shared utility hotspots flagged by enola

## Observation

Latest enola analysis reports five functions with high fan-in (god classes / hotspots):

- `extractSimpleYamlValue` — 16 dependents
- `readEnolaConfig` — 11 dependents
- `requireBrain` — 11 dependents
- `pathExists` — 10 dependents
- `getMarkdownFiles` — 9 dependents

## Why it matters

High fan-in utilities are not inherently bad, but concentrated hotspots can hide coupling:
- A signature change ripples to many callers.
- The same utility may be doing too many things, attracting unrelated dependents.

## Suggested approach

1. **Review each function** for scope creep.
   - `getMarkdownFiles`: generic; likely fine, but ensure callers do not rely on side effects.
   - `extractSimpleYamlValue`: used by many config readers. Consider a typed config reader per domain so callers do not import a raw YAML helper.
   - `requireBrain`: central dependency. Consider whether a context-injection alternative can reduce direct calls.
   - `readEnolaConfig`: 11 dependents suggests enola config is consulted from many places. Verify each caller truly needs the full config or if a narrower helper would suffice.
   - `pathExists`: trivial; consider inlining or keeping as-is.

2. **Where appropriate**, introduce domain-specific wrappers so callers depend on a narrower API rather than the raw utility.

## Acceptance

- Each hotspot has a note explaining why it is or is not worth changing.
- Any extracted wrapper has matching unit tests.
- `npm run validate` passes and `brain_links` stays clean.
