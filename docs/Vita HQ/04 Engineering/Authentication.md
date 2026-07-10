# Authentication

**What is this?** How users sign in to Vita — the current mock architecture and the path to real auth.

**Why does it exist?** Auth is the first real-data dependency: nothing user-specific can persist without it. The Sprint 0 design makes enabling it a contained change.

*Verified 2026-07-06 from `src/features/auth/AuthProvider.tsx` and `src/app/index.tsx`.*

---

## Current state — real gate, mock session

- **`features/auth/AuthProvider`** reports a **mock signed-in user**. No real authentication occurs.
- **The auth gate is real:** `src/app/index.tsx` routes by session status — signed-out → `(auth)/sign-in`, signed-in → the app. The routing logic won't change when auth becomes real.
- **Sign-in screen** exists at `src/app/(auth)/sign-in.tsx`, styled with the brand palette ([[Brand Identity & Icons]]).
- **Enabling real auth = replacing AuthProvider internals** with Supabase auth — the designed seam.

## Target state

Supabase auth (email/password at minimum) replacing the mock provider, sessions persisted securely on-device, and profile data flowing into [[Settings]].

## Decisions to make before implementation

- **Sign-in methods:** email/password only, or Apple/Google sign-in? (Sign in with Apple is practically expected for a premium iOS health app — and App Store rules require it if any third-party login is offered.) **Needs founder decision.**
- Session storage mechanism (e.g., `expo-secure-store`) — per-slice choice, not yet made.
- Password reset and account deletion flows — deletion is also an App Store requirement.

## Dependencies

- A provisioned Supabase project ([[Supabase & Database]], [[Open Questions]] #9)

**Related:** [[Supabase & Database]] · [[Settings]] · [[Architecture]]
