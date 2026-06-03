# feat-0023: Single sermon analytics — TECH

## Normative spec

**[SERMON_ANALYTICS_SPEC.md](./SERMON_ANALYTICS_SPEC.md)**

## Touchpoints (existing / planned)

| Area | Files |
| --- | --- |
| Row menu | `SermonContextMenu.tsx`, `SermonsTable.handleAnalytics` |
| Edit sidebar | `SermonEditSidebar.tsx`, `SermonEditPage.tsx` (`analyticsPath`) |
| Analytics host | `Analytics.tsx`, `AnalyticsPrimaryTabs.tsx` |
| Overview reuse | `AnalyticsFilterBar`, `AnalyticsStatsChartCard`, `AnalyticsLiveUsersCard`, `analytics-ui.ts` |
| Breakdown → drill-down | `AnalyticsBreakdownSection.handleRowClick` |
| Types / API client | `types/analytics.ts`, `api/clients/analytics.ts`, `useAnalyticsOverview.ts` |
| Paths | `paths.ts` — `studioAnalyticsPath`, optional `studioSermonAnalyticsPath` helper |
| Sermon metadata | `useSermonByIdQuery` / `fetchSermonDetail` for header strip |

## Implementation order (suggested)

1. **URL contract** — `?tab=sermon&sermonId=`; fix `SermonsTable` (today uses `tab=overview`).
2. **`studioSermonAnalyticsPath(code, sermonId)`** — single helper for menu + sidebar.
3. **`AnalyticsSermonView`** — sermon header + scoped filters + KPI/chart (placeholder metrics until API).
4. Wire **`Analytics.tsx`** — read `sermonId` search param; render sermon view when `tab=sermon` and id present.
5. **Sidebar active state** — highlight Analytics when pathname/search matches current sermon.
6. **Breakdown row click** — navigate to sermon analytics URL, not `/sermons/:id` placeholder.
7. **API** — `GET .../analytics/sermons/:sermonId` (or overview/breakdown `sermonId` query); replace placeholders.

## Cross-feature

- **Edit** (feat-0022): sidebar **Details** stays on edit route; **Analytics** leaves edit route (full-page analytics tab), same as YouTube Studio.
- **Get info** (feat-0020): metadata only; does not show charts.
- **Bin** (feat-0019): no **Analytics** menu item.
