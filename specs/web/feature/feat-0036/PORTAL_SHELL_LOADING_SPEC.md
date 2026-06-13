# feat-0036: Portal shell loading — normative region contract

## Summary

This document is the **normative layout contract** for loading states in `apps/web`. Product decisions live in [PRODUCT.md](./PRODUCT.md); implementation checklist in [TECH.md](./TECH.md).

**Rule:**

> Authenticated portal routes render **static shell chrome immediately**. Loading UI appears only in **regions whose content depends on an in-flight fetch or unresolved context** — never as a full-page replacement of `DashboardLayout` or `AppSidebar`.

---

## Loading tiers

| Tier | Boundary | When loading shows | Must not block |
| --- | --- | --- | --- |
| **Shell** | `DashboardLayout` + `AppSidebar` + optional `NavBar` | **Never** full-tier loading | — |
| **Main — page** | Full `<main>` column below top nav | Route gate waiting on bootstrap (`StudioPortal`, `GetStartedOnboardingGate`) | Sidebar |
| **Main — region** | Feature content area under local header/tabs/toolbar | List/table/analytics body fetch ([feat-0026](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md)) | Sidebar, page header |
| **Main — panel** | Card, dialog section, chart widget | Nested query | Parent chrome |
| **Sidebar — row** | Single `SidebarMenuItem` | Optional; Get Started uses **hide** not skeleton (D3) | Rest of sidebar |
| **Overlay — dialog** | Command palette / modal | Search sermon fetch ([feat-0028](../feat-0028/SIDEBAR_SEARCH_SPEC.md)) | Shell behind dialog |

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

- `isHydratingSession === true` ([`sessionState.tsx`](../../../apps/web/src/context/session/sessionState.tsx))
- `isHydratingUserType === true` ([`useWebPortalEligibility`](../../../apps/web/src/hooks/app/useUser.tsx)) **and** route has `roles` allow-list
- For studio content roles on routes that gate on profile: `ministerLoading || creatorLoading` **inside main outlet only** — not sidebar root

**False does not mean** all page queries finished — only that **portal gating decisions** can be made.

**Must not:**

- Block `DashboardLayout` render
- Block `AppSidebar` render
- Trigger `AuthGate` full-page `"Loading…"`

---

## Route matrix

All routes nest under [`dashboard.route.tsx`](../../../apps/web/src/routes/dashboard.route.tsx) → `DashboardLayout`.

**Detailed implementation (today → target, files, code sketches):** [ROUTE_IMPLEMENTATION.md](./ROUTE_IMPLEMENTATION.md).

| Route | Shell | Main loading region | Fetch / context | Implementation summary |
| ----- | ----- | ------------------- | --------------- | ---------------------- |
| **AuthGate** (all dashboard) | Blocked today during hydrate | N/A | `isHydratingSession`, `isHydratingUserType` | Remove full-page loader; render shell ([ROUTE § Cross-cutting](./ROUTE_IMPLEMENTATION.md#cross-cutting-all-dashboard-routes)) |
| `/get-started` | Immediate | **Page** — `GetStartedOnboardingGate` | Session + minister/creator | Replace `return null` → `PortalRegionLoader` |
| `/get-started` (index) | Immediate | None | Hub reads minister for steps | Static hub UI; gate handles bootstrap |
| `/get-started/**` steps | Immediate | None | Button-scoped saves | No route loader |
| `/profile` | Immediate | **Region** — hero, stats, recent | `useProfileQuery`, stats, recent | Keep header; section skeletons ([ROUTE § profile](./ROUTE_IMPLEMENTATION.md#profile---userprofile)) |
| `/settings` | Immediate | **Panel** — account section | Account query | Page header static; section `aria-busy` |
| `/studio/:code` | Immediate | **Page** — `StudioPortal` | `getStudio`, onboarding gate | Replace `return null` → `PortalRegionLoader` |
| `/studio/:code` (index) | Immediate | None / optional feed hint | Optional sermon list | `UploadLayout` static |
| `/studio/:code/sermons` | Immediate | **Region** — table body | Sermon list `useQuery` | Render `SermonsTable` chrome; load in `contentStack` |
| `/studio/:code/sermons/upload/**` | Immediate | **Panel** — modal steps | Upload/resume | Backdrop shell static; modal scoped |
| `/studio/:code/sermons/:id` (+ resume) | Immediate | **Page** — redirect resolver | `fetchSermonDetail` | Already centered loader; add a11y |
| `/studio/:code/sermons/:id/edit` | Immediate | **Region** — form column | `useSermonByIdQuery` | Keep edit sidebar; loader in form only |
| `/studio/:code/sermons/:id/analytics` | Immediate | **Region** — metrics panels | Sermon + analytics queries | Same edit shell; panel skeletons |
| `/studio/:code/analytics` | Immediate | **Region** — tab body | Overview/breakdown | Header + tabs static |
| `/studio/:code/bin` | Immediate | **Region** — list/grid | Bin `useQuery` | Header + toolbar static; load in content |
| `/admin`, `/admin/users`, … | Immediate | **Region** when API wired | Admin list queries | Static title; region loader under header |

### AuthGate (parent of shell)

| Condition | Behavior |
| --------- | -------- |
| No token | Redirect login — no shell |
| Token + hydrating + `roles` | **Render children** (D1) — shell visible |
| Token + wrong role | Redirect unauthorized |
| Token + public route | N/A (no `DashboardLayout`) |

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
// Page tier — portal gate (StudioPortal)
if (!onboardingComplete || !ready) {
  return (
    <StudioPageCenter aria-busy="true">
      <p className="text-sm text-muted-foreground">Loading studio…</p>
    </StudioPageCenter>
  );
}
```

### Forbidden

```tsx
// AuthGate — blocks shell
if (isHydrating) {
  return <div className="min-h-[40vh]">Loading…</div>;
}

// Layout — blocks sidebar
if (ministerLoading) return null;

// App root overlay on authenticated routes
if (appContext.loader) return <FullScreenSpinner />;
```

---

## Accessibility

| Element | Requirement |
| ------- | ----------- |
| Loading region | `aria-busy="true"` on the fetching region container |
| Status text | `role="status"` + `aria-live="polite"` for page-tier loaders |
| Sidebar | No `aria-busy` on `<Sidebar>` root during bootstrap |
| Disabled nav items | `aria-disabled="true"` (existing) |

---

## Related specs

- [feat-0026 EMPTY_STATE_LAYOUT_SPEC](../feat-0026/EMPTY_STATE_LAYOUT_SPEC.md) — centering for empty + loading placement
- [feat-0028 SIDEBAR_SEARCH_SPEC](../feat-0028/SIDEBAR_SEARCH_SPEC.md) — search loading inside dialog
- [feat-0034 PRODUCT](../feat-0034/PRODUCT.md) — sidebar always mounted
