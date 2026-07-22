# pi-brain 🧠🏠

**A knowledge home for [pi](https://pi.dev).**

This package brings the [brain](https://github.com/muhamed/brain) wiki pattern into pi sessions. Instead of maintaining a separate harness, pi itself becomes the tenant: it reads the brain's briefing, captures notes, asks questions, and tends the inbox — all from inside the terminal you already live in.

> The brain is the substrate. pi-brain is the shell that lets pi move in.

## What it gives pi

- **Persistent working memory** — every session starts with a glance at the brain's current briefing and tend queue.
- **Natural-language capture** — "note that we decided X" becomes a brain inbox item or wiki page.
- **Question answering over the corpus** — ask the brain, not just the current repo.
- **Tend queue integration** — see what the producers queued while you were away and digest it without leaving pi.
- **A cozy theme** — warm, low-contrast colors so long brain-tending sessions feel like home.

## Quick start

1. Make sure you have a brain instance next door (default: `~/projects/brain`).
2. Install pi-brain into pi:

```bash
pi install ./projects/pi-brain
```

3. Open a project with pi. The extension auto-discovers the brain home and loads `/skill:brain`.

## Configuration

The extension looks for the brain home in this order:

1. `PI_BRAIN_HOME` environment variable
2. `.pi/brain-home` file in the current project (absolute path)
3. Sibling `brain/` directory next to the current project

If no brain home is found, the extension shows a friendly setup hint instead of failing.

## Commands

| Command | What it does |
|---------|--------------|
| `/brain` | Show the current brain briefing, inbox count, and last update. |
| `/brain:capture <note>` | Capture a note into the brain inbox. |
| `/brain:ask <question>` | Ask the brain a question over the wiki corpus. |
| `/brain:tend` | Digest the brain tend queue. |
| `/brain:sync` | Run a mechanical health sweep on the brain. |

## Tools

The extension registers these tools for the agent:

- `brain_status` — read the brain status dashboard.
- `brain_capture` — append an item to the brain inbox.
- `brain_ask` — run a brain search/query.
- `brain_tend` — summarize or digest the inbox queue.

## Project layout

```
pi-brain/
├── README.md
├── package.json          # pi package manifest
├── AGENTS.md             # pi-brain's own rulebook
├── extensions/
│   └── pi-brain.ts       # the pi extension
├── skills/
│   └── brain/
│       └── SKILL.md      # how pi should use the brain
├── prompts/
│   └── brain-home.md     # /brain-home prompt template
└── themes/
    └── pi-brain.json     # cozy terminal theme
```

## Design principles

Inherited from brain:

- **Sources are immutable.** Captures land in the brain's `sources/` or inbox; the agent never rewrites history.
- **No scheduled LLM runs.** The brain's producers queue work; pi digests it when *you* choose to `/brain:tend`.
- **Human-gated commitments.** `/brain:shape` follows the same confidence-floor and ADR/PRD gating rules as the original brain.
- **Local-first.** Everything works against a local brain checkout; hosted/agentic tiers are optional later.

## Roadmap

See the brain repo for the upstream substrate. pi-brain-specific evolutions (a pi-native compact mode, channel surface, richer TUI widgets) will be tracked in this repo's own `wiki/` once the shell is inhabited.
