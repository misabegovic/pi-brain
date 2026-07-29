---
kind: ai-suggestion
status: draft
confidence: low
topic: ci
created_at: 2026-07-29
---

# Add a GitHub Actions workflow for npm publish on release

## Observation

npm publish currently requires a local OTP. This manual step is error-prone and blocks fully automated releases.

## Why now

Automating publish on GitHub release removes the OTP bottleneck and makes releases reproducible.

## Suggested action

1. Create `.github/workflows/publish.yml` that triggers on `release: published`.
2. Run `npm ci`, `npm run validate`, and `npm publish`.
3. Configure npm automation token in repository secrets (`NPM_TOKEN`).
4. Use `--provenance` for supply-chain transparency.
5. Document the release process in `README.md` or `GETTING_STARTED.md`.

## Sources

- `.github/workflows/ci.yml`
- `package.json`
