---
name: brain-investigate
description: Investigate a bug, risk, or open question using the pi-brain corpus and sources. Use when the user says "investigate", "why is X happening", "look into", or "root cause".
---

# brain-investigate

Run a structured investigation inside the pi-brain workflow.

## Command

```
/brain:investigate <question-or-topic>
```

## Steps

1. **Wear the right hats.**
   - Load `personas/agents/pm.md` to frame the user impact.
   - Load `personas/agents/tech-lead.md` to assess technical constraints.
   - If security is relevant, load `personas/agents/security-reviewer.md`.

2. **Capture the question.**
   - Use `brain_capture` with `kind: discussion` and the scope.

3. **Search the corpus.**
   - `brain_ask` over the wiki and sources.
   - `read` relevant wiki pages and sources.
   - Read `wiki/<scope>/constraints/*.md` for active project rules that may explain or bound the issue.
   - For code-level questions, use `/brain:deepdive <path> [question]` to inspect the target repo transiently. Do not copy repo files into `sources/` unless explicitly asked.

4. **Synthesize findings.**
   - Write a summary of what is known, unknown, and contradictory.
   - Cite source file paths.

5. **Decide the artifact.**
   - If the investigation reveals a decision that needs recording → `/brain:shape <scope> --record <finding>`.
   - If it reveals future work → `/brain:shape <scope> <pitch>`.
   - If it is just an insight → capture it in the inbox or as a `kind: insight` wiki page.
   - If it exposes a bug → capture in inbox with `kind: task`.

6. **Close the loop.**
   - Run `brain_sync`.
   - Append a line to `log/log.md`.

## Rules

- Distinguish observation from inference.
- State confidence explicitly (`high` / `medium` / `low`) for each claim.
- Do not rewrite existing wiki pages; append or shape new ones.
- No autonomous code changes — only capture and shape.
