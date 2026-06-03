# feat-0030: Hide Get Started after onboarding (studio sermons landing)

## Summary

Ministers and creators who have **finished onboarding** must not use `/get-started` anymore. Any attempt to open the hub or a nested onboarding URL should land them on their studio library:

`/studio/{studioCode}/sermons`

Example: `http://localhost:5173/studio/t71ne4coqy6z/sermons`

## Problem

| Symptom | Cause |
| ------- | ----- |
| Completed users can still open `/get-started` from bookmarks, sidebar history, or post-publish navigation | No route guard on get-started tree |
| Post-login sends users to studio **home** (`/studio/{code}`) instead of sermons list | `navigateToStudioPortal` used `studioHomePath` |
| Completion gate ignored when minister/creator profile is slow to hydrate | Gate only read profile `onboarding.status`, not `user.onboard.status` |

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-GS01 | Minister with completed onboarding | `/get-started` to redirect to my sermons library | I never see the onboarding hub again |
| UC-GS02 | Creator with completed onboarding | Same redirect behaviour as ministers | Parity across studio personas |
| UC-GS03 | User who just signed in | To land on `/studio/{code}/sermons` when onboarding is done | I continue work in the studio, not onboarding |
| UC-GS04 | User still onboarding | To keep using `/get-started` and nested steps | Onboarding is not blocked |

## Acceptance criteria

1. Visiting `/get-started` or any `/get-started/*` path when onboarding is complete **replaces** history with `/studio/{code}/sermons`.
2. Sidebar **Get Started** item stays hidden when onboarding is complete (existing behaviour).
3. Post-auth redirect for studio roles with complete onboarding goes to **sermons list**, not studio home.
4. Incomplete onboarding is unchanged: hub, checkpoints, and studio partial access still work per [feat-0005](../feat-0005/PRODUCT.md).
5. Admin accounts are not redirected away from `/get-started` if they navigate there manually.

## Related

- [feat-0005 PRODUCT](../feat-0005/PRODUCT.md) — onboarding hub and milestones
- [feat-0001 TECH](../feat-0001/TECH.md) — post-auth routing
