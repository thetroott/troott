# feat-0018: Studio My Sermons — upload wizard, library, and drafts (Figma)

> **Figma file:** [Troott `9lFM6TncipSv0pNVGBWZwA`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott). Screenshots: [`assets/README.md`](./assets/README.md).

## Summary

Deliver the **My Sermons** studio surface and **upload-from-computer** modal flow for ministers and creators: empty library chrome, populated list with **Draft / Published** filters, entry modal (file pick), multi-step **UploadModal** wizard, and **Save as draft** / **Publish** outcomes.

This feat is the **Figma-aligned implementation layer** for [feat-0006](../feat-0006/PRODUCT.md) (CRUD + lifecycle). Legacy UC detail remains in [`04 - sermon-upload-draft.md`](../../04%20-%20sermon-upload-draft.md) and [`05 - sermon-view-trash.md`](../../05%20-%20%20sermon-view-trash.md).

**Branch:** Implemented on `favour-development` (workspace migration batches + sermon upload commits from `damola-development`: `f2a0650`–`cb00ee0`, `304569a`, `755b4a5` modal height).

## Problem

| Today (before this feat) | Gap |
| ------------------------ | --- |
| Placeholder dashboard sermon views | No Figma-aligned library table, filters, or empty shell |
| Upload on orphan routes | Wizard not hosted over My Sermons; inconsistent entry |
| Draft rows unclear in UI | Status pill, filter, and resume path not spec’d to Figma |
| Modal height varies by step | Entry modal shorter than Details tab — breaks visual standard |

## Consumer

Authenticated **minister** or **creator** with studio access at `/studio/{studioCode}/sermons`.

## Non-goals

- **Series / Playlists** tabs and list content (toolbar placeholders + “not available yet” toasts only)
- **Bin** page, restore, and permanent delete UI ([feat-0006 TECH](../feat-0006/TECH.md) gaps)
- **Mobile** listener upload
- **Document verification** modal (Get Started — separate flow)
- **Sermon Analytics** from row context menu ([feat-0017](../feat-0017/PRODUCT.md))
- **Duplicate sermon** and **move to series** row actions (toast stubs today)
- **Full upload ladder pixel pass** for every Figma artboard under `4364:6632` (see [Omissions](#omissions--deferred))
- **Exported PNG assets** in [`assets/`](./assets/README.md) (README lists targets; files not committed yet)

---

## Omissions & deferred

feat-0018 is the **Figma UI layer** for three primary frames plus modal-height standard. Everything below is **explicitly out of this feat** or **deferred** to a follow-up.

### Product surfaces omitted

| Surface | Status | Owner spec / follow-up |
| ------- | ------ | ---------------------- |
| **Series** tab | Placeholder; toast on select | Future series feat |
| **Playlists** tab | Placeholder; toast on select | Future playlists feat |
| **Bin** (`/studio/{code}/bin`) | Stub / partial | [feat-0006](../feat-0006/PRODUCT.md), [`05 - sermon-view-trash.md`](../../05%20-%20%20sermon-view-trash.md) |
| **Sermon detail / edit** routes | `SermonDetailPlaceholder` | feat-0006 UC-U05 / UC-V3 |
| **Duplicate sermon** | Toast “not available yet” | TBD |
| **Move to series** | Toast “not available yet” | TBD |
| **Analytics** (row menu) | Toast or noop until feat-0017 | [feat-0017](../feat-0017/PRODUCT.md) |
| **Populated library** dedicated frame | Same chrome as `10154:35090` with rows | Pixel QA only; no separate UC |

### Upload wizard steps — referenced, not primary in this feat

Primary Figma anchors: **`10154:35090`**, **`10209:78627`**, **`4506:21677`**. Other wizard frames are implemented in code but **not gated** by feat-0018 acceptance criteria. Full ordered ladder: [`SERMON_UPLOAD_IMPLEMENTATION_PLAN.md`](../../../../SERMON_UPLOAD_IMPLEMENTATION_PLAN.md).

| Step | Figma node(s) | feat-0018 scope |
| ---- | ------------- | --------------- |
| File pick (entry) | `4281:11102` | In scope (shell height only) |
| Upload progress | `4530:20801`, `4530:21351`, `4555:6094` | Height ref; per-state pixel QA deferred |
| Details / metadata | `4558:8281`, `4660:6496` | Implemented; not primary frame |
| Listener settings | `4506:21677` (+ sub-variants `6314:*`, `6317:*`) | Primary frame; sub-variant pixel QA deferred |
| Thumbnail / cover | `4296:7648`, `4698:20904`, `4755:6887` | Implemented in `SermonDetailsForm`; omitted from PRODUCT UCs |
| Processing / blocking | `6147:33439` | Deferred |
| Review & submit | `4348:6495`, `6147:67501` | Covered by UC-MS04 only |
| Success / error chrome | `10162:39143`, accessories `10252:34896` | Deferred |
| Full **my sermons** section | `10252:35020` | Plan doc only |

### Lifecycle & policy — delegated (not re-spec’d here)

| Topic | Spec |
| ----- | ---- |
| Close modal mid-upload / abort | [`04` — draft modal](../../04%20-%20sermon-upload-draft.md#draft-modal) |
| Draft without audio vs after upload | [`04` — draft audio display](../../04%20-%20sermon-upload-draft.md#draft-audio-display) |
| Replace / remove audio pre-publish | [`04` — UC-U4](../../04%20-%20sermon-upload-draft.md#uc-u4) |
| Move to bin, trash page, restore | [`05` — UC-V6–V8](../../05%20-%20%20sermon-view-trash.md) |
| Edit published metadata | [`05` — UC-V3 / UC-V5](../../05%20-%20%20sermon-view-trash.md) |
| Single-flight `start-upload` | [feat-0008](../feat-0008/PRODUCT.md) |
| First publish → Get Started step 6 | [feat-0005](../feat-0005/PRODUCT.md) (one-line in UC-MS04) |
| Studio tour — Sermons nav | [feat-0016](../feat-0016/PRODUCT.md) |

### Deferred acceptance / QA

- **1× Figma overlay diff** for empty library, draft outcome, listener tab, and modal height across all wizard tabs
- **Bin page** Figma parity
- **URL ↔ wizard tab sync** — implemented via `uploadPathSegmentFromStep` and `UploadModal.onStepChange` (see [TECH](./TECH.md))
- **Screenshot exports** under [`assets/`](./assets/README.md)

---

## Figma reference (authoritative frames)

Base file: [Troott Figma](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott).

### A — My Sermons library (empty + populated)

| Node | Link | Product role |
| ---- | ---- | ------------ |
| `10154:35090` | [My Sermons empty table](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35090) | Page chrome: header, **Sermon / Series / Playlists** tabs, toolbar (search, filter, sort, view toggle), **Create sermon**, empty table + pagination |

**Populated list** uses the same shell with rows showing title, status pill (**Published** `#6f94b8` dot / **Draft** `#fddcd8` dot), duration, visibility, actions menu.

### B — Upload completion / library with drafts

| Node | Link | Product role |
| ---- | ---- | ------------ |
| `10209:78627` | [Library + draft outcome](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10209-78627) | After **Save as draft** or close wizard: draft row visible on My Sermons; filter **Draft** shows unpublished sermons |

### C — Upload wizard — listener settings step

| Node | Link | Product role |
| ---- | ---- | ------------ |
| `4506:21677` | [Listener settings](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4506-21677) | **UploadModal** tab **Listener settings** — visibility, schedule, footer status strip |

Related wizard shells (same modal height — `660px` / `92dvh` cap): entry `4281:11102`, progress `4530:20801`, details `4558:8281`, review `4348:6495` (see [`SERMON_UPLOAD_IMPLEMENTATION_PLAN.md`](../../../../SERMON_UPLOAD_IMPLEMENTATION_PLAN.md) ladder).

---

## User flows

### UC-MS01 — Empty library + first upload

1. User opens `/studio/{code}/sermons` with zero sermons.
2. Page renders **My Sermons** shell ([`10154:35090`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35090)) with empty table (not marketing-only empty card).
3. **Create sermon** opens **`UploadEntryStepModal`** (drag/drop or file pick).
4. Valid audio → navigate to `/studio/{code}/sermons/upload/…` + **`UploadModal`** wizard.
5. User completes steps or **Save as draft** → modal closes → list refetches.

### UC-MS02 — Upload modal over library backdrop

1. User lands on `/studio/{code}/sermons/upload` (Get Started, tour, or direct link).
2. **`SermonUploadPage`** shows **`MySermonsEmptyShell`** as **decorative backdrop** (non-interactive) under modals — matches Figma “modal over View”.
3. Entry modal first; wizard after file selected.

### UC-MS03 — Draft filter and resume

1. User saves draft from review step ([UC-U2](../../04%20-%20sermon-upload-draft.md#uc-u2)).
2. Row appears on library with **Draft** pill ([`10209:78627`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10209-78627)).
3. Toolbar filter → **Draft** calls `GET /sermon/minister/:ownerId?status=draft`.
4. Row action / resume navigates with `resumeSermonId` → wizard opens on appropriate step.

### UC-MS04 — Publish

1. Review → **Publish** → `POST /sermon/publish/:id` with `status: published`.
2. Row shows **Published** pill; filter **Published** includes row.
3. First publish may complete Get Started step 6 ([feat-0005](../feat-0005/PRODUCT.md)).

---

## Modal height standard

All upload dialogs (**entry** + **wizard** tabs) share one fixed shell height matching the **Details** tab ([`4530:20801`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4530-20801)):

- Token: `UPLOAD_SHELL.modalHeightClass` → `h-[min(660px,92dvh)]`
- Entry modal reserves **42px** tab-strip spacer so content card aligns with wizard

---

## Acceptance criteria

1. `/studio/{code}/sermons` matches Figma `10154:35090` chrome for empty and populated states.
2. Upload entry + wizard modals share standard height across all steps.
3. **Draft** and **Published** filters return correct server lists; status pills match Figma colors.
4. Save draft and publish invalidate TanStack list queries without manual refresh.
5. Upload route shows My Sermons backdrop behind modals (`SermonUploadPage`).
6. **Create sermon** from toolbar uses same entry modal → wizard sequence as Get Started upload.

---

## Related

- [feat-0006 PRODUCT](../feat-0006/PRODUCT.md) — CRUD + API map
- [feat-0008](../feat-0008/PRODUCT.md) — single `start-upload` per file
- [feat-0016](../feat-0016/PRODUCT.md) — tour step 3 (Sermons nav)
- [`04 - sermon-upload-draft.md`](../../04%20-%20sermon-upload-draft.md)
- [`05 - sermon-view-trash.md`](../../05%20-%20%20sermon-view-trash.md)
