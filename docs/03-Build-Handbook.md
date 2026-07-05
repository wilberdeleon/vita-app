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

Claude should never redesign the product without approval.

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
