---
title: Groom batch — close stale v0.4.0 inbox item, write v0.4.0/v0.5.0 records, bump template_version
description: The only open inbox item (v0.4.0 npm OTP pending) is stale — @misabegovic/pi-brain@0.5.0 is on the npm registry. Records stop at version-0-3-3 (no records for the shipped v0.4.0/v0.5.0 releases), and brain.config.yml still says template_version "v0.4.0" while the repo is tagged v0.5.0.
kind: refinement
status: closed
confidence: low
source: brain_status inbox, npm registry, git tags, brain.config.yml
sources:
  - wiki/_state/inbox.md
  - CHANGELOG.md
  - brain.config.yml
enola_intent:
  page:
    type: refinement
    status: closed
    anchors:
    - repo: pi-brain
      path: brain.config.yml
    - repo: pi-brain
      path: CHANGELOG.md
---

> Unreviewed ai-suggestion — promote only via /brain:tend.

# Groom batch — release bookkeeping drift

## Observation

Three pieces of release bookkeeping have drifted:

1. **Stale inbox item.** The only open inbox item says "v0.4.0 release prepared and tagged; GitHub release created. npm publish requires OTP — waiting for user." The npm registry now serves `@misabegovic/pi-brain@0.5.0` (checked 2026-09-14), so the OTP blocker is resolved or superseded — either way the item is done.
2. **Missing release records.** `wiki/brain/records/` stops at `version-0-3-3.md`; the shipped v0.4.0 (2026-08-01) and v0.5.0 (2026-08-31) releases have no records, despite the records discipline ("create or update the corresponding record" after each release). Commit `dafe0f2` ("record v0.4.0 release status") only touched `log/log.md` and the inbox.
3. **template_version drift.** `brain.config.yml` still carries `template_version: "v0.4.0"` while HEAD is tagged v0.5.0. `/brain:update` diffs from this field, so the 2026-09-14 update check compared v0.4.0→v0.5.0 and reported nothing to apply — the field should read v0.5.0 (set when v0.5.0 was released, or by the next successful update).

## Suggested change

1. Archive the inbox item under a 2026-09-14 heading noting npm 0.5.0 is live.
2. Write `version-0-4-0.md` and `version-0-5-0.md` records (the CHANGELOG sections are the source material; cite `CHANGELOG.md` and the git tags).
3. Bump `template_version` to `v0.5.0` — noting `brain.config.yml` is structural, so this lands via the normal approval path, not autonomously.

## Resolution

Closed 2026-09-14, all three items: the v0.4.0 inbox item was archived under `## Archived 2026-09-14`; `wiki/brain/records/version-0-4-0.md` and `wiki/brain/records/version-0-5-0.md` were written; `template_version` in `brain.config.yml` bumped to `"v0.5.0"`.

## Related

- wiki/_state/inbox.md — the stale item.
- CHANGELOG.md — 0.4.0 and 0.5.0 sections.
- wiki/brain/records/version-0-3-3.md — the last release record, format to follow.
- brain.config.yml — the drifted `template_version` field.
