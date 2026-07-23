---
name: brain-shape
description: The human-gated ADR/PRD authoring path for the current pi-brain clone. Use when the user says "shape", "write a PRD", "record a decision", "ADR for X", or when a pitch needs to become a commitment-class artifact in the wiki. Plain-language requests for PRDs/ADRs/epics/bets default to forward mode and write to the real shelves, not ai-suggestions/.
---

# brain-shape

You are inside a **pi-brain clone**. The work happens in this repository's own `wiki/`, `sources/`, and `log/` directories. This skill is the only path that writes to `wiki/<scope>/{prds,adrs,epics,pitches}/`.

## Modes

| Mode | Invocation | Output |
|------|------------|--------|
| **Forward** (default) | `/brain:shape <scope> <pitch>` | `wiki/<scope>/prds/<slug>.md` + `wiki/<scope>/adrs/<slug>.md` + `wiki/<scope>/bets/<slug>.md` |
| **Pitch** (pre-bet) | `/brain:shape <scope> --pitch <pitch>` | `wiki/<scope>/pitches/<slug>.md` |
| **Record-existing** | `/brain:shape <scope> --record <description>` | `wiki/<scope>/adrs/<slug>.md` only |
| **Epic** | `/brain:shape <scope> --epic <pitch>` | `wiki/<scope>/epics/<slug>.md` |
| **Bet** | `/brain:shape <scope> --bet <description>` | `wiki/<scope>/bets/<slug>.md` |
| **RFC pass** | add `--rfc` to forward mode | writes `wiki/<scope>/rfcs/<slug>.md` from `tools/templates/rfc.md` with multi-perspective input before Phase 2 |

`<scope>` is an active repo declared in `brain.config.yml`, or the meta-scopes `org` / `brain`.

## Decision policy — manual by default, structural first

`/brain:shape` is **manual by default** and is the correct path for any structural/repo change. Pause at every load-bearing decision and surface options + trade-offs; let the user pick. Do not pick silently.

If the user arrived at `/brain:shape` because they asked for a structural change, the agent has already done the right thing by stopping and routing here. Do not silently return to implementation mode.

Pauses include:

- Slug selection — propose 1–3 candidates.
- Appetite (`small` / `medium` / `big`).
- Affected user personas.
- Active constraints — load `wiki/<scope>/constraints/*.md` and flag any conflict with the proposed solution.
- No-gos and rabbit holes.
- Phase 2 alternatives + bet — generate ≥3 options plus "do nothing"; **do not pick the bet**.

`--auto` disables in-phase pauses (the agent picks and records reasoning visibly), but **phase-end approval gates always apply**.

## Confidence floor

Agent-authored synthesis starts at `confidence: low`. It cannot self-promote to `high` in the same change. Unsupervised agent drafts live under `wiki/<scope>/ai-suggestions/{adrs,prds}/` with the required banner and `ai_suggestion: true` frontmatter; human-approved artifacts live in the real shelves.

## Pre-flight

1. **Resolve the pi-brain home.** Use the current project root (the clone). `PI_BRAIN_HOME` or `.pi/brain-home` can override.
2. **Validate scope.** Read `brain.config.yml` and confirm `<scope>` is in `active_repos` or is `org`/`brain`.
3. **Choose a slug.** Kebab-case, ≤6 words, no numeric suffix. Check `wiki/<scope>/{prds,adrs,epics,pitches}/` for collisions.
4. **Deepdive.** The brain is repo-agnostic. If you need current repo evidence, use `/brain:deepdive <path> [question]` to read files transiently without copying them into `sources/`. Cite repo paths directly. Surface findings in the artifact prose, not a separate dump.
5. **Constraints.** Read `wiki/<scope>/constraints/*.md`. Note any active constraints that affect this pitch. If the proposed solution violates a `must` constraint, stop and resolve it with the user before drafting.
6. **Epic detection (forward only).** Ask if this pitch belongs to an existing epic in scope. Default = no.

## Promotion path

Knowledge moves from raw to committed to permanent through explicit human approval:

1. **Inbox / deepdive / pitch** — raw or pre-bet material.
2. **AI-suggested draft** — agent-authored, lives in `ai-suggestions/`.
3. **Draft commitment** — PRD/ADR/epic/bet under review in the real shelves.
4. **Accepted commitment** — status becomes `accepted`/`living` and confidence is bumped.
5. **Implementation** — the approved artifact authorizes changes to the project repo.
6. **Record** — once delivered, the current truth is captured in `wiki/<scope>/records/<slug>.md`. The original ADR/PRD may be archived or compacted into the record's history.

Never move a volatile draft to the commitment layer without the user explicitly approving it. Records are created after delivery, not before.

## AI-suggested drafts

When you author an ADR or PRD on your own initiative — including when `/brain:auto` is on — it is a **suggestion**, not a committed decision. You may NOT write directly to the human-approved shelves unless the user explicitly asks for a supervised `/brain:shape` and approves each phase.

Write suggestions to the separate `ai-suggestions/` shelf:

- `wiki/<scope>/ai-suggestions/prds/<slug>.md`
- `wiki/<scope>/ai-suggestions/adrs/<slug>.md`

Plain-language user requests such as "write a PRD for X", "ADR for Y", "shape this bet", or "turn this pitch into a PRD and ADR" are NOT ai-suggestions. They are supervised `/brain:shape` forward-mode requests and must be written to the real shelves with phase-end approval gates.

Use the AI-suggestion templates:

- `tools/templates/prd-ai-suggestion.md`
- `tools/templates/adr-ai-suggestion.md`

Required:

1. `ai_suggestion: true` in frontmatter.
2. The banner at the top of the page (verbatim from the template).
3. Inference language: "the repo state is consistent with…", "the prep notes suggest…"
4. An "Open questions for the human reviewer" section.

**Graduation** (human review → approved shelf):

1. Move the file from `ai-suggestions/{adrs,prds}/` to `{adrs,prds}/`.
2. Remove `ai_suggestion: true` and the banner.
3. Change `status:` from `suggested` to `accepted` (ADR) or `living` (PRD).
4. Bump `confidence:` as appropriate (typically `low` → `medium`).
5. Rewrite inference language to direct language.

## Phase 1 — PM agent (forward / pitch / epic)

Load `personas/agents/pm.md` and wear the PM hat for role-specific authoring.

If the work has security implications, also load `personas/agents/security-reviewer.md` and fold the security questions into the PRD.

PM framing:

1. One-sentence pitch framing.
2. Named user personas that own the need.
3. Appetite.
4. Fat-marker solution sketch.
5. No-gos and rabbit holes.

Before writing, surface the summary and ask for confirmation (unless `--auto`).

Create the page in the correct shelf using the matching template from `tools/templates/`:

- forward → copy `tools/templates/prd.md` → `wiki/<scope>/prds/<slug>.md` + ADR + bet + record (after delivery)
- pitch → copy `tools/templates/pitch.md` → `wiki/<scope>/pitches/<slug>.md`
- epic → copy `tools/templates/epic.md` → `wiki/<scope>/epics/<slug>.md`
- bet → copy `tools/templates/bet.md` → `wiki/<scope>/bets/<slug>.md`
- record → copy `tools/templates/record.md` → `wiki/<scope>/records/<slug>.md`
- constraint → copy `tools/templates/constraint.md` → `wiki/<scope>/constraints/<slug>.md`
- rfc → copy `tools/templates/rfc.md` → `wiki/<scope>/rfcs/<slug>.md`

Frontmatter (forward example):

```yaml
---
kind: initiative
status: draft
confidence: low
appetite: <small|medium|big>
team: <inferred>
repos: [<scope>]
---
```

Sections for a PRD:

- `# <title>`
- `## Problem`
- `## Appetite`
- `## Solution` (fat-marker)
- `## No-gos`
- `## Rabbit holes`
- `## Related` (links to ADRs, epics, sources)

If `--rfc` is set, create `wiki/<scope>/rfcs/<slug>.md` from `tools/templates/rfc.md` before Phase 2. This is the multi-perspective conversation artifact. Capture each persona's concerns and trade-offs in the RFC sections rather than switching personas in sequence.

Then:

- Run `brain_sync` (validate + regenerate views).
- Append to `log/log.md`.
- Stop for human approval before Phase 2.

## Phase 2 — Tech Lead agent (forward / record-existing)

Skip in pitch, epic, rfc, and bet modes.

Load `personas/agents/tech-lead.md` and wear the Tech Lead hat for role-specific authoring.

1. Identify the decision to be made.
2. Generate ≥3 alternatives + "do nothing" with trade-offs.
3. Let the user pick the bet.
4. Write `wiki/<scope>/adrs/<slug>.md` from `tools/templates/adr.md`.

The chosen alternative becomes the bet that Phase 3 commits to paper.

Frontmatter:

```yaml
---
kind: decision
status: accepted
confidence: low
---
```

Sections for an ADR:

- `# <title>`
- `## Context`
- `## Decision`
- `## Alternatives considered`
- `## Consequences`
- `## Related`

Then validate, regenerate views, log, and stop for human approval before merge/build.

## Phase 3 — Bet agent (forward only)

Skip in pitch, epic, record-existing, and bet modes.

1. Write `wiki/<scope>/bets/<slug>.md` from `tools/templates/bet.md`.
2. Link it to the PRD and ADR.
3. State the appetite, success criteria, and cancellation signals.

The bet is the commitment: it is what the team actually implements.

## Phase 4 — Developer agent (forward only, optional)

If the bet requires repo changes, work in the project code under the configured path. Keep the pi-brain clone and the project repo aligned. Do not start Phase 4 until the bet is approved.

## Phase 5 — Record keeper (after delivery)

Once the implementation is merged, capture the resulting current truth as a record:

1. Write `wiki/<scope>/records/<slug>.md` from `tools/templates/record.md`.
2. Link it to the PRD, ADR, and bet that produced it.
3. Update the original ADR/PRD status to `superseded` or `archived` and point it at the record.
4. Run `brain_sync` and `brain:groom`.

## Hard gates

These checks are not optional, even in `--auto` mode:

1. **Constraint gate.** Before accepting a PRD/ADR/epic/bet, read `wiki/<scope>/constraints/*.md`. The default `adr-before-structural-changes` constraint makes structural/repo changes a `must`. If the artifact violates a `must` constraint, stop, surface the exact conflict, and do not proceed until the user resolves it. If it violates a `should` constraint, record the exception and rationale in the artifact.
2. **Human approval gate.** Do not move AI-suggested drafts to approved shelves without explicit user approval.
3. **Record gate.** After a forward-mode bet is delivered, create or update `wiki/<scope>/records/<slug>.md`. If delivery hasn't happened yet, capture an inbox task to create the record after merge.
4. **Implementation gate.** Do not start Phase 4 (developer/implementation) until the ADR and bet are accepted and any `must` constraints are satisfied.

## Landing the work

Check the clone's `.env` for `LOCAL_FIRST=true`:

- **LOCAL_FIRST=true:** land each phase as a local commit on the current branch. Do not open PRs unless the user explicitly asks. Use commit titles like `<scope>: <verb> <description>` and reference the ADR/PRD/bet in the commit body.
- **LOCAL_FIRST=false:** open a PR per phase or per bet. Use `.github/pull_request_template.md`: a short natural-text summary plus inline links to the ADR/PRD/bet/record. Do not include sensitive data, session URLs, env vars, or internal system details.

### Decision-record ordering

- **External target repo:** the approved ADR/PRD/bet/record must already be pushed to the pi-brain clone's remote before opening the target-repo PR. The target-repo PR only references it.
- **Converted repo (brain maintains the code):** the decision record may be included in the same PR as the code change, since the brain and the codebase share a repo.

After merge, update the corresponding record in `wiki/<scope>/records/` and run `brain_sync`.

Always run `brain_sync` before declaring a phase done.

## Commands available

- `/brain:shape <scope> <pitch>` — forward mode
- `/brain:shape <scope> --pitch <pitch>` — pitch mode
- `/brain:shape <scope> --record <description>` — record existing decision
- `/brain:shape <scope> --epic <pitch>` — epic mode
- Append `--auto` to any mode to skip in-phase pauses.
