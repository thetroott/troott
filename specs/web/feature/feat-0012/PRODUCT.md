# feat-0012: Web portal settings (`/settings`)

## Summary

**Settings** is the authenticated account management page at **`http://localhost:5173/settings`**. It consolidates **account information**, **password change**, and **account deactivation** — actions backed by existing API routes. Public listener-facing profile editing stays on **`/profile`** ([feat-0011](../feat-0011/PRODUCT.md)).

## Problem

Account actions were scattered across implicit session data with no dedicated sidebar entry. Users expect a **Settings** destination (reference: card-based “My Settings” layout) for name, email, password, and destructive account actions.

## Non-goals

- Two-factor authentication (field exists on user model; **no API routes**).
- Browser session list / “Log out other sessions” (**no API**).
- Public profile (bio, cover, ministry) — [feat-0011](../feat-0011/PRODUCT.md).
- Get Started KYC / address — [feat-0010](../feat-0010/PRODUCT.md).
- Admin platform settings — separate admin context.

## Figma / reference

No Troott Figma node. Baseline: card-stack layout (profile information + update password + delete account), adapted to portal dark theme (`#2b2a2c` cards, `#545454` borders) consistent with `/profile`.

## Consumer

Minister, creator, and admin portal roles (`INTERNAL_PORTAL_ROLES`). Same auth gate as `/profile`.

---

## Route and navigation

| URL | Purpose |
| --- | -------- |
| `/settings` | Account settings (this spec) |

| Entry | Behavior |
| ----- | -------- |
| Sidebar **Settings** | `PATH_SETTINGS` in Main nav |
| User menu **Settings** | Navigate to `/settings` |
| User menu **Profile** | Navigate to `/profile` (public-facing preview) |

---

## Page sections

Max width **720px** content column (forms); page title **My Settings**.

### 1. Profile information

**Copy:** “Update your account's profile information and email address.”

| Field | Editable | API |
| ----- | -------- | --- |
| First name | Yes | `PUT /api/v1/user` `firstName` |
| Last name | Yes | `PUT /api/v1/user` `lastName` |
| Email | Yes | `PUT /api/v1/user` `email` |

- **Save** (per section): disabled when pristine or submitting.
- Success: Sonner toast; refresh session user + account query.
- Errors: API envelope message via toast.

**Load:** `GET /api/v1/user` (`useCurrentAccountQuery`) with fallback to session user while loading.

### 2. Update password

**Copy:** “Ensure your account is using a long, random password to stay secure.”

| Field | API |
| ----- | --- |
| Current password | `POST /api/v1/auth/change-password` |
| New password | same |
| Password confirmation | client-only |

- Client validation via `usePasswordUtils`.
- **OAuth / social accounts:** API returns **403** — show inline notice; disable submit.
- On success: toast; **clear local session and redirect to `/login`** because API bumps `tokenVersion` ([feat-0004 API](../../../api/feature/feat-0004/PRODUCT.md)).

### 3. Delete account

**Copy:** “Permanently delete your account and all associated data. This action cannot be undone.”

- **Delete account** button (destructive).
- Requires `window.confirm` before submit.
- API: `DELETE /api/v1/user/deactivate`.
- On success: toast; logout locally; redirect to `/login`.

---

## API surface (implemented today)

| Action | Method | Path | Auth |
| ------ | ------ | ---- | ---- |
| Load account | GET | `/api/v1/user` | Protect |
| Update account | PUT | `/api/v1/user` | Protect |
| Change password | POST | `/api/v1/auth/change-password` | Protect |
| Deactivate account | DELETE | `/api/v1/user/deactivate` | Protect |

**Not available (do not ship UI until API exists):**

| Action | Status |
| ------ | ------ |
| Enable 2FA | Model field only |
| List/revoke browser sessions | Not implemented |
| Hard delete user | Deactivate only |

---

## Acceptance criteria

- [ ] `/settings` in sidebar for internal portal roles.
- [ ] Profile information saves first/last/email via `PUT /user`.
- [ ] Password section validates current, new, and confirm fields before submit.
- [ ] Successful password change signs user out and sends to login.
- [ ] Delete account calls deactivate API then signs out.
- [ ] User avatar menu links Profile → `/profile`, Settings → `/settings`.

---

## Test plan

| # | Case | Expected |
| - | ---- | -------- |
| 1 | Open `/settings` signed out | Redirect login |
| 2 | Edit name → Save | Toast; fields persist on refresh |
| 3 | Invalid email | API error toast |
| 4 | Change password success | Logout → login |
| 5 | Wrong current password | Error toast; stay on page |
| 6 | Delete account → confirm | Deactivate API; logout |

---

## Related specs

- [feat-0012 TECH](./TECH.md)
- [feat-0011 Profile](../feat-0011/PRODUCT.md)
- [feat-0001 Auth](../feat-0001/PRODUCT.md)
- [feat-0004 API token](../../../api/feature/feat-0004/PRODUCT.md)
