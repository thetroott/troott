# feat-0001: Web authentication and session experience

## Summary

The Troott web app authenticates creators, ministers, and platform admins through email and password, optional OTP activation, and password recovery. Signed-in users are routed to the correct portal (admin console, minister onboarding, or studio) based on role and onboarding state. This spec defines every consumer-visible auth flow, error, and redirect invariant for the web surface.

## Problem

Auth behavior is spread across public routes, a shared session hook, route gates, and multiple forms. Regressions have already appeared in production-adjacent dev work: login failing for registered users when credentials were not persisted server-side, duplicate module imports breaking the bundle, and ambiguous mixing of user id vs studio public code in URLs. Without a single product contract, changes to login redirects, OTP paths, or role gates can silently break registration, activation, or studio entry.

## Non-goals

- Native mobile auth (`apps/mobile`) — see `specs/mobile/00 - auth.md` and `specs/api/mobile-flow.md`.
- OAuth / social sign-in (Google, GitHub) while those controls remain disabled in the login UI.
- Backend API schema, password encryption algorithm, or email delivery implementation.
- Listener-first web portal (listeners may authenticate but are not a supported web portal persona today).
- Sermon upload, studio content editing, or admin CRUD beyond what is required to enter those areas after sign-in.
- Automatic canonicalization of studio URLs (e.g. code to slug) after login.

## Figma

Figma: none provided. Baseline is existing auth pages (login, register, activate, forgot/reset, change password) and shared form patterns (Sonner toasts, loading spinners, password strength meter).

## Consumer

End users: ministers, creators, admins, and super-admins using the Troott web portal. Internal testers and support staff using the same flows.

## Behavior

### A. Public routes and session presence

1. A visitor without a stored access token and user id may open login, register, activate account, verify OTP, forgot password, reset password, preview, no-network, and open-sermon preview routes without being forced to login first.

2. A visitor without a session who opens any other route is redirected to login; local auth artifacts are cleared before redirect so stale tokens do not linger.

3. A visitor with a valid stored token and user id who opens only the root path or login path is redirected through post-auth routing (see section F); they do not remain on the marketing/login screen.

4. A visitor with a valid session who is already on a public auth route other than root or login (e.g. register, activate) is not auto-redirected away by the global session effect; they can complete that flow unless the form itself navigates elsewhere.

5. Legacy URL paths documented as removed (e.g. `/activate`, `/dashboard`, `/upload-sermon`) must not be linked from product UI; bookmarks to them are out of scope and may 404.

### B. Registration

6. Registration collects first name, last name, email, and password and submits with a portal-appropriate user type (minister or creator as exposed by the register entry point).

7. Client-side validation runs before submit: required fields, email format, and password strength rules consistent with other auth forms.

8. On successful registration the user is not treated as signed in; a success message indicates OTP was sent to email.

9. On successful registration the email used is stored for downstream OTP and activation screens.

10. On successful registration the user is navigated to activate account (or equivalent activation route), not to login or studio.

11. If the email is already registered, the user sees a clear error that the account exists and must use another email or sign in; no duplicate account is created.

12. Registration errors from the API surface as a toast with the server message unless the response is an HTTP-success envelope already handled globally (no duplicate toast).

13. While registration is in progress, the submit control shows a loading state and prevents double submit.

### C. Account activation (register OTP)

14. Activation requires the stored verification email; if missing, the user is told to register again and is sent to register.

15. Activation accepts a six-digit OTP typed by the user for purpose “register”.

16. On successful activation, if the response includes auth token and user identity, the session is persisted locally (token, user id, user type, email, optional business type) and post-auth routing runs immediately.

17. On successful activation without token in the response, the user is not silently signed in; they are directed to sign in explicitly.

18. On failed activation (wrong or expired OTP), the user sees an error toast and remains on the activation screen with OTP entry available.

19. Resend OTP on the activation screen uses the stored email and register OTP type; success and failure are messaged without signing the user in until activation succeeds.

20. Activation must not skip minister onboarding when the activated user is a minister with incomplete onboarding (post-auth order in section F).

### D. Standalone verify OTP route

21. The standalone verify-OTP route supports the same OTP entry pattern as activation for register-type verification when used as an alternate entry.

22. On successful OTP verification on the standalone route, the user is sent to login, not auto-routed to studio or admin, unless a separate activation path already persisted a session.

23. Standalone verify OTP does not replace activate-account as the primary path after registration; both must remain coherent (same OTP type for register).

### E. Login

24. Login collects email and password with client validation before submit.

25. On successful login with active account (HTTP 200, no error flag), credentials are accepted only for user types the web portal recognizes (super-admin, admin, minister, creator, listener, generic user enum values as returned by the API).

26. On successful login for a recognized type, token and identity are stored locally, user type cookie is set, optional business type cookie is set when provided, session refresh runs, and the user is marked logged in for layout purposes.

27. On successful login for a recognized type who lands on root or login, post-auth routing runs automatically via the session hook (not only via a manual navigate in the form).

28. On successful login for a recognized type with unsupported or missing user type in the payload, auth is not persisted and the user remains on login without a false “signed in” state.

29. On login for an inactive account (HTTP 206), the user sees an informational message that activation is required, the email is stored for verification, and the user is navigated to activate account; auth is not persisted as a full session.

30. On login with invalid email or password, the user sees a generic invalid-credentials message; failed attempts count toward server lockout policy when applicable.

31. On login for a locked account, the user sees a locked-account message distinct from invalid credentials.

32. On login for a deactivated account, the user sees a deactivated-account message.

33. On login for a non-existent account, the user sees a message that the account was not found and should sign up (wording may match API).

34. Login errors use toast for API failures except when the global envelope handler already surfaced the same error (no duplicate toast).

35. Password visibility toggle on login does not clear field values or bypass validation.

36. Links from login to register, forgot password, and legal copy remain available and use canonical auth route constants.

### F. Post-auth routing order

37. Post-auth routing never runs without a token and user id unless explicitly bootstrapping right after activation persist.

38. Post-auth routing refreshes session context before choosing a destination when forced or on first entry after login/activation.

39. Super-admin and admin users are routed to the admin users home, not studio or minister onboarding.

40. Minister users with incomplete minister onboarding are routed to get-started, not studio, even if a studio code exists in cache.

41. Minister users with completed onboarding and creator users are routed to studio using public studio code in the URL path (`/studio/{code}/…`), not Mongo user id.

42. Studio routing prefers cached studio code when valid; otherwise loads primary studio from “my studio” API, caches code, then navigates; if no studio is available, routes to get-started rather than unauthorized or a blank studio shell.

43. Listener and generic end-user types that are not internal portal roles route to unauthorized after login persist, not studio or admin (web portal is not the listener product).

44. Unknown or empty role after refresh routes to unauthorized.

45. Post-auth routing uses replace navigation so the user cannot “back” into login with an active session from entry redirects only.

46. Admin routing takes precedence over minister onboarding and studio when the user is admin or super-admin.

47. Minister onboarding check takes precedence over studio for ministers only.

### G. Forgot password and reset

48. Forgot password is a multi-step flow: collect email, verify OTP (forgot-password OTP type), then continue to reset password.

49. Step one stores the email for later OTP and reset steps on success.

50. OTP step validates six-digit input; wrong OTP shows error without advancing.

51. After OTP success, the user can proceed to reset password with the same stored email.

52. Reset password requires stored verification email; if missing, user is sent back to forgot password with guidance.

53. Reset password enforces password strength and confirmation match client-side before submit.

54. On successful reset, the user sees success feedback and is directed to login; they are not auto-signed in unless product explicitly adds that later.

55. Forgot and reset flows do not leave the user signed in mid-flow (session cleared or never set for those steps).

56. OAuth-only accounts cannot reset password via email flow; user sees that social-login accounts cannot use this path.

### H. Change password (signed in)

57. Change password is only reachable behind authenticated routes (profile area).

58. Change password requires current password, new password, and confirmation with client validation.

59. On wrong current password, user sees incorrect-current-password feedback.

60. On success, user sees success feedback and remains in the portal (no forced logout unless API invalidates tokens in future).

61. OAuth-managed accounts cannot change password through this form.

### I. Route protection and roles

62. Routes marked as requiring auth redirect unauthenticated users to login and pass the attempted path in navigation state for potential return (consumption of `from` is best-effort).

63. Routes with an explicit role allow-list show a loading state while session and role hydrate, then render content if the role matches, or redirect to unauthorized if role does not match — not to login.

64. Internal portal dashboard parent requires internal portal roles (admin, super, minister, creator); listener with a token must not see dashboard chrome.

65. Admin subtree requires admin portal roles only; minister or creator must not access admin URLs while signed in.

66. Studio subtree under dashboard requires authentication; studio code in the URL is resolved by the API (id, code, or slug) without changing the visible path segment the user was given.

67. Open sermon and preview routes remain reachable without full portal session per public path rules.

### J. Session hydration and persistence

68. On app load with token present, session hydrator runs once to load user profile and role-aligned context (admin, minister, studio as applicable).

69. After login or activation persist, session refresh is forced so minister/studio/admin contexts are populated before post-auth routing decisions.

70. Studio code from session user may be written to local storage during refresh for subsequent studio navigation.

71. Logout calls logout API when possible, then clears token, user id, cookies, and related local auth regardless of API outcome.

72. Logout always returns the user to login and clears logged-in UI state.

73. Alternate logout-with-user-id API path clears local session and returns to login on success.

74. A failed `fetch me` during hydration does not crash the app; the user may see stale or empty profile until retry via navigation or re-login.

### K. Unauthorized and errors

75. Unauthorized page is shown when signed-in user’s role is not allowed for the requested portal area.

76. Unauthorized is distinct from login (user may still have a valid session).

77. Network or server errors during auth actions show human-readable messages via toast or inline patterns consistent across forms.

78. HTTP 2xx responses with `error: true` in the Troott envelope do not produce duplicate error toasts from forms when the global handler already notified the user.

### L. UI affordances and accessibility

79. Submit buttons expose loading state during async auth operations driven by shared loading hooks or local submitting state.

80. Auth forms support keyboard submit via native form submit where implemented.

81. Auth entry redirect and gate loading states expose accessible loading text (e.g. polite live region on gate).

82. Terms and legal links on register/login remain reachable without breaking the auth flow.

### M. Security and abuse (consumer-visible)

83. Users are informed when activation is required rather than seeing a generic failure for inactive accounts on login.

84. Users are informed when the account is locked after too many failed logins.

85. Users must not remain signed in after explicit logout on the same browser profile (local storage and auth cookies cleared).

86. Verification email used for OTP flows is not displayed as a password field; only email and OTP/password inputs use appropriate masking.

### N. Must not regress

87. Register → OTP email → activate → post-auth path must remain end-to-end for new ministers/creators.

88. Login with correct active credentials for minister/creator must reach studio or get-started, not unauthorized.

89. Login 206 must always route to activation with email preserved.

90. Post-auth order must remain: admin → minister onboarding incomplete → studio → unauthorized.

91. Studio URL segment after login must remain studio public code, not user id.

92. Public auth routes must remain reachable without a session.

93. Role gate must not send wrong-role signed-in users to login (unauthorized instead).

94. Forgot-password OTP type must not be reused for register activation or vice versa.

95. Password reset after API fix must allow existing users without stored password to recover via forgot-password, then login.

96. Envelope-aware toast rules must remain to avoid double errors on login/register.

97. Internal portal roles must not include listener for dashboard route allow-list.

98. Activate-account path must persist session when API returns token on activation success.

99. `verify-otp` alternate path must not bypass activation messaging for users who registered but never activated.

100. Clearing auth on protected-route visit without session must remain deterministic (no partial token state).

## Open questions

1. ~~Should listener accounts see a dedicated “use the mobile app” message instead of unauthorized after login?~~ **Resolved:** yes — implemented on `/unauthorized` with `reason: listener-portal`.
2. Should successful password reset auto-sign-in the user? **Still open** — current behavior sends user to login after reset (Behavior 54).
3. ~~Should `state.from` on login redirect be consumed automatically after every successful login?~~ **Resolved:** yes — when `from` is a safe path the user’s role may access (see TECH `auth-redirect.util.ts`).
