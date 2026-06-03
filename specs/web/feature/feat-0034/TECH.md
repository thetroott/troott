# feat-0034: Tech — Dashboard sidebar always visible

## Context

See [PRODUCT.md](./PRODUCT.md). Canonical UI = **`AppSidebar`** during Get Started ([feat-0010](../feat-0010/PRODUCT.md)).

---

## Layout target

```text
┌─────────────────────────────────────────────────────────────┐
│ DashboardLayout (all internal portal routes)                 │
├──────────────┬──────────────────────────────────────────────┤
│ AppSidebar   │  Optional NavBar (may hide on full-bleed)     │
│ (ALWAYS)     ├──────────────────────────────────────────────┤
│              │  Main content                                 │
│ Logo         │    └─ SermonEditPage + SermonEditSidebar      │
│ Search       │       (secondary nav — NOT a replacement)     │
│ Main nav     │                                               │
│ Footer       │                                               │
└──────────────┴──────────────────────────────────────────────┘
```

**Today (bug):** on `isStudioSermonWorkspacePath`, left column is empty — only `SermonEditSidebar` inside `<main>`.

---

## Root cause

[`DashboardLayout.tsx`](../../../apps/web/src/components/layouts/DashboardLayout.tsx):

```tsx
{!isStudioSermonWorkspacePath(pathname) ? (
  <AppSidebar userRole={sidebarUserTypeFromCookie()} />
) : null}
```

[`paths.ts`](../../../apps/web/src/routes/paths.ts) — workspace regex:

```ts
/^\/studio\/[^/]+\/sermons\/[^/]+\/(edit|analytics)\/?$/i
```

Added for [feat-0022](../feat-0022/SERMON_EDIT_SPEC.md) / [feat-0023](../feat-0023/PRODUCT.md) full-bleed edit shell. Side effect: **portal sidebar removed**.

---

## Implementation checklist

| # | Task | File |
| - | ---- | ---- |
| 1 | **Delete** `AppSidebar` unmount guard — no flag, no fallback branch ([PRODUCT § No legacy](./PRODUCT.md#no-fallback-no-legacy-hard-requirement)) | `DashboardLayout.tsx` |
| 2 | Adjust `SermonEditPage` layout so content fits beside **persistent** `AppSidebar` (flex, min-width) | `SermonEditPage.tsx`, `sermon-edit-ui.ts` |
| 3 | Verify `SermonEditSidebar` width does not overlap `AppSidebar` at lg breakpoints | `SermonEditSidebar.tsx` |
| 4 | Confirm full-bleed background still applies to **main** only, not sidebar | `DashboardLayout.tsx` |
| 5 | Regression: upload wizard `/sermons/upload/**` still shows sidebar (already did) | manual |
| 6 | Regression: `/get-started` sidebar unchanged | manual |
| 7 | Update [feat-0023 TECH](../feat-0023/TECH.md) cross-link — edit shell uses dual sidebars | docs |

---

## Nav data (unchanged)

Source: [`navdata.tsx`](../../../apps/web/src/_data/navdata.tsx)

**Main items (minister/creator):**

| Title | Legacy url | Resolved target |
| ----- | ---------- | --------------- |
| Get Started | `/get-started` | passthrough |
| Dashboard | `/dashboard` | `/studio/{code}` |
| Sermons | `/sermons` | `/studio/{code}/sermons` |
| Analytics | `/analytics` | `/studio/{code}/analytics` |
| Bin | `/bin` | `/studio/{code}/bin` |
| Profile | `/profile` | passthrough |
| Settings | `/settings` | passthrough |

Filtering: [`Sidebar.tsx`](../../../apps/web/src/components/shared/navigation/Sidebar.tsx) + [`sidebar-nav.util.ts`](../../../apps/web/src/utils/sidebar-nav.util.ts).

**Do not** re-enable commented `sermonNav` / `engagementNav` items without product approval — empty groups must stay omitted (feat-0002 B18).

Legacy `url` values in `navdata.tsx` (e.g. `/dashboard`) are **resolution inputs only** — sidebar links must always emit studio-scoped hrefs via `resolveStudioNavUrl`; never link users to legacy paths as a fallback when code is missing (use disabled + tooltip per feat-0002).

---

## No fallback, no legacy (implementation)

See [PRODUCT § No fallback, no legacy](./PRODUCT.md#no-fallback-no-legacy-hard-requirement).

| Rule | Implementation |
| ---- | ---------------- |
| Single shell | One `DashboardLayout` tree; `AppSidebar` unconditional |
| Delete, don’t branch | Remove ternary — do not add `showPortalSidebar && …` |
| `isStudioSermonWorkspacePath` | OK for NavBar hide / main full-bleed — **forbidden** for sidebar mount |
| Edit workspace | `SermonEditSidebar` stays in page content — never swapped into sidebar slot |
| Verification | `rg 'isStudioSermonWorkspacePath' DashboardLayout` — no guard around `AppSidebar` |

**Prohibited after merge:**

```tsx
// WRONG — do not keep as fallback
{!isStudioSermonWorkspacePath(pathname) ? <AppSidebar /> : <SermonEditSidebar />}
{!isStudioSermonWorkspacePath(pathname) ? <AppSidebar /> : null}
{process.env.NEXT_PUBLIC_LEGACY_EDIT_SHELL ? null : <AppSidebar />}
```

**Required:**

```tsx
<AppSidebar userRole={sidebarUserTypeFromCookie()} />
```

---

## Onboarding gating (unchanged logic, stable chrome)

| Helper | Role |
| ------ | ---- |
| `shouldShowGetStartedNavItem` | Filters Get Started item |
| `shouldRedirectStudioNavForOnboarding` | Toast + navigate instead of studio link |
| `resolveStudioNavUrl` + `useSidebarStudioCode` | Studio hrefs ([feat-0004](../feat-0004/PRODUCT.md)) |

Sidebar **must not** hide items when onboarding blocks navigation — use button + toast pattern already in `Sidebar.tsx` (`blockForOnboarding` branch).

---

## Visual parity checklist (onboarding = reference)

| Element | Selector / component | Must match on all routes |
| ------- | -------------------- | ------------------------ |
| Logo | `SidebarHeader` img + “troott” | yes |
| Search | `SearchForm` | yes |
| Group label | “Main” uppercase muted | yes |
| Item height | `h-9` menu buttons | yes |
| Collapsed mode | `collapsible="icon"` | yes |
| Footer | Logout + Install | yes |
| Active state | `data-[active=true]:bg-white/10` | yes |

---

## Tests

| Test | Type | Assert |
| ---- | ---- | ------ |
| DashboardLayout renders sidebar on edit path | component | `AppSidebar` present when pathname `/studio/x/sermons/y/edit` |
| visibleGroups includes Main items for minister | unit | `shouldShowGetStartedNavItem` / group filter |
| `isStudioSermonWorkspacePath` no longer gates sidebar | component | after fix |
| No sidebar-less fallback branch | static / grep | `DashboardLayout.tsx` has no conditional around `AppSidebar` |

Suggested location: `apps/web/src/components/layouts/DashboardLayout.test.tsx` (new).

**Merge gate:** `rg -n 'isStudioSermonWorkspacePath.*AppSidebar|AppSidebar.*isStudioSermonWorkspacePath' apps/web/src/components/layouts/DashboardLayout.tsx` → no matches.

---

## QA script

1. Sign in as minister with incomplete onboarding → `/get-started` → screenshot sidebar.
2. Open `/studio/{code}` → sidebar identical except onboarding link behavior.
3. Complete onboarding → Get Started disappears; other items unchanged.
4. Open sermon edit → **sidebar still visible** (feat-0034 fix).
5. Collapse sidebar → navigate across routes → collapse state persists.
6. Creator account — repeat steps 1–4.

---

## Related code map

| Concern | Path |
| ------- | ---- |
| Layout shell | `apps/web/src/components/layouts/DashboardLayout.tsx` |
| Portal sidebar | `apps/web/src/components/shared/navigation/Sidebar.tsx` |
| Nav config | `apps/web/src/_data/navdata.tsx` |
| Studio URLs | `apps/web/src/utils/studio-nav.util.ts` |
| Studio code hook | `apps/web/src/hooks/shared/useSidebarStudioCode.ts` |
| Onboarding block | `apps/web/src/utils/hub-onboarding.util.ts` |
| Edit secondary nav | `apps/web/src/components/shared/sermon/SermonEditSidebar.tsx` |
| Workspace path helper | `apps/web/src/routes/paths.ts` → `isStudioSermonWorkspacePath` |
