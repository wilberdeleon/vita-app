# Future AI

**What is this?** The AI engineering questions Vita will face when Atlas becomes real — collected now so they're answered deliberately, not under deadline.

**Why does it exist?** Every AI decision (model, architecture, cost, privacy) will constrain the product for years. This page is the pre-work.

*Status: nothing decided, nothing built. The only verified AI facts: Atlas is a placeholder by founder decision, and `src/features/atlas/` is empty.*

---

## Decisions that must be made (all **Needs Verification / undecided**)

| Decision | Notes |
|---|---|
| Model & provider | Frontier API vs. cheaper tiers per task; latency vs. quality for chat coaching |
| Where AI runs | Client → Supabase **edge functions** → provider is the natural fit: API keys stay server-side (the repo's secrets rule already anticipates this — `supabase/functions/` exists, empty) |
| Memory architecture | A coach must remember. What does Atlas know about the user, where is it stored, how does the user see/edit it? Deep trust implications |
| Cost model | Coaching tokens per user per month directly shapes [[Business Model & Pricing]] — subscription pricing must cover marginal AI cost |
| Privacy posture | Health data in prompts: what leaves the device/database, with what provider agreements? Trust is the asset ([[Core Principles]] #5) |
| Evaluation | How do we know Atlas is *good* before users do? Golden conversations, personality checks ([[Prompt Library]]) |

## Sequencing reality

AI work starts only after real data exists (Sprints 1–5) and V1 ships — Atlas without user data is a generic chatbot, which is exactly what Vita must not ship. See [[Atlas Capabilities]] for the capability order.

## Long-term ambitions (from [[Long-Term Vision]])

AI-powered health insights, biomarker interpretation ([[Future Features]]), proactive coaching ([[Coaching Strategy]]) — each gated by the VITA Promise like any feature.

**Related:** [[Atlas]] · [[Atlas Capabilities]] · [[Supabase & Database]] · [[Business Model & Pricing]]
