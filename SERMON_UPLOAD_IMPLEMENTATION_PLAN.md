# Studio sermon upload: unified plan (Figma, specs, current web)

**Status:** Planning and sequencing; **§2** is the ordered **pixel-accuracy** ladder for `apps/web`. Code may land incrementally against that ladder.  
**Supersedes:** Prior root `SERMON_UPLOAD_IMPLEMENTATION_PLAN.md` and `.cursor/plans/upload_sermon_ui_analysis_aee2e0d9.plan.md` (removed).

**References**

- Product: [specs/web/04 - sermon-upload-draft.md](specs/web/04%20-%20sermon-upload-draft.md), [specs/web/05 - sermon-view-trash.md](specs/web/05%20-%20%20sermon-view-trash.md)
- Figma (same file `9lFM6TncipSv0pNVGBWZwA` — Troott):
  - [**my sermons** — node `10252-35020`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10252-35020&m=dev) (`10252:35020`, `SECTION`)
  - [**Upload from computer** — node `4364-6632`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4364-6632&m=dev) (`4364:6632`, `SECTION`)
- Talk to Figma MCP channel used when pulling structure: `hi3hf1qx`

---

## 1. Figma design capture (dual scope for `apps/web`)

These two sections are the **authoritative UI** for the minister **My Sermon (View)** surface and the **upload** flow that sits on top of it (modal in product spec). Implementation in [`apps/web`](apps/web) should trace every layout and component variant back to these nodes (plus Dev Mode specs for spacing, type, and color).

### 1.0 Dual-node overview

| URL node id | Canvas node | Name (Figma) | Maps to spec | Role for `apps/web` |
|-------------|-------------|--------------|--------------|---------------------|
| `10252-35020` | `10252:35020` | **my sermons** (`SECTION`) | [05 — UC-V1](specs/web/05%20-%20%20sermon-view-trash.md#uc-v1) | Full-page **library**: toolbar, list/grid, filters, sort, search, row/card states, empty state, links to Trash / upload entry points. |
| `4364-6632` | `4364:6632` | **Upload from computer** (`SECTION`) | [04 — UC-U1–U6](specs/web/04%20-%20sermon-upload-draft.md#uc-u1) | **Upload wizard** variants: file drop, progress, details, listener settings, review, error/loading, modal chrome — same **Dashboard Creators** shell as studio. |

**MCP note:** `get_node_info` for `4364:6632` succeeded (large subtree). For `10252:35020`, a follow-up pull **timed out** — re-run `join_channel` + `get_node_info` / shallow `scan_*` on a **single child frame** inside the section when implementing, or use Figma Dev Mode for redlines.

### 1.1 `10252:35020` — **my sermons** (library / View)

**Product intent ([05](specs/web/05%20-%20%20sermon-view-trash.md)):** This section should realize **My Sermon (View)** — not the upload wizard itself, but the **host page** that shows sermon rows, empty first-time experience, and entry to **Upload** / **Create sermon** (opening the modal described under `4364:6632`).

**UI blocks to capture from Figma (checklist for engineers):**

- **Studio shell:** `SIDE BAR` (or equivalent) + top bar consistent with upload section — same [`DashboardLayout`](apps/web/src/components/layouts/DashboardLayout.tsx) / nav story when both flows are unified.
- **Page header / toolbar:** Primary actions (**Upload**, **Create sermon**), optional **Drafts** filter, **Trash** navigation to full page ([05 — page vs modal](specs/web/05%20-%20%20sermon-view-trash.md#page-vs-modal)).
- **List vs grid:** Toggle, persisted preference ([UC-V1](specs/web/05%20-%20%20sermon-view-trash.md#uc-v1)).
- **Table or card row:** Title, duration, status (draft / published / processing), visibility, last updated, actions (open **update/resume** modal), kebab / overflow if designed.
- **Empty state:** Illustration, copy, single primary **Upload** — replaces dummy empty in [`MySermons.tsx`](apps/web/src/app/dashboard/MySermons.tsx) when wired to real data.
- **Filters / search / sort:** Controls and dropdown patterns (same file often uses **drop-down**, **sort**, **filter** components under Backoffice — align tokens with `components/ui`).
- **Analytics / summary** (if present in this section): cards or charts — align with [`Analytics`](apps/web/src/app/dashboard/Analytics.tsx) or inline widgets; same API minister scope as list.
- **States:** loading skeleton, API error banner, permission denied — [UC-V1 A2–A3](specs/web/05%20-%20%20sermon-view-trash.md#uc-v1).

### 1.2 `4364:6632` — **Upload from computer** (wizard + variants)

- **Node:** `4364:6632` — `SECTION` **Upload from computer** (Backoffice page).
- **Intent:** Studio shell with main canvas for **upload / progress / steps / outcomes**. Many **parallel artboards** (variants), not a single prototype tree.

**Structural pattern (from MCP `get_node_info`, depth-limited walk):**

- **Repeating artboard:** `FRAME` **Dashboard Creators** appears **28 times** under this section — treat as **variants** (steps, empty, loading, error, review, etc.).
- **Common shell per artboard:**
  - **Top row:** `Frame 1618868603` with **Component 9–12** instances (step / breadcrumb UI).
  - **Header block:** `Frame 1618868607` instance cluster.
  - **Main column clusters:** e.g. `1618868623`, `1618868643`, `1618868644`, `1618868598` (step-specific body).
  - **Navigation:** `INSTANCE` **SIDE BAR**.
  - **Overlay / dialog region:** e.g. `1618868682`, `1618868730`, `1618868201` — **modal** layer in spec.
- **Related nodes (same file):** `4296:5665` **Review & Submit**; `4364:9553` **Modal** — use for modal-only layout and footer actions.

### 1.3 Spec-aligned flow (both nodes together)

1. **Host:** User lands on **View** (`10252` / My Sermons). Upload is a **modal** over this page ([05](specs/web/05%20-%20%20sermon-view-trash.md#page-vs-modal)), not an isolated marketing page.
2. **Steps (modal):** file pick / drop → **upload progress** → **details** → **listener settings** → **review** → **Publish** or **Save as draft** ([04 — UC-U1](specs/web/04%20-%20sermon-upload-draft.md#uc-u1)).
3. **Deep link:** `.../audio/upload` → View + modal open ([05 — UC-V1 A1](specs/web/05%20-%20%20sermon-view-trash.md#uc-v1)).
4. **Trash:** separate **full page** — nav from View; design consistency with sidebar in both Figma sections.

### 1.4 Figma follow-up (both nodes)

- Build a **variant map** per section: artboard id → screen name → state (empty / loading / error / success).
- `scan_text_nodes` on **one small frame at a time** if whole-section scans time out.
- Export **component** list from Figma (local components used by these sections) and map each to `apps/web/src/components/ui/*` or new `studio/*` modules.

---

## 2. Ten-step pixel-accuracy implementation ladder (Figma → `apps/web`)

Use this as the **only** ordered checklist for upload UI upgrades. Each step should close with a **visual sign-off** (Figma Dev Mode or overlay diff at 1×) before starting the next. Base file for all links: [Troott — Figma](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott).

**Product specs (must stay aligned while matching pixels):** [04 — upload / draft / publish](specs/web/04%20-%20sermon-upload-draft.md), [05 — View / modal / Trash routing](specs/web/05%20-%20%20sermon-view-trash.md).

### Pixel parity rules (every step)

- Record **frame name + node id** in PR for the variant you matched.
- Match **spacing, radius, stroke, typography** from Dev Mode; prefer design tokens over one-off hex where the DS already defines them.
- Match **default, hover, focus, disabled, error** states shown in Figma for that step.
- **Do not** change API contracts inside a pixel step; if Figma implies new fields, flag product/spec first ([04](specs/web/04%20-%20sermon-upload-draft.md)).

---

### Step 1 — Inventory, tokens, and variant map (whole upload system)

| Item | Detail |
|------|--------|
| **Figma** | [Upload from computer — `4364-6632`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4364-6632&m=dev) |
| **Goal** | Build a **variant matrix** spreadsheet or table: each artboard → step name → state (empty / loading / error / success). List shared components (buttons, inputs, stepper). |
| **Deliverable** | Token notes (colors, type scale, radii) + which `components/ui/*` map to which Figma components. |
| **Spec** | [UC-U1](specs/web/04%20-%20sermon-upload-draft.md#uc-u1) flow order must match the matrix. |

---

### Step 2 — File selection (pre-modal / step “file”)

| Item | Detail |
|------|--------|
| **Figma** | [Step 1 — `4281-11102`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4281-11102&t=VbHa5kzlQtcOFdW6-4) |
| **`apps/web`** | [`FileUploadZone.tsx`](apps/web/src/components/shared/upload/FileUploadZone.tsx), [`UploadLayout.tsx`](apps/web/src/components/layouts/UploadLayout.tsx) main column |
| **Goal** | Pixel match drop zone, copy, iconography, CTA, drag state, validation error banner vs Figma. |
| **Spec** | [UC-U1 A1](specs/web/04%20-%20sermon-upload-draft.md#uc-u1) invalid file; [draft audio display](specs/web/04%20-%20sermon-upload-draft.md#draft-audio-display) empty slot. |

---

### Step 3 — Upload progress (network + UI states)

| Item | Detail |
|------|--------|
| **Figma** | [Step 2 — `4530-20801`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4530-20801&t=VbHa5kzlQtcOFdW6-4), [`4530-21351`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4530-21351&t=VbHa5kzlQtcOFdW6-4), [`4555-6094`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4555-6094&t=VbHa5kzlQtcOFdW6-4) |
| **`apps/web`** | [`UploadProgressStep.tsx`](apps/web/src/components/shared/upload/UploadProgressStep.tsx), progress bar + spinner + retry row in [`UploadModal.tsx`](apps/web/src/components/shared/upload/UploadModal.tsx) if chrome is shared |
| **Goal** | Each linked frame = one **visual state** (e.g. uploading, near-complete, error). Align progress text, bar height, cancel control. |
| **Spec** | [UC-U1](specs/web/04%20-%20sermon-upload-draft.md#uc-u1) progress; [UC-U1 A2](specs/web/04%20-%20sermon-upload-draft.md#uc-u1) retry; [draft modal](specs/web/04%20-%20sermon-upload-draft.md#draft-modal) dismiss/abort behavior. |

---

### Step 4 — Details & metadata form

| Item | Detail |
|------|--------|
| **Figma** | [Step 3 — `4558-8281`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4558-8281&t=VbHa5kzlQtcOFdW6-4), [`4660-6496`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4660-6496&t=VbHa5kzlQtcOFdW6-4) |
| **`apps/web`** | [`SermonDetailsForm.tsx`](apps/web/src/components/shared/upload/SermonDetailsForm.tsx), field-level errors, section spacing |
| **Goal** | Match labels, placeholders, grid/gaps, required markers, inline validation vs each frame. |
| **Spec** | [UC-U5](specs/web/04%20-%20sermon-upload-draft.md#uc-u5), [UC-U6](specs/web/04%20-%20sermon-upload-draft.md#uc-u6) required metadata. |

---

### Step 5 — Listener settings (primary layouts)

| Item | Detail |
|------|--------|
| **Figma** | [Step 4 — `4499-19755`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4499-19755&t=VbHa5kzlQtcOFdW6-4), [`4506-21677`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4506-21677&t=VbHa5kzlQtcOFdW6-4), [`4663-6789`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4663-6789&t=VbHa5kzlQtcOFdW6-4), [`4776-7198`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4776-7198&t=VbHa5kzlQtcOFdW6-4), [`4764-7789`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4764-7789&t=VbHa5kzlQtcOFdW6-4), [`6147-32806`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6147-32806&t=VbHa5kzlQtcOFdW6-4), [`4778-7851`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4778-7851&t=VbHa5kzlQtcOFdW6-4) |
| **`apps/web`** | [`ListenerSettings.tsx`](apps/web/src/components/shared/upload/ListenerSettings.tsx), [`PublishSettings.tsx`](apps/web/src/components/shared/upload/PublishSettings.tsx) |
| **Goal** | Visibility controls, schedule controls, section headers, toggles/radios match Figma hierarchy and spacing. |
| **Spec** | [UC-U5](specs/web/04%20-%20sermon-upload-draft.md#uc-u5) visibility; [05 — UC-V5](specs/web/05%20-%20%20sermon-view-trash.md#uc-v5) for published visibility (consistency). |

---

### Step 6 — Listener settings (sub-variants / “Step 4a”)

| Item | Detail |
|------|--------|
| **Figma** | [Step 4a — `6314-28677`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6314-28677&t=VbHa5kzlQtcOFdW6-4), [`6317-28142`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6317-28142&t=VbHa5kzlQtcOFdW6-4), [`6317-28202`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6317-28202&t=VbHa5kzlQtcOFdW6-4), [`6317-28286`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6317-28286&t=VbHa5kzlQtcOFdW6-4), [`6317-28500`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6317-28500&t=VbHa5kzlQtcOFdW6-4), [`6147-33917`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6147-33917&t=VbHa5kzlQtcOFdW6-4), [`6147-35033`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6147-35033&t=VbHa5kzlQtcOFdW6-4) |
| **`apps/web`** | Same as Step 5 — implement **conditional panels** (popover, date picker, helper text) per frame; split subcomponents if files grow. |
| **Goal** | Each sub-frame is an explicit **UI state** (e.g. scheduled publish, unlisted explainer). No orphaned controls. |
| **Spec** | [UC-U5 A1](specs/web/04%20-%20sermon-upload-draft.md#uc-u5) schedule validation. |

---

### Step 7 — Thumbnail / cover & supporting media strip

| Item | Detail |
|------|--------|
| **Figma** | [Step 5 — `4296-7648`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4296-7648&t=VbHa5kzlQtcOFdW6-4), [`4698-20904`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4698-20904&t=VbHa5kzlQtcOFdW6-4), [`4755-6887`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4755-6887&t=VbHa5kzlQtcOFdW6-4) |
| **`apps/web`** | [`ThumbnailUpload.tsx`](apps/web/src/components/shared/upload/ThumbnailUpload.tsx) and any **details** layout slots that host cover art in Figma |
| **Goal** | Match upload target, preview, remove/replace, empty vs filled states across the three frames. |
| **Spec** | [UC-U5 A2](specs/web/04%20-%20sermon-upload-draft.md#uc-u5) optional thumbnail; image upload API parity. |

---

### Step 8 — Transitional / blocking UI (“Step 6” single frame)

| Item | Detail |
|------|--------|
| **Figma** | [Step 6 — `6147-33439`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6147-33439&t=VbHa5kzlQtcOFdW6-4) |
| **`apps/web`** | [`UploadModal.tsx`](apps/web/src/components/shared/upload/UploadModal.tsx) overlay or [`UploadProgressStep.tsx`](apps/web/src/components/shared/upload/UploadProgressStep.tsx) / shared **banner** component — confirm in Figma whether this is *processing*, *blocking*, or *handoff* |
| **Goal** | Pixel match the single artboard; wire to real **processing** or **gated publish** state from API when applicable. |
| **Spec** | [UC-U1 A3](specs/web/04%20-%20sermon-upload-draft.md#uc-u1) processing. |

---

### Step 9 — Review & submit

| Item | Detail |
|------|--------|
| **Figma** | [Step 7 — `4348-6495`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4348-6495&t=VbHa5kzlQtcOFdW6-4), [`6147-67501`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6147-67501&t=VbHa5kzlQtcOFdW6-4) |
| **`apps/web`** | [`ReviewSubmit.tsx`](apps/web/src/components/shared/upload/ReviewSubmit.tsx), modal footer primary/secondary buttons in [`UploadModal.tsx`](apps/web/src/components/shared/upload/UploadModal.tsx) |
| **Goal** | Summary layout, link row, badges, **Publish** / **Save as draft** hierarchy and spacing match Figma. |
| **Spec** | [UC-U2](specs/web/04%20-%20sermon-upload-draft.md#uc-u2), [UC-U6](specs/web/04%20-%20sermon-upload-draft.md#uc-u6); [UC-V1](specs/web/05%20-%20%20sermon-view-trash.md#uc-v1) list refresh after close. |

---

### Step 10 — Completion, error, chrome, and QA (your “Steps 9–10” + accessories)

| Item | Detail |
|------|--------|
| **Figma** | [Step 9 — `10162-39143`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10162-39143&t=VbHa5kzlQtcOFdW6-4), [`10209-78627`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10209-78627&t=VbHa5kzlQtcOFdW6-4); [Step 10 — `10154-35090`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35090&t=VbHa5kzlQtcOFdW6-4), [`10169-42706`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10169-42706&t=VbHa5kzlQtcOFdW6-4); **Accessories** [`10252-34896`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10252-34896&t=VbHa5kzlQtcOFdW6-4) |
| **`apps/web`** | Toast / full-page success if spec’d, modal **error** chrome, stepper completion states; align **toolbar / secondary chrome** beside upload with accessories frame and [`FeedSection.tsx`](apps/web/src/components/shared/upload/FeedSection.tsx) only if product keeps it |
| **Goal** | Success and failure surfaces match Figma; **end-to-end** run at 1× viewport (desktop) with screenshot diff; keyboard pass on modal. |
| **Spec** | [UC-U6](specs/web/04%20-%20sermon-upload-draft.md#uc-u6) post-publish; [UC-U1 A2](specs/web/04%20-%20sermon-upload-draft.md#uc-u1) errors; [05 — page vs modal](specs/web/05%20-%20%20sermon-view-trash.md#page-vs-modal) host vs modal boundaries. |

---

**Note on numbering:** Your message used “Step 4a” and skipped **Step 8** in naming; this ladder uses **10 engineering steps** so implementation stays linear. **Step 8** here is the dedicated **transitional** frame (`6147-33439`). **Step 10** bundles your **Steps 9–10** plus **Accessories** so the last milestone is always “ship-quality + chrome.”

---

## 3. `apps/web` — layouts, components, and UI implementation map

This table is the **build checklist** for aligning `apps/web` with Figma nodes `10252:35020` + `4364:6632` and specs 04/05. Paths are under [`apps/web`](apps/web) unless noted.

| Area | Figma source | Layout / composition | Components / files to implement or refactor |
|------|--------------|----------------------|---------------------------------------------|
| **Studio shell** | Both sections (`SIDE BAR` + main) | Full viewport: sidebar + `NavBar` + scrollable main | [`DashboardLayout.tsx`](apps/web/src/components/layouts/DashboardLayout.tsx), [`AppSidebar`](apps/web/src/components/shared/navigation/Sidebar.tsx), [`NavBar`](apps/web/src/components/shared/navigation/NavBar.tsx); tokens/spacing to match Figma shell. |
| **My Sermon (View)** | `10252:35020` | Page: toolbar + content (list/grid) + optional analytics strip | [`MySermons.tsx`](apps/web/src/app/dashboard/MySermons.tsx), [`SermonsTable.tsx`](apps/web/src/components/shared/my-sermons/SermonsTable.tsx), [`EmptySermonsState.tsx`](apps/web/src/components/shared/my-sermons/EmptySermonsState.tsx); new pieces as needed: **toolbar**, **filters**, **sort**, **grid view**, **row/card** per Figma. |
| **Upload entry** | `10252` + `4364` | CTA opens modal; deep link opens same | Wire **Upload** / **Create sermon** from View; avoid orphan **`/upload`** ([`UserDraft.tsx`](apps/web/src/app/dashboard/UserDraft.tsx) bug); align [`private.tsx`](apps/web/src/routes/private.tsx) with future `/minister/.../audio` + `upload` query or route. |
| **Upload page shell (interim)** | `4364` | Until View hosts modal: [`UploadLayout`](apps/web/src/components/layouts/UploadLayout.tsx) + [`UploadOptions`](apps/web/src/components/shared/upload/UploadOptions.tsx) | Refactor toward **View + modal**; match Figma chrome (tabs vs spec). |
| **File step** | `4364` variants | Drop zone, validation, primary CTA | [`FileUploadZone.tsx`](apps/web/src/components/shared/upload/FileUploadZone.tsx) — empty / error / selected file states vs Figma. |
| **Modal + steps** | `4364`, `4364:9553`, `4296:5665` | Dialog: progress → details → listener → review | [`UploadModal.tsx`](apps/web/src/components/shared/upload/UploadModal.tsx), [`UploadProgressStep.tsx`](apps/web/src/components/shared/upload/UploadProgressStep.tsx), [`SermonDetailsForm.tsx`](apps/web/src/components/shared/upload/SermonDetailsForm.tsx), [`ListenerSettings.tsx`](apps/web/src/components/shared/upload/ListenerSettings.tsx), [`PublishSettings.tsx`](apps/web/src/components/shared/upload/PublishSettings.tsx), [`ThumbnailUpload.tsx`](apps/web/src/components/shared/upload/ThumbnailUpload.tsx), [`ReviewSubmit.tsx`](apps/web/src/components/shared/upload/ReviewSubmit.tsx). |
| **Stepper / header** | `4364` top `Component 9–12` | Breadcrumb or step indicator | Implement shared **Stepper** / progress header in `components/shared/upload` or `components/ui`; keep in sync with [`UploadModal`](apps/web/src/components/shared/upload/UploadModal.tsx) step state. |
| **Feed / activity (optional)** | `4364` if shown beside upload | Secondary column | [`FeedSection.tsx`](apps/web/src/components/shared/upload/FeedSection.tsx) — replace static copy with real data or remove per product. |
| **Upload transport** | Progress / error variants | Progress bar, retry, cancel | [`background-upload.service.ts`](apps/web/src/services/background-upload.service.ts) → real API; modal dismiss + [`upload.context.tsx`](apps/web/src/context/upload/upload.context.tsx) for **AbortController** and errors. |
| **Trash** | Nav from `10252` shell | Full page | [`Trash.tsx`](apps/web/src/app/dashboard/Trash.tsx) + routes — match Figma **Trash** page when that frame exists in file. |
| **Primitives** | Buttons, inputs, tables, menus | Shadcn / custom | [`components/ui/*`](apps/web/src/components/ui); extend only where Figma requires variants not yet in the design system. |

**Routing / nav data:** [`navdata.tsx`](apps/web/src/_data/navdata.tsx), [`breadcrumb-map.tsx`](apps/web/src/components/shared/navigation/breadcrumb-map.tsx) — keep labels and URLs consistent with studio URLs in [05](specs/web/05%20-%20%20sermon-view-trash.md#studio-routing).

---

## 4. What “/upload” means vs the real app

| Path | What it is |
|------|------------|
| **`/upload-sermon`** | Canonical **sermon upload** route today ([`private.tsx`](apps/web/src/routes/private.tsx)); renders [`UploadSermon.tsx`](apps/web/src/app/upload/UploadSermon.tsx). |
| **`/upload`** | **Not** defined for sermons in `privateRoutes`. [`UserDraft.tsx`](apps/web/src/app/dashboard/UserDraft.tsx) calls `navigate('/upload')` after loading a draft — **broken / 404 risk**; should align with `/upload-sermon` or future minister-scoped URL. |
| **`.../verify-document/upload`** | **Account verification** document upload ([`UploadDocument`](apps/web/src/components/shared/get-started/UploadDocument.tsx)) — unrelated to sermon flow. |

**Spec target:** `/minister/:ministerId/audio/...` on `studio.troott.com`, with **`/audio/upload`** as deep link to **View + modal** ([05 – Studio routing](specs/web/05%20-%20%20sermon-view-trash.md#studio-routing)).

---

## 5. Current web implementation (brief)

| Layer | Role |
|--------|------|
| [`UploadLayout`](apps/web/src/components/layouts/UploadLayout.tsx) + [`UploadOptions`](apps/web/src/components/shared/upload/UploadOptions.tsx) | Dashboard-style layout; tabs; non-upload tab = “Coming Soon”. |
| [`FileUploadZone`](apps/web/src/components/shared/upload/FileUploadZone.tsx) | Primary **empty** drop zone; validation; auto-advance toward modal. |
| [`UploadModal`](apps/web/src/components/shared/upload/UploadModal.tsx) | Steps after file: progress, details, listener settings, review. |
| [`UploadProgressStep`](apps/web/src/components/shared/upload/UploadProgressStep.tsx) | Real **`start-upload`** + progress; empty state routes back to file step (no second drop zone). |
| [`background-upload.service`](apps/web/src/services/background-upload.service.ts) | Legacy simulation class; **upload flow** uses API directly in `UploadProgressStep`. |
| [`FeedSection`](apps/web/src/components/shared/upload/FeedSection.tsx) | Static “No activity yet” — not minister sermon list. |

Modal open rule: `currentStep !== 'file'` ([`UploadSermon.tsx`](apps/web/src/app/upload/UploadSermon.tsx)). On close without complete: clears stored data and resets step — **no** `AbortController` for real upload ([04 – draft modal](specs/web/04%20-%20sermon-upload-draft.md#draft-modal)).

---

## 6. Empty state analysis (current vs spec)

| Surface | Current behavior | Spec expectation ([04](specs/web/04%20-%20sermon-upload-draft.md) / [05](specs/web/05%20-%20%20sermon-view-trash.md)) |
|---------|------------------|------------------------------------------------------------------|
| **Pre-file upload** | `FileUploadZone`: dashed panel, icon, copy, **Select file**. | UC-U1: valid file before API; OK as **modal** first step — acceptable pattern **if** hosted on View. |
| **First-time minister** | Many CTAs go to **`/upload-sermon`**, not **My Sermon (View)** empty state + modal ([UC-V1](specs/web/05%20-%20%20sermon-view-trash.md#uc-v1)). | Empty **library** on View + primary **Upload** opens **same** upload modal. |
| **Modal progress, no file** | `UploadProgressStep` duplicates drop zone. | Single source of truth for “no audio yet” ([draft audio display](specs/web/04%20-%20sermon-upload-draft.md#draft-audio-display)); avoid divergent empty UIs. |
| **Draft without audio** | List/draft flows partially elsewhere; upload context can load draft without file. | Explicit **empty** audio slot (no fake filename) — align copy and layout with Figma variants. |
| **Feed / activity** | Static placeholder. | Optional; if kept, wire to **real** activity or remove to match studio shell + Figma. |
| **Non-upload tab** | “Coming Soon”. | Placeholder only; not spec empty state. |

---

## 7. Error state analysis (current vs spec)

| Source | Current behavior | Spec / gap |
|--------|------------------|------------|
| **Invalid file (type/size)** | `validationError` in `FileUploadZone` / `UploadProgressStep`; destructive styling. | Matches [UC-U1 A1](specs/web/04%20-%20sermon-upload-draft.md#uc-u1). |
| **Upload failure / timeout** | `UploadTask` supports `error`, but service **only** simulates success path. | [UC-U1 A2](specs/web/04%20-%20sermon-upload-draft.md): toast + **retry** without re-selecting file if UX keeps selection. |
| **Processing pending** | Not modeled in UI. | [UC-U1 A3](specs/web/04%20-%20sermon-upload-draft.md): processing state; publish gating per API. |
| **Publish / draft API** | Toasts / some inline (`ReviewSubmit`, forms). | [UC-U2 A1](specs/web/04%20-%20sermon-upload-draft.md), [UC-U6 A2](specs/web/04%20-%20sermon-upload-draft.md): field mapping, stay on review. |
| **Session / 403** | Partially generic app behavior. | [UC-U6 A1](specs/web/04%20-%20sermon-upload-draft.md): redirect login. |
| **Close modal while uploading** | Resets step; clears local data; no abort of HTTP. | [04 – draft modal](specs/web/04%20-%20sermon-upload-draft.md#draft-modal): **AbortController** + server policy for partial drafts. |
| **Figma** | Multiple artboards imply **error** and **loading** variants exist visually. | Implement **error matrix** aligned with those variants once enumerated (section 1.4). |

---

## 8. Gap summary (Figma + 04/05 + code)

| Theme | Gap |
|--------|-----|
| **Shell** | Spec: modal **over** My Sermon (View) + minister URLs. Code: dedicated **`/upload-sermon`** page + modal for post-file steps + `FeedSection`. |
| **Routing** | Interim: `/upload` → `/upload-sermon` redirect and `UserDraft` fix landed; still align with future `/minister/:id/audio/...` ([05](specs/web/05%20-%20%20sermon-view-trash.md)). |
| **View vs Figma `10252`** | [`MySermons`](apps/web/src/app/dashboard/MySermons.tsx) may list from API but still lacks **Figma toolbar / grid / filter** parity vs **my sermons** section. |
| **Upload transport** | `start-upload` + abort/retry path in progress step; confirm all **Figma error states** in §2 Step 3 are covered. |
| **List coherence** | After publish/draft, invalidate list on **View** host ([UC-V1 integration](specs/web/05%20-%20%20sermon-view-trash.md#uc-v1)); today depends on where user lands. |
| **Duplicate empty** | Progress step no longer duplicates full drop zone; keep **single empty** rule when refactoring modal host ([04 — draft audio](specs/web/04%20-%20sermon-upload-draft.md#draft-audio-display)). |
| **Trash** | Spec: full page **Trash**; ensure studio nav matches when upload moves under minister shell (no scope creep into upload modal). |

---

## 9. Implementation phases (execute only after sign-off)

**Phase A — Inventory and contracts**

1. Figma **variant maps** for **`10252:35020`** and **`4364:6632`** (artboard id → screen → state); pull copy via Dev Mode or per-frame MCP scan.
2. ADR or spec appendix: **canonical URLs** (`/upload-sermon` interim vs `/minister/:id/audio/upload` target); `UserDraft` + `/upload` redirect aligned to **`/upload-sermon`** — extend ADR for minister-scoped routes.
3. API contract sheet: `start-upload`, draft save, publish, error payloads; partial draft when modal closed mid-upload ([04 – draft modal](specs/web/04%20-%20sermon-upload-draft.md#draft-modal)).

**Phase B — Architecture (04 + 05)**

1. Implement **My Sermon (View)** as parent shell per **`10252:35020`**; open upload **modal** from empty state and **Create sermon**; deep link opens View + `openModal`.
2. Keep **Trash** as full page under minister audio area ([05](specs/web/05%20-%20%20sermon-view-trash.md)); align sidebar entries with Figma **SIDE BAR** in both sections.

**Phase C — Empty and loading UX**

1. Single **no audio yet** pattern ([draft audio display](specs/web/04%20-%20sermon-upload-draft.md#draft-audio-display)); remove or align duplicate progress-step drop zone.
2. First-time empty **library** on list route per [UC-V1](specs/web/05%20-%20%20sermon-view-trash.md#uc-v1) and Figma **`10252`**; retire or repurpose static `FeedSection` unless product defines real activity feed.

**Phase D — Errors and upload lifecycle**

1. Replace simulation with real upload + progress events; implement **retry**, timeout, and processing states ([UC-U1 A2–A3](specs/web/04%20-%20sermon-upload-draft.md#uc-u1)).
2. **`AbortController`** (or equivalent) on modal dismiss; align with backend partial-draft rules.
3. Error matrix: invalid file (done), network, API validation, 401/403, processing gate before publish.

**Phase E — Data and QA**

1. Draft rows on list when server creates sermon before upload completes; resume in modal ([05 – UC-V1](specs/web/05%20-%20%20sermon-view-trash.md#uc-v1)).
2. Cache invalidation / refetch after publish and save-as-draft.
3. A11y: file input, progress, stepper keyboard path; tests: empty → invalid → success → API failure → retry → dismiss mid-upload.

---

## 10. Revision

- **2026-04-19:** Consolidated plan: Figma MCP structure for `4364:6632`, merged prior analyses, `/upload` routing finding, phases A–E.
- **2026-04-19 (later):** Added Figma [**my sermons** `10252-35020`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10252-35020&m=dev) alongside [**Upload from computer** `4364-6632`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4364-6632&m=dev); **§3** `apps/web` implementation map (layouts, components, files); gap row for View vs Figma `10252`; Phase A/B/C reference both nodes.
- **2026-04-19:** Added **§2 — Ten-step pixel-accuracy implementation ladder** mapping studio upload Figma nodes (Steps 1–7, 4a, 9–10, accessories) to `apps/web` files and spec anchors; renumbered following sections §3–§10.
