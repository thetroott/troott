# feat-0019: Web sermon CRUD parity — library, upload, publish, bin restore/delete

## Summary

Define one canonical **web** product contract for the full sermon lifecycle in studio:

1. **Create** sermon (upload audio, prepare metadata).
2. **Read** library and bin.
3. **Update** draft and published sermons (metadata + allowed audio replace flows).
4. **Delete** via move-to-bin, restore, and permanent delete.

This feature specifically adds complete **bin action coverage** to the product contract:

- Restore one
- Restore marked
- Restore all
- Delete one forever
- Delete marked forever
- Delete all forever

It also formalizes that `/bin` should reuse the `/sermons` table interaction model for consistency.

**Related (planned):** [feat-0020 Get info](../feat-0020/SERMON_GET_INFO_SPEC.md) — **Get info** on three-dot menus for `/sermons` and `/bin`. [feat-0022 Edit](../feat-0022/SERMON_EDIT_SPEC.md) — **Edit** row action and upload-wizard lifecycle.  
**Related (planned):** [feat-0021 List visibility](../feat-0021/SERMON_LIST_VISIBILITY_SPEC.md) — **Visibility** column + change modal on My Sermons list.

## Problem

Sermon CRUD behavior exists across multiple specs and partial implementations:

| Surface | Current state | Gap |
| ------- | ------------- | --- |
| `/studio/{code}/sermons` | Implemented with create/upload and list actions | Needs one canonical CRUD policy reference for update/delete permutations |
| `/studio/{code}/sermons/upload/...` | Implemented wizard | Lifecycle expectations after save/publish/close are split across docs |
| `/studio/{code}/bin` | Basic single-row restore/delete actions | No formal bulk action contract; does not fully match `/sermons` UX system |
| Existing docs (`04`, `05`, feat-0006, feat-0018) | Useful but layered over time | Team still lacks one explicit “all web CRUD use cases” source |

## Consumer

Authenticated studio users on web:

- **Minister**
- **Creator**

Both personas share the same UI lifecycle and CRUD behaviors; owner scope resolution is implementation detail in TECH.

## Non-goals

- Mobile CRUD surfaces
- Listener app sermon management
- Admin moderation dashboard UX
- Analytics product behavior (covered by feat-0017)
- Series/playlists product completion (must be handled in dedicated production feature specs, not placeholder UX)

## Production standard (no legacy code path)

This is a production app. The product contract in this feature does not allow legacy, placeholder, or temporary behavior to stand as shipped outcomes.

- No placeholder pages as final user flows.
- No toast-only or no-op actions presented as real capabilities.
- No “legacy fallback” route behavior where core CRUD depends on transient navigation state.
- No unresolved TODO behaviors at release time for in-scope surfaces.
- If any item is intentionally not shipped, it must be explicitly deferred with:
  - linked follow-up feature spec ID,
  - owner,
  - release target,
  - user-visible behavior defined for the interim.

---

## Canonical web routes

| Route | Purpose |
| ----- | ------- |
| `/studio/{code}/sermons` | Primary sermon library management page |
| `/studio/{code}/sermons/upload` (+ `file`, `details`, `thumbnail`, `publish`) | Upload/edit modal host flow |
| `/studio/{code}/sermons/:sermonId` (+ `resume`, `edit`) | Open/resume/update context |
| `/studio/{code}/bin` | Bin management page |

---

## CRUD use case catalog

## C — Create

### UC-C01 — Upload sermon from library

1. User opens `/studio/{code}/sermons`.
2. User clicks **Create sermon**.
3. Entry modal opens; valid audio selected.
4. Upload wizard opens; upload starts once per file selection.
5. User completes details/settings/review.
6. User chooses **Save as draft** or **Publish**.
7. Modal closes and library reflects latest state without hard reload.

### UC-C02 — Upload sermon from onboarding/tour entry

1. User enters from Get Started or post-tour flow.
2. Product lands in the same `/sermons/upload` lifecycle as UC-C01.
3. Publish may trigger first-sermon onboarding completion where applicable.

## R — Read

### UC-R01 — View sermon library

- `/studio/{code}/sermons` shows sermon rows with search, filter, sort, list/grid, pagination, row actions.

### UC-R01a — Search sermons

1. User types in search input.
2. Query is debounced.
3. List updates with `q` param.
4. Empty-search results show “no matches” state, not global empty-library state.

### UC-R02 — View draft/published subsets

- Status filters show correct subsets (`draft`, `published`, `all`) and counts through paginated list behavior.

### UC-R02a — Apply date filters

1. User opens filter control and sets `dateFrom`/`dateTo`.
2. Library updates to filtered subset.
3. Clearing date filters restores unbounded list.

### UC-R02b — Apply sort options

- User can sort by: recently updated, date created newest/oldest, release date, title A-Z/Z-A.
- Sort is server-driven in remote list mode.

### UC-R02c — Toggle list/grid view mode

1. User switches between list and grid buttons.
2. View preference persists locally.
3. Same result set is rendered in selected layout.

### UC-R02d — Pagination behavior

- Pagination controls move through pages while preserving active search/filter/sort state.
- Page resets to 1 when search/filter/sort changes.

### UC-R03 — View sermon for resume/edit

- Row actions open draft/published sermon in update flow with server-backed state.

### UC-R04 — View bin

- `/studio/{code}/bin` shows only trashed sermons and supports single and bulk actions.
- UI parity, three-dot row menu, and API audit: [`BIN_UI_PARITY_SPEC.md`](./BIN_UI_PARITY_SPEC.md).

## U — Update

### UC-U01 — Save draft

- User saves current sermon as draft from review/update flow.
- Sermon appears/updates in library draft state.

### UC-U02 — Publish sermon

- User publishes from review/update flow.
- Sermon appears in published list state.
- First publish side effects run when onboarding is incomplete.

### UC-U03 — Edit draft sermon

- User resumes a draft, updates metadata, optionally replaces audio under API policy.

### UC-U04 — Edit published sermon

- User edits allowed published fields and saves successfully, or receives policy validation errors.

### UC-U05 — Replace draft/published audio (policy aware)

- User attempts replace audio.
- If allowed: replacement upload succeeds and sermon reflects new media state.
- If blocked by policy: explicit, user-readable error surfaced.

## D — Delete lifecycle

### UC-D01 — Move one sermon to bin

- Triggered from library row action.
- On success, sermon is removed from default library view and appears in bin.

### UC-D02 — Restore one sermon from bin

- Triggered from bin row action.
- On success, sermon returns to library.

### UC-D03 — Permanently delete one sermon from bin

- Triggered from bin row action with destructive confirmation.
- On success, sermon is removed irreversibly.

### UC-D04 — Restore marked sermons (bulk)

1. User selects multiple rows in bin.
2. User clicks **Restore marked**.
3. System executes restore for selected ids.
4. UI reports success/partial-failure summary.

### UC-D05 — Delete marked sermons forever (bulk)

1. User selects multiple rows in bin.
2. User clicks **Delete marked forever**.
3. User confirms destructive action.
4. System executes delete for selected ids and reports summary.

### UC-D06 — Restore all sermons in current bin scope

1. User clicks **Restore all**.
2. System restores all rows in active scope (filtered set).
3. UI reports total restored and failures (if any).

### UC-D07 — Delete all sermons forever in current bin scope

1. User clicks **Delete all forever**.
2. User passes high-friction confirmation.
3. System permanently deletes all rows in active scope.
4. UI reports total deleted and failures (if any).

---

## Bin UI parity requirements (explicit)

The `/bin` page must use `/sermons` UI as reference for consistency:

| Area | `/sermons` reference | `/bin` requirement |
| ---- | -------------------- | ------------------ |
| Page shell | Header + tabs + toolbar + content + pagination | Same shell rhythm and spacing |
| Toolbar pattern | Search/filter/sort controls | Same interaction model; bin-appropriate filter labels |
| Table behavior | Row density, type scale, hover, pagination | Same baseline with bin-specific action cells |
| Selection UX | Checkbox + select-all | Required for bulk restore/delete |
| Empty states | Structured informational empty state | Bin-specific copy + return-to-sermons action |

## `/sermons` functional parity checklist (explicit)

`/sermons` is the baseline interaction model for all list-managed sermon surfaces.

| Function group | Required behavior |
| -------------- | ----------------- |
| Search | Debounced search query against sermon title/content fields |
| Filters | Status (`all`, `draft`, `published`) and optional date range |
| Sort | Stable selectable sort options with visible active label |
| View modes | Grid/List toggle with persisted preference |
| Row actions | Edit/resume, rename, share, download, analytics, move to trash (policy aware) |
| Selection | Per-row checkbox + select-all on page |
| Pagination | Deterministic paging with retained query state |
| Empty states | Distinguish “empty library” vs “no results for current filters” |

---

## Not yet implemented on web (explicit gap register)

This section tracks behaviors required by this spec that are still partial or stubbed in current implementation.

### `/sermons` gaps

| Gap | Current implementation status | Target behavior |
| --- | ----------------------------- | --------------- |
| Series tab content | Placeholder only | Functional series management surface or explicit scoped non-goal with separate feat |
| Playlists tab content | Placeholder only | Functional playlist management surface or explicit scoped non-goal with separate feat |
| Duplicate sermon action | Toast-only stub | Real duplicate workflow with API support and list refresh |
| Move-to-series action | Toast-only stub | Real move-to-series workflow with API support |
| Full sermon detail page | Route uses placeholder | Dedicated read/update detail experience or clear modal-only canonical path |
| Bulk actions in `/sermons` | Row selection exists, no bulk action toolbar | Bulk operations contract (if in scope) or explicitly defer |

### `/bin` gaps

See [`BIN_UI_PARITY_SPEC.md`](./BIN_UI_PARITY_SPEC.md) for full UI + API contract.

| Gap | Current implementation status | Target behavior |
| --- | ----------------------------- | --------------- |
| Table parity with `/sermons` | Simplified custom HTML table | Reuse `SermonsListView` / grid pattern + `MY_SERMONS_LIST` tokens |
| Three-dot row menu | Inline Restore / Delete buttons | `BinContextMenu`: Restore, Empty immediately |
| Product copy (restore / empty) | “Delete forever” wording | Restore, Empty immediately, Empty bin (toolbar scope) |
| Confirm modals | `window.confirm` | `StudioConfirmDialog` for all empty actions |
| Restore marked / Empty marked | Implemented via N× single API calls | Keep until bulk API; optional upgrade to bulk endpoints |
| Restore all / Empty bin | Implemented via scoped id fetch + N× calls | Same + high-friction confirm for Empty bin |
| Restore/empty button placement | Second row below toolbar | **Beside Filters** on main `toolbarRow` |
| Grid/list toggle | Missing | Required — same segmented control + `BinGridView` / `BinListView` |
| Search / filters / sort parity | Partial (no grid; static “Filters” label; sort missing release date) | Full toolbar per [`BIN_UI_PARITY_SPEC.md`](./BIN_UI_PARITY_SPEC.md) — debounced search, date filters, **Recently updated** default + full sort menu |
| Bulk API endpoints | Web client stubs only; API routes missing | Optional `…/bulk` and `…-all` routes (see bin spec) |
| Bulk summary feedback | Partial (`Promise.allSettled` toasts) | Standardize `successCount` / `failedIds` when API bulk ships |

### Route/flow gaps

| Gap | Current implementation status | Target behavior |
| --- | ----------------------------- | --------------- |
| `:sermonId` / `resume` / `edit` route depth | Placeholder-driven bridge | Fully productized detail/edit flow (or explicit modal-only canonical contract) |
| Resume/edit consistency across entry points | Works via state in some paths | Uniform behavior from row actions, direct routes, and deep links |

### Policy/API dependency gaps

| Gap | Current implementation status | Target behavior |
| --- | ----------------------------- | --------------- |
| Bulk bin endpoints | Not standardized | Official API contract for restore/delete bulk and all-scope actions |
| Published-delete policy UX | Error surfaced per-row | Clear policy messaging in single and bulk flows |
| Partial-failure reporting | Not standardized for bulk | Consistent result contract (`successCount`, `failedIds`) and toast rendering |

Bin-specific row actions (three-dot menu):

- Restore
- Empty immediately

Bin-specific toolbar actions (same row as Search + Filters, immediately after **Filters**):

- Restore marked
- Empty marked
- Restore all
- Empty bin (scope-wide permanent delete)

Layout: [`BIN_UI_PARITY_SPEC.md`](./BIN_UI_PARITY_SPEC.md#toolbar-layout--restore-and-empty-beside-filters-required).

---

## API expectation summary

| Product operation | Expected backend behavior |
| ----------------- | ------------------------- |
| Save draft | Persists as draft and appears in library |
| Publish | Persists as published and appears in library |
| Move to bin | Soft-delete state, visible in bin |
| Restore | Leaves bin and returns to library |
| Permanent delete | Irreversible removal |
| Bulk restore/delete | Supports summarized result (`successCount`, `failedIds`) |

---

## Acceptance criteria

1. `/studio/{code}/sermons` supports full create/read/update/delete-to-bin lifecycle for minister and creator.
2. `/studio/{code}/bin` supports all requested actions: restore all, restore marked, delete one, delete marked, delete all.
3. `/bin` interaction model is aligned with `/sermons` UI pattern (table + toolbar + pagination + selection).
4. All mutations refresh affected lists without hard reload.
5. Policy-blocked operations show clear errors.
6. Single-row and bulk destructive actions include explicit confirmation.
7. No legacy/stub UX remains in shipped CRUD paths for `/sermons` and `/bin`; all user-visible actions are functional or explicitly deferred with linked spec + owner + target release.

---

## Related specs

- [feat-0021 SERMON_LIST_VISIBILITY_SPEC](../feat-0021/SERMON_LIST_VISIBILITY_SPEC.md)
- [feat-0006 PRODUCT](../feat-0006/PRODUCT.md)
- [feat-0008 PRODUCT](../feat-0008/PRODUCT.md)
- [feat-0018 PRODUCT](../feat-0018/PRODUCT.md)
- [`04 - sermon-upload-draft.md`](../../04%20-%20sermon-upload-draft.md)
- [`05 -  sermon-view-trash.md`](../../05%20-%20%20sermon-view-trash.md)
