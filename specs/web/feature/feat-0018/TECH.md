# feat-0018: Tech Spec — My Sermons upload, library, drafts (Figma)

## Context

See [`PRODUCT.md`](./PRODUCT.md). Implements Figma nodes [`10154:35090`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35090), [`10209:78627`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10209-78627), [`4506:21677`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4506-21677).

**Canonical CRUD / API:** [feat-0006 TECH](../feat-0006/TECH.md).

**Source branch history (`damola-development`):**

| Commit | Summary |
| ------ | ------- |
| `f2a0650`–`cb00ee0` | My Sermons UI, upload flow, routing (1/5–5/5) |
| `304569a` | List hover row and action layout |
| `ffc8f71` | Dashboard routes → studio sermon paths |
| `755b4a5` | Standard upload modal height (`modalHeightClass`) |

Merged into **`favour-development`** via workspace migration batches + cherry-pick / manual port of `755b4a5`.

---

## Routes

| Path | Component | Notes |
| ---- | --------- | ----- |
| `/studio/:studioCode/sermons` | `MySermons.tsx` | Remote list + `SermonsTable` |
| `/studio/:studioCode/sermons/upload` (+ segments) | `SermonUploadPage.tsx` | Backdrop shell + entry + wizard modals |

Path helpers: `apps/web/src/routes/paths.ts` — `studioSermonsListPath`, `studioUploadPath`, `PATH_SEG_SERMONS_UPLOAD_FILE`.

---

## File map

### Library (Figma `10154:35090`)

| Module | Role |
| ------ | ---- |
| `apps/web/src/app/sermons/MySermons.tsx` | TanStack query `getSermonsByMinister`; passes remote props to table |
| `apps/web/src/components/shared/my-sermons/SermonsTable.tsx` | Toolbar, filters (status draft/published/all), sort, grid/list, Create sermon |
| `apps/web/src/components/shared/my-sermons/MySermonsEmptyShell.tsx` | Full page empty chrome + decorative backdrop |
| `apps/web/src/components/shared/my-sermons/my-sermons-ui.tsx` | Layout tokens, status pills (`SermonStatusPill`) |
| `apps/web/src/components/shared/my-sermons/SermonsListView.tsx` | Table rows |
| `apps/web/src/components/shared/my-sermons/MySermonsPagination.tsx` | Footer pagination |
| `apps/web/src/utils/sermon-list-map.util.ts` | `mapApiSermonToTableRow`, `publicationStatus` |
| `apps/web/src/constants/sermon-query-keys.ts` | `ministerList(ministerId, params)` |

### Upload host (modal over View)

| Module | Role |
| ------ | ---- |
| `apps/web/src/app/studio/SermonUploadPage.tsx` | `MySermonsEmptyShell` backdrop + `UploadEntryStepModal` + `UploadModal` |
| `apps/web/src/hooks/upload/useCreateSermonEntry.ts` | Create sermon from list → entry modal |
| `apps/web/src/utils/upload-audio-selection.util.ts` | Apply picked file to upload context |
| `apps/web/src/utils/upload-wizard-route.util.ts` | `uploadStepFromPathname`, `uploadPathSegmentFromStep` (URL ↔ tab sync) |

### Upload wizard (Figma `4506:21677` + ladder)

| Module | Role |
| ------ | ---- |
| `apps/web/src/components/shared/upload/upload-studio-ui.ts` | `UPLOAD_SHELL.modalHeightClass`, tabs, content card |
| `apps/web/src/components/shared/upload/UploadEntryStepModal.tsx` | File pick; same shell height as wizard |
| `apps/web/src/components/shared/upload/UploadModal.tsx` | Tab shell: progress, details, listener, review |
| `apps/web/src/components/shared/upload/ListenerSettings.tsx` | Listener tab ([`4506:21677`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4506-21677)) |
| `apps/web/src/components/shared/upload/SermonDetailsForm.tsx` | Details tab |
| `apps/web/src/components/shared/upload/ReviewSubmit.tsx` | Publish + Save as draft |
| `apps/web/src/context/upload/uploadState.tsx` | Wizard state, `sermonId`, steps |

### Drafts (Figma `10209:78627`)

| Concern | Implementation |
| ------- | -------------- |
| Server draft save | `ReviewSubmit` → `publishSermon` with `status: 'draft'` |
| List filter | `SermonsTable` status radio → `MySermons` query `status: 'draft'` |
| Status UI | `my-sermons-ui.tsx` Draft pill `#fddcd8` dot |
| Resume | `SermonUploadPage` `location.state.resumeSermonId` → `fetchSermonDetail` |
| Query refresh | `invalidateQueries(sermonQueryKeys.*)` after save/publish/bin |

---

## Modal height contract

```ts
// upload-studio-ui.ts
modalHeightClass: 'h-[min(660px,92dvh)] max-h-[92dvh]'
```

- **`UploadModal`:** `shellClassName` uses `modalHeightClass` (not deprecated `minHeightClass`).
- **`UploadEntryStepModal`:** same height; 42px tab-strip spacer; `contentCard` body; footer band spacer.
- **Scroll:** `SermonDetailsForm` / `ReviewSubmit` use `min-h-0 max-h-full` inside flex shell (not `100vh` calc).

---

## API (unchanged from feat-0006)

| Action | Endpoint |
| ------ | -------- |
| List (draft filter) | `GET /sermon/minister/:ownerId?status=draft` |
| Start upload | `POST /sermon/start-upload` |
| Save draft / publish | `POST /sermon/publish/:id` body `{ status: 'draft' \| 'published', … }` |

Owner id: `resolveStudioSermonOwnerId` (minister id or creator scope).

---

## Implementation checklist

### In scope (done)

- [x] My Sermons page at `/studio/{code}/sermons`
- [x] Empty table shell (`10154:35090`)
- [x] Status filter Draft / Published / All
- [x] Upload entry modal + wizard on `SermonUploadPage`
- [x] Decorative My Sermons backdrop during upload
- [x] Save as draft + list refresh
- [x] Standard modal height across entry + wizard
- [x] URL ↔ wizard tab bidirectional sync (`uploadPathSegmentFromStep`, `UploadModal.onStepChange`)

### Deferred / out of scope

- [ ] Pixel QA overlay vs Figma at 1× (empty, draft library, listener tab, all wizard steps)
- [ ] Bin page full Figma parity ([feat-0006](../feat-0006/TECH.md))
- [ ] Duplicate sermon / move to series row actions
- [ ] Sermon detail & edit routes (replace placeholders)
- [ ] Upload success / error chrome (`10162:39143`, `10252:34896`)
- [ ] Listener settings sub-variants (`6314:*`, `6317:*`) pixel pass
- [ ] Export PNG assets to [`assets/`](./assets/README.md)

---

## Omissions & known gaps (code)

Inherited from [feat-0006 TECH](../feat-0006/TECH.md) unless noted.

| Gap | Module / behavior | feat-0018 |
| --- | ----------------- | --------- |
| URL ↔ wizard step | `SermonUploadPage` + `UploadModal.onStepChange` | Implemented (feat-0018) |
| Series / Playlists tabs | `SermonsTable` — toast on tab change | Non-goal |
| Duplicate / move to series | `SermonsTable` — `toast.message('… not available yet')` | Non-goal |
| Analytics row action | Context menu → feat-0017 or toast | Non-goal |
| Sermon detail / resume / edit routes | `SermonDetailPlaceholder` | feat-0006 |
| Bin restore / hard delete | `Bin.tsx` + API | feat-0006 |
| Mid-upload close / abort policy | `UploadModal` + upload context | [`04` draft-modal](../../04%20-%20sermon-upload-draft.md#draft-modal) |
| `image-upload` without `sermonId` | API orphan draft | feat-0006 API gap |
| Decorative empty shell row actions | `MySermonsEmptyShell` — `noop` handlers | By design (backdrop) |

---

## Validation

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Manual:

1. Empty library → Create sermon → upload → Save draft → Draft filter shows row.
2. Publish draft → Published filter → Get Started step 6 if first publish.
3. Open `/sermons/upload` → backdrop visible; entry and Details modals same height.

---

## Related

- [feat-0006 TECH](../feat-0006/TECH.md)
- [feat-0008 TECH](../feat-0008/TECH.md)
- [`SERMON_UPLOAD_IMPLEMENTATION_PLAN.md`](../../../../SERMON_UPLOAD_IMPLEMENTATION_PLAN.md)
