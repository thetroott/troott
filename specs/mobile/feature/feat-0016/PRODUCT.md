# feat-0016: Minister profile (API-backed)

## Summary

Replace hardcoded minister metadata and discovery-catalog filtering on **`/minister/[id]`** with **API-backed** minister identity and sermon lists.

Complements [feat-0005](../feat-0005/PRODUCT.md) (discovery), [feat-0006](../feat-0006/PRODUCT.md) (search).

## Problem

`components/features/minister/profile.tsx` uses:

- Static `MINISTERS` map (3 fake profiles).
- `useSermonsCatalog()` + name alias filter, or `_mock/tracks` fallback.
- Follow button with **no API**.

Hooks `useMinisterByIdQuery` and `useSermonsByMinisterQuery` exist but are **unused**.

## Goals

1. Minister header (name, church, image, stats) from API.
2. Sermon rails (top, latest, playlists sections) from **`GET /sermon/minister/:ministerId`** (+ stats sub-routes as needed).
3. Route param `id` accepts Mongo id or public slug (match API resolution).
4. Remove `_mock/tracks` fallback from minister profile.
5. Follow button: product decision (library ministers vs listener field) — see open questions.

## Non-goals

- Minister studio / upload (web-only).
- Full social graph / messaging.

## Consumer

Signed-in listeners viewing minister from search, home, or sermon sheet.

## Behavior

1. Navigate to `/minister/[id]` with real minister id from search/discovery.
2. Show skeleton while minister + sermons load.
3. **404 minister:** empty state + back navigation.
4. **Play** on row uses engine queue (existing).
5. **About** section uses API bio when available; hide empty fields.
6. **Similar ministers** may remain discovery-derived (P1) or search ministers by topic.

## Resolved decisions

| # | Topic | Decision |
| - | ----- | -------- |
| 1 | **`GET /minister/:id` missing** | **API P0 for this feat.** Add public read DTO; interim **Option B**: pass minister embed from search navigation params. |
| 2 | Follow minister | **`PUT /library/user/:userId`** — append/update `type: minister` item (same upsert pattern as feat-0013). |
| 3 | Stats line (“600K monthly audience”) | **From API only:** `minister.monthlyListeners` (+ optional follower count when exposed). Format client-side (`formatAudienceCount`); **hide row** if null/0 — no hardcoded copy. |
| 4 | Sermon sub-routes | **P0:** `most-played`, `recently-published`. **P0 also:** `most-liked`. **P1:** `most-shared`. |

## Per-screen recommendations

Route: `/minister/[id]` → `components/features/minister/profile.tsx`

| Section / component | P0 data source | P1 | Notes |
| ------------------- | -------------- | -- | ----- |
| Header (avatar, name, church) | `GET /minister/:id` | — | Remove `MINISTERS` map |
| Audience / followers subtitle | `monthlyListeners` from minister DTO | Follower count when API adds field | Never use mock “600K” string |
| Follow button | `PUT /library` minister item | — | Optimistic + sync like favorites |
| `TopSermons` | `GET /sermon/minister/:id/most-played` | — | Replace catalog filter |
| Most liked rail (if in Figma) | `GET /sermon/minister/:id/most-liked` | — | **Include in P0** — route exists on API |
| `LatestRelease` | `GET /sermon/minister/:id/recently-published` | — | |
| `MinisterMadePlaylist` | Minister playlists from minister DTO or `GET /playlist?minister=` | — | Confirm playlist list on minister payload |
| `PlaylistsFeaturedOn` | Discovery / search | — | Defer if no minister-scoped API |
| `AboutSection` | `profile.description`, `ministryName`, socials from minister DTO | — | Hide empty fields |
| `SimilarMinisters` | Discovery home rails filtered by topic | `GET /search/ministers?q=` | **P1** — stays discovery until recommendation API |
| Most shared rail | — | `GET /sermon/minister/:id/most-shared` | P1 optional section |
| Play actions | Engine queue (unchanged) | — | |

## Open questions

| # | Question | Status |
| - | -------- | ------ |
| 1 | **`GET /minister/:id` missing on API** | **Resolved:** add API (preferred) or param pass-through interim |
| 2 | Follow minister | **Resolved:** library minister item via PUT |

## Acceptance criteria

1. Real minister from search opens profile with correct name/image (not `MINISTERS` map).
2. Sermon list matches minister id (not alias filter on home catalog).
3. No import of `@/_data/_mock/tracks` in minister profile.
4. Loading and error states on profile screen.

## Related docs

- [`TECH.md`](./TECH.md)
