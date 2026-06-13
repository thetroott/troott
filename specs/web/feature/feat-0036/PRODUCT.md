# feat-0036: Portal shell loading — sidebar-first, region-scoped fetch states

## Summary

Define **one app-level loading model** for the authenticated Troott web portal (`apps/web`):

- The **dashboard shell** (sidebar, layout chrome, static nav structure) renders **immediately** after a session token exists.
- **Only regions that depend on API or context data** show loading UI — never the whole app, never the full sidebar, never a blank `DashboardLayout`.
- Main route content (`<Outlet />`) may have its **own** region loading; that is separate from shell loading.

**Normative detail:** [PORTAL_SHELL_LOADING_SPEC.md](./PORTAL_SHELL_LOADING_SPEC.md) — sidebar region matrix and loading tiers.

**Per-route implementation:** [ROUTE_IMPLEMENTATION.md](./ROUTE_IMPLEMENTATION.md) — what to build on each route (today vs target, files, priority).

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

4. Define **exactly one** portal-wide bootstrap flag: **`isPortalBootstrapping`** (alias: clarified contract for existing `isHydratingSession` + role context resolution).

5. **`isPortalBootstrapping` true** means: session/`fetchMe` + role contexts are still resolving for **gating decisions** — NOT "hide the shell".

6. **`isPortalBootstrapping` must not** block shell render. It may only affect:
   - nav item **enabled/disabled** defaults
   - optional **inline skeleton** on specific dynamic nav rows (Get Started)
   - main `<Outlet />` region when route requires hydrated role before first paint

7. Deprecate or narrow **`appContext.loading` / `loader`** for full-screen blocking (audit usages); portal shell spec does not use global overlay loaders on authenticated routes.

### P3 — Region-scoped loading only

8. Classify every sidebar region per [PORTAL_SHELL_LOADING_SPEC § Sidebar regions](./PORTAL_SHELL_LOADING_SPEC.md#sidebar-regions).

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
- **All other Main items** remain visible (studio-scoped items **disabled** per D4; Profile/Settings/Get Started passthrough links work).

Rationale: avoids flash of Get Started for users who already completed onboarding; max one-row shift when row appears.

### D4 — Studio code resolution

- While `useSidebarStudioCode()` is empty: studio-scoped items **disabled** with tooltip `"${title} (studio unavailable)"` (existing copy) — not hidden, not full-sidebar loading.

### D5 — Portal gates and main column

- `StudioPortal`, `GetStartedOnboardingGate` returning `null` is acceptable **only inside `<main>`** during bootstrap — **replace with region-tier loading UI** ([feat-0026 region tier](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md)), not silent blank main.
- Route-level redirects (onboarding incomplete → Get Started) run after bootstrap flags clear; shell stays visible during redirect.

### D6 — Loading UI components

| Use | Component |
| --- | --------- |
| Single nav row (optional, non-Get-Started) | `SidebarMenuSkeleton` ([`sidebar.tsx`](../../../apps/web/src/components/ui/sidebar.tsx)) |
| Main page body | Page/region skeletons, `StudioPageCenter` + status copy |
| Search results | Inside `SidebarSearchCommand` dialog only ([feat-0028](../feat-0028/SIDEBAR_SEARCH_SPEC.md)) |
| **Not allowed** | Full-viewport spinner hiding sidebar |
| **Not allowed** | Second global loader overlay on top of shell |

---

## Per-route rule (summary)

Every authenticated route under `DashboardLayout` follows:

```text
DashboardLayout (static — always)
├── AppSidebar (static chrome + dynamic row filter)
└── main
    └── Route outlet (region-scoped fetch loading only)
```

Full route matrix: [PORTAL_SHELL_LOADING_SPEC § Route matrix](./PORTAL_SHELL_LOADING_SPEC.md#route-matrix).

**Per-route implementation (what to build):** [ROUTE_IMPLEMENTATION.md](./ROUTE_IMPLEMENTATION.md).

---

## Acceptance criteria

- [ ] Sign in → sidebar visible within **100ms** of layout mount (static chrome), even while `fetchMe` in flight.
- [ ] Refresh on `/studio/{code}/sermons` → sidebar stays visible; only table region skeletons.
- [ ] No route shows full-page `"Loading…"` from `AuthGate` while session token present.
- [ ] Get Started row **hidden** during minister/creator load; appears only after context resolves (D3).
- [ ] Studio links **disabled** (not missing) until code known (D4).
- [ ] Admin/super-admin group visibility stable across hydration (cookie-first role).
- [ ] Collapse state persists; no sidebar remount on navigation ([feat-0034](../feat-0034/PRODUCT.md)).
- [ ] a11y: `aria-busy="true"` on **regions** that load, not on `<body>` or sidebar root.
- [ ] `StudioPortal` / `GetStartedOnboardingGate` show region loading in main, not `return null`.

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
| [TECH.md](./TECH.md) | Refactor checklist, tests, file map |
| [PORTAL_SHELL_LOADING_SPEC.md](./PORTAL_SHELL_LOADING_SPEC.md) | Normative region + route matrix |
| [ROUTE_IMPLEMENTATION.md](./ROUTE_IMPLEMENTATION.md) | **Per-route** today → target, files, priority |
| [feat-0034 PRODUCT](../feat-0034/PRODUCT.md) | Sidebar always mounted |
| [feat-0026 EMPTY_STATE_LAYOUT_SPEC](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md) | Main column placement tiers |
| [feat-0001 PRODUCT](../feat-0001/PRODUCT.md) | Session & auth routing |
| [feat-0005 PRODUCT](../feat-0005/PRODUCT.md) | Get Started gating |
