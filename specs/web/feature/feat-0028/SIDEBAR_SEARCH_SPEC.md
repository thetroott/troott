# feat-0028: Sidebar search — searchable items and behavior

Normative contract for the Troott web **Quick Search** command palette (`SearchForm` → `CommandDialog`). Extends [feat-0002 § I Search](../feat-0002/PRODUCT.md) with a full inventory of searchable entities, role gates, and navigation rules.

---

## 1. Purpose

The sidebar search is a **command palette**, not an in-page filter. It answers:

1. **Where can I go?** — same destinations as sidebar + deep onboarding/upload steps.
2. **What can I do?** — primary studio actions (Create sermon).
3. **Which sermon did I mean?** — title/tag/topic search against the signed-in minister’s library and bin.

It must **never** navigate on open; only **explicit result selection** (click or Enter) performs navigation or an action.

---

## 2. Entry points and shell

| Entry | Behavior |
| ----- | -------- |
| Sidebar **Quick Search** field (expanded) | Click → open palette, focus input |
| Sidebar search icon (collapsed) | Click → open palette |
| **⌘K** / **Ctrl+K** (global while portal mounted) | Toggle palette |
| Typing in sidebar field | **Not supported in v1** — field stays `readOnly`; all querying happens inside the dialog |

**Shell:** existing shadcn `CommandDialog` + `CommandInput` placeholder:

`Search Troott…` or `Type a command or search…`

**On select:** close dialog, then `navigate(href)` or run action callback.

**On empty query:** show static groups only (Navigation, Actions, Get Started when applicable). No sermon API call.

---

## 3. Role visibility (mirror sidebar)

Same rules as [feat-0002 Resolved product decisions](../feat-0002/PRODUCT.md):

| User type | Static groups shown |
| --------- | ------------------- |
| **Minister** | Main (+ Get Started if onboarding incomplete) |
| **Creator** | Same as minister |
| **Admin** | Admin only — **no** Main, Actions (studio), Upload wizard, or sermon content |
| **Super-admin** | Admin + Main (+ Get Started never — admins skip onboarding) |

Implementation must reuse `isSidebarGroupVisibleForUser` and Get Started sidebar gating (`showOnboarding`, onboarding completion from minister/creator context).

---

## 4. Gating and disabled items

| Condition | Studio destinations (Dashboard, Sermons, Analytics, Bin, upload steps, Create sermon, sermon search) |
| --------- | -------------------------------------------------------------------------------------------------------- |
| Onboarding **incomplete** (minister/creator) | **Disabled** in palette with subtitle: `Finish Get Started first` — OR navigate to `/get-started` on select (product choice: **disabled preferred** so user stays in palette) |
| Onboarding incomplete | Get Started hub + sub-steps **enabled** |
| **No studio code** in session/storage | Studio-scoped hrefs **disabled**; subtitle: `Studio not ready` |
| **Admin** role | All Main/studio items **hidden** (not merely disabled) |
| **No minister/creator id** for sermon API | Sermon group hidden; static nav still works |

Disabled items appear in results when the user’s query matches, but are not selectable (`aria-disabled`, no navigation).

---

## 5. Result groups and default order

When the query is empty, show groups in this order (omit empty groups):

1. **Actions**
2. **Navigation**
3. **Get Started** (onboarding incomplete only)
4. **Upload wizard** (onboarding complete + studio code present)

When the query is non-empty:

1. **Sermons** (dynamic, if `q.length >= 2` and minister id known)
2. **Actions** (static matches)
3. **Navigation** (static matches)
4. **Get Started** / **Upload wizard** (static matches)
5. **Settings** (static matches, v1)

Within a group, sort by **match score** (§8), then alphabetical title.

---

## 6. Complete searchable inventory — v1

Each row: **Title** (display), **Keywords** (extra match tokens), **Destination / action**, **Roles**, **Gate**.

Legend — **Roles:** `M` minister, `C` creator, `A` admin, `S` super-admin.  
**Gate:** `OB` onboarding incomplete only, `OB✓` onboarding complete, `SC` studio code required, `—` none.

### 6.1 Actions

| ID | Title | Keywords | Destination / action | Roles | Gate |
| -- | ----- | -------- | -------------------- | ----- | ---- |
| `action.create-sermon` | Create sermon | upload, new sermon, add sermon, post | Open **Create sermon** entry modal (`useCreateSermonEntry`) — same as My Sermons | M, C, S | OB✓, SC |
| `action.upload-sermon` | Upload sermon | upload, audio, file | Alias of Create sermon (same handler) | M, C, S | OB✓, SC |

**Not in v1:** Log out (keep in sidebar footer + avatar menu only — destructive/session actions out of command palette).

### 6.2 Navigation — Main (studio-scoped via `resolveStudioNavUrl`)

| ID | Title | Keywords | Resolved path | Roles | Gate |
| -- | ----- | -------- | ------------- | ----- | ---- |
| `nav.get-started` | Get Started | onboarding, setup, launch, verify, checklist | `/get-started` | M, C | OB |
| `nav.dashboard` | Dashboard | home, studio home, overview | `/studio/{code}` | M, C, S | OB✓, SC |
| `nav.sermons` | Sermons | my sermons, library, catalog, all sermons | `/studio/{code}/sermons` | M, C, S | OB✓, SC |
| `nav.analytics` | Analytics | stats, metrics, plays, listeners, insights | `/studio/{code}/analytics` | M, C, S | OB✓, SC |
| `nav.bin` | Bin | trash, deleted, recycle, removed | `/studio/{code}/bin` | M, C, S | OB✓, SC |
| `nav.profile` | Profile | public profile, bio, avatar, identity, listener view | `/profile` | M, C, S | — |
| `nav.settings` | Settings | account, email, password, security, deactivate | `/settings` | M, C, S | — |

**Aliases:** “My Sermons” → Sermons; “Trash” / “Recycle bin” → Bin.

### 6.3 Navigation — Admin

| ID | Title | Keywords | Path | Roles | Gate |
| -- | ----- | -------- | ---- | ----- | ---- |
| `nav.admin.home` | Admin | platform, admin home | `/admin` | A, S | — |
| `nav.admin.users` | Users | all users, accounts, ministers, creators | `/admin/users` | A, S | — |
| `nav.admin.sermons` | Sermons (admin) | platform sermons, all sermons, moderation | `/admin/sermons` | A, S | — |

**Not in v1:** `/admin/sermons/minister/:ministerId` — no stable search target until admin UI exposes minister picker.

### 6.4 Get Started — hub items

Source: [`OnboardingItems`](../../../../apps/web/src/_data/onboarding.tsx). Shown only while Get Started sidebar item is visible.

| ID | Title | Keywords | Path | Gate |
| -- | ----- | -------- | ---- | ---- |
| `ob.hub.verify` | Verify your account | kyc, identity, verification, documents | `/get-started/verify-account` | OB |
| `ob.hub.profile` | Complete your profile | address, ministry, profile setup | `/get-started/home-address` | OB |
| `ob.hub.tour` | How to use Troott | tour, tutorial, guide, walkthrough | `/get-started/tour-guide` or studio tour launch path when code exists | OB |
| `ob.hub.upload-first` | Upload first sermon | first sermon, launch | `/studio/{code}/sermons/upload` | OB, SC |

### 6.5 Get Started — verification sub-steps

| ID | Title | Keywords | Path |
| -- | ----- | -------- | ---- |
| `ob.step.personal-info` | Personal information | name, dob, personal | `/get-started/verify-account/personal-information` |
| `ob.step.document` | Document verification | id, passport, license | `/get-started/verify-account/verify-document` |
| `ob.step.document-tips` | Document tips | photo, guidelines | `/get-started/verify-account/verify-document/select` |
| `ob.step.upload-method` | Upload method | camera, scan | `/get-started/verify-account/verify-document/document1` |
| `ob.step.document-upload` | Upload document | submit document | `/get-started/verify-account/verify-document/upload` |

### 6.6 Get Started — profile sub-steps

| ID | Title | Keywords | Path |
| -- | ----- | -------- | ---- |
| `ob.step.home-address` | Home address | address, location | `/get-started/home-address` |
| `ob.step.ministry` | Ministry profile | church, ministry, organization | `/get-started/ministry-input` |

### 6.7 Upload wizard steps (studio)

Same steps as onboarding item 4 and [feat-0008](../feat-0008/PRODUCT.md) wizard. **Navigation only** — does not open modal or start upload.

| ID | Title | Keywords | Path |
| -- | ----- | -------- | ---- |
| `upload.file` | Upload file | audio, progress, select file | `/studio/{code}/sermons/upload/file` |
| `upload.details` | Sermon details | title, description, tags | `/studio/{code}/sermons/upload/details` |
| `upload.thumbnail` | Thumbnail and preview | cover, image, preview | `/studio/{code}/sermons/upload/thumbnail` |
| `upload.publish` | Publish settings | visibility, schedule, publish | `/studio/{code}/sermons/upload/publish` |

**Gate:** OB✓, SC. Useful for resuming an in-progress wizard via URL.

### 6.8 Settings sections (v1 — page-level)

| ID | Title | Keywords | Destination |
| -- | ----- | -------- | ----------- |
| `settings.profile-info` | Profile information | name, email, update profile | `/settings` |
| `settings.password` | Update password | change password, security | `/settings` |
| `settings.delete-account` | Delete account | deactivate, remove account | `/settings` |

**v2:** hash anchors or scroll-to-section inside `/settings` ([feat-0012](../feat-0012/PRODUCT.md)).

### 6.9 Profile (v1 — page-level)

| ID | Title | Keywords | Destination |
| -- | ----- | -------- | ----------- |
| `profile.view` | Edit public profile | bio, cover, avatar, ministry | `/profile` |

**v2:** open Edit profile dialog directly from palette.

---

## 7. Dynamic content — sermons

### 7.1 API

Reuse minister sermon list:

`GET /api/v1/sermon/minister/:ministerId?page=1&limit=8&q={query}&status={optional}`

Search semantics (server): each whitespace-separated token must match **title**, **description**, **topic**, or **tags** (case-insensitive substring) — see `ministerListSearchClause` in API repository.

### 7.2 Client rules

| Rule | Value |
| ---- | ----- |
| Min query length | **2** characters |
| Debounce | **300 ms** |
| Page size | **8** results max in palette |
| Minister id | From minister/creator context (same as My Sermons) |

### 7.3 Result row shape

| Field | Source |
| ----- | ------ |
| **Title** | Sermon title |
| **Subtitle** | `{Publication status} · {Bin if applicable}` e.g. `Draft`, `Published`, `In bin` |
| **Icon** | Book/audio icon consistent with Sermons nav |

### 7.4 Primary action on sermon row (v1)

**Open sermon** — routing per [feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md):

| Sermon state | Navigate to |
| ------------ | ----------- |
| **Draft** (library) | Upload wizard with `resumeSermonId` |
| **Published** (library) | `/studio/{code}/sermons/{id}/edit` |
| **In bin** | **No Edit** — navigate to `/studio/{code}/bin` with list filter or toast “Restore from Bin” (v1: open Bin page; v2: row highlight) |

Detection: `isSermonDraftDocument` / table row `publicationStatus` same as My Sermons.

### 7.5 Sermon secondary actions (v2)

Optional extra rows when parent sermon matches query:

| Action | When | Destination |
| ------ | ---- | ----------- |
| Analytics | Published, not in bin | `/studio/{code}/sermons/{id}/analytics` |
| Get info | Always | Open Get info modal ([feat-0020](../feat-0020/SERMON_GET_INFO_SPEC.md)) |

**Excluded from palette (stay in row menu):** Share, Download, Rename, Move to trash, Restore, Delete forever — require confirmation or clipboard APIs.

### 7.6 Bin scope

| Mode | Behavior |
| ---- | -------- |
| **Default** | Search **active library** (`status` omit or active-only per list API convention) |
| **Query contains “bin” or “trash”** | Include bin sermons (`status=bin` or parallel query) — product may show separate subheading “In bin” |

If API cannot combine scopes in one call, run **two** queries (library + bin) and merge, max 8 total.

---

## 8. Matching and ranking

### 8.1 Static items

Use cmdk default fuzzy filter on:

- `title`
- `keywords[]` (space-separated aliases)
- Optional `subtitle`

### 8.2 Dynamic sermons

Server ranks by list API sort default; client displays in API order.

### 8.3 Tie-break

Alphabetical by title within the same group.

---

## 9. Empty and loading states

| State | UI |
| ----- | -- |
| No query | Static groups only; no “No results” |
| Query &lt; 2 chars | Static matches only; no sermon API |
| Query ≥ 2, loading | Sermons group shows “Searching…” or skeleton rows |
| Query ≥ 2, zero matches | `CommandEmpty`: `No results for “{query}”` |
| API error | Toast + empty sermon group; static matches still shown |

---

## 10. Explicitly excluded (do not index)

| Item | Reason |
| ---- | ------ |
| Login, Register, Forgot password, Activate account | Public auth — user is already signed in |
| `/preview`, `/no-network`, `/unauthorized`, `*` fallback | System routes |
| Legacy paths (`/dashboard`, `/sermons`, `/upload-sermon`, …) | `LEGACY_DENIED` in `paths.ts` |
| Community | Hidden nav (`isHiddenNavItem`) |
| Series, Playlists, Comments, My-trash | Not shipped / commented out in `navdata.tsx` |
| Install Troott on | Non-navigable footer placeholder |
| Admin per-minister sermon drill-down | No stable URL without context |
| Platform user search | Admin Users page stub — **v2** when `GET /user/list` UI exists |
| Listener mobile app | Out of web portal scope |
| In-app sermon filters (date, sort, visibility) | Belong on My Sermons / Bin pages, not global palette |
| Log out | Session destructive — sidebar footer + avatar menu only |

---

## 11. Future extensions (v2+)

| Feature | Notes |
| ------- | ----- |
| **Recent** | Last 5 navigations in `localStorage` |
| **Analytics drill-down** | “Overview”, “By region” as sub-items when on analytics page |
| **Sermon actions** | Analytics, Get info, Share as nested commands |
| **Admin content search** | Users by name/email; platform sermons by title |
| **Profile / Settings deep links** | Scroll to password section |
| **Tour restart** | Action when onboarding complete |
| **Keyboard shortcuts** | Display shortcuts only when bound (no fake ⌘N) |

---

## 12. Accessibility and keyboard

- Focus trap in dialog while open.
- **↑ / ↓** move selection; **Enter** activates.
- **Escape** closes without navigation.
- Disabled items: skipped by Enter or announced as unavailable.
- Group headings visible to screen readers via `CommandGroup heading`.

---

## 13. Acceptance criteria

1. All **§6** v1 items searchable by title and listed keywords for the correct roles.
2. Admin user never sees Main/studio/sermon groups.
3. Minister with incomplete onboarding sees Get Started items enabled and studio items disabled with reason.
4. Sermon search fires only at ≥ 2 characters after debounce.
5. Draft sermon result opens upload wizard; published opens edit page ([feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md)).
6. Placeholder items (“New folder”, “Go to apps”, …) removed.
7. Opening palette alone does not change route ([feat-0002 #42](../feat-0002/PRODUCT.md)).
8. ⌘K / Ctrl+K toggles palette from any portal route with sidebar mounted.

---

## 14. Related specs

- [feat-0002](../feat-0002/PRODUCT.md) — sidebar + search affordance
- [feat-0010](../feat-0010/PRODUCT.md) — Get Started routes
- [feat-0012](../feat-0012/PRODUCT.md) — Settings sections
- [feat-0017](../feat-0017/PRODUCT.md) — Analytics page
- [feat-0019](../feat-0019/PRODUCT.md) — Library + bin CRUD
- [feat-0020](../feat-0020/SERMON_GET_INFO_SPEC.md) — Get info (v2 action)
- [feat-0023](../feat-0023/SERMON_ANALYTICS_SPEC.md) — Per-sermon analytics (v2 action)
- [feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md) — Edit routing for sermon results
- [TECH.md](./TECH.md) — implementation layout
