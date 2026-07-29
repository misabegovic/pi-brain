# Contributing to pi-brain

Thank you for helping make pi-brain better. This guide covers how to contribute to the product repository.

## Workflow

pi-brain is **PR-first**. All changes to `main` must go through a pull request.

- Constraint: `remote-promotion-requires-pr` is active.
- A local pre-push hook blocks accidental direct pushes to `main`. If you need to override it in an emergency, use `ALLOW_MAIN_PUSH=1 git push origin main`.

## Before you start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up local hooks:
   ```bash
   bash tools/setup-local.sh
   ```
3. Run the full validation suite:
   ```bash
   npm run validate
   ```

`npm run validate` runs TypeScript checks, tests, regenerates the wiki index, and verifies the link graph is clean.

## Structural changes

If your change affects repository layout, `brain.config.yml`, CI, skills, prompts, extension code, or onboarding, you need an approved ADR first. See `wiki/brain/constraints/adr-before-structural-changes.md`.

## Capturing decisions and questions

- Use `/brain:capture` or `brain_capture` to record decisions, questions, and observations.
- Use `/brain:in` to add inbox items for human review.
- Keep citations traceable: use `(source: sources/...)` for non-wiki files and backticks for repo files.

## AI suggestions

The autonomous refinement protocol may draft suggestions under `wiki/brain/ai-suggestions/`. These are starting points, not approved work. Promote or delete them explicitly.

## Questions?

Open an issue or ask in the pi-brain discussions.
