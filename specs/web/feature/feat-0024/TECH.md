# feat-0024: Tech — Profile data and actions

## Context

Normative behavior: [PROFILE_DATA_ACTIONS_SPEC.md](./PROFILE_DATA_ACTIONS_SPEC.md). Product summary: [PRODUCT.md](./PRODUCT.md).

**Route:** `PATH_PROFILE` → `UserProfile` in `minister.route.tsx`.

---

## Phase 0 — DTO and mapper (no UI)

Extend `MinisterProfile` / `ministerResponseToProfileDTO` in `useProfile.ts`:

| Add to `ProfileDTO` | Source |
| ------------------- | ------ |
| `monthlyListeners?: number` | `MinisterResponseDTO.monthlyListeners` |
| `phoneNumber?`, `phoneCode?`, `countryPhone?` | Top-level or `profile.*` |
| `profileEmail?` | `profile.email` if distinct from account `email` |
| `followers?`, `totalListeners?` | Studio context **or** defer until API exposes on minister GET |

Add `useProfileStatsQuery(ministerId)` (optional combined hook):

```ts
// Pseudocode — parallel queries
const sermons = GET /sermon/minister/:id?status=published&limit=1&page=1
// total → sermonsPublished
```

Document chosen source for total listens / followers in spec gap register before implementing cards.

---

## Phase 1 — Read view parity (`UserProfile.tsx`)

1. Page header card (title + subtitle) above hero.
2. Hero subline: format `monthlyListeners` (e.g. `600K` when ≥ 1000) + followers when available.
3. Insight cards: wire sermons published + member since; listens/followers when Phase 0 resolves source.
4. New read sections below About (single left column stack per Figma `11578:98647`):
   - `ProfileContactSection` — email, phone (optional label)
   - `ProfileMinistrySection` — church name, location line
   - `ProfileSocialSection` — three optional rows with icons
5. Layout: consider full-width left column + right Recent sermons (Figma uses stacked left sections under cards, then 2-col for About | Recent — match `11578` structure).

---

## Phase 2 — Recent sermons + See all

```ts
// hooks/app/useProfileRecentSermons.ts
useMinisterSermonsQuery(ministerId, {
  status: 'published',
  sort: '-releaseDate', // confirm API sort token
  limit: 3,
  page: 1,
});
```

- Map with `mapApiSermonToTableRow` or a thin `mapSermonToProfileRecentRow`.
- **See all:** `useMinister()` / studio context → `studioSermonsPath(code)` from `routes/paths.ts` or `my-sermons-ui`.

---

## Phase 3 — Polish

- Re-export Figma assets to `assets/*.png`.
- Avatar BMP: align `ImageUploadTile` `accept` with Figma or update Figma helper text.
- Unit tests: `ministerResponseToProfileDTO`, `mapFormValuesToUpdatePayload` socials round-trip.

---

## Files to touch (expected)

| File | Change |
| ---- | ------ |
| `profile.types.ts` | Extended `MinisterProfile` |
| `useProfile.ts` | Mapper fields; optional stats hook |
| `UserProfile.tsx` | Header, sections, stats, recent list |
| `useProfileRecentSermons.ts` | New (optional) |
| `specs/web/08 - user-profile.md` | Link feat-0024 |

**No API changes required** for core edit flow (already `GET/PUT /minister`). Aggregates may need studio join or new endpoint — confirm with backend before G4.

---

## Query keys

```ts
profileQueryKeys.me(role)           // existing
sermonQueryKeys.ministerList(id, { status: 'published', limit: 3, ... })
```

Invalidate `profileQueryKeys` on successful `useUpdateProfileMutation` (already done).

---

## Creator branch

`creatorResponseToProfileDTO` maps `displayName` to both ministerial and ministry name fields. Read view should use creator-appropriate labels or hide ministry sections — keep feat-0011 UC-P05 behavior; do not show empty minister sections.
