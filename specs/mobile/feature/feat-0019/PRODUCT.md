# feat-0019: Minister and series pickers (API)

## Summary

Wire **minister picker** and **series picker** shells to search/catalog APIs so selection flows (onboarding, library, filters) use real data instead of empty UI.

Related: [feat-0002](../feat-0002/PRODUCT.md) (onboarding ministers), [feat-0016](../feat-0016/PRODUCT.md) (minister profile).

## Problem

| Component | File | Today |
| --------- | ---- | ----- |
| Minister picker | `components/features/pickers/minister-picker.tsx` | Static shell; comment “Wire to ministers API” |
| Series picker | `components/features/pickers/series-picker.tsx` | Static shell; no list |

Onboarding already uses dedicated screens with `useOnboardingMinistersQuery`; pickers are reusable shells not connected.

## Goals

1. Minister picker lists ministers from **`GET /api/v1/search/ministers`** (search as user types).
2. Series picker lists series from **`GET /api/v1/search/series`**.
3. Selection callback returns id + display label to parent.
4. Loading, empty, and error states in picker body.
5. Primary action enabled when `minSelection` met (minister picker prop).

## Non-goals

- New API endpoints (use search routes).
- Minister follow persistence (see feat-0016 open question — parent handles on submit).

## Consumer

Flows that embed pickers: onboarding variants, library filters, future playlist editors.

## Behavior

1. Picker opens with title/subtitle.
2. User types in search → debounced API call (300ms).
3. Results list: avatar, name, subtitle (church/ministry).
4. Tap row toggles selection (multi-select if parent configures).
5. **Primary** calls `onPrimaryPress(selectedIds)` — parent persists via listener onboarding or library API.
6. **Close** dismisses without save.
7. **Empty search:** prompt to type; **no results:** inline message.

## Resolved decisions

| Topic | Decision |
| ----- | -------- |
| Parent wiring | **P0:** wire `app/(pickers)/pick-ministers.tsx` → `onboardMinisters` (or library minister upsert). **P0:** wire `choose-series.tsx` → persist selected series ids to listener/library (match onboarding contract). |
| Onboarding refactor to picker | **Optional P2** — keep dedicated onboarding screens; pickers are reusable modals. |
| Library filter parent | **Future** — picker returns ids to local filter state only; no API on Done. |
| Empty browse (q < 2) | **P1:** show `useOnboardingMinistersQuery` / default search with `q: ''` or curated rails when input empty — not blocked. |
| Pagination | **P1:** `FlatList` `onEndReached` with `page++` on search APIs. |
| Series detail after pick | **P2 defer** — selection only; navigate to `/series/[id]` only if parent explicitly requests. |

## Per-screen recommendations

| Screen / parent | P0 | P1 | P2 |
| --------------- | -- | -- | -- |
| `app/(pickers)/pick-ministers.tsx` | Search hook + selection state; primary → `api.listener.onboardMinisters({ ministers: ids })` or library PUT | Empty-state curated ministers | — |
| `app/(pickers)/choose-series.tsx` | Series search hook + selection; primary → listener onboarding series API or library series items | Empty browse list | Navigate to series detail on row long-press |
| Onboarding dedicated screens | Keep as-is | Optional swap to picker component | — |
| Library filter (future) | — | Minister/series picker → local filter | — |
| `MinisterPicker` component | Debounced `searchMinisters`, `minSelection` gate | Initial list without q | Infinite scroll |
| `SeriesPicker` component | Debounced `searchSeries` | Initial list without q | Infinite scroll |

## Acceptance criteria

1. Minister picker shows API results for query “john”.
2. Series picker shows API series list/search.
3. No placeholder-only picker bodies in production paths.
4. Parents that use pickers document which mutation runs on primary.

## Related docs

- [`TECH.md`](./TECH.md)
