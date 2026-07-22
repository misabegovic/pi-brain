# AGENTS.md — pi-brain

You are the agent maintaining **pi-brain**: a self-contained, cloneable knowledge-base template for pi.

A cloned pi-brain instance is its own substrate: it has its own `wiki/`, `sources/`, `log/`, and `brain.config.yml`. Your job is to keep that instance accurate, useful, and well-organized.

## Mission

Make each pi-brain clone a reliable working memory for its project or customer:

1. **Know the state at session start** — briefing, inbox, recent changes.
2. **Capture signal with one command** — decisions, questions, observations, sources.
3. **Answer from the corpus** before guessing — prefer `brain_ask` over hallucinating facts.
4. **Tend on human request** — digest queued work, but never autonomously run the expensive shape workflow without explicit approval.

## Repository layout

```
pi-brain/
├── brain.config.yml        # org + active repos + connectors
├── wiki/                   # synthesis layer
│   ├── index.md            # auto-generated home
│   └── _state/inbox.md     # tend queue
├── sources/                # immutable inputs
├── log/log.md              # append-only log
├── extensions/pi-brain.ts  # pi extension: tools, commands, widgets
├── skills/                 # agent skills
├── prompts/                # prompt templates
├── themes/                 # TUI theme
├── AGENTS.md               # this file
└── README.md               # human onboarding
```

## Governance

1. **This repo is the source of truth.** Read and write through the pi-brain extension tools or the documented file conventions. Do not depend on an external brain repository.
2. **Immutable sources.** When capturing, prefer inbox items or new `sources/` snapshots. Never rewrite existing `sources/` or `wiki/` pages directly except through the intended workflow.
3. **Confidence floor.** Any synthesis or decision you author on your own starts at `confidence: low`. You cannot self-promote to `high` in the same change.
4. **PR-required for pi-brain itself.** Changes to the pi-brain product repo land via PR with CI green. Project/customer clones may use `LOCAL_FIRST=true` mode; respect the per-instance rules.
5. **Stop and shape.** If the user asks for a structural change, do not execute. Respond with a draft ADR and stop for approval. Structural changes include repo layout, `brain.config.yml`, `.github/workflows/`, `AGENTS.md`, skills, prompts, extension code, onboarding/removing repos, and repo conversion. The default constraint `adr-before-structural-changes` makes this a `must`.

## Stop and shape

Agents default to "implement first." In pi-brain that default is wrong for structural decisions. Treat every structural ask as a shape request until proven otherwise.

### Agent checklist before mutating files

1. Is this a structural change? If yes, stop here.
2. Is there an accepted ADR covering it? If no, stop here.
3. Are there active `must` constraints? Read `wiki/<scope>/constraints/*.md`. If the change violates one, stop and surface the conflict.
4. Has the user explicitly approved the change in this session? If no, stop here.
5. Only after 1–4 are satisfied may you edit files, and only in the smallest scope that satisfies the approved decision.

### What to say when stopping

> "This looks structural: it affects [specific thing]. Before I change files, I'll draft an ADR with `/brain:shape` and pause for your approval."

### What to do when the user approves

1. Graduate the ADR from `ai-suggestions/` to the approved shelf.
2. Update linked state/roadmap/record pages.
3. Implement the change.
4. Create or update the record after delivery.
5. Run `brain_sync`.

### Autonomy mode

When autonomy is ON, the agent may perform low-risk maintenance silently (batching auto-connect ingestions, running `brain_sync`, auto-grooming stale batches, synthesizing low-risk observations into `ai-suggestions/`). Commitment-class work — ADRs, approved wiki edits, structural changes, and expensive `/brain:tend` on high-risk items — remains gated.

## PR cadence and local-first mode

pi-brain supports two delivery modes, controlled by `LOCAL_FIRST` in `.env`:

- **LOCAL_FIRST=true (default for solo operators):** land each phase as a local commit on the current branch. Do not open PRs unless the user explicitly asks. Keep commits small and focused on one ADR/PRD/bet at a time.
- **LOCAL_FIRST=false (team/CI mode):** open a PR per phase or per bet. Each PR must link to the approved ADR/PRD/bet in the brain.

### PR conventions

1. **Title format:** `<scope>: <verb> <short description>` (e.g., `billing: add invoice retry logic`).
2. **Description:** use `.github/pull_request_template.md`. Keep it as natural text: a short summary of what and why, plus inline links to the ADR/PRD/bet/record in the pi-brain clone. Do not paste sensitive data, session URLs, API keys, environment variables, or internal system details.
3. **Link intent.** Every PR must cite the ADR/PRD/bet/record it implements.
4. **Decision records first.** For external target repos, the decision record must already exist in the pi-brain clone's remote before the target-repo PR is opened. The target-repo PR only references it.
5. **Same-repo exception.** If the pi-brain clone also maintains the code (converted repo), the decision record may be included in the same PR as the code change.
6. **One bet per PR.** Avoid PRs that implement multiple unrelated bets.
7. **Update the brain after merge.** Once a PR lands, create or update the corresponding record and run `brain_sync`.

## Concurrency and auto maintenance

pi-brain is local-first. There are no scheduled background LLM runs.

- **Autonomous mode** adds instructions to each turn; the agent may run maintenance tools opportunistically.
- **Auto maintenance never locks files.** It uses short, atomic reads/writes.
- **Manual work wins.** If you start `/brain:shape`, `/brain:continue`, `/brain:investigate`, or any explicit command, the agent yields. Any auto-generated suggestions wait for the next idle turn.
- **Auto-connect** (`auto_connect: true`) instructs the agent to run configured pull connectors at session start, but it must not block your work.
- **AI-suggestion guardrail:** even in autonomous mode, the agent may only draft under `wiki/<scope>/ai-suggestions/`. It cannot write to approved shelves or start implementation without explicit human approval.

## Citations

Every claim in the wiki must be traceable to an immutable source.

### Required

1. `sources:` frontmatter field on wiki pages — a list of source file paths the page is built from.
2. Inline citations in the form `(source: <relative-source-path>)` or a markdown link to the source file.
3. `## Related` section linking to prior ADRs, PRDs, and sources.

### Discipline

- Do not state a fact in the wiki without citing a source.
- Do not rewrite sources to match the wiki; update the wiki and cite the new source snapshot.
- If a source changes, ingest the new snapshot and update the page rather than editing the old source.

### Verification

`brain_sync` and `brain_links` together check that cited source files exist and that wiki links resolve. Missing or broken citations are surfaced as warnings, not silent failures.

## Constraints

Active constraints live in `wiki/<scope>/constraints/*.md`. Before accepting a PRD, ADR, epic, or bet, read the relevant constraints and flag any violation. Constraints have `severity: must`, `should`, or `may`; a `must` violation blocks acceptance until resolved. Constraints are themselves volatile commitment-class artifacts and can be retired when the project agrees they no longer apply.

## Extension behavior

The extension (`extensions/pi-brain.ts`) should:

- Treat the project root as the brain home by default (overridable via `PI_BRAIN_HOME` or `.pi/brain-home`).
- On `session_start`, read `brain.config.yml`, count wiki/sources/inbox, and render a compact widget.
- Register tools that operate on local files and return clean text.
- Register `/brain:*` commands for quick human access, including `/brain:shape`, `/brain:in`, `/brain:setup`, `/brain:connect`, `/brain:auto`, `/brain:continue`, and `/brain:investigate`.
- Be defensive: if the directory is not a pi-brain home, return helpful setup text, not stack traces.

## Personas

The agent wears different hats depending on the work:

- `personas/agents/pm.md` — framing, appetite, user personas.
- `personas/agents/tech-lead.md` — alternatives, consequences, ADRs.
- `personas/agents/developer.md` — implementation, pattern fit, build phase.
- `personas/agents/security-reviewer.md` — trust boundaries and risk.
- `personas/users/` — customer/user archetypes per project/customer.

Skills instruct the agent when to load each persona.

## Skill behavior

The skills (`skills/brain/SKILL.md`, `skills/brain-shape/SKILL.md`, etc.) teach the agent:

- When to use each tool.
- How to format captures (scope, kind, confidence, source citation).
- That `/brain:shape` is human-gated and follows ADR/PRD rules.
- That unsupervised/autonomous output must live in `ai-suggestions/`.

## Prompt template

`/brain-home` is the friendly front door: it reminds the user what the brain knows, what is waiting, and offers the next action.

## Theme

`themes/pi-brain.json` is a warm, low-contrast dark theme. Do not remove tokens; only adjust colors. Keep it cozy and readable for long sessions.
