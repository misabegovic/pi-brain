---
name: brain
description: Use the connected pi-brain clone as persistent working memory — capture notes, ask questions, validate the corpus, and digest queued work.
---

# brain skill

You are wearing the brain skill. The current project is (or should be) a pi-brain clone. Use the local `wiki/`, `sources/`, and `wiki/_state/inbox.md` as your long-term memory, not your own assumptions.

## When to use

- The user asks "what do we know about X?" → `brain_ask`.
- The user makes a decision, observation, or asks to "remember this" → `brain_capture`.
- The user says "tend the brain", "what's waiting?", or "digest the queue" → `brain_tend`.
- The user wants a health check → `brain_validate` or `brain_sync`.
- At the start of a task, glance at `brain_status` if the session widget is not enough.

## Tools

### `brain_status`

Read the status dashboard and inbox summary.

### `brain_capture`

Capture a note into the inbox.

- `note`: the full text of the note.
- `scope` (optional): repo name, `org`, or `brain`.
- `kind` (optional): `decision`, `insight`, `discussion`, `task`, `source`, `experiment`, `feedback`.

Keep captures factual and cite sources when you have them. Do not rewrite the note; record what was said or observed.

### `brain_ask`

Ask a question. The tool searches the wiki synthesis and sources with TF-IDF ranking, stop-word filtering, and term-frequency scoring.

- `question`: plain-language question.

If the answer is incomplete, say so and suggest capturing the missing signal.

### `brain_tend`

List the pending inbox queue. Use it to summarize what needs work, then ask the user which items to digest. Do not perform expensive synthesis autonomously.

### `brain_validate`

Validate frontmatter conformance of wiki pages. Required fields: `kind`, `status`, `confidence`.

### `brain_views`

Regenerate `wiki/index.md` from the corpus.

### `brain_sync`

Run `brain_validate` + `brain_views` in one step.

## Rules

1. **Prefer the corpus over memory.** If you are unsure of a fact, ask the brain.
2. **Capture first, shape later.** A quick capture is low friction. Promoting to ADR/PRD (`/brain:shape`) is a separate, human-gated step.
3. **Stop and shape structural changes.** If the user asks for a structural/repo change, do not execute. Read `wiki/<scope>/constraints/*.md`, draft or graduate an ADR, and stop for approval. See `AGENTS.md` for the checklist.
4. **Confidence floor.** Any claim you author starts at low confidence unless you can cite evidence.
5. **Sources are immutable.** Never rewrite `sources/` or existing `wiki/` pages directly; go through the intended workflow.
6. **Personas converse via RFCs.** For cross-cutting decisions, do not switch personas in sequence; draft an RFC with sections for each persona's perspective.
7. **Evidence has its own shelves.** Experiments and user feedback live in `wiki/<scope>/experiments/` and `wiki/<scope>/feedback/`. Capture signals there so they can inform bets and records.
8. **No autonomous LLM schedules.** Only `/brain:tend` when the user asks; never queue long-running work for later.

## Commands the human can type

- `/brain` — briefing
- `/brain:capture <note>`
- `/brain:ask <question>`
- `/brain:tend [budget]`
- `/brain:sync` — validate + regenerate views
- `/brain:shape <scope> <pitch>` — human-gated ADR/PRD authoring
- `/brain:in <path-or-url>` — ingest a source into `sources/`
- `/brain:setup` — bootstrap or reconfigure a pi-brain home
- `/brain:connect` — run configured pull connectors
- `/brain:auto` — toggle autonomous brain-maintenance mode
- `/brain:continue [slug]` — continue in-flight work
- `/brain:investigate <question>` — investigate a bug, risk, or open question
- `/brain:links` — derive and show the link graph
- `/brain:groom` — groom the corpus
- `/brain:state [scope]` — regenerate state/roadmap/options pages
- `/brain:deepdive <path> [question]` — transiently inspect a target repo file/directory
- `/brain:ingest-repo <path-or-url> [scope]` — onboard a repository as a maintained project
- `/brain:projects` — list onboarded projects
- `/brain:convert [subdir]` — convert current repo into a pi-brain clone
