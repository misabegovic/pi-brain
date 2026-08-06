---
kind: epic
status: accepted
confidence: low
appetite: big
sources:
  - sources/web/2026-07-28--aicoding-leaflet-pub.md
enola_intent:
  page:
    type: epic
    status: accepted
    anchors:
    - repo: pi-brain
      path: sources/web/2026-07-28--aicoding-leaflet-pub.md
---

# Epic — Regenerative pi-brain: intent as the living substrate for code and collaboration

> This epic describes a major evolution of pi-brain from an intent store into a regenerative, collaborative system. It revisits several accepted ADRs and constraints, so child bets must each produce their own ADRs before implementation.

## Narrative

pi-brain currently stores intent in `wiki/<scope>/{prds,adrs,bets,records,pitches}/` and `constraints/`, but that intent is largely static prose. The agent does not reliably:

- generate or update code from approved intent,
- maintain intent itself as sources and code evolve,
- detect drift between intent and reality,
- work proactively in autonomous mode, or
- collaborate with other agents and humans on the same intent artifacts.

The vision is to make intent the living substrate of the project. Approved intent becomes the primary artifact from which code can be regenerated. Unapproved or stale intent is continuously refined by agents in collaboration with humans. Autonomous mode feels like having a colleague who is always tidying, questioning, and improving the shared understanding — but who still stops at commitment gates.

## Success criteria

- Any approved intent artifact can carry structured, machine-readable blocks.
- The agent can generate or update code in a target repo from approved intent via `/brain:build`.
- The agent can detect and surface drift between intent and code via `/brain:diff`.
- The agent can propose updates to existing intent artifacts, not just create new ones.
- In autonomous mode, the agent runs a safe refinement protocol when no user task is active.
- Multi-agent collaboration on intent artifacts is supported and recorded.
- Background tasks can be scheduled, resumed, and inspected safely.
- All structural changes under this epic still pass the `adr-before-structural-changes` gate.

## Anticipated children

Likely PRDs/ADRs/bets that will spawn from this epic:

1. **Structured intent format** — a machine-readable block format for PRDs, ADRs, bets, records, and constraints.
2. **`/brain:build`** — generate or update code from approved intent.
3. **`/brain:diff` and `/brain:sync-code`** — detect and reconcile intent-to-code drift.
4. **Agent-maintained intent** — propose expansions and revisions to existing artifacts instead of always creating new ones.
5. **Autonomous refinement protocol** — what the agent does in idle auto mode: gap scans, drift checks, KISS/YAGNI audits, performance smell checks.
6. **Autonomous colleague mode** — revisit `wiki/brain/adrs/smarter-autonomy.md` to allow human-out-of-the-loop safe operations with clear trust levels.
7. **Background task runner** — revisit the rejection of background scheduled LLM runs; design persistence, queueing, and safe execution.
8. **Multi-agent RFC collaboration** — living RFCs with asynchronous agent contributions and recorded ownership.
9. **Extension research** — study pi extension patterns for background tasks, events, and cross-agent coordination.

## Risks

- Reverses or amends accepted ADRs (`smarter-autonomy.md`, `local-first-brain-self-maintenance.md`, `explicit-approval-for-commits.md`). Each amendment needs its own ADR.
- Background tasks and human-out-of-the-loop operations are trust-sensitive; badly scoped autonomy could reintroduce the "eager implementation" failure mode that `wiki/brain/adrs/stronger-default-implementation-guardrails.md` was designed to prevent.
- Machine-readable intent blocks risk becoming a burden if they are too verbose or too rigid.
- Multi-agent collaboration can create confusion about authority and version history if not recorded carefully.
- Over-eager suggestion generation could flood `ai-suggestions/` and the inbox; the protocol must follow KISS/YAGNI and prefer updating existing artifacts over creating new ones.

## Principles

- **KISS / YAGNI.** The agent should prefer simplifying, deleting, or ignoring speculative work over adding it.
- **Update existing before creating new.** AI suggestions should first check for related approved or draft artifacts and propose revisions to them.
- **Commitment gates remain.** Structural/repo changes, remote promotion, and approval of ADRs/PRDs/bets still require explicit human approval.
- **Traceability.** Generated code cites intent; intent records what it generated.
- **Safe autonomy.** Human-out-of-the-loop is allowed only for pre-defined safe operations; everything else becomes an inbox item.

## Research notes

Research into the pi coding-agent extension surface shows that most of the building blocks for this epic exist, but background scheduling and true autonomous wake-up require careful design.

### Relevant pi extension capabilities

- **Lifecycle hooks:** `session_start`, `session_shutdown`, `agent_start`, `agent_end`, `agent_settled`, `turn_end`, `before_agent_start`, `tool_call`, `tool_result`, `context`.
- **Programmatic turns:** `pi.sendUserMessage()` and `pi.sendMessage(..., { triggerTurn: true })` let an extension initiate an agent turn.
- **Idle detection:** `ctx.isIdle()` and `ctx.waitForIdle()` let an extension know when no agent run is active.
- **Cross-extension signaling:** `pi.events` / `createEventBus()` supports pub/sub between extensions.
- **Session state persistence:** `pi.appendEntry()` can store custom state (e.g., todo lists, running tasks) in the session file.
- **Context handoff:** `ctx.newSession()` and `ctx.fork()` support moving accumulated context to a fresh session.

(pi extension docs: `/home/muhamed/.nvm/versions/node/v22.22.2/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md`)

### Relevant pi examples

| Example | What it shows | Relevance to this epic |
|---|---|---|
| `subagent/` | Spawns separate `pi` subprocesses with isolated contexts; defines agents as markdown files; supports single, parallel, and chain modes. | Direct model for multi-agent collaboration on intent artifacts. (pi example: `examples/extensions/subagent/index.ts`) |
| `file-trigger.ts` | Watches a trigger file and injects its contents as a new agent turn. | Simple pattern for waking the agent from an external scheduler or background job. (pi example: `examples/extensions/file-trigger.ts`) |
| `event-bus.ts` | Cross-extension event emission and listening. | pi-brain already uses `pi.events`; this could carry background-task status and intent-update notifications. (pi example: `examples/extensions/event-bus.ts`) |
| `auto-commit-on-exit.ts` | Commits changes during `session_shutdown` without asking. | Shows human-out-of-the-loop side effects at session boundaries, which is relevant for autonomous colleague mode. (pi example: `examples/extensions/auto-commit-on-exit.ts`) |
| `send-user-message.ts` | Programmatically sends user/steer/follow-up messages. | Useful for the autonomous refinement protocol to queue work. (pi example: `examples/extensions/send-user-message.ts`) |
| `handoff.ts` | Summarizes conversation context and opens a new focused session. | Useful when long-running intent work exhausts context. (pi example: `examples/extensions/handoff.ts`) |
| `plan-mode/` | Stateful mode with persisted todo list and tool restrictions. | Good reference for tracking autonomous refinement tasks across turns/resumes. (pi example: `examples/extensions/plan-mode/index.ts`) |

### Gaps

- **No native background scheduler.** Pi is session-based and turn-driven. The docs explicitly warn against starting timers, watchers, or background processes from the extension factory. Background work must either be triggered externally (file trigger, cron), run in a detached subprocess, or happen opportunistically during idle time inside a session (`agent_settled` + `isIdle()`).
- **No automatic wake-after-idle.** An extension cannot make pi start a new turn without some external stimulus or a previous user/extension action.
- **Human-out-of-the-loop requires trust boundaries.** We can mirror `auto-commit-on-exit.ts` for pre-approved safe operations, but structural/repo changes must still go through the `adr-before-structural-changes` gate.

### Implications for child bets

1. **Autonomous refinement protocol** can be built now with existing hooks and output to inbox/`ai-suggestions/`.
2. **Multi-agent collaboration** should adopt the `subagent/` pattern, with pi-brain-specific agents stored under `personas/agents/` or `.pi/agents/`.
3. **Background task runner** needs its own ADR choosing between file-trigger + external scheduler, detached subprocesses, or event-bus signaling.
4. **Structured intent format** becomes easier once subagents can produce and consume machine-readable blocks.

## Related

### Child bets under this epic

- [Bet — Autonomous refinement protocol](../bets/autonomous-refinement-protocol.md) | [PRD](../prds/autonomous-refinement-protocol.md) | [ADR](../adrs/autonomous-refinement-protocol.md)
- [Bet — Multi-agent intent collaboration](../bets/multi-agent-intent-collaboration.md) | [PRD](../prds/multi-agent-intent-collaboration.md) | [ADR](../adrs/multi-agent-intent-collaboration.md)
- [Bet — Structured intent and build](../bets/structured-intent-and-build.md) | [PRD](../prds/structured-intent-and-build.md) | [ADR](../adrs/structured-intent-and-build.md)
- [Bet — `/brain:diff` drift detection](../bets/brain-diff-drift-detection.md) | [PRD](../prds/brain-diff-drift-detection.md) | [ADR](../adrs/brain-diff-drift-detection.md)
- [Bet — Agent-maintained intent](../bets/agent-maintained-intent.md) | [PRD](../prds/agent-maintained-intent.md) | [ADR](../adrs/agent-maintained-intent.md)
- [Bet — Autonomous colleague mode](../bets/autonomous-colleague-mode.md) | [PRD](../prds/autonomous-colleague-mode.md) | [ADR](../adrs/autonomous-colleague-mode.md)
- [Bet — Background task runner](../bets/background-task-runner.md) | [PRD](../prds/background-task-runner.md) | [ADR](../adrs/background-task-runner.md)
- [Bet — `/brain:sync-code` reconciliation](../bets/brain-sync-code.md) | [PRD](../prds/brain-sync-code.md) | [ADR](../adrs/brain-sync-code.md)
- [Bet — Multi-agent RFC collaboration](../bets/multi-agent-rfc-collaboration.md) | [PRD](../prds/multi-agent-rfc-collaboration.md) | [ADR](../adrs/multi-agent-rfc-collaboration.md)

### Context

- (source: sources/web/2026-07-28--aicoding-leaflet-pub.md) — external source on spec-driven AI coding; content could not be fetched automatically.
- [wiki/brain/adrs/smarter-autonomy.md](../adrs/smarter-autonomy.md) — current autonomy boundary; this epic revisits it.
- [wiki/brain/adrs/local-first-brain-self-maintenance.md](../adrs/local-first-brain-self-maintenance.md) — current local-first commit rules; may need amendment.
- [wiki/brain/adrs/stronger-default-implementation-guardrails.md](../adrs/stronger-default-implementation-guardrails.md) — guardrails this epic must preserve.
- [wiki/brain/constraints/adr-before-structural-changes.md](../constraints/adr-before-structural-changes.md)
- [wiki/brain/constraints/explicit-approval-for-commits.md](../constraints/explicit-approval-for-commits.md)
- [wiki/brain/constraints/remote-promotion-requires-pr.md](../constraints/remote-promotion-requires-pr.md)
