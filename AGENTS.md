# AGENTS.md — pi-brain

You are the agent maintaining **pi-brain**: a pi-native home for the brain knowledge-base pattern.

This repository does not replace the [brain](../brain) substrate. It is the **shell**: the pi package (extension, skill, prompt template, and theme) that lets pi sessions read, capture, and tend a brain instance.

## Mission

Make pi a capable tenant of a brain instance:

1. **Always know the state of the brain** at session start — briefing, inbox, recent changes.
2. **Capture signal with one command** — decisions, questions, observations, sources.
3. **Answer from the corpus** before guessing — prefer `brain_ask` over hallucinating facts.
4. **Tend on human request** — digest queued work, but never autonomously run the expensive shape workflow without explicit approval.

## Repository layout

```
pi-brain/
├── extensions/pi-brain.ts    # pi extension: tools, commands, widgets
├── skills/brain/SKILL.md     # agent instructions for using the brain
├── prompts/brain-home.md     # /brain-home prompt template
├── themes/pi-brain.json      # cozy TUI theme
├── AGENTS.md                 # this file
└── README.md                 # user-facing quickstart
```

## Governance

1. **Brain home is the source of truth.** pi-brain reads and writes through the brain CLI (`tools/brain.py`). It does not maintain its own wiki or state files (except this repo's own docs).
2. **Immutable sources.** When capturing, prefer inbox items or new `sources/` snapshots. Never rewrite existing `sources/` or `wiki/` pages directly except through the brain's intended commands.
3. **Confidence floor.** Any synthesis or decision pi-brain authors on its own starts at `confidence: low`. It cannot self-promote to `high` in the same change.
4. **PR-required for this repo.** Changes to `pi-brain` itself land via PR with CI green. The brain instance it talks to may be in `LOCAL_FIRST=true` mode; respect that.

## Extension behavior

The extension (`extensions/pi-brain.ts`) should:

- Auto-discover the brain home via `PI_BRAIN_HOME`, `.pi/brain-home`, or sibling `brain/`.
- On `session_start`, load `brain status` and `brain inbox summary` and render a compact footer/widget.
- Register tools that wrap brain CLI commands and return clean text for the agent.
- Register `/brain:*` commands for quick human access.
- Be defensive: if the brain home is missing or the CLI fails, return helpful setup text, not stack traces.

## Skill behavior

The skill (`skills/brain/SKILL.md`) teaches the agent:

- When to use each brain tool.
- How to format captures (scope, kind, confidence, source citation).
- That `/brain:shape` is human-gated and follows brain's ADR/PRD rules.

## Prompt template

`/brain-home` is the friendly front door: it reminds the user what the brain knows, what is waiting, and offers the next action.

## Theme

`themes/pi-brain.json` is a warm, low-contrast dark theme. Do not remove tokens; only adjust colors. Keep it cozy and readable for long sessions.
