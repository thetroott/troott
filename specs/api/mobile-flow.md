# Mobile listener experience: complete user interaction flow

**Document type:** User experience and interaction design (use-case oriented).  
**Product:** Listener mobile app for sermon audio (streaming, downloads, playlists, personal library).  
**Perspective:** What the user **sees**, **does**, and **experiences** only. No API contracts, payloads, or server implementation detail.

**Use case framing (summary):** Each major block can be read as _Actor_ = listener (or prospective listener), _Goal_ = e.g. “hear first sermon,” _System_ = the app, _Success_ = stated per section.

**Account model:** There is **no guest account** and no **Continue as guest** path. The app does not create or persist an anonymous user profile. A person is either **not yet signed in** (marketing / sign-up / log-in only) or **signed in** under a real account (after registration + activation and any required onboarding). All personalized surfaces, library, playlists, and playback in the main product require an authenticated session.

---

## 0. User states (critical context)

These states drive routing, copy, empty states, and what “resume” means. The app should derive the active state from **account status**, **verification status**, **onboarding completion**, and **local session** (e.g. token present, cached flags).

| State                                | User meaning                                            | Typical routing emphasis                                    |
| ------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------- |
| **New user**                         | Never signed up (no account, not signed in)             | Marketing / value prop, Sign up, Log in only—no guest shell |
| **Registered, not verified**         | Submitted sign-up; email not confirmed                  | “Check your email,” OTP entry, resend                       |
| **Verified, not onboarded**          | Can sign in (or just verified) but taste/setup not done | Onboarding steps, not Home                                  |
| **Onboarding in progress**           | Started taste or profile steps; not finished            | Resume at correct step; optional “Save & exit”              |
| **Fully onboarded, first-time Home** | Completed gates; first landing on main shell            | Tooltips, empty feed hints, soft education                  |
| **Returning user (established)**     | Has history, library, or playlists                      | Personalized home, fewer coach marks                        |

**First successful usage (definition for this doc):** The user has **played at least one sermon to completion or meaningful duration** _or_ has **created a named playlist with at least one item** _or_ has **saved at least one sermon to library**—whichever the product prioritizes; onboarding completion alone does not count.

---

## 1. Overview

### What this flow covers

- **Registration** (email path and parallels for social where applicable).
- **Account activation** (email verification / OTP).
- **Onboarding** (taste: favorite ministers and topics; any other required steps the product adds).
- **Pre-Home experience** (loading, “setting things up,” gates).
- **First Home load** (shell, tabs, feed, empty vs filled).
- **Initial usage:** play sermon end-to-end, save to library, create and use playlists, browse/discover, cross-feature entry points.

### What this document does _not_ cover

- Minister/creator/admin experiences.
- Payment and subscription checkout (only user-visible outcomes if paywalled content exists).
- Legal/policy screens except as **blocking** user-visible steps.

---

## 2. Navigation model

### Screen transitions

- **Push:** Standard forward navigation (e.g. Sign up → Verify email). System back pops one level.
- **Modal / bottom sheet:** Short decisions (confirm delete, discard draft, filter chips, “Add to playlist”). Dismiss via drag, tap outside (if allowed), explicit Close, or completion action.
- **Full-screen takeover:** Onboarding steps, OTP entry, some “create playlist” flows if product chooses immersion over tabs.

### Back navigation

- **OS back / gesture:** Should map to **in-app logical back** where possible (one step in a wizard, close modal, exit search).
- **First screen of a flow (e.g. Verify OTP):** Back may return to Sign up or Login with **unsaved draft rules** (see interruption section).
- **Tab root:** Back from a pushed stack should return to tab root, not exit app (platform convention).

### Tab structure (example)

Assume **Home**, **Search** (or Discover), **Library**, **Profile** (names may vary). Deep links may land on **Sermon detail** or **Player** above tabs.

### Entry points into key actions

| Action          | Possible entry points (user mental model)                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Play sermon     | Home card, topic list, minister page, search result, playlist row, library saved list, shared link, “Continue listening,” notification tap |
| Save / library  | Sermon card overflow, sermon detail, player overflow, long-press on list (if supported)                                                    |
| Add to playlist | Same as save, plus “Add to playlist” on playlist detail when editing                                                                       |
| Create playlist | Library tab FAB, empty playlist placeholder, sermon detail / player “Add to playlist → New playlist”                                       |

---

## 3. Entry points

### Open app — first install

- Splash / brand moment (short).
- Then: **value proposition** or straight to **Sign up / Log in** depending on product.
- If **forced update** exists: blocking screen with CTA to store.

### Open app — registered, not verified

- Resume on **“Verify your email”** with email masked shown.
- Clear path: **Enter code**, **Resend**, **Wrong email?** (restart registration or change email per product).

### Open app — verified, not onboarded

- Land on **first incomplete onboarding step** (not Home).
- Copy explains _why_ (“Pick interests so we can recommend sermons”).

### Open app — returning, fully onboarded

- **Home** tab default; restore **mini-player** if something was playing.
- If token expired: **session invalid** → user is returned to **Sign in** (with optional “Your session expired” copy). There is **no** in-app catalog or Home experience without signing in again.

### Deep link — shared sermon

- If **not signed in:** show **Sign in / Sign up** path (and optional static sermon teaser or artwork **without** treating the user as a guest account). After successful sign-in, open **target sermon** with return navigation preserved.
- If **logged in but not onboarded:** policy choice—either force onboarding first or allow one-off listen then gate Home (product must pick one and document it consistently).

**Implementation contract:** Canonical paths, universal links, teaser API, token vs stable URL, and rollout flags are defined in [`specs/api/deep-links.md`](./deep-links.md). The mobile app persists a **pending deep link** across auth so the target sermon opens after sign-in when possible.

---

## 4. Step-by-step user flows

### A. Registration

**Use case:** As a new listener, I want to create an account so I can save sermons and sync across devices.

**Primary path**

- User opens **Sign up**.
- Sees fields (e.g. name, email, password, confirm password—or split screens).
- **Typing / deleting:** Field-level hints (format, strength) appear as product defines—either **on blur**, **while typing**, or **on submit**; behavior must be **consistent** across fields.
- **Autofill:** OS password manager and keyboard email suggestions; fields should not fight autofill (no clearing on focus unless necessary).
- **Submit:** Primary button **disabled** until minimum valid input _or_ enabled with **inline errors on tap**—pick one pattern and stick to it.
- **Loading:** Button shows spinner / “Creating account…”; form **disabled** to prevent double submit.
- **Success:** Transition to **“Check your email”** or inline **OTP** screen.

**Alternate paths**

- **Switch to Log in** (link on Sign up): preserves typed email where sensible; password cleared.
- **Already have account** on marketing screen.
- **Social sign-up** (if offered): system browser / sheet; user returns to app—**success** state shows next step (onboarding or verify if email still needed per product).

**Errors (user view)**

- Email already registered → message + CTA **“Log in”**.
- Weak password → criteria list; which rules failed should be visible.
- Network error → **Retry** + non-destructive (form data retained).
- Rate limit / “too many attempts” → calm copy + **try later**.

**Double tap / duplicate submit**

- Second tap ignored while loading, or same request idempotent—user must not see two error toasts for one mistake.

**Leave and return**

- If app killed: **draft retention** policy (clear vs restore email only)—state explicitly in product spec; user should not be surprised by empty form after switching apps.

---

### B. Account activation

**Use case:** As a registered user, I want to prove I own my email so my account becomes active.

**OTP / code entry**

- **Auto-advance** between cells if multi-box UI; **paste** full code from SMS/email supported in one action.
- **Invalid code:** Inline error + optional **shake** or haptic; **do not** wipe all digits unless security requires it.
- **Expired code:** Clear message + **Resend**.

**Resend**

- **Countdown** (e.g. 30s) where button disabled; then **Resend** enabled.
- After resend: toast or inline “New code sent.”

**Navigation**

- **Back** to registration: confirm **lose progress?** if OTP partially entered (modal optional).
- **Wrong email:** path to **re-enter email** or **support** link.

**Restart verification**

- From login: “Didn’t verify?” → resend flow without re-registering if product allows.

**Success**

- Automatic transition to **next gate** (onboarding or pre-Home), with **celebration micro-moment** (optional checkmark animation).

---

### C. Onboarding (taste: ministers + topics)

**Use case:** As a new listener, I want to choose ministers and topics I care about so my Home feed feels relevant.

**States**

- **Step 1 — Ministers:** searchable list, multi-select, selected chips or checkmarks.
- **Step 2 — Topics:** same interaction model for consistency.

**Interactions**

- **Select / deselect:** immediate visual feedback; counts optional (“3 selected”).
- **Search:** empty state “No ministers match”; clearing search restores list.
- **Next:** disabled until **product minimum** met (e.g. at least one minister)—**or** enabled with inline “Pick at least one” on tap (pick one UX rule).
- **Back** from topics: returns to ministers **with selections preserved**.
- **Skip** (if ever allowed): must show **consequence** (“You’ll get generic recommendations”) and optional **remind me later** on Home; if skip **not** allowed, do not show skip.

**Partial completion**

- If user closes app mid-onboarding: on return, **resume same step** with **same selections** (persisted locally until server confirms).

**Completion**

- **Confirm** screen or success animation → handoff to **Pre-Home** or **Home** per section E.

**Optional steps**

- If profile photo or notifications are in onboarding: mark **Required** vs **Optional**; optional steps need **Skip** with clear outcome.

---

### D. Pre-Home experience (user view)

**Use case:** As an activated user, I want to feel the app is ready—not stuck or broken.

- After onboarding submit: **full-screen or overlay** “Setting things up…” with **determinate or indeterminate** progress.
- Prefer **skeleton** or **meaningful progress** over infinite spinner if wait > ~2s.
- **Failure:** “Couldn’t finish setup” + **Retry** + **Contact support** if retry fails again.
- **User leaves:** On return, **retry automatically** once, then show same error UI if still failing.

---

### E. First Home load

**Use case:** As a first-time listener on Home, I want to understand what to do and start listening quickly.

**Loading sequence**

- **Skeleton** cards for rails; avoid layout jump when images load.
- **Empty personalized sections:** headline + **Browse** / **Search** CTA, not a blank gap.
- **First-time hints:** coach marks or one **dismissible** tooltip (not blocking every tap on every visit).

**Pull-to-refresh**

- Standard pull gesture; **refresh indicator**; **error** toast if offline with **cached** label if showing stale data.

**Offline at first Home**

- **Banner** “You’re offline”; show **cached** home or **empty offline** state with **Retry** when connection returns.

**Returning user**

- Fewer or zero tooltips; **Continue listening** row if applicable.

---

## 5. Initial user actions (detailed interactions)

### A. Play a sermon (full depth)

**Use case:** As a listener, I want to hear a sermon from wherever I discovered it.

**Entry**

- Tap card or row from **Home**, **Search**, **Topic**, **Minister**, **Playlist**, **Library**, or **notification / deep link**.

**Loading**

- Row or detail shows **loading** state; player may open with **spinner** until first buffer.

**Playing**

- **Play / pause** large control; **seek bar** supports **tap to position** and **drag** with **preview time** if product supports scrub preview.
- **Skip forward/back** only if product provides segments (optional).

**Background / interrupt**

- **App to background:** audio continues; **lock screen / control center** controls mirror in-app state.
- **Phone call:** duck or pause per OS; **resume** when call ends (product choice: auto-resume vs stay paused).
- **Bluetooth disconnect:** pause or continue per platform; user should not hear sudden blast from speaker without warning if avoidable.

**Mini-player vs full player**

- **Mini-player** persistent above tabs: tap expands **full player**; swipe down or back collapses.
- **Full player:** artwork, title, minister (tappable to minister page), description scroll, queue peek.

**Errors**

- **Tap play → failure:** inline on card or modal “Can’t play this sermon” + **Retry**; if persistent, **Report problem** optional.
- **Mid-play stall:** buffer spinner; if timeout, same error pattern.

**Double tap play**

- No duplicate queues; second tap = pause or ignored while starting.

---

### B. Save / add to library

**Use case:** As a listener, I want to save a sermon to find it again later.

**Entry points**

- Sermon **card** (heart / bookmark icon), **sermon detail**, **player** overflow menu, **search** results.

**Feedback**

- **Optimistic UI:** icon fills immediately; **failure** reverts icon + toast.
- **Or confirmed UI:** spinner then filled icon—slower but clearer for flaky networks.

**Undo**

- Toast **“Saved”** with **Undo** within time window; undo removes from library and reverts icon.

**Duplicate save**

- Second tap: **unsave** (toggle) _or_ disabled with tooltip “Already saved”—choose one and document.

**Remove**

- Same control toggles off; confirm only if product fears accidental remove (usually **no** confirm for unlike).

**Cross-screen sync**

- Saving on detail updates **Library** tab badge/count without manual refresh when user navigates there.

---

### C. Create playlist (full depth, multiple paths)

**Use case:** As a listener, I want a named list of sermons for a mood or context.

**Path 1 — From Library**

- User on **Library** → **Create playlist** (FAB or header).
- **Name** field with validation (empty name, max length, profanity if filtered).
- **Cancel:** discard with confirm if name typed: **Discard?** [Keep editing] [Discard].
- **Create:** lands on **empty playlist detail** with CTA **Add sermons**.

**Path 2 — From sermon (“Add to playlist”)**

- User chooses **New playlist** → same naming sheet as modal/bottom sheet → on success, **sermon is already first item** (product default) or empty list with sermon pre-selected in add flow—pick one.

**Path 3 — From player**

- Overflow → **Add to playlist** → same as Path 2.

**Add sermons**

- **Search** inside flow; **multi-select**; **Add** confirms count (“Add 4 sermons”).
- **Cancel** on picker: returns without changing playlist.

**Empty playlist**

- Illustration + **Add sermons** + maybe **Browse topics**.

**Edit**

- **Rename:** inline or modal; **save** disabled until changed.
- **Reorder:** drag handles; **haptic** optional; **undo** for accidental delete row if product supports.

**Remove sermon from playlist**

- Swipe or edit mode; **Undo** toast optional.

**Delete playlist**

- **Confirmation modal** with playlist name; **destructive** button styling; cancel safe.

**Mid-creation app kill**

- On return: **draft playlist** appears in Library as “Untitled (draft)” _or_ **lost**—product must choose and communicate in copy if drafts are not kept.

---

### D. Browse / discover

**Use case:** As a listener, I want to find sermons without knowing exact titles.

**Scroll**

- **Infinite scroll** or **Load more** footer; loading row at bottom; **end** state “You’re up to date.”

**Categories / topics**

- Tap category → list; **back** returns to category grid.

**Search**

- **Focus** opens keyboard; **clear (X)** resets field and results.
- **Suggestions** while typing (tap replaces input or appends per product).
- **Recent searches:** tappable rows + **clear all** with confirm.
- **No results:** illustration + **Try different words** + chips for popular topics.

**Filters**

- **Apply** closes sheet and updates list; **Reset** clears chips; **active filter** count on Search bar.

---

## 6. Cross-flow interactions

| Interaction     | From                                  | Behavior                                                    |
| --------------- | ------------------------------------- | ----------------------------------------------------------- |
| Add to playlist | Home, search, detail, player, library | Same bottom sheet; playlist list scrollable; **New** at top |
| Save sermon     | Any list + detail + player            | Same icon semantics everywhere                              |
| Share           | Detail, player                        | OS share sheet; **link copied** toast if in-app only        |
| Go to minister  | Card, detail, player                  | Push minister screen; **back** returns to origin            |
| Go to topic     | Card, chips                           | Push topic rail                                             |

---

## 7. Interruption and resume flows

| Situation                           | What user should see when they return                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| Closed app mid-registration         | Restored form **or** clean start + “Continue signing up?” if email known locally     |
| Left during OTP                     | OTP screen with **empty or preserved** digits per security policy                    |
| Left during onboarding              | **Same step**, selections preserved                                                  |
| Killed app during playlist creation | **Draft in Library** or **lost**—see section 5C; must match marketing/support docs   |
| Network drops mid-save              | **Retry** toast; icon reverts if failed after retries                                |
| Returns after hours/days            | **Re-auth** if session expired; else **Home** + **Continue listening** if applicable |

---

## 8. Edge case interactions (user perspective only)

- **No internet:** banners on affected screens; **read-only** cached content where possible; actions show **offline** snackbar.
- **Slow loading:** skeletons; **timeout** message with retry.
- **Double tap:** debounced primary actions; no double modals.
- **Empty library:** illustration + **Browse** + **Search**.
- **No search results:** supportive copy + **clear filters** if filters active.
- **Action failed:** non-blaming copy + **Retry**; **support** link for money-related failures if ever applicable.
- **Partial success:** e.g. “3 of 4 sermons added” with **details** expandable.

---

## 9. Feedback and response patterns

- **Success:** toast (short), **inline** checkmark on control, or **celebration** animation for milestones (first save, first playlist).
- **Error:** **inline** under field for validation; **toast** for global/network; **modal** for irreversible or account-risk actions.
- **Confirmations:** delete playlist, discard long forms, log out.
- **Undo:** time-bound snackbar actions for save/unsave and remove-from-playlist where safe.
- **Disabled vs loading:** **Loading** uses spinner on button; **Disabled** uses greyed control + optional helper text (“Pick at least one minister”).

---

## 10. Interaction patterns (reusable)

- **Loading:** skeletons for lists; spinners for buttons and player buffer.
- **Pull-to-refresh:** on Home and list screens that fetch fresh catalogs.
- **Infinite scroll:** sentinel + footer loading / end state.
- **Modals:** confirm destructive actions; max one modal deep.
- **Bottom sheets:** filters, add-to-playlist, overflow menus.
- **Gestures:** swipe on playlist row to delete (with undo); **long-press** on sermon card only if discoverable (hint or menu).

---

## 11. What’s missing / to decide (product and UX gaps)

Use this as a checklist to close before shipping; items here are **not** fully specified above because they require product decisions or design assets.

1. **Exact onboarding gate:** Mandatory taste before Home vs **signed-in** user allowed limited actions (e.g. one-off listen before taste complete)—must be one coherent policy across deep links and notifications. **No** guest or anonymous mode; any “early” playback still sits under a real account.
2. **`listenerTasteOnboardingComplete` vs `tasteComplete`:** If the client still uses multiple flags, **single user-facing rule** (“can enter Home”) must be defined in design and copy.
3. **Social-only accounts:** No email OTP—onboarding entry and “verify email” copy must branch.
4. **Invite-only listeners:** Invite acceptance flow UX (WebView, password set, first screen after) vs self-serve registration.
5. **Downloads / offline library:** Full offline mode UX (download button states, storage full, play downloaded only when offline).
6. **Subscriptions / paywall:** What user sees on locked sermon (preview length, upgrade CTA, restore purchases).
7. **Accessibility:** VoiceOver / TalkBack order for OTP, player, and multi-select lists.
8. **Localization:** RTL layout, string length for buttons, date/time formats.
9. **Analytics consent:** If required by region, where it appears relative to registration.
10. **Push notifications:** Permission timing (onboarding vs first save vs never nag).
11. **Account deletion / GDPR:** Self-serve delete and data export user journey.
12. **Kids / age gate:** If applicable, blocking UX before registration.
13. **Car mode / driving UI:** Simplified player and larger touch targets.
14. **Wearables / shortcuts:** Out of scope unless product commits—list as N/A or future.
15. **Content reporting:** Abuse / copyright from sermon detail—flow not specified here.

---

## Document maintenance

When Figma or user research changes **flows**, update: **entry points**, **back behavior**, **empty/error copy**, and **section 11**. Keep this file free of endpoint tables; link technical API maps from a separate engineering spec if needed.

### Related detailed specs (`specs/mobile/`)

| Topic                                     | File                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------- |
| Auth screens (implementation + UX bridge) | [`specs/mobile/00 - auth.md`](../mobile/00%20-%20auth.md)                             |
| Onboarding / taste / pre-Home             | [`specs/mobile/00 - onboarding.md`](../mobile/00%20-%20onboarding.md)                 |
| Home tab / first load                     | [`specs/mobile/00 - home.md`](../mobile/00%20-%20home.md)                             |
| Session / biometrics / sign-out           | [`specs/mobile/00 - security.md`](../mobile/00%20-%20security.md)                     |
| Playback engine (technical)               | [`specs/mobile/01 - engine.md`](../mobile/01%20-%20engine.md)                         |
| Continue listening / queue gaps           | [`specs/mobile/02 - continue-listening.md`](../mobile/02%20-%20continue-listening.md) |
| Library                                   | [`specs/mobile/03 - library.md`](../mobile/03%20-%20library.md)                       |
| Playlists                                 | [`specs/mobile/04 - playlist.md`](../mobile/04%20-%20playlist.md)                     |
| Sharing                                   | [`specs/mobile/05 - sharing.md`](../mobile/05%20-%20sharing.md)                       |
| Notifications                             | [`specs/mobile/06 - nofications.md`](../mobile/06%20-%20nofications.md)               |
| Search / discover                         | [`specs/mobile/07 - search.md`](../mobile/07%20-%20search.md)                         |
| Profile / settings                        | [`specs/mobile/08 - profile.md`](../mobile/08%20-%20profile.md)                       |
