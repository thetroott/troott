# feat-0010: Web Get Started onboarding (`/get-started`)

## Summary

**Get Started** is the authenticated onboarding hub and multi-step wizard for **ministers** and **creators** on the Troott web portal. It collects identity verification, profile and ministry details, an optional product tour, and links users toward their first sermon upload in studio. This spec describes every route, screen, UI pattern, persistence model, and entry point for `apps/web` under `/get-started`.

Related: portal entry routing in [feat-0009](../feat-0009/PRODUCT.md); sidebar visibility in [feat-0002](../feat-0002/PRODUCT.md); Save & Exit in [feat-0007](../feat-0007/PRODUCT.md); studio upload + publish in [feat-0008](../feat-0008/PRODUCT.md).

## Problem

Get Started spans a checklist hub, nested forms, document upload UI, local draft storage, API onboarding milestones, and studio deep links. Product and engineering need one contract for what each screen shows, how progress is represented, and when the user may leave for studio—without conflating **UI checklist state** with **server onboarding completion**.

## Non-goals

- Email OTP activation (`/activate-account`) — [feat-0001](../feat-0001/PRODUCT.md).
- Sermon upload wizard UX inside `/studio/:studioCode/sermons/upload/...` — [feat-0008](../feat-0008/PRODUCT.md).
- Admin or listener onboarding (admins never see Get Started).
- Mobile app onboarding.
- KYC provider integration details (Onfido, etc.) beyond what the UI exposes today.
- Fixing known copy typos or placeholder implementations in **production** — tracked in [§ PRODUCTION RECOMMENDATIONS §6](#6-copy-and-ui-fixes-implementation-pass); current state documented below for QA.

## Figma

Figma: none provided. Baseline is the implemented web UI: dashboard shell (dark sidebar + top nav), bordered checklist card on the hub, inner wizard with **Save & Exit** and **Back / Continue** footer.

## Consumer

- **Minister** — primary persona; server `minister.onboarding.status` drives portal completion.
- **Creator** — same UI flow; creator profile + `user.onboard.status` when creator context is absent.
- **QA / support** — verifying checklist vs API milestones and studio gating.

---

## When Get Started is used

| Entry | Behavior |
|-------|----------|
| Post-auth redirect | Minister/creator with incomplete studio onboarding → `/get-started` ([feat-0009](../feat-0009/PRODUCT.md)). |
| Sidebar | **Get Started** nav item (rocket icon) visible only while onboarding incomplete; hidden for admin/super-admin. |
| Manual URL | User opens any `/get-started/...` path while signed in. |
| Studio guard | Opening `/studio/:code/...` with incomplete onboarding redirects to `/get-started`. |
| Save & Exit | From an inner step, returns to hub or studio home if onboarding already complete. |
| Upload checklist item | Hub accordion item 4 navigates to studio upload paths (requires stored studio code). |

**Completion (portal):** minister `onboarding.status === 'completed'` (or creator equivalent). When complete, Get Started sidebar item hides and post-auth routes to studio.

**Not completion:** local checklist key `onboarding_progress` or per-step “Completed” on the hub.

---

## Shell and layout

### Dashboard chrome (all Get Started routes)

- Renders inside **DashboardLayout**: collapsible left sidebar, Troott logo, search, role-filtered nav, top **NavBar** (except studio sermons canvas override).
- Background: neutral dark shell consistent with the rest of the portal.
- Requires authenticated session (`isAuth: true` on route rows).

### Hub vs inner wizard

| Layer | Routes | Chrome |
|-------|--------|--------|
| **Hub** | `/get-started` (index only) | No **Save & Exit**; no **Back / Continue** footer. Full-width padded checklist card. |
| **Inner wizard** | All other `/get-started/*` except profile | **InnerLayout**: top-right **Save & Exit**; content `max-w-3xl` centered; **ProgressButtons** below form. |

### InnerLayout UI

- **Save & Exit** (ghost button, save icon): top-right of inner content area; disabled while checkpoint save is in progress.
- Main column: `max-w-3xl mx-auto px-6`, scrollable with outer `m-10` margin.
- Footer **ProgressButtons**: top border, ghost **Back** (chevron) left, primary **Continue** right; Continue shows **Saving…** while checkpoint runs.

### PageHeader (inner steps)

- **Title:** 28px bold (`text-[28px] font-bold`).
- **Description:** 16px muted; may include HTML via `dangerouslySetInnerHTML` (e.g. line breaks in passport copy).
- Optional trailing slot for future actions (usually empty).

### Verify-account intro layout

- **GetVerified** adds extra right padding (`pr-80`) on the form column—wider empty margin on large screens.
- Shows **PageHeader** + **VerifyAccountForm** above nested routes (Outlet unused for siblings).

---

## Hub screen (`/get-started`)

**Purpose:** Orientation checklist; does not persist to API on its own.

### Visual structure

- Outer padding: `p-20`.
- Card: bordered, rounded (`border border-border rounded-md`), inner padding `p-15`, vertical spacing `space-y-6`.

### Header row

- Left: **Get Started** (`text-2xl font-bold`).
- Right: progress summary — `{n}/{4} completed` + horizontal bar:
  - Track: `bg-neutral-400/60`, height 2, full width (max-w-md).
  - Fill: `bg-primary`, width = `(completedSteps.length / 4) * 100%`, CSS transition.

### Section copy

- Subheading: **Launch your first sermon** (`text-xl font-semibold`).
- Supporting text: muted paragraph about verification and avoiding publishing interruptions.

### Accordion checklist (4 items)

Source: `OnboardingItems` in `apps/web/src/_data/onboarding.tsx`.

| # | Title | Collapsed CTA | Expanded body | Primary navigation |
|---|--------|---------------|---------------|-------------------|
| 1 | Verify your account | **Verify account** | Explanation + inner **Verify account** button | `/get-started/verify-account` |
| 2 | Complete your profile | **Complete profile** | Home + ministry copy | `/get-started/home-address` |
| 3 | How to use troott | **Tour & Tutorial** | Tour copy | `/get-started/tour-guide` |
| 4 | Upload first sermon | **Upload sermon** | Upload copy | `/studio/{code}/sermons/upload` (or `/_/…` if no code) |

**Accordion UI (per item):**

- shadcn **Accordion** `type="single"` `collapsible`.
- Item border, padding `px-6`, focus ring on keyboard focus.
- Open state: `data-[state=open]:bg-accent`.
- Trigger row: dot icon (muted), title (`text-sm font-medium`); title muted when item id marked complete locally.
- **Collapsed-only** small primary button on trigger row (`group-data-[state=open]:hidden`) — navigates without expanding.
- Expanded: divider, body text, full-width button:
  - Default: same label as CTA (e.g. **Verify account**).
  - After local complete: disabled, label **Completed**.

**Local completion rules (hub only):**

- Storage key: `onboarding_progress` (JSON array of item ids `"1"`–`"4"` in `localStorage`).
- Marking complete: clicking the **expanded** accordion primary button calls `handleStepComplete(item.id)` then navigates. The small button on the **collapsed** row navigates only—it does **not** increment progress.
- Does **not** auto-complete when user finishes inner wizard or API milestones.
- Refreshing the page restores checklist marks from `localStorage` only.
- Progress label `{n}/4 completed` is `completedSteps.length / 4` only—**not** API validation or form submission.

**Misleading progress (current bug — see § Known quirks):** A user can show **4/4 completed** without filling any form if `onboarding_progress` already contains `["1","2","3","4"]` (prior clicks, stale dev data). That state does **not** imply `minister.onboarding.status === 'completed'`.

---

## Inner wizard: route map

All paths under `PATH_GET_STARTED` (`/get-started`). Profile routes share minister route file but are not part of the onboarding checklist.

| Path | Screen title (PageHeader) | Form / content |
|------|---------------------------|----------------|
| `/get-started/verify-account` | Let’s get you verified | Country combobox + 7-minute checklist (personal info, government ID icons) |
| `/get-started/verify-account/personal-information` | Personal Information | Residence, legal name (read-only from user), DOB picker |
| `/get-started/verify-account/verify-document` | Document Verification | Outlet for document sub-flow |
| `…/verify-document` (index) | (no extra header) | Document type radio cards |
| `…/verify-document/select` | — | Illustration + ID photo tips (bullet list) |
| `…/verify-document/document1` | — | Upload method: camera vs upload photos |
| `…/verify-document/upload` | — | Inline document upload dialog (front/back) |
| `/get-started/complete-profile` | — | **Redirect** → `/get-started/home-address` |
| `/get-started/home-address` | Home Address | Street, postal, city, country, phone |
| `/get-started/ministry-input` | Tell Us About Your Ministry | Ministry name, website, HQ line, description |
| `/get-started/tour-guide` | How to use Troott | Placeholder copy; no interactive tour yet |

---

## Step-by-step UI and behavior

### 1. Verify account (intro)

**UI components:**

- **CountrySelect** (“Residence”): searchable combobox; auto-detect country from geolocation when empty.
- Subcopy: “Complete the following steps… **7 minutes**”.
- **IconText** rows: ID card icon + “Personal information”; file icon + “Government-issued ID”.

**Behavior today:**

- Country selection is **component state only** on this screen—not written to draft storage or API until user continues on personal-information.
- **Continue** (footer): checkpoint is a no-op (`{ ok: true }`), but **ProgressButtons still advances** — because `/get-started/verify-account` is not in group 1’s `steps` array, `currentIndex === -1`, so Continue navigates to the **first** substep: `…/personal-information` ([`ProgressButtons.tsx`](../../../../apps/web/src/components/shared/get-started/ProgressButtons.tsx)).
- **Back** is disabled on this screen (`currentIndex <= 0`).
- No in-form CTA on the intro itself (only **IconText** rows); user may also use hub accordion CTAs or direct URL.

**Production (target):** On country change, persist residence immediately—see [§ PRODUCTION RECOMMENDATIONS — Verify-account intro country](#3-verify-account-intro-country-persistence). Optionally block Continue until country is saved in draft/localStorage.

**Product expectation:** User proceeds to personal information via **Continue**, hub accordion, or direct URL. Personal-information **CountrySelect** hydrates from the same draft keys on mount.

---

### 2. Personal information

**Fields (max width ~410px on some forms; personal form uses full inner width):**

| Field | Control | Notes |
|-------|---------|--------|
| Residence | CountrySelect | Draft + API on Continue |
| Legal name | LegalNameInput | Prefilled from user first/last; descriptive helper “As shown on your government-issued ID” |
| Date of birth | DOBPicker | ISO date in draft |

**Draft:** `sessionStorage` key `troott.getStarted.draft.personal` — auto-saved on change.

**Continue (checkpoint):**

- Requires country `code2` and date of birth.
- Updates user profile; minister or creator `onboardingPersonalComplete`.
- Toast error if validation or API fails; stay on page.

---

### 3. Document verification (sub-flow)

**Canonical step order (product + Continue/Back):**

| Order | Path | Screen |
|-------|------|--------|
| 1 | `…/personal-information` | Personal info (group 1; outside document outlet) |
| 2 | `…/verify-document` (index) | Document type |
| 3 | `…/verify-document/select` | Photo tips |
| 4 | `…/verify-document/document1` | Upload method |
| 5 | `…/verify-document/upload` | Front/back upload + document checkpoint |

**Implementation note:** [`onboarding.tsx`](../../../../apps/web/src/_data/onboarding.tsx) group 1 `steps` currently lists **select before document1** (tips before upload method). **Production:** reorder `steps` to match the table above so Continue/Back match the route map and user-facing flow.

**3a. Document type** (`…/verify-document` index)

- Label: “Document Type”.
- **IconRadioSelect** options: National ID (NIN), Driver’s License, International Passport.
- Selection stored in `localStorage` key `selectedDocumentType`.

**3b. Tips** (`…/select`)

- Hero image `/images/assets/verify-doc.png`.
- Repeated tip bullets (readable ID, solid background)—duplicate tip line exists in UI today.

**3c. Upload method** (`…/document1`)

- **IconRadioSelect:** “Take picture with phone” vs “Upload photos”.
- **Take picture with phone:** placeholder today — no QR/deeplink spec; production deferred until mobile capture or KYC provider ships. Continue may still advance if upload path not required for MVP.
- **Upload photos** opens **FileUploadDialog** (modal) with front/back fields depending on document type.

**3d. Upload** (`…/upload`)

- **UploadDocumentWrapper**: embedded **FileUploadDialog** with `useOutletFlow` (not modal).
- Copy references driver’s license face visibility.
- Accepts JPEG/PNG front and back.
- On submit: simulates delay, stores file metadata in `localStorage` `uploadedDocuments`; may auto-navigate to next step in onboarding step list (if any).
- **Continue** in footer calls `onboardingDocumentComplete` API (minister/creator)—does not require real backend upload yet.

**ProgressButtons** treats document paths as part of checklist group 1 per `OnboardingItems.steps` (see canonical order above).

---

### 4. Home address

**PageHeader:** “Home Address” — “Fill in your current residential address.”

**Fields (~410px column):**

| Field | Component |
|-------|-----------|
| Street | AddressInput |
| Postal code | PostalCode |
| City | CityInput |
| Country | CountrySelect (syncs location country name) |
| Phone | PhoneInput (uses country phone code) |

**Draft:** `troott.getStarted.draft.address`.

**Continue:** Requires street, city, phone; updates user `location` + phone; `onboardingAddressComplete`.

---

### 5. Ministry profile

**PageHeader:** “Tell Us About Your Ministry” (description HTML includes typo “FThis” in current UI).

**Fields:**

| Field | Component |
|-------|-----------|
| Ministry name | MinistryForm (may suggest from user names) |
| Website | MinistryWebsite |
| HQ / location line | MinistryLocation |
| Description | MinistryDescription |

**Draft:** `troott.getStarted.draft.ministry`.

**Continue:** Requires ministry name; updates minister/creator profile; `onboardingMinistryComplete`.

---

### 6. Tour guide

**UI:**

- Short placeholder paragraph: full interactive tour deferred.
- **PageHeader** explains continuing to first sermon upload.

**Continue:**

- Calls `onboardingTourComplete`.
- If more steps in group: next URL; on tour page completion navigates to **studio upload** when `studioCode` in storage, else back to **hub**.

**Back:** Special case — from tour, Back goes to `/get-started/ministry-input` (not previous item in document list).

---

### 7. Upload first sermon (studio)

Not a Get Started route—checklist links to studio paths ([feat-0008](../feat-0008/PRODUCT.md)):

- `/studio/{code}/sermons/upload` (+ file, details, thumbnail, publish segments).
- If no studio code cached: `/studio/_/sermons/upload/...` placeholder segment until code exists.

**Studio upload vs Get Started chrome:** Item 4 `steps` in `OnboardingItems` list studio upload segments for navigation helpers, but those routes render **outside** `InnerLayout` — no Save & Exit / ProgressButtons on studio pages.

**Onboarding completion (partial today):** Publish with `status === published` triggers `onboardingFirstSermonComplete` in [`useSermon.ts`](../../../../apps/web/src/hooks/app/useSermon.ts) (minister/creator). Hub checklist and sidebar do **not** auto-refresh from that call yet — see [§ PRODUCTION RECOMMENDATIONS §5](#5-hub-item-4--complete-only-after-published-sermon).

Completing upload draft alone does **not** complete portal onboarding.

---

## Shared controls

### Save & Exit

| Step type | Draft support (current) | Draft support (production) | Toast |
|-----------|-------------------------|----------------------------|--------|
| Personal information | Yes (sessionStorage) | Yes | Success if country saved in draft; else informational |
| Verify-account intro | No | Yes — country → sessionStorage draft + `localStorage` `troott.getStarted.verifyAccount.country` | Success if country saved |
| Home address / complete-profile alias | Yes | Yes | Success if any address field in draft |
| Ministry input | Yes | Yes | Success if ministry name in draft |
| Document / tour | No | No (document: localStorage metadata only) | Informational only |

**Exit destination:**

- Onboarding complete + studio code → studio home.
- Else → `/get-started` hub.

Does not call API checkpoints except by flushing draft to sessionStorage.

### Back / Continue

- **Back:** Previous path in current checklist group’s `steps` array; disabled on first step of group (except tour → ministry).
- **Continue:** Runs `runGetStartedCheckpoint(pathname)` then navigates forward or to hub / studio upload.
- Shared busy state disables Save & Exit and both buttons during checkpoint.

### Checklist groups for navigation (ProgressButtons)

Derived from `OnboardingItems`: pathname must `startWith` group `action`.

- Group 1 (`verify-account`): 5 substeps including personal + document chain.
- Group 2 (`home-address`): home-address → ministry-input.
- Group 3 (`tour-guide`): single step.
- Group 4 (upload): studio URLs—**Continue** on studio upload pages is out of scope here unless user landed via inner layout (upload is outside InnerLayout).

---

## Sidebar and navigation data

- Nav item: **Get Started**, `RocketIcon`, url `/get-started`, roles minister + creator, `showOnboarding: true`.
- Filtered by `shouldShowGetStartedNavItem` (inverse of `isStudioOnboardingComplete`).
- Studio links in sidebar (`/dashboard`, `/sermons`, etc.) are rewritten to `/studio/{code}/…` at click time when code is cached ([feat-0002](../feat-0002/PRODUCT.md)).

**Incomplete onboarding and Main nav (current gap — see § Known quirks):** Sidebar **does not** disable Dashboard, Sermons, Analytics, or Bin while Get Started is incomplete. Users with a cached `studioCode` can open studio routes from the sidebar; enforcement today is only on direct **`/studio/:studioCode/*`** entry via `StudioPortal` (redirect to `/get-started`), plus post-auth routing—not a global “lock portal until onboarding done” rule.

---

## Persistence model (two layers)

| Layer | Storage | What it affects |
|-------|---------|-----------------|
| Hub checklist (current) | `localStorage` `onboarding_progress` | Accordion “Completed” labels and progress bar count only — **deprecated for production** (see § PRODUCTION RECOMMENDATIONS) |
| Hub checklist (production) | Server `minister.onboarding.step` / `status` | Accordion completion + `{n}/4` bar |
| Step drafts | `sessionStorage` `troott.getStarted.draft.*` | Form repopulation; Save & Exit |
| Verify-account residence (production) | `localStorage` `troott.getStarted.verifyAccount.country` + merge into `troott.getStarted.draft.personal` | Intro country survives leave/return; personal-information hydrates |
| Document type | `localStorage` `selectedDocumentType` | Upload dialog titles |
| Uploaded files | `localStorage` `uploadedDocuments` | Client-only metadata URLs |
| Server onboarding | Minister/creator API milestones | Sidebar visibility, post-auth, studio guard |

**Authoritative for portal gating:** server `onboarding.status === 'completed'`.

---

## Minister vs creator

- Same routes and UI.
- Checkpoints call `api.minister.*` or `api.creator.*` based on cookie `userType`.
- Creator without loaded creator context may fall back to `user.onboard.status` for completion checks.
- **Ministry step (creator):** checkpoint maps `ministryName` → `creator.profile.displayName`; same form components as minister.

---

## Step access, deep links, and resume

### Current behavior

| Surface | Gate |
|---------|------|
| `/get-started/*` inner steps | Authenticated session only — **no** milestone prerequisite on direct URL |
| Continue checkpoints | API enforces milestone order (e.g. address requires document step) |
| Hub accordion CTAs | Navigate only; no server check |

A user may open `/get-started/ministry-input` before completing verify; **Continue** may fail at API with ordering errors.

### Production (target)

| Policy | Rule |
|--------|------|
| **Deep links** | Allow read/browse of any step; **Continue** remains the enforcement point via checkpoint + API |
| **Optional soft redirect** | On mount, if pathname is “ahead” of `onboarding.step`, show non-blocking banner: “Complete earlier steps first” — do not hard-block URL entry in MVP |
| **Resume after login** | Post-auth sends incomplete users to `/get-started` hub ([feat-0009](../feat-0009/PRODUCT.md)); hub accordion highlights next incomplete item from server `onboarding.step` (production §1) |
| **Resume mid-session** | Save & Exit returns to hub; user re-enters via accordion or manual URL — no automatic “jump to last path” in current or production MVP |

### Hub “next step” mapping (production)

| `onboarding.step` | Suggested primary CTA target |
|-------------------|------------------------------|
| &lt; 1 | `…/verify-account` or `…/personal-information` |
| 1 | `…/verify-document` |
| 2 | `…/home-address` |
| 3 | `…/ministry-input` |
| 4 | `…/tour-guide` |
| 5 | `/studio/{code}/sermons/upload` |
| ≥ 6 | Studio home (onboarding complete) |

---

## Access policies (admin, profile, skip)

### Admin

- **Sidebar:** Admins do **not** see Get Started (`shouldShowGetStartedNavItem` returns false).
- **Routes:** feat-0009 allows `/get-started/*` for admin roles on direct URL — **not** a primary admin flow. Production: optional redirect admin from `/get-started` → `/admin` or studio; no onboarding checkpoints for admin.

### Profile during onboarding

- `/profile` and `/profile/change-password` remain **auth-only** (not checklist-gated).
- Ministers mid-onboarding may update account settings; does not advance onboarding milestones.
- Production: no change required unless product later blocks profile until KYC complete.

### Onboarding skip (API only today)

- Minister/creator APIs expose `onboarding/skip` (sets `onboarding.status === 'completed'`).
- **Not exposed in web UI** — support/internal use only unless product adds an admin or debug affordance.
- **Non-goal:** self-serve skip for ministers in production MVP.

---

## Field validation (checkpoint + production)

| Field | Current checkpoint | Production notes |
|-------|-------------------|------------------|
| Country (personal) | Required `code2` | Intro must persist before Continue (§3) |
| Date of birth | Required ISO date | Consider min age (18+) — not enforced today |
| Legal name | Read-only from user | No correction path in Get Started; user must fix via profile/support |
| Street, city, phone (address) | Street, city, phone required | Postal code optional today |
| Ministry name | Required trim | Website, HQ, description optional |
| Document upload | None on Continue | MVP: type + front/back metadata required (production §4) |

Phone format and postal validation defer to existing input components; document file types: JPEG/PNG only on upload step.

---

## Client storage hygiene

| Key | Scoped by user? | Production |
|-----|-----------------|------------|
| `onboarding_progress` | No | Remove from hub; clear on hub mount during migration |
| `selectedDocumentType`, `uploadedDocuments` | No | Clear on logout; consider prefix with user id if multi-account same browser becomes a requirement |
| `troott.getStarted.draft.*` | sessionStorage (tab) | Unchanged |
| `troott.getStarted.verifyAccount.country` | No (production) | Clear after personal checkpoint + on logout |

**Logout:** production SHOULD clear Get Started `localStorage` keys for the session to avoid cross-account QA confusion (see Known quirk A).

---

## Loading and empty states

| State | Current | Production |
|-------|---------|------------|
| Hub before minister/creator hydrate | Shows local `onboarding_progress` immediately | Show skeleton or `{0}/4` until profile loaded; then server-backed progress |
| Checkpoint in flight | Continue / Save & Exit show **Saving…**; buttons disabled | Same |
| Missing `studioCode` (item 4) | Links use `/studio/_/…` placeholder | Toast on click if code still missing after hydrate: “Studio not ready — try again shortly” |
| Checkpoint API error | Sonner toast; stay on page | Same; include API `message` when present |

---

## Interactive tour

- **Canonical spec:** [feat-0016](../feat-0016/PRODUCT.md) — 5-step dashboard tour (Figma `3809:*`–`3816:*`), Origin-style popover + spotlight.
- `/get-started/tour-guide` remains the **launcher** route; interactive steps run on `/dashboard`.
- Until feat-0016 ships, [`TourGuidePage.tsx`](../../../../apps/web/src/app/get-started/TourGuidePage.tsx) is placeholder copy only.
- Footer **Continue** still calls `onboardingTourComplete` for users who skip the interactive tour.

---

## Accessibility and UX notes

- Accordion items support focus-visible ring.
- Progress footer buttons use `aria-label` on Save & Exit.
- Loading states: **Saving…** on Continue and Save & Exit; hub has no global loading skeleton.
- Error feedback: Sonner toasts on checkpoint failure.
- HTML in descriptions: ensure copy is trusted (no user-generated HTML).

---

## Acceptance criteria

### Current (shipped behavior)

- [ ] Hub shows 4 accordion items, progress bar, and local completion independent of API.
- [ ] Inner steps show Save & Exit, PageHeader, and Back/Continue except hub index.
- [ ] Personal, address, ministry Continue persist drafts and call correct onboarding milestone APIs.
- [ ] Document upload Continue calls `onboardingDocumentComplete` without requiring hub checkbox.
- [ ] Tour Continue completes tour milestone and routes to studio upload when code exists.
- [ ] Incomplete minister opening studio is redirected to `/get-started`.
- [ ] Get Started hidden in sidebar when `minister.onboarding.status === 'completed'`.
- [ ] Register/activate flows land on Get Started when onboarding incomplete ([feat-0009](../feat-0009/PRODUCT.md)).

### Production (target — see § PRODUCTION RECOMMENDATIONS)

- [ ] Hub `{n}/4` and accordion “Completed” derive from `minister.onboarding.step` (not `onboarding_progress`).
- [ ] Verify-account intro country written to `localStorage` + personal draft on change; personal-information hydrates it.
- [ ] Main nav studio links redirect to `/get-started` when `!isStudioOnboardingComplete` (toast optional).
- [ ] Hub item 4 complete only when `onboarding.step >= 6` or `onboarding.status === 'completed'`.
- [ ] Document Continue blocked until type + front/back satisfied (MVP); stricter rules when KYC provider ships.
- [ ] Duplicate document-select tip removed; ministry PageHeader typo fixed.
- [ ] Optional: nested `verify-account` routes with `<Outlet />` for breadcrumbs.
- [ ] Reorder `onboarding.tsx` group 1 `steps` to match canonical document sub-flow order.
- [ ] Hub refetches minister/creator after publish (`onboardingFirstSermonComplete` already called from `useSermon`).
- [ ] Clear Get Started `localStorage` keys on logout.

---

## Test plan

### Manual (QA)

| # | Case | Expected |
|---|------|----------|
| 1 | Hub with empty `onboarding_progress` | `0/4` (current) or server-backed count (production) |
| 2 | Verify intro Continue | Navigates to personal-information |
| 3 | Personal Continue without country/DOB | Toast; stay on page |
| 4 | Document upload Continue (production MVP) | Blocked without type + front/back |
| 5 | Address Continue without phone | Toast; stay on page |
| 6 | Tour complete + studio code | Navigate to `/studio/{code}/sermons/upload` |
| 7 | Publish first sermon | API `onboardingFirstSermonComplete`; status `completed` |
| 8 | Incomplete minister + `/studio/x` | Redirect `/get-started` |
| 9 | Save & Exit on verify intro with country (production) | Success toast; country restored on return |
| 10 | Sidebar Sermons while incomplete (production) | Redirect hub + toast |
| 11 | Logout + login as different minister | No stale hub 4/4 from prior account (production) |

### Automated (recommended)

| Area | Suggested coverage |
|------|-------------------|
| `hubProgressFromStep(step)` | Maps step 0–6 → items 1–4 complete |
| `runGetStartedCheckpoint` | Validation messages per path |
| Country draft dual-write | intro change → sessionStorage + localStorage |
| `ProgressButtons` | verify-account Continue → personal-information |
| Document step order | Continue sequence matches canonical table |

No automated tests exist under `apps/web` for Get Started today — add when implementing production §1–§3.

## Known quirks (current implementation)

Documented so support and QA can distinguish **hub UI state** from **server onboarding** and **sidebar access**.

### A. Hub shows 4/4 completed without filling forms

**Symptom:** Progress bar reads **4/4 completed** and accordion items show **Completed**, but minister/creator profile fields and onboarding milestones were never saved.

**Cause:**

| What users assume | What the code does |
|-------------------|---------------------|
| Progress reflects submitted KYC/profile | Progress is `localStorage` key `onboarding_progress` only ([`GetStarted.tsx`](../../../../apps/web/src/app/get-started/GetStarted.tsx)) |
| Continue / API milestones update the bar | They do not; only expanded-accordion CTA calls `handleStepComplete` |
| Collapsed-row **Verify account** etc. marks complete | Those buttons only `navigate()`; they do not call `handleStepComplete` |

**How 4/4 appears without forms:**

1. User previously clicked each accordion’s **expanded** primary button (marks id `"1"`–`"4"` then navigates away), or  
2. Stale `onboarding_progress` in the browser from another account/session on the same origin (dev/QA), e.g. `["1","2","3","4"]`.

**Diagnostic:** DevTools → Application → Local Storage → `onboarding_progress`. Clear the key and reload `/get-started` → expect **0/4** unless something writes it again.

**Not implied by 4/4:** `minister.onboarding.status === 'completed'` (or creator equivalent). Server completion requires successful **Continue** checkpoints (`onboardingPersonalComplete`, `onboardingAddressComplete`, etc.).

**Target product behavior:** Documented in [§ PRODUCTION RECOMMENDATIONS — Hub checklist sync](#1-hub-checklist-sync-from-api-milestones). Clear stale `onboarding_progress` on hub mount when migrating.

---

### B. User can open Dashboard, Sermons, and other studio nav while onboarding incomplete

**Symptom:** User is on `/get-started` (or has empty forms) but sidebar **Dashboard**, **Sermons**, **Analytics**, **Bin** still work.

**Cause:**

| Enforcement | Scope |
|-------------|--------|
| `useRedirectAfterAuth` | After login/activate on `/` or `/login` → `/get-started` when onboarding incomplete ([feat-0009](../feat-0009/PRODUCT.md)) |
| `StudioPortal` | User lands on **`/studio/:studioCode/...`** → redirect `/get-started` if `!isStudioOnboardingComplete` |
| `shouldShowGetStartedNavItem` | Hides **Get Started** sidebar item when server onboarding **complete**—does not disable other Main items |
| Sidebar `resolveStudioNavUrl` | Rewrites `/dashboard`, `/sermons`, etc. to `/studio/{code}/...` when `studioCode` is in session/storage |

There is **no** route guard that blocks all authenticated portal routes until onboarding completes. Ministers/creators with a resolvable studio code can use Main nav; they may briefly see studio UI before `StudioPortal` redirects, or remain on studio if server `onboarding.status` is already `"completed"` while the hub still shows misleading **4/4** from localStorage.

**Diagnostic:**

1. Network: minister/creator payload → `onboarding.status`. If `"completed"`, studio access is expected even with an empty hub checklist.  
2. Direct URL: open `/studio/{your-code}/sermons` — should redirect to `/get-started` when status is not `completed` and the guard runs after hydrate.

**Target product behavior:** Documented in [§ PRODUCTION RECOMMENDATIONS — Main nav studio links](#2-main-nav-studio-links-until-onboarding-complete).

---

## PRODUCTION RECOMMENDATIONS

Resolved product decisions for production. Implement in priority order: **#1 and #5** (single source of truth), **#2** (nav gating), **#3 and #6** (quick wins), **#4** (KYC timeline), **#7** (routing cleanup when verify flow grows).

**Principle:** Server `minister.onboarding.step` / `onboarding.status` is authoritative for hub progress, sidebar visibility, and studio guards. Client storage is for **draft repopulation** and **verify-account residence** only—not for hub completion counts.

### Server step reference (minister / creator)

| `onboarding.step` | Milestone API | Maps to hub item |
|-------------------|---------------|------------------|
| ≥ 1 | `onboardingPersonalComplete` | — (substep of item 1) |
| ≥ 2 | `onboardingDocumentComplete` | Item **1** complete |
| ≥ 3 | `onboardingAddressComplete` | — (substep of item 2) |
| ≥ 4 | `onboardingMinistryComplete` | Item **2** complete |
| ≥ 5 | `onboardingTourComplete` | Item **3** complete |
| ≥ 6 | `onboardingFirstSermonComplete` (publish) | Item **4** complete; `status === 'completed'` |

Hub reads `minister` / `creator` from session context (same source as `isStudioOnboardingComplete` in [`portal-onboarding.util.ts`](../../../../apps/web/src/utils/portal-onboarding.util.ts)).

---

### 1. Hub checklist sync from API milestones

**Decision: Yes.** Hub progress bar and accordion “Completed” state **must** derive from server milestones, not `localStorage` `onboarding_progress`.

| Hub item | Mark complete when |
|----------|-------------------|
| 1 — Verify your account | `onboarding.step >= 2` (personal + document milestones) |
| 2 — Complete your profile | `onboarding.step >= 4` (address + ministry) |
| 3 — How to use troott | `onboarding.step >= 5` (tour) |
| 4 — Upload first sermon | `onboarding.step >= 6` or `onboarding.status === 'completed'` |

**Implementation notes:**

- Remove `onboarding_progress` from hub completion logic in [`GetStarted.tsx`](../../../../apps/web/src/app/get-started/GetStarted.tsx).
- On hub mount, delete stale `onboarding_progress` (one-time migration / dev hygiene).
- Collapsed-row CTAs continue to **navigate only**—they must **not** write completion flags locally.
- Expanded primary buttons navigate without calling a local `handleStepComplete`; completion is read-only from server after refetch or context update post-checkpoint.
- Reorder group 1 `steps` in `onboarding.tsx` to canonical document sub-flow (PRODUCT [§3 Document verification](#3-document-verification-sub-flow)).

**Fixes:** [Known quirk A](#a-hub-shows-44-completed-without-filling-forms).

---

### 2. Main nav studio links until onboarding complete

**Decision: Redirect (preferred over disabled-only).** While `!isStudioOnboardingComplete(userType, minister, user, creator)`:

- Sidebar **Dashboard**, **Sermons**, **Analytics**, **Bin** (and any `resolveStudioNavUrl` target under `/studio/{code}/…`) **redirect** to `/get-started` on click or route enter.
- Show a short toast: e.g. “Finish Get Started to access your studio.”
- Do **not** rely on `StudioPortal` alone ([Known quirk B](#b-user-can-open-dashboard-sermons-and-other-studio-nav-while-onboarding-incomplete)).

**Soft funnel (allowed after tour):** After `onboarding.step >= 5`, user may open studio **upload** paths for item 4; block **publish** until document/KYC rules in §4 are satisfied. Full portal browse before tour complete is **not** allowed.

**Implementation:** Extend sidebar click handler or a thin route guard shared with [`StudioPortal.tsx`](../../../../apps/web/src/app/studio/StudioPortal.tsx).

---

### 3. Verify-account intro country persistence

**Decision: Yes — persist on every country change, before Continue or navigation.**

**Problem (current):** On `/get-started/verify-account`, **CountrySelect** keeps residence in React state only. If the user uses **Save & Exit**, refreshes, or opens `/get-started/verify-account/personal-information`, the intro selection is lost unless they pick country again on personal-information.

**Production behavior:**

1. **On change** (verify-account intro): merge `country` `{ code2, name, phoneCode?, flag? }` into personal draft via `writePersonalDraft` ([`get-started-draft-storage.ts`](../../../../apps/web/src/services/get-started-draft-storage.ts) — `troott.getStarted.draft.personal` in **sessionStorage**).
2. **Also mirror to localStorage** key `troott.getStarted.verifyAccount.country` (JSON, same shape) so residence survives tab close and matches other Get Started keys that already use `localStorage` (`selectedDocumentType`, `uploadedDocuments`).
3. **On mount** (verify-account intro and personal-information): hydrate **CountrySelect** from, in order:
   - existing personal draft (`readPersonalDraft()?.country`);
   - else `localStorage` `troott.getStarted.verifyAccount.country`;
   - else geolocation auto-detect when still empty.
4. **On personal-information Continue:** unchanged checkpoint—still requires `code2` + DOB; API `onboardingPersonalComplete` after successful save.
5. **After successful personal checkpoint:** clear personal draft per existing `clearDraftForCheckpointPath`; **remove** `troott.getStarted.verifyAccount.country` from localStorage so server profile is source of truth.

**Save & Exit (verify intro):** Treat as draft-supported—success toast when country is in draft or localStorage.

**No API call** on intro country select alone.

---

### 4. Document upload (client-simulated KYC) — when Continue is blocked

**Decision: Phased validation on Continue** at `…/verify-document/upload`.

| Phase | Block **Continue** when |
|-------|-------------------------|
| **MVP (next ship)** | Document type selected (`selectedDocumentType`) **and** front + back slots filled in `uploadedDocuments` (client metadata). Empty slots → toast, stay on page. |
| **Pre-provider** | Real upload to storage succeeds; API stores verification artifact reference. |
| **With KYC provider** | Provider session submitted; allow Continue on `pending`; block on `failed`; optional hub copy “Under review”. |

**Unchanged:** Successful Continue still calls `onboardingDocumentComplete` when server allows (`step >= 1` personal). API already enforces ordering (`address` requires `step >= document`).

**Hub:** Item 1 completion remains server `step >= 2`, not client upload simulation alone.

---

### 5. Hub item 4 — complete only after published sermon

**Decision: Yes.** Item 4 “Upload first sermon” is complete only when:

- `onboarding.step >= 6`, or
- `onboarding.status === 'completed'`

**Not complete when:**

- User clicks hub CTA to `/studio/…/upload` only.
- Upload wizard reaches draft state without publish.

**Implementation:** Wire publish success to `onboardingFirstSermonComplete` (minister/creator). **Partial today:** [`useSermon.ts`](../../../../apps/web/src/hooks/app/useSermon.ts) `usePublishSermonMutation` already calls `onboardingFirstSermonComplete` on successful publish; errors are swallowed (`.catch(() => undefined)`). **Remaining:** hub/sidebar refetch minister/creator context after publish; surface milestone failure to support if needed.

---

### 6. Copy and UI fixes (implementation pass)

**Decision: Ship in the same production pass as #1–#3.**

| Issue | Location | Fix |
|-------|----------|-----|
| Duplicate tip bullet | `…/verify-document/select` | Deduplicate list items in document tips UI |
| PageHeader typo “FThis” | `/get-started/ministry-input` | Correct to “This” (or full intended sentence) |

No product debate; include in production acceptance checklist.

---

### 7. Nested `verify-account` routing (Outlet)

**Decision: Recommended before adding more KYC substeps; not blocking MVP.**

- Restructure routes so `/get-started/verify-account` is a **layout** with `<Outlet />`.
- Nest `personal-information` and `verify-document/*` as child routes.
- **Benefits:** Breadcrumbs (“Verify account › Personal information › Document”), single shared chrome, clearer Back/Continue ownership.
- **Current debt:** [`GetVerified`](../../../../apps/web/src/app/get-started/) renders PageHeader + form above an **unused** Outlet while siblings render flat ([§ Verify-account intro layout](#verify-account-intro-layout)).

---

## Open questions / known gaps

**Status: Resolved** — see [§ PRODUCTION RECOMMENDATIONS](#production-recommendations). Former open items:

| # | Former question | Resolution |
|---|-----------------|------------|
| 1 | Hub sync from API? | [§1](#1-hub-checklist-sync-from-api-milestones) |
| 2 | Disable Main nav? | [§2](#2-main-nav-studio-links-until-onboarding-complete) |
| 3 | Intro country persist? | [§3](#3-verify-account-intro-country-persistence) |
| 4 | KYC block Continue? | [§4](#4-document-upload-client-simulated-kyc--when-continue-is-blocked) |
| 5 | Item 4 after publish? | [§5](#5-hub-item-4--complete-only-after-published-sermon) |
| 6 | Tip duplicate + typo? | [§6](#6-copy-and-ui-fixes-implementation-pass) |
| 7 | Nested verify routes? | [§7](#7-nested-verify-account-routing-outlet) |

---

## Related specs

- [feat-0009](../feat-0009/PRODUCT.md) — Auth and routing into Get Started / studio.
- [feat-0002](../feat-0002/PRODUCT.md) — Sidebar Get Started item.
- [feat-0007](../feat-0007/PRODUCT.md) — Save & Exit on inner steps.
- [feat-0008](../feat-0008/PRODUCT.md) — Studio sermon upload wizard and publish.
- [feat-0010 TECH](./TECH.md) — File map, checkpoints, storage keys.
