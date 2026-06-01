# Web: Sermon upload, draft, and publish (studio flow)

> **Canonical feature spec:** [feat-0006](./feature/feat-0006/PRODUCT.md) (PRODUCT) and [feat-0006 TECH](./feature/feat-0006/TECH.md) — studio routes `/studio/{studioCode}/sermons/…`, CRUD API map, minister + creator, first-time publish. This file keeps detailed **UC-U*** use cases.

This document specifies **upload**, **draft**, and **publish** flows that run as **modals** on top of **My Sermon (View)** in Troott Studio. The mental model is **YouTube Studio for audio**: one primary asset (the audio file), rich metadata, visibility, and a clear path from **draft** to **published**.

**Studio URLs and page vs modal** (Trash is a **full page**): [`05 -  sermon-view-trash.md` — Troott Studio routing](./05%20-%20%20sermon-view-trash.md#studio-routing).

**Companion:** My Sermon (View), Trash page, modals — [`05 -  sermon-view-trash.md`](./05%20-%20%20sermon-view-trash.md).

**Listener-facing share and deep links** (stable URLs, universal links, teaser API): [`../api/deep-links.md`](../api/deep-links.md).

**Use case framework** (actors, system, goals, preconditions, triggers, basic and alternate flows) follows [What is a use case? (Figma)](https://www.figma.com/resource-library/what-is-a-use-case/).

---

## Shared definitions

| Term                 | Meaning                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **System**           | Troott **Studio** (`studio.troott.com`) + APIs; upload/draft/publish UI is a **modal** over [My Sermon (View)](./05%20-%20%20sermon-view-trash.md#uc-v1).                                                                                                                                                                                                          |
| **Primary actor**    | Authenticated **minister** (or delegated **staff** where product allows).                                                                                                                                                                                                                                                                                          |
| **Sermon asset**     | The uploaded audio file plus derived fields (duration, size, processing state).                                                                                                                                                                                                                                                                                    |
| **Draft**            | Any sermon that is **not published** yet. This includes: (1) **in-progress upload** — user is in the upload flow (file selected and/or audio **currently uploading** to the server); (2) **upload complete, unpublished** — audio has finished uploading but the user has not clicked **Publish**. Drafts are not live for listeners per visibility/publish rules. |
| **Upload modal**     | Multi-step dialog for file → progress → details → settings → review. The user **may close it at any time**, including **while upload is still in progress** (see [Draft states and closing the modal](#draft-states-and-closing-the-modal)).                                                                                                                       |
| **Published**        | Sermon is live per visibility (public / unlisted / private) and appears on [My Sermon (View)](./05%20-%20%20sermon-view-trash.md#uc-v1) for that minister.                                                                                                                                                                                                         |
| **My Sermon (View)** | Full-page list under `/minister/:ministerId/audio` (see [routing](./05%20-%20%20sermon-view-trash.md#studio-routing)). After **publish** or **save as draft**, closing the **modal** must leave the new row visible on View (refetch / invalidate).                                                                                                                |

**Cross-links (this file to companion)**

| Topic                                | In companion spec                                                                                                                                                                |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| After **publish**, row on View       | [UC-V1](./05%20-%20%20sermon-view-trash.md#uc-v1)                                                                                                                                |
| **Update / resume** (modal)          | [UC-V2](./05%20-%20%20sermon-view-trash.md#uc-v2), [UC-V3](./05%20-%20%20sermon-view-trash.md#uc-v3)                                                                             |
| **Replace audio** after publish      | [UC-V4](./05%20-%20%20sermon-view-trash.md#uc-v4)                                                                                                                                |
| **Trash** (full **page**, not modal) | [UC-V6](./05%20-%20%20sermon-view-trash.md#uc-v6) from modal; [UC-V7](./05%20-%20%20sermon-view-trash.md#uc-v7), [UC-V8](./05%20-%20%20sermon-view-trash.md#uc-v8) on Trash page |
| Studio URL pattern                   | [Studio routing](./05%20-%20%20sermon-view-trash.md#studio-routing)                                                                                                              |

<a id="draft-modal"></a>

## Draft states and closing the modal

- **Draft** always means **not published**, covering both “still uploading” and “upload done, editing metadata / not published.”
- **Close while uploading:** When the user dismisses the upload modal during `start-upload`:
    - **Client:** Abort the in-flight request when the stack allows (e.g. `AbortController`); stop showing progress; reset or preserve local wizard state per product (e.g. clear `File` object, keep title draft in `localStorage` if you already do that).
    - **Server:** If the API has already created a sermon document mid-stream, define whether the row stays as **draft** (partial file / failed upload), is deleted, or is marked **failed** so **My Sermon (View)** can show a resumable or deletable row—this must match backend behavior.
- **Close after upload completes, before publish:** Same as today: optional **Save as draft** ([UC-U2](#uc-u2)); if the user only closes without saving, rely on persisted server draft + local draft rules already in the app.
- **My Sermon (View):** List shows a **draft** row once the backend has a sermon id tied to the minister and status is unpublished—even if the user closed the **upload modal** mid-upload and the server kept an incomplete draft (filter or badge for “incomplete” if needed).

<a id="draft-audio-display"></a>

### Draft audio in the UI (View list + modal)

- **No audio yet:** For a draft with **no** uploaded asset, the **audio / file** presentation is **empty** (placeholder text or blank slot—not a fake filename). Title/metadata may still show from local or saved form data.
- **After first successful upload:** As soon as `start-upload` completes (response includes `id`, `uploadRef` / `item.itemId`, and `item` subdoc), the **draft automatically shows the file** (name, and duration/size when available) on **My Sermon (View)** and inside the **modal**—no separate “attach file” confirmation step beyond the upload itself.
- **Subsequent uploads ([UC-U4](#uc-u4)):** Replacing audio updates the same draft row in place; the **new** file name (and metadata) appears **automatically** after the new upload succeeds, same as the first upload.

---

## UC-U1: Upload audio and complete studio steps

**Background**

| Field                | Description                                                                                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **System**           | **Upload modal** on Studio: file picker, upload progress, steps (progress, details, listener settings, review). Opened from **Upload** (empty first-time View) or **Create sermon** (returning user), or deep link e.g. `.../audio/upload`. |
| **Primary actor**    | Minister.                                                                                                                                                                                                                                   |
| **Secondary actors** | Storage/CDN pipeline, API (`start-upload`, optional cover upload, `publish` / metadata save).                                                                                                                                               |
| **Goals**            | Get a valid audio sermon uploaded and ready to publish or save as draft.                                                                                                                                                                    |
| **Stakeholders**     | Product, listeners (downstream consumption on other surfaces) which is the mobile app.                                                                                                                                                      |
| **Preconditions**    | User is logged in with role allowing `sermon:create`; network available; file within allowed formats/size.                                                                                                                                  |
| **Triggers**         | User opened upload **modal** from [My Sermon (View)](./05%20-%20%20sermon-view-trash.md#uc-v1) or landed on `/audio/upload`; then selects or drops an audio file.                                                                           |

**Basic flow**

1. User is on **My Sermon (View)** and opens the upload **modal** via **Upload** (first-time empty UI) or **Create sermon** (returning user), or opens View via deep link [`.../audio/upload`](./05%20-%20%20sermon-view-trash.md#studio-routing) with modal auto-open.
2. User provides a valid audio file; client validates type/size.
3. Client starts **start-upload** (or equivalent); UI shows real upload progress.
4. On success, system returns sermon **id** (and upload references); UI marks upload step complete. Any **draft** row for that sermon **immediately reflects the audio file** on **View** behind the modal and inside the **modal** ([Draft audio in the UI](#draft-audio-display)).
5. User completes **details** (title, description, category/topic, tags, optional thumbnail).
6. User completes **listener settings** (visibility: public / unlisted / private; optional schedule).
7. User reviews on **review** step; user chooses **Publish** or **Save as draft** (see [UC-U2](#uc-u2), [UC-U6](#uc-u6)).
8. System persists state; **modal** closes; user remains on **My Sermon (View)** with list refreshed ([UC-V1](./05%20-%20%20sermon-view-trash.md#uc-v1)) unless product uses a hard redirect (still same View route).

**Alternate flows**

- **A1 Invalid file:** User selects non-audio or oversized file; inline error; no API upload started.
- **A2 Upload failure / timeout:** Error toast; user can **retry** without re-selecting file if UX retains selection.
- **A3 Processing delay:** Audio accepted but waveform/transcode pending; UI shows processing state; publishing rules defined by API (block publish until ready, or allow with badge).
- **A4 User closes modal mid-flow (upload finished or not):** See [Draft states and closing the modal](#draft-states-and-closing-the-modal). Local form data may persist; server row policy if a sermon id already exists.
- **A5 User closes modal while upload is in progress:** Abort client upload when possible; do not assume a complete audio asset. Server may still create or update a partial draft—align with API.
- **A6 Missing required metadata on publish:** Block publish; focus first invalid field.

**Postconditions**

- Sermon record exists with uploaded audio reference.
- Either **draft** or **published** per user action.

---

## UC-U2: Save sermon as draft (without publishing)

**Background**

| Field             | Description                                                                                                                                                                                                                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **System**        | Same as UC-U1.                                                                                                                                                                                                                                                                                                               |
| **Primary actor** | Minister.                                                                                                                                                                                                                                                                                                                    |
| **Goals**         | Persist work without making the sermon live.                                                                                                                                                                                                                                                                                 |
| **Preconditions** | A sermon record exists on the server with **upload complete** (or product allows saving metadata-only drafts—if not, require finished `start-upload`). “Draft” in the product sense can still include in-progress upload before this API call—see [Draft states and closing the modal](#draft-states-and-closing-the-modal). |
| **Triggers**      | User clicks **Save as draft** on the review step (explicit save). Closing the modal without publish does **not** have to hit this endpoint unless product chooses auto-save-on-close after upload completes.                                                                                                                 |

**Basic flow**

1. User reaches review step with valid uploaded audio (and any required fields per API).
2. User clicks **Save as draft**.
3. API sets sermon `status`/state to **draft** (or equivalent); metadata saved.
4. Confirmation toast; close **modal**; **My Sermon (View)** refreshes so the new **draft** row is visible immediately ([UC-V1](./05%20-%20%20sermon-view-trash.md#uc-v1)).

**Alternate flows**

- **A1 API rejects draft:** Show error; retain form state.
- **A2 No sermon id yet:** Client must not call draft save until upload created a record (define ordering).

**Links to companion**

- Resume: [UC-V2](./05%20-%20%20sermon-view-trash.md#uc-v2), [UC-V3](./05%20-%20%20sermon-view-trash.md#uc-v3).

---

## UC-U3: Resume or continue a draft

**Background**

| Field             | Description                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Primary actor** | Minister.                                                                                                                          |
| **Goals**         | Continue editing metadata or replace audio for an existing draft.                                                                  |
| **Preconditions** | Draft sermon exists and user has permission.                                                                                       |
| **Triggers**      | User opens a draft row on **My Sermon (View)**; **update/resume modal** opens ([UC-V2](./05%20-%20%20sermon-view-trash.md#uc-v2)). |

**Basic flow**

1. **Modal** opens with draft id; UI loads current metadata and upload state. Audio area **empty** if no file on record; otherwise shows current file **automatically** ([Draft audio in the UI](#draft-audio-display)).
2. User edits fields or re-opens upload step to replace audio per product rules ([UC-U4](#uc-u4)).
3. User saves changes or publishes (hand off to [UC-U6](#uc-u6)).

**Alternate flows**

- **A1 Draft expired or invalidated by backend:** Show message; offer new upload ([UC-U1](#uc-u1)).

---

## UC-U4: Replace or remove audio before publish

**Background**

| Field        | Description                                                                 |
| ------------ | --------------------------------------------------------------------------- |
| **Goals**    | Fix wrong file before going live.                                           |
| **Triggers** | User chooses **Change file** / **Remove audio** on progress or review step. |

**Basic flow**

1. User removes or replaces file; client clears prior upload association per API contract. If audio is removed and not yet re-uploaded, draft **audio area shows empty** again ([Draft audio in the UI](#draft-audio-display)).
2. New upload uses **start-upload** again; new sermon id or same id per backend design (must be specified in API doc). On success, **file displays automatically** in the draft as for the first upload.

**Alternate flows**

- **A1 Published sermon replace:** [UC-V4](./05%20-%20%20sermon-view-trash.md#uc-v4) in companion spec.

---

## UC-U5: Set metadata and visibility (pre-publish)

**Background**

| Field        | Description                                                                             |
| ------------ | --------------------------------------------------------------------------------------- |
| **Goals**    | Match YouTube-like controls: title, description, tags, thumbnail, visibility, schedule. |
| **Triggers** | User completes details and listener settings steps.                                     |

**Basic flow**

1. User enters title (min length rules), description, category/topic, tags.
2. User sets visibility (public / unlisted / private) explicitly (no implicit default without user confirmation if product requires).
3. Optional: scheduled publish datetime; optional thumbnail upload.

**Alternate flows**

- **A1 Scheduled date in past:** Validation error.
- **A2 Thumbnail optional:** Allow publish without image; show placeholder on **View** and in consumer surfaces.

**Links to companion**

- Post-publish edits: [UC-V3](./05%20-%20%20sermon-view-trash.md#uc-v3), [UC-V5](./05%20-%20%20sermon-view-trash.md#uc-v5).

---

## UC-U6: Publish sermon

**Background**

| Field             | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| **Goals**         | Make sermon live per visibility rules.                                      |
| **Preconditions** | Upload complete; required metadata valid; API allows publish for sermon id. |
| **Triggers**      | User clicks **Publish** (modal footer or review primary action).            |

**Basic flow**

1. Client calls **publish** (or equivalent) with sermon id and payload (title, description, tags, topic, visibility, schedule, minister/publisher ids per API).
2. Success: toast; close **modal**; **My Sermon (View)** list refreshes ([UC-V1](./05%20-%20%20sermon-view-trash.md#uc-v1)).
3. Invalidate sermon list queries (or refetch) so the **newly published sermon appears in the list for that user** without a manual refresh.
4. **Postcondition:** The sermon row is visible on **My Sermon (View)** for that minister under the correct status (published / processing if async) and default sort (e.g. most recent first).

**Alternate flows**

- **A1 403/401:** Session expired; redirect login.
- **A2 Validation error from API:** Map to fields; stay on review.
- **A3 Idempotency:** Double-submit handled client-side (disable button) and/or server idempotency key.

---

## Non-functional notes

- **Performance:** Large file uploads should show progress; support background tab behavior as browser allows.
- **Accessibility:** File input, progress, and step navigation keyboard operable.
- **Observability:** Client logs upload failure reasons; server returns actionable messages for toasts.

---

## Document map

| ID    | Anchor                 | Name                                       |
| ----- | ---------------------- | ------------------------------------------ |
| UC-U1 | `#uc-u1`               | Upload audio and complete studio steps     |
| UC-U2 | `#uc-u2`               | Save as draft                              |
| UC-U3 | `#uc-u3`               | Resume draft                               |
| UC-U4 | `#uc-u4`               | Replace/remove audio pre-publish           |
| UC-U5 | `#uc-u5`               | Metadata and visibility                    |
| UC-U6 | `#uc-u6`               | Publish                                    |
| —     | `#draft-modal`         | Draft states and closing the modal         |
| —     | `#draft-audio-display` | Draft audio in the UI (empty vs auto file) |
