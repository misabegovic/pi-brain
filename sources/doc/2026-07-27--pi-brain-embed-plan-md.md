---
kind: source
source_kind: doc
source_path: /home/muhamed/projects/pi-brain-embed-plan.md
ingested_at: 2026-07-27
summary: pi-brain embedding/vector search plan document.
---

# pi-brain-embed-plan.md

```
# Plan: Embed pi-brain as default pi behaviour

**Status:** draft · **Author:** planning session, 2026-07-24
**Repos:** `misabegovic/pi-brain` (all changes) · `misabegovic/pi` (no changes)

---

## Decision

**Do not fork the harness.** Every capability required — always-on availability,
system-prompt weaving, agent-loop participation, centrally-updated skills and
templates — is reachable through pi's documented extension API. A fork buys
nothing here and costs a permanent rebase liability against a repo with 5,000+
commits.

All work below happens in `pi-brain`. The diff against `earendil-works/pi`
stays empty.

### Evidence

| Requirement | Mechanism | Source |
|---|---|---|
| Load in every project | `~/.pi/agent/settings.json` via `pi install` | `docs/packages.md:43` |
| Ship skills/prompts/themes | `pi` manifest field in `package.json` | already present |
| Modify system prompt | `before_agent_start` → `{ systemPrompt }` | `docs/extensions.md:523` |
| Inspect loaded context | `event.systemPromptOptions` | `docs/extensions.md:536` |
| Per-turn message control | `context` event | `docs/extensions.md:648` |
| Intercept compaction | `session_before_compact` | `docs/extensions.md` lifecycle |
| Gate writes | `tool_call` (can block) | `docs/extensions.md:749` |
| Contribute resource paths | `resources_discover` | `docs/extensions.md:369` |
| Reduce tool-count tax | `pi.setActiveTools()` additive | `docs/extensions.md:2296` |

---

## Current state

`extensions/pi-brain.ts` — 1976 lines, single file.

- **17 tools**, **20 commands**, all registered unconditionally at init.
- Hooks used: `session_start` (1946), `session_tree` (1957), `before_agent_start` (1961).
- `before_agent_start` returns `{}` unless `wiki/_state/autonomy.json` has
  `enabled: true`. The weave is opt-in per brain.
- `AUTONOMY_PROMPT` (807) is a single ~20-line block, injected whole or not at all.
- `findBrainHome()` (65): `PI_BRAIN_HOME` → `.pi/brain-home` → cwd containing
  `wiki/` + `brain.config.yml`.
- `TEMPLATE_OWNED_PATHS` (668) + `brain_update` (1086) fetch template files from
  GitHub into each clone. This is a hand-rolled distribution channel that Phase 1
  replaces.

---

## Target state

- One global install: `pi install git:github.com/misabegovic/pi-brain@vN`.
- Brain clones contain **only content**: `wiki/`, `sources/`, `log/`,
  `brain.config.yml`, and any local overrides.
- Skills, templates, personas, prompts, themes, and the extension resolve from
  the installed package, project-local override first.
- Brain awareness is present in every session that has a brain home, in tiers —
  not an all-or-nothing autonomy switch.
- Sessions without a brain home cost approximately nothing.

---

## Phase 0 — Baseline

Non-negotiable before touching behaviour: the later phases change what the model
sees on every turn, and without a baseline there is no way to tell an improvement
from a regression.

1. Tag current `pi-brain` as `v0.2.0-preembed`. This is the rollback point.
2. Record the current system prompt for both states (autonomy on / off) using
   `ctx.getSystemPrompt()` behind a temporary `/brain:dump-prompt` command.
   Save both to `tests/fixtures/`.
3. Record token cost of a trivial turn in three environments: brain home with
   autonomy on, brain home with autonomy off, unrelated repo. This is the
   context-tax baseline.
4. Confirm `tests/load.test.ts` and `tests/integration.test.ts` pass.

**Exit:** fixtures committed, three token numbers written into this document.

---

## Phase 1 — Package-resolved resources

Moves skills and templates out of the clone and into the installed package.
Do this first: it shrinks what a clone *is*, which simplifies every later phase.

### Work

1. Add `resolveResource(name, brainHome)` to the extension. Resolution order:
   1. `<brainHome>/.brain/overrides/<name>`
   2. `<packageRoot>/<name>`

   Package root is derivable from `import.meta.url`. This gives the
   "embedded with local override" behaviour without a config knob.

2. Route all template reads through it. Today `tools/templates/*.md` are read
   relative to the brain home; they must come from the package.

3. Add `resources_discover` returning package-relative `skillPaths`,
   `promptPaths`, `themePaths`. The `pi` manifest already declares these for the
   global install; the hook covers the case where a brain home wants to add
   scope-specific skills.

4. `tools/clone-pi-brain.sh` and `/brain:setup` (1641): stop copying
   `skills/`, `prompts/`, `themes/`, `tools/templates/`, `personas/`,
   `extensions/` into new clones. Scaffold content directories only.

5. **Delete** `TEMPLATE_OWNED_PATHS` (668), the GitHub fetch helpers, the
   `brain_update` tool (1086), and `/brain:update` (1604). Package versioning
   replaces them. Keep a stub `/brain:update` for one release that prints
   `pi install git:github.com/misabegovic/pi-brain@latest` and exits.

6. Write `tools/migrate-clone.mjs`: for an existing clone, delete
   template-owned paths, diff them against the packaged versions first, and
   write any genuine local divergence into `.brain/overrides/`. Must support
   `--dry-run`.

### Risk

Existing clones (including `pi-brain`'s own `wiki/`) break if resolution is
wrong. Mitigation: `resolveResource` logs a one-line resolution trace under
`PI_BRAIN_DEBUG=1`, and Phase 1 ships behind a `v0.3.0-rc` tag tested against a
throwaway clone before any real brain is migrated.

**Exit:** a fresh clone contains no `.ts`, no `skills/`, no `tools/templates/`,
and `/brain` still renders. `pi-brain` itself migrated. Migration script
round-trips on a copy of a real brain.

---

## Phase 2 — Global install and registration tiers

### Work

1. Verify the package installs globally and loads in an unrelated directory:
   `pi install git:github.com/misabegovic/pi-brain@v0.3.0`, then `cd /tmp && pi`.

2. Split the 17 tools into three tiers:

   - **Always active (2):** `brain_status`, `brain_capture`. Capture must work
     from anywhere — catching a decision made while working in a project repo
     is the whole point of ambient availability.
   - **Brain-home active (13):** everything operating on wiki content.
   - **Bootstrap only (2):** `brain_convert`, `brain_ingest_repo` — active only
     when there is *no* brain home.

3. Register all 17 unconditionally (required for `getAllTools()`), then call
   `pi.setActiveTools()` at `session_start` with the tier for the detected
   state. Additive changes preserve the cached prefix; the initial set is
   established before the first request, so there is no invalidation cost.

4. Per `docs/extensions.md:2296`, ensure no brain tool carries `promptSnippet`
   or `promptGuidelines` — those rebuild the system prompt on activation and
   defeat caching. Audit all 17.

5. Commands are cheap (not in the prompt). Leave all 20 registered; make
   brain-home-dependent ones fail with `setupHint()` as they already do.

6. `session_start` fires on `resume` and `fork` with a possibly different cwd.
   Re-detect the brain home and re-apply the tier on every `session_start`, not
   just at init.

**Exit:** unrelated-repo turn cost within ~2% of stock pi. Brain-home session
exposes the full toolset. Verified against the Phase 0 numbers.

---

## Phase 3 — Ungate the weave

The substance of "woven into the system prompt". `AUTONOMY_PROMPT` becomes
three tiers instead of one block.

### Tiers

- **Tier 0 — no brain home.** Inject nothing. Return `{}` immediately.
- **Tier 1 — brain home present (new default).** ~6 lines, stable across turns:
  where the brain home is, that `brain_ask` beats guessing, that `brain_capture`
  needs no permission, that commitment-class writes are human-gated. Nothing
  volatile, nothing that varies turn to turn.
- **Tier 2 — autonomy enabled.** Current `AUTONOMY_PROMPT` content, appended to
  Tier 1. Retains the silently-allowed / explicitly-gated boundary.

### Work

1. Rewrite `before_agent_start` (1961): detect home → build tier → append to
   `event.systemPrompt`. Never replace it; chaining with other extensions
   depends on append semantics.

2. Split `AUTONOMY_PROMPT` into `BRAIN_BASE_PROMPT` and `BRAIN_AUTONOMY_PROMPT`.
   Move both into `prompts/` so they resolve through Phase 1's override path —
   a project can then tune its own tier-1 text.

3. Use `event.systemPromptOptions.contextFiles` to detect whether the project
   already loaded an `AGENTS.md`. If so, do not restate rules it already
   contains; reference it instead. This is what makes the injection *informed*
   rather than duplicative, and it directly reduces per-turn tokens.

4. Move volatile state out of the system prompt. Briefing, inbox count, and
   active bet go into the `message` return of `before_agent_start` on the
   **first** run of a session only (`customType: "pi-brain-briefing"`), which
   persists once in the session rather than re-sending every run.

5. Keep tier-1 text under ~400 tokens. Measure against Phase 0.

**Exit:** every brain-home session is brain-aware without `/brain:auto`.
Tier-1 cost measured and recorded. `/brain:auto` still meaningfully escalates.

---

## Phase 4 — Compaction harvest

The highest-value hook and the one with no current equivalent. Compaction is
where session knowledge is currently destroyed; it should be where the brain
gets fed.

### Work

1. Hook `session_before_compact`. Do not cancel — let compaction proceed.
2. Before it runs, extract from the messages about to be dropped: decisions
   stated by the user, constraints discovered, files identified as significant,
   open questions left unresolved.
3. Write one batched inbox item per compaction — reuse the auto-ingest batching
   pattern (`appendAutoIngestBatch`, 587) so ten compactions in a long session
   do not produce ten inbox items.
4. Tag entries `kind: compaction-harvest`, `confidence: low`. The confidence
   floor applies: this is agent-authored and cannot self-promote.
5. Gate on brain home + a `harvest_compaction` setting in `brain.config.yml`,
   default **on** when a brain home exists.

### Open question

Extraction quality. Options: (a) heuristic — pull user-role messages matching
decision-shaped patterns; (b) a cheap LLM call at compaction time. (a) is
free and dumb, (b) costs a call at an already-expensive moment. **Start with
(a)**, measure inbox noise over two weeks of real use, revisit. A harvest that
floods the inbox with junk is worse than no harvest, because it trains you to
stop reading the inbox.

**Exit:** a long session in a brain home yields one useful inbox item per
compaction. Noise rate acceptable over two weeks.

---

## Phase 5 — Loop participation

Only after Phases 3 and 4 have been lived with. These hooks touch every LLM call
and are the easiest place to make pi feel slow or strange.

### 5a — Constraint gate (`tool_call`)

Block `write`/`edit` against paths that violate an active `must` constraint in
`wiki/<scope>/constraints/`. Returns a blocking result naming the constraint.
Requires constraint frontmatter to carry machine-readable path globs — a schema
change to `tools/templates/constraint.md`, so treat 5a as its own bet.

### 5b — Relevant-record injection (`context`)

Inject the 1–2 most relevant `records/` pages for the current turn using the
existing TF-IDF search (`searchFiles`, 188). Deliberately last: it is the
change most likely to degrade quality by crowding the window, and it invalidates
the prompt prefix on every turn if done naively. Prototype behind
`PI_BRAIN_EXPERIMENTAL_CONTEXT=1` and A/B it before defaulting on.

**Exit:** decide per sub-phase. Shipping neither is an acceptable outcome.

---

## Phase 6 — Consolidation

1. `extensions/pi-brain.ts` is at 1976 lines and these phases add to it. Split
   into `extensions/pi-brain/` — `index.ts`, `brain-home.ts`, `tools/`,
   `commands/`, `prompts.ts`, `hooks.ts`. Defer until Phase 5 settles; splitting
   mid-flight creates conflicts against your own in-flight work.
2. Rewrite `README.md` and `GETTING_STARTED.md` for the install-once model. The
   current three-ways-to-start section is obsolete once clones hold only content.
3. Extend `tests/integration.test.ts`: tier selection, resource resolution
   order, no-brain-home no-op, compaction harvest batching.
4. Record the outcome as ADRs in `pi-brain`'s own `wiki/` — this repo is its own
   dogfood.

---

## Sequencing

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6
baseline    resources   tiers       weave       harvest     loop        cleanup
            v0.3.0      v0.4.0      v0.5.0      v0.6.0      v0.7.0      v1.0.0
```

Phases 1–4 are the commitment. Phase 5 is genuinely optional and should be
re-evaluated, not assumed. Each phase is independently shippable and
independently revertable by pinning the previous tag.

---

## Standing constraints

- **No changes to `misabegovic/pi`.** If a phase appears to need one, that is a
  signal the approach is wrong — re-read `docs/extensions.md` first. Record any
  genuine gap as an upstream RFC rather than a local patch.
- **Every phase must degrade to no-op** when no brain home is present.
- **Token cost is a first-class metric.** Any phase that raises the cost of a
  trivial turn in an unrelated repo has failed.
- **Confidence floor holds.** Nothing added here writes to `records/`,
  `adrs/`, `prds/`, `bets/`, or `epics/` without human approval.

---

## Open questions

1. Does `pi install` from a git ref reliably pick up the `pi` manifest's
   `skills`/`prompts`/`themes` paths, or only `extensions`? **Verify in Phase 2
   before building on it** — Phase 1's whole premise depends on it.
2. Should a brain home be discoverable *upward* from a nested project directory?
   Currently `.pi/brain-home` must be in the cwd. Ambient availability makes
   walking up to a parent more attractive, but risks a brain claiming
   unrelated sibling repos.
3. Multi-brain: one machine, several projects, one global install. Does
   `brain_capture` from an unrelated directory go to a default brain, prompt for
   one, or refuse? Affects the Phase 2 always-active tier. Refusing is the safe
   default for v1.

```
