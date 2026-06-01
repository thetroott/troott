# feat-0001: Mobile authentication and session (listener)

## Summary

The Troott **listener** mobile app authenticates users with email and password, email OTP verification after registration, and password recovery. There is **no guest account**: unauthenticated users see marketing/sign-in only. Signed-in users persist a token locally and reach onboarding or the tab shell based on `user.onboard` state. Complements [`specs/api/mobile-flow.md`](../../../api/mobile-flow.md) §3–4 and the screen inventory in [`specs/mobile/00 - auth.md`](../../00%20-%20auth.md).

## Problem

Auth is split across Expo Router groups `(auth)`, Zustand stores, `useAuth` mutations, MMKV/secure storage, and user context. Without a single contract, regressions break OTP handoff, session restore, or navigation after login. Web portal auth is separate ([`specs/web/feature/feat-0001`](../../../web/feature/feat-0001/PRODUCT.md)).

## Non-goals

- Minister/creator **web** Get Started ([`specs/web/feature/feat-0005`](../../../web/feature/feat-0005/PRODUCT.md)).
- Full **admin console** on mobile ([`specs/web/feature/feat-0003`](../../../web/feature/feat-0003/PRODUCT.md) — admin may log in but management is web-first).
- OAuth production flows while Apple/Google handlers remain stubs.
- Backend password hashing and email delivery implementation.

## Figma

Figma: none provided. Baseline: dark auth stack (`grey[950]`), `ScreenView` + `SharedHeader`, `FormInput`, `Button` (`isLoading`), OTP inputs.

## Consumer

**Listeners** (primary), and other `userType` values the register API allows on mobile. Internal QA uses the same flows.

## Behavior

### A. Account model and entry

1. The app does not create or persist a **guest** profile; personalized tabs require a real session.
2. Cold open without token: welcome (`app/index.tsx`) or auth routes — not Home tabs.
3. Cold open with valid token: hydrate user context; route per onboarding gate (feat-0002) or tabs.
4. Expired or missing token on protected navigation: redirect to sign-in; optional “Session expired” copy ([`00 - security.md`](../../00%20-%20security.md)).

### B. Registration

5. Registration collects identity fields per `RegisterUserDTO` (listener default `userType`).
6. Client validation (Zod + `react-hook-form`) runs before submit.
7. On success: success feedback; verification email stored for OTP screens; navigate to verify/activate — **not** signed in until activation succeeds. **Enter-email** persists address to auth context + MMKV while typing; **register** pre-fills email; **verify** reads the same store (`lib/register-email-draft.ts`).
8. Duplicate email: clear error; no duplicate account.
9. Submit shows loading; double submit prevented.

### C. Activation / verify email

10. OTP screen requires stored registration email (context + MMKV `userEmail`); if missing, user directed to re-register or enter email. Verify header shows the stored address.
11. Six-digit OTP for register purpose; resend with cooldown UI.
12. On successful activation with token in response: persist session (`persistSession`); run post-auth routing (onboarding or home per feat-0002).
13. Wrong/expired OTP: error; remain on OTP screen.
14. Pending deep link: after auth, resolve pending target when policy allows ([`specs/api/deep-links.md`](../../../api/deep-links.md)).

### D. Login

15. Email + password login; terms where shown on screen.
16. Success with token: persist session; navigate to tabs or onboarding incomplete route.
17. Inactive/unverified account: API 206 or equivalent → verify flow, not tabs.
18. Invalid credentials: non-blaming error toast or inline message.
19. Loading state on submit.

### E. Forgot password and reset

20. Forgot flow: collect email → OTP → new password (multi-step store).
21. Each step validates before advance; resend OTP countdown.
22. Successful reset returns user to login or auto-sign-in per product choice (today: login path).
23. Stubs on some reset routes are **gaps** — must not ship as production-complete without PRODUCT update.

### F. Session persistence

24. Access token stored via `storeToken` / secure storage; user id, email, type in MMKV.
25. Logout clears tokens, user context, and sensitive query cache keys.
26. `GET_LOGGEDIN_USER` in context is source for guards and profile display.

### G. Public vs protected routes

27. `(auth)` and welcome routes reachable without token.
28. `(tabs)/*` requires token + onboarding complete (feat-0002 guard).
29. Player, sermon detail, playlist, and minister routes follow same session rules as tabs unless explicitly public teaser.

### H. Admin / privileged roles on mobile

30. Public register must not create `admin` / `superadmin` ([`specs/web/feature/feat-0003`](../../../web/feature/feat-0003/PRODUCT.md)).
31. Existing admin users may log in; product does not promise full admin tooling on mobile.

## Open questions

| # | Topic | Options |
| - | ----- | ------- |
| 1 | Welcome `index.tsx` bypass | Today login CTA can push `/home` without auth — align with Behavior 2–3 |
| 2 | `activate-user-account` vs `verify-email` | Single activation route vs two; reconcile `_layout` screen names |
| 3 | OAuth | Enable Apple/Google vs remove placeholders |

## Related docs

- UX inventory: [`specs/mobile/00 - auth.md`](../../00%20-%20auth.md)
- Security UX: [`specs/mobile/00 - security.md`](../../00%20-%20security.md)
- Tech map: [`TECH.md`](./TECH.md)
