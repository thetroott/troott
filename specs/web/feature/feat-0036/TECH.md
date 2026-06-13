# feat-0036: Tech — Portal shell loading

## Context

See [PRODUCT.md](./PRODUCT.md) and normative [PORTAL_SHELL_LOADING_SPEC.md](./PORTAL_SHELL_LOADING_SPEC.md).

**Goal:** Shell-first authenticated UX — refactor gates and gates-in-main to stop blocking `DashboardLayout` / `AppSidebar`.

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

**Bootstrap flag (optional rename):**

```ts
// hooks/app/usePortalBootstrap.ts (new, thin)
const isPortalBootstrapping =
  isHydratingSession ||
  (hasRoleGatedRoute && isHydratingUserType);
// ministerLoading / creatorLoading — consume in outlet gates only, not shell
```

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

**Fix (D1-A):** Remove hydration branch; keep session redirect + role check after hydration completes (use cookie role for optimistic allow during hydrate, or allow render and let unauthorized redirect when `fetchMe` finishes).

### 2. Silent main during portal gates

| File | Issue |
| ---- | ----- |
| [`StudioPortal.tsx`](../../../apps/web/src/app/studio/StudioPortal.tsx) | `return null` when `!onboardingComplete` or `!ready` |
| [`GetStartedOnboardingGate.tsx`](../../../apps/web/src/components/shared/get-started/GetStartedOnboardingGate.tsx) | `return null` when `profileLoading` |

**Fix (D5):** Return `StudioPageCenter` + status / minimal skeleton with `aria-busy`.

### 3. Profile full-page gate

[`UserProfile.tsx`](../../../apps/web/src/app/profile/UserProfile.tsx) — early `if (isLoading) return …` may block entire page. **Target:** static profile chrome + region skeletons per section ([PORTAL_SHELL_LOADING_SPEC route matrix](./PORTAL_SHELL_LOADING_SPEC.md#route-matrix)).

---

## Implementation checklist

See **[ROUTE_IMPLEMENTATION.md](./ROUTE_IMPLEMENTATION.md)** for per-route today → target detail.

| # | Task | File(s) | Priority |
| - | ---- | ------- | -------- |
| 1 | Remove AuthGate hydration blocking branch | `routes.tsx` | P0 — [ROUTE § Cross-cutting](./ROUTE_IMPLEMENTATION.md#cross-cutting-all-dashboard-routes) |
| 2 | Cookie-first role during hydrate | `routes.tsx`, `useUser.tsx` | P0 |
| 3 | `StudioPortal` — `PortalRegionLoader` instead of `null` | `StudioPortal.tsx` | P0 — [ROUTE § StudioPortal](./ROUTE_IMPLEMENTATION.md#studiostudiocode---studioportal-parent-of-all-studio-routes) |
| 4 | `GetStartedOnboardingGate` — region loader | `GetStartedOnboardingGate.tsx` | P0 — [ROUTE § get-started gate](./ROUTE_IMPLEMENTATION.md#get-started---getstartedonboardinggate) |
| 5 | Sidebar — hide Get Started during profile load | `Sidebar.tsx` | P1 |
| 6 | `usePortalBootstrap` + `PortalRegionLoader` helper | new files | P1 |
| 7 | `MySermons` — region load inside table chrome | `MySermons.tsx`, `SermonsTable.tsx` | P1 — [ROUTE § sermons](./ROUTE_IMPLEMENTATION.md#studiostudiocode-sermons---mysermons) |
| 8 | `Bin` — region load with header/toolbar visible | `Bin.tsx` | P1 — [ROUTE § bin](./ROUTE_IMPLEMENTATION.md#studiostudiocodebin---bin) |
| 9 | `UserProfile` — section-scoped skeletons | `UserProfile.tsx` | P2 — [ROUTE § profile](./ROUTE_IMPLEMENTATION.md#profile---userprofile) |
| 10 | `SermonEditPage` — edit sidebar during load | `SermonEditPage.tsx` | P2 — [ROUTE § edit](./ROUTE_IMPLEMENTATION.md#studiostudiocode-sermonssermonidedit---sermoneditpage) |
| 11 | `Analytics` — `aria-busy` on tab body | `Analytics.tsx` | P2 |
| 12 | Audit `appContext.loader` — no portal overlay | `appState.tsx`, `App.tsx` | P2 |
| 13 | a11y `aria-busy` on all region loaders | feature pages | P2 |

---

## AuthGate refactor (D1-A)

**Before:**

```tsx
if (roles?.length && isHydrating) {
  return <div>Loading…</div>;
}
if (roles?.length && !roleMatchesAllowList(roles, userType)) {
  return <Navigate to={PATH_UNAUTHORIZED} />;
}
return <>{children}</>;
```

**After (sketch):**

```tsx
if (!hasSession) {
  return <Navigate to={PATH_LOGIN} … />;
}

// Optimistic: cookie role during hydrate
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

## Sidebar changes (D3, D4)

[`Sidebar.tsx`](../../../apps/web/src/components/shared/navigation/Sidebar.tsx):

```tsx
const { minister, isLoading: ministerLoading } = useMinister();
const { creator, isLoading: creatorLoading } = useCreator();

const profileContextLoading =
  (userRole === UserType.MINISTER && ministerLoading) ||
  (userRole === UserType.CREATOR && creatorLoading);

// In Get Started filter:
if (navItem.title === 'Get Started') {
  if (profileContextLoading) return false;
  return shouldShowGetStartedNavItem(…);
}
```

Studio disabled state — **no change** (already `isDisabled` when `href === null`).

---

## Portal gate loaders

Shared helper (optional):

```tsx
// components/shared/studio/PortalRegionLoader.tsx
export function PortalRegionLoader({ label }: { label: string }) {
  return (
    <StudioPageCenter aria-busy="true">
      <p className="font-matter text-sm text-muted-foreground" role="status">
        {label}
      </p>
    </StudioPageCenter>
  );
}
```

| Gate | Label |
| ---- | ----- |
| `StudioPortal` | `Loading studio…` |
| `GetStartedOnboardingGate` | `Loading your profile…` |

---

## Global loading audit

| Mechanism | Portal shell impact | Action |
| --------- | -------------------- | ------ |
| `isHydratingSession` | Was blocking via AuthGate | Non-blocking after #1 |
| `appContext.loading` (`default`) | Auth form submits | Keep — auth routes only |
| `appContext.loader` | Unknown overlay | Audit render site in `App.tsx` / layout |
| React Query `isLoading` | Per-page | Keep inside region |
| `useGlobalLoading` in `ReactQueryProvider` | Global flag | Must not overlay dashboard shell |

---

## Tests

| Test | Type | Assert |
| ---- | ---- | ------ |
| AuthGate with token + hydrating renders children | component | No `"Loading…"` text; child visible |
| AuthGate without token redirects | component | Navigate login |
| DashboardLayout mounts AppSidebar during hydrate | integration | Sidebar present when `isHydratingSession` mocked true |
| Get Started hidden when `ministerLoading` | unit | Filter excludes row |
| StudioPortal shows loader not null | component | `PortalRegionLoader` / status text |
| Studio nav items disabled without code | component | `aria-disabled` on Dashboard/Sermons |

Suggested locations:

- `apps/web/src/routes/routes.test.tsx` (new)
- `apps/web/src/app/studio/StudioPortal.test.tsx` (new)

---

## Manual QA matrix

| Scenario | Expected |
| -------- | -------- |
| Cold load `/studio/{code}/sermons` with valid token | Sidebar immediate; table region loads |
| Cold load `/get-started` incomplete onboarding | Sidebar immediate; main shows profile loader briefly |
| Session refresh (tab focus / `refreshSession`) | Sidebar never unmounts |
| Minister load slow | Get Started absent; other Main items visible; studio links disabled |
| Studio code in storage | Studio links enabled after first resolve |
| Admin cookie, `fetchMe` pending | Main nav group stable |
| Wrong role after hydrate | Redirect unauthorized; shell may flash briefly (D1 edge) |
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

---

## Migration notes

- Implement **P0** (AuthGate + portal gates) before sidebar Get Started tweak — biggest user-visible win.
- Coordinate with [feat-0034](../feat-0034/TECH.md) — sidebar must stay mounted (already merged in `DashboardLayout`).
- Profile section loading (P2) can ship as follow-up PR.
