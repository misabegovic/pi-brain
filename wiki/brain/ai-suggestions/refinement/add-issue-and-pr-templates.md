---
kind: ai-suggestion
status: draft
confidence: low
topic: workflow
created_at: 2026-07-30
---

# Add GitHub issue and discussion templates

## Observation

The repo has a pull request template but no issue or discussion templates. Contributors opening bugs or feature requests may omit useful context.

## Why now

Templates improve issue quality and reduce back-and-forth, especially as the project stabilizes after v0.3.3.

## Suggested action

1. Create `.github/ISSUE_TEMPLATE/bug.yml` and `.github/ISSUE_TEMPLATE/feature.yml`.
2. Include fields for pi version, reproduction steps, and expected behavior.
3. Add a `.github/DISCUSSION_TEMPLATE/` if appropriate.
4. Link to `CONTRIBUTING.md` from the templates.

## Sources

- `.github/pull_request_template.md`
- `CONTRIBUTING.md`
