# feat-0009: Profile, notifications, and account settings

## Summary

The **Profile** tab and `app/user/*` routes cover account overview, edit profile, photo picker, notifications preferences, about/legal, and sign out. Push/in-app notification behavior aligns with [`06 - nofications.md`](../../06%20-%20nofications.md); session/security with [`00 - security.md`](../../00%20-%20security.md).

## Problem

Profile spans user stack routes, upload hooks, and settings toggles. Notification permission timing and account danger zone need one listener-facing contract.

## Non-goals

- Minister public studio pages on web.
- Full in-app notification inbox if not implemented.

## Consumer

Signed-in listeners.

## Behavior

1. Profile overview shows avatar, name, bio; tap avatar → photo picker flow.
2. **Edit profile** saves with dirty-state guard and discard confirm.
3. **Taste preferences** reopen minister/topic selection (same patterns as onboarding).
4. **Notifications** toggles sync with OS permission strategy (just-in-time or settings-only).
5. **Change password** uses auth API + security copy.
6. **Sign out** confirms then clears session (feat-0001).
7. **Delete/deactivate account** uses high-friction confirm then sign-out landing.
8. **About / legal** opens in-app browser or external per platform policy.
9. `app/user/notifications.tsx` lists preference UI when present.

## Related docs

- [`08 - profile.md`](../../08%20-%20profile.md)
- [`TECH.md`](./TECH.md)
