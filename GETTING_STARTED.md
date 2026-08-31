# Getting started with pi-brain

A quick checklist for using pi-brain on a real project.

## 1. Install the pi-brain package once

```bash
pi install @misabegovic/pi-brain
```

This gives every pi session the brain extension, skills, prompts, themes, templates, personas, and tools.

## 2. Choose your setup

- [ ] **Create a content-only clone** for a new brain.
  ```bash
  bash tools/clone-pi-brain.sh ~/projects/my-project-brain "My Org"
  cd ~/projects/my-project-brain
  ```
- [ ] **Or convert** an existing repo so the code lives inside the brain.
  ```bash
  cd my-existing-project
  /brain:convert files --dry-run   # preview
  /brain:convert files             # apply
  ```
- [ ] **Or onboard** an external repo and keep the brain repo-agnostic.
  ```bash
  /brain:ingest-repo /path/to/repo my-project
  # or
  /brain:ingest-repo https://github.com/org/repo.git my-project
  ```

## 3. Bootstrap the environment

- [ ] Run the local setup script.
  ```bash
  bash tools/setup-local.sh
  ```
- [ ] Validate the local setup.
  ```bash
  npm run validate
  ```
- [ ] Configure a provider API key so pi can use an LLM.
  - Set `GOOGLE_API_KEY`, `ANTHROPIC_API_KEY`, etc. in `.env` or via `/login`.
- [ ] Decide on delivery mode.
  - Solo/local-first: set `LOCAL_FIRST="true"` in `.env` (default). Land small commits directly.
  - Team/CI mode: set `LOCAL_FIRST="false"`. Open a PR per bet, using `.github/pull_request_template.md`.

## 3. Configure the brain

- [ ] Edit `brain.config.yml`:
  - set `org`
  - add active repos/scopes
  - enable connectors and list repos/pages/channels if needed
  - set `auto_connect: true` only if you want connectors to run opportunistically
- [ ] Run `/brain:setup` if you want the wizard.

## 4. Seed the permanent layer

- [ ] Run `/brain:projects` to confirm your scopes.
- [ ] Run `/brain:deepdive` on key parts of the repo to build context.
- [ ] Capture initial constraints in `wiki/<scope>/constraints/`.
- [ ] Create records for parts of the system you already understand.
  ```bash
  /brain:shape <scope> --record <description>
  ```

## 5. Start shaping work

- [ ] Capture a pitch or note.
  ```bash
  /brain:capture "We should decouple the billing service from notifications"
  ```
- [ ] Shape it when ready.
  ```bash
  /brain:shape <scope> decouple billing from notifications
  ```
- [ ] Review the PRD, ADR, bet, and constraint check.
- [ ] Approve or iterate. Approved artifacts move to the commitment layer.

## 6. Deliver and record

- [ ] Implement the approved bet in the project repo.
  - Local-first: commit with title `<scope>: <verb> <description>` and reference the ADR/PRD/bet in the body.
  - Team mode: open a PR using `.github/pull_request_template.md`; write a short natural summary and link inline to the ADR/PRD/bet/record in the pi-brain clone. Do not include sensitive data, session URLs, or env vars.
- [ ] For external target repos, push the decision record to the pi-brain remote **before** opening the target-repo PR.
- [ ] After merge, create/update the record in `wiki/<scope>/records/`.
- [ ] Mark the original ADR/PRD as superseded or archived if needed.

## 7. Generate and sync code from intent

If your PRD/ADR uses YAML intent blocks, pi-brain can generate and track code:

- [ ] Build from approved intent.
  ```bash
  /brain:build <scope> <types|interfaces|...>
  ```
- [ ] Check for drift between intent and existing code.
  ```bash
  /brain:diff <scope> <types|...>
  ```
- [ ] Reconcile drift with proposals.
  ```bash
  /brain:sync-code <scope> <types|...>
  ```
- [ ] Propose revisions to intent based on new evidence.
  ```bash
  /brain:revise <scope> <artifact-slug>
  ```

## 8. Maintain the brain

- [ ] Run `/brain:tend` to digest the inbox.
- [ ] Run `/brain:links` to find orphans, dead links, and suggestions.
- [ ] Run `/brain:groom` to decay confidence, archive stale pages, and compact commitments into records.
- [ ] Run `/brain:state` to regenerate state/roadmap/options pages.
- [ ] Run `/brain:sync` before committing to validate and regenerate `wiki/index.md`.
- [ ] Run `/brain:update` to update pi-brain. It tries the package path first (`pi install @misabegovic/pi-brain@latest`) and falls back to the legacy GitHub diff/apply flow if needed.
- [ ] Run `node tools/migrate-clone.mjs <clone-path> --dry-run` to migrate an existing full-repo clone to the content-only, package-resolved model.

## Optional enola architecture intelligence

pi-brain can integrate with [enola](https://github.com/enola-labs/enola) to detect architectural regressions in target repositories. The intent surface — `/brain:enola-govern` and compiled wiki verdicts — needs enola v0.3.9 or later; the dependency-purpose declaration below needs v0.4.8, and this repository is verified against v0.4.11. Snapshot artifacts (`facts.jsonl`, `insights.json`, `receipt.json`) follow the versioned contract enola documents under `docs/schema/` as of v0.4.10, with `receipt.json` carrying `format_version`.

1. Install enola:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/enola-labs/enola/main/install.sh | sh
   ```
2. Add to `brain.config.yml` — **flat dotted keys**, which is the shape the config parser reads (a nested `enola:` block silently parses as disabled):
   ```yaml
   enola.enabled: true
   enola.target_repo: ./path/to/target/repo
   enola.gate_build: true
   enola.gate_sync_code: true
   enola.auto_baseline: true
   # Only for a binary whose commands differ from the current CLI:
   # enola.check_args: "check"
   # enola.baseline_args: "baseline pin"
   ```
   The binary resolves env-first: `ENOLA_BINARY`, then `enola.binary`, then `enola` on PATH. Set `ENOLA_BINARY` in `.env` when the PATH copy is a downstream build you do not want grading this repository.
3. Pin the initial baseline:
   ```bash
   /brain:enola-baseline
   ```
4. Use enola-aware commands:
   - `/brain:enola-check`
   - `/brain:enola-capture`
   - `/brain:enola-generate` — record a snapshot receipt
   - `/brain:enola-diff` — detect architecture drift
   - `/brain:enola-citations` — verify receipt citations
   - `/brain:enola-impact <symbol>`
   - `/brain:enola-query <term>`
   - `/brain:enola-plan <path> [path...]` — the pre-edit contract: declared constraints and blast radius for intended paths (also injected by the intent-first gate beside the governing trail)
   - `/brain:enola-findings` — snapshot findings grouped by explainer, joined against the judgment ledger; candidates to verify, never verdicts
   - `/brain:enola-judge <source:title> <accepted|rejected|noise> <why…>` — record a verdict at `wiki/_state/enola-verdicts.json` so the next session inherits it rather than re-deciding; the ledger is write-on-judgment, so absence means unjudged, never queued

5. Cite receipts in wiki prose:
   ```markdown
   enola receipt pi-brain `sha256:72d38a9e…` @ `0f1c75b`, 2026-07-31
   ```

6. Declare dependency purposes in `enola-intent.yaml` (enola v0.4.8+). The `manifests` extractor already measures which packages are declared and pinned; what no parser can measure is *why* a package is there, so each direct dependency carries a mandatory `purpose:` and the intent explainer diffs the declaration against the manifests — a measured package nothing declares becomes a finding. This repository's own `enola-intent.yaml` is the worked example.

Three enola surfaces are deliberately not wrapped, so their absence is named rather than silent: `coverage` reports cross-repository edge resolution and pi-brain drives one target repository at a time; `history`/`blame` are served by the enola binary directly (`enola log|show|diff|blame|gc` against the target); and finding *trends* are a fold over recorded receipts that no workflow here needs yet.

When gating is enabled, `/brain:build` and `/brain:sync-code` will block on structural regressions — and only on regressions. `enola check` exits 3 when the baseline is not comparable to the current snapshot; that is a non-verdict ("the graph was not asked"), never a pass and never a block, and the remedy is re-pinning the baseline. When `auto_baseline` is enabled, the baseline is re-pinned after successful code generation or apply.

## Experimental features

- `PI_BRAIN_EXPERIMENTAL_CONTEXT=1` enables relevant-record injection on every turn. Prototype only — measure quality before relying on it.

## Troubleshooting

- **No pi-brain home found:** run `/brain:setup` or set `PI_BRAIN_HOME`.
- **LLM not responding:** check that your provider API key is set.
- **Pre-commit hook fails:** run `node tools/brain-sync.mjs` manually and fix frontmatter errors.
- **Missing skills/prompts/themes after install:** verify `pi install @misabegovic/pi-brain` succeeded and that the package manifest is loaded.
