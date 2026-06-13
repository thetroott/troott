# feat-0036: Tech — Portal shell loading

## Context

See [PRODUCT.md](./PRODUCT.md).

**Goal:** Shell-first authenticated UX — refactor gates and main-column loaders so `DashboardLayout` / `AppSidebar` never block on fetch.

---

## Architecture target

```text
App
├── SessionHydrator (no UI)
├── Routes
│   └── dashboard.route (AuthGate → DashboardLayout)  ← shell always when token
│       ├── AppSidebar (static + row-level dynamic)
│       └── Outlet
│           ├── GetStartedOnboardingGate → region loader in main
│           ├── StudioPortal → region loader in main
│           └── Feature pages → region/panel loaders
```

```text
┌─ Shell (NEVER blocked) ─────────────────────────────────────┐
│ AppSidebar          │  NavBar (optional)                     │
│  logo ─ static      ├────────────────────────────────────────┤
│  search ─ static    │  Main — page / region / panel            │
│  nav ─ static+gate  │    [ loading only here when fetching ]   │
│  footer ─ static    │                                          │
└─────────────────────┴──────────────────────────────────────────┘
```

---

## Loading tiers

| Tier | Boundary | When loading shows | Must not block |
| --- | --- | --- | --- |
| **Shell** | `DashboardLayout` + `AppSidebar` + optional `NavBar` | **Never** full-tier loading | — |
| **Main — page** | Full `<main>` column below top nav | Route gate waiting on bootstrap (`StudioPortal`, `GetStartedOnboardingGate`) | Sidebar |
| **Main — region** | Feature content area under local header/tabs/toolbar | List/table/analytics body fetch ([feat-0026](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md)) | Sidebar, page header |
| **Main — panel** | Card, dialog section, chart widget | Nested query | Parent chrome |
| **Sidebar — row** | Single `SidebarMenuItem` | Get Started uses **hide** not skeleton (D3) | Rest of sidebar |
| **Overlay — dialog** | Command palette / modal | Search sermon fetch ([feat-0028](../feat-0028/SIDEBAR_SEARCH_SPEC.md)) | Shell behind dialog |

---

## Sidebar regions

| Region | Source | Bootstrap behavior | Loading component |
| ------ | ------ | ------------------ | ----------------- |
| Logo + wordmark | Static asset (`troott-icon-dark.svg`) | **Always visible** | None |
| Search field / ⌘K trigger | `SearchForm` | **Always visible** | Dialog-only ([feat-0028](../feat-0028/SIDEBAR_SEARCH_SPEC.md)) |
| Nav labels + icons | `navdata.tsx` | **Always visible**; role filter may hide groups | None on whole sidebar |
| Footer (Logout, Install) | Static + auth action | **Always visible**; Logout works without minister fetch | None |
| **Get Started** | `minister` / `creator` / `user.onboard` | **Hidden** until profile context resolves (D3) | None (row absent) |
| Studio links (Dashboard, Sermons, …) | `useSidebarStudioCode()` | **Disabled** + tooltip until code resolves | None (disabled state) |
| Onboarding-blocked studio links | `shouldRedirectStudioNavForOnboarding` | **Visible** as buttons (toast + redirect) | None |
| Active state | `useLocation()` | **Always works** for visible routes | None |
| Role groups (Admin vs Main) | Cookie `userType` + session | Cookie **immediately**; refine after `fetchMe` | None |

### Sidebar forbidden patterns

| Anti-pattern | Why |
| --- | --- |
| `if (ministerLoading) return null` on `AppSidebar` | Violates P1 shell-first |
| Full-sidebar `SidebarMenuSkeleton` list | Static items don't fetch |
| Spinner overlay on `<Sidebar>` root | Blocks static chrome |
| Unmount sidebar during `refreshSession` | Violates [feat-0034](../feat-0034/PRODUCT.md) |

---

## Bootstrap flag contract

### `isPortalBootstrapping`

**True when any of:**

- `isHydratingSession === true` ([`sessionState.tsx`](../../../apps/web/src/context/session/sessionState.tsx)) — full `refreshSession` pipeline:
  1. `api.auth.fetchMe()`
  2. `ministerCtx.refresh()` when minister / super-admin persona
  3. `creatorCtx.refresh()` when creator / super-admin persona
  4. `studioCtx.refresh()` when studio content role or studio code present
  5. `adminCtx.refreshProfile()` when admin portal role
- `isHydratingUserType === true` ([`useWebPortalEligibility`](../../../apps/web/src/hooks/app/useUser.tsx)) — `isHydratingSession || !cookieUserType`

**Outlet/gate only (not shell):**

- `ministerLoading` / `creatorLoading` outside `refreshSession` (e.g. profile refresh event)
- `StudioPortal` `ready === false` during `getStudio(segment)`

**False does not mean** all page React Query fetches finished — only that portal **gating** can proceed.

**Must not:** block `DashboardLayout`, block `AppSidebar`, or trigger `AuthGate` full-page `"Loading…"`.

```ts
// hooks/app/usePortalBootstrap.ts (new)
export function usePortalBootstrapping() {
  const { isHydratingSession } = useSession();
  const { isHydratingUserType } = useWebPortalEligibility();
  return isHydratingSession || isHydratingUserType;
}
```

**Consumers:** portal gates only — not `DashboardLayout` / `AppSidebar` mount.

---

## Shared deliverables

| Deliverable | File | Purpose |
| ----------- | ---- | ------- |
| `PortalRegionLoader` | `components/shared/studio/PortalRegionLoader.tsx` (new) | Page-tier loader in `<main>` |
| `PortalContentLoader` | `components/shared/studio/PortalContentLoader.tsx` (new, optional) | Region-tier centered spinner inside `contentStack` |
| `usePortalBootstrap` | `hooks/app/usePortalBootstrap.ts` (new) | Single semantic bootstrap flag |
| AuthGate fix | `routes/routes.tsx` | Remove hydration full-page loader — applies to **both** `dashboard.route` and `admin.route` wrappers |
| Sidebar Get Started | `components/shared/navigation/Sidebar.tsx` | Hide row during profile context load (D3) |

### Loading visuals

Normative pattern for page + region loaders (align with existing `SermonDetailPlaceholder` / My Sermons copy):

```tsx
// PortalRegionLoader — page tier (gates)
export function PortalRegionLoader({ label }: { label: string }) {
  return (
    <StudioPageCenter aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#9d9d9d]" aria-hidden />
        <p className="font-matter text-sm text-[#9d9d9d]" role="status" aria-live="polite">
          {label}
        </p>
      </div>
    </StudioPageCenter>
  );
}

// PortalContentLoader — region tier (list body inside MY_SERMONS_PAGE.contentStack)
export function PortalContentLoader({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 py-8"
      aria-busy="true"
      role="status"
    >
      <Loader2 className="h-8 w-8 animate-spin text-[#9d9d9d]" aria-hidden />
      <p className="font-matter text-sm text-[#9d9d9d]">{label}</p>
    </div>
  );
}
```

Profile/card areas may use **pulse skeletons** instead of spinners ([feat-0026 region tier](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md)).

| Gate | Label |
| ---- | ----- |
| `StudioPortal` | `Loading studio…` |
| `GetStartedOnboardingGate` (profile load) | `Loading your profile…` |
| `GetStartedOnboardingGate` (redirect to studio) | `Opening your studio…` (optional; or reuse profile label) |

### Sidebar studio code

[`useSidebarStudioCode`](../../../apps/web/src/hooks/shared/useSidebarStudioCode.ts) resolves from: route param → session user → `StudioContext.studioCode` → local storage.

During hydrate, `StudioState.isLoading` may be true while links are disabled — **no sidebar spinner**. Links enable when any source yields a code (D12).

---

## Post-login routing (no new UI)

[`AuthSessionRouting.tsx`](../../../apps/web/src/context/session/AuthSessionRouting.tsx) and [`useRedirectAfterAuth`](../../../apps/web/src/hooks/app/useRedirectAfterAuth.ts) remain **headless**. After P0 AuthGate fix:

1. User lands on dashboard route with token → **shell visible**.
2. `redirectAfterAuth` / gate redirects may navigate — main shows page-tier loader on destination, not blank frame (D11).
3. Do not add loading UI to `AuthSessionRouting`.

---

## Root causes

### 1. AuthGate blocks entire tree

[`routes.tsx`](../../../apps/web/src/routes/routes.tsx) lines 60–69:

```tsx
if (roles?.length && isHydrating) {
  return (
    <div className="text-muted-foreground flex min-h-[40vh] w-full items-center justify-center">
      Loading…
    </div>
  );
}
```

`DashboardLayout` is **inside** `AuthGate` children — hydration replaces shell with centered text.

### 2. Silent main during portal gates

| File | Issue |
| ---- | ----- |
| [`StudioPortal.tsx`](../../../apps/web/src/app/studio/StudioPortal.tsx) | `onboardingComplete` checks `ministerLoading` only — **missing `creatorLoading`** |
| [`GetStartedOnboardingGate.tsx`](../../../apps/web/src/components/shared/get-started/GetStartedOnboardingGate.tsx) | `return null` when `profileLoading` **and** when `onboardingComplete` redirect in flight |

### 3. Page-tier loaders hide local chrome

| File | Issue |
| ---- | ----- |
| [`MySermons.tsx`](../../../apps/web/src/app/sermons/MySermons.tsx) | Early return skips `SermonsTable` header/toolbar |
| [`Bin.tsx`](../../../apps/web/src/app/bin/Bin.tsx) | Early return skips header/toolbar |
| [`UserProfile.tsx`](../../../apps/web/src/app/profile/UserProfile.tsx) | Full-page pulse skips `ProfilePageHeader` |

---

## Per-route implementation

Applies to every authenticated route under `DashboardLayout` (`dashboard.route.tsx`, `admin.route.tsx`). Shell mount unchanged — changes are **in-route** only unless noted.

### Cross-cutting (all dashboard routes)

| Item | File | Today | Implement |
| ---- | ---- | ----- | --------- |
| Auth hydration gate | `routes/routes.tsx` `AuthGate` | Full-page `"Loading…"` when `isHydrating && roles` | **Remove** hydration branch (D1-A). Cookie role during hydrate; redirect unauthorized only after `fetchMe` |
| Portal bootstrap hook | `hooks/app/usePortalBootstrap.ts` (new) | Flags scattered | Export `isPortalBootstrapping`; document non-blocking contract |
| Region loader helper | `components/shared/studio/PortalRegionLoader.tsx` (new) | Ad-hoc `StudioPageCenter` + copy | Shared page-tier loader |
| Sidebar Get Started | `components/shared/navigation/Sidebar.tsx` | Row may flash during minister load | **Hide** row while `ministerLoading \|\| creatorLoading` (D3) |
| Sidebar studio links | `Sidebar.tsx` | Disabled when no code | **No change** (D4) |

### AuthGate (parent of shell)

| Condition | Behavior |
| --------- | -------- |
| No token | Redirect login — no shell |
| Token + hydrating + `roles` | **Render children** (D1) — shell visible |
| Token + wrong role | Redirect unauthorized after hydrate |
| Token + public route | N/A (no `DashboardLayout`) |

**Refactor (D1-A):**

```tsx
if (!hasSession) {
  return <Navigate to={PATH_LOGIN} … />;
}

const effectiveRole = isHydrating
  ? cookieService.getUserType() || userType
  : userType;

if (
  roles?.length &&
  !isHydrating &&
  !roleMatchesAllowList(roles, effectiveRole)
) {
  return <Navigate to={PATH_UNAUTHORIZED} … />;
}

return <>{children}</>;
```

**Edge case:** user token valid but role changed server-side — redirect after hydrate completes (acceptable flash of shell).

---

### Get Started (`minister.route.tsx`)

#### `/get-started` — `GetStartedOnboardingGate`

| | |
| --- | --- |
| **File** | `components/shared/get-started/GetStartedOnboardingGate.tsx` |
| **Fetch** | `isHydratingSession`, `ministerLoading`, `creatorLoading` |

| Today | Target |
| ----- | ------ |
| `if (profileLoading) return null` | `<PortalRegionLoader label="Loading your profile…" />` |
| `if (onboardingComplete && isStudioContentRole) return null` during redirect | `<PortalRegionLoader label="Opening your studio…" />` until navigate completes or `<Outlet />` mounts |

#### `/get-started/**` — `InnerLayout`

| | |
| --- | --- |
| **File** | `components/layouts/InnerLayout.tsx` |

**Implement:** Save & Exit + progress buttons **always visible** during step fetch/save; loading stays on step body or buttons only.

#### `/get-started/complete-profile`

Redirect-only (`Navigate` to home-address) — no loader.

#### `/get-started` (index) — `GetStarted`

| | |
| --- | --- |
| **File** | `app/get-started/GetStarted.tsx` |

**Implement:** None for shell loading (gate handles bootstrap). Optional: disable hub CTAs while `ministerLoading` (button-scoped).

#### `/get-started/**` steps

**Files:** `GetVerified`, `VerifyUserInfo`, `VerifyDocument`, `HomeAddressInfo`, `MinistryInfo`, `TourGuidePage`

**Implement:** None — static forms; button-scoped save loading only.

---

### Profile & settings (`minister.route.tsx`)

#### `/profile` — `UserProfile`

| | |
| --- | --- |
| **File** | `app/profile/UserProfile.tsx` |
| **Fetch** | `useProfileQuery`, `useProfileInsightStats`, `useProfileRecentSermons` |

**Implement:**

1. Remove full-page early return.
2. Always render `ProfilePageShell` + `ProfilePageHeader`.
3. Hero region: `aria-busy={isLoading}` + pulse/skeleton.
4. Insights: `statsLoading` → four card skeletons.
5. Recent sermons: `ProfileRecentSermons` `isLoading` (already supported).

#### `/settings` — `SettingsPage`

| | |
| --- | --- |
| **File** | `app/settings/SettingsPage.tsx` |

**Implement:** `AccountInformationSection` — panel loader with `aria-busy`; page title/description always visible.

---

### Studio portal (`studio.route.tsx`)

#### `/studio/:studioCode` — `StudioPortal`

| | |
| --- | --- |
| **File** | `app/studio/StudioPortal.tsx` |
| **Fetch** | `getStudio(studioCode)`; onboarding redirect logic |

**Fix creator parity** — replace `ministerLoading`-only checks:

```tsx
const profileContextLoading =
  (portalUserType === UserType.MINISTER && ministerLoading) ||
  (portalUserType === UserType.CREATOR && creatorLoading);

const onboardingComplete =
  !isHydratingSession &&
  !profileContextLoading &&
  (/* existing isStudioOnboardingComplete / partialStudioAccess */);
```

```tsx
if (!onboardingComplete || !ready) {
  if (error) { /* existing error UI — D8: retry if retryable */ }
  return <PortalRegionLoader label="Loading studio…" />;
}
return <Outlet />;
```

**Bootstrap error (D8):** if `getStudio` fails with non-401, keep existing `StudioEmptyState` error in main; sidebar stays up.

Child routes inherit resolved studio; they do **not** repeat portal gate.

#### `/studio/:studioCode` (index) — `Dashboard`

| | |
| --- | --- |
| **File** | `app/dashboard/Dashboard.tsx` |

**Implement:** None for P0. Optional P2: `isFetching` hint on feed region.

#### `/studio/:studioCode/sermons` — `MySermons`

| | |
| --- | --- |
| **File** | `app/sermons/MySermons.tsx` → `SermonsTable` |

**Implement:**

1. Add `isLoading` prop to `SermonsTable` (or shell + `PortalContentLoader` in content area).
2. Header + toolbar static; `MY_SERMONS_PAGE.contentStack` shows loader on **`isLoading` only** ([feat-0026 region tier](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md)).
3. **`isFetching`:** keep toolbar hint — do not branch to page-tier loader (D7).
4. `aria-busy={isLoading}` on content region.
5. Remove early return that skips table chrome.

#### `/studio/:studioCode/sermons/upload/**` — `SermonUploadPage`

| | |
| --- | --- |
| **File** | `app/studio/SermonUploadPage.tsx` |

**Implement:** None for route shell. `MySermonsEmptyShell` backdrop static; loading inside modals only.

#### `/studio/:studioCode/sermons/:sermonId` (+ `/resume`) — `SermonDetailPlaceholder`

| | |
| --- | --- |
| **File** | `app/studio/SermonDetailPlaceholder.tsx` |

**Implement:** Add `aria-busy` + `role="status"` (P2). Structure compliant.

#### `/studio/:studioCode/sermons/:sermonId/edit` — `SermonEditPage`

| | |
| --- | --- |
| **File** | `app/studio/SermonEditPage.tsx` |

**Implement:**

1. `SermonEditSidebar` renders immediately.
2. Form column: existing spinner with `aria-busy`.
3. No `return null` for missing `sermonId` — inline error in form region.

#### `/studio/:studioCode/sermons/:sermonId/analytics` — `AnalyticsSermonView`

**Implement:** Same edit shell; metrics panel skeletons inside tab body.

#### `/studio/:studioCode/analytics` — `Analytics`

| | |
| --- | --- |
| **File** | `app/analytics/Analytics.tsx` |

**Implement:** `AnalyticsPageHeader` + tabs static; remove dead `if (!code) return null` in tab body (studio gate owns code); `aria-busy` on tab content when overview `isLoading`.

#### `/studio/:studioCode/bin` — `Bin`

| | |
| --- | --- |
| **File** | `app/bin/Bin.tsx` |

**Implement:**

1. Extract header + toolbar ahead of loading branch.
2. `PortalContentLoader` in `MY_SERMONS_PAGE.contentStack` for **`isLoading` only**.
3. Preserve header `isFetching` sr-only pattern for refetch (D7).
4. `aria-busy` on content region.

---

### Admin (`admin.route.tsx`)

Separate `DashboardLayout` root — **same AuthGate P0 fix** applies (`admin.route.tsx` wraps `AuthGate` per route row).

| Route | File | Implement |
| ----- | ---- | --------- |
| `/admin` | `AdminHome.tsx` | None — static |
| `/admin/users` | `AdminUsers.tsx` | Region loader under title when API wired |
| `/admin/sermons` | `AdminSermons.tsx` | Same pattern |
| `/admin/sermons-by-minister` | `AdminSermonsByMinister.tsx` | Same pattern |

Super-admin: `refreshSession` may call `hydrateStudioPersonas` after admin profile — sidebar uses cookie-first admin group; studio links follow D12.

---

## Main column loading patterns

### Approved

```tsx
// Region tier — list page
<main>
  <PageHeader /> {/* static */}
  <div className="flex flex-1 min-h-0 flex-col" aria-busy={isLoading}>
    {isLoading ? <TableSkeleton /> : <Table data={data} />}
  </div>
</main>
```

```tsx
// Page tier — portal gate
if (!onboardingComplete || !ready) {
  return <PortalRegionLoader label="Loading studio…" />;
}
```

### Forbidden

```tsx
if (isHydrating) {
  return <div className="min-h-[40vh]">Loading…</div>; // AuthGate — blocks shell
}
if (ministerLoading) return null; // Layout — blocks sidebar
if (appContext.loader) return <FullScreenSpinner />; // Global overlay on portal
```

---

## Sidebar changes (D3, D4)

[`Sidebar.tsx`](../../../apps/web/src/components/shared/navigation/Sidebar.tsx):

```tsx
const profileContextLoading =
  (userRole === UserType.MINISTER && ministerLoading) ||
  (userRole === UserType.CREATOR && creatorLoading);

if (navItem.title === 'Get Started') {
  if (profileContextLoading) return false;
  return shouldShowGetStartedNavItem(…);
}
```

Studio disabled state — **no change** (already `isDisabled` when `href === null`).

---

## Accessibility

| Element | Requirement |
| ------- | ----------- |
| Loading region | `aria-busy="true"` on the fetching region container |
| Status text | `role="status"` + `aria-live="polite"` for page-tier loaders |
| Sidebar | No `aria-busy` on `<Sidebar>` root during bootstrap |
| Disabled nav items | `aria-disabled="true"` (existing) |

---

## Implementation checklist

| # | Task | File(s) | Priority |
| - | ---- | ------- | -------- |
| 1 | Remove AuthGate hydration blocking branch (**dashboard + admin** trees) | `routes.tsx` | P0 |
| 2 | Cookie-first role during hydrate | `routes.tsx`, `useUser.tsx` | P0 |
| 3 | `StudioPortal` — loader + **`creatorLoading` parity** | `StudioPortal.tsx` | P0 |
| 4 | `GetStartedOnboardingGate` — loader for **both** null paths | `GetStartedOnboardingGate.tsx` | P0 |
| 5 | Sidebar — hide Get Started during profile load | `Sidebar.tsx` | P1 |
| 6 | `usePortalBootstrap` + `PortalRegionLoader` (+ optional `PortalContentLoader`) | new files | P1 |
| 7 | `MySermons` — region load; **`isFetching` does not page-load** | `MySermons.tsx`, `SermonsTable.tsx` | P1 |
| 8 | `Bin` — region load; preserve refetch hint | `Bin.tsx` | P1 |
| 9 | `UserProfile` — section-scoped skeletons | `UserProfile.tsx` | P2 |
| 10 | `SermonEditPage` — edit sidebar during load | `SermonEditPage.tsx` | P2 |
| 11 | `Analytics` — remove dead null tab; `aria-busy` | `Analytics.tsx` | P2 |
| 12 | Document global loader audit (no portal overlay) | see below | P2 |
| 13 | a11y `aria-busy` on all region loaders | feature pages | P2 |
| 14 | Bootstrap error surfaces (main retry, sidebar stable) | gates + context consumers | P2 |

---

## Global loading audit

| Mechanism | Portal shell impact today | Action |
| --------- | ------------------------- | ------ |
| `isHydratingSession` | Was blocking via AuthGate | Non-blocking after #1; includes full role/studio chain |
| `isHydratingUserType` | Same via AuthGate | Non-blocking after #1 |
| `appContext.loading` (`default`) | Auth form submits via `useAuth` | **Keep** — auth routes only; verify no portal consumer |
| `appContext.loader` | **No `option: 'loader'` call sites**; no UI wired in `App.tsx` | No change; do not add portal overlay |
| `userContext.loader` | Same — unused in render tree | No change |
| `useGlobalLoading` (`ReactQueryProvider`) | **Context defined; zero consumers** | Do not wire to dashboard overlay |
| `loader.util.tsx` | **No imports** | Dead code; optional cleanup outside feat-0036 |
| React Query `isLoading` / `isFetching` | Per-page | Region vs refetch rules (D7) |

---

## Tests

| Test | Type | Assert |
| ---- | ---- | ------ |
| AuthGate with token + hydrating renders children | component | No `"Loading…"` text; child visible |
| AuthGate without token redirects | component | Navigate login |
| AuthGate on **admin** route same behavior | component | Shell not blocked |
| DashboardLayout mounts AppSidebar during hydrate | integration | Sidebar present when `isHydratingSession` mocked true |
| Get Started hidden when `ministerLoading` or `creatorLoading` | unit | Filter excludes row |
| StudioPortal shows loader not null | component | `PortalRegionLoader` |
| StudioPortal waits on `creatorLoading` for creator role | component | Loader until creator resolved |
| GetStartedOnboardingGate redirect frame shows loader | component | Not null when `onboardingComplete` |
| Studio nav items disabled without code | component | `aria-disabled` |
| MySermons `isFetching` keeps table chrome | component | Header visible during refetch |
| Context error shows retry in main, sidebar mounted | integration | D8 |

Suggested locations:

- `apps/web/src/routes/routes.test.tsx` (new)
- `apps/web/src/app/studio/StudioPortal.test.tsx` (new)

---

## Manual QA matrix

| Scenario | Expected |
| -------- | -------- |
| Cold load `/studio/{code}/sermons` with valid token | Sidebar immediate; table region loads |
| Cold load `/get-started` incomplete onboarding | Sidebar immediate; main shows profile loader briefly |
| **Creator** cold load `/studio/{code}/sermons` | Same; gate respects `creatorLoading` |
| **Super-admin** cold load `/admin/users` | Admin sidebar immediate during hydrate |
| Session refresh (`refreshSession`) | Sidebar never unmounts |
| Minister load slow | Get Started absent; studio links disabled |
| Minister profile **error** | Main retry/empty; sidebar up |
| Studio code in storage | Studio links enabled after resolve |
| Admin cookie, `fetchMe` pending | Nav group stable (cookie-first) |
| Wrong role after hydrate | Redirect unauthorized; shell may flash briefly |
| My Sermons filter refetch | Header/toolbar visible; no page loader |
| Sidebar collapse → navigate | State persists |

---

## Related code map

| Concern | Path |
| ------- | ---- |
| Auth gate | `apps/web/src/routes/routes.tsx` |
| Dashboard shell | `apps/web/src/components/layouts/DashboardLayout.tsx` |
| Sidebar | `apps/web/src/components/shared/navigation/Sidebar.tsx` |
| Nav config | `apps/web/src/_data/navdata.tsx` |
| Session hydrate | `apps/web/src/context/session/SessionHydrator.tsx` |
| Session state | `apps/web/src/context/session/sessionState.tsx` |
| Portal eligibility | `apps/web/src/hooks/app/useUser.tsx` |
| Studio portal gate | `apps/web/src/app/studio/StudioPortal.tsx` |
| Get Started gate | `apps/web/src/components/shared/get-started/GetStartedOnboardingGate.tsx` |
| Studio code hook | `apps/web/src/hooks/shared/useSidebarStudioCode.ts` |
| Onboarding utils | `apps/web/src/utils/portal-onboarding.util.ts`, `hub-onboarding.util.ts` |
| Region center helper | `apps/web/src/components/shared/studio/StudioPageCenter.tsx` |
| Sidebar skeleton | `apps/web/src/components/ui/sidebar.tsx` → `SidebarMenuSkeleton` |
| Post-login redirect | `apps/web/src/hooks/app/useRedirectAfterAuth.ts` |
| Headless routing | `apps/web/src/context/session/AuthSessionRouting.tsx` |
| Admin route tree | `apps/web/src/routes/admin.route.tsx` |
| InnerLayout (get-started steps) | `apps/web/src/components/layouts/InnerLayout.tsx` |
| Studio context | `apps/web/src/context/studio/studioState.tsx` |

---

## Migration notes

- Implement **P0** (AuthGate + portal gates + **creator parity** in `StudioPortal`) before sidebar Get Started tweak.
- Coordinate with [feat-0034](../feat-0034/TECH.md) — sidebar must stay mounted (already merged in `DashboardLayout`).
- Profile section loading (P2) can ship as follow-up PR.
- Dialog loading (`SermonGetInfoDialog`, `EditProfileDialog`) remains **out of scope** — panel tier inside dialog only if touched incidentally.
