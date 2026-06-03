# feat-0023: Single sermon **Analytics** — row menu, edit sidebar, and scoped analytics tab

## Summary

Studio users open **one sermon’s analytics** from:

1. **My Sermons** — row/card three-dot menu → **Analytics**
2. **Sermon details** edit page — left column → **Analytics** (`SermonEditSidebar`)

Both entry points open **single-sermon analytics inside the sermon edit workspace**: **`/studio/{studioCode}/sermons/{sermonId}/analytics`**, with **`SermonEditSidebar`** visible (same shell as **Details**). The main column reuses analytics UI components (filter bar, KPI cards, line chart) scoped to that sermon. The studio-wide route **`/studio/{code}/analytics`** remains for minister overview only.

---

## REFERENCE — Studio analytics (`/analytics`)

### Figma

| Artifact | Link | Role |
| --- | --- | --- |
| **Single sermon analytics** (normative target) | [Figma `10408:36417`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10408-36417&t=Mfvz2zYzXiLlakBE-4) | Sermon header, KPI row, chart, secondary tables for one sermon |
| **Analytics overview shell** | [Figma `9974:29757`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=9974-29757&t=Mfvz2zYzXiLlakBE-4) | Page chrome: title “Sermon Analytics”, primary tabs, filter bar, card layout |

### Code reference (reuse, do not fork styles)

| Overview building block | Path |
| --- | --- |
| Page host + tabs | `apps/web/src/app/analytics/Analytics.tsx` |
| Overview tab body | `apps/web/src/app/analytics/AnalyticsOverview.tsx` |
| Header actions | `components/shared/analytics/AnalyticsPageHeader.tsx` |
| Overview / Sermon / Series tabs | `components/shared/analytics/AnalyticsPrimaryTabs.tsx` |
| Date range + granularity | `components/shared/analytics/AnalyticsFilterBar.tsx` |
| KPI + line chart | `components/shared/analytics/AnalyticsStatsChartCard.tsx` |
| Live users card | `components/shared/analytics/AnalyticsLiveUsersCard.tsx` |
| Breakdown table (overview only) | `components/shared/analytics/AnalyticsBreakdownSection.tsx` |
| Panel chrome | `components/shared/analytics/analytics-ui.ts` (`analyticsPanelClass`) |
| Layout shell | `MY_SERMONS_PAGE` from `my-sermons-ui.tsx` (edge-to-edge canvas) |

### Figma → Troott mapping (single sermon view)

| Figma region (`10408:36417`) | Troott implementation |
| --- | --- |
| Back / context (“Channel content” / library) | Link: **My Sermons** or **Sermon details** (see [Back navigation](#back-navigation)) |
| Sermon thumbnail + title in header | `SermonAnalyticsHeader` — `useSermonByIdQuery(sermonId)` + list row thumbnail rules |
| Date range + granularity | `AnalyticsFilterBar` (same presets: `7d` / `30d` / `90d`; `daily` / `weekly` / `monthly`) |
| KPI tiles (plays, listen time, etc.) | `AnalyticsInsightCard` grid inside `AnalyticsStatsChartCard` or sermon-specific wrapper |
| Performance chart | `AnalyticsLineChart` with sermon-scoped series |
| Secondary breakdown (region / source) | Optional v1: hide or reuse breakdown API with `sermonId` + `dimension=region|source` |
| Primary tabs (Overview / Sermon / Series) | `AnalyticsPrimaryTabs` — **Sermon** tab active; switching **Overview** clears `sermonId` |

---

## Problem

| Area | Today | Gap |
| --- | --- | --- |
| Row **Analytics** | `SermonsTable.handleAnalytics` → `/analytics?tab=overview&sermonId=…` | Wrong tab; overview does not read `sermonId` |
| **Sermon** tab | `AnalyticsTabPlaceholder` — “coming soon” | No sermon-scoped UI |
| Edit sidebar **Analytics** | `SermonEditSidebar` links to `studioAnalyticsPath(code)` only | Missing `sermonId` + `tab=sermon` |
| Breakdown row click | Navigates to `/studio/{code}/sermons/{row.id}` | Should open sermon analytics |
| API | `GET .../analytics/overview`, `.../breakdown` | No documented `sermonId` filter for single-sermon series |

---

## Goals

1. One **normative URL** for single-sermon analytics shared by row menu and edit sidebar.
2. Visual **parity** with overview analytics (same tokens, filters, cards) per Figma `9974:29757` + `10408:36417`.
3. **Sermon** primary tab hosts the scoped view when `sermonId` is set.
4. **Breakdown** table on Overview drills into the same sermon URL.
5. Clear **empty / error / loading** behavior; bin and unauthorized sermons handled.

## Non-goals (v1)

- **Bin** row menu **Analytics** (restore first).
- Listener/public analytics pages.
- Export CSV / share report (header actions stay disabled or toast stubs until product enables).
- Real-time websocket live chart (reuse existing live card with sermon-scoped data when API supports).
- **Series**-level analytics (`tab=series`) — placeholder remains.
- Replacing global **Overview** KPIs when no `sermonId` is present.

---

## Surfaces and entry points

| Entry | Route / UI | Opens sermon analytics? | Notes |
| --- | --- | --- | --- |
| Row menu **Analytics** | `/studio/{code}/sermons` | **Yes** | `SermonContextMenu` → `onAnalytics(sermonId)` |
| Edit sidebar **Analytics** | `/studio/{code}/sermons/:id/edit` | **Yes** | `SermonEditSidebar` — leaves edit layout for analytics route |
| Overview breakdown row | `/studio/{code}/analytics?tab=overview` | **Yes** | Row click → sermon URL (replaces legacy `/sermons/:id` nav) |
| Primary tab **Sermon** (no id) | `/analytics?tab=sermon` | **Partial** | Show picker or empty state: “Select a sermon from My Sermons or the breakdown table” |
| **Bin** row menu | `/studio/{code}/bin` | **No** | Same as **Edit** — not in `BinContextMenu` |
| **Get info** | `/sermons`, `/bin` | **No** | feat-0020 read-only dialog |

---

## Row three-dot menu — **Analytics** (My Sermons)

Normative order in `SermonContextMenu` (after Share/Download block):

```
Get info          (feat-0020)
────────
Edit
Rename
────────
Share
Download
Analytics          ← this spec
────────
Move to trash
```

| Property | Value |
| --- | --- |
| Label | **Analytics** |
| Icon | `BarChart3` (lucide-react), consistent stroke/size with other items |
| Handler | `onAnalytics(sermonId)` |

### Navigation contract (normative)

```ts
navigate(studioSermonAnalyticsPath(studioCode, sermonId));
// => /studio/{code}/sermons/{sermonId}/analytics
```

| Path segment | Rule |
| --- | --- |
| `sermonId` | Mongo sermon id (URL path, not query) |

**Implementation note:** Current `SermonsTable` uses `tab=overview` — treat as **bug**; implementation must match this spec.

### Disabled / hidden rules

| Condition | **Analytics** menu item |
| --- | --- |
| Sermon in **bin** | Hidden (not on bin page) |
| Placeholder/demo row (get-started grid) | Hidden unless real handler wired |
| User lacks read access to sermon | Navigate then error state on analytics page (403 from detail fetch) |
| Draft, processing, unpublished | **Enabled** — show zeros or “No plays yet” empty copy, not disabled |

---

## Sermon edit sidebar — **Analytics**

Host: `SermonEditPage` + `SermonEditSidebar` (feat-0022, Figma `11574:98157`).

| Property | Value |
| --- | --- |
| Label | **Analytics** |
| Icon | `BarChart3` |
| Control | `<Link to={studioSermonAnalyticsPath(code, sermonId)}>` |
| Active state | `activeSection === 'analytics'` on `/sermons/:sermonId/analytics` |
| **Details** | `<Link to={studioSermonEditPath(...)}>`; active on `/sermons/:sermonId/edit` |

Sidebar nav order (normative, matches edit spec):

```
[Back] My Sermons
[Preview thumbnail + title]
Details          (current page on edit route)
Analytics          ← this spec (link out to /analytics)
Editor             (replace audio — in-page action)
Comments           (disabled v1)
…
```

**Parity rule:** Sidebar **Analytics** and row menu **Analytics** MUST produce identical URLs for the same `sermonId`.

---

## Route and page behavior

### Base path

`/studio/{studioCode}/analytics`

Registered in `studio.route.tsx` → `Analytics` component.

### Tab routing

| `tab` query | `sermonId` | Rendered content |
| --- | --- | --- |
| `overview` (default) | absent | `AnalyticsOverview` — minister-wide KPIs + breakdown table |
| `overview` | present | **Ignore** `sermonId` on overview, **or** auto-redirect to `tab=sermon` (prefer redirect for consistency) |
| `sermon` | present | **`AnalyticsSermonView`** (new) — single-sermon layout per Figma `10408:36417` |
| `sermon` | absent | Empty state + link to My Sermons |
| `series` | any | `AnalyticsTabPlaceholder` (unchanged v1) |

### `studioSermonAnalyticsPath` (normative helper)

Add to `apps/web/src/routes/paths.ts`:

```ts
export function studioSermonAnalyticsPath(
  studioCode: string,
  sermonId: string,
): string {
  const base = studioAnalyticsPath(studioCode);
  const params = new URLSearchParams({
    tab: 'sermon',
    sermonId: sermonId.trim(),
  });
  return `${base}?${params.toString()}`;
}
```

---

## `AnalyticsSermonView` — UI specification

New component: `apps/web/src/app/analytics/AnalyticsSermonView.tsx` (or `components/shared/analytics/`).

### Layout

- Parent: `Analytics.tsx` already applies `MY_SERMONS_PAGE` full-bleed shell.
- Vertical stack (`space-y-4`), same as `AnalyticsOverview`.

### Sections (top → bottom)

1. **Sermon context header** (Figma `10408:36417` top band)
   - Thumbnail (46×46 or 64×64 per Figma QA), title, preached/created date, duration, status pill (`draft` / `published`).
   - Data: `GET /api/v1/sermon/:id` via `useSermonByIdQuery`.
   - Actions (optional v1): **Edit** → `studioSermonEditPath(code, sermonId)`; **Share** (copy share link, same as list).

2. **Filter bar** — `AnalyticsFilterBar` (shared state local to sermon view).

3. **KPI + chart row** — same grid as overview (`lg:grid-cols-3`):
   - `AnalyticsStatsChartCard` fed with **sermon-scoped** `AnalyticsOverviewResponse` shape.
   - `AnalyticsLiveUsersCard` optional for v1 if API has no live slice — hide or show “—”.

4. **Secondary panels** (v1 optional)
   - Table: region / source breakdown for this sermon only, when API supports `sermonId` on breakdown endpoint.
   - Otherwise omit (do not show overview-wide breakdown on sermon tab).

### Page-level header

Keep global `AnalyticsPageHeader` (“Sermon Analytics”) above tabs on all analytics routes. Do not rename per sermon in v1 (Figma `9974:29757`); sermon title lives in **Sermon context header** below tabs.

### Primary tabs interaction

- User on sermon view clicks **Overview** → `setSearchParams({ tab: 'overview' })` and **remove** `sermonId`.
- User on overview clicks **Sermon** without `sermonId` → show empty state (no auto-pick).

---

## Back navigation

| User arrived from | Preferred back target |
| --- | --- |
| Row menu on My Sermons | `studioSermonsListPath(code)` |
| Edit sidebar | `studioSermonEditPath(code, sermonId)` |
| Overview breakdown row | Stay on analytics; **Overview** tab or browser back |

Optional v1: `location.state.from === 'edit' | 'list'` set on `navigate()` from menu/sidebar for a single **Back** link label (“Back to sermon details” vs “Back to My Sermons”).

---

## Data and API

### Existing endpoints (studio-wide)

| Method | Path | Used for |
| --- | --- | --- |
| `GET` | `/api/v1/studios/:studioCode/analytics/overview` | Overview tab KPIs + chart |
| `GET` | `/api/v1/studios/:studioCode/analytics/breakdown` | Overview breakdown (`dimension=sermon|region|source`) |

### Required for sermon scope (v1 target)

One of:

| Option | Contract |
| --- | --- |
| **A (preferred)** | `GET /api/v1/studios/:studioCode/analytics/sermons/:sermonId/overview?dateFrom&dateTo&granularity` → same body shape as `AnalyticsOverviewResponse` |
| **B** | Extend overview + breakdown with optional `sermonId` query param |

Until live API exists:

| Behavior | Rule |
| --- | --- |
| Header/metadata | Real data from `GET /sermon/:id` |
| KPIs / chart | May use breakdown row for selected sermon from last overview fetch **or** `emptyAnalyticsOverview` with sermon title in header only |
| Error banner | “Analytics for this sermon are not available yet” if sermon fetch fails |

### TypeScript

Extend `AnalyticsOverviewParams` (or add `AnalyticsSermonOverviewParams`) with optional `sermonId?: string` when Option B is chosen.

Query keys: `analyticsQueryKeys.sermonOverview(studioCode, sermonId, params)`.

---

## Overview breakdown — drill-down

**Normative:** `AnalyticsBreakdownSection.handleRowClick` for `dimension === 'sermon'`:

```ts
navigate(studioSermonAnalyticsPath(studioCode, row.id));
```

Remove navigation to `/studio/{code}/sermons/{id}` (legacy placeholder).

---

## States

| State | UX |
| --- | --- |
| Loading sermon metadata | Skeleton header + skeleton cards |
| Sermon 404 / 403 | Full-width message + link to My Sermons |
| Analytics API loading | Skeleton inside KPI/chart cards |
| Analytics API error | Toast + inline retry on sermon view |
| Zero plays in range | KPIs show `0`; chart flat line; copy: “No plays in this period” |
| Invalid `sermonId` param | Redirect to `?tab=sermon` empty state |

---

## Accessibility

- Page title remains “Sermon Analytics” (document title may append sermon name when loaded).
- Tab list: `AnalyticsPrimaryTabs` — **Sermon** tab `aria-selected` when active.
- Sermon header: thumbnail `alt=""` decorative; title in `<h2>`.
- Charts: provide numeric summary in KPI cards for screen readers (existing insight cards).

---

## Acceptance criteria

1. From My Sermons, **Analytics** opens `/studio/{code}/analytics?tab=sermon&sermonId={id}`.
2. From Sermon details sidebar, **Analytics** opens the **same URL**.
3. **Sermon** tab shows sermon header + filters + KPI/chart using overview components and Figma `10408:36417` structure.
4. **Overview** tab unchanged when no `sermonId`.
5. Breakdown sermon row opens sermon analytics URL.
6. Bin has no **Analytics** action.
7. Layout is edge-to-edge like `/sermons` (`MY_SERMONS_PAGE` shell).

---

## Gap register (implementation vs spec)

| ID | Item | Owner | Status |
| --- | --- | --- | --- |
| G-01 | `SermonsTable` uses `tab=overview` + unused `sermonId` | Web | Done — `studioSermonAnalyticsPath` |
| G-02 | `SermonEditPage` `analyticsPath` missing `sermonId` | Web | Done |
| G-03 | `Analytics.tsx` `tab=sermon` is placeholder | Web | Done — `AnalyticsSermonView` |
| G-04 | No sermon-scoped analytics API | API | Open — v1 uses breakdown row + `GET /sermon/:id` |
| G-05 | Breakdown row navigates to wrong route | Web | Done |
| G-06 | Sidebar Analytics has no active-state when on analytics URL | Web | Deferred — sidebar only on edit route |

---

## Related specs

- [feat-0022 SERMON_EDIT_SPEC.md](../feat-0022/SERMON_EDIT_SPEC.md) — edit sidebar nav including **Analytics**
- [feat-0020 SERMON_GET_INFO_SPEC.md](../feat-0020/SERMON_GET_INFO_SPEC.md) — metadata dialog vs analytics
- [feat-0019 BIN_UI_PARITY_SPEC.md](../feat-0019/BIN_UI_PARITY_SPEC.md) — bin menu exclusions
