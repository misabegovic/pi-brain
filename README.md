# pi-brain 🧠🏠

[![Validate pi-brain](https://github.com/earendil-works/pi-brain/actions/workflows/validate.yml/badge.svg)](https://github.com/earendil-works/pi-brain/actions/workflows/validate.yml)

**A knowledge home for [pi](https://pi.dev).**

pi-brain is a self-contained, cloneable template for project- or customer-specific knowledge bases inside [pi](https://pi.dev). It is an **intent store**: it keeps the permanent layer of decisions, architecture, and product reasoning alongside the volatile layer of drafts, experiments, and AI suggestions. When volatile work is approved, it is promoted into the permanent layer and can then modify the actual project.

## What it gives pi

- **Persistent working memory** — every session starts with a glance at the project's briefing and tend queue.
- **Natural-language capture** — "note that we decided X" becomes an inbox item or wiki page.
- **Question answering over the corpus** — ask the project's brain, not just the current repo.
- **Tend queue integration** — see what queued up while you were away and digest it without leaving pi.
- **Human-gated shaping** — `/brain:shape` turns pitches into ADRs/PRDs with phase-end approval gates.
- **A cozy theme** — warm, low-contrast colors so long brain-tending sessions feel like home.

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

### Raw / speculative layer (`wiki/<scope>/{pitches,ai-suggestions}/`, inbox, deepdives)

Fast, speculative, or AI-generated material that is allowed to be wrong:

- **Pitches** are pre-bet ideas not yet shaped.
- **AI-suggestions** are agent-authored drafts awaiting human review.
- **Inbox captures** are raw notes waiting to be triaged.
- **Deepdives** are transient repo inspections for context.

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

There are three ways to start:

1. **Fork/clone this repo** on GitHub and customize it for your project. Or use the helper:
   ```bash
   bash tools/clone-pi-brain.sh ~/projects/my-project-brain "My Org"
   ```
2. **Convert an existing repo** with `/brain:convert [subdir] [--dry-run]` — moves the project code into `files/` and makes the repo itself a pi-brain clone.
3. **Onboard an external repo** with `/brain:ingest-repo <path-or-url> [scope]` — keeps the brain repo-agnostic and snapshots the target repo under `sources/repos/<scope>/`.

## Quick start

```bash
# Clone pi-brain as the starting point for a project/customer brain
git clone <pi-brain> my-project-brain && cd my-project-brain

# Install the pi package globally (once per machine)
pi install ./

# Bootstrap the local environment (Node check, pre-commit hook, health check)
bash tools/setup-local.sh

# Open pi inside the brain and run the setup wizard
pi
/brain:setup
/brain
```

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

```
my-project-brain/
├── brain.config.yml      # org name + active repos + connectors
├── AGENTS.md             # rulebook the agent follows
├── README.md             # human onboarding
├── wiki/                 # synthesis layer
│   ├── index.md          # auto-regenerated home page
│   ├── _state/
│   │   └── inbox.md      # the tend queue
│   └── <scope>/          # per-project or org scope
│       ├── records/      # permanent: current truth about the system
│       ├── prds/         # volatile commitment: product requirement docs
│       ├── adrs/         # volatile commitment: architecture decision records
│       ├── epics/        # volatile commitment: outcome groupings
│       ├── bets/         # volatile commitment: committed bets
│       ├── constraints/  # volatile commitment: durable project rules
│       ├── pitches/      # volatile: pre-bet ideas
│       └── ai-suggestions/ # volatile: agent drafts awaiting review
├── sources/              # immutable inputs (snapshots, exports, research)
├── log/
│   └── log.md            # append-only operations log
├── tools/
│   ├── templates/        # ADR/PRD/pitch/epic/bet/record/constraint templates
│   │   ├── adr.md
│   │   ├── prd.md
│   │   ├── pitch.md
│   │   ├── epic.md
│   │   ├── bet.md
│   │   ├── record.md
│   │   ├── constraint.md
│   │   ├── adr-ai-suggestion.md
│   │   └── prd-ai-suggestion.md
│   ├── connectors/       # pull connectors
│   ├── git-hooks/        # pre-commit hook
│   └── brain-sync.mjs    # validation + view regeneration
├── extensions/
│   └── pi-brain.ts       # pi extension: tools, commands, widgets
├── skills/               # agent skills
│   ├── brain/
│   │   └── SKILL.md
│   ├── brain-shape/
│   │   └── SKILL.md
│   ├── brain-ingest/
│   │   └── SKILL.md
│   ├── brain-setup/
│   │   └── SKILL.md
│   ├── brain-connect/
│   │   └── SKILL.md
│   ├── brain-auto/
│   │   └── SKILL.md
│   ├── brain-continue/
│   │   └── SKILL.md
│   └── brain-investigate/
│       └── SKILL.md
├── personas/             # agent + user personas
│   ├── README.md
│   ├── agents/
│   │   ├── pm.md
│   │   ├── tech-lead.md
│   │   ├── developer.md
│   │   └── security-reviewer.md
│   └── users/
│       └── README.md
├── prompts/
│   └── brain-home.md     # /brain-home prompt template
├── themes/
│   └── pi-brain.json     # cozy terminal theme
└── tests/
    ├── load.test.ts      # smoke test
    └── integration.test.ts
```

## Commands

| Command | What it does |
|---------|--------------|
| `/brain` | Show the current briefing, inbox count, and last update. |
| `/brain:capture <note>` | Capture a note into the inbox. |
| `/brain:ask <question>` | Ask a question over the wiki + sources corpus. |
| `/brain:tend` | Digest the tend queue. |
| `/brain:sync` | Validate frontmatter and regenerate `wiki/index.md`. |
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
