# feat-0017: Tech Spec — Sermon Analytics Overview (web studio)

## Context

See [`PRODUCT.md`](./PRODUCT.md). Implements Figma nodes [`9974:29757`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=9974-29757) (empty) and [`10408:36417`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10408-36417) (populated).

Figma channel: `5mtmmnxl` (pacepard-ui-agent).

---

## Route

Already registered in [`apps/web/src/routes/studio.route.tsx`](../../../../apps/web/src/routes/studio.route.tsx):

```text
/studio/:studioCode/analytics  →  Analytics.tsx  (replace implementation)
```

Constants: [`PATH_SEG_ANALYTICS`](../../../../apps/web/src/routes/paths.ts), [`studioNavPath`](../../../../apps/web/src/utils/studio-nav.util.ts) for `/analytics`.

Query params (add):

| Param | Values | Default |
| ----- | ------ | ------- |
| `tab` | `overview` \| `sermon` \| `series` | `overview` |
| `sermonId` | UUID | optional — from context menu deep link |

---

## File map (target)

| Concern | Path |
| ------- | ---- |
| Page shell | [`apps/web/src/app/analytics/Analytics.tsx`](../../../../apps/web/src/app/analytics/Analytics.tsx) |
| Page composition | `apps/web/src/app/analytics/AnalyticsOverview.tsx` |
| Primary tabs | `apps/web/src/components/shared/analytics/AnalyticsPrimaryTabs.tsx` |
| Page header actions | `apps/web/src/components/shared/analytics/AnalyticsPageHeader.tsx` |
| Filter bar | `apps/web/src/components/shared/analytics/AnalyticsFilterBar.tsx` |
| KPI card | `apps/web/src/components/shared/analytics/AnalyticsInsightCard.tsx` |
| Stats + chart card | `apps/web/src/components/shared/analytics/AnalyticsStatsChartCard.tsx` |
| Live users card | `apps/web/src/components/shared/analytics/AnalyticsLiveUsersCard.tsx` |
| Breakdown section | `apps/web/src/components/shared/analytics/AnalyticsBreakdownSection.tsx` |
| Breakdown segments | `apps/web/src/components/shared/analytics/BreakdownSegmentedControl.tsx` |
| Breakdown table | `apps/web/src/components/shared/analytics/AnalyticsBreakdownTable.tsx` |
| Delta badge | `apps/web/src/components/shared/analytics/AnalyticsDeltaBadge.tsx` |
| Types | `apps/web/src/types/analytics.ts` |
| Query keys | `apps/web/src/constants/analytics-query-keys.ts` |
| Hooks | `apps/web/src/hooks/app/useAnalyticsOverview.ts` |
| API client | `apps/web/src/api/clients/analytics.ts` (new) |
| Context menu wire | [`SermonsTable.tsx`](../../../../apps/web/src/components/shared/my-sermons/SermonsTable.tsx) `handleAnalytics` |

Do **not** add thin `lib/analytics-*.util.ts` mappers unless shared by 2+ hooks; map in hook or client per [web conventions].

---

## Component tree

```text
Analytics
├── AnalyticsPageHeader
│   ├── title + BarChart3 icon
│   ├── DropdownMenu (header actions)
│   ├── Button variant="outline" (Share)
│   └── Button variant="default" className="bg-primary …" (Create analytics)
├── AnalyticsPrimaryTabs          ← underline style, NOT default TabsList pills
│   ├── tab: overview → AnalyticsOverview
│   ├── tab: sermon   → AnalyticsTabPlaceholder
│   └── tab: series   → AnalyticsTabPlaceholder
└── AnalyticsOverview
    ├── AnalyticsFilterBar
    │   ├── DropdownMenu (Add Filters)
    │   ├── DropdownMenu (granularity)
    │   └── DropdownMenu (date range)
    ├── div.grid (stats row)
    │   ├── AnalyticsStatsChartCard
    │   │   ├── AnalyticsInsightCard × 3
    │   │   └── AnalyticsLineChart (recharts via shadcn chart)
    │   └── AnalyticsLiveUsersCard
    │       ├── AnalyticsGauge
    │       └── live footer metrics
    └── AnalyticsBreakdownSection
        ├── BreakdownSegmentedControl  ← ToggleGroup, section-level only
        ├── Input (search)
        ├── DropdownMenu (table actions)
        └── AnalyticsBreakdownTable
```

---

## shadcn / Radix usage

| UI need | Component | Notes |
| ------- | --------- | ----- |
| Primary CTA | `Button` | Create analytics — `bg-[#08ffdb] text-[#1f2020]` or `bg-primary` |
| Secondary | `Button variant="outline"` | Share |
| Overflow menus | `DropdownMenu` | Header, live card, table |
| Breakdown segments | `ToggleGroup` `type="single"` | **Not** `Tabs` — Figma is segmented control inside card |
| Primary page tabs | Custom on `button` + border-bottom | Override shadcn pill `TabsList` — Figma uses underline tabs |
| Search | `Input` | Left search icon (`Search` lucide), same as My Sermons toolbar |
| Table | Add `npx shadcn@latest add table` if missing | Match My Sermons list density |
| Row select | `Checkbox` | Header + row |
| Cards | `Card`, `CardHeader`, `CardContent` | Optional wrapper; Figma uses custom `#2b2a2c` panels |
| Loading | `Skeleton` | KPI, chart, gauge, table rows |
| Charts | `npx shadcn@latest add chart` + **recharts** | Line chart `#7086fd`; gauge = `RadialBarChart` or custom SVG |
| Toasts | `sonner` | Share/create/filter coming soon; errors |

### Tabs: what is NOT a tab

| UI | Type | Implementation |
| --- | ---- | -------------- |
| Overview / Sermon / Series | **Primary route tabs** | `AnalyticsPrimaryTabs` + `?tab=` |
| top sermon / top region / top source | **Section segmented control** | `BreakdownSegmentedControl` local state `breakdownDimension` |
| Daily / Last 30 days | **Filters (dropdowns)** | Not tabs |

---

## Reusable component contracts

### `AnalyticsInsightCard`

```tsx
interface AnalyticsInsightCardProps {
  label: string;
  value: string | number;
  delta?: { direction: 'up' | 'down' | 'flat'; percent: number };
  compareLabel?: string; // "From mar 31"
}
```

### `AnalyticsDeltaBadge`

- Up: green pill, `▲ {n}%`
- Down: red `#8f3628`, `▼ {n}%`
- Flat/zero: red or muted `0%` per Figma empty state

### `AnalyticsPrimaryTabs`

```tsx
type AnalyticsPrimaryTab = 'overview' | 'sermon' | 'series';

interface AnalyticsPrimaryTabsProps {
  value: AnalyticsPrimaryTab;
  onValueChange: (tab: AnalyticsPrimaryTab) => void;
}
```

Sync with `useSearchParams` in `Analytics.tsx`.

### `BreakdownSegmentedControl`

```tsx
type BreakdownDimension = 'sermon' | 'region' | 'source';
```

### `AnalyticsBreakdownTable`

```tsx
interface AnalyticsBreakdownRow {
  id: string;
  sermonTitle: string;
  sermonDate?: string;
  thumbnailUrl?: string;
  durationLabel?: string; // "58:00" overlay
  plays: number | null;
  impressions: number | null;
  uniqueListeners: number | null;
  totalListeningTime: string | null; // "00:01:18"
  avgListeningTime: string | null;   // "20%"
}
```

Empty row: single row with `sermonTitle: 'No Data'`, metrics `null` → render `-`.

---

## Data layer

### Permissions

API RBAC already defines [`analytics:read`](../../../../apps/api/src/_data/permissions.json). Minister/creator studio roles must include this for production.

### API endpoints (proposed — implement in `apps/api` follow-up or stub)

Base: `/api/v1/studio/:studioCode/analytics` or minister-scoped `/api/v1/minister/:id/analytics`.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `…/overview` | KPIs + chart series + live snapshot |
| `GET` | `…/breakdown` | Paginated breakdown rows |

**Query params:**

| Param | Type | Example |
| ----- | ---- | ------- |
| `dateFrom` | ISO date | |
| `dateTo` | ISO date | |
| `granularity` | `daily` \| `weekly` \| `monthly` | |
| `dimension` | `sermon` \| `region` \| `source` | |
| `q` | string | search |

**Overview response shape (TypeScript):**

```ts
interface AnalyticsOverviewResponse {
  kpis: {
    plays: { value: number; deltaPercent: number; compareFrom: string };
    listenTimeHours: { value: number; deltaPercent: number; compareFrom: string };
    followers: { value: number; deltaPercent: number; compareFrom: string };
  };
  chart: { date: string; value: number }[];
  live: {
    currentUsers: number;
    newFollowers: number;
    avgPlayDurationSeconds: number;
  };
}
```

**Breakdown response:**

```ts
interface AnalyticsBreakdownResponse {
  rows: AnalyticsBreakdownRow[];
  total: number;
}
```

### Until API ships

1. **`useAnalyticsOverview`** returns React Query result against real client when available.
2. Dev flag or empty minister → **zero empty state** (not Figma sample numbers).
3. Optional Storybook/fixture file `_data/analyticsOverview.fixture.ts` for populated UI QA only — not shipped in production bundle.

Follow [`MySermons.tsx`](../../../../apps/web/src/app/sermons/MySermons.tsx):

- `useQuery` + `queryKey` from `analyticsQueryKeys`
- Debounced search 300ms
- `toast.error` on failure
- `Loader2` / skeletons while fetching

### Query keys

```ts
export const analyticsQueryKeys = {
  all: ['analytics'] as const,
  overview: (studioCode: string, params: AnalyticsOverviewParams) =>
    [...analyticsQueryKeys.all, 'overview', studioCode, params] as const,
  breakdown: (studioCode: string, params: AnalyticsBreakdownParams) =>
    [...analyticsQueryKeys.all, 'breakdown', studioCode, params] as const,
};
```

---

## Actions implementation matrix

| Control | Handler | MVP behavior |
| ------- | ------- | ------------- |
| Sidebar Analytics | `navigate(studioPath(code, 'analytics'))` | Route change |
| Context menu Analytics | `navigate(…/analytics?sermonId={id})` | Remove toast in `handleAnalytics` |
| Share | `onShareClick` | `toast.message('Share is not available yet.')` |
| Create analytics | `onCreateClick` | `toast.message('Create analytics is not available yet.')` |
| Add Filters item | `onFilterSelect` | Toast coming soon |
| Granularity / range | `setParams` + invalidate queries | Real refetch when API exists |
| Breakdown segment | `setDimension` | Refetch breakdown; region/source → empty |
| Search analysis | `setSearch` debounced | Client filter MVP |
| Header Refresh | `refetch()` | Invalidate overview + breakdown |
| Primary tab Sermon/Series | `setSearchParams({ tab })` | Placeholder component |
| Row click | `navigate(studioSermonPath…)` | If row has sermon id |
| Checkbox | `Set<string>` selection | No bulk menu MVP |

---

## Styling tokens (Figma → Tailwind)

| Token | Value |
| ----- | ----- |
| Page panel bg | `#2b2a2c` / `bg-card` |
| Border | `#545454` at 50% opacity |
| Primary accent | `#08ffdb` |
| Muted text | `#bdbdbd` |
| Body text | `#eaeaea` |
| Insight card bg (first KPI) | `#333234` |
| Chart line | `#7086fd` |
| Live dot | `#2383e0` |
| Delta down bg | `#8f3628` |
| Delta down text | `#fddcd8` |
| Segmented track | `#333234` |

Primary tabs: implement `border-b-2 border-[#eaeaea]` on active trigger; container `border-b border-[#545454]`.

---

## Navigation integration

Update [`apps/web/src/components/shared/my-sermons/SermonsTable.tsx`](../../../../apps/web/src/components/shared/my-sermons/SermonsTable.tsx):

```tsx
const handleAnalytics = useCallback(
  (sermonId: string) => {
    const code = storage.getStudioCode()?.trim();
    if (!code) {
      toast.error('Studio code not found.');
      return;
    }
    navigate(`/studio/${code}/analytics?tab=overview&sermonId=${sermonId}`);
  },
  [navigate],
);
```

Ensure [`navdata.tsx`](../../../../apps/web/src/_data/navdata.tsx) Analytics item resolves to `studioNavPath(studioCode, '/analytics')` (already `/analytics` relative — verify sidebar builder prefixes studio code).

---

## Testing (Vitest)

| Test | Assert |
| ---- | ------ |
| `AnalyticsPrimaryTabs` | Active tab underline; `onValueChange` fires |
| `BreakdownSegmentedControl` | Only one segment active; independent from primary tabs |
| `AnalyticsBreakdownTable` empty | Renders "No Data" + helper copy |
| `useAnalyticsOverview` | Maps API envelope → KPI props |
| Search debounce | Filters rows after 300ms |

---

## Dependencies to add

```bash
cd apps/web
pnpm add recharts
npx shadcn@latest add chart table checkbox
```

---

## Implementation order

1. Types + query keys + API client stub (404 → empty state)
2. Reusable analytics components (insight card, delta badge, primary tabs, segmented control)
3. `AnalyticsOverview` layout matching Figma grid
4. Wire `Analytics.tsx` with `tab` query param
5. Chart + gauge (recharts)
6. Breakdown table + search
7. Context menu + sidebar navigation QA
8. API integration when backend endpoints land

Steps **8** and backend work in [PRODUCT § Deferred](./PRODUCT.md#deferred--omitted-scope-feat-0018) are **not** part of the feat-0017 definition of done unless API lands in the same PR.

---

## Out of scope (engineering)

Aligned with [PRODUCT.md § Deferred / omitted scope](./PRODUCT.md#deferred--omitted-scope-feat-0018).

| Area | Omitted from feat-0017 |
| ---- | ---------------------- |
| API | Implementing `apps/api` controllers, services, DB aggregates for analytics |
| Client | `AnalyticsTabPlaceholder` only for Sermon/Series — no tab-specific routes or components |
| Breakdown | Region/source column defs, API `dimension=region\|source` handling beyond empty UI |
| Filters | Persisted filter state, custom date picker, filter query serialization |
| Export | CSV/PDF/report generation; `analytics:export` |
| Realtime | WebSocket subscription for live gauge |
| Search | Server `q` on breakdown until API exists |
| Pagination | Breakdown table paging |
| Bulk | Checkbox selection actions |
| Deep link | Auto-switch to Sermon tab when `?sermonId=` present |
| Tests | E2E / Playwright (Vitest unit tests only per § Testing) |
| Assets | Committed PNGs under `assets/` (export script only; optional commit) |
| Fixtures | `_data/analyticsOverview.fixture.ts` in production bundle |

### Definition of done (feat-0017 web only)

- Overview layout matches Figma for **empty** and **populated** when API returns data (or empty when stub/404).
- All deferred actions surface **toast** or **disabled** — no silent no-ops.
- No dependency on backend merge for UI merge; API client may 404 → empty state.

---

## Related specs

- [feat-0016](../feat-0016/PRODUCT.md) — tour step 4 highlights Analytics sidebar
- [feat-0010](../feat-0010/PRODUCT.md) — onboarding; analytics available post-tour
- API playback analytics notes: [`apps/api/src/_specs/playback.md`](../../../../apps/api/src/_specs/playback.md)
