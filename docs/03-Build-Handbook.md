# VITA — Build Handbook

The Build Handbook defines how VITA is designed, developed, reviewed, documented, and released.

It is the official operating manual for everyone working on VITA.

If the Product Bible defines **what** VITA is, the Build Handbook defines **how** VITA is built.

---

# Team Roles

## Wilber De Leon — Founder

- Product vision
- Final product decisions
- User experience
- Feature direction
- Brand direction
- Final approval before release

## Santiago Vazquez — Co-Founder

- Product strategy
- Product development
- Feature planning
- Engineering collaboration
- Product reviews
- Final approval before release

## Claude — Primary Software Engineer

- Build new features
- Implement slices
- Write production-ready code
- Refactor when approved
- Follow the Product Bible
- Follow the Design System
- Follow the Build Handbook

Claude should never redesign the product without approval. See Design Rules → Visual Reference Standards for how this applies to inspiration, production, and asset references.

## ChatGPT — Creative Director & Product Strategist

- Product planning
- UX strategy
- Documentation
- UI direction
- Visual concepts
- Feature ideation
- Copywriting
- Product consistency

ChatGPT helps maintain the long-term vision of VITA.

## Codex — Code Auditor & Quality Engineer

- Review Claude's work
- Find bugs
- Improve architecture
- Suggest optimizations
- Verify Build Handbook compliance
- Verify Product Bible compliance

Codex audits before major approvals.

---

# Development Philosophy

We build one slice at a time.
We finish one slice before beginning the next.

Small completed features are better than large unfinished systems.

---

# Slice Workflow

Every slice follows the same lifecycle.

1. Define the objective.
2. Define the scope.
3. Build the slice.
4. Self-review.
5. Audit.
6. Fix issues.
7. Founder review.
8. Approval.
9. Documentation updates.
10. Merge and deploy.

No slice is considered complete until all ten steps are finished.

---

# Definition of Done

A slice is complete only when:

- ✓ Functionality works
- ✓ UI matches the Design System
- ✓ No known critical bugs
- ✓ Documentation updated
- ✓ Audit completed
- ✓ Approved by the founders

---

# Documentation Rules

Whenever something changes, update the appropriate document.

- Product change → Product Bible
- Workflow change → Build Handbook
- Design change → Design System
- Completed work → Changelog
- Current progress → Slice Tracker
- Findings → Audit Log
- Future ideas → Ideas Parking Lot

Never duplicate information across documents.

**Vita HQ** (`~/Documents/Vita HQ`, Obsidian) is the company knowledge base beyond this repository's own `docs/` files. Every coding session ends with a silent checkpoint: did the work change knowledge? No → leave Vita HQ untouched. Yes → update only the affected pages.

---

# Git Workflow

GitHub is the single source of truth for code.

- Every meaningful change should be committed.
- Meaningful commit messages are required.
- Avoid committing unfinished work whenever possible.

The permanent repository is `wilberdeleon/vita-app`.

---

# Reviews

Every completed slice should be reviewed before moving forward.

Reviews should focus on:

- User experience
- Simplicity
- Performance
- Consistency
- Maintainability

---

# Audits

Audits are intended to improve the product—not criticize the builder.

Every audit should include:

- Issue
- Reason
- Recommendation
- Decision
- Status

---

# Design Rules

All new UI must follow the Design System.

No custom styling should be introduced unless approved and documented.

## Visual Reference Standards

VITA uses three types of visual reference, and each carries a different level of authority.

**Inspiration Reference** — guides overall design direction (e.g. Robinhood, Apple Fitness, Headspace, Calm). Claude should absorb the visual language, design philosophy, interaction patterns, and overall feel, then create an original implementation. These references inspire — they are never copied.

**Production Reference** — represents founder-approved visual design. A production reference is an implementation specification, not inspiration: the founder has already made the design decisions, and Claude's job is to reproduce it as faithfully as technically possible. Unless explicitly told otherwise, preserve proportions, spacing, composition, hierarchy, typography, alignment, sizing, icon placement, color, and animation timing. Do not redesign, reinterpret, modernize, simplify, "make it your own," substitute similar components, replace layouts, or adjust spacing based on personal preference — a production reference outranks Claude's own design judgment. If something cannot be reproduced exactly due to a technical limitation, explain why, explain the limitation, and implement the closest technically possible solution. Never diverge silently.

**Asset Reference** — a founder-approved production asset (illustration, SVG, PNG, logo, icon, decorative or background artwork). Use the original asset whenever technically feasible. Do not redraw it, recreate it, generate a procedural version, or substitute something similar — the approved asset is the source of truth. Only recreate an asset if explicitly instructed to. An approved Asset Reference overrides Claude's own design judgment. The approved source asset is the implementation specification.

See Founder's Principles §15, "Approved Designs Are Final."

## Design Role vs Engineering Role

The reference type determines which role Claude is playing:

- **Inspiration Reference → Designer.** Create an original implementation inspired by the reference.
- **Production Reference or Asset Reference → Implementation Engineer.** The responsibility is faithful reproduction, not redesign.

Default assumption: production references are implementation specifications, and asset references are source files.

These Visual Reference Standards apply permanently to all future VITA development work unless explicitly revised by the founders.

---

# Product Rules

No feature should be built because another app has it.

Every feature must support the mission defined in the Product Bible.

---

# Communication

Questions are encouraged. Assumptions are discouraged.

When uncertain, ask before building.

Clear communication saves development time.

---

# Final Principle

Protect the vision.
Protect the quality.
Protect the user experience.

Everything else can evolve.
