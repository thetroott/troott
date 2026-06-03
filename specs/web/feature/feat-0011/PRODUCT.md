# feat-0011: Web portal profile (`/profile`)

## Summary

**Profile** is the authenticated minister/creator **public identity** page at **`http://localhost:5173/profile`**. It previews how listeners see the signed-in user (cover, avatar, display name, bio, ministry metadata) and edits **public-facing fields** in a modal dialog.

**Account settings** (legal name, email, password, deactivate) live on **`/settings`** — [feat-0012](../feat-0012/PRODUCT.md).

Related: portal auth [feat-0001](../feat-0001/PRODUCT.md); Get Started collects KYC/address/ministry during onboarding [feat-0010](../feat-0010/PRODUCT.md) — profile is the **ongoing public edit surface** after onboarding, not a checklist step.

## Problem

Ministers and creators need a single place in the web portal to preview their public identity and update bio, imagery, and ministry metadata without entering the sermon upload flow. Product and engineering need one contract for layout, edit behavior, role branching, API wiring, and clear separation from account **Settings**.

## Goal

**Live production app:** `/profile` and all portal surfaces use **`apps/api` only** — no mock data, no legacy fallbacks, no client-side S3/CDN configuration.

**Definition of done (production):**

1. `useProfileQuery` / `useUpdateProfileMutation` **always** call `GET` / `PUT /api/v1/minister` (and creator branch when applicable) — **remove** `DUMMY_MINISTER_PROFILE`, `profile.dummy.ts`, `VITE_PROFILE_USE_REAL_API`, and mock mutation paths.
2. Edit dialog saves partial payloads; images persist via minister/creator `PUT` (`s3Key`); **display** uses **`ImageDTO.file`** from upload and image URL strings from API GET responses as returned by the server.
3. Minister context + profile query invalidate on save (UC-P04).
4. Creator persona uses creator API + UI branch (UC-P05).
5. Recent sermons and insight cards show **real API data or intentional empty states** — remove hard-coded placeholder rows.
6. **UC-P11 / UC-P12 / UC-P13:** Web consumes API image URLs portal-wide — **no** `resolveAssetUrl`, **no** `VITE_S3_*` / `VITE_ASSET_*`.
7. Open product decisions (UC-P10, insights, **See all**) resolved or explicitly deferred with UX copy.
8. Manual QA + mapper unit tests; no P0/P1 gaps in TECH checklist.

Detailed execution plan: [TECH § Production readiness plan](./TECH.md#production-readiness-plan).

## Implementation status (shipped)

| Area | Status | Notes |
| ---- | ------ | ----- |
| Read UI (`UserProfile.tsx`) | **Done** | Hero, insight placeholders, about, recent-sermon placeholders |
| Edit dialog (`EditProfileDialog.tsx`) | **Done** | Minister + listener branches; dirty save; discard confirm |
| Image upload (`ImageUploadTile.tsx`) | **Partial** | Real `POST /storage/upload`; must wire **`ImageDTO.file`** for preview (UC-P11) — not client S3 env |
| Profile data load/save | **Partial** | API hook exists; **remove mock/dummy fallback** — always `GET/PUT /minister` |
| Save → read view sync | **Partial** | PUT + refetch wired; hero images need **`ImageDTO.file`** / GET URL on web (UC-P12) |
| Web image delivery (portal-wide) | **Gap** | Web ignores API `file` URL; uses `resolveAssetUrl` + `VITE_S3_*` (UC-P13) |
| API contract (images) | **Done (server)** | `POST /storage/upload` → `ImageDTO.file`; GET DTOs — **`apps/api` owns URLs; no CDN on web** |
| Insight stats | **Placeholder** | Em dash until analytics API — replace with real or empty state |
| Recent sermons | **Placeholder** | Remove `recentSermonsPlaceholder`; wire sermon API or empty state |
| Sidebar **Profile** | **Done** | `PATH_PROFILE` in Main nav |
| Account menu **Profile** | **Done** | `UserAvatar` → `/profile` |
| Change password on profile | **Removed** | → [feat-0012](../feat-0012/PRODUCT.md) `/settings` |

Code: `apps/web/src/app/profile/`, `components/features/profile/`, `hooks/app/useProfile.ts`.

## Non-goals

- **Account settings** (name, email, password, deactivate) — [feat-0012](../feat-0012/PRODUCT.md).
- Listener mobile app profile (see `specs/mobile`).
- Admin user management (`/admin/users`).
- Sermon upload, studio CRUD, or analytics ([feat-0006](../feat-0006/PRODUCT.md), [feat-0008](../feat-0008/PRODUCT.md)).
- Public anonymous profile pages (deep links require sign-in per [feat-0004 API](../../../api/feature/feat-0004/PRODUCT.md)).
- Mock profile data (`profile.dummy.ts`), dev-only API flags, or placeholder sermon rows in production.
- Client-side S3/CDN configuration or new **`apps/api`** routes for images — consume existing API responses.
- Two-factor auth and browser sessions (no API; see feat-0012 non-goals).

---

## Use case index

| ID | Use case | Status | Owner / notes |
| -- | -------- | ------ | ------------- |
| **UC-P01** | View profile (minister) | **Partial** | UI done; **always load from `GET /minister`** — remove dummy |
| **UC-P02** | Edit public fields (bio, images, ministry, socials) | **Partial** | **`PUT /minister`**; image preview/read sync (UC-P11/P12) |
| **UC-P03** | Change password | **Out of scope** | [feat-0012](../feat-0012/PRODUCT.md) `/settings` |
| **UC-P04** | Edit public profile after Get Started ministry step | **Partial** | Same fields overlap onboarding; **no sync rules** when minister API connected (see below) |
| **UC-P05** | Creator public profile | **Target** | Creator `GET/PUT` branch — no dummy minister data |
| **UC-P06** | Open profile from account menu | **Covered** | `UserAvatar` dropdown → `/profile` |
| **UC-P07** | Settings vs profile split | **Spec'd** | Profile = listener-facing identity; Settings = account — [feat-0012](../feat-0012/PRODUCT.md), [`07 - settings.md`](../../07%20-%20settings.md) |
| **UC-P08** | Deactivate account from profile page | **Non-goal** | [feat-0012](../feat-0012/PRODUCT.md) Delete account section |
| **UC-P09** | Listener views/edits own profile on web | **Out of scope** | Portal nav is internal roles only; `ListenerProfile` branch exists in types/dialog but not routed for listeners |
| **UC-P10** | Edit slug / ministry website | **Partial** | `@slug` on hero; not in dialog; `ministryWebsite` in DTO but no form field |
| **UC-P11** | Instant image preview in edit dialog | **Gap** | Web must use **`ImageDTO.file`** from `POST /storage/upload` |
| **UC-P12** | Save changes visible on `/profile` | **Partial** | After `PUT` + refetch; hero uses API URL fields |
| **UC-P13** | Portal-wide image visibility | **Gap** | Remove client S3 env; consume API URL fields everywhere in `apps/web` |
| **UC-P14** | Consume API image URLs (server-side) | **Partial (web)** | **`apps/api` complete** — web must stop rebuilding URLs locally |

---

## Profile vs Settings vs Get Started

| Concern | Route | Spec | Fields (indicative) |
| ------- | ----- | ---- | ------------------- |
| **Public identity** | `/profile` | feat-0011 | Bio, cover, avatar, ministerial name, ministry name, HQ, socials |
| **Account** | `/settings` | feat-0012 | First/last name, email, password, deactivate |
| **Onboarding** | `/get-started/*` | feat-0010 | KYC, home address, ministry intake (checkpoints) |

**UC-P04 sync rules (production target):**

1. Get Started **ministry-input** and profile **Edit profile** both map to minister `profile.*` on API — last write wins; no draft merge.
2. After profile save (when API wired): invalidate `minister` context + profile query; optional hub refresh if onboarding incomplete.
3. Get Started **does not** block `/profile`; users may edit public fields mid-ladder.
4. Legal name / email — **editable only on `/settings`**, not in edit dialog.

---

## Field inventory (read vs edit)

| Field | Read (`/profile`) | Edit dialog | API target (production) |
| ----- | ----------------- | ----------- | ------------------------ |
| Cover image | Hero | Yes | Minister `banner` / listener cover |
| Avatar | Hero | Yes | Minister `avatar` |
| Display name | Hero (ministerial or legal) | Minister's name | `profile.ministerialName` |
| `@slug` | Hero handle | **No** | Minister `slug` — **gap UC-P10** |
| Ministry name | Hero subtitle | Yes | `profile.ministryName` |
| Bio | About section | Yes | `profile.description` |
| Ministry HQ | **No** | Location field | `profile.ministryHQLocation` |
| Ministry website | **No** | **No** | `profile.websiteUrl` — **gap UC-P10** |
| Socials | **No** | Yes (optional) | `profile.socials` |
| First / last name | **No** (used in display fallback only) | **No** | `PUT /user` on **Settings** |
| Email | **No** | **No** | `PUT /user` on **Settings** |
| Insight stats | Cards (`—`) | **No** | Analytics / aggregates — TBD |
| Recent sermons | Placeholder list | **No** | `GET /sermon/minister/:id` — TBD |

---

## Figma

| Surface | Node id | Code reference |
| ------- | ------- | -------------- |
| Profile page (read, minimal hero) | `11578:98647` | `UserProfile.tsx` |
| Profile page (read, with cover) | `11745:106250` | `UserProfile.tsx` |
| Edit profile — empty | `11719:104736` | `EditProfileDialog.tsx` + `ImageUploadTile` cover |
| Edit profile — populated | `11732:105889` | Same dialog with values |

**Data + actions parity (normative):** [feat-0024 PROFILE_DATA_ACTIONS_SPEC](../feat-0024/PROFILE_DATA_ACTIONS_SPEC.md) — Figma screenshots, API matrix, gap register.

Visual baseline: dark portal shell (`#2b2a2c` cards, `#545454` borders, `#08ffdb` accent on avatar ring and primary save).

## Consumer

| Persona | Access | Profile shape |
| ------- | ------ | --------------- |
| **Minister** | Sidebar **Profile** + account menu | Full hero + ministry fields + socials in edit dialog |
| **Creator** | Same nav | Creator API + UI branch (Phase 3) |
| **Admin / super-admin** | Route allowed | **Gap:** no admin-specific public profile UX |
| **Listener** | Not in portal nav | Types support listener branch; **not productized on web** (UC-P09) |

---

## Route and navigation

| URL | Screen | Auth |
| --- | ------ | ---- |
| `/profile` | Public profile preview + **Edit profile** | Signed in; `isInternalPortalUserType` |

| Entry | Behavior |
| ----- | -------- |
| Sidebar **Profile** | `PATH_PROFILE` |
| User menu **Profile** | Navigate to `/profile` |
| User menu **Settings** | Navigate to `/settings` (feat-0012) |

- Registered in `minister.route.tsx` under dashboard layout.
- **Not** gated by Get Started completion ([feat-0010](../feat-0010/PRODUCT.md)).
- Post-auth allows `/profile*` ([feat-0009](../feat-0009/PRODUCT.md)).

Local dev: **`http://localhost:5173/profile`**.

---

## Page layout (`/profile`)

Max content width **1200px**, vertical stack `space-y-4`, text `#eaeaea`.

### 1. Page header card

- **Title:** Profile (`text-xl font-semibold`).
- **Subtitle:** “This is how listeners will see you on the platform.”

### 2. Cover hero (`368px` height)

- **Cover image:** full-bleed; gradient fallback when no `coverImage`.
- **Bottom gradient overlay** for text legibility.
- **Avatar:** `127×127` circle, `#08ffdb` border; image or initials fallback.
- **Display name:** `28px` semibold white with drop shadow.
  - Minister: `ministerialName` if set, else `firstName lastName`, else email.
- **Handle:** `@slug` when `slug` present (read-only — UC-P10).
- **Ministry line:** `ministryName` (minister only).
- **Edit profile** button (outline, pen icon) opens dialog.

### 3. Insight cards (4-column grid on xl)

| Label | Icon | Value (today) |
| ----- | ---- | ------------- |
| Sermons published | Mic | `—` (placeholder) |
| Total Listens | Headphones | `—` (placeholder) |
| Followers | User | `—` (placeholder) |
| Member Since | Calendar | Formatted `createdAt` |

**Product target:** analytics or sermon aggregates ([`06 - analytics.md`](../../06%20-%20analytics.md)).

### 4. About + Recent sermons (2-column on xl)

**About (left)**

- Heading: About (`28px` semibold).
- If `bio` present: pre-line body `#bdbdbd`.
- If empty: muted prompt with inline **Edit profile** link.

**Recent sermons (right)**

- Heading + **See all** (no navigation wired).
- Three **placeholder** rows — not from API.

**Product target:** **See all** → `/studio/{code}/sermons`; rows from published sermon list (limit 3).

---

## Edit profile dialog

Modal **477px** wide, max height **90vh**, scrollable body.

### Shared (all roles)

| Section | Control | Rules |
| ------- | ------- | ----- |
| Background image | `ImageUploadTile` cover | JPEG/PNG/WEBP, max 5MB; `api.storage.uploadImage` |
| Profile picture | `ImageUploadTile` avatar | Same |
| About | Textarea | Max 2000 chars |

### Minister-only fields

| Field | In dialog today | Placeholder |
| ----- | --------------- | ----------- |
| Minister's Name | Yes | e.g. Minister Sam Adeyemi |
| Ministry Name | Yes | e.g. Daystar Christian Centre |
| About | Yes (minister copy) | Ministry-focused |
| Location | Yes | HQ / address line |
| Social networks | Yes (optional) | Instagram, X, TikTok |
| Ministry website | **No** | UC-P10 — in `ProfileDTO` only |
| Slug / handle | **No** | UC-P10 — shown on hero only |

### Footer actions

- **Cancel** — dirty → `confirm` discard.
- **Save Changes** — disabled when pristine or submitting; **Saving…** while pending.
- Success: Sonner **Profile updated**; closes dialog.
- No delta: closes without API call.

### Image upload UX

- Empty: dashed cover / avatar silhouette.
- **Instant preview (UC-P11):** after `POST /api/v1/storage/upload`, use **`ImageDTO.file`** (full display URL from API — see `apps/api/src/dtos/storage.dto.ts`) for the tile preview; store **`s3Key`** on the form `Asset` for save payload.
- Populated: preview + camera overlay; **Remove** → `null` in payload.
- Upload progress overlay; inline errors on validation/upload failure.
- **No web S3 config:** do not build URLs from `s3Key` on the client; drop `resolveAssetUrl` + `VITE_ASSET_*` / `VITE_S3_*` for profile.

### Save → read view (UC-P12)

After **Save Changes** succeeds and the dialog closes:

- `/profile` read view must reflect **all** saved fields immediately — cover, avatar, display name, ministry lines, bio — without hard refresh.
- Hero images render from **`Asset.url`** (from upload `file` or profile GET), not client-side bucket env.
- Re-opening **Edit profile** shows the same values as the read view (form re-sync from query cache / API response).

---

## Data and persistence

| Concern | Shipped today | Production target |
| ------- | ------------- | ----------------- |
| Load profile | Dummy fallback in dev | **Always** `GET /api/v1/minister` (+ creator branch) |
| Save profile | Mock merge when API fails in dev | **Always** `PUT /api/v1/minister` then refetch |
| Image upload | Real `POST /storage/upload` | Unchanged |
| Image display | Client `resolveAssetUrl` | **`ImageDTO.file`** + GET URL strings from API |
| Insight stats | `—` placeholders | Analytics API or honest empty/hidden |
| Recent sermons | Hard-coded array | Sermon API or empty state |
| Creator persona | Dummy minister fallback | Creator API branch |

**Image display (web):** use URL strings **`apps/api` already returns** — `ImageDTO.file` on upload; avatar/banner/imageUrl on GET. **No CDN and no S3 env on web.** Persist **`s3Key`** on PUT only.

See [Web image delivery (portal-wide)](#web-image-delivery-portal-wide) and [API contract (existing)](#api-contract-existing--appsapi).

---

## Web image delivery (portal-wide)

**Scope:** every `<img>` / avatar in `apps/web` that shows user-uploaded or API-stored assets (not static `/public` or seed URLs).

### Problem

1. **Web** — `resolveAssetUrl` and `VITE_S3_*` rebuild URLs locally instead of using **`ImageDTO.file`** and GET image fields from **`apps/api`**.
2. **Mock / legacy** — `profile.dummy.ts`, dummy fallback in `useProfile.ts`, placeholder sermon rows, and `VITE_PROFILE_USE_REAL_API` gate must be **removed** (live production app).

### Principles (`apps/web`)

| Rule | Detail |
| ---- | ------ |
| **No mock or legacy data** | Delete `profile.dummy.ts`, dummy query fallback, mock mutation, placeholder sermon list |
| **No client S3 / CDN config** | Remove `VITE_ASSET_BASE_URL`, `VITE_S3_*`, `VITE_PROFILE_USE_REAL_API`, `resolveAssetUrl` |
| **Display URL from API** | `ImageDTO.file` after upload; GET DTO strings in `<img src>` as returned |
| **Persist `s3Key` on write** | PUT minister/creator/sermon — unchanged |
| **One web helper** | Pass-through HTTPS URLs only — never construct storage URLs on web |

### Recommended web implementation (Phase 0.5 — production alignment)

**1. Remove mock / legacy**

| Remove | File / symbol |
| ------ | ------------- |
| Dummy profile | `app/profile/profile.dummy.ts`, `DUMMY_MINISTER_PROFILE` |
| API feature flag | `VITE_PROFILE_USE_REAL_API`, `shouldUseRealProfileApi()` |
| Mock save path | `mergeProfileUpdateIntoDto` fallback without PUT in `useProfile.ts` |
| Client S3 URLs | `utils/asset-url.util.ts` S3/bucket logic, `.env.sample` `VITE_S3_*` / `VITE_ASSET_*` |

**2. Shared helper** — `utils/image-display.util.ts`:

```ts
/** Pass-through API URL only. Never build storage URLs on web. */
export function resolveImageDisplayUrl(
  value: string | { url?: string } | null | undefined,
  opts?: { v?: string | number },
): string | undefined;

/** POST /storage/upload → { fileName, s3Key, url: dto.file }. */
export function mapImageUploadToAsset(dto: ImageDTO): Asset;
```

**3. Always use live API in hooks**

```ts
// useProfile.ts — production only
useProfileQuery()  → GET /api/v1/minister → mapMinisterDocToProfileDTO
useUpdateProfileMutation() → PUT /api/v1/minister → refetch GET
```

**4. Upload paths** — map **`data.file`** → `Asset.url`:

| Area | File(s) today |
| ---- | ------------- |
| Profile edit | `ImageUploadTile.tsx` |
| Generic uploader | `hooks/app/useUploader.tsx`, `hooks/app/useStorage.ts` |
| Sermon thumbnail | Upload context / `ThumbnailUpload.tsx` (keep local blob for pick; after upload use `file`) |
| Get Started / KYC | Document upload components using storage client |

**5. Read paths** — `resolveImageDisplayUrl(profile.avatar)` / GET string fields:

| Surface | File(s) |
| ------- | ------- |
| Profile hero | `UserProfile.tsx` |
| Nav avatar | `UserAvatar.tsx` |
| Sermon / studio / search / library | DTO `imageUrl`, `thumbnail`, `banner` as API returns |

**6. Types** — `Upload.url?` / `Asset.url?` hold `ImageDTO.file` for display; PUT sends `s3Key` only.

### Acceptance (UC-P11–P14)

- [ ] No mock data path in `useProfile` or profile bundle.
- [ ] No `VITE_S3_*` / `VITE_ASSET_*` on web.
- [ ] Upload preview and `/profile` hero use **`ImageDTO.file`** / GET URLs from API.
- [ ] Hard refresh shows saved images (API GET returns same URL contract as upload).

---

## API contract (existing — `apps/api`)

**No new API work for feat-0011.** **`apps/api` already handles image URLs server-side.** Web aligns to existing responses. **No storage CDN on web; no `STORAGE_CDN_BASE_URL` work in this feature.**

### Endpoints web must use

| Action | Route | Web uses |
| ------ | ----- | -------- |
| Upload image | `POST /api/v1/storage/upload` | `data.file` → display; `data.s3Key` → PUT |
| Load minister profile | `GET /api/v1/minister` | Map to `ProfileDTO`; image fields = API strings |
| Save minister profile | `PUT /api/v1/minister` | Partial body; `avatar` / `banner` as `s3Key` |
| Load creator (Phase 3) | `GET /api/v1/creator` | Same pattern |
| Sermon / search / library | Existing list/detail routes | `imageUrl`, `avatar`, `banner` as API returns |

### `ImageDTO` (`apps/api/src/dtos/storage.dto.ts`)

| Field | Web |
| ----- | --- |
| `file` | **`<img src>`** — server-provided display URL |
| `s3Key` | Stored on minister/sermon PUT |
| `fileName` | `Asset.fileName` |

### Web mapper rule

`mapMinisterDocToProfileDTO` (and creator equivalent): if GET returns an `https://` string for avatar/banner, set `Asset.url` (or use string directly). **Do not** append bucket names or CDN bases on web.

### Out of scope

- Building CDN distributions for storage (web or this spec).
- New API routes — consume what exists in `apps/api`.
- Changing PUT payload shapes.

---

## Minister vs listener branching

| `userType` | View | Edit dialog |
| ---------- | ---- | ----------- |
| `MINISTER` | Ministry + slug handle | Full minister form |
| `LISTENER` / `USER` | Personal display name | Bio + images only (not exposed in nav — UC-P09) |
| `CREATOR` | **Target:** creator fields | Creator API (Phase 3) |

Branching: `isMinisterProfile(profile)` on `ProfileDTO.userType`.

---

## Acceptance criteria

### Shipped (current UI)

- [x] `/profile` in dashboard shell for authenticated minister/creator/admin portal roles.
- [x] Loading skeleton; error line when query fails.
- [x] Mock minister profile renders in dev only — **remove before ship**
- [x] **Edit profile** opens dialog with minister + social fields.
- [ ] **Always** `GET/PUT /minister` — no dummy, no feature flag.
- [ ] **UC-P11:** Upload in modal shows preview using **`ImageDTO.file`** from storage upload.
- [ ] **UC-P12:** After save, `/profile` hero and About reflect all changed fields without hard refresh.
- [ ] **UC-P13:** All portal upload/read paths use API display URLs; no web S3 env (see [Web image delivery](#web-image-delivery-portal-wide)).
- [ ] **UC-P14:** Web consumes API image URLs as returned (no local URL building).
- [x] Discard confirm on dirty close.
- [x] Member Since from `createdAt`.
- [x] Account menu and sidebar link to `/profile` (UC-P06).

### Production (API-backed) — maps to [Production readiness plan](#production-readiness-plan)

- [ ] Phase 0 product decisions (P0-1–P0-5) recorded
- [ ] Phase 0.5: Production alignment — remove mock/legacy + API image consumption (UC-P11–P14)
- [ ] Phase 1: Profile mapper hardening + error UX (if not complete in 0.5)
- [ ] Phase 2: Minister context + query invalidation (UC-P04)
- [ ] Phase 3: Creator branch (UC-P05)
- [ ] Phase 4: Read view + UC-P10 fields per decision
- [ ] Phase 5: Recent sermons API + **See all**
- [ ] Phase 6: Insight cards real or intentionally empty/hidden
- [ ] Phase 7: Mapper tests + launch checklist sign-off

---

## Test plan (manual)

| # | Case | Expected |
| - | ---- | -------- |
| 1 | Open `/profile` signed out | Redirect login |
| 2 | Minister signed in | Real profile from `GET /minister` |
| 3 | Edit bio → Save | About updates on `/profile`; toast; no refresh required |
| 4 | Pick avatar in dialog | Preview visible in modal **before** Save (UC-P11) |
| 5 | Upload avatar → Save | Hero avatar on `/profile` matches saved image (UC-P12) |
| 6 | Pick cover in dialog | Cover preview visible in modal during/after upload (UC-P11) |
| 7 | Upload cover → Save | Hero cover on `/profile` updates; or gradient if removed (UC-P12) |
| 8 | Cancel with dirty form | Confirm discard |
| 9 | Save with no changes | Dialog closes, no error toast |
| 10 | Account menu → Profile | Navigates to `/profile` |
| 11 | Mid-onboarding minister | `/profile` accessible |
| 12 | Change password | Use `/settings` ([feat-0012](../feat-0012/PRODUCT.md)) |
| 13 | Sermon thumbnail upload (studio) | After upload, preview uses **`ImageDTO.file`**, not `s3Key` alone (UC-P13) |
| 14 | Hard refresh `/profile` with saved images | Hero loads from API GET URL fields |
| 15 | Open `POST /storage/upload` → `data.file` in browser | Image loads (server URL from API) |

### Production QA (after Phase 1+)

| # | Case | Expected |
| - | ---- | -------- |
| 11 | Minister — load profile | Real API data, not dummy |
| 12 | Minister — edit bio → Save | About on `/profile` updates; persists after hard refresh |
| 13 | Minister — upload avatar + cover in dialog | Modal preview from upload `file` (UC-P11); hero on `/profile` after save (UC-P12) |
| 14 | Creator — load profile | Creator doc from `GET /creator` |
| 15 | Zero published sermons | Empty state, not placeholder titles |
| 16 | **See all** with studio code | Opens studio sermons list |
| 17 | Save after Get Started ministry step | Minister context shows latest ministry fields |

Password and deactivate tests: [feat-0012 PRODUCT § Test plan](../feat-0012/PRODUCT.md#test-plan).

---

## Related specs

- [feat-0011 TECH](./TECH.md) — file map, hooks, API mapping.
- [feat-0012 Settings](../feat-0012/PRODUCT.md) — account, password, deactivate (UC-P03, UC-P07, UC-P08).
- [`08 - user-profile.md`](../../08%20-%20user-profile.md) — index.
- [`07 - settings.md`](../../07%20-%20settings.md) — settings index.
- [feat-0010](../feat-0010/PRODUCT.md) — onboarding vs profile (UC-P04).
- [feat-0009](../feat-0009/PRODUCT.md) — auth routing.
- [feat-0004 API](../../../api/feature/feat-0004/PRODUCT.md) — password `tokenVersion` (settings).

## Open questions

1. **See all** → `/studio/{code}/sermons` vs public catalog?
2. Admin on `/profile` — reduced view or redirect?
3. Unified `GET /profile/me` vs fan-out `/minister`, `/creator`, `/listener`?
4. Insight metrics unavailable — hide cards vs `0` vs `—`?
5. **UC-P10:** Ship slug + website in edit dialog and/or read view?

---

## Production readiness plan

Phased delivery to reach the [Goal](#goal). Task detail and file touch list: [TECH § Production readiness plan](./TECH.md#production-readiness-plan).

### Phase 0 — Product decisions (blockers)

Resolve before API wiring ships to production.

| # | Decision | Options | Default if no answer by ship |
| - | -------- | ------- | ------------------------------ |
| P0-1 | **UC-P10** slug + ministry website | Add to edit dialog + read view / read-only slug / omit | Ship **edit dialog** fields + show website on read; slug read-only until admin tooling |
| P0-2 | Insight cards when no metrics | Hide section / show `0` / keep `—` | Show **counts from sermon list** (published count, total listens if on sermon doc); hide Followers until API exists |
| P0-3 | **See all** target | `/studio/{code}/sermons` / disabled until studio code | Link to `studioSermonsListPath(storedCode)`; hide link if no code |
| P0-4 | Admin on `/profile` | Same as minister / redirect to admin home | Same UI as minister if they have minister doc; else empty state + copy |
| P0-5 | API shape | Fan-out `GET /minister` + `/creator` / future unified `GET /profile/me` | **Fan-out** by `userType` (no new API route in v1) |

**Exit:** P0-1–P0-3 documented; TECH mapper scope signed off.

### Phase 0.5 — Production alignment (`apps/web`, P0)

Live app — **no mock, no legacy, no client CDN/S3.** Consume **`apps/api`** as documented in [API contract](#api-contract-existing--appsapi).

| Task | UC | Deliverable |
| ---- | -- | ------------- |
| **Delete mock / legacy** | P01, P02 | Remove `profile.dummy.ts`, `DUMMY_MINISTER_PROFILE`, `VITE_PROFILE_USE_REAL_API`, mock mutation fallback |
| **Always live API** | P01, P02 | `useProfileQuery` → `GET /minister`; `useUpdateProfileMutation` → `PUT /minister` → refetch |
| `resolveImageDisplayUrl` + `mapImageUploadToAsset` | P13 | `utils/image-display.util.ts`; remove S3 logic from `asset-url.util.ts` |
| Wire upload → `url: data.file` | P11, P13 | `ImageUploadTile`, `useUploader`, `useStorage`, sermon thumbnail |
| Wire read → API URL fields | P12, P14 | `UserProfile`, `UserAvatar`, list components |
| Remove `VITE_S3_*` / `VITE_ASSET_*` from web | P13 | `.env.sample`, docs |
| `mapMinisterDocToProfileDTO` | P01, P14 | Map GET avatar/banner URLs from API; PUT sends `s3Key` only |

**Exit:** Manual tests #2–7, #13–15; no mock path in profile bundle; UC-P11–P14 acceptance.

### Phase 1 — Profile polish (P0)

| Task | UC | Deliverable |
| ---- | -- | ------------- |
| Error + retry UX on load/save failure | P01 | Toast; no silent dummy fallback |
| Unit tests | P02 | `profile-map.util.test.ts`, `image-display.util.test.ts` |
| Remove `recentSermonsPlaceholder` or wire API | P01 | Real rows or empty state (see Phase 5 if deferred) |

**Exit:** Minister load/save/images stable on hard refresh.

### Phase 2 — Cache and onboarding sync (P0)

| Task | UC | Deliverable |
| ---- | -- | ------------- |
| On successful PUT: `invalidateQueries` profile key + `ministerCtx.refreshProfile({ force: true })` | P04 | `useProfile.ts` + minister context |
| Optional: `dispatchOnboardingProfileRefresh` if hub uses server milestones | P04 | Reuse `hub-onboarding.util` |
| Align `updatedAt` from API response; append `?v=` to display URL when cache-busting | P02 | Fresh image after replace |

**Exit:** Save from `/profile` reflects in Get Started hub / minister context.

### Phase 3 — Creator persona (P1)

| Task | UC | Deliverable |
| ---- | -- | ------------- |
| `mapCreatorDocToProfileDTO` + PUT mapper | P05 | Creator branch in hook |
| `isCreatorProfile` or extend branching in dialog | P05 | No minister-only fields for creators |
| QA: creator account sees own API data | P05 | Manual test #11 |

**Exit:** UC-P05 **Covered** for creators in portal.

### Phase 4 — Read view completeness (P1)

| Task | UC | Deliverable |
| ---- | -- | ------------- |
| Implement P0-1 fields in `EditProfileDialog` if decided | P10 | Website (+ slug if editable) |
| Show social links + website on read view (optional icons) | P02 | `UserProfile.tsx` About or hero meta |
| Show ministry HQ on read when set | P02 | Under ministry name |
| Empty states: no bio, no sermons, no stats | P01 | Copy per empty-state table below |

**Empty-state copy (production):**

| Surface | When empty | Copy |
| ------- | ---------- | ---- |
| About | No bio | Existing inline Edit profile prompt |
| Recent sermons | Zero published | “No published sermons yet.” + link to upload |
| Insight cards | Metric unavailable | `0` or hide card per P0-2 |

**Exit:** Read view matches saved API data; no misleading placeholder sermon titles.

### Phase 5 — Recent sermons + See all (P1)

| Task | UC | Deliverable |
| ---- | -- | ------------- |
| `useRecentPublishedSermonsQuery(ministerId, limit: 3)` | P01 | Hook + sermon client |
| Replace `recentSermonsPlaceholder` in `UserProfile` | P01 | Real rows or empty state |
| Wire **See all** → `studioSermonsListPath(code)` | P01 | P0-3 decision |

**Exit:** Recent sermons block is API-backed or honestly empty.

### Phase 6 — Insight cards (P2)

| Task | UC | Deliverable |
| ---- | -- | ------------- |
| **Sermons published:** count from sermon list or minister aggregate | P01 | Replace `—` |
| **Total listens:** sum from published sermons if field exists | P01 | Or hide until analytics API |
| **Followers:** hide or `—` until follow API | P01 | Per P0-2 |
| **Member since:** keep `createdAt` from profile DTO | P01 | Already shipped |

**Exit:** No fake play counts; cards reflect API or hidden.

### Phase 7 — Quality and launch (P0)

| Task | Deliverable |
| ---- | ----------- |
| Expand manual test plan for API-backed flows | PRODUCT § Test plan |
| Remove mock/legacy from CI build | Build check — no `profile.dummy` import |
| Smoke: minister edit → mobile/catalog visibility (manual cross-team) | Release note |
| Update UC index statuses to **Covered** | This doc |

**Launch checklist:**

- [ ] Phase 0 decisions recorded (P0-1–P0-5)
- [ ] Phase 0.5 complete (live API + images — no mock/legacy on web)
- [ ] Phase 1–2 complete (polish + minister context sync)
- [ ] Phase 3 complete or explicitly deferred with creator blocked from `/profile`
- [ ] Phase 4–5 complete or empty states shipped
- [ ] Phase 6 complete or insight cards simplified per P0-2
- [ ] Phase 7 QA sign-off

### Out of scope for production v1

| Item | Reason |
| ---- | ------ |
| UC-P03, UC-P07, UC-P08 | feat-0012 Settings (already shipped) |
| UC-P09 listener web profile | Portal personas only |
| Unified `GET /profile/me` | Phase 0-5 default: fan-out |
| 2FA / sessions | No API |
| Public anonymous profile page | feat-0004 auth required |

### Timeline suggestion

| Phase | Estimate | Depends on |
| ----- | -------- | ------------ |
| 0 | 0.5 day | Product |
| 0.5 | 2–3 days | **`apps/api` stable** — web-only alignment |
| 1 | 0.5 day | Phase 0.5 |
| 2 | 0.5 day | Phase 1 |
| 3 | 1–2 days | Creator GET/PUT |
| 4 | 1 day | Phase 0-1 |
| 5 | 1 day | Sermon list API |
| 6 | 1–2 days | Analytics or sermon fields |
| 7 | 1 day | Phases 1–5 |

**Minimum viable production (MVP):** Phase 0 + **0.5 + 1 + 2 + 7** (live API, API image URLs on web, minister sync, QA). Add **3–6** for creator + sermons/stats completeness.
