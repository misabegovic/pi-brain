---
kind: decision
status: accepted
confidence: low
---

# ADR — Smarter autonomy boundaries

## Context

Autonomy mode in pi-brain adds instructions to each agent turn but does not schedule background work. In practice it has been too noisy (auto-connect creating one inbox item per ingested source) and too passive (waiting for approval before low-risk maintenance). Users want it to feel hands-off on small things while staying clearly gated on structural or expensive work.

The default `adr-before-structural-changes` constraint already requires human approval for structural changes. The question here is what routine brain maintenance may happen silently when autonomy is ON.

## Decision

Autonomy ON allows silent, low-risk maintenance; autonomy OFF requires explicit commands for everything. The boundary is:

### Silently allowed

- Batching auto-connect ingestions into a single inbox summary item.
- Running `brain_sync` after captures or ingests.
- Auto-grooming stale auto-connect batches and compacting session capture noise.
- Synthesizing low-risk observations into `wiki/<scope>/ai-suggestions/` with the required banner and `ai_suggestion: true` frontmatter.
- Surfacing warnings about broken citations, stale inbox items, or wiki/source drift.

### Explicitly gated

- Writing or moving ADRs, PRDs, epics, bets, or records.
- Editing approved wiki pages outside of `ai-suggestions/`.
- Running the expensive `/brain:tend` digest on high-risk or structural items.
- Any structural/repo change.

### Mechanism

1. **Autonomy state** is read from `wiki/_state/autonomy.json` and injected into the session prompt.
2. **Brain identity prompt** is prepended in auto mode: remind the agent of the brain home, `AGENTS.md`, and the allowed/gated boundary.
3. **Risk classifier:** auto-ingests and captures are "low risk" by default; items mentioning constraints, ADRs, structural changes, or user-flagged incidents are "high risk" and stay gated.

## Alternatives considered

1. **Keep current autonomy.** One inbox item per auto-ingest, no silent maintenance.
   - *Rejected:* too noisy, does not feel hands-off.

2. **Let auto mode run full `/brain:tend`.** Allow silent synthesis of any inbox item.
   - *Rejected:* violates the user's trust boundary; structural or high-risk items could be silently committed.

3. **Background scheduled LLM runs.** Run maintenance on a timer.
   - *Rejected:* pi-brain is local-first and session-based; no background jobs.

4. **Smarter autonomy with explicit boundary.** (Chosen.) Low-risk maintenance silently, high-risk/structural explicitly gated.
   - *Pros:* matches user intent, preserves safety, reduces noise.
   - *Cons:* requires clear risk classification; edge cases will need judgment.

## Consequences

- Auto mode becomes genuinely useful for keeping the brain tidy.
- Users still control commitment-class artifacts.
- The extension and skills need to implement the risk classifier and brain identity prompt.
- Future edge cases will refine what counts as "low risk."

## Related

- [wiki/brain/prds/smarter-autonomy.md](../prds/smarter-autonomy.md)
- [wiki/brain/bets/smarter-autonomy.md](../bets/smarter-autonomy.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- [skills/brain-auto/SKILL.md](../../../../skills/brain-auto/SKILL.md)
