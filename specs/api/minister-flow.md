# Minister (creator) web interaction flow

This document describes **every user-visible interaction** for ministers using the **web** creator experience to upload, edit, review, publish, and manage sermons. It reads like a product / UX spec (similar depth to YouTube Studio–style flows). **No APIs, servers, or technical implementation details.**

---

## 0. Creator states (critical)

All flows below assume the UI adapts to one or more of these **states**:

| State | Meaning for the UI |
|--------|----------------------|
| **First-time creator** | No sermons yet; strong empty states; “Upload your first sermon” is primary; no drafts or published rows. |
| **Creator with drafts** | At least one draft exists; drafts tab has rows; resume and delete paths are common. |
| **Creator with published sermons** | At least one published sermon; published tab populated; edit / unpublish / share available. |
| **Creator with scheduled sermons** | At least one sermon scheduled for a future go-live time; scheduled tab populated; edit schedule and cancel schedule interactions apply. |
| **Upload in progress** | A file is actively uploading; progress visible; cancel / replace rules apply; other actions may be limited. |
| **Upload failed** | Last upload attempt failed; retry and replace are prominent; draft may exist without playable audio until fixed. |
| **Draft incomplete (dirty)** | User changed something not yet persisted, or required fields missing; save / leave flows show warnings. |
| **Published but editable** | Sermon is live; user can open editor; changes may require review / republish rules per product (see cross-flow). |

Copy, empty states, disabled buttons, and warnings **must** change based on these states.

---

## 1. Overview

### 1.1 What this flow covers

- Entering **creator mode** on the web app as a **minister**.
- Starting an **upload** (file or record), watching **progress**, recovering from **failure** or **interruption**.
- Filling and editing **sermon metadata** (title, description, speaker, tags, category, thumbnail).
- **Auto-save**, **manual save**, **dirty state**, and **leave** confirmations.
- **Saving as draft**, **reviewing**, **publishing**, and **post-publish** feedback.
- **Managing** sermons: lists, tabs, sort, filter, single actions, **multi-select**, **bulk** actions, and **cross-flow** edits (e.g. edit after publish).

### 1.2 What “successful publish” means (user perspective)

- The minister confirms publish on the final step.
- The app shows **clear success** (message and/or full-page success).
- The sermon appears under **Published** (or correct tab) with correct title and status.
- The minister can **open**, **share**, or **edit** that sermon from the dashboard according to product rules.

Until that success moment, the sermon is **not** treated as fully live for audience-facing lists (unless product defines “scheduled” as visible early—clarify in UI only, not here as tech).

---

## 2. Entry points (multi-entry)

### 2.0 Access creator mode

- **Sees:** After signing in as a minister account, primary app nav includes **Creator**, **Studio**, or profile switcher “Minister / Creator mode.”
- **Clicks:** That entry.
- **Sees next:** Creator dashboard (sermon list + upload CTA). If user lacks permission, show friendly “You don’t have access” with support link (no technical detail).
- **Starts in:** Whichever creator state matches their library (section 0)—often **first-time** or **with drafts**.

Each path below: **what the user sees** and **what state the flow starts in**.

### 2.1 Upload from dashboard CTA

- **Sees:** Main creator dashboard with primary button, e.g. “Upload sermon” (or “New sermon”).
- **Clicks:** That button.
- **Starts in:** New upload flow—empty metadata, no file yet (or file picker opens immediately per product).
- **Typical prior state:** Any creator state; first-time sees CTA alongside empty state.

### 2.2 Upload from empty state (“Upload your first sermon”)

- **Sees:** Empty dashboard illustration + headline + supporting text + same or secondary CTA.
- **Clicks:** “Upload your first sermon” (or equivalent).
- **Starts in:** Same as 2.1 but emotionally **first-time creator**; optional light dismissible tip (tooltips) if product includes it.

### 2.3 Upload after recording audio

- **Sees:** Either in-browser recorder UI or “Record” tab inside upload wizard.
- **First time only:** Browser asks **microphone permission** → user **Allow** or **Block**.
  - **Block:** inline error “Microphone access needed to record” + **Try again** (re-triggers permission) or “Upload file instead.”
- **During record:** **Record** button toggles to **Pause** / **Stop** per product; elapsed timer visible; optional **Discard** (confirm).
- **Muted system mic:** optional warning icon “No input detected” with link to OS settings.
- **Completes:** Stop recording → optional **Play preview** / **Re-record** / **Use this recording** → “Continue.”
- **Starts in:** Metadata step may already show duration; file is bound as **in progress** or **ready** depending on whether upload of blob to storage is separate from “attach to draft.”
- **Note:** If recording is discarded, user returns to **choose source** with no new draft unless auto-draft was created—in that case show draft in list with “incomplete” badge.

### 2.4 Resume draft

- **Sees:** Dashboard → **Drafts** tab → row for draft (title or “Untitled sermon”).
- **Clicks:** Row or explicit “Continue” / “Edit.”
- **Starts in:** **Creator with drafts**; editor opens with last saved fields; if audio was attached, player shows it; if upload failed, show **upload failed** strip at top.

### 2.5 Retry failed upload

- **Sees:** Draft row or editor banner: “Upload failed” + “Retry” (and optionally “Replace file”).
- **Clicks:** “Retry.”
- **Starts in:** **Upload failed**; progress UI resets; same file retries or picker reopens per product.
- **Clicks:** “Replace file” → returns to file selection with previous file disassociated after confirm if needed.

### 2.6 Duplicate sermon (entry from manage)

- **Sees:** Row menu “Duplicate” (if product offers).
- **Clicks:** Duplicate.
- **Starts in:** New draft prefilled from source (metadata copy); audio policy: duplicate media vs require new upload—user sees either copied playable audio or “Add audio” required.

### 2.7 Edit published sermon (entry)

- **Sees:** Published tab → row menu “Edit” or row click opens read-only detail → “Edit.”
- **Starts in:** **Published but editable**; editor loads with live data; dirty state false until first change.

---

## 3. Navigation model (web-specific)

### 3.1 Page-based navigation

- **Dashboard** (list + CTAs) → **Upload / new sermon** (wizard or dedicated page) → **Editor** (metadata + media) → **Review** → **Publish success** (or return to dashboard).
- Breadcrumb or step indicator (“Upload → Details → Review”) if multi-step.

### 3.2 Modal vs full-page

- **Full-page:** Main wizard steps, review screen, success screen.
- **Modal:** Delete confirm, bulk confirm, discard changes, optional “Quick edit title” if product defines it.
- **Drawer (optional):** Row actions on tablet/desktop without leaving list.

### 3.3 Browser Back button

- From **review** → Back goes to **editor** (last sub-step), preserving scroll if possible.
- From **editor** with **dirty** → Back triggers same **unsaved changes** prompt as internal navigation (see 3.5).
- During **upload in progress** → Back: either blocked with tooltip “Upload in progress” or prompts “Cancel upload and leave?” per product.

### 3.4 Refresh behavior (F5 / reload)

- **No dirty, saved draft:** Reload restores last saved server state.
- **Dirty unsaved:** Browser `beforeunload` warning (if product uses native) + in-app banner where applicable.
- **Mid-upload:** Reload may lose in-progress bytes; on return show **upload failed** or “Interrupted—retry” on draft.

### 3.5 Leaving page with unsaved changes

- Triggers: internal nav link, logo home, close tab, refresh, back.
- **User sees:** Modal: “You have unsaved changes” with **Stay**, **Leave without saving**, **Save draft** (if allowed from modal).
- **If user chooses Save draft:** Save runs; on success then navigate or close.

---

## 4. Step-by-step creator flows

### A. Start upload

1. User arrives at upload entry (any from section 2).
2. **Choice screen** (if product uses it):
   - **Record audio** → click opens recorder (permission prompt first time).
   - **Upload from device** → click opens OS file picker.
3. **Drag and drop** (web): user drags file onto drop zone.
   - **Hover:** Drop zone highlights (“Drop to upload”).
   - **Drop valid file:** Picker equivalent—file attaches, validation runs.
   - **Drop invalid:** Inline message on drop zone: invalid type; file not attached.
4. **File picker:** user selects one or more files (if multi-file supported).
5. **Cancel selection:** user closes picker without file → remain on choice screen; no partial file.
6. **Invalid file type:** message under control or toast: allowed types listed; “Choose another file.”
7. **File too large:** same pattern with max size shown; no upload start until resolved or user picks another file.
8. **Cancel from upload step:** “Cancel” returns to dashboard or previous step with confirm if a partial draft was already created.

### B. Upload progress

1. **Upload starts:** progress bar (percent or indeterminate for unknown size), filename, optional size uploaded / total.
2. **Multiple files:** each row has its own bar and cancel; “Overall” progress optional.
3. **Cancel upload:** click Cancel → confirm “Stop upload?” → on confirm, abort; draft may remain without audio or with “no audio” state.
4. **Retry upload:** visible on failure; click retries same file without re-picking if product keeps file reference.
5. **Replace file:** user picks new file; if current upload active, confirm cancel current first.
6. **Upload fails:** persistent banner + icon; message plain language; **Retry** + **Help** (link to support) optional.
7. **Slow upload:** secondary text “Still uploading… large files take longer” after threshold time.
8. **Navigate away during upload:** if allowed, tab continues in background with favicon/title indicator; if user closes tab, on return see **interruption** state (section 7). If not allowed, block with modal.

### C. Sermon details (metadata form)

**Fields (every interaction):**

| Field | User actions |
|--------|----------------|
| **Title** | Click field, type, cut/copy/paste, clear with keyboard; optional character count. |
| **Description** | Multiline; resize handle if applicable; same typing actions. |
| **Speaker** | Free text or picker: open list, search, select, clear selection. |
| **Tags / topics** | Add chip: type comma or Enter; remove chip X click; suggestion dropdown on focus if product has it. |
| **Category** | Single-select dropdown or card grid; open, hover option, click to select; change selection updates value. |
| **Thumbnail** | Click upload area → image picker; drag-drop image; **Remove image** resets to placeholder; optional crop modal. |

**Thumbnail crop modal (if product includes):**

1. User selects image → preview appears → clicks **Adjust** or crop opens automatically.
2. **Drag** corners/edges to crop box; **move** box; optional **zoom** slider; **Rotate** 90° buttons.
3. **Reset** restores original framing.
4. **Cancel** closes modal without applying (previous thumbnail unchanged).
5. **Apply** commits crop; thumbnail updates in form; field becomes **dirty**.

**Validation (user-visible only):**

- **Inline on blur** (per field): e.g. title empty → red border + message under field.
- **On submit / review:** scroll to first error; summary banner “Fix 3 issues before continuing.”
- **Required vs optional:** asterisk or “Required” label on mandatory fields; optional fields labeled “Optional.”
- **Errors tied to fields:** message directly under field; icon in field.

**Save button:**

- **Disabled** when no changes from last save and no new required data to satisfy (product rule); OR enabled always but click shows “Nothing to save.”
- **Enabled** when dirty or required fields newly satisfied.

**Dirty state:**

- Any change to text, tags, category, thumbnail, or replacement audio marks dirty.
- Visual: dot on tab, “Unsaved changes” text, or border on save area.

### D. Auto-save + dirty state (critical)

1. **Auto-save triggers:** after pause in typing (debounce), on field blur, on step change, on thumbnail upload complete—per product schedule.
2. **Manual save:** “Save draft” always available when dirty (unless blocked by upload state).
3. **Indicators:** “Saving…” spinner → “Saved” with timestamp → fade to neutral; on error “Couldn’t save—Retry.”
4. **Unsaved changes warning:** on refresh, nav away, back—modal (section 3.5).
5. **Draft recovery:** user returns to same draft later; sees last **saved** state; if last auto-save failed, banner “Last save failed” with Retry.

### E. Save as draft

1. User clicks **Save draft** (toolbar or footer).
2. If validation for “minimal draft” fails (e.g. title required even for draft), show inline errors.
3. On success: toast or inline “Draft saved”; optional “View in drafts” link.
4. **Exit after save:** user clicks “Close” or nav to dashboard—no unsaved prompt if save succeeded and no new edits after.
5. **Resume later:** from dashboard drafts list (section 5).

### F. Review before publish (deep)

1. **Review screen layout:** user scrolls a single page (or accordion) of read-only **cards** / rows:
   - **Audio:** waveform or duration text + filename; **Replace** shortcut if product allows from review.
   - **Title** (single line, truncated with “Show more” if long).
   - **Description** (expand/collapse for long text).
   - **Speaker** line.
   - **Tags** as read-only chips.
   - **Category** as text.
   - **Thumbnail** image or “None—optional” placeholder.
   - **Visibility** (e.g. Public / Unlisted) if product includes.
   - **Schedule** line if scheduled (section 4.H).
2. **Edit from review:** each card has **Edit** or pencil → click jumps to editor **anchor** for that section; user changes field → **Back to review** control returns to review with updated read-only values (unsaved changes follow dirty rules).
3. **Missing fields:** card shows dashed border + inline **Add …** button that jumps to the right editor control.
4. **Blocking errors:** **Publish** / **Schedule** disabled; sticky summary “Fix 2 issues” with each item as link (click scrolls editor when navigated).
5. **Warnings:** yellow callout; optional checkbox “I understand, publish anyway” enables primary only when checked.
6. **Footer actions:** **Publish** (or **Schedule**) primary; secondary **Save as draft instead**; tertiary **Back to editing**; destructive-style **Discard sermon** only if product exposes it here (usually draft-only).
7. **Cancel publish intent:** **Back to editing** returns to editor; no publish; draft retained.

### G. Publish sermon

1. User clicks **Publish** on review (only when blocking errors cleared).
2. **Confirmation:** optional final modal “Publish now?” with sermon title; **Publish** / **Go back**.
3. **Post-publish success:** full-page or modal: checkmark, “Your sermon is live,” buttons **Go to sermon**, **Share**, **Upload another**.
4. **Redirect:** default to dashboard **Published** tab with new row highlighted **or** public sermon page per product.
5. **Share:** opens share sheet (copy link, social icons, email).

### H. Schedule for later (optional product)

If sermons can be **scheduled** instead of immediate publish:

1. **From editor or review:** user toggles **Publish now** → **Schedule** (radio or segmented control).
2. **Date picker:** click field → calendar opens → click day → calendar closes or time step follows.
3. **Time picker:** click clock field → scroll or dropdown hours/minutes; **AM/PM** if 12h locale.
4. **Time zone:** dropdown defaults to browser-detected zone; user can change; helper text shows “Listeners will see time in their zone” if product shows that copy.
5. **Validation:** past date/time → inline error “Choose a future time”; empty → blocking on way to review.
6. **Review:** scheduled row shows **Go-live:** date + time + zone.
7. **Submit:** primary button reads **Schedule** instead of Publish; confirmation modal “Schedule this sermon?”
8. **Success:** “Scheduled” toast or page; row appears under **Scheduled** tab; user can **Edit schedule** or **Cancel schedule** (confirm) from row menu.

---

## 5. Manage sermons (creator dashboard)

### A. View list

1. **Tabs:** Drafts | Published | Scheduled (if product includes scheduling).
2. **Empty states:** each tab has its own illustration + CTA (e.g. drafts empty: “No drafts yet”).
3. **Scroll:** infinite scroll or pagination; “Load more” at bottom; loading skeleton rows while fetching.

### B. Sorting and filtering (required)

**Sort controls (dropdown or tabs):**

- Latest (default)
- Oldest
- Recently edited

**Filter controls:**

- By status: Draft / Published / Scheduled (may mirror tabs or refine within tab).

**Interactions:** open menu, click option, list animates refresh, empty state if no matches.

### C. Multi-select and bulk actions (critical)

1. **Select one:** user clicks row checkbox (not just row) or entire row is clickable per product—row background/border shows **selected** state.
2. **Multi-select:** user clicks second checkbox; count in sticky bar updates “2 selected.”
3. **Shift-click range (optional):** click first checkbox, shift-click last in block; all intermediate rows select.
4. **Select all on page:** header checkbox → all visible rows select; bar shows “All 25 on this page selected.”
5. **Deselect all:** click header checkbox again or **Clear selection** in bar; all checkboxes clear; bar hides.
6. **Bulk bar (sticky):** appears bottom or top with count + **Delete** + **Publish** (enabled only if every selected row is an eligible draft) + **Move to draft** (if applicable and selection eligible).
7. **Bulk delete (micro-flow):** user clicks **Delete** → modal title “Delete 3 sermons?” → body lists titles (truncated) + “This can’t be undone” → **Cancel** / **Delete sermons** (destructive) → on confirm, buttons show loading → success toast “3 sermons deleted” → list refetch → selection cleared. If one fails, modal or inline “2 deleted, 1 failed” + **Retry failed**.
8. **Bulk publish:** only drafts without blocking validation issues—or modal warns “2 sermons are missing audio; only 1 will publish” per product → confirm → same loading/success/partial pattern.
9. **Bulk move to draft:** confirm “Unpublish 2 sermons?” → confirm → list updates; published counts change.
10. **Mixed tab selection:** if product disallows cross-tab bulk, switching tab clears selection with optional toast “Selection cleared.”

### D. Sermon actions (single)

**Draft row:**

- **Edit** → open editor (resume draft).
- **Delete** → confirm → remove from list or mark deleted per UX.

**Published row:**

- **Edit** → editor in published-editable state.
- **Unpublish** → confirm → moves to draft or hidden per product; list updates.
- **Share** → share sheet.

**Scheduled row:**

- **Edit** → editor with schedule section focused.
- **Cancel schedule** → confirm → becomes draft or immediate publish choice per product.

**Row overflow menu (“⋯”):** duplicate, open in new tab, copy link (if published).

---

## 6. Cross-flow interactions

| Scenario | User interactions |
|----------|-------------------|
| **Edit after publish** | Open from published tab → edit → save may open **mini review** or “Changes are live” / “Submit for review” per policy. |
| **Re-upload audio** | In editor, “Replace audio” → same as start upload B; old audio replaced after confirm if live. |
| **Duplicate sermon** | From menu → confirm optional → new draft opened. |
| **Continue after interruption** | Dashboard banner “Upload interrupted” on affected draft → Resume / Retry. |

---

## 7. Interruption and resume (web)

| Event | User-visible outcome |
|--------|----------------------|
| **Tab closed during upload** | Reopen app: draft exists with failed or partial state; **Retry** prominent. |
| **Page refresh mid-edit** | If saved: restored. If dirty: browser warning; if user forces reload, lose unsaved unless auto-save had run. |
| **Navigation away mid-edit** | Unsaved modal (section 3.5). |
| **On return** | Same draft row; editor opens to last saved step; banners for failed upload or save. |

---

## 8. Edge case interactions (user perspective)

| Situation | What the user sees / does |
|-----------|---------------------------|
| **No internet** | Inline/offline banner; saves queue or fail with “You’re offline—retry when connected”; publish disabled. |
| **Upload stuck** | After timeout, “Taking too long—Cancel or Retry”; support link optional. |
| **File corrupted** | Error after processing: “This file couldn’t be read—try another file.” |
| **Duplicate upload attempt** | Same file dropped twice: second replaces first after confirm or ignored with message. |
| **Missing required fields** | Cannot publish; review lists them; inline on fields. |
| **Save fails** | Toast “Couldn’t save”; **Retry**; draft not updated until success. |
| **Publish fails** | Error on review; **Try again**; draft unchanged or rolled back with message. |

---

## 9. Feedback and response patterns

- **Upload:** Linear progress, cancel, retry, replace.
- **Success:** Toasts for small wins; full page for publish success.
- **Errors:** Field-level for forms; top banner for global (network, permission).
- **Confirmations:** Delete, discard changes, bulk delete, unpublish, cancel upload—always modal with primary destructive styled differently.
- **Undo:** Where product supports (e.g. “Sermon deleted” toast with **Undo** for 5 seconds).

---

## 10. Interaction patterns (summary)

- **Drag and drop** on upload zones with hover and invalid-drop feedback.
- **Progress bars** for uploads and optional long saves.
- **Disabled** states on Publish until valid; disabled Save when not dirty (per rules).
- **Inline validation** on blur + blocking summary on review.
- **Modals** for destructive and leave flows; **full pages** for wizard steps and success.
- **Toasts** for non-blocking confirmations (draft saved, link copied).

---

## Completeness check (creator actions)

Documented interactions include: **access creator mode**; upload from **CTA**, **empty state**, **after record**, **resume draft**, **retry failed**, **duplicate**, **edit published**; **record** path with **permission denied**, **pause/stop/preview/re-record/discard**, **muted mic** hint; **drag-drop** and **picker** with cancel/invalid/oversize; **upload progress** (single/multi, cancel, retry, replace, slow, fail, navigate away); **metadata** form (all fields, validation, save enablement, dirty); **thumbnail crop** modal steps; **auto-save** and **manual save** with indicators and recovery; **save draft**; **review** screen (per-section cards, edit jump-back, missing, blocking vs warnings, footer actions); **publish** and optional **schedule** (date/time/timezone, review line, confirm, success, scheduled tab); **post-publish** success and share; **dashboard** tabs and empty states; **sort** and **filter**; **multi-select**, **select all**, **clear**, **bulk bar**, **bulk delete/publish/move to draft** with confirm and partial failure; **single-row** draft/published/scheduled actions and overflow menu; **cross-flow** edit-after-publish, replace audio, duplicate, interruption banners; **tab close / refresh / nav away** with unsaved and upload rules; **edge** offline, stuck, corrupt, duplicate file, missing fields, save/publish fail; **feedback** patterns (toasts, modals, undo).

If the product adds **analytics**, **comments moderation**, or **monetization** for ministers later, extend this document with new sections rather than overloading sermon lifecycle steps.
