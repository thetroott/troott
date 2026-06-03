# feat-0020: Sermon **Get info** — row menu + read-only detail dialog

## Summary

Studio users on **My Sermons** (`/studio/{studioCode}/sermons`) and **Bin** (`/studio/{studioCode}/bin`) must be able to open a **read-only** sermon details view from each row/card **three-dot menu** via a **Get info** action.

One shared dialog loads sermon metadata from the existing detail API (`GET /api/v1/sermon/:id`). No new backend route is required for v1.

---

## Problem

Today:

| Surface | Three-dot menu | Gap |
| --- | --- | --- |
| `/sermons` | `SermonContextMenu` — Edit, Rename, Share, Download, Analytics, Move to trash | No quick way to inspect sermon metadata without opening upload/edit or analytics |
| `/bin` | `BinContextMenu` — Restore, Empty immediately | Same — users cannot view title, dates, processing state, IDs, or share link in context |

List/grid rows only show a subset of fields (title, duration, date created, status pill). Operators need **full read-only context** before restore, empty, share, or edit.

---

## Goals

1. Add **Get info** to `SermonContextMenu` and `BinContextMenu` on every row/card that already has a three-dot menu.
2. Open a **studio-styled read-only dialog** (not navigation, not edit flow).
3. **Single implementation** shared by `/sermons` and `/bin` (`SermonGetInfoDialog` + one hook/query).
4. **Consistent copy**: menu label **Get info** (sentence case; not “Get Info” title case in menu).
5. **Accessible**: dialog title, focus trap, `Escape` closes, loading and error states.

## Non-goals (v1)

- Editing metadata from the info dialog (use **Edit** / upload flow on library).
- Mobile studio surfaces.
- Listener/public sermon page.
- New `GET /sermon/:id/info` or expanded DTO — use existing detail response.
- Replacing **Analytics** or **Share** menu items.
- Bulk “get info” for selection.

---

## Routes and entry points

| Route | Host | Menu component |
| --- | --- | --- |
| `/studio/{code}/sermons` | `SermonsTable` → `SermonsListView` / `SermonsGridView` | `SermonContextMenu` |
| `/studio/{code}/bin` | `Bin.tsx` → `BinListView` / `BinGridView` | `BinContextMenu` |

**Trigger:** user chooses **Get info** from the row/card kebab menu.

**Outcome:** modal/dialog opens for that `sermonId`; menu closes; list selection unchanged.

---

## Menu specification

### Label and icon

| Property | Value |
| --- | --- |
| Label | `Get info` |
| Icon | `Info` (lucide-react), same size/stroke as other menu icons |
| Role | Read-only; never destructive |

### Menu order (normative)

**My Sermons — `SermonContextMenu`**

```
Get info
────────
Edit
Rename
────────
Share
Download
Analytics
────────
Move to trash
```

**Bin — `BinContextMenu`**

```
Get info
────────
Restore
────────
Empty immediately
```

Rationale: **Get info** is first — safe, read-only, and available before destructive bin actions.

### Props contract (both menus)

Add optional callback (parent owns dialog state):

```ts
onGetInfo?: (sermonId: string) => void;
```

Parent pattern (`SermonsTable`, `Bin.tsx`):

```ts
const [infoSermonId, setInfoSermonId] = useState<string | null>(null);

// menu: onGetInfo={(id) => setInfoSermonId(id)}

<SermonGetInfoDialog
  sermonId={infoSermonId}
  open={infoSermonId !== null}
  onOpenChange={(open) => { if (!open) setInfoSermonId(null); }}
  context="library" | "bin"  // required: publication vs bin rows
  initialTitle={row?.name}   // optional: loading skeleton only
/>
```

---

## Dialog UX (`SermonGetInfoDialog`)

### Chrome

- Reuse studio dark shell tokens aligned with `StudioConfirmDialog` and upload modals:
  - Background `#2b2a2c`, border `#545454/50`, title `#eaeaea`, body `#9d9d9d` / `#bdbdbd`
- **Not** `StudioConfirmDialog` — that component is for confirm/cancel actions. Info dialog is **read-only** with a single **Close** button (outline) or standard dialog dismiss (X).
- Max width: `sm:max-w-lg` (wider than confirm if description is long; scroll body if needed).

### Title bar

- Dialog title: **Sermon info** (fixed).
- Optional subtitle in body: sermon **title** as first line (large/emphasis), not duplicated as dialog `DialogTitle` if it truncates badly — prefer title in body with `DialogTitle` = `Sermon info`.

### Loading

- While `useSermonByIdQuery(sermonId)` is loading: centered spinner + `Loading sermon…` in body.
- Query enabled only when `open && sermonId`.

### Error (summary)

See **[Errors and access](#errors-and-access)** for normative copy, retry rules, and mid-session removal.

### Footer

- Primary action: none (read-only).
- **Close** button dismisses dialog.

---

## Data source and response contract

### HTTP and auth

| Item | Value |
| --- | --- |
| API | `GET /api/v1/sermon/:id` |
| Client (dialog) | `useSermonByIdQuery(sermonId, { enabled: open && Boolean(sermonId) })` |
| Auth | `Protect` + `canAccessSermonDocument` (minister owner or published catalog rules) |
| Cache key | `[...sermonQueryKeys.all, 'detail', sermonId]` |

Bin sermons remain fetchable by id for the owning minister/creator (same as download). **Get info** must work on `/bin` rows; do not assume 404 for `state: deleted`.

### API envelope (wire)

```json
{
  "error": false,
  "errors": [],
  "data": { },
  "message": "Sermon fetched successfully",
  "status": 200
}
```

`data` is the **sermon document root** (mongoose / repository shape), not `{ item: sermon }`.

### Client parse rules (normative)

| Source | What the dialog reads |
| --- | --- |
| `useSermonByIdQuery` | **`query.data` = sermon root** — the hook already returns `res.data` from `IAPIResponse` (no second `.data` unwrap). |
| `fetchSermonDetail` | Returns the same sermon root; used only if dialog refactors to imperative fetch. |
| **Wrong** | `(query.data as { data?: … }).data` — do **not** double-unwrap. |
| Audio / upload | Nested under **`doc.item`** (`itemId`, `uploadStatus`, `duration`, `item` URL, etc.). |
| Duration (display) | `pickSermonDurationSeconds(doc)` — top-level `duration` then `item.duration`. |
| Sermon id (display/copy) | `String(doc.id ?? doc._id ?? sermonId)`. |

Implement mapping in `mapSermonDetailToInfoView(doc, context)` (or equivalent) so the dialog component does not scatter field paths.

### Example — published library sermon (minimal)

```json
{
  "error": false,
  "data": {
    "id": "6a1e8355b3040255e31ad7f9",
    "title": "Faith and Works",
    "description": "Sunday message on James 2.",
    "status": "published",
    "isPublished": true,
    "createdAt": "2026-05-10T09:00:00.000Z",
    "updatedAt": "2026-06-01T14:22:00.000Z",
    "publishedAt": "2026-05-12T10:00:00.000Z",
    "releaseDate": "2026-05-12T10:00:00.000Z",
    "duration": 2847,
    "playCount": 120,
    "likeCount": 8,
    "commentCount": 2,
    "shareableUrl": "https://troott.be/sermon/faith-and-works-abc",
    "item": {
      "itemId": "file-audio-2026-05-10-08-00-00",
      "uploadStatus": "completed",
      "duration": 2847
    }
  },
  "message": "Sermon fetched successfully",
  "status": 200
}
```

After `useSermonByIdQuery`, `query.data` is the inner object keyed by `id`, `title`, `item`, etc.

### Example — processing draft (upload pipeline)

```json
{
  "error": false,
  "data": {
    "id": "7b2f9466c4151366e42c8e0",
    "title": "Untitled sermon",
    "description": "",
    "status": "draft",
    "isPublished": false,
    "createdAt": "2026-06-02T08:10:00.000Z",
    "updatedAt": "2026-06-02T08:13:00.000Z",
    "duration": 0,
    "item": {
      "itemId": "file-audio-2026-06-02-08-13-37",
      "uploadStatus": "extracting",
      "duration": 0
    }
  },
  "message": "Sermon fetched successfully (cached)",
  "status": 200
}
```

**Processing row:** read `doc.item.uploadStatus` → `formatUploadPipelineLabel(uploadStatus)`; hide row when util returns `null`.

### Refetch on open

When the dialog opens (`open` transitions to `true`), the detail query should use **`refetchOnMount: 'always'`** (and `staleTime: 0` while open) so rename/trash/processing updates from the same session are visible. Do not rely on a stale list row alone.

---

## Share link (Get info vs Share menu)

Today **Share** on `/sermons` copies a **listener URL** built in the client:

```ts
`${window.location.origin}/sermon/${sermonId}`
```

It does **not** use `shareableUrl` from the API. **Get info** must not introduce a second, conflicting “official” link.

### Normative resolver (v1)

Single helper used for **display** and **Copy** in the dialog (e.g. `resolveStudioSermonShareLink(doc, sermonId)`):

| Step | Rule |
| --- | --- |
| 1 | Let `apiUrl = trim(doc.shareableUrl)`. If `apiUrl` is a non-empty absolute `http:` or `https:` URL, use **`apiUrl`**. |
| 2 | Otherwise use **`${window.location.origin}/sermon/${sermonId}`** (same as **Share** today). |

### UI

| Label | Value |
| --- | --- |
| Row label | **Share link** |
| Display | Truncated resolved URL (monospace or break-all in scroll area) |
| **Copy** | Copies resolved URL; toast `Link copied to clipboard.` (match **Share**) |

Do not show two URL rows in v1. Optional v1.1: footnote when `shareableUrl` differs from listener fallback.

**Share menu:** unchanged in v1; may later call the same helper for consistency (out of scope for feat-0020).

---

## Bin status display (publication vs In bin)

`GET /sermon/:id` for a binned sermon still returns **pre-bin** `status` / `isPublished`. Showing **Publication: Published** next to **In bin** is misleading (implies live in catalog).

### When `context === 'library'` (`/sermons`)

| Row | Rule |
| --- | --- |
| **Publication** | **Published** or **Draft** — same rules as `mapApiSermonToTableRow` (`status` / `isPublished`). |
| **Location** | **Omit** (do not show “Library”). |

### When `context === 'bin'` (`/bin`)

| Row | Rule |
| --- | --- |
| **Location** | **In bin** (required; from UI context, not API). |
| **Library status** | One row only — label **Library status**, value **Was published** or **Was draft** (derive with the same draft/published logic as the list mapper). |
| **Publication** | **Do not show** a row titled “Publication” or “Published”. |

Copy rationale in UI (optional muted line under **Location**): “Not in your sermon library until restored.”

### `state` / `ContentState`

If `doc.state === 'deleted'` (or `status === 'deleted'`), treat as consistent with **In bin** when `context === 'bin'`. Do not show a separate “Deleted” row in v1 unless product adds it in a follow-up.

---

## Errors and access

### API behavior

| Case | HTTP | Typical `message` | User can fix? |
| --- | --- | --- | --- |
| Not found / no access | **404** | `sermon not found` (minister cannot access) | No |
| Network / 5xx | varies | generic or none | Retry may help |
| Success | **200** | `Sermon fetched successfully` | — |

The API does not distinguish “wrong id” vs “forbidden” in the client envelope today; use one **not found** pattern for 404.

### Dialog error UI

| Failure type | Inline message | **Retry** | **Close** |
| --- | --- | --- | --- |
| **404** / not found | `This sermon could not be found. It may have been removed.` | **Hidden** | Shown |
| Network / timeout / 5xx | `Could not load sermon details. Check your connection and try again.` | **Shown** (calls `refetch`) | Shown |
| Unknown | `Could not load sermon details.` | Shown | Shown |

- Toast optional for unexpected errors; **inline message is required**.
- Do not leave a blank dialog body on error.

### Sermon removed while dialog is open

If a refetch returns **404** (e.g. user **Empty immediately** from another tab, or list action completed while dialog open):

1. Replace body with the **404** inline state above.
2. **Hide Retry**.
3. On **Close**, clear `infoSermonId` and let the host list refetch as it already does after mutations.

### Initial load vs `initialTitle`

Host may pass **`initialTitle`** from the list row for the loading skeleton only. On **404**, do not keep showing a title as if the sermon still exists.

---

## Fields to display (v1)

Show a **definition list** (label / value rows). Omit row when value is empty after normalization. Order top-to-bottom:

| Label | Source (priority order) | Format |
| --- | --- | --- |
| **Title** | `title` | Plain text |
| **Description** | `description` | Plain text; max ~4 lines with scroll if longer; omit row if empty |
| **Publication** | `status` / `isPublished` | **Library context only** — `Published` or `Draft` (see [Bin status display](#bin-status-display-publication-vs-in-bin)) |
| **Visibility** | `visibility`, fallback `isPublic` | **Library context only** — `Public`, `Private`, or `Unlisted` via `normalizeSermonVisibility` from [feat-0021](../feat-0021/SERMON_LIST_VISIBILITY_SPEC.md); hide until API ships `visibility` |
| **Library status** | `status` / `isPublished` | **Bin context only** — `Was published` or `Was draft` |
| **Location** | UI `context` | **Bin context only** — `In bin` |
| **Duration** | `duration`, `item.duration` | `pickSermonDurationSeconds` + `formatSecondsToLabel` (reuse list util) |
| **Processing** | `item.uploadStatus` | `formatUploadPipelineLabel` (`upload-pipeline-label.util.ts`); hide row if null |
| **Date created** | `createdAt` | Locale date/time |
| **Last updated** | `updatedAt` | Locale date/time |
| **Release date** | `releaseDate` | Locale date; hide if absent |
| **Published** | `publishedAt` | Locale date/time; hide if absent |
| **Plays** | `playCount` | Integer; `—` if missing |
| **Likes** | `likeCount` | Integer |
| **Comments** | `commentCount` | Integer |
| **Sermon ID** | `id` / `_id` | Monospace; **Copy** affordance (clipboard + toast) |
| **Upload reference** | `item.itemId` | Show when present; copy optional |
| **Share link** | `resolveStudioSermonShareLink` | See [Share link](#share-link-get-info-vs-share-menu); always show row; **Copy** uses resolved URL |

**Optional v1.1 (not blocking v1):** `code`, `slug`, `tags`, `language`, `preachedAt`, minister name(s), thumbnail preview, **Moved to bin** date (`deletedAt` on API).

### Bin-specific (actions)

Restore / Empty remain **only** in the kebab menu, not inside the info dialog (v1).

---

## Interaction with other menu actions

| Action | Relationship to Get info |
| --- | --- |
| Edit | Independent; Edit still navigates to upload flow |
| Share | Dialog **Share link** uses [resolver](#share-link-get-info-vs-share-menu); matches **Share** when `shareableUrl` absent |
| Download | Independent |
| Analytics | Independent |
| Move to trash / Restore / Empty | Independent |

Opening **Get info** must not clear row selection or change list filters.

---

## Component plan (web)

| Module | Role |
| --- | --- |
| `SermonGetInfoDialog.tsx` | Read-only dialog; query, field rows, copy buttons |
| `sermon-info-map.util.ts` | `mapSermonDetailToInfoView(doc, context)` + `resolveStudioSermonShareLink(doc, sermonId)` |
| `SermonContextMenu.tsx` | Add **Get info** item + `onGetInfo` prop |
| `BinContextMenu.tsx` | Add **Get info** item + `onGetInfo` prop |
| `SermonsTable.tsx` | `infoSermonId` state; pass `onGetInfo` to list/grid |
| `Bin.tsx` | Same state + dialog host |
| `useSermon.ts` | Reuse `useSermonByIdQuery` (no new hook required) |

**Reuse:**

- `formatUploadPipelineLabel` — `apps/web/src/utils/upload-pipeline-label.util.ts`
- `pickSermonDurationSeconds` — `apps/web/src/utils/sermon-list-map.util.ts`
- Dialog primitives — `@/components/ui/dialog`
- Typography — `UPLOAD_SHELL` / `MY_SERMONS_PAGE` muted tokens where applicable

---

## API audit

| Capability | Status |
| --- | --- |
| `GET /sermon/:id` | **Exists** — sufficient for v1 |
| List row fields only | Insufficient for info dialog — detail fetch required on open |
| Bin-only fields on detail | Not guaranteed on document; **Location: In bin** comes from UI context when opened from bin |

No backend change required for v1 unless product later needs `deletedAt` / bin timestamp on detail payload.

---

## Acceptance criteria

### Menu

- [ ] **Get info** appears on every `SermonContextMenu` in list and grid on `/sermons`.
- [ ] **Get info** appears on every `BinContextMenu` in list and grid on `/bin`.
- [ ] Menu order matches normative sections above.
- [ ] Choosing **Get info** opens the dialog for the correct `sermonId`.

### Dialog

- [ ] Dialog uses studio dark styling consistent with `StudioConfirmDialog`.
- [ ] Loading and error states are handled without leaving a blank modal.
- [ ] Title, duration, publication / library status / location (per context), dates, engagement counts, ID, and processing label (when applicable) render from API data per [response contract](#data-source-and-response-contract).
- [ ] **Share link** row uses resolver; copy matches **Share** when API has no `shareableUrl`.
- [ ] Bin rows show **In bin** + **Was published** / **Was draft**, not **Publication: Published**.
- [ ] Copy sermon ID works with success toast.
- [ ] **404**: no Retry; **network error**: Retry + refetch.
- [ ] **Close** and overlay dismiss end the dialog and clear `infoSermonId`.

### Regression

- [ ] Existing menu actions on `/sermons` and `/bin` behave unchanged.
- [ ] No extra detail fetch until dialog opens (`enabled: open && Boolean(sermonId)`).

---

## Test plan (manual)

1. `/sermons` list — open **Get info** on draft and published rows; verify publication label and processing row when upload in progress.
2. `/sermons` grid — same from card kebab.
3. `/bin` — **Get info** shows **In bin**; Restore/Empty still only in menu.
4. Copy sermon ID and **Share link**; with empty `shareableUrl`, copied URL matches **Share** menu.
5. Sermon with `shareableUrl` set — dialog shows and copies API URL.
6. Slow network — loading state; **404** on open — message, no Retry; **offline/5xx** — Retry works.
7. Open info on bin published sermon — **Was published** + **In bin**, not **Publication: Published**.
8. Open info, close, open another row — correct sermon loads (no stale title).
9. Open info, empty sermon from bin in another flow — refetch 404 shows removed state.

---

## Related specs

| Doc | Link |
| --- | --- |
| feat-0019 bin parity | `specs/web/feature/feat-0019/BIN_UI_PARITY_SPEC.md` — update row menu table when implementing |
| feat-0019 product | `specs/web/feature/feat-0019/PRODUCT.md` |
| feat-0018 upload status labels | `specs/web/feature/feat-0018/UPLOAD_STATUS_POLLING_SPEC.md` — `uploadStatus` semantics |
| Web API client | `apps/web/docs/adr/0001-web-api-client.md` — `getSermonById` |

---

## Implementation notes (for engineers)

1. Prefer **one dialog instance** per page host (not per row) to avoid N mounted queries.
2. **`useSermonByIdQuery` → `data` is the sermon root** — read `doc.item` for audio/upload only; see [Client parse rules](#client-parse-rules-normative).
3. Keep menu components presentational; parents own `infoSermonId`.
4. Do not add `console.log` fallbacks for `onGetInfo` (production standard from feat-0019).
5. Classify query errors: treat `Error` message containing `404` or axios `response.status === 404` as not-found (hide Retry).

---

## Changelog

| Date | Change |
| --- | --- |
| 2026-06-02 | Initial spec — Get info on `/sermons` and `/bin` three-dot menus |
| 2026-06-02 | API response contract, share-link resolver, bin status rows, errors/access |
| 2026-06-02 | Added **Visibility** field row (read-only) when [feat-0021](../feat-0021/SERMON_LIST_VISIBILITY_SPEC.md) API ships |
