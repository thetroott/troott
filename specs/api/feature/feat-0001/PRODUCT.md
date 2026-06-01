# feat-0001: Organization, branch, and minister hierarchy (API)

## Summary

Troott is evolving from a **sermon upload + minister profile** API into **Christian media and ministry infrastructure**. Real churches and networks are hierarchical (diocese → cathedral → vicar), not a flat `Minister → embedded ministry fields` graph.

This spec defines the **target domain model** for `apps/api`:

```txt
Organization  →  has many  →  Branch  →  has many  →  MinisterAssignment  →  Minister (person)
```

It also documents **how the current codebase maps** to that model, what to build first, and what must not break (studios, sermons, web Get Started).

## Problem

Today, organizational identity is **denormalized onto people and channels**:

- `IMinisterDoc.profile` carries `ministryName`, `ministryLogo`, `ministryType`, `ministryHQLocation`, org phone/email/website/socials ([`minister.interface.ts`](../../../../apps/api/src/interfaces/core/minister.interface.ts), [`minister.model.ts`](../../../../apps/api/src/models/core/minister.model.ts)).
- `IStudioDoc` repeats the same `profile.*` ministry fields and adds `parentStudio`, `members`, invites ([`studio.interface.ts`](../../../../apps/api/src/interfaces/core/studio.interface.ts)) — closer to **Branch + team** but still not a first-class **Organization**.
- Web Get Started **ministry-input** writes those embedded fields via `minister.updateMinister` ([feat-0010](../../web/feature/feat-0010/PRODUCT.md)).

That breaks down for:

- One organization, many branches, many ministers (RCCG, Anglican diocese).
- Co-leaders on one ministry brand (e.g. shared ministry, different ministers).
- Ministers changing branch/role over time (history).
- Canonical discovery (“RCCG” vs “Redeemed Church” duplicates).
- Organization-owned admins (ministers must not implicitly own the whole org).

## Non-goals (this feature)

- Full multi-tenant billing per organization (later).
- Province/region trees and deep hierarchy UI (later; `parentBranch` is enough for v1).
- Replacing **Studio** as the **content publishing** surface (sermons stay studio-scoped).
- Mobile listener app org browsing (separate spec).
- Implementing every endpoint in one release — this spec phases delivery.

## Consumer

- **Platform admins** — verify canonical organizations/branches.
- **Organization owners** — create org, branches, invite ministers.
- **Ministers / creators** — claim affiliation, upload under studio.
- **Internal agents** — migrations, search, analytics.

---

## Real-world mapping

### Anglican

| Layer | Example |
|-------|---------|
| Organization | Church of Nigeria (Anglican Communion) / Ibadan Anglican Diocese |
| Branch | St. James Cathedral, All Saints Anglican Church |
| Minister | Vicar, Assistant Priest |
| Assignment role | `vicar`, `assistant_priest` |

### Pentecostal

| Layer | Example |
|-------|---------|
| Organization | RCCG |
| Branch | RCCG City of David, RCCG Jesus House |
| Minister | Pastor A, Pastor B |
| Assignment role | `lead_pastor`, `assistant_pastor` |

### Independent / network

| Layer | Example |
|-------|---------|
| Organization | Eternity Network International |
| Branch | Koinonia Abuja, Koinonia Zaria |
| Minister | Joshua Selman, resident pastors |
| Assignment role | `founder`, `lead_pastor`, `teacher` |

---

## Data models (exact shapes)

Field-level interfaces, enums, and Mongoose schemas for all new collections plus minister evolution:

**[`MODELS.md`](./MODELS.md)**

Covers: `Organization`, `Branch`, `MinisterAssignment`, `OrganizationMember`, `AffiliationRequest`, `DbModels` entries, indexes, and phase 1 / phase 2 `Minister.profile`.

---

## Target domain (four core entities)

### 1. Organization

Top-level umbrella: denomination, network, diocese, ministry brand.

- Examples: RCCG, Anglican Diocese of Ibadan, Agape Christian Ministries.
- **Owned by members** (users with org roles), not by a single minister document.
- May be **platform-verified** (canonical) or **user-created** (organic growth).

### 2. Branch

Local presence under an organization:

- Parish, church, campus, cathedral, assembly.
- Examples: St. James Cathedral, RCCG City of David.
- Optional `parentBranch` for sub-campuses (matches existing `parentStudio` pattern conceptually).
- **Published** / **verified** flags for discovery.

### 3. Minister

The **human** content producer (existing entity, slimmed over time):

- Identity, verification, personal bio, languages, avatar.
- Linked to `User` for auth.
- Linked to **Studio** for sermon publishing (unchanged product rule).
- **Does not** own organization data long-term.

### 4. MinisterAssignment (relationship engine)

Links minister ↔ organization ↔ optional branch:

```txt
Minister  ←——  MinisterAssignment  ——→  Organization
                      ↓
                   Branch (optional)
```

- Fields: `role`, optional `title`, `startDate`, `endDate`, `active`.
- Supports history (moved from St John's to St James).
- A minister may have **multiple assignments** (guest, former, current).

### Organization membership (admins)

Separate from minister assignment:

```txt
OrganizationMember: user + organization + role (OWNER, ADMIN, EDITOR, …)
```

Ministers **never** auto-own organizations on signup.

---

## Ownership and verification (product)

### Two organization sources

| Type | Who creates | Purpose |
|------|-------------|---------|
| **Canonical** | Platform admin | RCCG, Anglican Communion — dedupe search |
| **User-created** | Org signup flow | New networks scale organically |

### Verification

- `organization.verified` / `branch.verified` — trust badge, discovery priority.
- `minister.verification` — existing KYC flow (unchanged scope).

### Canonical deduplication

Before create, search canonical org/branch by name + denomination + HQ region; suggest merge/link instead of duplicate “RCCG HQ” / “Redeemed Church”.

---

## Dashboard flows (product)

### Scenario A — Individual minister signup

```txt
Sign up → minister profile → search organization → request affiliation → org admin approves → assignment active
```

### Scenario B — Organization signup

```txt
Create organization → create branches → invite ministers → assignments with roles
```

### Scenario C — Platform seeds diocese

```txt
Admin creates Organization (diocese) → creates branches → invites vicars
```

---

## How this fits the **current** API (as-is)

| Target concept | Current implementation | Gap |
|----------------|------------------------|-----|
| **Organization** | *None* (`DbModels` has no `ORGANIZATION`) | New collection + APIs |
| **Branch** | **Partial:** `Studio` with `StudioType.CHURCH_BRANCH`, `parentStudio`, public profile | Studio is **content channel**, not org registry; ministry fields duplicated |
| **Minister** | **`Minister`** model + `User` | Org fields embedded in `profile.*` |
| **MinisterAssignment** | *None* | New collection |
| **Org admin** | **Partial:** `Studio.members` + `StudioRole` (OWNER, ADMIN, …) on **users** | Scoped to studio, not organization |
| **Publishing** | **Studio** ← minister/creator `studio` ref; sermons under studio | Keep; link branch ↔ studio optionally |

### Studio vs Branch (critical distinction)

| | **Studio** (today) | **Branch** (target) |
|--|-------------------|---------------------|
| Purpose | YouTube-style **publishing** identity | Real-world **church/campus** registry |
| Content | Sermons, playlists, series | None directly (links to studio) |
| Members | Users with upload roles | Ministers with ministry roles |
| Hierarchy | `parentStudio` | `parentBranch` under organization |

**Recommendation:** Keep **Studio** for media. Add **Branch** for org structure. Optionally `branch.studioId` (or `studio.branchId`) to connect them — one branch may have one primary studio for uploads.

### Embedded “ministry” fields (migration source)

These on `IMinisterDoc.profile` / `IStudioDoc.profile` move to **Organization** or **Branch** over time:

- `ministryName`, `ministryLogo`, `ministryType`, `ministryHQLocation`
- Org-level `phoneNumber`, `email`, `websiteUrl`, `socials` (when they describe the church, not the person)

Stay on **Minister**:

- `ministerialName`, `description`, `languages`, `avatar`, `banner`, personal `country`, verification, `monthlyListeners`, sermons/playlists refs

### Web Get Started touchpoint

[`get-started-checkpoint`](../../../../apps/web/src/services/get-started-checkpoint.ts) `ministry-input` today updates `minister.profile.ministryName` etc. **Phase 1** can keep writing embedded fields. **Phase 2** should create/link **Organization + Branch + Assignment** (or link to canonical org) instead.

### Note on `ministry.interface.ts`

The file [`apps/api/src/interfaces/core/ministry.interface.ts`](../../../../apps/api/src/interfaces/core/ministry.interface.ts) in the repo currently mirrors minister-shaped data (including `members`) and is **not** a separate Mongoose ministry collection. Treat it as **draft / misplaced** until split into `organization.interface.ts` + `branch.interface.ts` per TECH spec.

---

## Phased delivery

### Must have now (MVP domain)

| Deliverable | Notes |
|-------------|--------|
| `Organization` model + CRUD (admin + owner) | Verified flag, slug, category + optional denomination |
| `Branch` model + CRUD under org | `branchType`, location, link to `organization` |
| `MinisterAssignment` model | minister + org + optional branch + role + active |
| Read APIs for minister “my assignments” | Powers profile + affiliation UI |
| Affiliation request / approve (minimal) | Minister requests; org admin approves |
| Seed / canonical org tooling (admin) | Prevent duplicate RCCG |

### Must have now (roles)

| Role | Scope |
|------|--------|
| Organization OWNER / ADMIN | Manage org, branches, approve assignments |
| Branch admin (optional v1) | Manage one branch’s ministers |
| Minister | Person account; assignment role at branch |

### Can wait

- Full region/province trees
- Assignment history UI and analytics
- Org-level billing
- Transfer workflows between branches
- Replacing studio member model entirely
- Search ranking by org size

---

## Acceptance criteria (product)

- [ ] A minister can belong to an organization/branch via **assignment**, not only embedded `profile.ministryName`.
- [ ] One organization has many branches; one branch has many minister assignments.
- [ ] Organization admins are **users** on the org, not implied by minister record.
- [ ] Canonical organizations can be marked verified and deduped on create.
- [ ] Existing minister signup + studio + sermon publish continues to work during migration.
- [ ] Get Started ministry step can eventually target branch/org instead of embedded profile only.

---

## Open questions

1. Is **Branch** 1:1 with **Studio**, or can one branch have multiple studios (e.g. youth vs main channel)?
2. Should **Creator** personas use the same assignment model or studio-only?
3. Default assignment on minister register: auto-create personal org + branch, or require explicit affiliation?
4. Anglican **diocese** as Organization with churches as Branch — confirm enum `OrganizationCategory` vs `denomination` string.

---

## Related specs

- [MODELS.md](./MODELS.md) — exact `I*Doc` + Mongoose schemas
- [feat-0010 Web Get Started](../../web/feature/feat-0010/PRODUCT.md) — collects embedded ministry fields today.
- [feat-0006 Web studio CRUD](../../web/feature/feat-0006/PRODUCT.md) — publishing remains studio-scoped.
- [`specs/api/minister-flow.md`](../minister-flow.md) — minister UX (web); update when org flows ship.
