# Playlists (create, edit, play, delete)

**Master journey:** [`specs/api/mobile-flow.md`](../api/mobile-flow.md) — Create playlist (§5C), play sermon entry points (§5A), cross-flow add to playlist (§6), interruptions (§7), edge cases (§8), confirmations (§9).

**Scope:** User interactions for **user-created** playlists and any **default** lists (e.g. Favourites) the product treats like playlists. Signed-in only.

---

## Default vs user playlists

| Type | UX notes |
|------|-----------|
| **System / default** (e.g. Favourites) | May be non-deletable; explain in subtitle; same add/remove sermon rules |
| **User-created** | Full rename, reorder, delete |

---

## Create playlist — all paths

### Path A — From Library tab

- **FAB** or header **Create**: opens **name** screen (full screen or modal).  
- **Name validation:** empty, max length, profanity policy — inline errors.  
- **Cancel:** if text entered, **Discard changes?** modal.  
- **Create:** navigate to **empty playlist detail** with primary CTA **Add sermons**.

### Path B — From sermon (detail or card)

- **Add to playlist** → **New playlist** → same naming UI.  
- On success: either **new sermon is first item** or empty list with add flow pre-filled — **one** product rule.

### Path C — From player overflow

- Same as Path B.

---

## Add sermons to playlist

- **Picker:** search, multi-select, **Add (N)** button.  
- **Cancel:** dismiss without changes.  
- **Partial failure:** “3 of 4 added” expandable detail (master §8).

---

## Playlist detail

- **Header:** name (tap to rename), overflow (share, delete).  
- **Reorder:** drag handle; optional haptic; optional **undo** after remove row.  
- **Empty playlist:** illustration + **Add sermons** + optional **Browse topics**.  
- **Play:** starts queue from this list; show mini-player.

---

## Delete playlist

- **Confirmation modal** with playlist **name** repeated; **Delete** destructive; **Cancel** safe.  
- After delete: navigate to Library list with **toast** “Playlist deleted” optional.

---

## Share playlist

- See `05 - sharing.md`; share sheet should include **title + link** preview.

---

## Draft and app-kill behavior

- If user leaves mid-create: either **draft** appears in Library or work is **lost** — pick one and state in UI/support docs (master §7).

---

## Product ideas (optional lists)

These can appear as smart playlists or Library sections; each needs the same empty/loading/error pattern:

- Favourites (default)  
- Favourite ministers (quick jump to minister catalog)

---

## Revision history

- **2026-04-14:** Replaced stub list with full interaction spec from `mobile-flow.md` §5C.
