---
name: brain
description: Use the connected brain instance as persistent working memory — capture notes, ask questions, and digest queued work.
---

# brain skill

You are wearing the brain skill. A brain instance is available to pi via the `pi-brain` extension. Use it as your long-term memory, not your own assumptions.

## When to use

- The user asks "what do we know about X?" → `brain_ask`.
- The user makes a decision, observation, or asks to "remember this" → `brain_capture`.
- The user says "tend the brain", "what's waiting?", or "digest the queue" → `brain_tend`.
- At the start of a task, glance at `brain_status` if the session widget is not enough.

## Tools

### `brain_status`

Read the brain's status dashboard and inbox summary. Good for grounding.

### `brain_capture`

Capture a note into the brain inbox.

- `note`: the full text of the note.
- `scope` (optional): repo name, `org`, or `brain`.
- `kind` (optional): `decision`, `insight`, `discussion`, `task`, `source`.

Keep captures factual and cite sources when you have them. Do not rewrite the note; record what was said or observed.

### `brain_ask`

Ask the brain a question. The brain searches the wiki synthesis first, then sources.

- `question`: plain-language question.
- `scope` (optional): limit to a repo/org/brain scope.

If the answer is incomplete, say so and suggest capturing the missing signal.

### `brain_tend`

List the pending inbox queue. This tool is read-only; use it to summarize what needs work, then ask the user which items to digest. Do not perform expensive synthesis autonomously.

- `budget` (optional): count, time-box, kind filter, or item id.

## Rules

1. **Prefer the corpus over memory.** If you are unsure of a fact, ask the brain.
2. **Capture first, shape later.** A quick capture is low friction. Promoting to ADR/PRD (`/brain:shape`) is a separate, human-gated step.
3. **Confidence floor.** Any claim you author starts at low confidence unless you can cite evidence.
4. **Sources are immutable.** Never rewrite `sources/` or existing `wiki/` pages directly; go through the brain CLI.
5. **No autonomous LLM schedules.** Only `/brain:tend` when the user asks; never queue long-running work for later.

## Commands the human can type

- `/brain` — briefing
- `/brain:capture <note>`
- `/brain:ask <question>`
- `/brain:tend [budget]`
- `/brain:sync` — validate health
