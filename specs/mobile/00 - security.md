# Security and session (user-facing)

**Master journey:** [`specs/api/mobile-flow.md`](../api/mobile-flow.md) — Account model (intro), returning user / token (§3), interruptions (§7), confirmations (§9).

**Scope:** What the **listener** experiences for sign-in persistence, session end, biometric convenience, and sign-out. **No guest account:** there is no mode where the app shows personalized Home or library without a registered, signed-in user.

---

## Session lifecycle (user view)

| Event                      | User sees                                                          |
| -------------------------- | ------------------------------------------------------------------ |
| Valid session              | Normal app; Home and Library work                                  |
| Session expired / revoked  | Redirect to **Sign in**; optional “Session expired, sign in again” |
| First install after logout | Welcome or **Log in**; no personalized content                     |

### After returning from background

- If session still valid: **no** interruption.
- If refresh failed in background: next navigation or pull-to-refresh may show error; **Sign in** if 401-equivalent behavior is product choice.

---

## Optional biometrics (Face ID / fingerprint)

- **Prompt timing:** after first successful login or from **Settings** only — avoid surprising biometric prompt on first frame of Home.
- **Failure:** fall back to **device passcode** or **app password** per OS; show **Try again** without revealing whether account exists.
- **Disable biometrics** in Settings: immediately require password next launch.

---

## Sign out

- **Entry:** Profile → Sign out (or overflow).
- **Confirmation:** modal “Sign out?” — destructive styling on confirm, safe cancel.
- **After confirm:** all personalized UI cleared; land on **Log in** / welcome; **no** cached user name on Home.

---

## Password change and recovery

- **Signed-in change password:** Settings path; current password field; success toast + optional re-login if server requires.
- **Forgot password:** email entry → OTP → new password; same OTP UX patterns as registration activation (master §4B): paste, resend countdown, errors.

---

## What we do not promise in copy

- Do not imply “guest” or “browse without account” if product requires sign-in for all playback.

---

## Revision history

- **2026-04-14:** Created; aligned with no-guest policy in `mobile-flow.md`.
