# feat-0017: Sermon Analytics — Overview tab (web studio)

> **Figma file:** [Troott `9lFM6TncipSv0pNVGBWZwA`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott). Screenshots: [`assets/README.md`](./assets/README.md) (pacepard-ui-agent, channel `5mtmmnxl`).

## Summary

Replace the placeholder [`Analytics.tsx`](../../../../apps/web/src/app/analytics/Analytics.tsx) with a **Figma-aligned Sermon Analytics** page at `/studio/:studioCode/analytics`. This spec covers the **Overview** primary tab only (empty + populated states from Figma). **Sermon** and **Series** primary tabs are reserved shells for follow-up feats.

Ministers and creators use this surface to review plays, listen time, followers, live listeners, and sermon-level breakdown. The page reuses existing studio shell (sidebar, breadcrumbs) and shadcn primitives composed into **reusable analytics components**.

Related: sidebar nav in [`navdata.tsx`](../../../../apps/web/src/_data/navdata.tsx); tour step 4 in [feat-0016](../feat-0016/PRODUCT.md); sermon context menu stub in [`SermonContextMenu.tsx`](../../../../apps/web/src/components/shared/my-sermons/SermonContextMenu.tsx).

## Problem

| Today | Gap |
| ----- | --- |
| `/studio/:code/analytics` renders `<div>Analytics</div>` | No analytics UX |
| Context menu **Analytics** shows toast “not available yet” | Dead end for creators |
| Figma defines full Overview layout (KPIs, chart, live gauge, breakdown table) | Not implemented |
| Permissions `analytics:read` exist on API | No minister/creator analytics routes wired |

## Consumer

Authenticated **minister** and **creator** with studio access (`INTERNAL_PORTAL_ROLES`), permission **`analytics:read`**.

## Non-goals (this feat)

- **Sermon** and **Series** primary tab content (route + disabled or “Coming soon” only)
- **Create analytics** workflow (modal / wizard) — button visible; action is toast or noop until product defines
- **Share** export (PDF/CSV/link) — toast “Coming soon” unless API exists
- **Add Filters** advanced filter builder — dropdown opens; applying filters deferred
- Real-time WebSocket live-user feed (gauge may poll or show last snapshot)
- Mobile analytics
- Admin-global analytics (studio-scoped only)

Full deferred inventory: [§ Deferred / omitted scope (feat-0018+)](#deferred--omitted-scope-feat-0018).

---

## Figma reference

| State | Node | Link |
| ----- | ---- | ---- |
| Empty (zeros, no table rows) | `9974:29757` | [Overview empty](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=9974-29757) |
| Populated (sample KPIs + 3 sermon rows) | `10408:36417` | [Overview populated](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10408-36417) |

![Overview empty](./assets/overview-empty.png)

![Overview populated](./assets/overview-populated.png)

---

## Route and shell

| Item | Value |
| ---- | ----- |
| URL | `/studio/:studioCode/analytics` |
| Route name | `analytics` ([`studio.route.tsx`](../../../../apps/web/src/routes/studio.route.tsx)) |
| Layout | **DashboardLayout** (same as My Sermons / Dashboard) |
| Breadcrumb | **Sermon Analytics** ([`breadcrumb-map.tsx`](../../../../apps/web/src/components/shared/navigation/breadcrumb-map.tsx)) |
| Page title (in-content) | **Sermon Analytics** + bar-chart icon (20×20) |

Entry points:

1. Sidebar **Analytics** → `/studio/{code}/analytics`
2. Sermon row/grid **⋯ → Analytics** → navigate to analytics (optional `?sermonId=` query for future drill-down; MVP: same Overview)
3. Get Started tour step 4 ([feat-0016](../feat-0016/PRODUCT.md)) — highlights sidebar Analytics

---

## Tab model (critical)

Two **independent** tab systems appear on this page. Do not conflate them.

### 1. Primary page tabs (route-level)

**Labels:** `Overview` | `Sermon` | `Series`

| Property | Spec |
| -------- | ---- |
| Control | Custom **underline tab bar** (Figma `Frame 1618868806`), **not** the default shadcn muted `TabsList` pill style |
| Active indicator | Bottom border `#eaeaea`, 2px; label Matter Medium 14px `#eaeaea` |
| Inactive | No bottom border; same text color |
| Default | **Overview** |
| Behavior (MVP) | **Overview** renders full page below. **Sermon** / **Series** switch tab highlight and show centered muted copy: “Sermon analytics” / “Series analytics — coming soon.” |
| URL (recommended) | `/studio/:code/analytics?tab=overview` \| `sermon` \| `series` — sync tab ↔ query on change (same pattern as optional deep links elsewhere) |

These tabs change **which major analytics view** is shown (future: per-sermon drill-down vs series aggregates).

### 2. Breakdown segmented control (section-level, Overview only)

**Labels:** `top sermon` | `top region` | `top source`

| Property | Spec |
| -------- | ---- |
| Location | Inside **Breakdown by** card header, left of search field |
| Control | shadcn **`ToggleGroup`** `type="single"` or segmented button row on `#333234` track, 8px radius |
| Active segment | Filled `#545454/50` border, text `#eaeaea` |
| Inactive | Text `#bdbdbd` |
| Default | **top sermon** |
| Behavior | Switches breakdown table **dimension** (sermon rows vs region rows vs source rows). MVP: only **top sermon** has column schema from Figma; other segments show same table shell with empty state copy “No data for this breakdown yet.” |

This is **not** a primary tab — it filters the breakdown table only.

---

## Page regions (Overview tab)

Top-to-bottom inside the analytics content column (`max-w-[1200px]` or full width with `px-6` padding matching Figma 16px gutters).

### A. Page header row

| Element | Figma | Action |
| ------- | ----- | ------ |
| Icon + title | Bar chart icon + “Sermon Analytics” | Static |
| **⋯** (dots) | Header overflow | Opens **DropdownMenu**: Export report (disabled), Refresh data, Help — MVP: toast “Coming soon” except **Refresh** triggers query refetch |
| **Share** | Outline button, share icon | Click → toast “Share is not available yet” (or copy studio analytics URL when API ready) |
| **Create analytics** | Primary `#08ffdb`, plus icon | Click → toast “Create analytics is not available yet” |

### B. Primary tabs row

See § Primary page tabs. Full width under header border `#545454/50`.

### C. Filter bar

| Element | Position | Action |
| ------- | -------- | ------ |
| **Add Filters** | Left | **DropdownMenu** trigger: filter icon + label + chevron. Items (MVP placeholders): Sermon, Series, Region, Source — selecting shows toast “Filters coming soon”; no persisted filter state |
| **Daily** | Right | **DropdownMenu**: Daily, Weekly, Monthly. Changes chart aggregation granularity; refetch overview series with `granularity` param |
| **Last 30 days** | Right | **DropdownMenu**: Last 7 days, Last 30 days, Last 90 days, Custom (disabled). Changes date range; refetch all overview widgets |

Filter changes reset breakdown search and re-fetch KPIs + chart + table.

### D. Stats row (two-column grid)

| Card | Width | Content |
| ---- | ----- | ------- |
| **Your Sermon Stats** | ~66% (`789px` in Figma) | KPI strip + line chart |
| **Current Live Users** | ~33% (`353px`) | Gauge + footer metrics |

#### D1. Your Sermon Stats card

**Card chrome:** `#2b2a2c` fill, `#545454/50` border, 12px radius.

**Title:** “Your Sermon Stats” (16px medium).

**KPI insight cards** (3× reusable `AnalyticsInsightCard`):

| KPI | Empty value | Populated example | Delta badge |
| --- | ----------- | ----------------- | ------------- |
| Plays | `0` | `12` | `▼ 0%` red / `▲ 2%` green |
| Listen time (hrs) | `0` | `120` | `▼ 0%` / `▼ 12%` |
| Followers | `0` | `89` | `▼ 0%` / `▲ 8%` |

Each insight card shows:

- Label (14px `#bdbdbd`)
- Value (20px medium `#eaeaea`)
- Delta pill: green `#1a4d3a`-style bg for up, red `#8f3628` for down; arrow + percent
- Subtext: “From mar 31” (compare period label from API)

**Line chart:**

- Y-axis 0–100 (auto-scale when API returns higher max)
- X-axis daily labels (Mar 31 … Apr 30 for 30-day range)
- Series line `#7086fd`, horizontal grid `#545454/50`
- Empty: flat line at 0
- Tooltip on hover (shadcn chart tooltip pattern)

#### D2. Current Live Users card

**Header:** blue live dot (`#2383e0`) + “Current Live Users” + subtitle “Realtime” + **⋯** menu (Refresh, About live metrics).

**Gauge:** semicircle 0–100; needle position = live listener count (capped at 100 for display or scale label).

**Footer metrics:**

| Label | Empty | Populated |
| ----- | ----- | --------- |
| New Followers | `0` | `23` (+ green accent bar) |
| Avg. play duration | `0s` | `23` (format as duration when API provides seconds) |

### E. Breakdown by section (full width)

**Card header row:**

| Element | Action |
| ------- | ------ |
| “Breakdown by” title | Static |
| Segmented control | See § Breakdown segmented control |
| **Search analysis** | **Input** with search icon; debounced 300ms (match [`MySermons.tsx`](../../../../apps/web/src/app/sermons/MySermons.tsx)); filters current breakdown rows client-side MVP |
| **⋯** | Export table CSV (disabled), Column visibility (disabled) |

**Table columns** (top sermon segment):

| Column | Empty | Populated row example |
| ------ | ----- | --------------------- |
| Checkbox | Unchecked | Per-row select |
| Sermon | “No Data” | Thumbnail + title + date (e.g. “Heroes of Faith”, “Nov 27, 2025”) |
| Plays | `-` | `8` |
| Impressions | `-` | `9` |
| Unique Listeners | `-` | `2` |
| Total Listening Time | `-` | `00:01:18` |
| Avg. Listening Time | `-` | `20%` |

**Empty table body:** single row “No Data” + centered helper “No data to show yet.” (12px `#bdbdbd`).

**Row click:** navigate to `/studio/:code/sermons/:sermonId` or future Sermon tab with id (MVP: optional, same as My Sermons row open).

**Bulk checkbox:** header selects visible rows; bulk actions deferred (menu disabled).

---

## User actions (use cases)

### UC-A01 — Open analytics from sidebar

| Step | Actor | Action | Result |
| ---- | ----- | ------ | ------ |
| 1 | Minister/Creator | Click **Analytics** in sidebar | Navigate to `/studio/{code}/analytics?tab=overview` |
| 2 | System | Load overview query | Show loading skeletons on cards |
| 3 | System | API returns empty | Empty state per Figma `9974:29757` |
| 4 | System | API returns data | Populated state per `10408:36417` |

### UC-A02 — Change date range

| Step | Action | Result |
| ---- | ------ | ------ |
| 1 | User opens **Last 30 days** dropdown | Menu shows presets |
| 2 | User selects **Last 7 days** | Label updates; all KPIs, chart, breakdown refetch with `dateFrom`/`dateTo` |
| 3 | Chart X-axis labels adapt to range | |

### UC-A03 — Change chart granularity

| Step | Action | Result |
| ---- | ------ | ------ |
| 1 | User opens **Daily** dropdown | Weekly / Monthly options |
| 2 | User selects **Weekly** | Line chart buckets by week; KPI compare text updates |

### UC-A04 — Switch breakdown segment

| Step | Action | Result |
| ---- | ------ | ------ |
| 1 | User on **top sermon** (default) | Sermon column visible |
| 2 | User clicks **top region** | Segment highlights; table columns → Region, Plays, … (MVP: empty state message) |
| 3 | User clicks **top source** | Same pattern for traffic source dimension |

### UC-A05 — Search breakdown

| Step | Action | Result |
| ---- | ------ | ------ |
| 1 | User types in **Search analysis** | Debounce 300ms |
| 2 | Filter rows by sermon title (client MVP) | Rows not matching hidden |
| 3 | Clear search | All rows return |

### UC-A06 — Refresh data

| Step | Action | Result |
| ---- | ------ | ------ |
| 1 | User opens header **⋯** → Refresh | `queryClient.invalidateQueries` on analytics keys |
| 2 | Live users card refetches | Gauge animates to new value |

### UC-A07 — Primary tab Sermon / Series (MVP)

| Step | Action | Result |
| ---- | ------ | ------ |
| 1 | User clicks **Sermon** tab | URL `?tab=sermon`; placeholder panel |
| 2 | User clicks **Overview** | Full overview restored |

### UC-A08 — Open from sermon context menu

| Step | Action | Result |
| ---- | ------ | ------ |
| 1 | User on My Sermons → **⋯ → Analytics** | Navigate to `/studio/{code}/analytics?tab=overview` (optional `sermonId` query stored for future Sermon tab) |
| 2 | Toast removed | No “not available yet” toast |

---

## States and edge cases

| State | UI |
| ----- | --- |
| Loading | Skeleton on KPI cards, chart area, gauge, table (shadcn **Skeleton**) |
| Error | Sonner toast + inline retry on stats card ([`MySermons`](../../../../apps/web/src/app/sermons/MySermons.tsx) error pattern) |
| No studio code | Redirect via [`StudioPortal`](../../../../apps/web/src/app/studio/StudioPortal.tsx) |
| Onboarding incomplete | Existing studio guard → `/get-started` |
| Permission denied | 403 from API → full-page “You don’t have access to analytics” |
| Partial API failure | KPIs load but breakdown fails → chart/KPI ok, table shows error row |

---

## Deferred / omitted scope (feat-0018+)

This feat is **Overview tab UI + studio wiring + data hooks**. Everything below is **out of scope** for feat-0017 unless explicitly pulled in.

### Primary tabs and Figma

| Deferred | MVP in feat-0017 |
| -------- | ---------------- |
| **Sermon** tab — per-sermon drill-down, charts, filters | Placeholder copy only (`?tab=sermon`) |
| **Series** tab — series aggregates | Placeholder copy only (`?tab=series`) |
| Figma frames beyond Overview empty / populated (`9974:29757`, `10408:36417`) | Not in this feat |
| `?sermonId=` deep link opens filtered Sermon tab | Param accepted; Overview unchanged |

### Breakdown dimensions

| Deferred | MVP in feat-0017 |
| -------- | ---------------- |
| **top region** — column schema, rows, sorting | Segmented control + empty helper |
| **top source** — column schema, rows, sorting | Segmented control + empty helper |
| Breakdown pagination | Not specified |
| Server-side breakdown search | Client filter on sermon title only |
| Bulk row actions (export selected, etc.) | Checkboxes only; no bulk menu |

### Header and filter actions

| Deferred | MVP in feat-0017 |
| -------- | ---------------- |
| **Create analytics** wizard / modal | Toast “not available yet” |
| **Share** — PDF, CSV, public link | Toast “not available yet” |
| **Add Filters** — apply + persist filters | Menu + toast; no filter state |
| **Custom** date range picker | Menu item disabled |
| Header **Export report** | Disabled / toast |
| Table **Export CSV** / **Column visibility** | Disabled |
| **Help** / **About live metrics** copy | Toast or disabled |

### Platforms and personas

| Deferred | Notes |
| -------- | ----- |
| Mobile analytics | Web studio only |
| Admin / cross-studio analytics | Studio-scoped route only |
| Listener analytics | Ministers and creators only |
| Comments & Feedback (nav placeholder) | Separate feat |

### Data and backend

| Deferred | Notes |
| -------- | ----- |
| `apps/api` analytics routes (`GET …/overview`, `GET …/breakdown`) | Proposed in [TECH.md](./TECH.md); stub on web until shipped |
| Real-time WebSocket live-user feed | Poll or last snapshot |
| Figma sample numbers in production | Empty zeros when API has no data |
| `analytics:update`, `analytics:export` permission flows | View uses `analytics:read` only |
| Custom compare period UI | KPI subtext “From {date}” from API label only |

### Product adjacent (other feats)

| Item | Owner spec |
| ---- | ---------- |
| Interactive studio tour (step 4 → Analytics) | [feat-0016](../feat-0016/PRODUCT.md) |
| Onboarding gate before studio | [feat-0010](../feat-0010/PRODUCT.md) |
| Playback / event ingestion pipeline | [`apps/api/src/_specs/playback.md`](../../../../apps/api/src/_specs/playback.md) |
| Product analytics instrumentation (PostHog, etc.) | Not specified |

### Suggested follow-up feats (informal)

| ID | Scope |
| -- | ----- |
| feat-0018 | Sermon primary tab + `sermonId` deep link |
| feat-0019 | Series primary tab |
| feat-0020 | Breakdown region + source dimensions |
| feat-0021 | API analytics overview + breakdown endpoints |
| feat-0022 | Share / export / create analytics |

---

## Acceptance criteria

- [ ] `/studio/:code/analytics` matches Figma Overview layout for empty and populated data
- [ ] **Two tab systems** implemented distinctly: primary underline tabs vs breakdown segmented control
- [ ] Reusable components under `components/shared/analytics/` (no one-off page-only markup)
- [ ] Filter bar controls update query params and refetch overview data
- [ ] Breakdown search debounced 300ms
- [ ] Sermon context menu **Analytics** navigates to analytics route
- [ ] Share / Create analytics / Add filters show explicit coming-soon or noop — not silent failures
- [ ] Loading and error states match My Sermons patterns
- [ ] Dark theme tokens align with studio (`#2b2a2c`, `#08ffdb` primary, `#545454` borders)

---

## Copy deck (Overview)

| Key | Text |
| --- | ---- |
| `page.title` | Sermon Analytics |
| `tab.overview` | Overview |
| `tab.sermon` | Sermon |
| `tab.series` | Series |
| `filter.add` | Add Filters |
| `filter.granularity.daily` | Daily |
| `filter.range.30d` | Last 30 days |
| `cta.share` | Share |
| `cta.create` | Create analytics |
| `stats.title` | Your Sermon Stats |
| `kpi.plays` | Plays |
| `kpi.listenHours` | Listen time (hrs) |
| `kpi.followers` | Followers |
| `kpi.compareFrom` | From {date} |
| `live.title` | Current Live Users |
| `live.subtitle` | Realtime |
| `live.newFollowers` | New Followers |
| `live.avgDuration` | Avg. play duration |
| `breakdown.title` | Breakdown by |
| `breakdown.segment.sermon` | top sermon |
| `breakdown.segment.region` | top region |
| `breakdown.segment.source` | top source |
| `breakdown.searchPlaceholder` | Search analysis |
| `breakdown.emptyRow` | No Data |
| `breakdown.emptyHelper` | No data to show yet. |
| `placeholder.sermonTab` | Sermon-level analytics — coming soon. |
| `placeholder.seriesTab` | Series analytics — coming soon. |
