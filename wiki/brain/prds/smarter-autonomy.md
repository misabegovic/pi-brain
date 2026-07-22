---
kind: initiative
status: living
confidence: low
appetite: medium
team: pi-brain
repos: [pi-brain]
---

# PRD — Smarter autonomy for pi-brain clones

## Problem

When autonomy is ON, pi-brain agents should feel helpful and hands-off. Right now they can be either too noisy (auto-connect dumping 20 inbox items) or too passive (waiting for explicit approval before every small maintenance task). Users want the agent to handle the unimportant stuff quietly while staying clearly gated on structural or expensive work.

The user put it this way: *"I just want to feel like it's as hands off as possible and we nudge the agent to actually do stuff that is important in the auto mode."*

## Appetite

Medium. Redesign autonomy to be quieter and more useful, without rebuilding it as a background scheduler or removing human gates.

## Solution

### 1. Quiet auto-connect

When `auto_connect: true` triggers a connector run, the agent creates **one** inbox item summarizing the batch:

> "Auto-connect ingested 17 sources (workflows, Gemfiles, wiki pages, GitHub Actions run). Review at `sources/auto-connect/2026-07-22/`. Run `/brain:tend` to synthesize, or `/brain:groom` to archive if stale."

Individual sources are still timestamped in `sources/`, but they do not each generate inbox noise.

### 2. Auto-groom

Without asking, the agent may:
- Run `brain_sync` after auto-captures or auto-ingests.
- Archive auto-connect batches older than 7 days that have not been tended or referenced.
- Compact consecutive capture-only inbox items from the same session into a single summary entry.

### 3. Smart tend

For low-risk inbox items (auto-ingests, captures, minor observations), the agent may synthesize a short summary under `wiki/<scope>/ai-suggestions/` with `ai_suggestion: true` and a banner. It does **not** move anything to approved shelves.

High-risk items — anything touching constraints, ADRs, structural changes, or user-confirmed incidents — stay in the inbox and require explicit `/brain:tend` or `/brain:shape`.

### 4. Brain identity prompt

In auto mode, the session-start prompt explicitly reminds the agent:
- This is a pi-brain clone; the brain home is `<path>`.
- Read `AGENTS.md` and follow its contract.
- Structural/repo changes require `/brain:shape` and an accepted ADR.
- Low-risk maintenance may happen silently; high-risk work must pause for approval.

### 5. Nudge on important stuff

The agent should proactively flag:
- `wiki/` pages that cite missing sources or have broken links.
- Inbox items older than N days that look like decisions or risks.
- A detected drift between `wiki/` claims and `sources/` snapshots.

These are surfaced as concise inbox captures or direct messages, not silent edits.

## No-gos

- No silent writing of ADRs, PRDs, epics, or bets.
- No silent reshaping of approved wiki pages.
- No silent `/brain:tend` digest that synthesizes high-risk or structural material.
- No background LLM runs; all auto work happens opportunistically during active sessions.

## Rabbit holes

- **Auto-groom removing something important.** Time-based archive should apply only to auto-connect batches and only if untouched.
- **Smart tend becoming too ambitious.** Low-risk synthesis must stay in `ai-suggestions/` and must not self-promote to approved shelves.
- **Too many autonomy levels.** Start with ON/OFF; add sub-levels only if users ask.

## Related

- [wiki/brain/adrs/smarter-autonomy.md](../adrs/smarter-autonomy.md)
- [wiki/brain/bets/smarter-autonomy.md](../bets/smarter-autonomy.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- [skills/brain-auto/SKILL.md](../../../../skills/brain-auto/SKILL.md)
