---
kind: decision
status: accepted
confidence: medium
---

# ADR — Versioning and release strategy for pi-brain

## Context

pi-brain has reached a coherent first milestone: default guardrails against eager implementation, smarter autonomy, a fixed `brain-state` runner, and a shaped upstream-template-sync workflow. Users will want to know which version they are running, and the upstream-template-sync feature needs tagged releases to diff against. The package is also structured as a pi-package (`package.json` with `pi.extensions`, `pi.skills`, `pi.prompts`, `pi.themes`).

## Decision

pi-brain uses **SemVer** starting at **0.1.0**.

- `MAJOR` — breaking changes to the agent contract, file layout, or extension API.
- `MINOR` — new features, commands, or significant guardrails.
- `PATCH` — bug fixes and small improvements.

Each release produces:

1. A **git tag** in the format `v0.1.0`.
2. A **GitHub release** with release notes summarizing the changes and linking to ADRs/records.
3. An **npm package** (`@misabegovic/pi-brain`) so users can install the extension/skills/prompts/themes via `pi install @misabegovic/pi-brain`. The unscoped name `pi-brain` is already taken on npm, so we use a scoped package under the maintainer's npm username.

The template-clone workflow and the pi-package workflow are complementary:
- Clone the repo or use a GitHub template to create a new brain home.
- Install the pi-package to get the extension, skills, prompts, and theme in pi.

## Alternatives considered

1. **No releases, just trunk.** Keep developing on `main` without tags.
   - *Rejected:* makes upstream template sync impossible to version; users can't pin to a known-good state.

2. **GitHub releases only, no npm package.** Tag releases but don't publish to npm.
   - *Rejected:* the package.json is already a valid pi-package; publishing makes installation easier and signals stability.

3. **npm package only, no GitHub releases.** Publish to npm but don't tag on GitHub.
   - *Rejected:* git tags are needed for the reference-repo diff in upstream template sync.

4. **SemVer tags + GitHub releases + npm package.** (Chosen.)
   - *Pros:* covers all use cases: versioned diffs, installable package, human-readable release notes.
   - *Cons:* adds release overhead; requires npm credentials and CI or manual publish steps.

## Consequences

- Users can pin their clone to a specific pi-brain version.
- `brain:update` can compare `template_version` against git tags.
- Release notes become a lightweight changelog.
- We commit to maintaining backward compatibility within a minor version where possible.

## Related

- [wiki/brain/adrs/upstream-template-sync.md](../adrs/upstream-template-sync.md)
- [wiki/brain/bets/version-0-1-0.md](../bets/version-0-1-0.md)
- [package.json](../../../../package.json)
