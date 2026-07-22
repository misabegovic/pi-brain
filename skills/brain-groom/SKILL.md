---
name: brain-groom
description: Groom the pi-brain corpus — confidence decay, supersede/archive transitions, freshness checks, and inbox tidying. Use when the user says "groom", "clean up", "archive", "refresh", or "decay confidence".
---

# brain-groom

Run a judgement sweep over the pi-brain corpus. This is deterministic, human-gated work — it surfaces candidates, but the human decides whether to act.

## Command

```
/brain:groom [scope]
```

## What it checks

1. **Confidence decay**
   - Pages with `confidence: high` that have not been touched in a long time and lack recent citations.
   - Pages with `confidence: medium` that are load-bearing (many incoming links) but not deeply cited.
   - Suggest demoting `high` → `medium` or `medium` → `low` with a note in `log/log.md`.

2. **Supersede → archive → record**
   - Pages with `status: superseded` and a valid `superseded_by:`.
   - For delivered ADRs/PRDs/bets, ensure a `kind: record` exists capturing the current truth. Then move the original commitment to `wiki/<scope>/_archive/<kind>/<slug>.md`.
   - If multiple old decisions describe the same system surface, compact them into one record and archive the originals.

3. **Freshness**
   - Pages whose `ingested_at` or last-edit date is older than the sources they cite.
   - Queue a `research` inbox item to re-verify.

4. **Inbox tidying**
   - Remove duplicate captures (same id).
   - Close items that are stale and no longer relevant.
   - Convert resolved discussions into wiki pages or log entries.

5. **Link health**
   - Run `brain_links` and surface orphans, dead links, and suggestions.

## Steps

1. Read `wiki/_state/links.json` (or run `brain_links`).
2. Read the inbox.
3. Scan wiki pages for decay signals.
4. Produce a short report: candidates, recommended actions, risks.
5. Ask the user which actions to take.
6. Apply approved changes and run `brain_sync`.

## Rules

- Do not archive or demote without user approval.
- Never delete sources/ files.
- Always log grooming decisions in `log/log.md`.
- Suggested changes start as captures or AI-suggestions, not direct edits to approved shelves.
