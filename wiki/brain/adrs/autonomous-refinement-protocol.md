---
kind: decision
status: accepted
confidence: low
enola_intent:
  page:
    type: decision
    status: accepted
---

# ADR — Autonomous refinement protocol for pi-brain

## Context

The `regenerative-intent` epic calls for autonomous mode to feel like a colleague that continuously refines the shared understanding. The current `smarter-autonomy.md` ADR allows only low-risk maintenance silently (auto-groom, `brain_sync`, low-risk observations into `ai-suggestions/`). It does not define a structured protocol for what the agent should do when idle and no user task is pending.

We need a decision on:
- How the agent detects "idle and safe to refine."
- What it is allowed to do during that time.
- Where its output goes.
- What guardrails prevent it from crossing into commitment-class work.

## Decision

pi-brain will implement an **autonomous refinement protocol** that runs opportunistically inside a session when autonomy is ON and the agent is idle. It is strictly read-only and suggestive: it produces `ai-suggestions/` drafts or inbox items, never approved artifacts or commits.

### Detection

- Hook `agent_settled` in the pi-brain extension.
- Check autonomy state (`wiki/_state/autonomy.json`).
- Check `ctx.isIdle()` to ensure no agent run is active.
- Skip if the last turn was already a refinement-triggered turn (avoid loops).
- Skip if the last user message was a direct command/question.

### Allowed work

The protocol may:
- Inspect `sources/`, `wiki/`, `log/`, and inbox.
- Run existing validation (`brain_validate`, `brain_links`) and report findings.
- Perform shallow deepdives on configured target repos.
- Draft suggestions in `wiki/<scope>/ai-suggestions/{adrs,prds}/`.
- Capture tasks/questions in `wiki/_state/inbox.md`.

The protocol must NOT:
- Edit approved shelves (`prds/`, `adrs/`, `bets/`, `records/`, `constraints/`).
- Create local or remote commits.
- Run structural/repo changes.
- Auto-apply generated code.
- Approve or graduate AI suggestions.

### Output handling

- Suggestions follow the existing `ai-suggestion: true` banner/template convention.
- Inbox items use the existing inbox format.
- Each output cites the source(s) that motivated it.

### Rate limiting

- One refinement scan per idle window.
- Cap the number of suggestions produced per scan (e.g., 3–5).
- Cap deepdive file count and depth.

## Alternatives considered

1. **Do nothing.** Keep auto mode reactive only.
   - *Rejected:* does not deliver the "colleague" feeling users want.

2. **Background scheduled LLM runs.** Run refinement on a timer outside the session.
   - *Rejected:* revisits the rejected alternative in `smarter-autonomy.md`; requires a scheduler/process model not yet designed.

3. **Trigger refinement after every tool result.** Run checks continuously during turns.
   - *Rejected:* too noisy, wastes tokens, and interferes with active user work.

4. **Opportunistic idle refinement inside the session.** (Chosen.)
   - *Pros:* uses existing hooks, no new scheduler, respects session boundaries, easy to inspect and disable.
   - *Cons:* only runs while a pi session is open; does not work when pi is not running.

## Consequences

- Auto mode becomes meaningfully proactive without removing human control.
- The boundary between low-risk suggestions and commitment-class work stays clear.
- Future child bets (background task runner, multi-agent collaboration) can build on this protocol.
- Users may see more inbox/ai-suggestions activity; rate limiting and batching are important.

## Related

- [wiki/brain/prds/autonomous-refinement-protocol.md](../prds/autonomous-refinement-protocol.md)
- [wiki/brain/bets/autonomous-refinement-protocol.md](../bets/autonomous-refinement-protocol.md)
- [wiki/brain/epics/regenerative-intent.md](../epics/regenerative-intent.md)
- [wiki/brain/adrs/smarter-autonomy.md](../adrs/smarter-autonomy.md)
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- [wiki/brain/constraints/explicit-approval-for-commits.md](../constraints/explicit-approval-for-commits.md)

## Amendments

### 2026-10-22: refinement runs are not user prompts to the before_agent_start hook

The direction is unchanged; a host release changed what the hook sees. Since pi 1.2.0 (verified against 1.4.0), `before_agent_start` also fires for a run started by `pi.sendMessage` with `triggerTurn`, which is how the protocol starts its scan from the `agent_settled` hook. The event is a union on `messageType`: user prompts carry `prompt`, custom messages carry the starting `message`.

Left unguarded, the brain's `before_agent_start` handler would append the autonomy prompt to the refinement run and would hand the one-shot intent-debt accounting and the session briefing to the refinement run instead of the next user prompt. The decision is that the handler skips a run whose `messageType` is `"custom"` (so an older host that sends no `messageType` behaves as before) and returns an empty result for a custom run, so a refinement run carries exactly what it carried before pi 1.2.0.

Measured line: `tests/lifecycle-hooks.test.ts` fails on the unguarded handler (a custom-message event consumes the intent debt and the briefing) and passes on the guarded one; pi 1.4.0 is the verified host version.
