# feat-0019: Tech Spec — web sermon CRUD + bin bulk operations

## Context

See [`PRODUCT.md`](./PRODUCT.md). This spec maps full web CRUD to current code paths and defines required API/client additions for bin bulk actions.

## Engineering constraint: production app, no legacy path

Implementation under `feat-0019` must ship production-grade behavior only:

- No placeholder route content in canonical CRUD entry points.
- No stubbed row actions (toast-only/no-op) for actions visible in UI.
- No reliance on transient navigation state for resume/edit/deep-link flows.
- No parallel legacy CRUD path retained once canonical behavior is implemented.

If work is not completed in this feature, it must be deferred via linked feature spec with owner + target release; do not leave ambiguous TODO behavior in shipping surfaces.

Primary references:

- Library/upload baseline: [feat-0018 TECH](../feat-0018/TECH.md)
- CRUD/API baseline: [feat-0006 TECH](../feat-0006/TECH.md)
- Single-flight upload: [feat-0008 TECH](../feat-0008/TECH.md)

---

## Route map (web)

| Route under `/studio/:studioCode` | Component (current) | CRUD role |
| ---------------------------------- | ------------------- | --------- |
| `sermons` | `MySermons` + `SermonsTable` | Read/create-entry/update/delete-to-bin |
| `sermons/upload` + segments | `SermonUploadPage` + `UploadModal` | Create/update/publish/draft |
| `sermons/:sermonId` (+ resume/edit) | placeholder/resume flow | Read/update |
| `bin` | `Bin` | Read bin + restore + hard delete (single), bulk to add |

---

## Existing API surface

From `apps/web/src/api/clients/sermon.ts` and `apps/web/src/api/core/paths.ts`:

| Operation | Method | Path |
| --------- | ------ | ---- |
| Start upload | POST | `/sermon/start-upload` |
| Upload cover | POST | `/sermon/image-upload` |
| Read sermon | GET | `/sermon/:id` |
| Read owner list | GET | `/sermon/minister/:ownerId` |
| Update sermon | PUT | `/sermon/update/:id` |
| Publish or save draft | POST | `/sermon/publish/:id` |
| Move to bin | PUT | `/sermon/move-to-bin/:id` |
| Restore one | PUT | `/sermon/restore/:id` |
| Delete one forever | DELETE | `/sermon/delete/:id` |

### Current gap

Bulk bin operations are **not implemented on the API**. The web client already defines `restoreSermons`, `deleteSermons`, `restoreAllSermons`, and `deleteAllSermons` in `sermon.ts`, but `sermon.router.ts` only exposes single-id restore/delete.

| Client method | Proposed path (today) | API route exists? |
| --- | --- | --- |
| `restoreSermonFromBin(id)` | `PUT /sermon/restore/:id` | Yes |
| `deleteSermon(id)` | `DELETE /sermon/delete/:id` | Yes |
| `restoreSermons(ids)` | `PUT /sermon/restore` | No |
| `deleteSermons(ids)` | `DELETE /sermon/delete` | No (also collides with `/:id` if mounted naively) |
| `restoreAllSermons(...)` | `PUT /sermon/restore-all` | No |
| `deleteAllSermons(...)` | `DELETE /sermon/delete-all` | No |

Interim: `Bin.tsx` may loop single-id endpoints (current behavior). Prefer new `/restore/bulk` and `/delete/bulk` paths when implementing API (see bin spec).

---

## Required API additions for this feat

Add bulk endpoints (or equivalent RPC contract) for bin:

| Operation | Method | Proposed path | Body |
| --------- | ------ | ------------- | ---- |
| Restore marked | PUT | `/sermon/restore` | `{ ids: string[] }` |
| Delete marked forever | DELETE | `/sermon/delete` | `{ ids: string[] }` |
| Restore all in scope | PUT | `/sermon/restore-all` | `{ ownerId, filters }` |
| Delete all in scope | DELETE | `/sermon/delete-all` | `{ ownerId, filters }` |

### Response contract (bulk)

```ts
interface BulkMutationResult {
  successCount: number;
  failedIds: string[];
  message?: string;
}
```

Rationale: supports partial-failure UX and clear toast summaries.

---

## Client architecture requirements

## Library (`/sermons`)

Keep current architecture with explicit CRUD rules:

- `MySermons.tsx`: server-driven query params (`q`, `status`, sort, date, page)
- `SermonsTable.tsx`: UI controls + row actions
- `useSermon.ts` mutations:
  - `useUpdateSermonMutation`
  - `usePublishSermonMutation`
  - `useMoveSermonToBinMutation`

### `/sermons` control surface requirements

| Control | Source state | API/query behavior |
| ------- | ------------ | ------------------ |
| Search input | `searchInput` + debounced value | Sends `q` and resets page to 1 |
| Status filter | `all` / `draft` / `published` | Sends `status` (omit when `all`) |
| Date range | `dateFrom`, `dateTo` | Sends dates and resets page |
| Sort | active sort key | Sends `sort` |
| Grid/list toggle | local persisted key | UI-only layout switch, same data |
| Pagination | `page`, `limit` | Server page request with active filters |

### `/sermons` state transitions

| Trigger | Required transition |
| ------- | ------------------- |
| Search changed | Debounce, set page=1, fetch |
| Filter changed | set page=1, fetch |
| Sort changed | set page=1, fetch |
| View mode changed | Persist local preference only |
| Mutation success | Invalidate query roots and refresh visible list |

### Row action mapping

| UI action | Handler | Mutation |
| --------- | ------- | -------- |
| Edit/resume | `handleEdit` | open upload resume |
| Rename/update | `submitRename` | `updateSermon` |
| Save draft/publish | `ReviewSubmit` flow | `publishSermon` |
| Move to trash | `handleMoveToTrash` | `moveSermonToBin` |
| Analytics | existing feat-0017 route | navigation only |
| Share | `handleShare` | client clipboard copy |
| Download | `handleDownload` | fetch sermon detail then open playback URL |

---

## Bin (`/bin`) parity plan

Upgrade `Bin.tsx` from single-row action list to table model compatible with `/sermons`.

**Canonical UI + API audit:** [`BIN_UI_PARITY_SPEC.md`](./BIN_UI_PARITY_SPEC.md) (includes grid/list, search, filters, sort — **Recently updated** default).

### Required UI state

```ts
selectedIds: Set<string>
isAllOnPageSelected: boolean
bulkBusy: boolean
rowBusyIds: Set<string>
```

### Required actions

| Scope | Action | Mutation |
| ----- | ------ | -------- |
| Row | Restore | `restoreSermonFromBin(id)` |
| Row | Delete forever | `deleteSermon(id)` |
| Bulk selected | Restore marked | `restoreMany(ids[])` |
| Bulk selected | Delete marked forever | `deleteMany(ids[])` |
| Whole current scope | Restore all | `restoreAll(filters)` |
| Whole current scope | Delete all forever | `deleteAll(filters)` |

### Confirmation requirements

- Row delete forever: confirm
- Bulk delete marked forever: confirm with count
- Delete all forever: high-friction confirm (typed phrase or two-step)
- Restore actions: one-step confirm optional; bulk restore may skip extra confirm

---

## New client API methods (web)

Add to `SermonAPI` in `apps/web/src/api/clients/sermon.ts`:

```ts
restoreSermons(ids: string[]): Promise<IAPIResponse>
deleteSermons(ids: string[]): Promise<IAPIResponse>
restoreAllSermons(payload: { ownerId: string; filters?: Record<string, unknown> }): Promise<IAPIResponse>
deleteAllSermons(payload: { ownerId: string; filters?: Record<string, unknown> }): Promise<IAPIResponse>
```

Add corresponding path constants in `apps/web/src/api/core/paths.ts`.

---

## React Query invalidation contract

After every successful create/update/delete/restore mutation:

1. `invalidateQueries({ queryKey: sermonQueryKeys.all })`
2. `invalidateQueries({ queryKey: sermonQueryKeys.ministerListRoot(ownerId) })` when ownerId is known
3. For bin list views, invalidate bin-scoped keys as well (or rely on `all` root if keying includes `all`)

This keeps `/sermons` and `/bin` mutually consistent.

---

## Owner scope rules

Use existing owner resolution in all list and bulk actions:

- `resolveStudioSermonOwnerId(user, minister?.id, creatorId)`

Do not hardcode minister-only assumptions in bin bulk handlers.

---

## Error handling contract

All mutation handlers must:

- Surface API `message` when available
- Handle policy failures (e.g., published-delete blocked) as non-generic toasts
- For bulk actions, show summarized outcome:
  - `Restored 12 sermons. 2 failed.`
  - `Deleted 5 sermons permanently.`

Partial failures should not rollback successful ids by default.

---

## Testing requirements

## Unit / component

- `/sermons` query-state tests:
  - search debounce applies `q`
  - status/date/sort transitions reset page to 1
  - view mode persistence key survives remount
- `/sermons` empty-state tests:
  - true-empty library state
  - filtered-no-results state
- Bin selection reducer/logic:
  - Select one
  - Select all page
  - Clear selection after success
- Bulk payload builders:
  - `ids[]`
  - scope payload for restore/delete all
- Toast summary formatter from `BulkMutationResult`

## Integration (manual + optional automated)

1. Upload sermon → save draft → row visible in `/sermons`
2. Publish sermon → row visible under published
3. Edit draft and published metadata
4. Move one draft to bin
5. Restore one from bin
6. Delete one forever from bin
7. Restore marked
8. Delete marked forever
9. Restore all (scope)
10. Delete all forever (scope)

---

## Implementation checklist

- [ ] Add bulk path constants in `api/core/paths.ts`
- [ ] Add bulk methods in `api/clients/sermon.ts`
- [ ] Add bulk mutations in `hooks/app/useSermon.ts`
- [ ] Refactor `Bin.tsx` to `/sermons`-style table interaction model
- [ ] Add bin toolbar actions beside Filters: restore marked/all, empty marked/bin (single `toolbarRow`, no second row)
- [ ] Add confirmation UX for destructive bulk actions
- [ ] Ensure query invalidation covers sermons + bin consistency
- [ ] Validate minister + creator paths
- [ ] Remove or replace all placeholder/stub behavior in in-scope `/sermons` and `/bin` CRUD surfaces
- [ ] Verify direct URL deep-link behavior for `:sermonId`, `resume`, `edit` without legacy fallback assumptions

---

## Deferred (outside feat-0019)

- Series/playlists completion
- Admin moderation UX
- Listener-facing delete/restore propagation views
- Analytics-dependent bin metrics

---

## Gap register to resolve (audit-driven)

These are concrete known gaps discovered in current web implementation and must be either implemented in this feature or moved into explicitly linked follow-up feature specs with owner + timeline.

### `/sermons` UI/action gaps

1. **Series and Playlists tabs are placeholders**
   - Current state: tabs render but do not provide production workflows.
   - Required outcome: either implement backing queries/mutations + UI, or explicitly defer with follow-up feature IDs.

2. **Duplicate and Move-to-series row actions are stubs**
   - Current state: action handlers are non-persistent (toast-only/no-op behavior).
   - Required outcome: wire to real API contracts, optimistic/busy state, and query invalidation.

3. **Selection exists without bulk action contract**
   - Current state: selected IDs can be toggled but no sanctioned bulk toolbar actions in `/sermons`.
   - Required outcome: define if bulk is in scope for library and implement, or remove affordance to avoid false UI promise.

### Route/deep-link gaps

4. **Detail/resume/edit routes still rely on placeholder experiences**
   - Current state: route depth exists but lacks complete dedicated UX for read/update.
   - Required outcome: finalize canonical route behavior for `:sermonId`, `resume`, `edit` including direct URL entry and refresh.

5. **Entry-point consistency is incomplete**
   - Current state: some flows rely on transient state from prior navigation.
   - Required outcome: every action route must be reconstructable from URL params + server state alone.

### `/bin` parity + bulk mutation gaps

6. **`/bin` does not match `/sermons` interaction model**
   - Current state: simpler table/controls with reduced parity.
   - Required outcome: parity for shell, toolbar conventions, empty states, paging, and row selection semantics.

7. **Bulk restore/delete-all pathways are missing**
   - Current state: primarily single-row actions.
   - Required outcome: implement `restoreMarked`, `restoreAll`, `deleteMarkedForever`, `deleteAllForever`.

8. **Bulk mutation feedback contract not standardized end-to-end**
   - Current state: no guaranteed partial-success result handling in UI.
   - Required outcome: enforce `BulkMutationResult` mapping to deterministic success/error toasts and row-level failure recovery.

### API/policy gaps

9. **Bulk bin API surface not finalized**
   - Current state: proposed only.
   - Required outcome: finalize endpoints/body schema, idempotency expectations, and owner-scope auth behavior.

10. **Published-sermon delete policy handling is fragmented**
    - Current state: rejection appears as isolated row errors.
    - Required outcome: unify policy checks and user-facing copy for single + bulk requests.

### Definition-of-done hook

11. **Gap register closure requirement**
    - A feature branch closing `feat-0019` must include a closure note mapping each item above to:
      - Implemented in this branch, or
      - Deferred with linked feature spec (`feat-xxxx`) and rationale.
    - Closure is invalid if any in-scope user-visible action remains stubbed, placeholder-only, or legacy-dependent.

---

## Related

- [feat-0006 TECH](../feat-0006/TECH.md)
- [feat-0008 TECH](../feat-0008/TECH.md)
- [feat-0018 TECH](../feat-0018/TECH.md)
- [feat-0017 TECH](../feat-0017/TECH.md)
