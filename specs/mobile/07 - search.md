# Search and discover (find sermons)

**Master journey:** [`specs/api/mobile-flow.md`](../api/mobile-flow.md) — Browse / discover (§5D), empty and error states (§8), navigation (§2), cross-flow (§6).

**Scope:** Search tab or modal, **topic/category** browsing, filters. User-facing only. Signed-in users may get personalized suggestions; **no guest** — if search requires auth, unauthenticated users see **Sign in** before results.

---

## Search field

- **Focus:** keyboard opens; placeholder clear (“Search sermons, speakers…”).  
- **Clear (X):** clears query and **results**; restores default landing (trending, recent searches, or empty).  
- **Submit:** on keyboard Go or search icon; **loading** state on results list.

---

## Suggestions and recent

- **Suggestions** while typing: tap replaces query or appends — **one** rule globally.  
- **Recent searches:** list with timestamps optional; tap runs search again.  
- **Clear all recents:** confirmation **Clear all recent searches?**

---

## Results list

- **Skeleton** on first load; **pagination** or infinite scroll with footer loader.  
- **End:** “You’re up to date” or natural list end.  
- **No results:** supportive illustration + **Try different words** + **popular topic chips**; if filters active, prominent **Clear filters**.

---

## Filters

- Opened as **bottom sheet** or full screen.  
- **Apply:** closes sheet, applies chips, results refresh with skeleton.  
- **Reset:** clears all filters, refreshes.  
- **Active filter count** badge on search bar when filters on.

---

## Category / topic browse

- Grid or list of categories → tap pushes **topic rail**; **Back** returns to grid.  
- Same loading/empty/error pattern as search results.

---

## From search to play and save

- **Tap result:** sermon detail or immediate play per product consistency with Home.  
- **Save / playlist / share:** identical overflow and sheets as elsewhere (master §6).

---

## Offline search

- If search requires network: **banner** + disabled field or tap shows “Search needs internet”.  
- If offline index exists (advanced): show scope in UI (“Offline library only”).

---

## Revision history

- **2026-04-14:** Authored from `mobile-flow.md` §5D.
