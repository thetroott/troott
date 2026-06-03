# feat-0019: Bin UI parity with `/sermons` (studio trash)

## Summary

The studio **Bin** page (`/studio/{studioCode}/bin`) must look and behave like **My Sermons** (`/studio/{studioCode}/sermons`): same page shell, toolbar rhythm, list/grid views, row selection, pagination, and **three-dot row menus** — with bin-specific actions only.

Product language uses **restore** and **empty** (not “delete forever” in primary copy):

| Product label | Meaning | API operation |
| --- | --- | --- |
| **Restore** | Return sermon to library (draft) | `PUT /sermon/restore/:id` |
| **Empty immediately** | Permanently remove one sermon | `DELETE /sermon/delete/:id` |
| **Empty bin** | Permanently remove **all sermons in the current bin scope** (active search/filter/sort) | Scope delete (see API section) |

**Empty bin** (header): permanently remove **selected** rows when any are checked; otherwise all sermons in the current bin scope (filters/search).

---

## Problem

Today `apps/web/src/app/bin/Bin.tsx`:

- Reuses some `MY_SERMONS_PAGE` tokens but **not** the full `/sermons` table/list components.
- Uses inline row **Restore** / **Delete forever** buttons instead of a **three-dot** menu like `SermonContextMenu`.
- Uses `window.confirm` for destructive actions (unlike `/sermons` move-to-trash, which uses `StudioConfirmDialog`).
- Bulk actions exist but call **N single-ID API requests** in parallel (`Promise.allSettled`), not bulk endpoints.
- Restore/empty actions sit in a **second row** below the toolbar — must move **beside Filters** on the main toolbar row.
- No grid/list toggle; simplified HTML table vs `SermonsListView`.

---

## Goals

1. **Visual parity** with `/sermons` (header, toolbar, table density, pagination, empty states).
2. **Action parity** for restore/empty at scopes: **one row**, **marked rows**, **all in scope**.
3. **Row menu** via three-dot dropdown (same pattern as `SermonContextMenu`).
4. **Confirm dialogs** via `StudioConfirmDialog` for all destructive empty actions.
5. Document **API truth**: what works today vs proposed bulk routes.

## Non-goals

- Upload, publish, draft filters, or “Create sermon” on bin.
- Series / playlists tabs.
- Row actions: edit, rename, share, analytics, move to trash (library-only).

---

## Route and data

| Item | Value |
| --- | --- |
| Route | `/studio/:studioCode/bin` |
| Component | `apps/web/src/app/bin/Bin.tsx` (or extracted `BinTable` shell) |
| List API | `GET /api/v1/sermon/minister/:ownerId?status=bin` |
| Owner id | `resolveStudioSermonOwnerId(user, minister?.id, creatorId)` |
| Query params | `page`, `limit`, `sort`, `q`, `dateFrom`, `dateTo`, `status=bin` |
| React Query key | `sermonQueryKeys.binList(ownerId, params)` |

---

## UI parity matrix (`/bin` vs `/sermons`)

| Area | `/sermons` reference | `/bin` requirement |
| --- | --- | --- |
| Page background / column | `MY_SERMONS_PAGE.pageBg`, `mainColumn` | Same |
| Header | Title + optional fetching indicator | Title **Bin** + **Restore** (outline) and **Empty bin** (primary) — same tokens as `/analytics` Share / Create analytics (`STUDIO_HEADER_ACTION`) |
| Toolbar left | Search, Filters (status + date) | Search, **Filters** only (scope actions live in header) |
| Toolbar right | Sort (**Recently updated** default), Grid/List toggle | **Full** `SORT_OPTIONS` parity + segmented grid/list (`troott_bin_view_mode`) |
| Content | `SermonsListView` / `SermonsGridView` | **BinListView** / **BinGridView** (or shared list with `variant="bin"`) |
| Row actions | `SermonContextMenu` (three-dot) | **`BinContextMenu`** (three-dot) |
| Row inline buttons | None (menu only) | **No** inline Restore/Delete buttons |
| Selection | Checkbox + select-all on page | Required |
| Scope actions (restore / empty) | (library: deferred) | **On main toolbar row**, immediately after **Filters** — not a separate bulk bar |
| Pagination | `MySermonsPagination` | Same component |
| Empty state | `MySermonsEmptyTableSection` pattern | Bin copy + link back to `/sermons` |
| Confirm UX | `StudioConfirmDialog` | Same for all empty actions |

---

## Toolbar: search, filters, sort, and view modes

Bin must ship the **same toolbar controls** as `/sermons` (`SermonsTable.tsx`), minus library-only pieces (Create sermon, Draft/Published status filter, Sermon/Series tabs).

Reference implementation: `apps/web/src/components/shared/my-sermons/SermonsTable.tsx`  
Bin partial today: `apps/web/src/app/bin/Bin.tsx` (search + date filters + sort exist; **no grid/list toggle**, filters pill not aligned; restore/empty buttons on a **separate row** — wrong).

### Page header — Restore and Empty bin (required)

Two scope actions live in the **page header** (same row as title **Bin**), styled like `/analytics` **Share** and **Create analytics** (`STUDIO_HEADER_ACTION` in `studio-header-actions.ts`):

```
Bin                                    [ Restore ] [ Empty bin ]
────────────────────────────────────────────────────────────────
[ Search……………… ] [ Filters ▾ ]     [ Recently updated ▾ ] [ ⊞ | ☰ ]
```

| Button | Style | Enabled when |
| --- | --- | --- |
| **Restore** | Outline (`STUDIO_HEADER_ACTION.outline`) + `RotateCcw` icon | `totalCount > 0` && !`bulkBusy` |
| **Empty bin** | Primary teal (`STUDIO_HEADER_ACTION.primary`) + `Trash2` icon | Same |

**Scope (normative):** if one or more rows are **selected**, the action applies to **selected** ids only; if **none** are selected, it applies to **all sermons in bin scope** (`fetchAllBinIdsInScope()` — all pages matching `q`, dates, `sort`, `status=bin`).

**Forbidden:** four separate toolbar pills (`Restore marked`, `Empty marked`, `Restore all`, duplicate **Empty bin** on the filter row).

### View modes — grid and list (required)

| Requirement | Detail |
| --- | --- |
| Control | Segmented toggle on toolbar **right**, same as `/sermons` (`MY_SERMONS_PAGE.viewToggle`) |
| Modes | **Grid view** and **List view** |
| Default | **List view** (match library default) |
| Persistence | `localStorage` key `troott_bin_view_mode` (`'grid' \| 'list'`) — separate from `troott_my_sermons_view_mode` |
| List component | `BinListView` — parity with `SermonsListView` (checkbox column, sermon column, date created, status, three-dot menu) |
| Grid component | `BinGridView` — parity with `SermonsGridView` (card + vertical three-dot menu) |
| Selection | Checkbox selection works in **both** modes |
| Empty state | Same empty shell in both modes when `totalCount === 0` and no active filters |

Switching view mode must **not** reset search, filters, sort, or page.

### Search (required)

| Requirement | Detail |
| --- | --- |
| Placement | Toolbar left, first control |
| Chrome | `MY_SERMONS_PAGE.searchWrap` + search icon + `searchInput` |
| Placeholder | `Search bin sermons` |
| Behavior | Debounced **300ms** before updating query param `q` |
| API | `GET …/minister/:ownerId?status=bin&q={terms}` |
| Page reset | Set `page = 1` when `q` changes |
| Selection reset | Clear `selectedIds` when `q` changes |

### Filters (required)

| Requirement | Detail |
| --- | --- |
| Placement | Toolbar left, **Filters** pill (same styling as `/sermons`) |
| Bin scope | `status=bin` is **fixed** server-side — do **not** show Draft/Published/All radio (library-only) |
| Date created | **From** / **To** date inputs inside dropdown (same layout as `/sermons`) |
| Clear action | **Clear date filters** resets `dateFrom` and `dateTo` |
| Pill label | Dynamic summary like `/sermons`: e.g. `Filters`, `From 2026-01-01`, `From … · To …` (not a static “Filters” string when dates are active) |
| API | `dateFrom`, `dateTo` query params on minister list |
| Page reset | `page = 1` on filter change |
| Selection reset | Clear `selectedIds` on filter change |

**Out of scope for bin filters:** publication status (`draft` / `published` / `all`) — those apply only on `/sermons`.

### Sort — including “Recently updated” (required)

| Requirement | Detail |
| --- | --- |
| Placement | Toolbar right, sort pill before grid/list toggle |
| Default | **Recently updated** → `sort=-updatedAt` (same as `DEFAULT_MINISTER_LIST_PARAMS` / library) |
| UI label | Pill shows active sort label (e.g. “Recently updated”), not generic “Sort” |
| Options | **Same option set as `/sermons`** (`SermonsTable` `SORT_OPTIONS`) |

Normative sort menu (bin must expose all rows):

| `sort` query value | UI label |
| --- | --- |
| `-updatedAt` | Recently updated |
| `-createdAt` | Date created (newest) |
| `createdAt` | Date created (oldest) |
| `-releaseDate` | Release date (newest) |
| `title` | Title A–Z |
| `-title` | Title Z–A |

| Behavior | Detail |
| --- | --- |
| API | `sort` query param on `GET …/minister/:ownerId?status=bin` |
| Whitelist | Server uses `sermonService.normalizeMinisterListSort` — invalid values fall back to `-updatedAt` |
| Page reset | `page = 1` when sort changes |
| Selection reset | Clear `selectedIds` when sort changes |
| List-only extra | **Date created** column header in list view may toggle `createdAt` / `-createdAt` on click (same as `SermonsListView` + `handleDateCreatedHeaderClick`) |

### Query state contract (bin list)

Bin list query params must mirror `/sermons` remote mode:

```ts
type BinListParams = {
  page: number;
  limit: number; // MY_SERMONS_PAGE_SIZE (16)
  sort: string; // default '-updatedAt'
  q: string;
  dateFrom: string;
  dateTo: string;
  // status: 'bin' — always sent, not user-toggleable
};
```

**Transitions (normative):**

| User action | State change |
| --- | --- |
| Search input changes (debounced) | `q` updated, `page → 1`, selection cleared |
| Date from/to changes | `dateFrom` / `dateTo` updated, `page → 1`, selection cleared |
| Sort option picked | `sort` updated, `page → 1`, selection cleared |
| Page changes | `page` only |
| View mode grid ↔ list | local preference only; no refetch param change |
| Restore / empty success | refetch + invalidate sermon queries; keep active `q`/filters/sort |

### Empty vs no-results

| State | Condition | UI |
| --- | --- | --- |
| **Empty bin** | `totalCount === 0` and no `q` and no date filters | Bin empty shell + link to My Sermons |
| **No results** | `totalCount === 0` but `q` or dates active | “No sermons match your filters” + clear filters affordance |

---

## Action catalog

### Header scope actions (restore / empty)

See [Page header — Restore and Empty bin](#page-header--restore-and-empty-bin-required).

| Button | Selection | No selection | Confirm |
| --- | --- | --- | --- |
| **Restore** | `PUT /restore/:id` per selected id | Restore all ids in scope | No |
| **Empty bin** | Hard-delete each selected id | Hard-delete all ids in scope | Yes — `StudioConfirmDialog`; copy includes count and `(selected)` vs filtered scope |

### Row three-dot menu (`BinContextMenu`)

Normative row menu (see **feat-0020** for **Get info**):

| Menu item | Maps to | Confirm |
| --- | --- | --- |
| **Get info** | Open `SermonGetInfoDialog` (`GET /sermon/:id`) | No |
| **Restore** | `restoreSermonFromBin(id)` | No |
| **Empty immediately** | `deleteSermon(id)` | Yes — sermon title in body |

**Rationale:** “Empty bin” is a **page/scope** action (delete entire filtered bin). Putting it on one row is ambiguous and risky. **Get info** is read-only and listed first per `specs/web/feature/feat-0020/SERMON_GET_INFO_SPEC.md`.

### Copy examples (`StudioConfirmDialog`)

**Empty immediately (one row):**

- Title: `Empty immediately`
- Body: You're about to permanently remove **{title}**. This cannot be undone.
- Confirm: `Empty immediately` (destructive)

**Empty bin** (header — selection or scope):

- Title: `Empty bin`
- Body: Permanently remove **{count}** sermon(s) **(selected)** — or **{count}** sermon(s) **in the bin (matching your current filters)** when nothing is selected. This cannot be undone.
- Confirm: `Empty bin` (destructive; consider requiring user to type `EMPTY` when count > 10)

---

## Component plan (web)

| Module | Role |
| --- | --- |
| `Bin.tsx` | Page host: query, toolbar state, bulk handlers, confirm dialog state |
| `BinContextMenu.tsx` | Three-dot menu: Get info, Restore, Empty immediately (feat-0020) |
| `BinListView.tsx` | Table parity with `SermonsListView` (bin columns: sermon, date created, status=Bin, menu) |
| `BinGridView.tsx` | Grid cards with same menu (required, not optional) |
| `StudioConfirmDialog` | Shared confirms (`apps/web/src/components/shared/studio/StudioConfirmDialog.tsx`) |

**Reuse from `/sermons`:**

- `MY_SERMONS_PAGE`, `MY_SERMONS_LIST` tokens
- `MySermonsPagination`
- `SermonTableStatusPill` or bin-specific pill (“In bin”)
- `mapApiSermonToTableRow` / `parseMinisterSermonsResponse`

---

## API audit (as of spec date)

### Implemented on API (use now)

| Operation | Method | Path | Auth | Controller / service |
| --- | --- | --- | --- | --- |
| List bin sermons | `GET` | `/api/v1/sermon/minister/:ministerId` | Public* | `getSermonsByminister` — pass `status=bin` |
| Read one (policy) | `GET` | `/api/v1/sermon/:id` | `Protect` | `getSermonById` |
| Move to bin (from library) | `PUT` | `/api/v1/sermon/move-to-bin/:id` | `Protect` | `moveSermonToBin` |
| **Restore one** | `PUT` | `/api/v1/sermon/restore/:id` | `Protect` | `restoreSermonFromBin` |
| **Delete one forever** | `DELETE` | `/api/v1/sermon/delete/:id` | `Protect` | `deleteSermon` |

\*List is unauthenticated on router today; bin page runs in studio context with owner id. Align with library list auth policy in [feat-0006](../feat-0006/TECH.md).

**Repository behavior:**

- Restore: sets `status: draft`, `state: active` (`sermon.repository.restoreSermonFromBin`).
- Hard delete: `findByIdAndDelete` (`sermon.repository.deleteSermon`).
- Bin filter: `publicationStatus === 'bin'` in minister list query.

**Policy (delete):** Studio users **cannot** permanently delete **published** sermons (`validateDeletePolicy` → 403). Web hides **Empty immediately** for published rows and skips published ids in **Empty bin** batch. API remains source of truth.

### Defined on web client only — **not implemented on API**

Paths exist in `apps/web/src/api/core/paths.ts` and methods in `apps/web/src/api/clients/sermon.ts`, but **no routes** in `apps/api/src/routes/sermon.router.ts`:

| Operation | Method | Client path constant | API status |
| --- | --- | --- | --- |
| Restore marked | `PUT` | `URL_SERMON_RESTORE_BULK` → `/sermon/restore` | **Missing** — use N× `restore/:id` or implement bulk |
| Empty marked | `DELETE` | `URL_SERMON_DELETE_BULK` → `/sermon/delete` | **Missing** — conflicts with `DELETE /:id` if naively mounted; needs route design |
| Restore all in scope | `PUT` | `URL_SERMON_RESTORE_ALL` → `/sermon/restore-all` | **Missing** |
| Empty bin (scope) | `DELETE` | `URL_SERMON_DELETE_ALL` → `/sermon/delete-all` | **Missing** |

### Interim web strategy (until bulk API ships)

| UI action | Implementation | Notes |
| --- | --- | --- |
| Restore one | `restoreSermonFromBin(id)` | Direct |
| Empty immediately | `deleteSermon(id)` | Direct + confirm |
| Restore marked | `Promise.allSettled(ids.map(restore))` | Current `Bin.tsx` pattern; show partial-failure toast |
| Empty marked | `Promise.allSettled(ids.map(delete))` | Same |
| Restore all | Paginate `status=bin` list, collect ids, restore each | `fetchAllBinIdsInScope()` |
| Empty bin | Same id collection, delete each | High-friction confirm required |

### Proposed bulk API (recommended follow-up)

Add to API (feat-0019 backend slice):

```http
PUT /api/v1/sermon/restore/bulk
Body: { "ids": string[] }
Response: { "successCount": number, "failedIds": string[] }

DELETE /api/v1/sermon/delete/bulk
Body: { "ids": string[] }
Response: { "successCount": number, "failedIds": string[] }

PUT /api/v1/sermon/restore-all
Body: { "ownerId": string, "filters": { "q"?, "dateFrom"?, "dateTo"?, "sort"? } }

DELETE /api/v1/sermon/delete-all
Body: { "ownerId": string, "filters": { ... } }
```

Use `/bulk` suffix (not bare `/restore` or `/delete`) to avoid Express route collisions with `/:id`.

Web client should update `paths.ts` to match once API lands.

---

## State and feedback

```ts
selectedIds: Set<string>
bulkBusy: boolean
rowBusyId: string | null
confirm: null | {
  kind: 'empty-one' | 'empty-marked' | 'empty-bin' | 'restore-marked' | ...
  sermonId?: string
  sermonTitle?: string
  count?: number
}
```

After any successful mutation:

1. `invalidateQueries({ queryKey: sermonQueryKeys.all })`
2. Refetch bin list query
3. Clear `selectedIds` on bulk success
4. Toast summary: `Restored 8 sermons. 2 failed.` / `Emptied 5 sermons.`

---

## Acceptance criteria

- [ ] **Grid view** and **list view** toggle matches `/sermons` (segmented control + persisted preference).
- [ ] **Search** is debounced and drives `q` with page reset.
- [ ] **Filters** dropdown includes date created From/To, clear action, and dynamic filter pill summary (no draft/published radios).
- [ ] **Sort** includes **Recently updated** as default and full `/sermons` sort option set; pill shows active label.
- [ ] List view supports optional **Date created** column header sort toggle.
- [ ] Empty bin vs filtered-no-results states are distinct.
- [ ] `/bin` uses the same visual shell and table/list components as `/sermons` (not a one-off HTML table).
- [ ] Each row has a **three-dot** menu with **Restore** and **Empty immediately**.
- [ ] Header has exactly **Restore** and **Empty bin** (`STUDIO_HEADER_ACTION` styling); scope = selection if any, else all in filter scope.
- [ ] Toolbar scope buttons use correct enablement and confirm rules.
- [ ] All **empty** actions use `StudioConfirmDialog` (no `window.confirm`).
- [ ] Empty bin applies to **full filter scope**, not only the current page.
- [ ] Empty / restore mutations refresh bin list without full page reload.
- [ ] API gap documented: bulk endpoints optional; N× single-id acceptable until backend ships.
- [ ] Policy errors from API shown with server `message` (not generic failure only).

---

## Related

- [PRODUCT.md](./PRODUCT.md) — UC-D01–D07, bin gaps
- [TECH.md](./TECH.md) — bin parity plan, client methods
- [feat-0018 `StudioConfirmDialog`](../../feat-0018/TECH.md) pattern (via shared component)
- [`05 - sermon-view-trash.md`](../../05%20-%20%20sermon-view-trash.md) — legacy UC-V6–V8
- [feat-0006 TECH](../feat-0006/TECH.md) — sermon API baseline
