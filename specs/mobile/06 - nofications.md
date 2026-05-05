# Notifications (push and in-app)

**Master journey:** [`specs/api/mobile-flow.md`](../api/mobile-flow.md) — Push permission gap (§11 item 10), deep link entry (§3), feedback (§9).  
**Stable links and universal links:** [`specs/api/deep-links.md`](../api/deep-links.md).  
**Filename note:** File is `06 - nofications.md` (typo); prefer renaming to `06 - notifications.md` when convenient.

**Scope:** When the app asks for **permission**, what **notification taps** do, and in-app **toggle** behavior. User experience only.

---

## OS permission strategy

| Strategy         | User experience                                                                                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Just-in-time** | Ask for push when user turns on a notification type that needs it, or after first **meaningful** action (e.g. first save) — explain _why_ (“Get reminded of new sermons from ministers you follow”). |
| **Onboarding**   | Ask during optional onboarding step with skip — skip means pushes off until changed in Settings.                                                                                                     |
| **Never nag**    | If user denies twice, stop system prompts; direct to **Settings app** with deep link instructions only when user tries to enable push in-app.                                                        |

Pick **one** primary strategy; document in master §11 closure.

---

## Notification tap → app

| Payload type                      | User lands on                               |
| --------------------------------- | ------------------------------------------- |
| New sermon from followed minister | Sermon detail or play (product rule)        |
| Generic marketing                 | Home or campaign screen                     |
| Broken / stale link               | Friendly “Content unavailable” + **Browse** |

**Signed out:** tap opens app → **Sign in** → then resolve deep link if still valid (master §3 deep link).

---

## In-app notification center (if product has inbox)

- List grouped by date; **mark read** on open or swipe.
- **Clear all** with confirm.
- **Empty:** “No notifications yet.”

---

## Settings toggles

- Each toggle reflects **OS permission**: if OS denied, toggle shows off and **Open Settings** helper when user tries to enable.
- **Loading** on toggle while syncing to server; **revert** on failure with toast.

---

## Do not

- Request push on first frame after install with no context.
- Show duplicate toasts for same server event.

---

## Revision history

- **2026-04-14:** Populated from `mobile-flow.md` gaps; noted filename typo.
