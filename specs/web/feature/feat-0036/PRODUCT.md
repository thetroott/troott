# feat-0036: Portal shell loading — sidebar-first, region-scoped fetch states

## Summary

Define **one app-level loading model** for the authenticated Troott web portal (`apps/web`):

- The **dashboard shell** (sidebar, layout chrome, static nav structure) renders **immediately** after a session token exists.
- **Only regions that depend on API or context data** show loading UI — never the whole app, never the full sidebar, never a blank `DashboardLayout`.
- Main route content (`<Outlet />`) may have its **own** region loading; that is separate from shell loading.

Implementation: [TECH.md](./TECH.md).

**Reference implementation today:**

| Layer | File |
| ----- | ---- |
| Shell | [`DashboardLayout.tsx`](../../../apps/web/src/components/layouts/DashboardLayout.tsx) |
| Sidebar | [`Sidebar.tsx`](../../../apps/web/src/components/shared/navigation/Sidebar.tsx) |
| Static nav | [`navdata.tsx`](../../../apps/web/src/_data/navdata.tsx) |
| Session bootstrap | [`SessionHydrator.tsx`](../../../apps/web/src/context/session/SessionHydrator.tsx), `isHydratingSession` in [`sessionState.tsx`](../../../apps/web/src/context/session/sessionState.tsx) |
| **Anti-pattern** | [`AuthGate`](../../../apps/web/src/routes/routes.tsx) full-page `"Loading…"` blocks entire route tree while `isHydratingSession \|\| isHydratingUserType` |
| **Partial good** | [`StudioPortal.tsx`](../../../apps/web/src/app/studio/StudioPortal.tsx) returns `null` in `<main>` only; sidebar stays mounted via `DashboardLayout` |

Related: [feat-0034](../feat-0034/PRODUCT.md) (always mount sidebar), [feat-0026](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md) (region vs page placement), [feat-0028](../feat-0028/SIDEBAR_SEARCH_SPEC.md) (search loads inside dialog).

---

## Problem

| Today | Gap |
| ----- | --- |
| Role-gated routes show centered **"Loading…"** for the **whole page** during session hydration | User loses sidebar, logo, nav affordances |
| Sidebar waits on `minister` / `creator` / `user` context for **Get Started** and gating | Unclear whether nav should skeleton, hide, or show static + defer |
| Multiple loading concepts: `isHydratingSession`, `ministerLoading`, `AuthGate`, `appContext.loading`, per-page skeletons | No single product rule |
| feat-0002 defers "per-page loading skeletons" | Shell vs content loading still undefined |
| `GetStartedOnboardingGate` / `StudioPortal` return `null` in main | Acceptable boundary, but should use **region** loading UI per feat-0026 |

**Goal:** User always sees **Dashboard UI chrome** ([feat-0034](../feat-0034/PRODUCT.md)) while data catches up; loading is **local to the fetching region**.

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-PSL01 | Minister | The sidebar visible immediately after sign-in | I know I'm in the studio portal while data loads |
| UC-PSL02 | Minister | Only the sermon table to skeleton on My Sermons | The nav and page header stay usable |
| UC-PSL03 | Creator | Studio links disabled (not missing) until code resolves | I see the full nav model with clear affordance |
| UC-PSL04 | Engineer | One bootstrap flag contract | We don't add new full-page loaders |

---

## Core principles (normative)

### P1 — Shell-first rendering

1. If `storage.checkToken()` && `storage.checkUserID()` → render **`DashboardLayout` immediately** with:
   - `AppSidebar` (header, search affordance, nav groups, footer)
   - `NavBar` when applicable
   - `<main>` with `<Outlet />` (content area may load separately)

2. **Forbidden:** replacing the entire authenticated layout with a single spinner or blank screen while session or minister data hydrates.

3. **Forbidden:** unmounting `AppSidebar` during session refresh, studio fetch, or minister load ([feat-0034](../feat-0034/PRODUCT.md)).

### P2 — One app loading state (semantic)

4. Define **exactly one** portal-wide bootstrap flag: **`isPortalBootstrapping`** (implemented via [TECH § Bootstrap flag contract](./TECH.md#bootstrap-flag-contract)).

5. **`isPortalBootstrapping` true** means: [`refreshSession`](../../../apps/web/src/context/session/sessionState.tsx) is in flight — including `fetchMe` **and** chained role context refresh (minister, creator, studio, admin profile where applicable). This is **longer** than `fetchMe` alone. It affects **gating decisions** — NOT "hide the shell".

6. **`isPortalBootstrapping` must not** block shell render. It may only affect:
   - nav item **enabled/disabled** defaults
   - Get Started row visibility (D3)
   - main `<Outlet />` page-tier loaders on portal gates

7. **`ministerLoading` / `creatorLoading` outside `refreshSession`** (e.g. forced profile refresh) follow the same rules: shell stays up; only nav rows and affected main regions react.

8. Deprecate or narrow **`appContext.loading` / `loader`** for full-screen blocking ([TECH § Global loading audit](./TECH.md#global-loading-audit)); portal shell does not use global overlay loaders on authenticated routes.

### P3 — Region-scoped loading only

8. Classify sidebar and main regions per [TECH § Loading tiers](./TECH.md#loading-tiers) and [TECH § Sidebar regions](./TECH.md#sidebar-regions).

9. **Main content** (`<Outlet />`) follows **region tier** from [feat-0026](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md):
   - Page/region/panel skeletons **inside `<main>` only**
   - Never cover sidebar

---

## Behavior decisions (locked)

### D1 — AuthGate / route guard

**Decision: A**

- `AuthGate` **only redirects** when **no session**.
- When session exists but hydrating, render **children** (`DashboardLayout` + sidebar) and let inner routes handle content loading.
- **Reject:** centered `"Loading…"` div replacing entire authenticated route tree.

### D2 — Session hydration (`SessionHydrator` / `refreshSession`)

- Sidebar **must render** while `isHydratingSession === true`.
- Nav uses **optimistic role** from cookie until `fetchMe` completes.
- After hydration, re-filter groups (Get Started, admin/main) without layout shift greater than **one nav row**.

### D3 — Minister / creator context (Get Started row)

**Decision: Hide until profile context resolves**

- While `ministerLoading` / `creatorLoading` (for studio content roles): **omit** Get Started row — do not skeleton, do not show placeholder.
- After load: show or hide per [`shouldShowGetStartedNavItem`](../../../apps/web/src/utils/portal-onboarding.util.ts).
- **All other Main items** remain visible (studio-scoped items **disabled** per D4; Profile/Settings passthrough links work).

Rationale: avoids flash of Get Started for users who already completed onboarding; max one-row shift when row appears.

### D4 — Studio code resolution

- While `useSidebarStudioCode()` is empty: studio-scoped items **disabled** with tooltip `"${title} (studio unavailable)"` (existing copy) — not hidden, not full-sidebar loading.

### D5 — Portal gates and main column

- `StudioPortal`, `GetStartedOnboardingGate` returning `null` is acceptable **only inside `<main>`** during bootstrap — **replace with region-tier loading UI** ([feat-0026 region tier](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md)), not silent blank main.
- Route-level redirects (onboarding incomplete → Get Started) run after bootstrap flags clear; shell stays visible during redirect.

### D6 — Loading UI components

| Use | Component |
| --- | --------- |
| Page-tier gate (`StudioPortal`, onboarding gate) | `PortalRegionLoader` — centered `Loader2` + status copy ([TECH § Loading visuals](./TECH.md#loading-visuals)) |
| Region-tier list body (initial load) | `PortalContentLoader` or inline `Loader2` inside `contentStack` — **chrome stays mounted** |
| Region-tier skeleton (profile, cards) | Pulse blocks / card skeletons; reuse feat-0026 **region** placement |
| Single nav row (optional, non-Get-Started) | `SidebarMenuSkeleton` ([`sidebar.tsx`](../../../apps/web/src/components/ui/sidebar.tsx)) |
| Background refetch (`isFetching`) | Inline indicator in toolbar/header only — **must not** replace region with page loader (D7) |
| Search results | Inside `SidebarSearchCommand` dialog only ([feat-0028](../feat-0028/SIDEBAR_SEARCH_SPEC.md)) |
| **Not allowed** | Full-viewport spinner hiding sidebar |
| **Not allowed** | Second global loader overlay on top of shell |

### D7 — Initial load vs background refetch

- **`isLoading` (no cached data):** region-tier loader or skeleton; page chrome static.
- **`isFetching` (cached data, refetching):** subtle inline status (e.g. sr-only or small header hint); **table/list chrome remains visible and interactive** where safe.
- **Forbidden:** swapping an entire list page back to page-tier spinner on refetch.

### D8 — Bootstrap and context errors

- Shell **always stays visible** when minister/creator/studio context fetch fails (non-401).
- Main region shows **error + retry** ([feat-0026 region tier](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md)) — not infinite silent loader.
- Sidebar: Get Started stays **hidden** if profile context never resolved; studio links stay **disabled** without code.
- Session **401** during hydrate: existing `invalidateStaleSession` → login redirect; shell may flash briefly.

### D9 — Post-login and entry routing

- After sign-in, user may briefly see **`DashboardLayout` on `/login` redirect target** while `useRedirectAfterAuth` runs — **shell-first still applies** once token exists and router lands on a dashboard route.
- **`AuthSessionRouting`** remains headless (no UI); it must not introduce a blocking loader.
- Deep link `state.from` preserved; destination route owns main-region loading after navigation.

### D10 — Creator and super-admin parity

- **Creators:** same shell rules as ministers; `StudioPortal` and onboarding gates must treat **`creatorLoading`** the same as `ministerLoading` (code gap today).
- **Super-admin:** cookie-first admin nav; during hydrate may load admin profile **and** studio personas — max one-row nav shift; no full-sidebar loading.
- **Admin routes:** separate `DashboardLayout` tree in `admin.route.tsx` — **same AuthGate and loading rules** as minister/creator dashboard.

### D11 — Redirect frames (no silent blank main)

- **`GetStartedOnboardingGate`:** show page-tier loader during profile load **and** during redirect-to-studio frame (replace both `return null` paths).
- **`StudioPortal`:** show page-tier loader until `ready` or error — including onboarding redirect effect in flight.
- Shell visible during client-side redirects.

### D12 — Studio code resolution (refined)

- While `useSidebarStudioCode()` is empty: studio-scoped items **disabled** + tooltip (D4).
- **`StudioState.isLoading`** (`getMyStudio`) during hydrate may overlap with disabled links — **no spinner on sidebar**; links enable when code resolves from route, session, context, or storage ([TECH § Sidebar studio code](./TECH.md#sidebar-studio-code)).

---

## Per-route behavior

Every authenticated route under `DashboardLayout` follows:

```text
DashboardLayout (static — always)
├── AppSidebar (static chrome + dynamic row filter)
└── main
    └── Route outlet (region-scoped fetch loading only)
```

### Static vs loading (what user always sees)

| Always visible (no fetch) | Loads in region only |
| ------------------------- | -------------------- |
| Sidebar logo, wordmark, search trigger | Get Started row (hidden until profile known) |
| Nav labels + icons (Main / Admin groups) | Studio links state (disabled → enabled when code resolves) |
| Footer Logout, Install | Main `<Outlet />` fetch regions per route table |
| Page/route headers where listed as static | Search results (inside ⌘K dialog — [feat-0028](../feat-0028/SIDEBAR_SEARCH_SPEC.md)) |
| Top NavBar when route shows it | Upload modal steps, analytics cards, table bodies |

### Route-by-route

| Route | Shell | Loading tier | User-visible gap today | Target behavior | P |
| ----- | ----- | ------------ | ---------------------- | --------------- | - |
| **All dashboard + admin** | Blocked during hydrate | — | Full-page `"Loading…"` hides sidebar (`dashboard.route` + `admin.route`) | Shell immediate when token exists | 0 |
| `/get-started` | Immediate | **Page** | Blank main during profile load | Status loader in main only | 0 |
| `/get-started` (index) | Immediate | None | — | Static hub; gate handles bootstrap | — |
| `/get-started/**` steps | Immediate | None | — | Static forms; **InnerLayout** chrome (Save & Exit, progress) always visible | — |
| `/get-started/complete-profile` | Immediate | None | — | Redirect-only route; no loader | — |
| `/profile` | Immediate | **Region** | No page header during load | Header static; hero/stats/recent load in place | 2 |
| `/settings` | Immediate | **Panel** | — | Page title static; account section loads in place | 2 |
| `/studio/:code` | Immediate | **Page** | Blank main during studio resolve | Status loader in main only | 0 |
| `/studio/:code` (index) | Immediate | None | — | Upload layout static | — |
| `/studio/:code/sermons` | Immediate | **Region** | Spinner hides table chrome | Header + toolbar static; table region loads | 1 |
| `/studio/:code/sermons/upload/**` | Immediate | **Panel** | — | Backdrop static; modal steps load | — |
| `/studio/:code/sermons/:id` (+ resume) | Immediate | **Page** | — | Centered status in main (compliant) | 2 |
| `/studio/:code/sermons/:id/edit` | Immediate | **Region** | Edit sidebar hidden during load | Portal + edit sidebars static; form loads | 2 |
| `/studio/:code/sermons/:id/analytics` | Immediate | **Region** | — | Edit shell static; metrics panels load | 2 |
| `/studio/:code/analytics` | Immediate | **Region** | — | Header + tabs static; tab body loads | 2 |
| `/studio/:code/bin` | Immediate | **Region** | Spinner hides header/toolbar | Header + toolbar static; list region loads | 1 |
| `/admin` | Immediate | None | — | Static | — |
| `/admin/users`, `/admin/sermons`, … | Immediate | **Region** | TBD | Title static; list region loads when API wired | 3 |

**Out of scope:** `/login`, `/register`, auth flows; `/unauthorized`, `/404`; public preview.

File-level implementation: [TECH § Per-route implementation](./TECH.md#per-route-implementation).

---

## Acceptance criteria

### Global

- [ ] Sign in → sidebar visible within **100ms** of layout mount (static chrome), even while `fetchMe` in flight.
- [ ] Refresh on `/studio/{code}/sermons` → sidebar stays visible; only table region skeletons.
- [ ] No route shows full-page `"Loading…"` from `AuthGate` while session token present.
- [ ] Get Started row **hidden** during minister/creator load; appears only after context resolves (D3).
- [ ] Studio links **disabled** (not missing) until code known (D4).
- [ ] Admin/super-admin group visibility stable across hydration (cookie-first role).
- [ ] Collapse state persists; no sidebar remount on navigation ([feat-0034](../feat-0034/PRODUCT.md)).
- [ ] a11y: `aria-busy="true"` on **regions** that load, not on `<body>` or sidebar root.
- [ ] `StudioPortal` / `GetStartedOnboardingGate` show region loading in main — **both** profile-load and redirect frames (D11).
- [ ] Creator cold load on `/studio/{code}/**` — gate waits on `creatorLoading`, not minister-only.
- [ ] Context fetch error in main shows retry; sidebar remains visible (D8).
- [ ] List refetch (`isFetching`) does not hide table header/toolbar (D7).

### Per-route

| Route | Pass when |
| ----- | --------- |
| Any `/studio/**` cold load | Sidebar visible before main content finishes loading |
| `/get-started` | Sidebar + profile loader in main — not blank |
| `/studio/…/sermons` | "My Sermons" header + toolbar visible while table loads |
| `/studio/…/bin` | "Bin" header + toolbar visible while list loads |
| `/profile` | "Profile" page header visible while hero loads |
| Creator sign-in → studio | Sidebar immediate; studio page loader until creator context + studio resolve |
| Super-admin hydrate | Admin sidebar stable; studio links disable/enable without full-sidebar load |
| Minister profile fetch fails | Main error region; sidebar up; Get Started hidden |
| Table filter change (refetch) | Header/toolbar stay; no full-page loader |

---

## Non-goals

- Changing nav item inventory ([feat-0002](../feat-0002/PRODUCT.md)).
- Search dialog behavior beyond "loading stays inside dialog" ([feat-0028](../feat-0028/SIDEBAR_SEARCH_SPEC.md)).
- Mobile app.
- Replacing React Query per-query loading inside feature pages (document boundary only).
- Auth/marketing routes without `DashboardLayout`.

---

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | Loading tiers, sidebar contract, per-route implementation, tests |
| [feat-0034 PRODUCT](../feat-0034/PRODUCT.md) | Sidebar always mounted |
| [feat-0026 EMPTY_STATE_LAYOUT_SPEC](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md) | Main column placement tiers |
| [feat-0001 PRODUCT](../feat-0001/PRODUCT.md) | Session & auth routing |
| [feat-0009 PRODUCT](../feat-0009/PRODUCT.md) | Post-login entry & redirect |
| [feat-0005 PRODUCT](../feat-0005/PRODUCT.md) | Get Started gating |
