# feat-0001: Tech Spec — Mobile authentication and session

## Context

See [`PRODUCT.md`](./PRODUCT.md). Maps behaviors to `apps/mobile` and API auth endpoints.

### Route anchors

| Concern | Path | Notes |
| ------- | ---- | ----- |
| Welcome | `app/index.tsx` | Marketing CTAs; **gap:** login may route `/home` without session |
| Auth group | `app/(auth)/_layout.tsx` | Stack, `headerShown: false` |
| Login | `app/(auth)/login.tsx` | `LoginForm` |
| Register | `app/(auth)/register.tsx` | `register-form.tsx` |
| Enter email | `app/(auth)/enter-email.tsx` | Seeds register slice via `useRegisterAuth` |
| Verify email | `app/(auth)/verify-email.tsx` | `VerifyEmailForm` |
| Activate placeholder | `app/(auth)/activate-user-account.tsx` | Stub/placeholder |
| Forgot / reset | `app/(auth)/request-password-otp.tsx`, `reset-password*.tsx` | Partial stubs |
| Tabs (protected) | `app/(tabs)/_layout.tsx` | `useOnboardingGuard` |

### Hooks and context

| Concern | Path |
| ------- | ---- |
| Context slices | [`feat-0011/TECH.md`](../feat-0011/TECH.md) |
| State ownership | [`feat-0010/TECH.md`](../feat-0010/TECH.md) |
| Auth mutations | `api/hooks/app/useAuth.ts` — `persistSession`, register/login/activate/forgot/reset/logout |
| Navigation helper | `api/hooks/shared/useGoTo.tsx` |
| User context | `context/user/userState.tsx`, `context/apps/app.context.tsx` |
| API user map | `api/utils/map-api-user.ts` |
| Token storage | `api/services/mmkv-storage.ts`, `api/services/secure-storage.ts` |
| Query keys | `api/utils/query-keys.ts` (`auth.user`) |

### Auth form context (not Zustand)

| Slice | Path |
| ----- | ---- |
| Register wizard | `context/auth/authState.tsx` |
| Forgot password wizard | `context/auth/authState.tsx` |
| Provider | `context/auth/authState.tsx` (inside `TroottProviders`) |

### Form components

| Flow | Component |
| ---- | ----------- |
| Login | `components/features/auth/forms/login-form.tsx` |
| Register | `components/features/auth/forms/register-form.tsx` |
| Verify OTP | `components/features/auth/forms/verify-email-otp.tsx` |
| Enter email | `components/features/auth/forms/enter-email-form.tsx` |
| Forgot | `components/features/auth/forms/forgot-password-form.tsx` |
| Reset password | `components/features/auth/forms/password-reset-form.tsx` |

### API client

| Concern | Path |
| ------- | ---- |
| Auth HTTP | `api/clients/auth.ts` (or via `api/api.ts`) |
| DTOs | `api/dtos/auth.dto.ts` |
| Errors | `api/errors/handlers.ts` |

### Backend

| Concern | Path |
| ------- | ---- |
| Auth controller | `apps/api/src/controllers/auth.controller.ts` |
| Auth service | `apps/api/src/services/auth.service.ts` |

### PRODUCT behavior mapping

| Behaviors | Implementation |
| --------- | -------------- |
| 1–4, 24–26 | `persistSession`, `clearTokens`, `userContext`, `getToken` |
| 5–9 | `register-form.tsx`, `useAuth` `RegisterMutation`, `useRegisterAuth` |
| 10–13 | `verify-email-otp.tsx`, activate mutations in `useAuth` |
| 14 | `lib/deep-link/replace-with-pending-or-home.ts` |
| 15–19 | `login-form.tsx`, `useAuth` login mutation |
| 20–23 | `forgot-password-form.tsx`, `forgot-password-store`, reset routes (**stubs flagged**) |
| 27–29 | `(auth)` vs `(tabs)` groups, `useOnboardingGuard` |
| 30–31 | Register payload `userType` allow-list (align API feat-0003) |

## Gaps and drift

| Gap | File / note |
| --- | ----------- |
| Welcome bypasses auth | `app/index.tsx` → `router.push('/home')` |
| `create-account` vs `register` | Historical `_layout` name mismatch in older `00 - auth.md` |
| Reset password shells | `(auth)/reset-password.tsx` minimal |
| `useTrackStore` on login | Legacy UI store import on login form — not session source of truth |

## Testing and validation

| Behaviors | Verification |
| --------- | -------------- |
| 1–4 | Fresh install → welcome; no token → cannot open library |
| 5–9 | Register → verify route; duplicate email error |
| 10–13 | Valid/invalid OTP; resend cooldown |
| 15–19 | Login → tabs; wrong password; 206 → verify |
| 25 | Logout → token cleared; welcome/login |
| 14 | Deep link pending → post-login target |
