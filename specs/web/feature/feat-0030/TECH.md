# feat-0030: Tech Spec — Get Started route guard + studio sermons landing

## Context

See [`PRODUCT.md`](./PRODUCT.md). Builds on [feat-0005](../feat-0005/TECH.md) completion gates and [feat-0001](../feat-0001/TECH.md) post-auth routing.

## Completion signal (single helper)

`apps/web/src/utils/portal-onboarding.util.ts` — `isStudioOnboardingComplete`:

| Persona | Complete when |
| ------- | ------------- |
| Minister | `minister.onboarding.status === 'completed'` **or** `user.onboard.status === 'completed'` |
| Creator | `creator.onboarding.status === 'completed'` **or** `user.onboard.status === 'completed'` |

The `user.onboard` fallback covers slow profile hydration and publish-side effects that already sync user onboard status on the API.

## Route guard

New layout route wrapper: `GetStartedOnboardingGate.tsx`

- Mounted as the **parent element** of the `get-started` route tree in `minister.route.tsx`.
- Waits for session + minister/creator profile hydration.
- For `STUDIO_CONTENT_ROLES` only:
  - If `isStudioOnboardingComplete` → `navigateToStudioPortal(..., { replace: true })`
  - Else → `<Outlet />` (render hub / nested onboarding screens)
- Non-studio roles (e.g. admin) pass through without redirect.

Path helper: `isGetStartedPath()` in `routes/paths.ts`.

## Studio landing URL

`apps/web/src/utils/studio-portal.util.ts`:

```ts
studioPortalPath(code) => studioSermonsListPath(code)
// /studio/{code}/sermons
```

Used by:

- `useRedirectAfterAuth` (post-login)
- `GetStartedOnboardingGate` (blocked get-started access)

## Files touched

| File | Change |
| ---- | ------ |
| `components/shared/get-started/GetStartedOnboardingGate.tsx` | New guard |
| `routes/minister.route.tsx` | Parent `element: <GetStartedOnboardingGate />` |
| `utils/portal-onboarding.util.ts` | `user.onboard` fallback for both personas |
| `utils/studio-portal.util.ts` | Default portal path → sermons list |
| `routes/paths.ts` | `isGetStartedPath` |
| `utils/portal-onboarding.util.test.ts` | Unit tests |

## Testing

```bash
cd apps/web && pnpm exec vitest run src/utils/portal-onboarding.util.test.ts
cd apps/web && pnpm exec tsc --noEmit
```

Manual:

1. Complete onboarding (step 6 / publish first sermon).
2. Open `/get-started` → expect redirect to `/studio/{code}/sermons`.
3. Sign out / sign in → same sermons URL, not get-started.
4. New account mid-onboarding → `/get-started` still renders.

## Related

- [feat-0005 TECH](../feat-0005/TECH.md)
- [feat-0006 TECH](../feat-0006/TECH.md) — upload wizard exit already prefers `studioSermonsListPath`
