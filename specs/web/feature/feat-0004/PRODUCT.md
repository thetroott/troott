# feat-0004: Minister and creator sidebar — studio-scoped navigation

## Summary

**Ministers** and **creators** use the same **Main** sidebar (feat-0002). Each link must resolve to a **real, routable** URL under `/studio/{studioCode}/…` using the correct **studio public code**, not legacy `/dashboard` or bare `/sermons`. When no code is known, studio links must not send users to broken routes. Complements [feat-0001](./feat-0001/PRODUCT.md) (post-auth studio entry), [feat-0002](./feat-0002/PRODUCT.md) (sidebar roles), and studio routes in `apps/web/src/routes/studio.route.tsx`.

## Problem

Sidebar **labels** look correct (Dashboard, Sermons, Analytics, Bin, Profile) but **hrefs** often do not match the router:

- Nav data still declares **legacy** paths (`/dashboard`, `/sermons`, `/analytics`, `/bin`) that only work after `resolveStudioNavUrl` rewrites them—and only when a **studio code** is in local storage.
- **Studio code** may exist on the signed-in user (`studioCode` from login/me) but not be cached before the sidebar renders, so links stay legacy and navigation **404s** or lands outside the studio shell.
- On `/studio/{code}/…`, the sidebar does not prefer the **code in the URL**, so a stale or empty cache produces wrong links.
- On `/get-started` (no `:studioCode` in the path), ministers/creators still see Main items pointing at `/dashboard` or `/sermons` instead of get-started-safe behavior.

Without a written contract, fixes to login or session refresh do not update sidebar targets, and routing stays broken for ministers and creators.

## Non-goals

- Admin-only or super-admin-only sidebar rules (feat-0002).
- Changing which items appear in Main (no new Series/Community items unless a separate ticket enables them).
- Mobile tab navigation.
- Studio URL canonicalization (slug vs code) beyond using the **public code** the API returns today.
- Backend studio CRUD or minister verification flows.

## Figma

Figma: none provided. Baseline: feat-0002 sidebar chrome; Main group with Get Started (when allowed), Dashboard, Sermons, Analytics, Bin, Profile.

## Consumer

- **Minister** and **creator** — authenticated dashboard layout with studio product routes.
- **Super-admin** — **Main** + **Admin** on `/admin/*` and studio routes; **Main** uses the same studio-scoped URL rules, including cached code on admin pages (Behaviors 22–24).

## Behavior

### A. Studio code as navigation input

1. Every studio-scoped sidebar target uses the pattern `/studio/{studioCode}` plus the segment defined in `paths.ts` (sermons, analytics, bin, upload wizard, etc.).

2. **Studio code** is the API **public code** (e.g. `BD3AF6GHXPMJ`), never Mongo user id or minister code.

3. **Resolution order** for the code used in sidebar links (highest priority first):
   - `:studioCode` from the current route when pathname matches `/studio/:studioCode/…`
   - Session user `studioCode` after login / me refresh
   - **Primary studio** from `GET` my-studio (`MyStudioResponseDTO.studio`) when the API returns a single default studio
   - Value cached in local storage from login, activate, my-studio, or a prior studio visit
   - If none: studio-scoped items are **not** navigable to legacy paths (see section C)

4. **Multiple studios (future):** Until a multi-studio picker exists, use **one** code only—the primary studio per Behaviors 3–5. Do not pick an arbitrary member studio or a secondary studio from a list.

5. When the user navigates to a studio URL, the cached code is updated to match that URL segment.

6. When login or session refresh returns `user.studioCode`, that value is cached before or as part of post-auth redirect so the first sidebar paint after studio entry has a code.

### B. Nav data (declared targets)

7. Minister and creator share one **Main** item list (feat-0002); no duplicate trees.

8. Declared nav targets align with **route segments** in `paths.ts`:
   - Dashboard → studio home (index under `/studio/:studioCode`)
   - Sermons → `sermons`
   - Analytics → `analytics`
   - Bin → `bin`
   - Profile → `/profile` (global, not studio-prefixed)
   - Get Started → `/get-started` (global)

9. Legacy paths (`/dashboard`, bare `/sermons`, `/upload-sermon`, etc.) must not appear in generated `href`s for ministers/creators or super-admin **Main** links—only in optional internal keys if a resolver maps them, and the resolver output must always be studio-scoped when a code exists.

10. Commented-out or empty nav groups (Sermon Management, Engagement) stay **omitted** from the UI (feat-0002).

### C. Link resolution and routing

11. With a resolved code, **Dashboard** navigates to `/studio/{code}` (same as studio home route).

12. With a resolved code, **Sermons**, **Analytics**, and **Bin** navigate to `/studio/{code}/sermons`, `/studio/{code}/analytics`, `/studio/{code}/bin` respectively.

13. **Profile** always navigates to `/profile` regardless of code.

14. **Get Started** always navigates to `/get-started` when visible (onboarding gate per feat-0002).

15. **Without** a resolved code, clicking Dashboard, Sermons, Analytics, or Bin must **not** navigate to `/dashboard`, `/sermons`, `/analytics`, `/bin`, or `/studio/` with an empty segment. Product default: **disabled** until code exists.

16. **Sermons active state:** **Sermons** stays highlighted for every path under `/studio/{code}/sermons`, including the upload wizard (`/studio/{code}/sermons/upload/…`). Use a **prefix match** on `/studio/{code}/sermons` (exact path or `{prefix}/…`).

17. Sidebar links use client-side routing (`Link` / router), not full page reloads, for in-app targets.

### D. Session and post-auth alignment

18. After minister/creator login with `studioCode` on the user payload, post-auth routing (feat-0001) goes to `/studio/{code}` or get-started; sidebar on the destination must use the same code.

19. Minister with incomplete onboarding lands on get-started; studio-scoped items follow Behavior 15 until onboarding completes and a code exists.

20. Creator with completed onboarding and a studio uses the same Main links as minister (feat-0002 parity).

21. Refreshing the browser on `/studio/{code}/sermons` keeps sidebar links scoped to that `code`.

### E. Super-admin on `/admin/*`

22. On `/admin/*`, super-admin still sees **Admin** and **Main** (feat-0002). **Admin** links (`/admin/users`, `/admin/sermons`, …) are unchanged.

23. On `/admin/*`, **Main** links (Dashboard, Sermons, Analytics, Bin) use the **same** studio-scoped rewrite as ministers: `/studio/{code}/…` when a code resolves per Behavior 3—including **cached** local storage when the pathname has no `:studioCode`.

24. On `/admin/*` with **no** resolved code, **Main** studio items are **disabled** (Behavior 15), not legacy `/dashboard` or `/sermons`.

### F. Relationship to feat-0002

25. Role gates unchanged: ministers/creators do not see Admin group; Get Started hidden when onboarding complete.

26. Super-admin may see Main + Admin; **Main** links obey Behaviors 11–17 and 22–24 on both `/admin/*` and `/studio/{code}/…`.

27. Logout and avatar behavior unchanged (feat-0002).

### G. Must not regress

28. **Admin** (non-super) sidebar: Users and Sermons only on `/admin/*`; no Main group (feat-0002).

29. feat-0001 post-auth order: admin → minister get-started → studio → unauthorized.

30. Studio routes under `studio.route.tsx` remain the route source of truth for page content.

31. Open sermon / public auth routes do not show this sidebar.

## Related

- [feat-0001 PRODUCT](./feat-0001/PRODUCT.md) — login, `studioCode` on user, post-auth routing
- [feat-0002 PRODUCT](./feat-0002/PRODUCT.md) — sidebar role visibility
- `specs/web/02 - get-started.md` — minister onboarding routes
- `apps/web/docs/adr/0001-web-api-client.md` — API client patterns (if present)
