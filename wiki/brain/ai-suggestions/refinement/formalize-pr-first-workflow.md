---
kind: ai-suggestion
status: draft
confidence: low
topic: workflow
created_at: 2026-07-29
---

# Formalize the PR-first workflow

## Observation

The repo currently has `LOCAL_FIRST=true` in `.env`, which instructs agents to land changes as direct commits on the current branch. However, GitHub branch protection requires changes to `main` to go through pull requests, and the user has explicitly directed the agent to use PRs first.

This creates a mismatch between the documented local-first mode and the actual delivery constraint.

## Why now

Recent work was pushed directly to `main` despite the branch-protection warning, violating the PR-first contract. Aligning the workflow reduces friction and prevents future bypasses.

## Suggested action

1. Update `.env` to `LOCAL_FIRST=false` or add a project-specific note that `main` changes require PRs.
2. Update `wiki/brain/constraints/remote-promotion-requires-pr.md` or add a new constraint clarifying that all `main` promotion must go through PR, even when `LOCAL_FIRST=true` for other branches.
3. Optionally, shape an ADR if this is a structural change to the delivery model.

## Sources

- `wiki/brain/constraints/remote-promotion-requires-pr.md`
- `wiki/brain/constraints/explicit-approval-for-commits.md`
- `.env`
