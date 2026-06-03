# feat-0027 — Technical notes (draft upload modal)

## Context

Normative behavior: [DRAFT_UPLOAD_MODAL_SPEC.md](./DRAFT_UPLOAD_MODAL_SPEC.md). Routing: [feat-0025 TECH](../feat-0025/TECH.md).

## Implementation outline

### 1. Centralize resume mapping

Add `mapSermonDetailToUploadDraft(doc): Partial<ISermonUpload>` (e.g. `apps/web/src/utils/sermon-upload-draft-map.util.ts`):

- Reuse `resolveSermonPlaybackUrl`, `normalizeSermonVisibility`, `pickSermonDurationSeconds` patterns from existing utils.
- Map `item.itemId` → `uploadRef`, `imageUrl` → `thumbnailPreview`, `series` id → `seriesId`.

Use in:

- `SermonUploadPage` resume effect
- Optional: `Dashboard.tsx` if it hydrates drafts

### 2. `loadFromDraft` reducer tweak

Today `LOAD_FROM_DRAFT` always sets `uploadComplete: false` then page sets true — OK if order preserved.

Consider accepting `uploadComplete` in payload to avoid flicker.

### 3. localStorage vs server

On resume with `resumeSermonId`:

1. `GET /sermon/:id`
2. `dispatch(loadFromDraft(map(...)))` — server wins
3. Do not apply `LOAD_FROM_STORAGE` for conflicting `sermonId`

On `resetUpload` / successful publish: `clearStoredData()`.

### 4. Refresh-safe resume (optional P1)

`SermonUploadPage` reads `searchParams.get('sermonId')` when `location.state` missing; `navigate` with `?sermonId=` on first resume.

### 5. Dirty close confirm (optional P2)

Track dirty flag vs last saved snapshot; confirm before `handleClose` if metadata changed and not saved.

## Files (expected touch)

| File | Change |
| ---- | ------ |
| `utils/sermon-upload-draft-map.util.ts` | **New** — API → `ISermonUpload` |
| `app/studio/SermonUploadPage.tsx` | Full hydrate |
| `context/upload/uploadReducer.tsx` | Optional `uploadComplete` in LOAD_FROM_DRAFT |
| `components/shared/upload/ReviewSubmit.tsx` | clear storage on publish |
| `specs/web/feature/feat-0025/SERMON_EDIT_ROUTING_SPEC.md` | Cross-link feat-0027 |

## Out of scope

- Changing published edit (`SermonEditPage`) fields.
- API schema changes (use existing sermon DTO fields).
- Mobile upload.

## Tests (when added)

| Case | Assert |
| ---- | ------ |
| `mapSermonDetailToUploadDraft` | visibility, uploadRef, thumbnailPreview from fixture JSON |
| Resume integration | Mock GET → dispatch → `uploadData.visibility` defined |
