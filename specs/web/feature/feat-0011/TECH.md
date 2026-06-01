# feat-0011: Tech Spec — Web portal profile (`/profile`)

## Context

See [`PRODUCT.md`](./PRODUCT.md). Implementation root: `apps/web/src/app/profile/` + `components/features/profile/` + `hooks/app/useProfile.ts`.

**Local URL:** `http://localhost:5173/profile` (`PATH_PROFILE` in `routes/paths.ts`).

---

## Route map

Parent: dashboard layout via `minister.route.tsx` (shared minister/creator portal routes).

| Path | Component | `isAuth` | Notes |
| ---- | ----------- | -------- | ----- |
| `profile` | `UserProfile` | `true` | Public profile page |
| `settings` | `SettingsPage` | `true` | Account settings — not feat-0011 |

```tsx
// apps/web/src/routes/minister.route.tsx
{ name: 'profile', path: 'profile', element: <UserProfile /> },
```

**Auth gate:** `canAccessReturnPath` allows `/profile*` for `isInternalPortalUserType` (`auth-redirect.util.ts`).

**Nav:** Main nav **Profile** → `PATH_PROFILE`; **Settings** → `PATH_SETTINGS` (feat-0012). `UserAvatar` menu links both.

---

## Component tree

```text
DashboardLayout
└── UserProfile
    ├── useProfileQuery()
    ├── Cover hero + insight cards + About + Recent sermons (placeholder)
    └── EditProfileDialog
        ├── useUpdateProfileMutation()
        ├── mapProfileToFormValues / mapFormValuesToUpdatePayload
        └── ImageUploadTile (cover | avatar)
            └── api.storage.uploadImage
```

| File | Role |
| ---- | ---- |
| `app/profile/UserProfile.tsx` | Read view, loading skeleton, opens dialog |
| `app/profile/profile.types.ts` | `ProfileDTO`, form mappers, `isMinisterProfile` |
| `app/profile/profile.dummy.ts` | **Delete** — no mock in production |
| `components/features/profile/EditProfileDialog.tsx` | Modal edit UX (Figma 11719 / 11732) |
| `components/features/profile/ImageUploadTile.tsx` | Upload lifecycle + preview |
| `hooks/app/useProfile.ts` | **Mock** query + mutation |
| `utils/asset-url.util.ts` | **Replace** with `utils/image-display.util.ts` — API URLs only; no client S3 env |

Account settings (password, deactivate, legal name/email): [feat-0012](../feat-0012/TECH.md) — `UpdatePasswordSection` on `/settings`.

---

## Data contract (`ProfileDTO`)

Canonical types in `profile.types.ts`. Intended to mirror a future unified API profile DTO.

```ts
ProfileBase {
  id, userType, firstName, lastName, email, slug?, bio?,
  avatar?: Asset | null, coverImage?: Asset | null,
  createdAt, updatedAt
}

MinisterProfile extends ProfileBase {
  userType: MINISTER
  ministerialName?, ministryName?, ministryHQLocation?,
  ministryWebsite?, socials?: { instagram?, twitter?, tiktok? }
}

ProfileDTO = ListenerProfile | MinisterProfile
```

**Update payload** (`UpdateProfilePayload`): partial bio/avatar/coverImage; minister nested `ministry.*` + `socials`.

**Form mapping:**

- `mapProfileToFormValues(profile)` → discriminated `ProfileFormValues` (`kind: 'minister' | 'listener'`).
- `mapFormValuesToUpdatePayload(initial, current)` → only changed keys; asset removal sends `null`.

---

## Hooks (target — live API only)

```ts
// apps/web/src/hooks/app/useProfile.ts
export const profileQueryKeys = { me: () => ['profile', 'me'] as const };

useProfileQuery()     // GET /api/v1/minister → mapMinisterDocToProfileDTO
useUpdateProfileMutation() // PUT /api/v1/minister → refetch GET
```

**Remove:** `DUMMY_MINISTER_PROFILE`, `shouldUseRealProfileApi()`, mock mutation fallback, `PROFILE_UI_QUERY_KEY` mock key.

| **Minimum production (MVP)** | Phase 0 + **0.5 + 1 + 2 + 7** — live API, no mock/legacy |
| **Full production** | All phases 0–7 |

See [PRODUCT § Production readiness plan](./PRODUCT.md#production-readiness-plan).

---

## API mapping (target)

Today **`GET /profile/me` does not exist** on the API. Web should fan out by session `userType`:

| Persona | Read | Write | Mapper |
| ------- | ---- | ----- | ------ |
| Minister | `GET /api/v1/minister` (`Protect`) | `PUT /api/v1/minister` | Minister doc → `MinisterProfile` |
| Creator | `GET /api/v1/creator` (if exposed) | `PUT /api/v1/creator` | Creator profile fields |
| Listener | `GET /api/v1/listener` | `PUT /api/v1/listener` | `UpdateListenerProfileDTO` fields |

Existing but **not used by profile page:**

| Endpoint | Notes |
| -------- | ----- |
| `GET /api/v1/user` | Basic account fields only (no bio/cover) |
| `PUT /api/v1/user` | `EditUserDTO` — avatar/cover on **user** doc via `userService.updateUserProfile` |

**Minister PUT body** (`UpdateMinisterDTO`): nested `profile.ministerialName`, `profile.ministryName`, `profile.description` (maps to bio), `profile.ministryHQLocation`, `profile.websiteUrl`, `profile.socials`, top-level `avatar`/`banner` (string keys — align with web `Asset.s3Key`).

**Storage upload (already wired):**

```ts
api.storage.uploadImage(file, onProgress) → ImageDTO { file, s3Key, fileName, uploadRef }
```

Web: **`file`** → display URL (server-side from `apps/api`); **`s3Key`** → PUT body. **No CDN config on web.**

**Recent sermons (target):**

```http
GET /api/v1/sermon/minister/:ministerId?status=published&limit=3&sort=-publishedAt
```

Use `studio-sermon-owner.util.ts` owner id resolution.

**Insight metrics:** no dedicated endpoint wired; defer to analytics spec or sermon aggregates.

---

## State and cache

| Layer | Today | Target |
| ----- | ----- | ------ |
| Profile read | Dummy fallback in dev | **Always** `GET /minister`; `staleTime` ~5m |
| Profile write | Mock merge on dev failure | **Always** `PUT /minister` → refetch |
| Images | Client S3 env; ignores `ImageDTO.file` | Pass-through API URLs only (UC-P11–P14) |
| Mock / legacy | `profile.dummy.ts`, feature flags | **Deleted** |
| Session | Unaffected on profile save | Change password → `tokenVersion` bump per feat-0004 |

After minister profile PUT, invalidate Redis keys server-side (`minister:profile:{userId}`) — already pattern in controller.

---

## Web image delivery (`apps/web`)

Portal-wide plan: [PRODUCT § Web image delivery](./PRODUCT.md#web-image-delivery-portal-wide). Applies to **all** stored-image surfaces, not only `/profile`.

### Current vs target

| Pattern | Today | Target |
| ------- | ----- | ------ |
| After upload | Store `s3Key` only | `mapImageUploadToAsset(ImageDTO)` → `{ fileName, s3Key, url: file }` |
| `<img src>` | `resolveAssetUrl(s3Key, VITE_*)` | `resolveImageDisplayUrl(asset \| string)` |
| PUT payloads | `s3Key` | Unchanged |
| Env | `VITE_ASSET_BASE_URL`, `VITE_S3_*` in `.env.sample` | **Removed** for images |

### Shared util (new / refactor)

**File:** `apps/web/src/utils/image-display.util.ts`

```ts
import type { ImageDTO } from '@/api/...'; // align with storage envelope

export interface DisplayAsset {
  fileName: string;
  s3Key: string;
  url?: string;
}

export function mapImageUploadToAsset(dto: ImageDTO): DisplayAsset {
  return {
    fileName: dto.fileName,
    s3Key: dto.s3Key ?? '',
    url: dto.file,
  };
}

export function resolveImageDisplayUrl(
  value: string | { url?: string } | null | undefined,
  opts?: { v?: string | number },
): string | undefined {
  if (!value) return undefined;
  const raw = typeof value === 'string' ? value : value.url;
  if (!raw) return undefined;
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    if (opts?.v != null) {
      const sep = raw.includes('?') ? '&' : '?';
      return `${raw}${sep}v=${encodeURIComponent(String(opts.v))}`;
    }
    return raw;
  }
  return undefined; // never synthesize URLs on web — use apps/api responses only
}
```

**Delete** S3/bucket branches from `asset-url.util.ts` or replace file entirely.

### API contract (`apps/api` — existing, no new work)

Server-side image URLs are **already provided** by `apps/api`. feat-0011 **does not** add CDN, storage mappers, or new routes on the API.

| Source | Web consumes |
| ------ | ------------ |
| `POST /storage/upload` | `ImageDTO.file`, `ImageDTO.s3Key` |
| `GET /minister` | Avatar/banner URL strings as returned |
| Sermon/search/library DTOs | `imageUrl`, `thumbnail`, `banner` as returned |

Reference: [PRODUCT § API contract](./PRODUCT.md#api-contract-existing--appsapi).

### Upload call sites (wire `mapImageUploadToAsset`)

| File | Notes |
| ---- | ----- |
| `components/features/profile/ImageUploadTile.tsx` | Preview `src={value.url}` |
| `hooks/app/useUploader.tsx` | Return `url` in hook result for callers |
| `hooks/app/useStorage.ts` | Same |
| Upload context / sermon thumbnail | After storage upload, set thumbnail URL from `file` (keep blob only for pre-upload pick in `ThumbnailUpload`) |
| Get Started document upload | Any path calling `api.storage.uploadImage` |

### Read call sites (wire `resolveImageDisplayUrl`)

| File | Notes |
| ---- | ----- |
| `app/profile/UserProfile.tsx` | Hero cover + avatar |
| `components/shared/navigation/UserAvatar.tsx` | Session user avatar when API wired |
| Studio / sermon UI | `imageUrl`, `thumbnail`, `banner` fields from API — pass through resolver if value may be key-only during migration |
| `hooks/app/useProfile.ts` | Always API; map GET URLs to `Asset.url` |

### Types

| File | Change |
| ---- | ------ |
| `dtos/common-fields.ts` | `Upload.url?: string` |
| `app/profile/profile.types.ts` | `Asset.url?: string` |

---

## UI constants (implementation)

| Token | Usage |
| ----- | ----- |
| `#2b2a2c` | Card backgrounds |
| `#545454` | Borders |
| `#08ffdb` | Primary save, avatar ring, focus rings |
| `#bdbdbd` / `#9d9d9d` | Muted text |
| `max-w-[1200px]` | Page container |
| Cover height `368px` | Hero |
| Dialog width `477px` | Edit profile |

Loading: pulsing placeholders for hero + 4 stat cards.

Error: red text “Could not load profile. Please refresh.” (shown when `isError` during loading branch — edge case if data null + error).

---

## Change password

Password change lives on **`/settings`** ([feat-0012](../feat-0012/TECH.md)) via `UpdatePasswordSection`.

---

## Gaps and debt

| Item | Severity | UC | Notes |
| ---- | -------- | -- | ----- |
| Mock / legacy profile path | **High** | P01, P02 | `profile.dummy.ts`, dummy fallback, `VITE_PROFILE_USE_REAL_API` |
| Client S3 URL construction on web | **High** | P13 | `asset-url.util.ts`, `VITE_S3_*` — use API `file` / GET URLs |
| Upload handlers ignore `ImageDTO.file` | **High** | P11, P13 | Store `s3Key` only in `ImageUploadTile`, uploader hooks |
| Web not consuming API image URLs | **High** | P14 | **`apps/api` done** — web must pass through `ImageDTO.file` + GET fields |
| Placeholder recent sermons | Medium | P01 | `recentSermonsPlaceholder` — remove or wire API |
| Placeholder insight stats | Medium | P01 | Hard-coded `—` |
| **See all** button | Low | P01 | No `Link` |
| Creator persona | Medium | P05 | No creator branch in `useProfileQuery` |
| Admin on `/profile` | Low | — | Allowed by auth; UX undefined |
| Slug / website not in dialog | Medium | P10 | In DTO/mappers; not in UI |
| Socials/website not on read view | Low | P02 | Edit-only fields |
| Get Started ↔ profile sync | Medium | P04 | Rules in PRODUCT; not implemented |
| `GET /user` vs rich profile | Medium | — | API split across documents |

---

## Implementation checklist

Legacy checklist — superseded by [Production readiness plan](#production-readiness-plan) below for execution order.

| # | Task | Status |
| - | ---- | ------ |
| 1 | Profile page UI (read + edit dialog) | Done |
| 2 | Image upload via storage client | Done |
| 2a | Production alignment: live API + image pass-through (Phase 0.5) | Open |
| 3 | Form dirty detection + partial payload | Done |
| 4 | Delete mock query/mutation in `useProfile.ts` | Open |
| 5 | `mapMinisterDocToProfileDTO` + always-on `useProfileQuery` | Partial |
| 6 | `useUpdateProfileMutation` → `PUT /minister` (no mock fallback) | Partial |
| 7 | Creator + listener profile branches | Open |
| 8 | Recent sermons from sermon API | Open |
| 9 | Insight cards from analytics/aggregates | Open |
| 10 | Delete `profile.dummy.ts` + legacy env from build | Open |
| 11 | Unit tests: mappers + payload | Open |
| 12 | E2E/manual: production QA table | Open |

---

## Production readiness plan

Engineering execution of [PRODUCT § Production readiness plan](./PRODUCT.md#production-readiness-plan). Work **Phase 0.5 → 1 → 2 → 7** first for minister MVP; then 3–6. **`apps/api` is source of truth — no mock, no web CDN/S3, no new API routes in this feature.**

### Phase 0.5 — Production alignment (`apps/web`)

Execute [Web image delivery](#web-image-delivery-appsweb) + [PRODUCT § API contract (existing)](./PRODUCT.md#api-contract-existing--appsapi).

**Order:**

1. **Delete mock / legacy:** `profile.dummy.ts`, `DUMMY_MINISTER_PROFILE`, `VITE_PROFILE_USE_REAL_API`, mock mutation fallback.
2. **`useProfile.ts`:** always `GET /minister` + `PUT /minister` → refetch.
3. Add `image-display.util.ts` — pass-through API URLs only.
4. Wire upload → `mapImageUploadToAsset(ImageDTO)` on all storage call sites.
5. Wire read → `resolveImageDisplayUrl` on profile, nav, lists.
6. Remove `VITE_S3_*` / `VITE_ASSET_*`; delete S3 logic from `asset-url.util.ts`.
7. `mapMinisterDocToProfileDTO` — map GET image fields from API.

**Acceptance:** PRODUCT #2–7, #13–15; UC-P11–P14.

### Phase 1 — Profile polish

| File | Purpose |
| ---- | ------- |
| `utils/profile-map.util.test.ts` | Mapper round-trip |
| `utils/image-display.util.test.ts` | URL pass-through |
| `hooks/app/useProfile.ts` | Error UX — no silent dummy on failure |
| `UserProfile.tsx` | Remove `recentSermonsPlaceholder` or empty state |

**Acceptance:** Hard refresh profile + images; no dummy in bundle.

### Phase 2 — Cache sync

**Edit `useUpdateProfileMutation` `onSuccess`**

```ts
queryClient.invalidateQueries({ queryKey: profileQueryKeys.me() });
await ministerCtx.refreshProfile?.({ force: true }); // useMinister()
dispatchOnboardingProfileRefresh(); // optional
```

**Edit `UserProfile.tsx`** — hero uses `Asset.url`; optional `?v=updatedAt` on display URL after PUT.

### Phase 3 — Creator

| File | Change |
| ---- | ------ |
| `profile-map.util.ts` | Add creator mappers |
| `profile.types.ts` | `CreatorProfile` type if needed |
| `useProfile.ts` | Branch on `userType === CREATOR` → `api.creator.*` |
| `EditProfileDialog.tsx` | `isCreatorProfile()` branch — fields TBD from creator DTO |

### Phase 4 — Read view + UC-P10

| File | Change |
| ---- | ------ |
| `EditProfileDialog.tsx` | Website (+ slug if P0-1 approves) inputs |
| `UserProfile.tsx` | Social links, website, HQ on read; empty states |
| `profile.types.ts` | Ensure mappers include new fields |

### Phase 5 — Recent sermons

| File | Change |
| ---- | ------ |
| `hooks/app/useRecentPublishedSermons.ts` | New — `GET /sermon/minister/:id` |
| `UserProfile.tsx` | Map rows; `Link` See all → `studioSermonsListPath` |
| `utils/studio-sermon-owner.util.ts` | Resolve owner id |

### Phase 6 — Insight cards

| File | Change |
| ---- | ------ |
| `UserProfile.tsx` | Replace `—` with query data or hide cards |
| Optional hook | `useProfileInsightStats` from sermon list reduce |

### Phase 7 — Quality

| Item | Action |
| ---- | ------ |
| Unit tests | `profile-map.util.test.ts`, extend form mapper tests |
| CI | Ensure prod build does not import `profile.dummy.ts` |
| Manual | Run PRODUCT production QA table (#11–17) |
| Docs | Mark TECH checklist + PRODUCT launch checklist done |

### API prerequisites (existing — verify integration)

| Endpoint | Verified |
| -------- | -------- |
| `GET /api/v1/minister` — profile + image URL fields | [ ] |
| `PUT /api/v1/minister` — partial update + avatar/banner keys | [ ] |
| `POST /api/v1/storage/upload` — `ImageDTO.file` + `s3Key` | [ ] |
| `GET /api/v1/creator` + PUT (Phase 3) | [ ] |
| `GET /api/v1/sermon/minister/:id` with `status=published` | [ ] |

### Risk register

| Risk | Mitigation |
| ---- | ---------- |
| Minister doc missing for new user | Empty profile shell + edit dialog; 404 → friendly error |
| Avatar on user doc vs minister doc | Map minister `avatar`/`banner` only; do not split with Settings |
| Profile image display | Web pass-through of `apps/api` URL fields only |
| Web ignores API `file` URL | Phase 0.5 — wire `ImageDTO.file` + GET mappers on web |
| Socials shape mismatch (API array vs web object) | Normalizer in mapper |
| Creator API incomplete | Phase 3 blocked; hide `/profile` for creator until ready or show empty state |

---

## Testing

**Unit (recommended):**

- `mapProfileToFormValues` / `mapFormValuesToUpdatePayload` — minister + listener, asset null removal.
- `getDisplayName` / `getInitials` logic (extract from `UserProfile` if tested).

**Manual:** see [PRODUCT test plan](./PRODUCT.md#test-plan-manual).

No automated tests under `apps/web` for profile today.

---

## Cross-references

- [`08 - user-profile.md`](../../08%20-%20user-profile.md)
- [feat-0010 Get Started](../feat-0010/PRODUCT.md) — onboarding vs profile (UC-P04)
- [feat-0012 Settings](../feat-0012/TECH.md) — account settings; UC index in feat-0011 PRODUCT
- [feat-0009 Auth routing](../feat-0009/PRODUCT.md)
- [API feat-0004 token](../../../api/feature/feat-0004/PRODUCT.md) — password change
- `apps/api` — `POST /storage/upload`, `GET/PUT /minister` (existing; no feat-0011 API changes)
- `apps/web/docs/adr/0001-web-api-client.md` — axios envelope patterns for mutations
