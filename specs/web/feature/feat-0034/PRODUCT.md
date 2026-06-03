# feat-0034: Dashboard sidebar — always show onboarding Dashboard UI

## Summary

Ministers and creators see a **Dashboard UI** during Get Started onboarding: collapsible **left sidebar** (Troott logo, search, **Main** nav, footer) inside `DashboardLayout`, plus top **NavBar** on most routes. That chrome is the **canonical studio shell**.

Today, several post-onboarding routes **remove or replace** that sidebar. Users lose the same navigation they had during onboarding and the product feels like a different app.

This spec requires the **Dashboard UI sidebar to always render** on every authenticated dashboard route (except where explicitly waived below). The sidebar **structure and styling** during onboarding is the reference implementation.

Related: [feat-0002 portal sidebar](../feat-0002/PRODUCT.md), [feat-0004 studio-scoped URLs](../feat-0004/PRODUCT.md), [feat-0010 Get Started shell](../feat-0010/PRODUCT.md), [feat-0023 sermon edit workspace](../feat-0023/PRODUCT.md).

---

## Problem

| Route / phase | Sidebar today | User expectation |
| ------------- | ------------- | ---------------- |
| `/get-started` (onboarding) | Full **AppSidebar** — Main nav + Get Started | Correct — **this is Dashboard UI** |
| `/studio/{code}` (dashboard home) | Full **AppSidebar** | Correct |
| `/studio/{code}/sermons`, `/analytics`, `/bin` | Full **AppSidebar**; top nav may hide | Sidebar OK |
| `/studio/{code}/sermons/{id}/edit` or `…/analytics` | **AppSidebar unmounted**; only in-page `SermonEditSidebar` | Feels like leaving Dashboard UI |
| After onboarding completes | Get Started item hides; studio links unblock | OK — **same sidebar chrome**, one fewer item |

**Reported gap:** “The dashboard sidebar should always show the UI it showed during onboarding.”

---

## Definition: Dashboard UI (reference)

The **Dashboard UI sidebar** is `AppSidebar` in [`Sidebar.tsx`](../../../apps/web/src/components/shared/navigation/Sidebar.tsx) inside [`DashboardLayout.tsx`](../../../apps/web/src/components/layouts/DashboardLayout.tsx), as documented in [feat-0010 § Shell](../feat-0010/PRODUCT.md#shell-and-layout):

| Region | Content |
| ------ | ------- |
| **Header** | Troott icon + wordmark |
| **Search** | Sidebar search affordance (`SearchForm`) |
| **Main group** | Get Started (while onboarding incomplete), Dashboard, Sermons, Analytics, Bin, Profile, Settings |
| **Footer** | Logout, Install Troott on |
| **Chrome** | Collapsible icon mode, dark shell, active-state styling ([feat-0002](../feat-0002/PRODUCT.md)) |

**Not Dashboard UI:** replacing `AppSidebar` with a page-local nav only; rendering zero left nav; showing a different item set or empty section headers.

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-DSB01 | Minister during onboarding | The same left sidebar on Get Started and studio | I learn one navigation model |
| UC-DSB02 | Minister after onboarding | That sidebar on every studio page | I do not lose Dashboard UI when I edit a sermon |
| UC-DSB03 | Creator | Main nav items identical to ministers ([feat-0002](../feat-0002/PRODUCT.md)) | Parity |
| UC-DSB04 | Engineer | One layout rule in `DashboardLayout` | No route-specific sidebar unmount hacks |

---

## Required behavior

### B1 — Always mount `AppSidebar`

1. **`DashboardLayout` must render `AppSidebar`** for all internal portal routes it wraps (minister, creator, admin, super-admin), including:
   - `/get-started/**`
   - `/studio/{code}/**` (home, sermons, upload wizard, bin, analytics)
   - `/studio/{code}/sermons/{id}/edit` and `…/analytics`
   - `/profile`, `/settings`

2. **Remove** the conditional that skips `AppSidebar` when `isStudioSermonWorkspacePath(pathname)` is true ([`DashboardLayout.tsx`](../../../apps/web/src/components/layouts/DashboardLayout.tsx) ~lines 66–70).

3. **Sermon edit / analytics** may keep **`SermonEditSidebar`** as **secondary** navigation inside the main column ([feat-0023](../feat-0023/PRODUCT.md)) — it must **not** replace the Dashboard UI sidebar.

### B2 — Stable Main nav structure

4. **Main** item list is **identical** during and after onboarding ([feat-0002 § C](../feat-0002/PRODUCT.md#c-minister-and-creator--shared-studio-nav-same-use-cases)), except:
   - **Get Started** visible only while onboarding incomplete ([feat-0010](../feat-0010/PRODUCT.md))
   - No new empty groups (“Sermon Management”, “Engagement”) with zero items

5. **Dashboard** always means studio home `/studio/{code}` ([feat-0004](../feat-0004/PRODUCT.md)), not legacy `/dashboard`.

6. Studio-scoped links resolve via `useSidebarStudioCode` / `resolveStudioNavUrl` on **every** route, including `/get-started` once a code exists.

### B3 — Onboarding gating vs sidebar appearance

7. **Onboarding must not change sidebar layout** — only **link behavior**:
   - While incomplete: blocked studio destinations may toast + redirect to Get Started ([`shouldRedirectStudioNavForOnboarding`](../../../apps/web/src/utils/hub-onboarding.util.ts))
   - After complete: normal `Link` navigation
   - **Items remain visible** in both states (except Get Started lifecycle)

8. **Disabled** state (no studio code) shows muted item + tooltip — same visual pattern as onboarding, not a different sidebar.

### B4 — Top NavBar (related, not replaced)

9. Top **NavBar** may still hide on full-bleed canvas routes ([feat-0010](../feat-0010/PRODUCT.md)); **sidebar stays visible**. Do not hide sidebar when top nav hides.

### B5 — Roles unchanged

10. **Admin** / **super-admin** / **listener** rules unchanged ([feat-0002](../feat-0002/PRODUCT.md)). This spec targets **minister and creator Dashboard UI** parity.

---

## No fallback, no legacy (hard requirement)

Implementation must **delete** old sidebar paths — not keep them behind flags, env vars, comments, or “just in case” branches. **One** canonical dashboard shell: **`AppSidebar` always mounted** inside `DashboardLayout`.

### Prohibited patterns

| Do not | Why |
| ------ | --- |
| Conditionally unmount `AppSidebar` on `isStudioSermonWorkspacePath` (or any route regex) | That was the bug; not an optional edit mode |
| Keep the unmount guard “for mobile” or “narrow viewports” without a separate approved spec | Sidebar visibility is layout-invariant per B1 |
| Route-specific **alternate** left nav that replaces `AppSidebar` (edit-only shell, empty left column) | Dashboard UI is always `AppSidebar` + optional in-page nav |
| Feature flag / env var to restore pre-feat-0034 “full-bleed without portal sidebar” | No dual-path rollout |
| Legacy hrefs in user-visible sidebar (`/dashboard`, `/sermons`, `/upload-sermon`) without `resolveStudioNavUrl` | [feat-0004](../feat-0004/PRODUCT.md) — studio-scoped URLs only |
| `@deprecated` wrapper that renders old sidebar-less layout for some routes | Remove callers, then remove wrapper |
| “Fallback” sidebar: render `SermonEditSidebar` in the **left column** when `AppSidebar` is hidden | Edit nav is **secondary** inside `<main>` only ([B1](#b1--always-mount-appsidebar)) |
| Comments like `// legacy: hide sidebar on edit` left beside dead code | Delete guard and comment together |

### Required cleanup (delete list)

| Location | Action |
| -------- | ------ |
| `DashboardLayout.tsx` | **Remove** ternary that skips `AppSidebar` for `isStudioSermonWorkspacePath` |
| `DashboardLayout.tsx` | **Always** render `<AppSidebar userRole={…} />` — no `null` branch |
| Any route/layout file | **Remove** duplicate “portal sidebar omitted” layout variants for sermon edit/analytics |
| `paths.ts` → `isStudioSermonWorkspacePath` | May remain for **top NavBar** / full-bleed **main** styling — **must not** gate sidebar mount |

### Correct failure mode

If layout breaks on sermon edit (overflow, overlap): **fix flex/width in main column** — never compensate by hiding `AppSidebar`.

---

## Acceptance criteria

1. On `/get-started`, sidebar matches Dashboard UI definition (reference screenshots in QA).
2. On `/studio/{code}`, sidebar matches the same chrome and Main items (minus Get Started when complete).
3. On `/studio/{code}/sermons/{id}/edit` and `…/analytics`, **`AppSidebar` is visible**; page still usable with `SermonEditSidebar` in content.
4. No route in the dashboard shell renders **without** `AppSidebar` unless listed in Out of scope.
5. Collapse preference persists across routes ([feat-0002](../feat-0002/PRODUCT.md)).
6. Main nav active state works on nested studio paths.
7. Manual QA: complete onboarding → land on studio home → open sermon edit → **sidebar unchanged** from step 1 (except Get Started hidden).
8. **No legacy code:** grep for `isStudioSermonWorkspacePath` in `DashboardLayout.tsx` returns **zero** matches used to skip `AppSidebar` ([§ No fallback, no legacy](#no-fallback-no-legacy-hard-requirement)).
9. **No fallback branches** that render sidebar-less dashboard shell on any pathname.

---

## Out of scope

- Changing **which** Main items exist (Series, Community) — separate tickets.
- Mobile app navigation.
- Replacing `SermonEditSidebar` with Main nav items (Details/Analytics stay in edit shell).
- Public/auth routes without `DashboardLayout`.
- Forcing top NavBar visible on full-bleed pages (sidebar-only requirement).

---

## Conflicts to resolve

| Existing spec / code | Conflict | Resolution |
| -------------------- | -------- | ------------ |
| [feat-0023](../feat-0023/PRODUCT.md) edit workspace | Implied full-page shell without portal sidebar | **AppSidebar always +** in-page edit sidebar |
| `DashboardLayout` `isStudioSermonWorkspacePath` guard | Unmounts `AppSidebar` | **Remove guard** (feat-0034 B1) |
| [feat-0010](../feat-0010/PRODUCT.md) “except studio sermons canvas override” | Ambiguous top nav vs sidebar | Clarify: **top nav** may hide; **sidebar** does not |

---

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | Layout diagram, files, migration steps |
| [feat-0002 PRODUCT](../feat-0002/PRODUCT.md) | Nav items and roles |
| [feat-0004 PRODUCT](../feat-0004/PRODUCT.md) | Studio URL resolution |
| [feat-0010 PRODUCT](../feat-0010/PRODUCT.md) | Onboarding shell reference |
