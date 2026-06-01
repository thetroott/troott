# Profile and account settings (listener)

**Feature contract:** [`feature/feat-0009/PRODUCT.md`](feature/feat-0009/PRODUCT.md) · [`feature/feat-0009/TECH.md`](feature/feat-0009/TECH.md)

**Master journey:** [`specs/api/mobile-flow.md`](../api/mobile-flow.md) — Listener identity after Home, feedback (§9), security/session (§3, `00 - security.md`), no guest model (master intro).

**Scope:** **Profile** tab: view/edit profile, **taste and preferences**, notifications, legal, sign out, account danger zone. All screens assume **signed-in** user.

---

## Profile overview

- **Avatar:** tap to change (picker, crop rules, progress, error).
- **Display name** and bio: inline edit or **Edit profile** screen; **Save** disabled until dirty; **Discard** confirm if leaving with unsaved changes.

---

## Taste and discovery preferences

- User can reopen **favorite ministers / topics** from Settings (same interaction patterns as onboarding: search, multi-select, save).
- **Success** toast or inline “Preferences saved”.
- **Failure:** retry; do not silently revert without message.

---

## Notifications (preference toggles)

- **Email / push / SMS** toggles if product supports them.
- **OS push permission:** timing aligned with `06 - nofications.md` and master §11 item 10.

---

## Account and security

- **Change password** → flow in `00 - security.md`.
- **Sign out** → confirm modal, then auth stack.

---

## Danger zone

- **Deactivate or delete account:** separate screen; **type DELETE** or email confirm per risk level; success → signed out and welcome screen.

---

## Support and legal

- **Help / FAQ** web or in-app.
- **Terms / Privacy** links; open in in-app browser or Safari/Chrome per platform policy.

---

## Empty or edge

- **Failed profile load:** retry + optional sign out if corrupt session.

---

## Revision history

- **2026-04-14:** Created; aligned with `mobile-flow.md` post-Home listener management.
