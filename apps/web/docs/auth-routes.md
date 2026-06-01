# Web auth routes

Canonical paths live in [`src/constants/auth-routes.ts`](../constants/auth-routes.ts). Import `AUTH_ROUTES` in routes, hooks, and forms.

## Public funnel

| Route | Purpose |
|-------|---------|
| `/login` | Sign in |
| `/register` | Create account |
| `/activate-account` | Email OTP + activate (JWT issued) |
| `/forgot-password` | Password recovery (email + OTP steps) |
| `/reset-password` | Set new password after recovery |
| `/verify-otp` | Standalone OTP verify (not post-register) |

Post-register: `register` → `/activate-account` → studio or dashboard.

## Not auth routes

| Path | Purpose |
|------|---------|
| `/get-started/verify-account` | Private minister identity/KYC |
| `POST /api/v1/auth/activate` | API only |

## Private

| Route | Purpose |
|-------|---------|
| `/settings` | Account settings (name, email, password, deactivate) |
