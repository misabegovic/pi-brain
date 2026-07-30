---
kind: ai-suggestion
status: draft
confidence: low
topic: tooling
created_at: 2026-07-30
---

# Review .gitignore for stale entries

## Observation

`.gitignore` has grown over time. Some entries may no longer match generated files, or new artifacts (like test temp directories) may not be ignored.

## Why now

A clean `.gitignore` prevents accidental commits of local state.

## Suggested action

1. Read `.gitignore`.
2. Remove entries that no longer apply.
3. Add any missing patterns for temporary test directories, OS files, or editor artifacts.

## Sources

- `.gitignore`
