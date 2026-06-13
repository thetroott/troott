# feat-0036: Per-route implementation — portal shell loading

Normative loading tiers: [PORTAL_SHELL_LOADING_SPEC.md](./PORTAL_SHELL_LOADING_SPEC.md). Product rules: [PRODUCT.md](./PRODUCT.md).

**Applies to:** every authenticated route under `DashboardLayout` (`dashboard.route.tsx`, `admin.route.tsx`).

**Shared shell (all routes below):** no code change to mount behavior — `DashboardLayout` + `AppSidebar` always render when session token exists. Changes are **in-route** only unless noted.

---

## Cross-cutting (all dashboard routes)

| Item | File | Today | Implement |
| ---- | ---- | ----- | --------- |
| Auth hydration gate | `routes/routes.tsx` `AuthGate` | Full-page `"Loading…"` when `isHydrating && roles` | **Remove** hydration branch (D1-A). Cookie role during hydrate; redirect unauthorized only after `fetchMe` |
| Portal bootstrap hook | `hooks/app/usePortalBootstrap.ts` (new) | Flags scattered | Export `isPortalBootstrapping`; document non-blocking contract |
| Region loader helper | `components/shared/studio/PortalRegionLoader.tsx` (new) | Ad-hoc `StudioPageCenter` + copy | Shared page-tier loader: `StudioPageCenter` + `role="status"` + `aria-busy` |
| Sidebar Get Started | `components/shared/navigation/Sidebar.tsx` | Row may flash during minister load | **Hide** row while `ministerLoading \|\| creatorLoading` (D3) |
| Sidebar studio links | `Sidebar.tsx` | Disabled when no code | **No change** — keep disabled + tooltip (D4) |

---

## Get Started (`minister.route.tsx`)

### `/get-started` — `GetStartedOnboardingGate`

| | |
| --- | --- |
| **Component** | `components/shared/get-started/GetStartedOnboardingGate.tsx` |
| **Shell** | Immediate (after AuthGate fix) |
| **Sidebar** | Static chrome; Get Started hidden until profile context resolves |
| **Fetch** | `isHydratingSession`, `ministerLoading`, `creatorLoading` |

| Today | Target |
| ----- | ------ |
| `if (profileLoading) return null` — blank main | `<PortalRegionLoader label="Loading your profile…" />` |
| Redirect to studio when complete also returns `null` briefly | Keep redirect; no loader needed on redirect frame |

**Implement:**

```tsx
if (profileLoading) {
  return <PortalRegionLoader label="Loading your profile…" />;
}
```

---

### `/get-started` (index) — `GetStarted`

| | |
| --- | --- |
| **Component** | `app/get-started/GetStarted.tsx` |
| **Shell** | Immediate |
| **Sidebar** | Get Started visible after profile load (if onboarding incomplete) |
| **Fetch** | Reads `minister` / `creator` for step state — **already rendered**; hub UI is static structure |

| Today | Target |
| ----- | ------ |
| Hub renders with partial minister data | **No page-tier loader** — accordion/steps are static FE |
| Upload CTA toast if profile loading | Keep toast on action only — not a route blocker |

**Implement:** None for shell loading (gate above handles bootstrap). Optional: disable hub CTAs while `ministerLoading` (button-scoped, not route block).

---

### `/get-started/verify-account`, `verify-personal`, `verify-document/**`, `home-address`, `ministry-input`, `tour-guide`

| | |
| --- | --- |
| **Components** | `GetVerified`, `VerifyUserInfo`, `VerifyDocument`, … |
| **Shell** | Immediate |
| **Main** | **Static forms** — no route-level loading |
| **Fetch** | Per-step save/submit only (`setLoading` on buttons / sections) |

**Implement:** None for feat-0036 (already compliant).

---

## Profile & settings (`minister.route.tsx`)

### `/profile` — `UserProfile`

| | |
| --- | --- |
| **Component** | `app/profile/UserProfile.tsx` |
| **Shell** | Immediate |
| **NavBar** | Hidden (full-bleed canvas) — sidebar stays |
| **Fetch** | `useProfileQuery`, `useProfileInsightStats`, `useProfileRecentSermons` |

| Today | Target |
| ----- | ------ |
| Early `if (isLoading) return` replaces entire page with pulse skeletons (no `ProfilePageHeader`) | Always render `ProfilePageShell` + **`ProfilePageHeader`** (static) |
| Stats/recent defer until profile id known | **Region** skeletons: hero card, insight grid, recent list |

**Implement:**

1. Remove full-page early return.
2. Render static header immediately.
3. Hero region: `aria-busy={isLoading}` + pulse block or skeleton.
4. Insights: `statsLoading` → four card skeletons (already uses `—` for values — upgrade to skeleton tiles).
5. Recent sermons: pass `isLoading` to `ProfileRecentSermons` (already supported).

---

### `/settings` — `SettingsPage`

| | |
| --- | --- |
| **Component** | `app/settings/SettingsPage.tsx` |
| **Shell** | Immediate |
| **Main** | Static page header + section stack |

| Section | Component | Today | Target |
| ------- | --------- | ----- | ------ |
| Account | `AccountInformationSection` | Inline `"Loading account..."` | **Panel** loader inside section card — keep header visible |
| Password | `UpdatePasswordSection` | Static form | No change |
| Delete | `DeleteAccountSection` | Static | No change |

**Implement:** Account section only — wrap fetch body in `aria-busy` region; page title/description always visible.

---

## Studio portal wrapper (`studio.route.tsx`)

### `/studio/:studioCode` — `StudioPortal` (parent of all studio routes)

| | |
| --- | --- |
| **Component** | `app/studio/StudioPortal.tsx` |
| **Shell** | Immediate |
| **Sidebar** | Studio links disabled until code in storage/context |
| **Fetch** | `getStudio(studioCode)`; onboarding redirect logic |

| Today | Target |
| ----- | ------ |
| `if (!onboardingComplete) return null` | `<PortalRegionLoader label="Loading studio…" />` while session + minister gate |
| `if (!ready) return null` while `getStudio` | Same loader (or `"Resolving studio…"`) until `ready` or `error` |
| Error state | **Keep** `StudioPageCenter` + `StudioEmptyState` (already compliant) |

**Implement:**

```tsx
if (!onboardingComplete || !ready) {
  if (error) { /* existing error UI */ }
  return <PortalRegionLoader label="Loading studio…" />;
}
return <Outlet />;
```

Child routes inherit resolved studio; they do **not** repeat portal gate.

---

### `/studio/:studioCode` (index) — `Dashboard`

| | |
| --- | --- |
| **Component** | `app/dashboard/Dashboard.tsx` |
| **Shell** | Immediate (via `StudioPortal`) |
| **Fetch** | `useMinisterSermonsQuery` for `feedHasSermons` hint only |

| Today | Target |
| ----- | ------ |
| Upload layout renders without blocking on sermon list | **No page loader** — `UploadLayout` + empty region copy is static |
| List query in background | Optional: subtle loading in feed region only — **not** route block |

**Implement:** None required for P0. Optional P2: pass `isFetching` to empty region if feed copy depends on list.

---

### `/studio/:studioCode/sermons` — `MySermons`

| | |
| --- | --- |
| **Component** | `app/sermons/MySermons.tsx` → `SermonsTable` |
| **Shell** | Immediate |
| **Fetch** | `useQuery` minister sermon list |

| Today | Target |
| ----- | ------ |
| `if (isLoading) return <StudioPageCenter>…` — **page tier**, hides table chrome | Render **`SermonsTable`** (or `MySermonsEmptyShell`) with header/toolbar **always**; **region** loader in `MY_SERMONS_PAGE.contentStack` |
| No minister id | Keep page-tier empty message (data prerequisite, not fetch spin) |

**Implement:**

1. Add `isLoading` prop to `SermonsTable` (or render shell + loading in content area).
2. Pattern: header + toolbar static; `contentStack` shows `Loader2` + `"Loading sermons…"` centered ([feat-0026 region tier](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md)).
3. Add `aria-busy={isLoading}` on content region.
4. Remove early return that skips `SermonsTable` chrome.

---

### `/studio/:studioCode/sermons/upload` and `/upload/file|details|thumbnail|publish` — `SermonUploadPage`

| | |
| --- | --- |
| **Component** | `app/studio/SermonUploadPage.tsx` |
| **Shell** | Immediate |
| **Backdrop** | `MySermonsEmptyShell` (static chrome) |
| **Fetch** | `fetchSermonDetail` on resume id; upload pipeline state |

| Today | Target |
| ----- | ------ |
| Modal/step loading via `uploadState.isLoading` | **Panel** — inside `UploadModal` / `UploadProgressStep` only |
| Resume fetch | Button/modal scoped — not route block |

**Implement:** None for route shell. Verify modals don't trigger `appContext.loader` overlay.

---

### `/studio/:studioCode/sermons/:sermonId` and `/…/resume` — `SermonDetailPlaceholder`

| | |
| --- | --- |
| **Component** | `app/studio/SermonDetailPlaceholder.tsx` |
| **Shell** | Immediate |
| **Fetch** | One-shot `fetchSermonDetail` → redirect |

| Today | Target |
| ----- | ------ |
| `StudioPageCenter` + spinner `"Opening sermon…"` | **Compliant** — page-tier in main only |

**Implement:** Add `aria-busy="true"` + `role="status"` on wrapper (a11y P2). No structural change.

---

### `/studio/:studioCode/sermons/:sermonId/edit` — `SermonEditPage`

| | |
| --- | --- |
| **Component** | `app/studio/SermonEditPage.tsx` |
| **Shell** | Immediate + `AppSidebar` + in-page `SermonEditSidebar` |
| **Fetch** | `useSermonByIdQuery` |

| Today | Target |
| ----- | ------ |
| `SERMON_EDIT.loadingShell` full main while loading | **Region** — keep `SermonEditSidebar` visible; loader in form column only |
| `if (!sermonId) return null` | Inline error or redirect — not blank |

**Implement:**

1. Split layout: sidebar nav renders immediately (static labels Details/Analytics).
2. Form column: existing spinner block with `aria-busy`.
3. Do not return `null` for missing `sermonId` — show centered error in form region.

---

### `/studio/:studioCode/sermons/:sermonId/analytics` — `SermonEditPage` + `AnalyticsSermonView`

| | |
| --- | --- |
| **Components** | Same edit shell; analytics section embedded |
| **Fetch** | Sermon doc + overview + breakdown queries |

| Today | Target |
| ----- | ------ |
| Page-level sermon load then metrics card skeletons | **Region** per panel — header/filter static after sermon loads |
| `AnalyticsSermonView` sermon loading | Centered loader in analytics **content** only |

**Implement:** Same as edit route for shell; ensure `AnalyticsSermonView` loading stays inside tab body (already mostly compliant).

---

### `/studio/:studioCode/analytics` — `Analytics`

| | |
| --- | --- |
| **Component** | `app/analytics/Analytics.tsx` + tab children |
| **Shell** | Immediate |
| **Static chrome** | `AnalyticsPageHeader`, `AnalyticsPrimaryTabs` |

| Tab | Child | Today | Target |
| --- | ----- | ----- | ------ |
| Overview | `AnalyticsOverview` | Chart cards use `isLoading` props | **Panel** skeletons inside cards — header/tabs always visible |
| Sermon (no id) | `AnalyticsSermonEmpty` | Static empty | No change |
| Sermon (with id) | Redirect to sermon analytics route | N/A | No change |
| Series | `AnalyticsTabPlaceholder` | Static | No change |

**Implement:**

1. Never return `null` for `tabContent` when `!code` — studio gate handled by `StudioPortal`.
2. Ensure `AnalyticsPageHeader` + tabs render before overview fetch completes (already true).
3. Add `aria-busy` on `tabContent` wrapper when overview loading.

---

### `/studio/:studioCode/bin` — `Bin`

| | |
| --- | --- |
| **Component** | `app/bin/Bin.tsx` |
| **Shell** | Immediate |
| **Fetch** | Bin list `useQuery` |

| Today | Target |
| ----- | ------ |
| `if (isLoading) return <StudioPageCenter>…` — hides header/toolbar | Render page **header + toolbar** always; **region** loader in list/grid area (mirror My Sermons) |
| No owner id | Keep page-tier empty (same as My Sermons) |

**Implement:**

1. Extract static chrome (header, toolbar) ahead of loading branch.
2. Loading UI in `MY_SERMONS_PAGE.contentStack` with spinner + `"Loading bin…"`.
3. `aria-busy` on content region.

---

## Admin (`admin.route.tsx`)

All admin routes use `DashboardLayout` + role-gated `AuthGate`. After D1-A fix, shell is immediate for admin cookie during hydrate.

### `/admin` — `AdminHome`

| | |
| --- | --- |
| **Fetch** | None |
| **Implement** | None — static copy |

### `/admin/users` — `AdminUsers`

| | |
| --- | --- |
| **Component** | `app/admin/AdminUsers.tsx` |
| **Implement** | When list API added: **region** loader under page title; sidebar static |

### `/admin/sermons` — `AdminSermons`

| | |
| --- | --- |
| **Implement** | Same pattern as users when wired |

### `/admin/sermons-by-minister` — `AdminSermonsByMinister`

| | |
| --- | --- |
| **Implement** | Same pattern when wired |

---

## Out of scope (no `DashboardLayout`)

| Route | Notes |
| ----- | ----- |
| `/login`, `/register`, auth flows | `AuthLayout` — form `appContext.loading` OK |
| `/unauthorized`, `/404` | Static error pages |
| Public preview | No portal shell |

---

## Implementation priority by route

| Priority | Route(s) | Why |
| -------- | -------- | --- |
| **P0** | AuthGate (all) | Blocks entire shell today |
| **P0** | `StudioPortal` | Blank main on every studio URL |
| **P0** | `GetStartedOnboardingGate` | Blank main on onboarding entry |
| **P1** | `Sidebar.tsx` | Get Started hide during profile load |
| **P1** | `MySermons`, `Bin` | Page-tier loader hides real chrome |
| **P2** | `UserProfile` | Section-scoped skeletons |
| **P2** | `SermonEditPage` | Show edit sidebar during load |
| **P2** | `Analytics`, a11y pass | `aria-busy` on regions |
| **P3** | Admin list pages | When API loading exists |

---

## Verification (per route)

| Route | Manual check |
| ----- | ------------ |
| Any studio URL cold load | Sidebar visible before main content |
| `/get-started` | Sidebar + loader in main, not blank |
| `/studio/…/sermons` | "My Sermons" header visible while table loads |
| `/studio/…/bin` | "Bin" header visible while list loads |
| `/profile` | "Profile" title visible while hero loads |
| `/studio/…/sermons/:id/edit` | Portal + edit sidebars visible during sermon fetch |
