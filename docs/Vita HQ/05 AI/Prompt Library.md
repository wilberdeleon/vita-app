# Prompt Library

**What is this?** The future home of Atlas's production prompts — system prompts, coaching templates, safety rails, and their version history.

**Why does it exist?** Prompts are product. When Atlas ships, its prompts will encode the [[Atlas Personality]] and [[Coaching Strategy]] — they deserve the same review discipline as code. Creating the home now means prompt work lands somewhere versioned from day one.

*Status: empty by honesty, not neglect — no AI is implemented and no prompts exist (verified: repo has no AI code). This page defines the standard the first prompt must meet.*

---

## What will live here

- **The Atlas system prompt** — identity, personality constraints, coaching model, safety boundaries
- **Task templates** — meal planning, check-ins, milestone commentary, plan explanations ([[Atlas Capabilities]])
- **Safety rails** — medical-question escalation, no-guilt enforcement, claim boundaries ([[Coaching Strategy]] boundaries)
- **Evaluation notes** — what was tried, what failed, why prompts changed

## Standards (set now, enforced later)

1. Every production prompt is written down here **before** it ships, with a version and date.
2. Every prompt change states what behavior it fixes — prompts follow the same "meaningful commit" discipline as code ([[Development Standards]]).
3. Every prompt is tested against the personality table ("Atlas is / is never") in [[Atlas Personality]] — especially the sensitive-moment cases.
4. Safety rails are never weakened without a [[Decision Log]] entry.

## Where actual prompt files will live

**Open question.** Prompts that ship in production likely belong in the repo (versioned with the code that uses them), with this page as the annotated index — mirroring the HQ/repo split used everywhere else. Decide at Atlas implementation ([[Future AI]]).

**Related:** [[Atlas Personality]] · [[Coaching Strategy]] · [[Future AI]]
