# pi-brain 🧠🏠

[![CI](https://github.com/misabegovic/pi-brain/actions/workflows/ci.yml/badge.svg)](https://github.com/misabegovic/pi-brain/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@misabegovic/pi-brain)](https://www.npmjs.com/package/@misabegovic/pi-brain)

**A knowledge home for [pi](https://pi.dev).**

pi-brain is a self-contained, cloneable template for project- or customer-specific knowledge bases inside [pi](https://pi.dev). It is an **intent store**: it keeps the permanent layer of decisions, architecture, and product reasoning alongside the volatile layer of drafts, experiments, and AI suggestions. When volatile work is approved, it is promoted into the permanent layer and can then modify the actual project.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the PR-first workflow and local validation instructions, [CHANGELOG.md](CHANGELOG.md) for release history, [SECURITY.md](SECURITY.md) for security reporting, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards.

## What it gives pi

- **Persistent working memory** — every session starts with a glance at the project's briefing and tend queue.
- **Natural-language capture** — "note that we decided X" becomes an inbox item or wiki page.
- **Question answering over the corpus** — ask the project's brain, not just the current repo.
- **Tend queue integration** — see what queued up while you were away and digest it without leaving pi.
- **Human-gated shaping** — `/brain:shape` turns pitches into ADRs/PRDs with phase-end approval gates.
- **A cozy theme** — warm, low-contrast colors so long brain-tending sessions feel like home.
- **Regenerative intent** — turn approved intent into code with `/brain:build`, detect drift with `/brain:diff`, and reconcile with `/brain:sync-code`.
- **Multi-agent collaboration** — `/brain:collaborate` and `/brain:rfc-contribute` bring specialized personas into intent work.
- **Autonomous maintenance** — `/brain:auto`, background tasks, and `/brain:revise` keep intent current with human oversight.

## Regenerative intent workflow

pi-brain is evolving from a static intent store into a regenerative system where approved intent drives code and agents maintain intent over time:

```
PRD/ADR with YAML intent blocks
            ↓
    /brain:build → generated code
            ↓
    /brain:diff → drift report
            ↓
  /brain:sync-code → proposals / apply
            ↓
   /brain:revise → updated intent
```

Commands: `/brain:build`, `/brain:diff`, `/brain:sync-code`, `/brain:revise`, `/brain:collaborate`, `/brain:rfc-contribute`, `/brain:enqueue`, `/brain:run-tasks`, `/brain:tasks`, `/brain:bg-agent`, `/brain:enola-status`, `/brain:enola-check`, `/brain:enola-capture`, `/brain:enola-baseline`, `/brain:enola-query`, `/brain:enola-impact`.

## Vision: how pi-brain manages knowledge

pi-brain separates knowledge into three layers:

### Permanent layer (`wiki/<scope>/records/`)

These describe the project **as it actually is right now**. They are the residue of delivered decisions and the source of truth for future work:

- **Records** state the current, approved shape of a system, feature, or decision. They cite the ADR/PRD/bet that produced them and the code that implements them.

Records change only when the project itself changes.

### Volatile commitment layer (`wiki/<scope>/{adrs,prds,epics,bets,constraints}/`)

These are human-approved or in-progress commitment-class artifacts. They are true *at the time they are written*, but they become historical once the work is delivered:

- **ADRs** record the decision being made, the alternatives rejected, and the accepted consequences.
- **PRDs** describe the initiative — problem, appetite, fat-marker solution, no-gos, rabbit holes.
- **Epics** group related work under a single outcome.
- **Bets** are the commitments we actually make from the options — usually one per shaping cycle, linked to a PRD/ADR pair.
- **Constraints** are durable rules the project agrees to honor — architecture, UI, UX, language, workflow, security, performance. They shape what is allowed in every PRD/ADR/bet until explicitly retired.

### Raw / speculative layer (`wiki/<scope>/{pitches,rfcs,ai-suggestions}/`, inbox, deepdives)

Fast, speculative, or AI-generated material that is allowed to be wrong:

- **Pitches** are pre-bet ideas not yet shaped.
- **RFCs** are multi-perspective review documents — the conversation format between personas.
- **AI-suggestions** are agent-authored drafts awaiting human review.
- **Inbox captures** are raw notes waiting to be triaged.
- **Deepdives** are transient repo inspections for context.

### Evidence layer (`wiki/<scope>/{experiments,feedback}/`)

Observations from the real world that inform decisions:

- **Experiments** — A/B tests and other experiments with hypothesis, results, and decision.
- **Feedback** — user feedback, interviews, support signals, analytics observations.

Evidence pages feed into options, bets, and records.

### Promotion path

```
inbox / deepdive / pitch
         ↓
   ai-suggestion (agent draft)
         ↓
   draft PRD / ADR / epic / bet
         ↓
   accepted PRD / ADR / epic / bet  ← commitment layer
         ↓
   implementation in the project repo
         ↓
   record in wiki/<scope>/records/  ← permanent layer
```

- Raw drafts never become truth without human approval.
- Accepted commitment artifacts authorize changes to the project repo.
- **Constraint check:** before accepting a PRD/ADR/epic/bet, verify it honors active `constraints/` in the scope. Flag violations and resolve them before acceptance.
- Once delivered, the useful residue is captured as a **record**. The original ADR/PRD may then be archived or compacted into the record's history.
- `brain:groom` decays stale confidence, archives superseded commitments, and flags delivered work that needs a record.
- `brain:links`, `brain:state`, and `brain:sync` keep the permanent layer honest and navigable.

## Using pi-brain for your own project

pi-brain is distributed as a **global pi package**. Install it once and every pi session becomes brain-aware when a brain home is present.

### 1. Install the package globally

```bash
pi install @misabegovic/pi-brain
```

The package provides the extension, skills, prompts, themes, templates, personas, and tools. Your clones contain only content and config.

### 2. Create a content-only clone

```bash
bash tools/clone-pi-brain.sh ~/projects/my-project-brain "My Org"
cd ~/projects/my-project-brain
pi
/brain:setup
/brain
```

### 3. Convert an existing repo

`/brain:convert [subdir] [--dry-run]` moves the project code into `files/` (or the subdir you specify) and scaffolds the brain content directories.

### 4. Onboard an external repo

`/brain:ingest-repo <path-or-url> [scope]` keeps the brain repo-agnostic. The code stays outside the brain; only a lightweight metadata snapshot and wiki scaffold are created.

## Quick start

For a step-by-step checklist for real projects, see [GETTING_STARTED.md](GETTING_STARTED.md).

```bash
# Install pi-brain once
pi install @misabegovic/pi-brain

# Create a content-only brain for your project
bash tools/clone-pi-brain.sh ~/projects/my-project-brain "My Org"
cd ~/projects/my-project-brain

# Bootstrap the local environment (Node check, pre-commit hook, health check)
bash tools/setup-local.sh

# Open pi inside the brain and run the setup wizard
pi
/brain:setup
/brain
```

## Validate

To run the full local validation suite:

```bash
npm install
npm run validate
```

`npm run validate` runs TypeScript checks, tests, regenerates the wiki index, and verifies the link graph is clean.

## Configuration

Edit `brain.config.yml`:

```yaml
org: "My Project"
active_repos:
  - my-project
  - my-project-ui
connectors:
  github:
    repos: []
```

The extension uses the current project directory as the brain home by default. You can override with:

1. `PI_BRAIN_HOME` environment variable
2. `.pi/brain-home` file in the current project (absolute path)

## Repository layout

A pi-brain **clone** now contains only content and project-specific config. The installed package provides skills, prompts, themes, templates, personas, tools, and the extension.

```
my-project-brain/                    # content-only clone
├── brain.config.yml                 # org name + active repos + connectors
├── AGENTS.md                        # rulebook the agent follows
├── README.md                        # human onboarding
├── .brain/
│   └── overrides/                   # optional per-clone overrides
├── wiki/                            # synthesis layer
│   ├── index.md                     # auto-regenerated home page
│   ├── _state/
│   │   └── inbox.md                 # the tend queue
│   └── <scope>/                     # per-project or org scope
│       ├── records/                 # permanent: current truth about the system
│       ├── prds/                    # volatile commitment: product requirement docs
│       ├── adrs/                   # volatile commitment: architecture decision records
│       ├── epics/                  # volatile commitment: outcome groupings
│       ├── bets/                   # volatile commitment: committed bets
│       ├── constraints/            # volatile commitment: durable project rules
│       ├── rfcs/                   # volatile: multi-perspective review documents
│       ├── pitches/                # volatile: pre-bet ideas
│       ├── ai-suggestions/         # volatile: agent drafts awaiting review
│       ├── experiments/            # evidence: A/B tests and experiments
│       └── feedback/               # evidence: user feedback and signals
├── sources/                         # immutable inputs (snapshots, exports, research)
└── log/
    └── log.md                       # append-only operations log
```

The **package** (installed globally via `pi install @misabegovic/pi-brain`) provides:

- `extensions/pi-brain.ts` — the pi extension
- `skills/*` — agent skills
- `prompts/*` — prompt templates
- `themes/*` — TUI themes
- `tools/*` — CLI helpers and templates
- `personas/*` — agent and user personas
- `tests/*` — smoke and integration tests

## Commands

| Command | What it does |
|---------|--------------|
| `/brain` | Show the current briefing, inbox count, and last update. |
| `/brain:capture <note>` | Capture a note into the inbox. |
| `/brain:ask <question>` | Ask a question over the wiki + sources corpus. |
| `/brain:tend` | Digest the tend queue. |
| `/brain:sync` | Validate frontmatter and regenerate `wiki/index.md`. |
| `/brain:update [--version=<tag>] [--apply]` | Pull upstream pi-brain template updates into this clone. |
| `/brain:shape <scope> <pitch>` | Human-gated ADR/PRD/epic/bet authoring. |
| `/brain:in <path-or-url>` | Ingest a file, directory, or URL into `sources/` (URLs fetched best-effort). |
| `/brain:setup` | Bootstrap or reconfigure this directory as a pi-brain home. |
| `/brain:connect` | Run configured pull connectors to snapshot external sources. |
| `/brain:auto` | Toggle autonomous brain-maintenance mode. |
| `/brain:continue [slug]` | Continue in-flight shape/build/inbox work. |
| `/brain:investigate <question>` | Investigate a bug, risk, or open question. |
| `/brain:links` | Derive and show the link graph. |
| `/brain:groom` | Groom the pi-brain corpus. |
| `/brain:state [scope]` | Regenerate state, roadmap, and options pages. |
| `/brain:deepdive <path> [question]` | Transiently inspect a target repo file/directory. |
| `/brain:ingest-repo <path-or-url> [scope]` | Onboard a repository as a maintained project. |
| `/brain:projects` | List onboarded projects. |
| `/brain:convert [subdir]` | Convert current repo into a pi-brain clone. |

## Tools

The extension registers these tools for the agent:

- `brain_status` — read the status dashboard.
- `brain_capture` — append an item to the inbox.
- `brain_ask` — search the corpus with TF-IDF ranking over tokenized terms.
- `brain_tend` — list the inbox queue.
- `brain_validate` — validate wiki frontmatter.
- `brain_views` — regenerate the index view.
- `brain_sync` — validate + regenerate views.
- `brain_links` — derive the link graph.
- `brain_state` — regenerate state/roadmap/options pages.
- `brain_deepdive` — transiently inspect a target repo file/directory.
- `brain_ingest_repo` — onboard a repository as a maintained project.
- `brain_projects` — list onboarded projects.
- `brain_convert` — convert current repo into a pi-brain clone.
- `brain_pull_connectors` — run configured pull connectors.
- `brain_autonomy` — read or toggle autonomous brain-maintenance mode.
- `brain_ingest` — ingest a file, directory, or URL into `sources/`.

## Design principles

- **Sources are immutable.** Snapshots and exports land in `sources/` and are never rewritten.
- **Wiki is the synthesis.** The agent maintains `wiki/` with cited claims.
- **No scheduled LLM runs.** Work queues in `wiki/_state/inbox.md`; pi digests it when *you* choose to `/brain:tend`.
- **Human-gated commitments.** `/brain:shape` pauses for approval at phase boundaries.
- **Confidence floor.** Agent-authored content starts at `confidence: low` and cannot self-promote to `high` in the same change.
- **Local-first.** Each project/customer gets its own clone; no hosted tier required.

## Git hook

Install the pre-commit hook manually:

```bash
cp tools/git-hooks/pre-commit .git/hooks/pre-commit
```

Or let `/brain:setup` install it for you. It runs `tools/brain-sync.mjs` before each commit to validate frontmatter and keep `wiki/index.md` fresh.

## Testing

```bash
NODE_PATH=/path/to/pi-coding-agent/node_modules \
  node --import /path/to/jiti-register.mjs tests/load.test.ts
```

## Roadmap

pi-brain-specific evolutions — multi-repo aggregation, connector producers, richer TUI widgets, and customer packaging — are tracked in this repo's own `wiki/` as the shell is inhabited.
