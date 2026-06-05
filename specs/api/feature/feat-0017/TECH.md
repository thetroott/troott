# feat-0017 TECH — Superadmin all personas + all profiles

## Status

| Phase | Scope | Code |
| ----- | ----- | ---- |
| **1** | User flags + Admin profile | [`user.seed.ts`](../../../../apps/api/src/configs/seeds/user.seed.ts) |
| **2** | Minister, Studio, Creator, Listener + login hydration + clients | Shipped — [`user.seed.ts`](../../../../apps/api/src/configs/seeds/user.seed.ts) |

---

## Phase 1 (current)

See existing seed pipeline: User → permissions → `adminService.createAdmin`.

Early exit replaced with idempotent upsert: existing superadmin gets `ensureSuperadminProfiles` + `ensurePersonaFlags`.

---

## Phase 2 — Seed implementation plan

### File changes

| File | Change |
| ---- | ------ |
| [`user.seed.ts`](../../../../apps/api/src/configs/seeds/user.seed.ts) | Superadmin user + admin profile + persona profile upsert |
| [`seeder.seed.ts`](../../../../apps/api/src/configs/seeds/seeder.seed.ts) | Order unchanged: plans before users |
| [`apps/api/example.env`](../../../../apps/api/example.env) | Document `ENABLE_SEEDING` + `SUPERADMIN_*` |
| [`turbo.json`](../../../../turbo.json) | Add `ENABLE_SEEDING` to `globalEnv` |

### Provision order (same user document)

```text
superAdmin User (existing)
  → ministerService.createMinister({ user, email, createdBy })
       → sets user.minister, isMinister
       → studioService.provisionDefaultStudioForMinister (inside createMinister)
  → creatorService.createCreator({ user, email, createdBy })
       → sets isCreator; provisions creator studio (inside createCreator)
  → listenerService.createListener({ user, email, createdBy })
       → libraryService.getOrCreateLibrary(listenerId)
       → assignFreeSubscription (see below)
       → recommendationService.seedColdStart (best-effort, non-blocking)
       → userRepository.updateUser: listener ref + isListener (service omits today)
  → minister onboarding: step 6, status completed (minister doc + user.onboard)
  → creator onboarding: completed if model supports it
  → patch user.primaryStudio → minister studio id (after creator overwrote it)
```

Reuse DTOs/services from [`user.service.ts`](../../../../apps/api/src/services/user.service.ts) `createDomainProfile` — prefer **calling the same service methods** over duplicating Mongo shapes.

### Listener bootstrap gaps

| Gap | Fix |
| --- | --- |
| `createListener` does not set `user.listener` | Seed (or service fix) `$set`s `listener` ObjectId on User |
| `assignFreeSubscription` is **private** on `user.service` | Extract shared helper, or duplicate minimal free-plan attach in seed module |
| `recommendationService.seedColdStart` | try/catch; failure must not abort seed |
| Free plan | Requires [`plan.seed.ts`](../../../../apps/api/src/configs/seeds/plan.seed.ts) before `seedUsers` |

### Idempotency helpers (pseudocode)

```typescript
async function ensureSuperadminProfiles(user: IUserDoc): Promise<void> {
  if (!user.minister) {
    await ministerService.createMinister({ user, email: user.email, createdBy: user._id });
  }
  const listenerDoc = await listenerRepository.findOne({ user: user._id });
  if (!listenerDoc.data) {
    await listenerService.createListener({ user, email: user.email, createdBy: user._id });
    // library + subscription + cold-start (mirror createDomainProfile LISTENER branch)
    await userRepository.updateUser(user._id, { listener: listenerId, isListener: true });
  } else if (!user.listener) {
    await userRepository.updateUser(user._id, { listener: listenerDoc.data._id, isListener: true });
  }
  const creatorDoc = await creatorRepository.findOne({ user: user._id });
  if (!creatorDoc.data) {
    await creatorService.createCreator({ user, email: user.email, createdBy: user._id });
  }
  await patchOnboardingCompleted(user);
  await patchPrimaryStudioToMinisterStudio(user);
}
```

**Replace** early `return` on existing superadmin with:

```typescript
const existing = await User.findOne({ userType: UserType.SUPERADMIN });
if (existing) {
  await ensureSuperadminProfiles(existing);
  await ensurePersonaFlags(existing);
  return;
}
```

On failure in `ensureSuperadminProfiles`: log and **rethrow** (no silent partial bootstrap).

### Minister / creator role attach

`createMinister`, `createCreator`, and `createListener` call `roleService.attachRole` when the user already has roles (superadmin has `SUPERADMIN`):

- **`attachRole` does not change `userType`** — verified; superadmin stays `super-admin`.
- Adds MINISTER / CREATOR / LISTENER to `user.roles[]` alongside SUPERADMIN.
- Triggers `PermissionService.initiatePermissionData` + cache clear per service.

**Test case:** after seed, `user.userType === 'super-admin'` and role slugs include `minister`, `creator`, `listener`.

### Onboarding patch (web Get Started)

After profiles exist, set on **minister** document:

```typescript
onboarding: { step: 6, status: OnboardStatus.COMPLETED }
```

Align `user.onboard` if web reads user-level onboard. Creator doc: set onboarding completed per [`creator.service.ts`](../../../../apps/api/src/services/core/creator.service.ts) shape.

Web [`portal-onboarding.util.ts`](../../../../apps/web/src/utils/portal-onboarding.util.ts): SUPER already hides Get Started — studio still needs minister profile + hydrate for routes to work.

### Dual studio / primaryStudio

Both `provisionDefaultStudioForMinister` and `provisionDefaultStudioForCreator` call `linkStudioToProfiles`, which sets `user.primaryStudio`. With order minister → creator, **creator studio wins** unless patched.

**Seed tail step:**

```typescript
await userRepository.updateUser(userId, {
  primaryStudio: ministerStudioId,
});
```

Login `studioCode` should resolve from `user.primaryStudio` → minister studio for default web QA.

---

## Phase 2 — Auth mapper (API)

**File:** [`auth.mapper.ts`](../../../../apps/api/src/mappers/auth.mapper.ts)

| Today | Target |
| ----- | ------ |
| `isMinister: user.userType === MINISTER` | `user.isMinister === true` (or minister ref present) |
| `isCreator: user.userType === CREATOR` | `user.isCreator === true` |
| `isListener: user.userType === LISTENER` | `user.isListener === true` |
| `creatorCode` only when `userType === CREATOR` | `creatorRepository.findOne({ user })` for any user with creator profile |
| `listenerCode` from `user.listener` | Ensure seed sets ref; optional fallback `findOne({ user })` |

Apply on **login** and **`GET /auth/me`** (same code path).

### Creator API contract

`GET /creator` for superadmin session: **200** with creator document (same as creator `userType`). Not null/404 solely because `userType === super-admin`.

### Login payload (target shape)

```typescript
{
  userType: 'super-admin',
  isSuper: true,
  isMinister: true,
  isCreator: true,
  isListener: true,
  ministerCode: string,
  listenerCode: string,
  creatorCode: string,
  studioCode: string, // minister studio
  adminCode: string,
}
```

### Auth options (clients)

| Option | API | Client |
| ------ | --- | ------ |
| **A — Super bypass** | `isSuper` on minister/listener/studio controllers (mostly exists) | Web/mobile allow portal when profile refs present |
| **B — Persona in payload** | Codes + flags on login/fetchMe | Clients hydrate without extra round-trips |

**Recommendation:** **A + B**.

---

## Phase 2 — Web session hydrate

**Blocker:** [`sessionState.tsx`](../../../../apps/web/src/context/session/sessionState.tsx) returns after admin hydrate when `isAdminPortalRole(normalized)`:

```typescript
if (isAdminPortalRole(normalized)) {
  await adminCtx.refreshProfile({ force: true });
  return; // skips minister, creator, studio for SUPER
}
```

**Target:** For `UserType.SUPER` with persona flags / codes, after `adminCtx.refresh`:

1. `ministerCtx.refresh` when `sessionUser.isMinister`
2. `creatorCtx.refresh` when `sessionUser.isCreator`
3. `studioCtx.refresh` when studio role or `studioCode` present
4. `storage.setStudioCode(sessionUser.studioCode)` when set

Do **not** change default post-login redirect (admin home) unless product asks.

**Related files:**

| File | Change |
| ---- | ------ |
| `sessionState.tsx` | Multi-hydrate for SUPER |
| `useSidebarStudioCode.ts` | Already persists code when present |
| `sidebar-search-index.ts` | SUPER in `STUDIO_ROLES` — needs hydrated `studioCode` |

Track under web [feat-0009](../../web/feature/feat-0009/PRODUCT.md) or a new web feat (not web feat-0017 analytics).

---

## Phase 2 — Mobile listener gate

**Files to touch:**

| File | Change |
| ---- | ------ |
| [`apps/mobile/api/hooks/app/useAuth.ts`](../../../../apps/mobile/api/hooks/app/useAuth.ts) | After login: do not reject super-admin if `isListener` and listener profile/code present |
| Onboarding guard (`useOnboardingGuard`) | Same rule for route eligibility |

Product: same JWT as web; mobile is listener portal, not a separate user.

---

## Verification matrix (phase 2)

| # | Action | Expected |
| - | ------ | -------- |
| 1 | Fresh DB + `ENABLE_SEEDING=true` | One user; Admin, Minister, Creator, Listener, 2 studios, Library |
| 2 | `db.users.findOne({ userType: 'super-admin' })` | `minister`, `listener`, `primaryStudio` set |
| 3 | `POST /auth/login` | 200; persona flags true; codes non-null |
| 4 | `GET /auth/me` | Same as login persona fields |
| 5 | `GET /minister` | 200 minister doc |
| 6 | `GET /studios/me` | Minister studio code |
| 7 | `GET /creator` | 200 creator doc |
| 8 | `GET /library` | Library doc for listener |
| 9 | Web login | Admin + `/studio/{code}/sermons` |
| 10 | Mobile login | Listener home/library |
| 11 | Re-run seed | Upsert only; no duplicates |
| 12 | `user.userType` after seed | Still `super-admin` |

---

## Tests

| Path | Cases |
| ---- | ----- |
| `apps/api/test/unit/seeds/user.seed.test.ts` (new) | Fresh seed creates all profiles; re-seed upserts missing only |
| `apps/api/test/unit/mappers/auth.mapper.test.ts` (new or extend) | Superadmin: flags from User booleans; `creatorCode` populated |
| Manual | [PRODUCT QA matrix](./PRODUCT.md#qa-manual-matrix) |

Mock `ministerService` / `listenerService` / `creatorService` for unit tests; integration test optional with in-memory Mongo.

---

## Turbo / ESLint

```json
"globalEnv": [
  "ENABLE_SEEDING",
  "SUPERADMIN_EMAIL",
  "SUPERADMIN_PASSWORD",
  "SUPERADMIN_FIRSTNAME",
  "SUPERADMIN_LASTNAME"
]
```

---

## Security

- Seed + full profiles: **dev/staging only** (`ENABLE_SEEDING=true`).
- Never enable full superadmin profile bootstrap in production deploy scripts unless explicitly approved.
- One password unlocks all personas — acceptable for local QA only.

---

## Implementation checklist (phase 2 PR)

**Seed**

- [x] `ensureSuperadminProfiles` in seed (idempotent)
- [x] Replace early “skip if superadmin exists” with upsert + flag patch
- [x] Set `user.listener` after listener create
- [x] Free subscription + library (shared helper or inlined)
- [x] Minister + creator onboarding completed
- [x] `primaryStudio` → minister studio after both provisions
- [x] Update `seeder.seed.ts` comment

**API**

- [x] Auth mapper: persona flags from User booleans / refs
- [x] Auth mapper: `creatorCode` for non-creator `userType`
- [x] `GET /creator` returns 200 for superadmin
- [x] `example.env` + `turbo.json` `ENABLE_SEEDING`

**Web**

- [x] `sessionState.tsx`: SUPER multi-hydrate (minister, creator, studio)
- [ ] Verify `studioCode` in local storage after `fetchMe` (manual QA)

**Mobile**

- [x] Listener gate allows superadmin when listener profile exists

**Tests & docs**

- [ ] Seed unit test (integration; optional follow-up)
- [x] Auth mapper test for superadmin
- [ ] Update PRODUCT acceptance checkboxes after manual QA
