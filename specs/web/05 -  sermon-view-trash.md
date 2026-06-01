# Web: Sermon library, view, update, and trash (studio library)

> **Canonical feature spec:** [feat-0006](./feature/feat-0006/PRODUCT.md) (PRODUCT) and [feat-0006 TECH](./feature/feat-0006/TECH.md) — library read, bin delete lifecycle, `/studio/{studioCode}/bin`. This file keeps detailed **UC-V*** use cases.

This document specifies **My Sermon (View)**—the minister’s audio sermon hub—plus **update** flows and the **Trash** experience. The mental model is **YouTube Studio for audio**: a primary **full-page** list, with **modals** for upload/draft/update, and a **separate full page** for Trash.

**Companion:** upload, draft, publish (modal flows) — [`04 - sermon-upload-draft.md`](./04%20-%20sermon-upload-draft.md).

**Use case framework** (actors, system, goals, preconditions, triggers, basic and alternate flows) follows [What is a use case? (Figma)](https://www.figma.com/resource-library/what-is-a-use-case/).

---

<a id="studio-routing"></a>

## Troott Studio: host, URLs, and layout

- **Host (production target):** `studio.troott.com` (minister studio; distinct from marketing or listener apps if applicable).
- **Path prefix:** `/minister/:ministerId/...` where `:ministerId` is the minister’s stable id (example: `UC36spwD-ihSlxf8j1vHeEDw`).
- **Audio sermons area:** `/minister/:ministerId/audio/...`

**Example**

`https://studio.troott.com/minister/UC36spwD-ihSlxf8j1vHeEDw/audio/upload`

### Page vs modal

| Surface                     | What it is                                                                                                  | Typical route (under `/minister/:id/audio`)                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **My Sermon (View)**        | Full page: grid/list of sermons, filters, primary actions                                                   | e.g. `/` or `/view` (product picks one canonical list URL)                        |
| **Upload**                  | **Modal** over View (first-time **empty** chrome vs returning user **Create sermon**)                       | Deep link e.g. `/upload` **opens the same View shell** with upload **modal** open |
| **Draft / Update (resume)** | **Modal** — pick up a draft where the user left off; edit unpublished or published metadata/audio per rules | Opened from View row actions or deep link; remains **modal**, not a separate page |
| **Trash**                   | **Own full page** — browse trashed sermons, restore, delete forever                                         | e.g. `/trash` — **not** a modal                                                   |

**Actions on My Sermon (View)**

- **Upload** — First-time minister: prominent entry, **empty state** until first sermon exists; launches upload **modal** ([companion UC-U1](./04%20-%20sermon-upload-draft.md#uc-u1)).
- **Create sermon** — Returning user: primary CTA to add another sermon; same upload **modal** as Upload (new draft / new `start-upload` path).
- **Draft** — Surface drafts in the list and/or a **Drafts** control; opening a draft uses the **update/resume modal** ([UC-V2](#uc-v2), companion [UC-U3](./04%20-%20sermon-upload-draft.md#uc-u3)).
- **Update** — Edit published or draft sermon: **modal** (metadata, replace audio, visibility) where product uses modal parity with companion flows.
- **Delete (lifecycle)** — **Move to trash** may be triggered from View (confirm), but **managing** trashed items (list, restore, permanent delete) happens on the **Trash page** ([UC-V7](#uc-v7), [UC-V8](#uc-v8)).

Legacy app routes (e.g. `/get-sermons`) should **redirect or alias** to the Studio View URL when the studio shell ships.

---

## Shared definitions

| Term                 | Meaning                                                                                                                                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **System**           | Troott **Studio** web app + APIs for sermon lifecycle under `/minister/:ministerId/audio`.                                                                                                                                    |
| **Primary actor**    | Authenticated **minister** (and **staff** if permitted).                                                                                                                                                                      |
| **My Sermon (View)** | The **full-page** sermon library: grid/list, filters, empty vs populated states, toolbar actions above. Same as former “library” concept; see [UC-V1](#uc-v1).                                                                |
| **Draft**            | **Unpublished** sermon: includes **upload in progress** and **upload done but not published**. Modal may close mid-upload; see companion [Draft states and closing the modal](./04%20-%20sermon-upload-draft.md#draft-modal). |
| **Trash (page)**     | **Full-page** destination for soft-deleted sermons—not a modal. Restore and permanent delete occur here.                                                                                                                      |

**Cross-links (this file to companion)**

| Topic                                         | In upload spec                                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **New** sermon (upload flow)                  | [UC-U1](./04%20-%20sermon-upload-draft.md#uc-u1)                                                   |
| **Draft** save / resume                       | [UC-U2](./04%20-%20sermon-upload-draft.md#uc-u2), [UC-U3](./04%20-%20sermon-upload-draft.md#uc-u3) |
| **Publish** first time                        | [UC-U6](./04%20-%20sermon-upload-draft.md#uc-u6)                                                   |
| Metadata / visibility rules                   | [UC-U5](./04%20-%20sermon-upload-draft.md#uc-u5)                                                   |
| Replace audio **before** publish              | [UC-U4](./04%20-%20sermon-upload-draft.md#uc-u4)                                                   |
| Draft definition, close modal while uploading | [Draft states and closing the modal](./04%20-%20sermon-upload-draft.md#draft-modal)                |
| Empty draft vs auto-shown audio file          | [Draft audio in the UI](./04%20-%20sermon-upload-draft.md#draft-audio-display)                     |
| Studio URL pattern                            | [Troott Studio: host, URLs, and layout](#studio-routing)                                           |

---

<a id="uc-v1"></a>

## UC-V1: My Sermon (View) — library grid / list

**Background**

| Field             | Description                                                                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **System**        | **Full-page** Studio route under [`/minister/:ministerId/audio`](#studio-routing): table/grid, filters, sort, search, toolbar (**Upload**, **Create sermon**, draft filters, link to **Trash** page). |
| **Primary actor** | Minister.                                                                                                                                                                                             |
| **Goals**         | Find sermons quickly; see status (draft / published / processing); start upload/create or resume draft via **modals**.                                                                                |
| **Stakeholders**  | Ministers, moderators.                                                                                                                                                                                |
| **Preconditions** | Authenticated; URL `ministerId` matches session (or user can access that minister scope).                                                                                                             |
| **Triggers**      | User opens **My Sermon (View)** (canonical list URL) or lands on `/audio/upload` (opens View + upload **modal**).                                                                                     |

**Integration note**

- Completing [UC-U6 Publish](./04%20-%20sermon-upload-draft.md#uc-u6) or [UC-U2 Draft](./04%20-%20sermon-upload-draft.md#uc-u2) must result in that sermon **showing on My Sermon (View)** for the same minister: list scoped to that `ministerId` / owner, refetched or cache-invalidated so the new row appears when the **modal** closes or after redirect back to View.
- If the backend creates a sermon row before upload finishes and the user [closes the modal while uploading](./04%20-%20sermon-upload-draft.md#draft-modal), the View may show an incomplete draft row—use status/badge/filter so ministers can resume in **modal** or discard.

**Basic flow**

1. Client loads first page of sermons for `:ministerId` with default sort (e.g. recently updated).
2. **First-time / empty library:** Show **empty UI** (illustration, short copy, single primary **Upload**). **Returning user:** Show populated grid/list plus **Create sermon** (and optional **Drafts** filter).
3. User switches **list** vs **grid**; preference persisted locally or in profile.
4. User applies filters (status: draft / published, date range, search query).
5. Rows/cards show: title, duration, status badge, visibility icon, last updated, optional play count. For **drafts without audio**, the file/audio column is **empty**; after upload, filename appears automatically—companion [Draft audio in the UI](./04%20-%20sermon-upload-draft.md#draft-audio-display).
6. **Upload** or **Create sermon:** opens upload **modal** ([UC-U1](./04%20-%20sermon-upload-draft.md#uc-u1)); user stays on View underneath.
7. User clicks a row (draft or published) to **update / resume** → opens **modal** ([UC-V2](#uc-v2)) to pick up where they left off or edit details.
8. User uses **Trash** nav control → navigates to **Trash page** ([UC-V7](#uc-v7)), not a modal.

**Alternate flows**

- **A1 Deep link `/audio/upload`:** Load View shell; auto-open upload **modal** (same as step 6).
- **A2 API error:** Retry; offline message if network failure.
- **A3 Permission denied:** 403 UI; `ministerId` mismatch redirects to own studio home.

---

<a id="uc-v2"></a>

## UC-V2: Open sermon — update / resume (modal)

**Background**

| Field        | Description                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **System**   | **Modal** over My Sermon (View)—not a separate detail page (unless product later adds optional full-page detail).        |
| **Goals**    | Inspect one sermon; **resume draft** or **update** published sermon; **move to trash** (then user may go to Trash page). |
| **Triggers** | User selects a row on [UC-V1](#uc-v1).                                                                                   |

**Basic flow**

1. Client fetches sermon by id; opens **modal** with steps or tabs aligned to companion upload/detail (metadata, audio, visibility, review).
2. UI shows metadata summary, audio status, visibility, publish date, share URL (if applicable). **Draft, no audio:** audio section **empty**. **With audio:** file name and duration from server; updates **automatically** after upload/replace—companion [Draft audio in the UI](./04%20-%20sermon-upload-draft.md#draft-audio-display).
3. Primary actions: **Save** / **Publish** (draft), **Save** (published metadata), **Replace audio** ([UC-V4](#uc-v4)), **Move to trash** ([UC-V6](#uc-v6)), **Copy link** (if allowed).

**Alternate flows**

- **A1 Draft resume:** Same modal hosts companion [UC-U3](./04%20-%20sermon-upload-draft.md#uc-u3) (pick up where they left off).
- **A2 Processing:** Read-only banner until processing completes.

---

<a id="uc-v3"></a>

## UC-V3: Update sermon metadata

**Background**

| Field             | Description                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------ |
| **Goals**         | Change title, description, tags, topic/category, thumbnail without replacing audio.        |
| **Preconditions** | Sermon not in **trash** (default); or product allows edits while trashed—state explicitly. |
| **Triggers**      | User edits inside [UC-V2](#uc-v2) **modal** or inline edit on View (if offered).           |

**Basic flow**

1. User edits fields; client validates (same rules as [UC-U5](./04%20-%20sermon-upload-draft.md#uc-u5)).
2. User saves; PATCH/update API.
3. Success toast; list row updates; cache invalidated.

**Alternate flows**

- **A1 Conflict (concurrent edit):** Server version wins or merge UI—define policy.
- **A2 Published + sensitive change:** Optional re-review workflow (future).

---

<a id="uc-v4"></a>

## UC-V4: Replace audio on existing sermon

**Background**

| Field             | Description                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| **Goals**         | Swap audio file for a correction or remaster; keep same sermon id if product allows.                |
| **Preconditions** | User has `sermon:update`; sermon state allows replace (not mid-processing—or define behavior).      |
| **Triggers**      | User chooses **Replace audio** inside [UC-V2](#uc-v2) **modal** (or published-sermon edit surface). |

**Basic flow**

1. User selects new file; **start-upload** or sermon-scoped replace endpoint per API.
2. Progress UI; on completion, sermon points to new asset; duration/size refreshed.
3. Optional: re-processing state for listeners (mobile cache invalidation out of scope here).

**Alternate flows**

- **A1 Replace while published:** Temporary “updating” state or keep old asset until swap completes—define with backend.
- **A2 Failure:** Roll back to previous asset reference if transaction supported.

**Links to companion**

- Pre-publish replace: [UC-U4](./04%20-%20sermon-upload-draft.md#uc-u4).

---

<a id="uc-v5"></a>

## UC-V5: Change visibility or schedule (published sermon)

**Background**

| Field        | Description                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------- |
| **Goals**    | Toggle public / unlisted / private; change scheduled publish time if supported post-publish. |
| **Triggers** | User edits from [UC-V2](#uc-v2) **modal** or bulk action ([UC-V9](#uc-v9)) on View.          |

**Basic flow**

1. User sets visibility; confirm if downgrading from public (warning about existing links).
2. API updates; document share link behavior (unlisted: link works; private: owner-only).

**Alternate flows**

- **A1 Revoke public:** Confirm modal; note SEO/share cache eventual consistency.

**Links to companion**

- First-time visibility: [UC-U5](./04%20-%20sermon-upload-draft.md#uc-u5).

---

<a id="uc-v6"></a>

## UC-V6: Move sermon to trash

**Background**

| Field        | Description                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| **Goals**    | Soft-delete; remove from default View list.                                                          |
| **Triggers** | User clicks **Move to trash** in [UC-V2](#uc-v2) **modal** or bulk action on View ([UC-V9](#uc-v9)). |

**Basic flow**

1. Confirm dialog (bulk: single confirm with count).
2. API sets state to trashed; sermon disappears from [UC-V1](#uc-v1) default view.
3. Toast with **Undo** (if API supports) or **View link to Trash page** ([UC-V7](#uc-v7)) so users know where items went.

**Alternate flows**

- **A1 Cannot trash (locked):** Error message.

---

<a id="uc-v7"></a>

## UC-V7: Trash page — view and restore

**Background**

| Field        | Description                                                                        |
| ------------ | ---------------------------------------------------------------------------------- |
| **System**   | **Full page** at e.g. `/minister/:ministerId/audio/trash` — not a modal.           |
| **Goals**    | List trashed sermons; restore to previous status (draft vs published per backend). |
| **Triggers** | User clicks **Trash** in Studio nav from My Sermon (View) or bookmarks Trash URL.  |

**Basic flow**

1. Client loads trashed items (paginated) for `:ministerId`.
2. User selects **Restore**; API clears trash flag.
3. Item reappears on **My Sermon (View)** ([UC-V1](#uc-v1)) with correct status.

**Alternate flows**

- **A1 Restore blocked by policy:** Explain limitation.

---

<a id="uc-v8"></a>

## UC-V8: Permanently delete from Trash page

**Background**

| Field             | Description                                                          |
| ----------------- | -------------------------------------------------------------------- |
| **System**        | Same **Trash page** as [UC-V7](#uc-v7) (full page).                  |
| **Goals**         | Irreversible removal of asset and metadata (retention / GDPR aware). |
| **Preconditions** | Item is in trash; user has `sermon:destroy` or equivalent.           |
| **Triggers**      | User clicks **Delete forever** on Trash page.                        |

**Basic flow**

1. Strong confirmation (type title or checkbox).
2. API deletes storage objects and document.
3. Remove from trash list; audit log if product supports it.

**Alternate flows**

- **A1 Partial delete failure:** Show retry; support path.

---

<a id="uc-v9"></a>

## UC-V9: Bulk selection (optional phase)

**Background**

| Field        | Description                                             |
| ------------ | ------------------------------------------------------- |
| **Goals**    | Multi-select for trash, visibility, or export (future). |
| **Triggers** | User enables selection mode in [UC-V1](#uc-v1).         |

**Basic flow**

1. User selects multiple rows; chooses bulk action.
2. API batch endpoint or sequential calls with progress.

**Alternate flows**

- **A1 Partial failure:** Report which ids failed.

---

## Non-functional notes

- **List performance:** Virtualize long grids; server-side sort/filter.
- **Cache:** After mutations, invalidate lists consistently with publish flow ([UC-U6](./04%20-%20sermon-upload-draft.md#uc-u6)).
- **Permissions:** Map roles (minister / staff / admin) to each UC.

---

## Document map

| ID    | Anchor            | Name                                  |
| ----- | ----------------- | ------------------------------------- |
| UC-V1 | `#uc-v1`          | My Sermon (View) — grid / list        |
| UC-V2 | `#uc-v2`          | Open sermon — update / resume (modal) |
| —     | `#studio-routing` | Troott Studio host and URL pattern    |
| UC-V3 | `#uc-v3`          | Update metadata                       |
| UC-V4 | `#uc-v4`          | Replace audio                         |
| UC-V5 | `#uc-v5`          | Change visibility / schedule          |
| UC-V6 | `#uc-v6`          | Move to trash                         |
| UC-V7 | `#uc-v7`          | Trash page — view and restore         |
| UC-V8 | `#uc-v8`          | Permanent delete on Trash page        |
| UC-V9 | `#uc-v9`          | Bulk selection (optional)             |
