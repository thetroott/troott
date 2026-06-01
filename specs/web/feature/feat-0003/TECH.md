# feat-0003: Tech Spec — Admin login without public registration

## Context

See [`PRODUCT.md`](./PRODUCT.md). This feature is **cross-surface**: `apps/api`, `apps/web`, `apps/mobile`.

| Surface | Responsibility |
|---------|----------------|
| **API** | Enforce register allow-list; login open to all active users; admin provisioning via protected routes |
| **Web** | No admin register UI; login + post-auth for admin/super-admin (feat-0001) |
| **Mobile** | No admin register UI; login persists session for admin/super-admin |

## Product rules (implementation)

| Rule | Owner |
|------|--------|
| Register allow-list: listener, creator, minister only | API `AuthService.validateRegister` |
| Login: no userType gate | API `loginUser` |
| Web: no admin signup UI | `Register.tsx`, `register-form.tsx` |
| Web: admin login → admin home | `useRedirectAfterAuth`, feat-0001 |
| Mobile: register payload never admin/super | Mobile register mutations / forms |
| Mobile: admin login → persist session | `useAuth` `LoginMutation` + `persistSession` |
| Admin account creation | `admin.controller`, invitation accept, seeder — not `auth/register` |

## API anchors

| Concern | File | Current / target |
|---------|------|------------------|
| Register validation | `apps/api/src/services/auth.service.ts` | `allowedUsers`: `LISTENER`, `CREATOR`, `MINISTER` only (lines ~41–45) — **keep** |
| Register handler | `apps/api/src/controllers/auth.controller.ts` | `registerUser` — no admin branch; super-admin email guard on duplicate |
| Login handler | `apps/api/src/controllers/auth.controller.ts` | `loginUser` — no userType filter — **keep** |
| Register DTO | `apps/api/src/dtos/auth.dto.ts` | `userType?: UserType` — API must reject admin/super |
| Admin provisioning | `apps/api/src/controllers/admin.controller.ts` | `inviteAdmin`, `acceptAdminInvitation`, `createAdmin` |
| Admin “me” gate | `apps/api/src/services/auth.service.ts` | `getLoggedInUser` rejects admin when `isAdmin === false` — unrelated to login |
| RBAC notes | `apps/api/src/_specs/rbac.md` | Super-admin not created via public API |

### API tests (recommended)

| Case | Expected |
|------|----------|
| `POST /auth/register` `{ userType: 'admin', ... }` | 400, message lists allowed types |
| `POST /auth/register` `{ userType: 'superadmin', ... }` | 400 |
| `POST /auth/register` `{ userType: 'minister', ... }` | 200 + OTP (happy path) |
| `POST /auth/login` active admin user | 200 + token + `userType: admin` |
| `POST /auth/login` active super-admin | 200 + token + `userType: superadmin` |

## Web anchors

| Concern | File | Notes |
|---------|------|--------|
| Register page | `apps/web/src/app/auth/Register.tsx` | `registrationUserType={UserType.MINISTER}` — no admin |
| Register form | `apps/web/src/components/shared/auth/register-form.tsx` | Sends `registrationUserType ?? MINISTER` |
| Login | `apps/web/src/components/shared/auth/login-form.tsx` | No admin block |
| Post-auth | `apps/web/src/hooks/app/useRedirectAfterAuth.ts` | `isAdminPortalRole` → `PATH_ADMIN_PREFIX` + users segment |
| Role helpers | `apps/web/src/utils/roles.util.ts` | `ADMIN_PORTAL_ROLES`, `normalizePortalUserType` |
| feat-0001 | `specs/web/feature/feat-0001/` | Behaviors 25–26, 39, 46 — admin login routing |

### Web verification

| Case | Steps |
|------|--------|
| Register UI | No admin/super option |
| DevTools tamper | Register with `userType: admin` → API error toast |
| Admin login | Valid admin → `/admin/users` (or configured admin home) |
| Super-admin login | Valid super → admin home + Main sidebar (feat-0002) |

```bash
cd apps/web && pnpm exec tsc --noEmit
```

## Mobile anchors

| Concern | File | Notes |
|---------|------|--------|
| Login hook | `apps/mobile/api/hooks/app/useAuth.ts` | `LoginMutation` → `persistSession` → `goTo('/(tabs)/home')` |
| Register hook | Same file | `RegisterMutation` — ensure payload `userType` is listener (or allowed type only) |
| Register form | `apps/mobile/components/features/auth/forms/register-form.tsx` | Must not collect admin type; wire register API with explicit listener when implemented |
| Login form | `apps/mobile/components/features/auth/forms/login-form.tsx` | Should call `LoginMutation` (today may be stubbed — align with spec) |
| Auth client | `apps/mobile/api/clients/auth.ts` | `registerUser`, `loginUser` |

### Mobile gaps vs spec (track in implementation)

| Gap | Action |
|-----|--------|
| `login-form.tsx` may bypass real `useAuth().login` | Wire submit to `LoginMutation` so admin login is testable |
| `register-form.tsx` may not call API yet | When wired, default `userType: listener` (or product-chosen self-service type) |
| No admin-specific post-login screen | Accept Behavior 26–27: session OK, web for management |

```bash
cd apps/mobile && pnpm exec tsc --noEmit
```

## PRODUCT behavior mapping

| Behaviors | Layer |
|-----------|--------|
| 1–6, 29–32 | API register + provisioning |
| 7–10 | API login + password recovery |
| 11–14, 36–39 | Web register UI + tamper |
| 15–19 | Web login + feat-0001 redirect |
| 20–22, 28 | Mobile register |
| 23–27 | Mobile login + session |
| 33–35 | feat-0001 / feat-0002 cross-refs |
| 40 | API duplicate super-admin email |

## Implemented (no shared util)

- **API**: `allowedUsers` in `auth.service.ts` `validateRegister`; login unchanged.
- **Web**: `register-form.tsx` rejects `ADMIN` / `SUPER` before submit; `Register.tsx` still passes `MINISTER`.
- **Mobile**: `register-form` sends `UserType.LISTENER`; `useAuth` `RegisterMutation` clamps to listener/creator/minister; `login-form` uses `LoginMutation` (admin login OK).
- **Tests**: `apps/api/test/unit/modules/auth.test.ts` — reject admin/super register; admin login 200.

## Testing and validation (manual)

| Persona | Register (web/mobile) | Login (web) | Login (mobile) |
|---------|------------------------|-------------|----------------|
| New listener | Allowed | N/A | N/A |
| New minister (web) | Allowed | N/A | N/A |
| Admin (provisioned) | **Blocked** (public) | **Allowed** → admin home | **Allowed** → session + home |
| Super-admin (seed/ops) | **Blocked** (public) | **Allowed** | **Allowed** |

## Related

- [feat-0001 TECH](../../web/feature/feat-0001/TECH.md)
- [feat-0002 TECH](../../web/feature/feat-0002/TECH.md)
- `apps/api/src/routes/admin.router.ts`
- `specs/api/mobile-flow.md` — listener registration journey
