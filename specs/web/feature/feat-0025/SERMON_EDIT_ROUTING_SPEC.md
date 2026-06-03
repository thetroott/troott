# feat-0025: Sermon **Edit** routing — draft → upload wizard, published → Sermon details

## Summary

**Edit** is one product action with **two surfaces**, chosen by whether the sermon is still a **draft** or **published**:

| Publication state | **Edit** opens | Primary UI |
| --- | --- | --- |
| **Draft** | Upload wizard | `SermonUploadPage` + `UploadModal` (`resumeSermonId`) |
| **Published** | Sermon details | `SermonEditPage` (`/studio/{code}/sermons/{id}/edit`) |

**Rename** stays on the list (title-only). **Analytics** uses the edit workspace route `/sermons/{id}/analytics` ([feat-0023](../feat-0023/SERMON_ANALYTICS_SPEC.md)) and is **not** gated by this spec’s draft/published split for the row menu.

---

## Problem

| Area | Today | Gap |
| --- | --- | --- |
| Row **Edit** | Always `studioSermonEditPath` → `SermonEditPage` | Drafts should open upload wizard |
| Legacy **resume** / **detail** | Redirect to `/edit` only | Drafts never reach wizard from deep links |
| [feat-0022](../feat-0022/SERMON_EDIT_SPEC.md) | Mixed: “Sermon details” + “wizard is canonical edit” | Needs one routing contract |
| Draft **Replace audio** | From `SermonEditPage` only | Draft users should use wizard progress step |

---

## Normative rule

```text
IF sermon is draft (see § Draft detection)
  THEN open upload wizard with resumeSermonId = sermonId
ELSE
  THEN open SermonEditPage at /studio/{studioCode}/sermons/{sermonId}/edit
```

**Bin:** no **Edit** (unchanged, [feat-0019](../feat-0019/PRODUCT.md)).

---

## Draft detection (normative)

Use the **same** logic as My Sermons list rows and Get info:

- Client: `isSermonDraftDocument(doc)` in `apps/web/src/utils/sermon-info-map.util.ts`
- Treat as draft when `status` / `state` (case-insensitive) contains `draft`, or equals `unpublished` or `inactive`
- List row shortcut: `publicationStatus === 'draft'` from `mapApiSermonToTableRow` when navigation starts from the table without a prior `GET`

**Published** = not draft per above (includes processing/published catalog rows).

> **API note:** If the server adds an explicit `publicationStatus` field on `GET /sermon/:id`, prefer it when present; until then, client rules above are normative for web.

---

## Surfaces

### A. Draft — upload wizard

| Property | Value |
| --- | --- |
| Host route | `/studio/{studioCode}/sermons/upload/...` (`SermonUploadPage`) |
| Modal | `UploadModal` (wizard open when `resumeSermonId` or file present) |
| Navigation state | `{ resumeSermonId: string, editMode?: true }` |
| Hydration | Existing `SermonUploadPage` effect: `GET /sermon/:id` → `uploadActions.loadFromDraft` |
| Initial step | Has playback URL → **`review`**; else → **`details`** (then user can go to **file** for audio) |
| Back / close | Returns to **My Sermons** (`studioSermonsListPath`) when user abandons without file |
| Footer actions | **Save as draft**, **Publish** per [feat-0018](../feat-0018/PRODUCT.md) |

**Product:** Draft **Edit** is “continue upload / finish and publish,” not the YouTube-style details page.

### B. Published — Sermon details (`SermonEditPage`)

| Property | Value |
| --- | --- |
| Route | `/studio/{studioCode}/sermons/{sermonId}/edit` |
| Layout | `SermonEditSidebar` + details form ([feat-0022](../feat-0022/SERMON_EDIT_SPEC.md)) |
| Header actions | **Undo changes** / **Save changes** ([studio header tokens](../../../apps/web/src/components/shared/studio/studio-header-actions.ts)) |
| **Replace audio** | `studioUploadPath(code, PATH_SEG_SERMONS_UPLOAD_FILE)` + `{ resumeSermonId, editMode: true }` — **file step only**, not full draft re-entry |
| **Analytics** sidebar | `studioSermonAnalyticsPath` — unchanged ([feat-0023](../feat-0023/SERMON_ANALYTICS_SPEC.md)) |

**Product:** Published **Edit** is metadata + visibility + optional audio replace from the details shell.

---

## Entry points

| Entry | Draft behavior | Published behavior |
| --- | --- | --- |
| Row menu **Edit** | Upload wizard + `resumeSermonId` | `SermonEditPage` `/edit` |
| Deep link `/sermons/:id/edit` | Redirect → upload wizard (`replace: true`) | `SermonEditPage` |
| Deep link `/sermons/:id/resume` | Upload wizard | `SermonEditPage` `/edit` |
| Legacy `/sermons/:id` | Same as **resume** | Same as **resume** |
| Toolbar **Create sermon** | New upload (no `resumeSermonId`) | N/A |
| **Rename** | List modal only | List modal only |
| **Get info** | Dialog | Dialog |
| Row **Analytics** | `/sermons/:id/analytics` workspace | Same |
| Sermon details **Replace audio** | N/A (user is on published edit) | Wizard file step only |

---

## Navigation contracts

### 1. Row **Edit** (primary)

```ts
// Pseudocode — implement in sermon-edit-routing.util.ts
function navigateOnEdit(studioCode: string, sermonId: string, row?: { publicationStatus?: string }) {
  if (row?.publicationStatus === 'draft') {
    navigate(studioUploadPath(studioCode, initialUploadSegmentForResume), {
      state: { resumeSermonId: sermonId, editMode: true },
    });
    return;
  }
  // Optional: GET /sermon/:id if status unknown, then:
  navigate(studioSermonEditPath(studioCode, sermonId));
}
```

`initialUploadSegmentForResume`: after hydrate, app sets step to `review` or `details`; URL may start at `sermons/upload/file` or current segment — **must** run hydrate before user interacts (existing page behavior).

### 2. Deep link `/edit` guard

`SermonEditPage` **must not** render the details form for a draft:

1. Load `GET /sermon/:id`.
2. If draft → `navigate(uploadPath, { state: { resumeSermonId }, replace: true })`.
3. If published → render details.
4. While loading / redirecting → loading shell (no flash of empty form).

### 3. Analytics workspace (unchanged)

| Route | Behavior |
| --- | --- |
| `/studio/{code}/sermons/{id}/analytics` | `SermonEditPage` analytics section; sidebar **Details** for a **draft** sermon navigates to upload wizard with `resumeSermonId` (not `/edit` form) |

---

## Processing and edge cases

| Condition | **Edit** destination |
| --- | --- |
| Draft, no audio | Upload wizard → **details** (or **file**) |
| Draft, audio present, not published | Upload wizard → **review** |
| Draft, `uploadStatus` extracting/processing | Upload wizard + processing banner ([feat-0018](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md)) |
| Published, processing | **Sermon details** + banner; block publish-like actions |
| Published, replace audio | From details → wizard **file** step only |
| Trashed (bin) | **Edit** hidden |
| 403 / not found | Toast; stay on list or error state |

---

## Edit vs other actions (routing only)

| Action | Draft | Published |
| --- | --- | --- |
| **Edit** | Upload wizard | Sermon details |
| **Rename** | List modal | List modal |
| **Analytics** | `/sermons/:id/analytics` | Same |
| **Share / Download / Trash** | [feat-0019](../feat-0019/PRODUCT.md) | Same |

---

## Implementation status (web)

| Item | Status |
| --- | --- |
| `SermonUploadPage` + `resumeSermonId` hydrate | **Done** |
| `SermonEditPage` details UI | **Done** (published target) |
| Row **Edit** → draft wizard | **Done** (`SermonsTable` + `sermon-edit-routing.util.ts`) |
| `/edit` draft redirect | **Done** (`SermonEditPage` guard) |
| `SermonDetailPlaceholder` resolver | **Done** (`GET` + resolver) |
| `resolveSermonEditDestination` util | **Done** |
| Draft **Details** nav on analytics | **Done** (`detailsPathState` on sidebar) |

See [TECH.md](./TECH.md).

---

## Acceptance criteria

- [ ] Draft row **Edit** opens upload modal/wizard with sermon hydrated; user can publish from review when valid.
- [ ] Published row **Edit** opens **Sermon details**; no upload entry modal unless **Replace audio**.
- [ ] Visiting `/sermons/{draftId}/edit` redirects to upload wizard without showing the details form.
- [ ] Visiting `/sermons/{publishedId}/edit` shows **Sermon details**.
- [ ] `/sermons/{id}/resume` and `/sermons/{id}` follow the same draft/published rule.
- [ ] Draft detection matches list **Draft** pill / `publicationStatus`.
- [ ] **Rename** and **Analytics** still work from the list for drafts.
- [ ] From published **Sermon details**, **Replace audio** opens wizard file step with same `sermonId`.

---

## Related specs

- [feat-0027 DRAFT_UPLOAD_MODAL_SPEC.md](../feat-0027/DRAFT_UPLOAD_MODAL_SPEC.md) — **draft editor UX**: modal state, hydrate, all use cases
- [feat-0022 SERMON_EDIT_SPEC.md](../feat-0022/SERMON_EDIT_SPEC.md) — fields, lifecycle actions, API (update routing § surfaces)
- [feat-0018](../feat-0018/PRODUCT.md) — wizard steps, polling
- [feat-0023 SERMON_ANALYTICS_SPEC.md](../feat-0023/SERMON_ANALYTICS_SPEC.md) — analytics workspace URL
