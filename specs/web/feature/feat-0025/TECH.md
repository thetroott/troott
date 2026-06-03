# feat-0025 — Technical notes (edit routing)

## Implementation outline

1. **`resolveSermonEditDestination`** (`apps/web/src/utils/sermon-edit-routing.util.ts`)
   - Input: `studioCode`, `sermonId`, sermon document (or `isDraft` boolean from list row).
   - Output: `{ kind: 'upload-wizard' | 'sermon-details'; path: string; state?: { resumeSermonId: string; editMode?: boolean } }`.
   - Draft detection: reuse `isSermonDraftDocument(doc)` from `sermon-info-map.util.ts` (same as table/list).

2. **Row Edit** — `SermonsTable.handleEdit` (and grid/list parity)
   - If list row already has `publicationStatus === 'draft'`, navigate to upload path + `state` without an extra `GET`.
   - Else `GET /sermon/:id` once, then navigate per resolver (handles stale list cache).

3. **`SermonEditPage` mount guard** (`/edit`)
   - On load, if `isSermonDraftDocument(data)`, `navigate(studioUploadPath(...), { state: { resumeSermonId }, replace: true })`.
   - Show loading shell until redirect or confirmed published.

4. **`SermonDetailPlaceholder`** (`/sermons/:id`, `/resume`)
   - Replace blind redirect to `studioSermonEditPath` with resolver (fetch if needed).

5. **Upload wizard** — no new modal; reuse `SermonUploadPage` + existing `resumeSermonId` hydrate effect.

6. **Tests** (when added): draft doc → upload path; published doc → edit path; `/edit` redirect for draft.

## Files (expected touch)

| File | Change |
| --- | --- |
| `apps/web/src/utils/sermon-edit-routing.util.ts` | **New** — resolver + path builders |
| `apps/web/src/components/shared/my-sermons/SermonsTable.tsx` | `handleEdit` uses resolver |
| `apps/web/src/app/studio/SermonEditPage.tsx` | Draft redirect on `/edit` |
| `apps/web/src/app/studio/SermonDetailPlaceholder.tsx` | Resolver for legacy routes |
| `specs/web/feature/feat-0022/SERMON_EDIT_SPEC.md` | Cross-link; clarify surfaces |

## Out of scope here

- Changing upload wizard step copy or validation.
- API changes to `publicationStatus`.
- Mobile studio.
