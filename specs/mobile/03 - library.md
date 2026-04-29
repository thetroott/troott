# Library (saved sermons, history, organization)

**Master journey:** [`specs/api/mobile-flow.md`](../api/mobile-flow.md) — Save / library (§5B), empty library (§8), browse (§5D), cross-flow save (§6), feedback (§9).

**Scope:** The **Library** tab: saved sermons, listening history, favourite ministers, sorting and filtering — **user-visible behavior only**. Requires **signed-in** user; no guest library.

---

## Tab purpose

Central place for **“my content”**: things the user explicitly saved plus **history** (recently played) if the product surfaces it here vs only on Home.

---

## Sections and sorting (product surface)

The app may combine or separate these; each needs **empty state**, **loading skeleton**, and **error + Retry**.

| Area | User goal | Empty state |
|------|-----------|----------------|
| **Saved / liked sermons** | Re-open sermons they care about | Illustration + **Browse** + **Search** (master §8) |
| **Listening history** | Resume something they started | “Nothing played yet” + link to Home |
| **Favourite ministers** | Jump back to a speaker | “Follow ministers from sermon cards” + Browse |
| **Default / smart lists** | e.g. “Favourites playlist” if product maps playlist here | Explain what the list is + CTA to add |

### Sort and filter (if offered)

- **Sort by:** Recently played, date saved, title A–Z, minister name — exposed as sheet or dropdown.  
- **Apply:** updates list with **skeleton** during fetch; **Reset** clears sort to default.  
- **Active sort** indicator on Library header.

---

## Saving and unsaving (from Library context)

- **Toggle save** on a row or detail: optimistic icon or confirmed spinner (one product-wide pattern).  
- **Undo** snackbar after save where safe.  
- **Remove** from saved: usually **no** confirmation; optional undo toast.

---

## Entry points into other flows

- **Tap sermon row:** detail → play (same rules as Home).  
- **Add to playlist:** bottom sheet consistent everywhere (master §6).  
- **Share:** from row overflow or detail (`05 - sharing.md`).

---

## Offline

- **Banner** when offline.  
- Saved items that are **not** downloaded: row may show **download** icon or “Unavailable offline” with tap explaining need for network or download.

---

## Interruptions

- Leave Library mid-scroll: position optional to restore (nice-to-have).  
- Pull-to-refresh while offline: show offline message, do not fake success.

---

## Revision history

- **2026-04-14:** Expanded from stub bullets; aligned with `mobile-flow.md`.
