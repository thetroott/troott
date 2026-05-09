# Sharing (sermons, playlists, profiles)

**Master journey:** [`specs/api/mobile-flow.md`](../api/mobile-flow.md) — Cross-flow share (§6), deep link when not signed in (§3), edge cases (§8).

**Stable URLs and token links:** [`specs/api/deep-links.md`](../api/deep-links.md) (paths, teaser route, universal links, rollout).

**Scope:** What the user **shares**, from **where**, and what the **recipient** experiences when opening a link. Recipient must **sign in** to full app experience (no guest account).

---

## Shareable entities (product checklist)

- Sermon (audio link / deep link)
- Playlist
- Favourite sermons (collection or single)
- Sermon series
- Minister profile
- Listener **own** profile (if public sharing is allowed)

Each needs: **preview** (title, image, speaker), **link**, and **access** messaging if content is restricted.

---

For a **sermon audio app**, a share feature should be **simple, contextual, and meaningful**—users want to share not just “something they listened to,” but a specific sermon, passage, or moment that can be acted on by the recipient. Here’s a breakdown:

---

### **1. What the share feature should contain**

**Minimal info for context:**

- **Sermon title** – e.g., _“Faith in Times of Doubt”_
- **Speaker / minister name**
- **Series or collection name** (if applicable)
- **Cover image or thumbnail** – gives visual cue
- **App deep link / URL** – so the recipient can open the sermon directly in your app
- **Access check**: make sure the recipient has rights to view (or redirect to signup/subscription)
- **Link shortening / analytics**: optional but helps track engagement

**Example shared content (text + link):**

```
“Check out this sermon by Pastor John: Faith in Times of Doubt [Sermon Series: Daily Inspiration]. Listen here: app://sermons/123”
```

**Optional:**

- Social meta tags if sharing on social media platforms (title, description, image)

---

### **2. Algorithm / logic needed**

The sharing feature doesn’t need anything too complex, but a few **small algorithms / processes** help it feel seamless:

1. **Generate deep link for the sermon**

- Take the sermon ID, optional timestamp, and encode into a URL scheme:
- On the recipient device, the app reads this and jumps to the correct sermon and timestamp.

2. **Optionally generate a snippet for social sharing**

- Pick **a 1–2 sentence quote** or **auto-trim an audio snippet** if you allow sharing audio snippets:
    - Extract text from sermon transcript → select sentence(s) near current playback
    - Or clip a small audio segment → encode to shareable format

3. **Handle URL shortening / tracking** (optional)

- If sharing outside the app (messaging, social media), create short links for analytics:
- Backend maps `abc123` to sermon ID + timestamp

4. **Check permissions / content access**

- If some sermons are premium/subscription-only, only allow share if recipient has access, or direct them to subscription page.

---

### **3. UX considerations**

- **Always include a preview** (title, speaker, series, image). Users want to know what they’re sharing.
- **Allow copying link or sharing to apps** (WhatsApp, Messenger, email, social).
- **Optional timestamp inclusion**: give the user a toggle “Share from current point” or “Share full sermon.”
- **Avoid sending raw audio files** unless it’s a small snippet; most users prefer links.

---

## Recipient opens link (not signed in)

- Show **app install** CTA if needed, then **Sign up / Log in**; after auth, open **target content** (master §3).
- If content is **paywalled:** clear message + **Subscribe** or **Preview** per product.

---

## Sender errors

- **Share sheet fails:** toast “Couldn’t share” + **Copy link** fallback.
- **Link generation fails:** retry; do not show broken `null` link.

---

## Revision history

- **2026-04-14:** Structured with master doc link; added recipient and error UX.
