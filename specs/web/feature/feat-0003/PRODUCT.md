# feat-0003: Admin and super-admin login (no public registration)

## Summary

**Admin** and **super-admin** accounts sign in with email and password on the **web portal** and **mobile app** like any other activated user. They **cannot** be created through public self-service registration (`POST /auth/register` or equivalent register UI). Platform admins are provisioned only through internal flows (invitation, protected admin APIs, or system seed). Complements [feat-0001](../../web/feature/feat-0001/PRODUCT.md) (web session) and [feat-0002](../../web/feature/feat-0002/PRODUCT.md) (web sidebar).

## Problem

Auth rules for privileged roles are implicit and split across API validation, web register defaults, and mobile signup stubs:

- **Login** must work for existing admin/super-admin users on **both** web and mobile; a regression on one client or a mistaken “portal-only” block would lock out operations staff.
- **Registration** must never create `admin` or `superadmin` users via the public register endpoint, even if a client sends a forged `userType`.
- Product and support need a single contract: *login yes, register no*, and where legitimate admin accounts come from.

Without this spec, a client change could expose an admin signup option, drop admin login on mobile, or allow `userType: admin` through register payloads.

## Non-goals

- Full RBAC / permission matrix (`apps/api/src/_specs/rbac.md`).
- Admin invitation email copy, accept-invite page layout, or `createAdmin` field-level validation (covered only where they affect “account exists and can log in”).
- Web admin CRUD beyond post-login entry (feat-0002 sidebar and admin routes).
- Building a full **admin console** on mobile (management UI stays web-first).
- OAuth / social sign-in.
- Changing how **listener**, **minister**, or **creator** public registration works.

## Figma

Figma: none provided. Baseline: existing login and register screens on web and mobile; no “Sign up as admin” affordance.

## Consumers

- **Admin** and **super-admin** — sign in on web and mobile; manage platform on web.
- **Minister, creator, listener** — unchanged public registration and login.
- **Internal operators** — invite or create admin accounts outside public register.

## Behavior

### A. Account provisioning (source of truth: API)

1. Public registration (`POST /auth/register`) accepts **only** user types in the self-service allow-list: **listener**, **creator**, and **minister**.

2. A register request with `userType` **admin** or **superadmin** (any casing/normalization the API applies) is **rejected** with a clear validation error; **no** user row is created.

3. A register request that **omits** `userType` follows existing API/client defaults for self-service personas (minister/creator/listener); it must **not** default to admin or super-admin.

4. **Admin** and **super-admin** accounts are created only through **non-public** provisioning, including but not limited to: admin invitation accept flow, protected `POST /admin` (or equivalent create-admin API), and system seed/bootstrap. Those flows set `userType` and activation/password state outside public register.

5. Registering an email that already belongs to a **super-admin** continues to return a forbidden-style error (no duplicate privileged account via register).

6. Public register must **not** expose an API flag or field that elevates an existing self-service user to admin or super-admin in the same request.

### B. Login (API)

7. Public login (`POST /auth/login`) does **not** filter by `userType`; any **existing, active** user with valid credentials may authenticate, including **admin** and **super-admin**.

8. Login responses for admin-class users include the same token and mapped user identity shape as other types (including `userType` and admin-specific fields such as `adminCode` when applicable).

9. Inactive, locked, deactivated, and invalid-credential rules apply to admin and super-admin the same as other users (including HTTP 206 for inactive pending activation).

10. Forgot-password and reset-password flows apply to admin-class users when they use password-based accounts (same as feat-0001 rules on web).

### C. Web — registration UI and client

11. The web register screen and register form must **not** offer admin or super-admin as a selectable account type.

12. The web client must send only self-service `userType` values on register (today: minister on the default register route; creator if a separate entry exists).

13. If register is submitted with a tampered `userType` of admin or super-admin, the user sees the API validation message and remains unsigned-in.

14. There is **no** public “Create admin account” or “Sign up as administrator” link in auth marketing or register/login chrome.

### D. Web — login and post-auth

15. Admin and super-admin may use the **same login form** as other portal users (email + password).

16. On successful login, session persistence and cookies include the true `userType` (`admin` vs `superadmin` distinct).

17. Post-auth routing for admin-class users sends them to the **admin portal** (e.g. admin users home), not studio onboarding and not listener unauthorized — per feat-0001 ordering (admin precedence over minister/studio).

18. Admin-class users must **not** be turned away at login solely because they are admin; wrong-role handling applies **after** sign-in on routes they cannot access (unauthorized), not at credential check.

19. Register → activate → login paths must remain available for **minister/creator/listener** without requiring admin provisioning.

### E. Mobile — registration UI and client

20. Mobile sign-up / register flows must **not** offer admin or super-admin account types.

21. Mobile register payloads sent to `POST /auth/register` must use only self-service user types (typically **listener** for the consumer app; minister/creator only if explicitly productized on mobile).

22. Tampered admin `userType` on mobile register is rejected by the API with a user-visible error.

### F. Mobile — login and post-auth

23. Admin and super-admin may use the **same login API** (`POST /auth/login`) as listeners and other mobile users.

24. On successful mobile login for admin-class users, the app **persists the session** (token, user id, user type) the same way as for other types.

25. Mobile login for admin-class users must **not** fail with “wrong app” or “use web only” at the **authentication** step; credential validation is identical to other users.

26. After mobile login, the app may route to the normal authenticated shell (e.g. home tabs). Mobile **does not** need to host the web admin console; admin **management** remains web-first (feat-0002 non-goals).

27. Optional product enhancement (not required for MVP of this feature): after admin mobile login, show a short in-app notice that full admin tools are on the web portal — without invalidating the session or blocking login.

28. Mobile register must not be the path used by operations to onboard new admins.

### G. Security and abuse (consumer- and API-visible)

29. The API register allow-list is enforced **server-side**; client-side hiding of admin signup is not sufficient on its own.

30. No unauthenticated endpoint may create `userType: admin` or `superadmin` through the same contract as public register.

31. Admin invitation and create-admin endpoints remain **authenticated** and role-gated; failures return unauthorized/forbidden, not silent downgrade to listener register.

32. Audit/support can explain admin existence only via provisioning flows, not via public register.

### H. Relationship to other portal rules

33. **Listener** and generic **user** types may still register via public register where product allows; web portal may still show unauthorized after login (feat-0001) — unchanged.

34. **Super-admin** and **admin** remain distinct for authorization and web sidebar (feat-0002); this feature only requires both can **authenticate**.

35. Protected routes that require `isAdmin: false` on “me” or similar must remain documented separately; admin login success does not imply access to listener-only APIs.

### I. Must not regress

36. Existing minister/creator web register → OTP → activate → studio/admin routing per feat-0001.

37. API `validateRegister` allow-list continues to exclude admin and super-admin.

38. Web admin post-login destination (`/admin/...` users home) remains correct for admin and super-admin.

39. Login lockout, 206 inactive, and envelope toast behavior from feat-0001 remain for admin-class users.

40. Super-admin duplicate-email register guard remains.

## Open questions

1. Should mobile show a dedicated post-login screen for admin (link to web) vs. home tabs only? **Default for implementation:** home tabs + optional notice (Behavior 27).
2. Should **creator** have a dedicated web register route separate from minister? **Out of scope** unless product adds it; both remain self-service, not admin.
3. Should admin accounts ever use mobile-only password reset? **Default:** yes, same forgot-password API as other password users.

## Related

- [feat-0001 PRODUCT](../../web/feature/feat-0001/PRODUCT.md) — web login, post-auth, register, activation
- [feat-0002 PRODUCT](../../web/feature/feat-0002/PRODUCT.md) — web admin sidebar
- `specs/mobile/00 - auth.md` — mobile auth implementation notes
- `apps/api/src/_specs/rbac.md` — super-admin provisioning constraints
