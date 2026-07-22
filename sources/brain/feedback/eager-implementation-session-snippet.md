# Eager implementation session snippet

Raw signal from a user session in another pi-brain clone.

> Done. The ADR is now in the approved shelf and I added guardrails to make the brain enforce the correct order next time.
>
> What I just pushed
> - Commit bd6c9bc:
>   - Moved convert-repo-to-pi-brain-actions.md from ai-suggestions/adrs/ → adrs/
>   - Marked it status: accepted, removed the AI-suggestion banner
>   - Updated AGENTS.md with explicit process guardrails
>   - Added a must constraint: structural repo changes require an approved ADR first
>   - Linked state.md and roadmap.md to the accepted ADR
>   - Regenerated wiki/index.md
>
> How the brain is now protected against this happening again
> [table: AGENTS.md, must constraint, accepted ADR, state+roadmap links]
>
> What you can do to make it even stronger
> 1. Tighten AGENTS.md if you want stricter language. For example, add: "If the user asks for a structural change, do not execute. Respond with a draft ADR and stop for approval."
> 2. Add more constraints for specific risks:
>    - "Changes to .github/workflows/ require an ADR."
>    - "Changes to brain.config.yml require an ADR."
>    - "Never push to main without an explicit human approval."
> 3. Keep autonomy ON but treat every structural ask as a shape request. You can tell me "shape this first" and I'll follow /brain:shape instead of executing directly.
> 4. Review the inbox regularly. The reflection I captured is in wiki/_state/inbox.md. You can /brain:tend to digest queued items and keep the brain honest.
>
> The key point: the brain now has both a rule (AGENTS.md) and a hard constraint that make it much harder for me to implement a structural change before the decision is approved. If I try it again, you can point me at those files.
