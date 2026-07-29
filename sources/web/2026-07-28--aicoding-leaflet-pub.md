---
kind: source
source_kind: web
source_url: https://aicoding.leaflet.pub/
ingested_at: 2026-07-29
summary: Fetched snapshot of Chad Fowler's Leaflet essays on AI coding, regenerative systems, spec-driven development, and production as compiler input
---

# https://aicoding.leaflet.pub/

Fetched snapshot of the Leaflet publication. The following is extracted plaintext from the page.

## When Diffs Stop Representing Decisions

## Specifications as Executable Intent

## A Concrete Example: Email Validation

## From Files to Intent Graphs

## What’s New and What Isn’t

## Why Traceability Failed and Why It Might Not Now

## Hard Problems and Failure Modes

## Versioning What Actually Matters

## The Myth of Code as Capital

## Systems Already Reveal the Hidden Economics

## Pace Layers: How Software Already Had Multiple Cost Regimes

## AI Reveals What We Already Ignored

## Why This Matters Now

## Durability Through Disposability

## From Maintenance to Regeneration

## The Phoenix Architecture

## What This Blog Will Explore

## An Invitation

## When Machines Learned to Code

## From Code Ownership to System Stewardship

## Immutability and Disposability as Destiny

## The Psychological Shock

## The n=1 Developer Emerges

## Rebirth, Not Replacement

## The Shape of What Follows

## Why This Constraint Matters

## The Myth of the Solo Genius

## Where n=1 Fails

## The Cognitive Load Theory of Architecture

## Meaning Lives Outside the Code

## Again, This Is Not Outsourcing

## What n=1 Tells You About Teams

## The Canary in the Architecture

## The Constraint That Produces Quality

### Infrastructure Figured This Out First

### Editing Code Is Mutation

### Mutable Code Accumulates Entropy

### The Phoenix Principle

### Why This Works Now

### What Survives Replacement

### Objections

### The Rule, Updated

### The Payoff

## Code is Cache

## The Spectrum of Test Durability

## The Cost of Durability

## Why the Boundary Matters

## Monitoring as Continuous Evaluation

## The Real Codebase

## Accumulation Is the Default Failure Mode

## Conceptual Mass

## Compaction Is Not Cleanup

## What Compaction Looks Like

## Architecture as Compaction

## Optionality

## The Discipline, Stated Plainly

## Constraints as Trust

## Two Strategies

## Architectural Trust

## The Real Leverage

## What Actually Persists

## Local Replacement, Not Global Amnesia

## Why the Outsourcing Analogy Fails

## What This Looks Like in Practice

## Fresh Code Is Not the Risk

## Where the Asset Lives

# The Hidden Cost of Keeping Code

# What Legacy Systems Already Proved

# The Politics of Deletion

# AI Sharpens the Imperative

# The Design of Deletable Systems

# Where This Leads

## Pace Layers, Briefly

## Where AI Thrives

## Where AI Struggles

## The Hard Problem: Finding the Layers

## AI Reveals False Layers

## The Gradient of Disposability

## Layer Separation Is an Architectural Act

## A Realistic Case Study

## Designing for Productive Tension

## What Comes Next

## The Pattern

## Why Regenerative Software Fits This Pattern

## What This Means for Practice

## The Throughline

## The Category Error, Revisited

## What UI Actually Represents

## Pace Layers, Used Precisely

## Where Regeneration Pressure Must Stop

## Why AI Makes This More Dangerous

## What Regenerative Architecture Demands of UI (and Developers)

## Regeneration Requires Conservation

## Fear Is a Signal

## What Are You Actually Afraid of Losing?

## Code as a Stand-In for Understanding

## The Deletion Test, Defined

## Oracles, Not Artifacts

## When Deletion Is Boring

## From Cognitive Load to Deletion Safety

## Finding the Grain

## A Concrete Example

## Finding the Sweet Spot

## Where This Doesn't Apply Cleanly

## What This Changes on Monday

## The Full Pipeline

## Why Redundancy Works Here

## No Layer Is Settling

## Designing for Absorption

## A System That Already Worked

## Frameworks Hide the Real Problem

## The Missing Compilation Target

## Instruction Sets for Systems

## The Constraints That Make Replacement Safe

## What Made the Wunderlist System Work

## Architecture as Runtime

## The Shift

## The Real Artifact

## Editing Compiled Binaries

## The Constraint

## Process Becomes Enforceable

## The Responsibility Inversion

## Version Control for Intent

## The Substrate Problem

## The Primitives

## Specifications Are Not Documentation

## Context Boundaries Are the New Architecture

## Provenance Replaces Narrative

When code can be thrown away and recreated, the unit of change is no longer lines of code. It’s reasons. Version control has to follow.

Regenerable systems quietly invalidate an assumption that has underpinned software engineering for decades: that the text of the code is the best record of how and why a system came to be. Once an AI can reliably regenerate an implementation from specification, the code itself becomes an artifact of synthesis, not the locus of intent.

By regenerable, I mean: if you delete a component, you can recreate it from stored intent (requirements, constraints, and decisions) with the same behavior and integration guarantees.

In that world, version control doesn’t disappear, but it has to move upstream.

Traditional version control works because code edits are a reasonable proxy for human decisions. Someone typed this conditional. Someone refactored that loop. A diff is an imperfect but serviceable record of authorship.

AI-assisted generation severs that link.

When an agent reads a specification, reasons about constraints, chooses an approach, and emits code, the resulting text reflects outcomes, not decisions. A diff can show what changed in the artifact, but it cannot explain which requirement demanded the change, which constraint shaped it, or which tradeoff caused one structure to be chosen over another.

This is the sense in which code-first version control becomes a lossy history. Not because diffs are useless (they still matter operationally) but because they no longer represent the causal history of the system. They tell you what happened, not why it happened.

That distinction matters once code is no longer directly authored.

In a regenerable system, specifications are no longer descriptive documents. They are executable inputs.

If a component can be deleted and recreated at will, then whatever information is required to recreate it is, by definition, the source of truth. Specifications stop being explanatory prose and become causal inputs.

The same is true of an agent’s plan.

The plan that matters isn’t free-form thinking. It’s the decision record: chosen strategy, rejected alternatives, and the constraints that forced the choice. Even when the choice is wrong, it’s still the most useful artifact to preserve: it explains why the system looks like this. Treating this as throwaway reasoning discards information that is often more important than the final text.

The plan is not documentation. It is part of the implementation.

Consider a small component: a function that validates email addresses.

A specification might state:

The system must accept standard email addresses of the form local@domain.

It must reject inputs without exactly one @.

It must not attempt full RFC compliance.

An agent produces a plan:

Use a simple regular expression.

Do not rely on external libraries.

Explicitly reject whitespace.

Favor readability over completeness.

From this, code is generated.

Now the requirement changes:

The system must accept internationalized domain names (IDN) in the domain portion.

Nothing else changes.

In a code-centric workflow, you inspect the diff and infer intent after the fact. In an intent-centric workflow, a single requirement node changes, the dependent plan node(s) changes, and the generated code changes as a consequence. The unit of change is not “these lines,” but “this reason.”

You can now answer not just what changed, but why it had to.

To support this, intent cannot live in a loose collection of documents. It needs structure.

The representation that works is a content-addressed graph. Individual requirements, constraints, plans, decisions, and environmental factors become nodes. Each node has a stable representation and a hash derived from its content. Edges express causality: this plan depends on that requirement; this decision exists because of that constraint.

In practice, each node needs at least: a type, canonical content, explicit dependencies, and evaluation artifacts (tests, constraints, budgets) that make regeneration checkable.

Even in the small example above, the graph is explicit:

A requirement node: “accept standard email addresses”

A constraint node: “no RFC compliance”

A plan node: “use a regex, reject whitespace”

A generator node: “Claude-class model, email-validator template”

The code sits downstream of all four.

The “version” of the component is the root hash of this graph. Change a requirement and only the downstream nodes change. Regenerate with identical inputs and the root hash remains stable. Identity moves from files to intent.

None of these ideas exist in isolation.

Build systems like Bazel—and increasingly Nix-style systems—use hashed inputs and content-addressed caches to track which inputs produced which outputs. Formal methods have long pursued specifications with mathematical semantics precise enough to analyze and verify.

What’s new is the coupling.

Bazel tracks build causality. Formal specifications describe logical intent. Regenerable systems require generative provenance: a direct, machine-enforced link between intent and implementation. The specification graph doesn’t sit beside the system. It drives it.

Description can drift. Drivers cannot.

Industries have attempted requirements traceability for decades, usually through tickets, spreadsheets, and process checklists. It often failed in mainstream software because humans were asked to maintain links that the system itself did not depend on.

Regenerable systems invert the incentives.

If a system can regenerate itself, it must already know what it’s doing. Provenance stops being overhead and becomes infrastructure. The links exist because generation requires them.

This does not describe how today’s AI tools work. Current generators do not emit stable, versionable plans or structured intent graphs. This is not a description of the present. It’s an argument about the direction forced by regeneration economics: the cost of re-deriving code keeps falling, while the cost of rediscovering intent does not.

This model raises real challenges.

Specifications expressed in natural language require canonicalization. Two nodes may be semantically equivalent but textually different, and we won’t always detect that reliably. Agents will make implicit assumptions that are not explicitly recorded. Non-deterministic generators may produce different code from identical intent graphs.

These are not reasons to abandon the approach. They are design constraints.

The model does not require perfect formalization. It requires tractability—and tractability improves as specifications become more structured, plans become explicit, and generators are forced to surface their decisions. Ambiguity becomes visible rather than hidden in diffs.

Even failure becomes diagnosable at the level that matters: intent.

Git taught us how to version text.

Regenerable systems force us to version intent: the requirements, constraints, and decisions that caused a system to take its current shape. Code still matters but it becomes an artifact, not the record of authorship.

The tools to do this well don’t fully exist yet. But the pressure is already here. If code can be recreated at will, the question becomes unavoidable:

What, exactly, is worth preserving, and how would you know?

When we talk about software economics in the age of generative AI, it can feel like we’re inventing something entirely new. But the truth is that many of the economic pressures now simply reveal dynamics that have always existed beneath the surface of software development.

For decades, most engineering cultures treated code like a durable asset. The prevailing mindset was:

Code should be long-lived

“Technical debt” must be paid down

Rewrite is failure

Maintenance is virtue

This made sense when the dominant cost of software was writing it: hiring, training, manual coding, test cycles, and team coordination absorbed most of the budget. But that interpretation created a myth: that code itself is valuable capital.

It isn’t.

Legacy systems — codebases decades old still running mission-critical functions — are often costly only because they are expensive to understand and maintain, not because their lines of code are inherently valuable. According to industry definitions, a legacy system is code that continues to serve a purpose but has become burdensome to evolve because of outdated technology or missing automated tests and documentation.

Even the term “legacy code” in software engineering — code without tests — implies maintenance risk, not long-term capital value.

Look at how successful evolutionary modernization of legacy systems happens in practice. Thoughtworks and other practitioners favor incremental, evolutionary strategies over “big bang” rewrites because they reduce risk and cost.

What do these approaches have in common?

They minimize the amount of code kept while surface area grows

They replace functionality in iterations

They rely on incremental modernization patterns

These are not new economic insights. They’re how humans have long coped with complexity when preserving old code becomes more expensive than replacing it.

Even before AI, many approaches (including my own) to evolutionary architecture were solidified as responses to the high cost of maintaining monolithic legacy codebases. They accept that restating, reshaping, and replacing parts of systems can be cheaper than preserving and patching old ones.

As discussed in a previous post, a useful lens for understanding why not all code should be treated the same is pace layering — a model first articulated by Stewart Brand to explain how complex systems adapt and endure.

In Brand’s original framing, different layers of a system evolve at different speeds:

Fast layers innovate and experiment

Slow layers stabilize and provide continuity

The tension between them produces resilience

Applied to software, this predicts that some parts of a system ought to change rapidly, and others slowly — because the economic cost and impact of change differ by layer.

This insight was true long before AI. In practice:

UI frameworks cycle quickly

Core business rules change occasionally

Deep infrastructure and protocol logic rarely change

Traditional engineering already valued some code as more durable because its replacement was expensive. This matches Brand’s argument that “fast learns, slow remembers”. Fast layers respond quickly to shocks while slow layers retain memory and continuity.

Generative AI collapses the cost of producing code, but not the cost of understanding it. Writing is cheap; comprehension is expensive. This exposes a core truth that legacy practitioners already knew instinctively:

Software isn’t valuable because it exists and serves a purpose. its value also lies in the requirement that we can reason about it, evolve it safely, and trust its behavior.

That’s why legacy systems become expensive: the burden of understanding and maintaining code outweighs its utility. Traditional approaches like software archaeology — reverse-engineering undocumented code — are symptomatic of organizations trying to carry cost forward because retiring code was harder than preserving it.

AI accelerates this pressure.

Today, as tools can generate massive amounts of code with little human effort, the economic question is no longer "How do we write code efficiently?"  It's "How do we reduce the long-term cost of what we write?"

That question demands we rethink what we treat as persistent. Underneath the shiny façade of AI productivity, the real economic driver will be systems that minimize the cost of comprehension, evaluation, and replacement.

More on this in the following posts.

Software is entering a strange new phase.

For most of its history, code was expensive to produce and cheap to keep. We treated it like a durable asset: written carefully, maintained lovingly, upgraded cautiously. Whole professions, identities, and institutions grew around this assumption. Programmers were craftsmen. Codebases were cities. Refactoring was urban renewal.

Generative AI breaks this assumption at the root.

Code is no longer scarce. It is abundant, fast, and increasingly disposable. The limiting factor is no longer writing software, but understanding, evaluating, and governing it. The economics have inverted. The psychology hasn’t caught up.

This publication exists to explore what comes next.

The central paradox I want to explore is simple:

The most durable systems of the AI era will be built from code that is meant to die.

When code is cheap to generate, preserving it at all costs becomes irrational. Yet we still need systems that are reliable, secure, comprehensible, and long-lived. The solution is not to fight ephemerality but to design around it.

This means shifting what we treat as permanent.

Not implementations, but interfaces

Not code, but behavior

Not files, but evaluations

Not ownership, but stewardship

In other words: the system is the asset. Code is just a consumable input.

Most software practices today are optimization strategies for a world where code is expensive to write and dangerous to replace. We edit files in place. We fear rewrites. We celebrate longevity of codebases as a proxy for quality.

AI changes the cost curve so dramatically that these habits start to look like technical debt generators.

Instead of maintaining code, we can regenerate it.
Instead of upgrading in place, we can replace.
Instead of debugging line by line, we can select between competing implementations.
Instead of trusting authorship, we can trust evaluation.

This is not a call for recklessness. It’s a call for discipline—a different kind than we’re used to.

The metaphor I keep returning to is the phoenix: systems designed to burn and be reborn, continuously, without losing their identity.

A regenerative system has a few defining traits:

Clear, durable boundaries that outlive any implementation

Tests and evaluations that define correctness independently of code

Automation that assumes replacement is normal, not exceptional

Explicit acceptance that code will rot, drift, or become incomprehensible

Cultural comfort with deletion, rewriting, and starting over

In such systems, failure is localized, recovery is fast, and improvement emerges through iteration rather than preservation.

The goal is not immortality of code.
The goal is immortality of intent.

Right now, many teams are using generative AI as a productivity multiplier inside old mental models. Faster coding. Bigger diffs. More surface area. Same assumptions.

That works—briefly.

But it also accelerates entropy. Larger codebases. Lower comprehension. More fragile systems. Higher cognitive load per developer. The very speed that AI enables becomes a liability.

We need architectures, workflows, and cultures that treat AI not as a faster typist, but as a fundamentally different substrate for building systems.

That requires rethinking:

What “quality” means when code can be rewritten tomorrow

How we test systems whose implementations are transient

How we organize teams when one person can ship what used to require many

How we manage cost when context windows and tokens replace headcount

How we remain accountable when authorship dissolves

These are not tooling questions. They are architectural and philosophical ones.

This will be a slow, cumulative exploration—one post at a time.

Topics I plan to cover include:

Pace layers and why different parts of systems should regenerate at different rates

The idea of n=1 development and what it means for teams and organizations

Evaluations as the true source code

Why rewriting beats refactoring in the AI era

How to design interfaces that survive constant replacement

The economics of code as cost, not capital

Cultural shifts required to celebrate deletion instead of preservation

Patterns for building systems that expect to be rewritten

Some posts will be conceptual. Some will be practical. Some will be uncomfortable.

That’s intentional.

This is not about hype, nor about dismissing decades of hard-won engineering wisdom. Many of the ideas here build directly on them—immutable infrastructure, test-first design, separation of concerns, automation, evolutionary architectures.

What’s changing is the environment.

When the substrate shifts, the architecture must follow.

If you’re building software with AI—or expect to be—you’re already living inside this transition, whether you’ve named it or not. My goal here is to help articulate a vocabulary, a set of patterns, and a philosophy that make the transition legible.

Software that lasts will not be frozen in amber.
It will be continuously reborn.

Welcome to Regenerative Software.

For most of computing history, programming was bottlenecked by human cognition. Translating intent into working software required time, attention, and specialized skill. Even small changes were costly. This scarcity justified entire ecosystems: languages, frameworks, methodologies, reviews, team rituals that made sense when every line was expensive.

Generative AI removes that scarcity.

Today, a single developer can generate thousands of lines of working code in minutes. Tomorrow, that number will be effectively infinite. The marginal cost of producing code is collapsing toward zero.

What hasn't collapsed is the cost of knowing what the code does.

Understanding, verifying, securing, and evolving software remain stubbornly expensive. In fact, they may be getting harder as volume explodes. This asymmetry—the ease of creation versus the difficulty of comprehension—is the defining tension of modern software.

Programming hasn't disappeared. But its center of gravity has shifted.

In the old world, programmers owned code. You wrote it, you understood it, you maintained it. Your value was tied to mastery of specific implementations. Codebases accrued history, reputation, and power.

In the new world, ownership becomes a liability.

When code can be regenerated faster than it can be understood, preserving it for sentimental or historical reasons no longer makes sense. What matters instead is stewardship: maintaining the system's behavior, boundaries, and intent over time, regardless of how many times its internals are replaced.

This reframing is subtle but profound:

The asset is no longer the codebase. The asset is the system's ability to keep working.

This is the thesis of everything that follows. Architecture, testing, interfaces, team structure: all of it flows from this inversion.

Many of the "modern" software practices of the last decade were early adaptations to this shift, even if we didn't articulate them that way.

Immutable infrastructure. Stateless services. Containers. Blue-green deployments. Infrastructure as code.

These ideas all share a common premise: never fix a running thing. Replace it.

AI pushes this premise beyond infrastructure and into application code itself. When rewriting is cheap, editing in place becomes risky. Mutation accumulates entropy. Replacement resets it.

Disposability stops being a hack. It becomes the default.

This transition isn't just technical. It's deeply psychological, and that psychology shapes architecture.

Many developers identify as builders and craftspeople. We take pride in elegance, cleverness, and mastery of internals. We accumulate knowledge inside our heads and inside codebases. Longevity feels like validation.

Generative AI destabilizes this identity.

When a machine can produce a competent version of "your" solution in seconds, craftsmanship no longer lies in the artifact. It lies in framing the problem, defining success, and deciding what to keep and what to discard.

The role shifts from maker to architect. From author to managing editor. From preserving code to designing for its replacement.

That shift is uncomfortable. And the discomfort isn't merely personal. It's what makes teams resist the very patterns that would help them. Developers cling to codebases because identity is at stake, not just technical judgment. Acknowledging this is the first step toward building systems that don't require heroics to change.

Resisting the shift doesn't stop it. It just makes systems more fragile.

One of the clearest signals of this new era is the rise of the n=1 developer.

Projects that once required teams now fit inside a single person's cognitive boundary—with AI filling in the execution gaps. Entire products can be specified, generated, evaluated, and shipped by one human working with machines.

This isn't about productivity hacks. It's about a structural change in leverage.

But n=1 development only works if systems are designed for it. Large, tangled, historically accreted codebases collapse under their own weight when AI accelerates change. Small, modular, disposable systems thrive.

The n=1 developer is not a superhero. They are an indicator species. They are evidence that the environment has changed, and proof that the new patterns actually work.

It's tempting to frame this as the "end of programming." That's misleading.

What's dying is a specific form of programming: one that equates value with authored code, longevity of code with quality, and maintenance with virtue.

What's being born is something closer to systems design as an ongoing process of regeneration:

Code becomes an intermediate artifact, not the final product. Rewrites become routine, not traumatic. Tests and evaluations define truth, not files. Stability emerges from replacement, not preservation.

This is not nihilism. It's pragmatism under new constraints.

The rest of this publication builds on a single premise established here:

When code is cheap and understanding is expensive, architecture must optimize for the impermanence of code.

Everything else (pace layers, evaluations, clean interfaces, regeneration workflows) flows from that fact.

We are not entering a world with less software. We are entering a world with vastly more of it. The only way to survive that abundance is to stop treating code as precious.

Programming is not dead.

But it has been reborn, and it expects us to change with it.

Here is a design constraint worth taking seriously: if your system cannot be understood, modified, and regenerated from specification by one competent engineer, it is already too complex.

This is not a statement about staffing. It is a statement about architecture.

Call it n=1 capability. The claim is not that you should run your engineering organization with one person. The claim is that you should design systems where one person could. That’s the test.

Systems that pass the n=1 test have specific properties: clear boundaries, externalized meaning, replaceable components, low coordination overhead. These are the properties you actually want. They scale judgment, not headcount.

A system that requires a team is not necessarily bad. But a system that requires a team just to understand it—where no single person can hold its shape in mind—has a problem that will compound. Every new engineer slows down. Every departure creates knowledge gaps. Every change requires negotiation across boundaries that exist only in people’s heads.

n=1 capability is the diagnostic. When one person can ship what used to require a team, it tells you something important about the system, not the individual.

Software culture has a long history of mythologizing exceptional individuals. We tell stories about lone hackers and 10x developers, and we treat outsized impact as evidence of rare talent.

That framing is comforting. It is also misleading.

Not to mention the fact that I have rarely worked with a “10x developer” that wasn’t also somehow a tax on the team, project, or system, a single developer can only be effective to the extent that the system allows them to be. No amount of skill lets one person safely reason about a sprawling, entangled codebase with unclear boundaries, implicit behavior, and hidden state.

When n=1 development works, it works because the system is shaped to allow it.

The question should not be “how is that person so productive?”

The question is “what properties of the system make this possible?”

The answer will never be talent alone. It will be boundaries, compaction, evaluations, and replaceability. Those are architectural choices.

Take a typical large system. Thousands of files. Deep dependency graphs. Implicit invariants. Behavior encoded in history. Knowledge distributed across people.

Drop a single developer into that environment and watch what happens. They slow down. They become cautious. They avoid change. They depend on tribal knowledge they do not have.

This isn’t a talent problem. It’s an architectural one.

n=1 development fails when the cost of understanding the system exceeds the capacity of one human mind. That was te normal state of affairs for decades. The team was a coping mechanism for complexity that had outgrown individual cognition.

The limiting factor in software has never been typing speed. It has always been cognition.

n=1 development works when the total cognitive load of the system fits within one person’s mental budget. This is not about making systems small. It’s about making them comprehensible. A large system can be n=1 capable if its structure allows a single mind to reason about it in layers, with clean boundaries between concerns.

This requires compaction: eliminating accidental complexity, enforcing boundaries aggressively, designing for replacement rather than accumulation.

Legacy systems too large for a single human to understand might only be that way because they lack boundaries and abound with accidental complexity. In other words, the true essence of a complex legacy system might still be simple and n=1-accessible if not for all the damn code.

Generative AI didn’t create these requirements, but it certainly reveals them. AI makes it easy to generate code. Generation without comprehension is just faster accumulation of debt. Compaction and regeneration make it possible to control what AI produces. Without those disciplines, AI simply accelerates collapse.

The systems that enable n=1 development share a common property: meaning is externalized.

Behavior is defined by evaluations, not implementations. Contracts live at interfaces, not in comments or unstructured documentation. Monitoring catches drift before it compounds. Automation makes replacement cheap.

In such systems, AI does not replace engineers. It removes the tax of manual execution, allowing a single person to operate at the level of architecture instead of implementation. The human holds the shape. The machine fills it in.

This only works when the shape is explicit enough to verify. If correctness depends on social knowledge rather than mechanical enforcement, AI code generation is a liability. It can produce output, but no one can tell (at least quickly enough) whether the output is right.

It’s tempting to compare n=1 development to past attempts at labor arbitrage. That analogy fails for an important reason.

Outsourcing tried to scale execution without externalizing system knowledge. It relied on supervision, documentation, and process to compensate for implicit structure. The coordination cost remained; it just moved.

n=1 development works only when the opposite is true. The system must be so well-defined that supervision is unnecessary. Behavior must be enforced mechanically, not socially. Correctness must be observable, not inferred.

n=1 is not cheaper labor. It is cheaper coordination. That’s a different thing entirely.

n=1 capability does not mean teams go away.

It means teams are no longer required to compensate for architectural opacity. In well-designed systems, one person can own a component end-to-end. Teams form around interfaces, not codebases. Collaboration happens at boundaries. Coordination cost drops dramatically.

n=1 is a lower bound, not a mandate. When systems are compact and regenerative, adding people becomes a choice, not a necessity. You scale because you want to go faster or cover more ground. Not because the system has become too complex for any one person to hold.

This is the real test: if you can’t get to n=1 in theory, your architecture is already too expensive.

n=1 capability is a leading indicator.

If your system cannot be understood, modified, and regenerated by one competent engineer, it is living on borrowed time. That does not mean it is broken today. It means its complexity is compounding faster than your ability to manage it.

AI will not save such systems. It will make their fragility visible faster. Every acceleration in generation speed is also an acceleration in accumulation speed. Accumulated complexity eventually wins.

The systems that thrive will be the ones designed for n=1 from the start. Not because they’ll be run by one person, but because the constraint produces the properties that matter: coherence, replaceability, verifiability.

When you see n=1 development succeeding, don’t dismiss it as heroics. Don’t write it off as “not real engineering.” Ask what it reveals.

The system’s complexity has been reduced to the point where human judgment, assisted by machines, is sufficient to keep it coherent. That is not the end of software engineering. It is what software engineering looks like when architecture finally matters more than artifacts.

n=1 is not a staffing goal. It is a design goal.

Design for n=1 capability. Not because you want to run lean, but because systems that pass the test are systems worth building.

In 2013, I wrote about trashing servers and burning code. The argument was simple: systems that mutate while running accumulate state, history, and uncertainty in ways humans can't reason about. When something breaks, nobody knows which change caused it or what the system actually is anymore.

So we stopped patching servers and started replacing them. We built machines that could burn down and rise again, identical in behavior, without human intervention. The server wasn't the thing. The capability to regenerate was the thing.

That was an infrastructure principle, but it has always felt true to me for software. I was CTO for the company behind the popular Wunderlist productivity tool at the time, and as CTO I came up with a simple set of rules for choosing technologies we deployed at work:

anyone can decide to use any new language or framework they want, but

it must work with our build system,

it must work with our deployment system,

they must find at least one other person on the team to work on it with them and support it if necessary and

(this is the most important part) the code has to be no more than "this big", which I'd say while holding up my hand with my fingers spread apart a few inches.

That last part constrained the code in such a way that the worst thing that could happen with a new language or technology is that it crashed, nobody on call was able to fix it, and it would be trivial to rewrite and replace. And we did that sometimes.

Code could even be treated like cells. As humans, parts of our biological material are dying all the time, yet the system (our body, brain, mind) remains.

So today, if code can be regenerated cheaply, perhaps upgrading code in place is the antipattern.

Immutable infrastructure wasn't adopted because it was elegant. It was adopted because mutable systems failed in ways that were hard to diagnose, hard to reproduce, and hard to roll back. Snowflake servers. Configuration drift. Hand-applied fixes. Tribal knowledge baked into machines nobody could recreate.

Replacing machines instead of fixing them solved this not by making systems smarter, but by making them simpler to reason about. Each deployment was a clean slate. Each artifact was knowable.

The key insight was almost more economic than technical: mutation accumulates hidden cost faster than replacement does.

That insight is now true for application code.

When you edit code in place, you're doing the software equivalent of SSHing into a production server and tweaking a config file.

You're assuming you understand the full state of the system. You're assuming the change is local, that history doesn't matter, that side effects are predictable.

Those assumptions were always shaky. They're becoming untenable. As code is generated more rapidly, whether by humans, AI, or both, the mutation rate increases while the understanding rate stays flat or declines.

Every in-place edit is a drift event. AI just makes this visible by compressing the timeline.

In-place modification has a hidden cost profile. Incremental edits entangle intent with the sequence of changes that produced them. Code gets layered atop code (this is why developers often prefer to use git rebase instead of git merge). Local fixes obscure global behavior. Understanding requires replaying the evolution of the codebase in your head — archaeology instead of engineering.

This is exactly how legacy systems are born. Not through age, but through mutation. A system becomes legacy when understanding it requires historical knowledge that isn't encoded anywhere except the code itself.

The tragedy is that teams recreate this failure mode faster with AI, because mutation feels cheap while understanding quietly becomes expensive. You can generate a thousand lines in seconds. But the moment you start editing those lines, you've created an artifact that can only be understood historically. You've created brittle legacy code in an afternoon.

Replacing code avoids this entirely.

What made immutable infrastructure work wasn't really about servers. It was about a property: the ability to burn something down and have it rise again, identical in behavior, without human intervention or institutional memory.

That property—call it the phoenix principle—is what makes systems understandable at scale. Not documentation. Not code comments. Not the engineer who remembers why that conditional exists. The ability to regenerate from specification.

Applied to code, this means: if you can't regenerate a component from its specification and evaluation criteria, that component is not well-defined enough to exist.

That's not cruelty. That's feedback. The fire tells you what you actually knew versus what you only thought you knew.

Replace-over-modify systems behave differently. Each regeneration is explicit. Each deployment is intentional. Rollback is trivial. Drift cannot accumulate. The system burns and is reborn, but its identity persists because its behavior is externally defined.

Historically, we avoided full replacement because writing code was expensive, coordination was slow, re-testing everything was painful, and human review was the bottleneck.

AI changes the cost of generation. Testing is automated. Coordination happens through interfaces.

But the deeper shift is this: comprehension became the bottleneck.

The entire history of software engineering has been about making code easier to understand. Style guides, design patterns, clean code, self-documenting functions — all of it assumed that humans would read and reason about implementations. We optimized for readability because reading was mandatory.

Immutable code sidesteps that problem. If a component can be regenerated from spec, understanding its implementation is optional. You need to understand the contract, the interface, the expected behavior. You don't need to understand how it achieves that behavior, because the "how" is transient.

The expensive thing left is defining what you want. Comprehension of implementations becomes a debugging activity, not a maintenance activity.

If code is immutable, something else must carry continuity.

That something is: interfaces, contracts, evaluations, monitoring, and data. These are the stable layers. Code is a transient expression of them.

This mirrors infrastructure perfectly. AMIs mattered less than APIs. Containers mattered less than contracts. Servers mattered less than services.

The thing you cared about was never the machine. It was what the machine did and how you could verify it was doing it correctly.

Software is catching up to the same realization. The code is not the asset. The specification and the evaluation are the asset. Code is just the current rendering.

"This is wasteful." Mutation is wasteful. It just hides the cost in future debugging, onboarding, and incident response. Replacement is explicit cost with bounded risk.

"We'll lose optimizations." If an optimization matters, encode it as a constraint or invariant. If you can't express it formally, it probably wasn't real value — it was accident.

"What about institutional knowledge?" This is the real anxiety. The code embodies decisions nobody wrote down. But that's precisely the problem immutable code solves. If knowledge only exists in the implementation, it's not knowledge. It's risk. Regeneration forces you to make the implicit explicit, or accept that it wasn't essential.

"This won't work for large systems." Large systems already replace infrastructure constantly. Code is next. The hard part is decomposition, not replacement.

"This breaks developer intuition." So did containers. So did CI. So did version control. So did every advance that traded local convenience for systemic clarity.

The old rule was: never upgrade infrastructure in place.

The new rule is: never upgrade code in place if you can regenerate it instead.

Just like SSHing into a server and tweaking something in production is still possible but clearly undesirable, editing code is now a last resort, a sign that regeneration failed, that your specification was incomplete, that your evaluations weren't sufficient. It's a debugging activity, not a development activity.

Immutable code yields predictable deployments, lower cognitive load, cleaner rollback, easier audits, faster evolution, and smaller blast radius.

But the real payoff is psychological. You stop being afraid of change. You stop tiptoeing around legacy decisions. You stop asking "what will this break?" and start asking "does this pass the evaluation?"

The code becomes a renewable resource instead of a fragile artifact.

Infrastructure taught us that mutability was the enemy of understanding.

AI teaches us the same lesson again — higher up the stack.

If you're still editing AI-generated code in place, you're reliving the worst era of configuration drift, just faster. You're creating legacy systems in days instead of years.

Burn it. Regenerate it. Trust what survives the fire.

If deleting your codebase feels terrifying, your evaluations are insufficient. That's not a moral failure. It's a technical one—and in the age of AI-assisted development, it's an increasingly expensive one.

Here is the shift: language models have made code generation cheap. Not free, not perfect, but cheap enough that regenerating a service is often faster than understanding and modifying it. This changes what counts as a durable asset. Code isn't it. Code is now a materialized view of understanding—useful while current, disposable when stale.

The durable asset is the thing that lets you regenerate with confidence: evaluations that encode what the system must do, independent of how any particular implementation does it.

Traditional software culture treated code as the memory of the system. It encoded intent, explained decisions, and preserved behavior over time. Protecting it was rational because replacing it was expensive.

That expense has collapsed. When a model can produce working code from a description in minutes, the calculus inverts. Keeping code around "just in case" stops being wisdom and starts being hoarding. The implementation is a cache. It's a snapshot of your current understanding, useful for running in production, not precious in itself.

If you delete a codebase and can't confidently regenerate it, that's not a tragedy. It's a diagnosis. The problem wasn't the deletion. The problem was that nothing important lived outside the code. The intent, the constraints, the behavioral requirements were all implicit in the implementation rather than explicit in artifacts that survive the implementation's death.

Most engineers, asked how they ensure a system works, answer "tests." But tests vary enormously in what they actually protect.

Consider a unit test that verifies a specific function's behavior by calling it with specific inputs and checking specific outputs. This test is coupled to that function's existence, its signature, its language. Rewrite the service in a different language and the test doesn't just fail. It can't run at all. The test's lifetime is bounded by the implementation's lifetime.

This isn't because the test was poorly written. Even exemplary TDD—testing behavior over structure, focusing on public interfaces—produces tests that assume the codebase continues to exist in the same language with the same entry points. That assumption was safe when reimplementation was rare. It's not safe when regeneration is routine.

The alternative is tests specified at a boundary that survives reimplementation:

Invariants are properties that hold regardless of implementation. "Balances never go negative." "Events maintain causal ordering." "Round-trip serialization is lossless." These can be verified against any implementation in any language.

Contracts specify what crosses boundaries between components. If service A sends this shape, service B returns that shape. The contract survives reimplementation of either service.

Property-based tests verify behavioral properties across generated inputs. "Sorting is idempotent." "Encryption and decryption are inverses." These encode what must be true, not how to make it true.

End-to-end behavioral checks verify the system's observable outputs. Given this input, the system produces output in this class. The internal path doesn't matter.

These are durable evaluations. They encode intent at a level of abstraction that outlives any particular implementation. A codebase can be deleted and regenerated; if these evaluations pass, the system still works.

This is where most manifestos would stop. Having sold the destination, ignore the hike. But, writing durable evaluations is hard. Genuinely hard. Harder than writing the code they specify.

Identifying true invariants requires deep domain understanding. Most systems have implicit invariants that no one has articulated. They're embedded in code that "just works" without anyone knowing exactly why. Extracting these invariants is archaeological work.

Property-based testing requires thinking in universals rather than examples. Instead of "when I call sort([3,1,2]), I get [1,2,3]," you must specify "for all lists, sorting produces a list with the same elements in non-decreasing order." This is a different mental motion than example-based testing, and most engineers haven't practiced it.

Formal contracts require precision that natural language resists. "The API returns user data" is not a contract. "The API returns a JSON object with fields id (string, non-empty), email (string, valid RFC 5322), and created_at (ISO 8601 timestamp)" is a contract. The gap between these is where bugs hide.

The investment is real. But the alternative (keeping code around because you're afraid to delete it, because nothing external specifies what it does) is also an investment. You pay it in cognitive load, in context-window costs, in the compounding complexity of systems that only grow.

The question isn't whether durable evaluations are expensive. The question is whether they're cheaper than the alternative. As regeneration gets cheaper, the answer increasingly favors evaluation.

The distinction between ephemeral and durable tests reduces to one question: is the test specified at a boundary that survives reimplementation?

Tests against internal functions, private methods, specific call sequences: these are specified at the implementation boundary. They verify decisions that might change. Their lifetime is coupled to the implementation's lifetime.

Tests against inputs and outputs, observable behavior, interface contracts: these are specified at the system boundary. They verify obligations the system owes the outside world. The implementation can change completely as long as these obligations are met.

This isn't a new idea at all! Information hiding, API design, coupling versus cohesion, etc...the software engineering literature has understood interface boundaries for fifty years. What's new is the economic weight. When regeneration was expensive, careful interface specification was good hygiene. When regeneration is cheap, it's the difference between systems that can evolve and systems that calcify.

A simple check for you to apply: if reimplementing your service in a different language would invalidate your test suite, your tests are specified at the wrong boundary.

Even rigorous evaluations only verify intent at a point in time. They don't verify that production behavior matches intent continuously.

This matters more as regeneration frequency increases. Each regeneration is an opportunity for drift. Subtle changes in behavior that pass all explicit checks but diverge from baseline in ways no one anticipated. Monitoring catches what tests miss.

The relevant signals include standard operational metrics (latency distributions, error rates, throughput) but also business metrics specific to each application: conversion rates, fraud detection accuracy, revenue per transaction, whatever invariants matter in your domain. And for AI-assisted systems, add inference cost per request, token usage patterns, and context window consumption. If a regenerated system passes all tests but doubles your API costs or quietly degrades decision quality, that's a failure your evaluations didn't catch.

Monitoring is not separate from evaluation. It's evaluation that runs continuously against reality rather than periodically against test fixtures.

Three tiers of evaluation, three lifetimes:

Ephemeral tests verify implementation decisions. Unit tests, structural assertions, mock-heavy integration tests. Useful during development, disposable when the implementation changes. Write them freely; delete them without guilt.

Durable evaluations verify behavioral intent. Property tests, contract tests, invariants, end-to-end checks. These survive reimplementation because they're specified at boundaries that survive reimplementation. They're expensive to write and worth the expense.

Live evaluations verify production reality. Monitoring, drift detection, anomaly alerts. These run continuously because intent and reality can diverge even when all explicit tests pass.

A system with only ephemeral tests cannot be safely regenerated. You don't know what behavior you're trying to preserve. A system with durable evaluations but no live evaluation will drift without warning. A system with all three can be deleted and rebuilt with confidence.

That confidence is the product. Code is a byproduct.

The real codebase is everything that lets you throw code away without fear: the properties that define correctness, the contracts that specify interfaces, the monitors that detect drift. If that set is empty, no amount of careful implementation will save you. If that set is rich, the implementation is just a detail, regenerable on demand, disposable without loss.

This is the promise of regenerative software. It requires investment in specification that most teams haven't made. It requires honesty about what your tests actually protect. And it requires accepting that the code you wrote yesterday might not exist tomorrow and that this is fine, because the behavior it encoded is preserved in artifacts that outlive it.

As I mentioned in a previous post, at Wunderlist, we had a rule: any new service had to be "this big", a constraint I'd demonstrate by holding my fingers a few inches apart. The metric wasn't about lines of code. It was about replaceability.

If a service was small enough to rewrite in a day, it couldn't accumulate the kind of complexity that makes systems brittle. That rule was about resisting growth. Not preventing change but resisting mass.

Every software system naturally grows. When change is easy and addition is cheap, structure accumulates unless something pushes back. For most of software history, that counterforce was human effort. Writing code was slow. Adding complexity hurt. Growth had friction.

Generative AI removes that friction.

Without an opposing discipline, AI doesn't just accelerate development. It accelerates bloat. This post is about the discipline that prevents success from turning into system weight.

In AI-accelerated systems, expansion is the path of least resistance. Generation is cheap. Preservation is emotionally easy. Deletion requires justification. Think about how many times you've seen commented out code in a legacy code base where someone couldn't bring themselves to outright delete it even though it's not used anymore.  That's the psychology we're dealing with here.

Modern LLM-driven workflows strongly favor addition: new features appear instantly, glue code materializes, abstractions proliferate because the model has seen them before. Edge cases get special handling instead of root-cause fixes. "Temporary" code survives because it works.

None of this requires bad engineers. It barely requires engineers at all.

If you do nothing, your system will grow until it becomes unmanageable. This was true before AI, but the timeline has collapsed. What used to take years of drift now happens in months of "high-velocity" shipping.

Lines of code are a distraction. What actually matters is conceptual mass—the weight of ideas a system asks you to hold in your head.

Conceptual mass is the sum of distinct concepts, invariants, public interfaces, dependencies, and exception paths. It is the number of things a human, or an AI, must understand to make a safe change.

AI is exceptionally good at increasing conceptual mass silently. Every generated abstraction, every "clean" separation of concerns, every helper function adds weight. The code passes the linter. The tests pass. The system gets heavier.

The Compaction Discipline exists to reduce conceptual mass relentlessly.

Most teams think about size reduction as hygiene: occasional refactors, technical-debt sprints, cleanup tickets that sit in the backlog, but that framing is wrong.

In theory, refactoring can reduce conceptual mass. In practice, it rarely does. Most refactoring reorganizes existing structure without challenging whether that structure should exist at all.

Refactoring is reorganizing the closet.

Compaction is realizing you don't need the closet.

Compaction is not maintenance. It is structural pressure. It is the deliberate, continuous application of force to keep a system's conceptual mass proportional to its purpose.

If your system gets more complex every time it gets more capable, you are losing.

Removing code often accompanies compaction, but deletion is incidental. The goal is not fewer lines. The goal is less surface area.

AI loves to hallucinate architecture. It will suggest a Strategy pattern, a Factory, and an Interface for a feature that could be a single if statement.

Expansion is keeping those files because "it's best practice."

Compaction is deleting them because the distinction doesn't pay rent.

Successful compaction looks like fewer abstractions doing more work. Collapsed layers. Eliminated special cases. Simpler dependency graphs. Clearer boundaries. Smaller interfaces.

Code disappears because it no longer earns its keep. Sometimes the code stays, but the conceptual mass drops, because two ideas become one and the mental model shrinks.

The question is not "can we delete this?" It's "does this concept justify its existence?"

At Wunderlist, we built what people would now call a microservices architecture, but we thought of it as a deliberately dumb architecture.

The industry focuses too much on "microservices" and not enough on "architecture." That's why microservices get a bad rap. Our system worked because it was simple to the point of boredom.

We organized around nouns, not verbs. Users, lists, tasks, comments, each owned by exactly one service. Operations were almost entirely CRUD. Communication happened through exactly two mechanisms: a standardized REST/JSON convention that every service spoke natively and exclusively, and a message bus that broadcast every mutation. That was it. No service-to-service RPC. No custom protocols. No internal APIs that only two services knew about.

We didn't choose this approach because we loved distributed systems. We chose it because it enforced replaceability. When a service became too heavy—too much conceptual mass—we didn't refactor it. We deleted it and replaced it with something simpler. Or faster. Or cheaper to run. Because the architecture was dumb, rewriting was cheaper than preserving complexity.

The architecture gave everything exactly one place to go. Duplication was obvious. Special cases had nowhere to hide.

The specifics don't matter. The constraint does. You don't need microservices to do this. You can practice compaction in a monolith by enforcing modular boundaries that are ruthless about dependency direction and ownership. The technology is incidental (though in my own expereince, separation by process boundary makes the modularity more explicit). What matters is designing systems where bloat has no natural home.

Compaction buys you more than cleanliness. It buys you options.

A compact system is cheaper to regenerate. It fits inside bounded reasoning contexts. It adapts to new languages and frameworks because there's less to port. It is easier to audit. It has a smaller blast radius when it fails.

This is why the most durable legacy systems are often boring. They didn't grow clever. They resisted the urge to solve tomorrow's problems today.

Any system that does not actively compress will inevitably bloat. AI does not change this law. It just accelerates it.

We are moving from an era where code seemed like an asset to an era where code is more clearly a liability, and only functionality (and arguably its architecture) is the asset.

The Compaction Discipline is the counterforce: continuous structural pressure to keep conceptual mass proportional to purpose.

Generation is cheap. Compression is leverage.

If you've been using generative AI regularly for a while, you already know this feeling. There are classes of code you'll happily accept without even reading. A small, pure function. Statically typed inputs and outputs. A well-understood transformation. No I/O. No hidden state. No ambiguity. The AI writes it, you paste it in, and you move on with your life.

And then there's code that touches the network. Code that encodes business rules. Code that depends on unclear invariants, partial documentation, or "everyone knows how this works." That's where things get weird fast. You reread it. You test it. You argue with it. Sometimes you rewrite it entirely.

What's interesting isn't that these two poles exist. It's the gradient between them. Over time, developers build an intuition for where a piece of code sits on that gradient. Some code you trust immediately. Some code you trust only after careful review. Some code you never quite trust, no matter who wrote it.

Once you notice that gradient, an obvious question appears: how do we design systems so that more of the code lives on the side where trust is easy?

One of silly old jokes I'd tell from a system I worked on years ago was: "If you can make the Haskell system compile, it works." That's not actually true, of course, but it points at something real. A strong type system, purity by default, and explicit handling of effects dramatically shrink the space of possible mistakes. You trust the code not because you've verified it, but because the structure makes it hard to get wrong.

This was always valuable. AI makes it load-bearing.

If a function is small, pure, and tightly specified, it doesn't really matter whether it was written by a senior engineer, a junior engineer, or an LLM. The structure constrains the output. You trust it because trust is rational given the constraints. Conversely, if a component is large, stateful, and ambiguous, it doesn't matter who wrote it. You're paying for that complexity in review time, debugging time, and the nagging feeling that something might be wrong.

This suggests two complementary approaches to system design.

First, structure systems so that more of the work can be expressed as simple, constrained transformations. Things you'd trust anyone to write without supervision. A data pipeline of pure, typed functions where each stage takes an input type and produces an output type. No hidden state, no ambient dependencies. Most code in such a system is trustworthy by construction, and—crucially—replaceable by construction. You can delete a stage and regenerate it, confident that if the types align, the behavior is probably correct.

Second, design the remaining messy parts so that failure is cheap, contained, observable, and reversible. Not everything can be pure and constrained. Some code genuinely needs to manage state or encode business rules that resist formalization. The goal isn't to eliminate this code but to quarantine it. Push it to the edges. Make it small. Surround it with monitoring. When it fails, the blast radius is limited.

There's a distinction here worth naming: code trust versus architectural trust.

Code trust asks whether a specific implementation is correct. Architectural trust asks whether the system is shaped so that correctness is easy and failure is survivable. You can have high code trust in a bad architecture. Every function is perfect, but the interactions are a nightmare. You can have high architectural trust with mediocre code. Individual functions might have bugs, but types prevent certain errors, tests catch others, and monitoring detects what slips through.

AI shifts the emphasis from code trust to architectural trust. When code is cheap to generate, the quality of any individual implementation matters less. What matters is whether the system is shaped so that cheap code is good enough.

The developers who thrive with AI won't be the ones who write the best prompts. They'll be the ones who design systems where prompts don't need to be perfect, because the system's structure does most of the work, and the AI is just filling in blanks that are hard to fill incorrectly.

When you can generate code freely, the bottleneck shifts to verification. Systems where most code needs careful review become expensive. Systems where most code is trustworthy by construction become cheap. The gradient of trust becomes a cost curve, and the systems that win are the ones where that curve slopes in the right direction.

The real leverage isn't better prompts. It's better shapes.

We’ve spent decades talking as if “the system” and “the codebase” were the same thing.

They are not.

A system is defined by its behavior, its interfaces, its data, and its invariants. Code is just one way, the historically dominant way, of expressing those things.

When people hear “throw the code away” and assume “throw the system away,” they are conflating two very different acts. That conflation is the source of most of the resistance to these ideas. So let’s be precise about the distinction.

Look at any system that has survived for a long time, not because it was beautiful, but because it worked.

What endured was never the exact implementation, the original language, or the clever abstractions. What endured was stable interfaces, well-understood behavior, data continuity, and a clear sense of what must not break.

The system’s identity lived outside the code.

The code was replaced far more often than people like to admit, sometimes explicitly, sometimes by accretion. The system survived because something else held it together.

In retrospect, this was always true. We just did not have the tools or the economics to act on it deliberately.

That something else is what we should be designing for.

No serious architecture advocates “start over every time.” That idea collapses under even casual scrutiny.

What does work, and has worked for a long time, is targeted replacement behind stable boundaries.

This is the same logic that made immutable infrastructure viable. You do not throw away the service; you replace the instance. Identity lives at the service boundary, not the machine.

Applying this to software means the system remains intact. The contracts remain intact. The behavior remains intact. The data remains intact. Only the mechanism changes.

This also means something crucial: you cannot regenerate what you have not yet defined. For legacy systems, the first act is not rewriting. It is extraction.

We already accept this model everywhere else in computing. The question is whether we are ready to accept it for code itself.

A common objection goes like this: “We could have rewritten code cheaply for decades. We tried that with outsourcing. It failed.”

That history matters. But it is being misapplied.

The failure mode of large-scale outsourcing was not that code was rewritten. It was that system knowledge lived in mutable code and in human heads. The moment supervision stopped, intent was lost, assumptions drifted, and nobody could tell whether the system was still correct.

That was not a failure of regeneration. It was a failure to externalize system memory.

That memory has to live somewhere durable: machine-readable specifications, comprehensive test suites, explicit contract definitions. In outsourcing, that memory remained implicit and social. In regenerative systems, it must be explicit and executable.

Regeneration without durable system anchors is chaos. Regeneration with them is not.

AI does not change this dynamic. It makes it unavoidable. When code becomes cheap to produce, the question of where system identity lives stops being theoretical.

Consider a payment processing service. What is the system, actually?

It is not the Python or Go or Java that handles the requests. The system is:

The contract: these endpoints accept these inputs and produce these outputs

The invariants: a charge is never duplicated, a refund never exceeds the original amount, ledger entries always balance

The operational envelope: p99 latency under 200ms, availability above 99.95%

The data: transaction records, account states, audit logs

This is why schema evolution becomes the true constraint, not code preservation.

You could rewrite the implementation from scratch tomorrow. If the new code honors those contracts, preserves those invariants, meets those operational requirements, and maintains data continuity, you still have the same system.

The customer does not experience “new code.” They experience the same service, because the service was never the code.

This is what it means to treat the system boundary as the durable artifact.

Making a system safe to regenerate means specifying behavior independently of implementation, making interfaces explicit and enforced, making invariants testable, observing runtime behavior continuously, and surfacing failure modes quickly.

None of that requires preserving code. All of it requires preserving meaning.

The discomfort with “fresh code” is understandable, but misplaced.

What people actually fear is undetected behavior change, performance regressions, security regressions, and silent drift. Those failures are caused by unobserved change, not by newness.

A system with stable contracts, strong evaluations, continuous monitoring, and clear rollback paths can safely tolerate very fresh code. A system without those things is dangerous even if the code is ten years old.

Age is not stability. Visibility is.

This is the crux of the argument.

The asset is not the code. The asset is the system’s ability to remain coherent while its internals change.

That ability lives in interfaces, invariants, evaluations, and operational discipline. Code is a consumable input to that process.

Treating code as the asset made sense when replacing it was expensive. Treating it that way now creates fragility, not safety.

The distinction between system and implementation is what separates regenerative architectures from reckless ones. It is also the difference between software that decays under change and software that endures because it can change.

The cheapest system in the AI era is not the one that never changes. It is the one who parts can be cheaply regenerated because they are small and decoupled.

This claim sounds like architecture-conference wisdom, the kind of thing consultants say to justify rewrites. But something has shifted. The emergence of AI-assisted development has transformed code size from an aesthetic concern into a direct economic variable. Context windows have budgets. Tokens cost money. Every line of code you keep is a line you pay to process, again and again, every time you ask a model to reason about your system.

Compaction—the deliberate practice of making systems smaller—was always the quiet secret behind sustainable software. AI has simply made the economics impossible to ignore.

Most organizations dramatically underestimate how expensive it is to keep code. Not to write it—that cost is visible in salaries and sprints. Not to run it—that cost shows up in hosting bills. The hidden expense is keeping it: the ongoing cognitive and computational tax imposed by code that exists.

Consider what happens every time an engineer touches a large codebase. Before they can make a change, they must build a mental model of the relevant subsystems. This takes time—sometimes hours, sometimes days. The more code exists, the longer this ramp takes. Senior engineers hesitate to modify things they don't fully understand. Junior engineers make changes without understanding, introducing subtle bugs. The phrase "I'm not sure what this does, so I won't touch it" represents real operational risk, but it rarely appears in any budget.

AI compounds this problem in a new way. When a model assists with development, it reasons over whatever context you provide. Large codebases exceed context limits constantly, which means every prompt becomes a lossy compression of your actual system. The model sees fragments. It infers relationships. It guesses at conventions. Sometimes it guesses wrong, and you pay for those mistakes in debugging time.

There is a harder version of this objection that deserves acknowledgment: context windows are growing rapidly. Gemini offers two million tokens. Competitors are racing to match or exceed that figure. Why worry about code size when context is becoming effectively unlimited?

The answer is that capacity and quality are different things. Attention mechanisms degrade with noise regardless of window size. Retrieving relevant information from a massive context is itself a lossy process. More hay does not make the needle easier to find—it makes the search more expensive and less reliable. The constraint is not how much a model can hold but how well it can reason over what it holds. Smaller, cleaner inputs produce better outputs. This remains true whether the window is 100,000 tokens or 100 million.

None of this is entirely new. The software industry has been running a decades-long experiment on what makes systems survive, and the results point in a consistent direction.

Large systems fail for a boring reason: humans cannot reason about them. The so-called bus factor—the risk that key knowledge walks out the door when certain people leave—is usually described as a people problem. But it's really a surface-area problem. When only one person understands a system, it's almost always because the system is too big, too implicit, and too entangled for shared comprehension. The knowledge concentrated in that person's head is a symptom of architectural failure, not its cause.

The systems that survived longest tended to share certain characteristics: flat data models, explicit workflows, minimal abstraction, and code that repeated itself rather than hiding behind clever indirection. This last point requires clarification, because it seems to contradict the case for compaction. If repetitive code is good, doesn't that mean more lines, not fewer?

The distinction is between two kinds of complexity. Accidental complexity is bloat—code that exists because of historical accident, defensive layers accumulated over time, abstractions that obscure more than they clarify. Essential complexity is the irreducible difficulty of the problem domain itself. Compaction targets the former, not the latter. A system with explicit, even somewhat repetitive business logic can be smaller than a system with elaborate abstraction hierarchies, because the abstractions themselves consume space and impose cognitive load. The goal is not minimum character count. The goal is minimum semantic complexity: the smallest system that does the job while remaining comprehensible to both humans and machines.

Legacy systems that survived were not the ones built with the most sophisticated architectures. They were the ones that fit in people's heads.

If compaction is so valuable, why don't more organizations practice it? The technical answer—that deletion is risky and requires deep understanding—is part of the story. But the more important barrier is organizational.

Code has authors. Authors have feelings and careers. Managers who approved code have reputations attached to it. Deleting a system is not just a technical act; it is a political act that implicitly criticizes past decisions. This is why deprecation efforts so often stall. The engineer who proposes removing a subsystem must navigate a minefield of organizational sensitivities while also taking on technical risk. If the deletion goes wrong, they own the outage. If it goes well, the reward is invisible—the absence of problems that would have occurred otherwise.

There is also the Chesterton's Fence problem: code often exists for reasons that are no longer documented or understood. That strange conditional? It handles an edge case that caused a production incident four years ago. The seemingly redundant validation? It compensates for a bug in a third-party library that was never fixed. Deleting such code requires either deep institutional knowledge or the willingness to rediscover these constraints the hard way.

This is why compaction, in practice, is a senior-engineer activity. It takes experienced judgment to distinguish load-bearing complexity from accumulated sediment. The cost of that judgment is real. In the short term, it is often cheaper to work around old code than to remove it. The long-term costs of that choice are diffuse and easy to ignore until they become critical.

What changes in the AI era is that the costs become measurable in ways they never were before.

Cognitive load was always real, but it was hard to quantify. How do you put a number on "the engineers are confused"? Token costs are different. Every unnecessary line of code increases inference cost: more tokens to load, more ambiguity to resolve, more paths for the model to evaluate. When you remove code, you can see the prompt shrink. You can measure the reduction in API calls. Deletion has ROI you can put in a spreadsheet.

The effect goes beyond cost. AI agents—systems that take actions based on model outputs—behave differently in large versus small codebases. In complex environments, agents get stuck in loops. They hallucinate libraries that don't exist. They make changes that break unrelated subsystems because they couldn't see the full dependency graph. Compaction is not just about efficiency; it's about reliability. Smaller systems produce more consistent agent behavior because there's less room for the model to get confused.

This creates a new kind of feedback loop. Teams that maintain compact codebases get more value from AI assistance. That increased value creates resources and motivation for further compaction. Teams with sprawling codebases struggle to use AI effectively, which means they have less capacity to clean things up. The gap between well-maintained and poorly-maintained systems will widen as AI capabilities improve.

Systems that can shrink are systems designed for deletion. This is not the same as systems designed for change, though the two overlap. The critical property is what might be called clear seams: boundaries between components that allow removal without collapse.

Loose coupling is often presented as an architectural virtue in its own right, a marker of good design. In the context of compaction, it's better understood as a prerequisite for deletion. A tightly coupled system cannot shrink because removing any part damages the whole. A loosely coupled system can shed components the way a healthy organization can lose employees—with adjustment, but without crisis.

Replacement beats refactoring for a related reason. Refactoring preserves historical constraints. It says: this code has problems, but its fundamental structure represents decisions worth keeping. Replacement discards those constraints entirely. When regeneration becomes cheap—when you can describe what you want and get working code quickly—carrying forward old decisions becomes increasingly irrational. The sunk cost fallacy, already a problem in software, becomes even more expensive to indulge.

Deletion is the most underrated operation in software. It eliminates unknown behavior. It collapses state space. It restores comprehensibility. And unlike refactoring, it cannot introduce new bugs in the code it removes. The systems that endure will not be the ones that grew most carefully. They will be the ones that learned how to remove safely.

If compaction lowers cost and improves AI reliability, then regeneration replaces maintenance as the dominant strategy for certain kinds of software. This is a more radical shift than it might first appear.

Maintenance assumes preservation. Its central question is: how do we keep this system working while making necessary changes? The answer involves careful modification, extensive testing, and respect for existing structure. Maintenance treats code as an asset to be protected.

Regeneration assumes discard. Its central question is: how do we describe what this system should do so we can rebuild it when needed? The answer involves clear specifications, good tests, and confidence that reconstruction will work. Regeneration treats code as a byproduct of understanding—valuable, but not precious.

Not all software can or should be regenerable. Critical infrastructure, systems with hard-won safety properties, code that encodes institutional knowledge built up over years—these may always require careful maintenance. But a surprising amount of software is more like scaffolding than like cathedrals. It exists to solve a problem at a moment in time. When the problem or the context changes, the old solution may have less value than a fresh one.

The shift raises uncomfortable questions. If code is disposable, does quality still matter? If understanding lives in prompts and specifications rather than implementations, what happens to the craft of programming? These are genuine uncertainties, not rhetorical flourishes. The definition of quality may be moving from "durability" to "regenerability"—from code that lasts to code that can be reliably reproduced. What that means for how we train engineers, evaluate systems, and think about software as a discipline is not yet clear.

What is clear is that the economics have changed. Compaction was always wise. Now it is also profitable in ways you can measure. The organizations that figure this out first will find themselves with systems that are cheaper to run, easier to understand, and better suited to AI assistance. The ones that don't will be paying a tax on every prompt, forever, for the privilege of carrying code they no longer need.

Not all software should change at the same speed.

This has always been true, but it's easy to forget when tools make change frictionless. Generative AI dramatically lowers the cost of modification, which creates a dangerous illusion: that everything can change quickly, therefore everything should.

That's how systems accumulate the kind of damage that only becomes visible in production, at 2am, when the person who understood the original design left two years ago.

To build durable software in the AI era, we need a way to reason about where change belongs and where it doesn't. Pace layers give us that lens.

The idea comes from Stewart Brand's work on long-lived systems. In any complex system—cities, organizations, civilizations—different layers evolve at different rates:

Fast layers experiment

Slow layers stabilize

Tension between them is healthy

Confusing them is destructive

Software systems are no different. They just forgot this fact during decades of abstraction and refactoring.

AI is reminding us, sometimes painfully.

Generative AI excels in environments with three properties:

High change frequency — the layer already expects regular modification

Low blast radius — failures are contained and recoverable

Verifiable outcomes — you can tell whether the output is correct

That third property deserves attention. "Verifiable" doesn't mean trivial to evaluate—it means the feedback loop closes. A UI component either renders correctly or it doesn't. A data transformation either produces the expected output or it doesn't. The verification might require tests, visual inspection, or user feedback, but there's a path to knowing.

These properties tend to cluster at the top of software systems:

UI components

Presentation logic

Content generation

Workflow glue

One-off integrations

These layers benefit from rapid regeneration. Daily rewrites are not only acceptable—they're often desirable. Fresh code adapts faster to shifting requirements, libraries, and user expectations.

Here, disposability is a feature.

Trying to "harden" these layers prematurely wastes effort and slows learning. AI should move fast where the cost of being wrong is low and the cost of being slow is high.

At the bottom of systems, the rules change.

Infrastructure

Protocols

Data models

Security boundaries

Governance logic

These layers change slowly because mistakes are expensive and recovery is hard. The feedback loops are longer—sometimes months or years before a design flaw surfaces. Verification is difficult because correctness often depends on properties that only emerge under load, over time, or at the edges of the input space.

AI can help here, but only under strict constraints: human review, formal verification, extensive property testing, staged rollouts.

Blind regeneration at deep layers is reckless. The failure modes are subtle, compounding, and often invisible until too late.

The mistake many teams make is applying AI uniformly—letting fast-layer tools leak into slow-layer responsibilities.

That's not acceleration. It's erosion.

Here's what the clean diagrams don't show: figuring out which layer something belongs in is where most of the intellectual work happens.

Your authentication system—is it infrastructure or application logic? Your feature flag service—fast layer or slow? The ML model that powers recommendations—how often should it regenerate, and what happens when the new version behaves differently from the old?

There's no universal answer. Layer placement depends on your specific system's failure modes, your team's capacity for review, and your users' tolerance for inconsistency.

A few heuristics help:

Follow the blast radius. If changing this component could break things you don't own, it's slower than you think.

Follow the recovery time. If fixing a mistake takes days instead of minutes, the layer is deeper than it appears.

Follow the dependencies. If many things depend on this and few things it depends on, you're looking at infrastructure whether you named it that or not.

The exercise of layer identification is itself valuable. Teams that argue about where boundaries belong are teams that understand their system's actual structure—not just its intended structure.

Here's a harder truth: AI-assisted regeneration will expose layers that were never real.

What teams call "core infrastructure" is often just code that's hard to change because it's poorly factored, not because it's genuinely foundational. The difficulty of modification got confused with importance.

When AI makes modification cheap, these false bottoms become visible. You discover that the "critical" service everyone was afraid to touch was actually a tangle of accidental complexity that a fresh implementation handles in a tenth of the code.

This is both opportunity and danger.

The opportunity: you can finally replace calcified code that was only preserved by fear.

The danger: you might mistake actual foundational code for the merely calcified kind. The difference is whether the complexity is essential or accidental—and that distinction requires judgment that AI doesn't have.

Pace layer thinking helps here. Ask: if we regenerated this component, what invariants must the new version preserve? If the answer is "we're not sure," you've found a slow layer masquerading as a fast one. (Or you've found something that should be a slow layer but its interfaces are poorly defined.  More on that in a future post.)

Between the fastest and slowest layers is a gradient.

Some code should be rewritten daily. Some monthly. Some yearly. Some almost never.

The key insight: regeneration frequency should match layer pace.

When regeneration outpaces a layer's ability to absorb change, instability increases. When it lags, entropy accumulates. The art is alignment.

AI doesn't remove this gradient. It makes ignoring it more dangerous—because now you can regenerate fast enough to outrun your own understanding.

Pace layers are not conceptual abstractions. They must be encoded into the architecture.

This means:

Clear boundaries between layers, enforced by module structure, not just convention

Explicit interfaces that slow layers expose to fast ones

Tests that enforce contracts across regeneration cycles

Deployment pipelines that move at different speeds for different layers

When layers are blurred, AI accelerates the wrong things. When layers are explicit, AI becomes a force multiplier rather than a destabilizer.

This is why "clean architecture" suddenly matters again—not as dogma, but as survival strategy.

Consider an e-commerce system with these components:

Product catalog UI — displays products, handles search, shows recommendations

Pricing engine — calculates prices, applies discounts, handles currency conversion

Inventory service — tracks stock levels, manages reservations, coordinates with warehouses

Order ledger — records transactions, maintains audit trail, handles compliance

The catalog UI regenerates aggressively. AI rewrites components weekly based on A/B test results and design iterations. Failures are visible immediately and recoverable by rollback. The blast radius is one user's session.

The pricing engine regenerates monthly, with extensive property-based testing. Every regeneration must preserve invariants: a discount can't increase the price, currency conversion must be reversible within tolerance, promotional rules must compose correctly. AI proposes changes; humans verify the invariant preservation.

The inventory service regenerates quarterly at most. Coordination bugs create real-world problems—oversold products, angry customers, warehouse confusion. Changes go through staged rollouts with manual checkpoints. AI helps with implementation but doesn't drive the regeneration schedule.

The order ledger almost never regenerates. It's the system of record. Compliance requirements dictate its structure. Changes require legal review, audit trail preservation proofs, and migration plans that span months. AI might help write the migration scripts, but a human architects every change.

Now here's where it gets messy:

The recommendation model that powers the catalog UI—where does it live? It affects what users see (fast layer concern) but it's trained on historical order data (slow layer dependency). The team decides: the model itself regenerates fast, but it can only read from a stable snapshot of order data that updates weekly. The boundary is explicit.

The feature flag system that controls pricing experiments—fast or slow? It changes frequently (new experiments daily) but a bug could apply wrong prices to real orders (high blast radius). The team decides: the flag evaluation logic is slow layer, heavily tested, rarely changed. The flag configuration is fast layer, AI-assisted, easy to roll back.

These boundary decisions are where the real architectural work happens. The layers aren't given. They're chosen.

Healthy systems preserve tension between fast and slow layers.

Fast layers want freedom to experiment. Slow layers want stability to build on.

AI strengthens both impulses. It makes experimentation cheaper and makes stability violations more consequential. The job of architecture is not to resolve this tension but to channel it.

When fast layers are over-constrained by slow ones, innovation dies. Every UI change requires a committee.

When slow layers are eroded by fast ones, trust dies. The system becomes a house of cards that looks fine until it doesn't.

Pace layers are how you keep both alive: clear boundaries that let each layer move at its natural speed without destabilizing its neighbors.

In posts that follow, I'll explore how pace layers shape evaluation strategies (how do you verify regenerated code at different layer speeds?) and the emerging pattern of n=1 development (what happens when AI makes bespoke software economically viable?).

But the core idea starts here:

AI doesn't flatten software. It sharpens its layers.

Build with that in mind, and regeneration becomes a source of durability—not decay.

In late 1999, I found myself inside Extreme Programming movement before most people had heard of it. Kent Beck's white "extreme programming explained" book had just come out. Ward Cunningham's wiki was where the real conversations happened. The Agile Manifesto wouldn't exist for another couple of years.

From the outside, what we were doing looked reckless.

We threw away long-range plans. We rejected heavyweight processes. We stopped pretending we could predict the shape of a system months in advance. We paired constantly, which looked inefficient. We wrote tests before code, which looked backward. We released continuously, which looked dangerous.

To many observers, this was a removal of constraints. The opposite was true.

XP compressed feedback loops until truth became unavoidable. Tests replaced promises. Continuous integration replaced status reports. Working software replaced narrative. You could no longer hide behind process because the system itself reported your progress, loudly and continuously.

The practices that looked like chaos were actually mechanisms for enforcing honesty. Pair programming meant every line of code had a witness. Test-first meant you couldn't ship wishes. Short iterations meant you couldn't hide. The discipline was more demanding than what came before, not less. It just didn't look like the discipline people were used to seeing.

That experience permanently changed how I think about software.

It also explains why I lost interest once Extreme Programming got absorbed into the broader "Agile" movement and solidified into branding and ceremony. When the name took over, the rigor drained out. The feedback softened. The theater returned. Consultants taught the artifacts without the discipline. I wrote about that years ago in The Curse of a Name.

I'm revisiting this history now because we're watching the same pattern repeat with generative AI, and it's being misunderstood in exactly the same way.

Certain shifts in software history feel like freedom because they remove familiar signals of control. In reality, they relocate rigor closer to where truth lives. They make it harder to fake progress.

This pattern has repeated at least three times in my career.

Dynamic languages displaced static type systems. When Ruby and Python started spreading into production systems, they were widely criticized as undisciplined. No compile-time guarantees. No rigid type constraints. Too easy to write sloppy code.

What actually happened was a shift in where rigor lived. Static promises gave way to runtime truth. Type declarations gave way to executable behavior. Compiler appeasement gave way to test-enforced correctness. In practice, the teams that succeeded doubled down on executable specifications: tests that described behavior precisely enough to function as a de facto type system.

The discipline didn't vanish. It moved into tests, contracts, and feedback loops that reflected how the system actually ran. The type system was still there; you just had to earn it through behavior rather than declaration.

(yes, I know and appreciate that there are some great and very popular languages that have started to displace the dynamic with amazing static type systems)

Extreme Programming displaced phase-gate development. XP removed plans, design documents, and phase gates. These were the artifacts that made organizations feel safe. In their place it installed mechanisms that were far less forgiving: test-first development, continuous integration, constant peer review, real customer feedback.

It looked chaotic because it removed the appearance of control. What replaced it was operational truth. You knew where you stood because the code told you, not because a project manager updated a Gantt chart.

Continuous deployment displaced release management. No release windows. No stabilization phases. No heroic integration efforts. Another apparent loss of discipline.

In reality, continuous deployment demands far stricter engineering than quarterly releases ever did. You need reversibility. Observability. Automated verification. Fast rollback paths. Continuous deployment isn't about speed; it's about never being surprised. You can't ship continuously without knowing exactly what your system is doing at all times. The rigor becomes continuous as well.

Generative AI appears to remove the ultimate constraint: hand-written code. That makes people nervous, and it should. But the danger isn't probabilistic generation. The danger is quiet failure.

Here's what I mean. When you generate code instead of writing it, you lose the incidental knowledge that comes from typing every character. You lose the friction that forces you to understand. You can produce systems that work without ever knowing why they work.

That's the legitimate fear, and it's a real failure mode. I've seen teams drowning in generated code they don't understand, systems that function but can't be debugged, abstractions that exist because an LLM suggested them rather than because they serve a purpose.

But the answer isn't to reject generation. The answer is to relocate the discipline.

Generative systems only work if invariants are explicit rather than implicit. Interfaces must be real contracts, not incidental boundaries. Evaluation must be ruthless. Failures must be loud and immediate. The engineer's job shifts from typing code to specifying intent and verifying outcomes.

What does this look like in practice? One possibility: You write the tests and the LLM generates implementations. If the tests don't pass, the code doesn't ship.

This is test-first development with a different author for the implementation. The discipline I learned in 1999 turns out to be exactly the discipline that makes AI-assisted development work. The rigor relocated from who writes the code to what the code must satisfy. The tests don't care whether a human or a machine produced the implementation. They care whether it behaves correctly.

The pattern is: probabilistic inside, deterministic at the edges.

This is harder than it sounds. Specifying intent precisely enough that a machine can generate correct implementations is not easier than writing code. It's a different skill, and in some ways a more demanding one. You have to know what you actually want. You have to be able to recognize when you've gotten it. You can't hide behind activity.

Cheap generation without strict judgment isn't a new paradigm. It's abdication.

I've been experimenting with frameworks that treat evaluation as a first-class system component, not an afterthought. Generation can be flexible. It can even be probabilistic. But evaluation must be rigid. Systems must fail visibly when they drift from intent. The comfort of working code that you don't understand is precisely the comfort you have to refuse.

If you're working with generative AI now, the question to ask yourself is: where did the rigor go?

If you removed hand-written code but didn't add explicit invariants, you lost rigor. If you're generating implementations without rigorous evaluation, you lost rigor. If you're accepting code because it runs rather than because you understand it, you lost rigor.

The engineers who thrive in this environment will be the ones who relocate discipline rather than abandon it. They'll treat generation as a capability that demands more precision in specification, not less. They'll build evaluation systems that are harder to fool than the ones they replaced. They'll refuse the temptation to mistake velocity for progress.

Across decades of software evolution, the same misunderstanding keeps recurring. Constraint removal is mistaken for loss of rigor.

But what actually happens, when things go well, is rigor relocation.

Control doesn't disappear. It moves closer to reality.

XP taught me this. Dynamic languages reinforced it. Continuous deployment reinforced it again. Now generative systems are teaching it to a new generation of engineers, whether they realize it or not.

The lesson is always the same. When something looks like recklessness, look for where the discipline moved. If you can't find it, that's when you should worry. If you can find it, you're probably looking at the future.

If generation gets easier, judgment must get stricter. Otherwise, you're not engineering anymore.

That was the real lesson of Extreme Programming before it got diluted into a brand. It's the same lesson now. And this time, the velocity of change means we don't have years to figure it out.

If you’ve been following this series, you may already be thinking:

“This all makes sense for non-UI code. But surely this can’t apply to interfaces.”

That reaction should feel familiar. It’s the same one people had earlier when I argued for regeneration and got back:

“Regenerating all the code every time is crazy.”

It sounded reasonable then, and it sounds reasonable now. In both cases, the objection comes from the same category error.

Regeneration does not mean indiscriminate churn. It means bounded replacement behind stable interfaces. When you miss the boundary, the idea sounds reckless. When you see the boundary, it becomes conservative.

UI is arguably where that boundary matters most.

Regeneration works extremely well for large parts of modern systems:

infrastructure

services

domain logic

state management

non-UI code inside client

... [truncated for length]
