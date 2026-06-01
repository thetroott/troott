# Home tab and first-load experience

**Feature contracts:** Shell [`feat-0003`](feature/feat-0003/PRODUCT.md) · Home rails [`feat-0005`](feature/feat-0005/PRODUCT.md)

**Master journey:** [`specs/api/mobile-flow.md`](../api/mobile-flow.md) — First Home load (§4E), entry when returning onboarded (§3), play/save entry points (§2, §5), offline and edge cases (§8).

**Stable links:** After onboarding, if the user opened a shared universal link before sign-in, the app should resume the pending target (sermon / playlist / minister) instead of a generic Home landing when policy allows — see [`specs/api/deep-links.md`](../api/deep-links.md).

**Scope:** The **Home** surface after onboarding and pre-Home gates: rails, personalization, empty states, refresh, and first-time education. **No guest account:** Home and personalized rails require a **signed-in** session.

---

## Tab shell

- Default tab on cold open for a fully onboarded user: **Home**.
- **Mini-player** sits above tab bar when audio is active; tap expands full player (master doc §5A).
- **Session expired:** user is **not** left on Home with stale data — redirect to **Sign in** with optional “Session expired” copy.

---

## First load (skeleton and content)

### Loading sequence

1. **Skeleton** placeholders for each horizontal rail (matching final card height to avoid layout jump).
2. As data arrives, rails fill; failed rail shows **inline retry** for that section only (not whole screen error unless all fail).

### Empty personalized rails

- Never a blank gap: **headline** (“Discover sermons”) + **Browse** / **Search** secondary actions.
- First-time user: optional **one** dismissible coach mark pointing at primary action (not blocking every session).

### Returning user

- Fewer or zero tooltips.
- **Continue listening** row when history exists (see `02 - continue-listening.md`).

---

## Pull-to-refresh

- Standard pull gesture on Home scroll container.
- **Refreshing:** indicator at top; **success** silent or subtle “Updated”.
- **Offline:** banner **You’re offline**; if cached snapshot exists, show **Cached** label on feed; **Retry** when online.
- **Error with no cache:** message + **Retry**; do not clear previous good cache without user action.

---

## Rails and cards (interaction)

- **Tap card:** navigate to sermon detail or start play per product (single tap = play vs tap for detail — be consistent).
- **Long-press** (if supported): overflow menu (save, add to playlist, share) — only if discoverable (hint or first-run tip).
- **Infinite scroll** at bottom of vertical feed: loading row, then **end** state “You’re up to date.”

---

## Cross-entry from Home

| User intent     | Entry on Home                                |
| --------------- | -------------------------------------------- |
| Play            | Hero rail, topic rail, chart cards           |
| Save            | Card overflow, detail (from Home navigation) |
| Add to playlist | Same bottom sheet as elsewhere (master §6)   |
| Open minister   | Tap minister name/avatar on card             |

---

## Edge cases

- **Double pull-to-refresh:** second refresh waits for first to finish or is ignored.
- **Tab switch during refresh:** refresh completes or cancels safely without crash.
- **Empty entire Home** (no catalog): rare global empty state with **Browse** and support link.

---

## Revision history

- **2026-04-14:** Authored from `mobile-flow.md` §4E and §3.
