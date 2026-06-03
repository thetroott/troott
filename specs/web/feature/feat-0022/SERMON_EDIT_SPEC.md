# feat-0022: Studio sermon **Edit** — row menu, details page, and lifecycle actions

## Summary

Studio users edit sermons from **My Sermons** via row **Edit**. **Which screen opens depends on publication state** ([feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md)):

| State | **Edit** opens |
| --- | --- |
| **Draft** | Upload wizard (`SermonUploadPage` + `UploadModal`, `resumeSermonId`) |
| **Published** | **Sermon details** at `/studio/{code}/sermons/:sermonId/edit` (`SermonEditPage`) |

Published users change metadata, thumbnail, and visibility on **Sermon details**; **Replace audio** opens the upload wizard **file** step only. Draft users finish upload, metadata, and publish in the **wizard**.

---

## REFERENCE — YouTube Studio “Video details”

Layout and information architecture follow YouTube Studio’s **Video details** screen (dark theme, two-column body, sticky header with save actions).

| Reference | Path |
| --- | --- |
| Screenshot | [`assets/reference-youtube-studio-video-details.png`](./assets/reference-youtube-studio-video-details.png) |
| Troott implementation | `apps/web/src/app/studio/SermonEditPage.tsx`, `sermon-edit-ui.ts` |

| YouTube region | Troott mapping |
| --- | --- |
| Sticky header — Back, title, Save | Back → My Sermons; **Sermon details**; Save / Save as draft / Publish |
| Left — Title, Description | Basic info section |
| Left — Thumbnail | Thumbnail upload (cover API on save) |
| Left — Playlists / Audience | Category/topic + tags (Details section) |
| Right — Preview player | Audio glyph + duration |
| Right — Video link | Share link + copy |
| Right — Visibility | Visibility `Select` (public / unlisted / private) |
| Right — Subtitles / Cards | **Audio** card — Replace / Upload audio → wizard file step |

This spec defines:

- **Where Edit appears** (and where it must not).
- **Edit vs Rename** and other row actions.
- **Necessary actions** by lifecycle phase (draft before publish, draft with audio, published, processing).
- **API mapping** and known implementation gaps.

> **Route name:** Product route is **`/sermons`** (My Sermons), not `/get-sermons`. Onboarding uses **`/get-started`** for first-upload checklist only — it does not host the production sermon library or row **Edit**.

---

## Problem

Edit behavior is split across legacy UC docs and partial code:

| Area | Today | Gap |
| --- | --- | --- |
| Row **Edit** | `SermonsTable` → `SermonEditPage` | Wizard reserved for create + replace audio |
| **Rename** | Inline dialog + `PUT /update` title only | Overlaps with Edit; users need a clear split |
| **Resume** | `SermonUploadPage` loads detail, jumps to `review` or `details` | `fetchSermonDetail` may double-unwrap `data`; thumbnail/tags/schedule not fully hydrated |
| **Published edit** | Same wizard as draft | Replace audio, unpublish, step gating not normative |
| **Bin** | No Edit (correct) | Must stay out of scope |
| **Processing** | Upload status polling in modal (feat-0018) | Edit entry while `extracting`/`processing` not specified |

Operators need one contract for **all places a user “edits” a sermon** in studio web.

---

## Goals

1. **Edit** on `/sermons` opens the correct surface per [feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md) (wizard for draft, **Sermon details** for published).
2. **Necessary actions** are explicit for **before publish** and **after publish**.
3. **Rename** stays a fast path for title-only updates.
4. **Bin**, **Get info**, **Share**, **Analytics**, and **Move to trash** remain separate (feat-0019, feat-0020).
5. Deep links `/studio/{code}/sermons/:sermonId/edit` and `/resume` behave like row **Edit**.

## Non-goals (v1)

- Editing from **Bin** (restore to library first).
- Replacing the upload wizard for **new** sermon creation.
- **Duplicate sermon**, **Move to series** (stubs / future).
- Mobile studio edit.
- Listener app metadata edit.
- Bulk edit on selection.
- Replacing **Edit** with inline grid editing (except **Rename** and feat-0021 list visibility).

---

## Surfaces and entry points

| Entry | Route / UI | Opens edit? | Notes |
| --- | --- | --- | --- |
| Row menu **Edit** | `/studio/{code}/sermons` | **Yes** | Draft → wizard; published → `/edit` ([feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md)) |
| Row menu **Rename** | `/studio/{code}/sermons` | **No** (title dialog only) | `PUT /update` `{ title }` |
| **Create sermon** | `/sermons` toolbar | **No** (new upload) | No `resumeSermonId` |
| Deep link **edit** | `/studio/{code}/sermons/:sermonId/edit` | **Yes** | Published: `SermonEditPage`; draft: redirect → wizard ([feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md)) |
| Deep link **resume** | `/studio/{code}/sermons/:sermonId/resume` | **Yes** | Same resolver as **Edit** |
| Legacy **detail** | `/studio/{code}/sermons/:sermonId` | **Yes** | `SermonDetailPlaceholder` → resolver |
| **Get started** upload CTA | `/get-started` → upload | **No** (create only) | Same wizard host, new sermon ([feat-0019 UC-C02](../feat-0019/PRODUCT.md)) |
| **Bin** row menu | `/studio/{code}/bin` | **No** | Restore, Empty, Get info only |
| **Get info** | `/sermons`, `/bin` | **No** | Read-only ([feat-0020](../feat-0020/SERMON_GET_INFO_SPEC.md)) |

---

## Row three-dot menu — **Edit** (My Sermons)

Normative order in `SermonContextMenu` (after **Get info** when feat-0020 enabled):

```
Get info          (optional, feat-0020)
────────
Edit              ← this spec
Rename
────────
Share
Download
Analytics
────────
Move to trash
```

| Property | Value |
| --- | --- |
| Label | **Edit** |
| Icon | `Scissors` (existing; align with Figma in visual QA) |
| Handler | `onEdit(sermonId)` → resolver in [feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md) |

### Navigation contract (normative)

See **[feat-0025 § Navigation contracts](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md#navigation-contracts)**.

| Field | Draft | Published |
| --- | --- | --- |
| **Edit** target | Upload wizard + `{ resumeSermonId }` | `/studio/{code}/sermons/{sermonId}/edit` |
| Back / after save | `/studio/{code}/sermons` | `/studio/{code}/sermons` |
| Replace audio | Wizard **file** step (in-wizard) | From details → `studioUploadPath(..., file)` + `{ resumeSermonId, editMode: true }` |

### Disabled rules (normative)

| Condition | **Edit** menu item |
| --- | --- |
| Sermon in **bin** | Hidden (not on bin page menu) |
| Row is placeholder/demo (get-started grid) | Hidden unless `onEdit` wired to real handler |
| `uploadStatus` in `uploading` (client-only) | N/A on list |
| `uploadStatus` `extracting` / `processing` | **Enabled** — user may open wizard; show processing banner inside ([feat-0018](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md)) |
| User lacks studio write on sermon | API 403 on load — error toast, do not open wizard |

---

## Edit vs Rename vs other actions

| Action | Scope | Surface | API (v1) |
| --- | --- | --- | --- |
| **Rename** | Title only | Modal on `/sermons` | `PUT /sermon/update/:id` `{ title }` |
| **Edit** | Full metadata, cover, visibility, audio, publish/draft | Wizard (draft) or **Sermon details** (published) | `GET /:id`, `PUT /update`, `POST /publish`, `POST /start-upload`, cover upload |
| **Get info** | Read-only inspect | Dialog | `GET /:id` |
| **Share** | Copy listener URL | Clipboard | None |
| **Download** | Open playback URL | New tab | `GET /:id` |
| **Analytics** | Single-sermon analytics tab | Navigate to `/analytics?tab=sermon&sermonId=` ([feat-0023](../feat-0023/SERMON_ANALYTICS_SPEC.md)); sidebar link must match row menu URL |
| **Move to trash** | Soft-delete to bin | Confirm dialog | `PUT /move-to-bin/:id` — **blocked for published** (non-admin); menu hidden on web |

**Product rule:** **Rename** must not be removed in favor of **Edit**; titles are edited often without entering the wizard.

---

## Edit surface: upload wizard (drafts)

The **upload wizard** is the canonical **draft** edit UI (embedded `UploadModal` on `SermonUploadPage`). **Published** edit uses **Sermon details** ([feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md)).

Full state model, use cases, and hydrate requirements: [feat-0027 DRAFT_UPLOAD_MODAL_SPEC.md](../feat-0027/DRAFT_UPLOAD_MODAL_SPEC.md).

### Wizard steps (URL segments)

| Step key | Path segment | Purpose |
| --- | --- | --- |
| `progress` | `sermons/upload/file` | Upload / replace audio, progress |
| `details` | `sermons/upload/details` | Title, description, category, tags, cover |
| `settings` | `sermons/upload/thumbnail` | Listener settings (visibility, schedule) |
| `review` | `sermons/upload/publish` | Review, **Save as draft**, **Publish** |

Reference: [`upload-wizard-route.util.ts`](../../../apps/web/src/utils/upload-wizard-route.util.ts).

### Hydration on open (resume / edit)

When `resumeSermonId` is set, before showing steps:

1. `GET /api/v1/sermon/:id` (sermon root on `useSermonByIdQuery` / `fetchSermonDetail` — **no double `.data` unwrap**; see [feat-0020 parse rules](../feat-0020/SERMON_GET_INFO_SPEC.md#client-parse-rules-normative)).
2. Dispatch `uploadActions.loadFromDraft` with at least:

| Upload state field | API source |
| --- | --- |
| `sermonId` / `draftId` | `id` / `_id` |
| `title` | `title` |
| `description` | `description` |
| `tags` | `tags[]` |
| `category` | `topic` (string or id per API) |
| `isPublic` | `isPublic` (until feat-0021 `visibility` enum) |
| `thumbnailPreview` / cover | `imageUrl` or `image` subdoc when present |

3. **Initial step:**
   - If audio exists (`playbackUrl` / `manifestUrl` / `item.item`): `uploadComplete = true`, land on **`review`** (current code).
   - If no audio: land on **`details`** (user must upload via progress step).

4. Clear `location.state` after hydrate (`replaceState`) to avoid re-trigger on refresh.

**Gap (implement):** Hydrate thumbnail, `seriesId`, `scheduledDate`, and feat-0021 **visibility** when API fields exist.

### Wizard chrome when editing

| Mode | Header title (target) | Primary footer actions |
| --- | --- | --- |
| **New upload** | Upload sermons | Continue / Publish / Save as draft per step |
| **Edit draft** | Edit sermon (or Upload sermons — pick one in impl) | Save as draft, Publish |
| **Edit published** | Edit sermon | **Save changes** (update metadata), not “Publish” unless republishing policy exists |

v1 may keep “Upload sermons” label if product has not shipped copy change — document target copy in acceptance criteria.

---

## Necessary actions by lifecycle

### A. New sermon (create — not Edit, but same wizard)

Triggered by **Create sermon**, not row **Edit**.

| Action | When | API |
| --- | --- | --- |
| Select audio file | Entry modal | — |
| Upload audio | Progress step | `POST /sermon/start-upload` |
| Enter metadata | Details | autosave / `PUT /update` |
| Set visibility / schedule | Settings | `PUT /update` |
| Save as draft | Review | `PUT /update` + draft status |
| Publish | Review | `POST /sermon/publish/:id` |

See [UC-U1–U6](../../04%20-%20sermon-upload-draft.md).

---

### B. Draft — before audio uploaded

**Preconditions:** `publicationStatus === draft`, no playback URL.

| Action | Available? | How |
| --- | --- | --- |
| Upload audio | **Yes** | Progress step → `start-upload` |
| Edit title, description, tags, category | **Yes** | Details (+ Rename on list) |
| Upload / change cover | **Yes** | Details / settings |
| Set visibility | **Yes** | Settings |
| Save as draft | **Yes** (explicit or autosave) | `PUT /update` |
| Publish | **No** until audio + required fields | Block with validation |
| Replace audio | N/A | No audio yet |
| Move to trash | **Yes** | Row menu (non-published policy) |

---

### C. Draft — audio uploaded, not published

**Preconditions:** Draft with `uploadComplete` / server audio present.

| Action | Available? | How |
| --- | --- | --- |
| Edit metadata | **Yes** | Details, settings, review |
| **Replace audio** | **Yes** | Review “Edit file” → progress → new `start-upload` (same sermon id per API) |
| Remove audio | **Product TBD** | If supported, clear `item` via API; else disable |
| Save as draft | **Yes** | Review / autosave on upload complete |
| Publish | **Yes** when validation passes | `POST /publish/:id` |
| Move to trash | **Yes** | Non-admin: unpublished only |

Companion: [UC-U3](../../04%20-%20sermon-upload-draft.md#uc-u3), [UC-U4](../../04%20-%20sermon-upload-draft.md#uc-u4).

---

### D. Published

**Preconditions:** `status` / `isPublished` indicates published catalog row.

| Action | Available? | How |
| --- | --- | --- |
| Edit title, description, tags, topic | **Yes** | Details + **Rename** on list |
| Change cover | **Yes** | `POST` cover attach + `PUT /update` |
| Change visibility / schedule | **Yes** | Settings ([UC-V5](../../05%20-%20%20sermon-view-trash.md#uc-v5)); feat-0021 list modal may duplicate — keep values in sync |
| **Save changes** (metadata) | **Yes** | `PUT /update` without new publish call |
| **Publish** again | **No** (already published) | Hide or relabel primary CTA |
| **Replace audio** | **Policy required** | [UC-V4](../../05%20-%20%20sermon-view-trash.md#uc-v4): allow only if API supports re-upload on same id; show processing state; block if pipeline non-terminal |
| Unpublish to draft | **Product TBD** | Not in API today unless `PUT /update` sets draft status — document as gap |
| Move to trash | **Restricted** | Non-admin cannot move **published** to bin ([`validateDeletePolicy`](../../../apps/api/src/services/core/sermon.service.ts)) — **Edit** still allowed |

---

### E. Processing (`item.uploadStatus` non-terminal)

| `uploadStatus` | Edit entry | Inside wizard |
| --- | --- | --- |
| `uploaded`, `extracting`, `processing` | **Allowed** | Banner: Processing… ([feat-0018 labels](../../../apps/web/src/utils/upload-pipeline-label.util.ts)); poll `GET /:id` |
| `failed` | **Allowed** | Show failure; offer replace audio / support |
| `cancelled` | **Allowed** | Show cancelled; replace or metadata only |
| `completed` | **Allowed** | Normal edit |

**Publish** while processing: **blocked** until terminal `completed` (or product-defined exception).

---

### F. Bin (trashed)

| Action | Available? |
| --- | --- |
| **Edit** | **No** |
| **Restore** then edit in library | **Yes** (two-step) |

---

## API map

| User action | Method | Path | Notes |
| --- | --- | --- | --- |
| Load for edit | `GET` | `/api/v1/sermon/:id` | Hydrate wizard |
| Save metadata | `PUT` | `/api/v1/sermon/update/:id` | Partial `UpdateSermonDTO` |
| Publish | `POST` | `/api/v1/sermon/publish/:id` | Draft → published |
| Upload / replace audio | `POST` | `/api/v1/sermon/start-upload` | Multipart; sermon id linkage per [feat-0008](../../api/feature/feat-0008/PRODUCT.md) / feat-0006 |
| Upload cover | `POST` | `/api/v1/sermon/upload-cover` (or attach endpoint) | `sermonId` in body |
| Move to trash | `PUT` | `/api/v1/sermon/move-to-bin/:id` | Not edit; listed for context |

**Auth:** `Protect` + minister/creator studio write ([`assertStudioWriteForSermonMinisters`](../../../apps/api/src/controllers/core/sermon.controller.ts)).

---

## Review step — inline “edit” shortcuts (inside wizard)

`ReviewSubmit` already exposes jump actions:

| Control | Jumps to |
| --- | --- |
| Edit file | Progress (replace audio) |
| Edit title / description / thumbnail | Details or settings |

These are **in-wizard** edits, not row menu **Edit**, but part of the same session after row **Edit** opened the wizard.

---

## Processing and list refresh

After any successful save, publish, or replace:

1. Invalidate `sermonQueryKeys` (minister list + detail).
2. On wizard close, user lands on `/sermons` with updated row (title, status pill, duration).
3. Do not require hard page reload.

---

## Error and edge cases

| Case | Behavior |
| --- | --- |
| `GET /:id` 404 | Toast “Could not load sermon for editing”; stay on `/sermons` |
| `PUT /update` validation error | Inline field errors + toast |
| Publish while processing | Block; message explains pipeline |
| Close wizard mid-edit | Draft persisted per autosave / last explicit save; confirm if dirty (product TBD) |
| Concurrent rename + edit | Last write wins; refetch on open |

---

## Current implementation snapshot (gap register)

| Item | Status | Target |
| --- | --- | --- |
| Row **Edit** → `resumeSermonId` | **Done** | Keep |
| `SermonUploadPage` hydrate | **Partial** | Fix `fetchSermonDetail` unwrap; load cover/tags/schedule |
| `editMode` flag | **Unused** | Drive published vs draft footer labels |
| Published **Replace audio** | **Unclear** | Spec [UC-V4](../../05%20-%20%20sermon-view-trash.md#uc-v4); implement + API contract |
| Wizard title “Edit sermon” | **Not done** | Copy pass |
| Bin **Edit** | **Absent** | Correct |
| get-started demo grid **Edit** | **Stub** | Out of scope or wire to real upload |
| Double-fetch on resume | **Risk** | Single hydrate owner |

---

## Acceptance criteria

### Entry

- [ ] **Edit** on `/sermons` list and grid opens wizard with correct `sermonId`.
- [ ] `/sermons/:id/edit` and `/resume` equivalent to row **Edit**.
- [ ] **Bin** menus do not include **Edit**.

### Draft

- [ ] Draft without audio lands on upload/details path; user can upload.
- [ ] Draft with audio lands on review (or product-chosen step) with metadata filled.
- [ ] **Save as draft** and **Publish** work from review when rules met.
- [ ] **Replace audio** available pre-publish from review.

### Published

- [ ] Metadata save via `PUT /update` without requiring **Publish**.
- [ ] **Publish** CTA hidden or disabled when already published.
- [ ] **Move to trash** on published blocked for non-admin (existing API); **Edit** still works.

### Processing

- [ ] Opening **Edit** during `extracting`/`processing` shows status banner and polls per feat-0018.
- [ ] **Publish** blocked until terminal success (unless spec exception added).

### Rename

- [ ] **Rename** still updates title only without opening wizard.

### Regression

- [ ] **Get info**, **Share**, **Analytics**, **Download** unchanged.

---

## Test plan (manual)

1. Draft without audio → **Edit** → upload file → publish.
2. Draft with audio → **Edit** → change description → Save as draft → list updates.
3. Published → **Edit** → change title in wizard → save → list updates; **Publish** not shown.
4. Published → attempt **Move to trash** (expect policy error); **Edit** still works.
5. Processing sermon → **Edit** → banner shows Processing… → completes → publish enabled.
6. **Rename** from menu → title changes; wizard not opened.
7. Bin row → no **Edit**; restore → **Edit** on `/sermons`.
8. Deep link `/sermons/{id}/edit` opens same state as menu **Edit**.

---

## Related specs

| Doc | Link |
| --- | --- |
| feat-0019 CRUD | [PRODUCT.md](../feat-0019/PRODUCT.md) — UC-U03, UC-U04, UC-U05 |
| feat-0020 Get info | [SERMON_GET_INFO_SPEC.md](../feat-0020/SERMON_GET_INFO_SPEC.md) |
| feat-0021 Visibility | [SERMON_LIST_VISIBILITY_SPEC.md](../feat-0021/SERMON_LIST_VISIBILITY_SPEC.md) |
| Upload draft/publish | [04 - sermon-upload-draft.md](../../04%20-%20sermon-upload-draft.md) |
| View / update / replace | [05 - sermon-view-trash.md](../../05%20-%20%20sermon-view-trash.md) — UC-V2–V5 |
| Upload polling | [feat-0018 UPLOAD_STATUS_POLLING_SPEC.md](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) |

---

## Changelog

| Date | Change |
| --- | --- |
| 2026-06-02 | Initial spec — Edit menu, wizard edit surface, lifecycle actions |
