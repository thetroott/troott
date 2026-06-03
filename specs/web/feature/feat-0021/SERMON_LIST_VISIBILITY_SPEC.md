# feat-0021: My Sermons list — visibility column + change modal

## Summary

Add a **Visibility** column to the studio **My Sermons** list view (`/studio/{studioCode}/sermons`) populated from `GET /api/v1/sermon/minister/:ownerId` (minister/creator owner list).

Each row shows the current visibility (**Public**, **Private**, **Unlisted**). On **row hover**, the cell reveals a **chevron** control that opens a **modal** with a dropdown to change visibility — same three values as the product/API contract (`public`, `private`, `unlisted`).

Implements list-surface coverage for [UC-V5](../../05%20-%20%20sermon-view-trash.md#uc-v5) (change visibility on published sermons) and aligns with upload **Listener settings** (`ListenerSettings.tsx`).

---

## Problem

| Today | Gap |
| --- | --- |
| `SermonsListView` columns: Sermon, Date Created, Status, Plays, Comments, Likes, Actions | No **Visibility** column |
| `mapApiSermonToTableRow` does not map visibility | List cannot display or edit access level |
| `ListenerSettings` exposes Public / Unlisted / Private in upload wizard | No equivalent **inline** control on library list |
| Companion doc [`05 — sermon-view-trash`](../../05%20-%20%20sermon-view-trash.md) expects “visibility icon” on rows | Not implemented on web |

---

## Goals

1. **Visibility column** on list view only (v1), between **Status** and **Plays**.
2. **Readable default**: show human label (`Public` / `Private` / `Unlisted`) without opening the modal.
3. **Hover affordance**: on row hover, show a **chevron** button in the visibility cell that opens the change modal (keyboard-accessible; not hover-only for activation).
4. **Change modal**: shadcn `Dialog` + `Select` with three options; **Save** persists via existing update API; **Cancel** dismisses without mutation.
5. **List refresh** after successful save (TanStack invalidation — same as rename).
6. **Production behavior**: no toast-only stubs; no fake “Unlisted” if API cannot store it.

## Non-goals (v1)

- **Grid view** visibility chip (follow-up; list first).
- **Bin** visibility column (bin rows are trashed; visibility edit is library-only unless product expands).
- Bulk visibility for multi-select.
- Schedule / publish-date controls in the same modal (UC-V5 schedule is separate).
- Mobile studio.
- **Toolbar filter by visibility** (public / private / unlisted) — deferred; status filter remains draft/published/all only.
- **Change visibility** from row three-dot menu (deferred to v1.1; v1 = column chevron only — see [Entry points](#entry-points-v1)).

---

## Figma reference

| Node | Link | Role |
| --- | --- | --- |
| `10154:35090` | [My Sermons empty table](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35090) | Empty shell must include **Visibility** column header |
| `10209:78627` | [Library + drafts](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10209-78627) | Populated rows — companion doc expects **visibility** on rows |

**v1 icon policy:** Companion [`05 — UC-V1`](../../05%20-%20%20sermon-view-trash.md#uc-v1) mentions a **visibility icon**. Ship **text label + chevron on hover** in v1; add per-value icon (globe / lock / link) when design tokens are confirmed in Figma QA.

---

## Engineering constraints (production)

- No toast-only or no-op visibility change.
- No **Unlisted** in UI until API reads/writes `visibility`.
- No `console.log` fallbacks on chevron or menu handlers.
- Row label updates **only after** successful mutation + refetch (no optimistic visibility).
- One **shared** `SermonChangeVisibilityDialog` instance per `SermonsTable` (not per row).

---

## Route and data

| Item | Value |
| --- | --- |
| Page | `/studio/:studioCode/sermons` |
| Host | `MySermons.tsx` → `SermonsTable` → `SermonsListView` |
| List API | `GET /api/v1/sermon/minister/:ownerId` |
| Query params | Existing: `page`, `limit`, `sort`, `q`, `status`, `dateFrom`, `dateTo` |
| Detail (optional prefetch) | `GET /api/v1/sermon/:id` |
| Update | `PUT /api/v1/sermon/update/:id` |

---

## API contract

### Product values (canonical)

| UI label | API value | Listener behavior (product) |
| --- | --- | --- |
| Public | `public` | Discoverable in browse/search; `shareableUrl` works for listeners |
| Unlisted | `unlisted` | **Not** listed in browse/search; **direct `shareableUrl` still works** |
| Private | `private` | Owner/studio only; listeners without access must not play via public link |

### Share link behavior after save (UC-V5)

Normative listener-facing outcomes after a successful visibility update:

| Transition | Product behavior |
| --- | --- |
| → **Public** | Sermon discoverable; existing share links remain valid |
| → **Unlisted** | Removed from discovery surfaces; **link holders can still open** the sermon |
| → **Private** | Not discoverable; non-owners should not access via prior public/unlisted links (API/auth enforces) |
| **Public →** private/unlisted | Show downgrade confirm (see modal); warn that search indexing and cached shares may lag (**eventual consistency** per [UC-V5 A1](../../05%20-%20%20sermon-view-trash.md#uc-v5)) |

**Modal v1 (recommended):** When current or selected value is `public` or `unlisted` and `shareableUrl` is present, show read-only **Shareable link** row with **Copy** (same clipboard + toast pattern as **Share** in `SermonsTable`).

Mirror playlist pattern: `PlaylistVisibility` in `apps/api/src/interfaces/core/playlist.interface.ts` (`public` \| `private` \| `unlisted`).

### Current API state (audit)

| Layer | Field today | Supports 3-way visibility? |
| --- | --- | --- |
| Mongoose `sermon.model.ts` | `isPublic: boolean` | **No** — cannot distinguish unlisted vs private |
| `SermonDTO` / `UpdateSermonDTO` | `isPublic?: boolean` | **No** |
| `PublishSermonDTO` | `isPublic: boolean` | **No** |
| Upload `ListenerSettings` | Maps UI to `isPublic` only; unlisted → `isPublic: false` | **Partial** — same boolean gap |

### Required API addition (blocking for correct v1)

Add sermon **visibility** enum (recommended name: `SermonVisibility`), aligned with playlist:

```ts
export enum SermonVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
}
```

| Surface | Change |
| --- | --- |
| `ISermonDoc` / sermon schema | `visibility: { type: String, enum: [...], default: 'public', index: true }` |
| `SermonDTO`, list mapper, minister list response | Include `visibility` on each sermon |
| `UpdateSermonDTO`, `PublishSermonDTO` | Accept `visibility?: SermonVisibility` |
| Write path | Persist `visibility`; set `isPublic = visibility !== 'private'` for legacy queries |
| Read path | Return `visibility`; backfill migration: `isPublic === true` → `public`, else `private` until unlisted data exists |
| `sermon.mapper.ts` (or equivalent) | Map `visibility` on `SermonDTO` and minister list payloads |
| `updateSermon` controller | Accept `visibility`; validate enum; owner check via `isSermonOwnedByUser` |
| `handlePublishSermon` / publish DTO | Accept `visibility` on publish and draft save |
| Discovery / search | `public` indexed; `unlisted`/`private` excluded from browse (API/search layer — document in API feat, not web-only) |
| Legacy `isPublic` | Keep synced: `isPublic = (visibility !== 'private')` for old clients; new clients prefer `visibility` |

**Migration (API):** One-time backfill: `isPublic === true` → `visibility: public`; `isPublic === false` → `visibility: private` (no historical unlisted until users set it).

**Do not ship** list UI that offers **Unlisted** until `visibility` is returned and writable on update. Interim boolean-only mapping would lie to users.

### Update request (web)

```http
PUT /api/v1/sermon/update/:sermonId
Authorization: Bearer …
Content-Type: application/json

{
  "visibility": "unlisted"
}
```

Success: `200` + updated sermon; client invalidates `sermonQueryKeys.ministerListRoot(ownerId)` and `sermonQueryKeys.all`.

Errors: surface API `message` (policy, auth, validation).

| HTTP / case | UX |
| --- | --- |
| 403 / not owner | Toast: permission message; close modal |
| 404 | Toast; optional refetch list |
| 400 invalid `visibility` | Toast; keep modal open |
| Network | Toast; keep modal open; allow retry Save |

**Owner scope:** Same as list — `resolveStudioSermonOwnerId(user, minister?.id, creatorId)`; only sermons owned by that scope are editable.

---

## List column — UI specification

### Placement

Insert column in `SermonsListView` **after Status**, **before Plays**.

Update `<colgroup>` widths to match Figma/table rhythm (suggested width ~120–140px for visibility).

### Header

| Property | Value |
| --- | --- |
| Text | `Visibility` |
| Sortable | No (v1) |

### Cell — default (no hover)

| Property | Value |
| --- | --- |
| Content | Capitalized label from API: `Public`, `Private`, `Unlisted` |
| Typography | Match `MY_SERMONS_LIST.stat` / status-adjacent secondary text |
| Icon (v1) | Text label required; per-value icon optional until Figma QA (see [Figma reference](#figma-reference)) |

### Cell — row hover

| Property | Value |
| --- | --- |
| Trigger | Row has `group/sermon-row` (existing) |
| Chevron | `ChevronDown` (or `ChevronRight` per Figma); visible `opacity-0 group-hover/sermon-row:opacity-100` |
| Button | `type="button"`, `aria-label="Change visibility for {title}"` |
| Layout | Label left, chevron right in cell flex row |
| Focus | Chevron also visible on `:focus-visible` within cell (not hover-only) |

Clicking chevron opens **Change visibility** modal for that `sermonId`. Click does not propagate to row edit.

### Draft rows

| `publicationStatus` | Visibility cell behavior |
| --- | --- |
| `draft` | Show current visibility if API returns it; allow change if update API permits drafts |
| `published` | Full UC-V5 behavior including downgrade confirm |

If API rejects visibility change on drafts, disable chevron + show tooltip: “Publish sermon to change visibility” (exact copy TBD in implementation).

### Processing / pipeline rows

When `item.uploadStatus` is non-terminal (`uploaded`, `extracting`, `processing`):

| Policy (v1 normative) | Behavior |
| --- | --- |
| **Disable edit** | Chevron disabled; tooltip: “Finish processing before changing visibility” |
| Rationale | Visibility is a distribution rule; avoid conflicting with in-flight transcode/metadata jobs |

Re-enable chevron when `uploadStatus` is `completed`, `failed`, or `cancelled` (failed/cancelled may still block publish rules — follow API).

### Busy state

While `useUpdateSermonMutation` is pending for a `sermonId`:

- Disable that row’s chevron (and Save in modal if open).
- Optional row-level subtle pending indicator (not required v1).

### Empty table shell

`MySermonsEmptyTableSection` / `MySermonsEmptyShell` must render the **Visibility** column header in the empty table chrome (same column order as populated list) so layout does not shift when rows load.

---

## Entry points (v1)

| Entry | v1 | Notes |
| --- | --- | --- |
| List cell chevron | **In scope** | Primary UC-MS-VIS02 path |
| `SermonContextMenu` → Change visibility | **Deferred v1.1** | Same `SermonChangeVisibilityDialog`; avoids duplicating UC-V5 “edit modal” path in v1 |
| Upload `ListenerSettings` | **Align in same API PR** | Must send/read `visibility` enum (see below) |
| Bulk selection toolbar | **Non-goal** | [UC-V9](../../05%20-%20%20sermon-view-trash.md) future |

---

## Cross-surface visibility contract

All studio surfaces must use **one** helper module (`sermon-visibility.util.ts`):

| Surface | Requirement |
| --- | --- |
| List column + change modal | `normalizeSermonVisibility`, `visibilityLabel`, enum type |
| `ListenerSettings.tsx` | Dispatch `visibility` in upload context (replace boolean-only `isPublic` mapping for unlisted) |
| `ReviewSubmit` / publish | `POST /sermon/publish/:id` body includes `visibility` |
| [feat-0020 Get info](../feat-0020/SERMON_GET_INFO_SPEC.md) | Read-only **Visibility** row when feat-0021 API ships |
| Web DTOs | `SermonDTO`, `UpdateSermonDTO`, `PublishSermonDTO` include `visibility?: SermonVisibility` |

---

## Change visibility modal

### Shell

| Property | Value |
| --- | --- |
| Component | shadcn `Dialog` / `DialogContent` / `DialogHeader` / `DialogFooter` |
| Title | `Change visibility` |
| Description (optional) | One line: who can find and listen to this sermon |

### Dropdown

Reuse pattern from `ListenerSettings.tsx` (`Select` + `SelectItem`):

| Value | Label | Helper (description under label or in item subtitle) |
| --- | --- | --- |
| `public` | Public | Anyone can find and listen |
| `unlisted` | Unlisted | Only people with the link can listen |
| `private` | Private | Only you can listen |

Initial value: sermon’s current `visibility` from row data (or detail fetch if list payload omits field).

### Actions

| Button | Behavior |
| --- | --- |
| Cancel | Close dialog; no mutation |
| Save | `useUpdateSermonMutation({ id, payload: { visibility } })`; disable while pending; close on success |

### Downgrade confirmation (UC-V5)

When changing **from** `public` **to** `private` or `unlisted`:

1. Show `StudioConfirmDialog` (same family as move-to-trash) **before** save, or
2. Inline warning in modal with required confirm.

Copy (normative intent): warn that the sermon may disappear from search and existing public links may behave differently.

### Feedback

| Outcome | UX |
| --- | --- |
| Success | Toast: `Visibility updated.` + invalidate list queries |
| API error | Toast with `message`; keep modal open with selection preserved |
| Partial / unknown | No optimistic row update until success |

---

## Data model (web)

Extend table row type (`Sermon` in `@/_data/dummySermons` or local row interface):

```ts
visibility: 'public' | 'private' | 'unlisted';
```

`mapApiSermonToTableRow`:

```ts
visibility: normalizeSermonVisibility(raw.visibility, raw.isPublic),
```

`normalizeSermonVisibility` rules:

1. If `raw.visibility` is valid enum string → use it.
2. Else if `raw.isPublic === true` → `public`.
3. Else if `raw.isPublic === false` → `private` (legacy only; remove when API always sends `visibility`).
4. Default → `public`.

---

## Component map (implementation)

| Module | Role |
| --- | --- |
| `apps/web/src/components/shared/my-sermons/SermonsListView.tsx` | New column + hover chevron |
| `apps/web/src/components/shared/my-sermons/SermonVisibilityCell.tsx` | **New** — label, chevron, opens modal |
| `apps/web/src/components/shared/my-sermons/SermonChangeVisibilityDialog.tsx` | **New** — dialog + select + save |
| `apps/web/src/utils/sermon-list-map.util.ts` | Map `visibility` on list rows |
| `apps/web/src/utils/sermon-visibility.util.ts` | **New** — normalize + label helpers |
| `apps/web/src/hooks/app/useSermon.ts` | Reuse `useUpdateSermonMutation` |
| `apps/web/src/dtos/sermon.dto.ts` | Add `visibility` to `SermonDTO` / `UpdateSermonDTO` when API ships |
| `apps/api/...` | Schema + DTO + update handler (prerequisite) |

`SermonsTable` hosts dialog state (same pattern as rename + feat-0020 Get info):

```ts
const [visibilitySermonId, setVisibilitySermonId] = useState<string | null>(null);

<SermonChangeVisibilityDialog
  sermonId={visibilitySermonId}
  open={visibilitySermonId !== null}
  onOpenChange={(open) => { if (!open) setVisibilitySermonId(null); }}
  initialVisibility={rowFromList?.visibility}
/>
```

Detail fetch on open is **optional** if list payload includes `visibility`; use `useSermonByIdQuery` with `enabled: open && Boolean(sermonId)` when list omits field.

### Interaction with other list actions

| Action | Relationship |
| --- | --- |
| Rename dialog | Only one modal at a time; opening visibility closes rename (and vice versa) |
| Get info (feat-0020) | Independent; info shows read-only visibility when API ships |
| Edit / resume | Independent; does not auto-open visibility modal |
| Share | Modal may show copyable `shareableUrl`; Share menu still uses existing copy behavior |
| Move to trash | Independent |
| Filters / pagination / selection | Unchanged by visibility edit |

---

## Implementation notes

1. Prefer **one dialog instance** per `SermonsTable` (not N per row).
2. Parse list `visibility` via `normalizeSermonVisibility` only — do not branch ad hoc in the cell.
3. On Save success: invalidate `sermonQueryKeys.ministerListRoot(ownerId)` and `sermonQueryKeys.all`.
4. Return focus to the triggering chevron on modal close (a11y).
5. `aria-live="polite"` optional on success toast only; do not announce on every hover.

---

## User flows

### UC-MS-VIS01 — View visibility on list

1. User opens My Sermons with at least one row.
2. List shows **Visibility** column with correct label per sermon.

### UC-MS-VIS02 — Change visibility from list

1. User hovers row → chevron appears in visibility cell.
2. User clicks chevron → modal opens with current value selected.
3. User picks new visibility → Save.
4. If downgrade from public → confirm dialog → confirm.
5. API succeeds → modal closes → row shows new label without full page reload.

### UC-MS-VIS03 — Keyboard / a11y

1. User tabs to chevron in visibility cell → activates with Enter/Space → modal opens.
2. Dialog traps focus; Escape closes without save.
3. `Select` has visible label / `aria-label` tied to “Visibility”.
4. Focus returns to chevron after Close/Cancel/success dismiss.

### UC-MS-VIS04 — Downgrade from public

1. User changes public → unlisted or private.
2. `StudioConfirmDialog` (or inline confirm) warns about search removal and link/cache lag.
3. On confirm → Save → API success → toast + updated row label.

---

## Acceptance criteria

### Column and shell

- [ ] **Visibility** column on list view between Status and Plays (populated + empty shell header).
- [ ] Labels **Public / Private / Unlisted** from API `visibility` (not inferred incorrectly for unlisted).
- [ ] Row hover shows chevron; keyboard can open modal without hover-only dependency.

### Modal and API

- [ ] Modal offers exactly three enum values; Save calls `PUT /sermon/update/:id` with `{ visibility }`.
- [ ] List refreshes via query invalidation; no optimistic label before success.
- [ ] Downgrade from **public** requires explicit confirmation (UC-V5 / A1 copy intent).
- [ ] 403/404/400 surfaced via toast; modal preserves selection on error.
- [ ] Processing rows: chevron disabled with tooltip until pipeline terminal (per policy above).

### Cross-surface and production

- [ ] `ListenerSettings` + publish path send `visibility` when API ships (same enum).
- [ ] feat-0020 Get info shows read-only **Visibility** row (see feat-0020 spec).
- [ ] No stub/no-op; no fake unlisted on boolean-only API.
- [ ] Grid view unchanged in v1.

### Regression

- [ ] Rename, Share, Download, Analytics, move to trash unchanged.
- [ ] Filters, sort, pagination, selection unchanged after visibility save.
- [ ] Only one of rename / visibility / get-info modals open at a time.

---

## Test plan (manual)

1. Published row — change public → unlisted → private; confirm downgrade dialog on public exit.
2. Draft row — visibility shown; edit allowed or disabled per API (tooltip if disabled).
3. Row in `extracting` / `processing` — chevron disabled.
4. Copy shareable link from modal when URL present (unlisted/public).
5. 403 as non-owner (if testable) — error toast, modal closes or stays per UX table.
6. Empty library shell — Visibility header visible before first sermon.
7. Refetch after save — label matches GET list without hard reload.
8. Open rename, then visibility — only one modal active.

---

## Related specs

- [feat-0018 PRODUCT](../feat-0018/PRODUCT.md) — My Sermons library shell
- [feat-0019 PRODUCT](../feat-0019/PRODUCT.md) — sermon CRUD parity
- [feat-0020 SERMON_GET_INFO_SPEC](../feat-0020/SERMON_GET_INFO_SPEC.md) — row menu read-only detail
- [`04 - sermon-upload-draft.md`](../../04%20-%20sermon-upload-draft.md#uc-u5) — UC-U5 visibility at publish
- [`05 - sermon-view-trash.md`](../../05%20-%20%20sermon-view-trash.md#uc-v5) — UC-V5 change visibility

---

## Implementation order

1. **API**: `SermonVisibility` + schema + migration + mapper + update/publish + list response (blocking).
2. **Shared util**: `sermon-visibility.util.ts` + DTO types (web + api).
3. **Web map**: `visibility` on table row + empty shell column.
4. **UI**: column + cell + single dialog host + mutation + invalidation + downgrade confirm.
5. **Cross-surface**: `ListenerSettings`, publish payload, feat-0020 Get info visibility row.
6. **Follow-up (v1.1)**: grid badge; `SermonContextMenu` → Change visibility; toolbar visibility filter.

---

## Changelog

| Date | Change |
| --- | --- |
| 2026-06-02 | Initial spec — list visibility column + change modal |
| 2026-06-02 | Added UC-V5 share-link behavior, auth/errors, processing policy, cross-surface contract, feat-0020 linkage, test plan, Figma refs, production constraints |
