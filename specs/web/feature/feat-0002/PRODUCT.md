# feat-0002: Web portal sidebar (minister, creator, admin)

## Summary

Signed-in users on the Troott web portal see a collapsible left sidebar inside the authenticated dashboard shell. **Ministers and creators share the same Main navigation.** **Admin** users see **only** the Admin group (Users, Sermons). **Super-admin** users see **Admin and Main** (studio links). **Get Started** is for ministers and creators while onboarding is incomplete; **never** for admin or super-admin. **Logout** and the **user avatar menu** apply to all portal roles. Complements [feat-0001](../feat-0001/PRODUCT.md).

## Problem

Sidebar behavior is split across navigation data, role resolution from cookies, studio URL rewriting, and layout chrome (top nav, collapse). Today:

- **Minister and creator** share nav data but **Get Started** is not enforced in the sidebar (`showOnboarding` unused).
- **Creators** were underspecified vs ministers; product requires **parity**.
- **Admin** and **super-admin** are not distinguished in the sidebar today (both mapped to the same role); product requires **admin-only** vs **both groups** for super-admin.
- Legacy paths such as `/dashboard` are rewritten at click time rather than declared as studio-scoped paths.
- Sidebar footer **Logout** is a placeholder (`href="#"`) while the avatar menu exists but logout may not be wired.
- Empty nav groups (“Sermon Management”, “Engagement”) still render with no items.

Without a written contract, sidebar changes can break studio deep links, active-state highlighting, or role-appropriate menus.

## Non-goals

- Mobile app tab navigation (`apps/mobile`).
- Listener web portal sidebar (feat-0001).
- OAuth or auth forms (feat-0001).
- Enabling commented-out nav items (Series, Trash, Community) unless added in a future ticket.
- Per-page loading skeletons (separate UI pass).

## Figma

Figma: none provided. Baseline: collapsible sidebar, Troott logo, sidebar search, dark shell, active item styling, top-nav user avatar dropdown.

## Consumer

- **Minister** and **creator** — same studio sidebar; Get Started when onboarding incomplete.
- **Admin** — Admin-only sidebar (Users, Sermons); no Main studio links; no Get Started.
- **Super-admin** — Admin **and** Main studio links; no Get Started.

## Behavior

### A. Shell and layout

1. The sidebar appears only on routes wrapped by the authenticated **dashboard layout** (onboarding, studio, profile, admin). Public auth routes do not show it.

2. The sidebar is **collapsible**; collapse preference persists per browser profile.

3. A **sidebar search** affordance appears below the logo.

4. The **top navigation bar** includes collapse trigger, page context, notifications, help, and the **user avatar menu** for all roles that use this layout (minister, creator, admin, super-admin), except where top nav is intentionally hidden on sermon canvas routes—the **sidebar still shows**.

5. Main content scrolls independently of the sidebar.

### B. Role resolution

6. Sidebar groups are derived from signed-in **user type** (feat-0001).

7. **Super-admin** (`superadmin`) and **admin** (`admin`) are distinct for sidebar visibility; do not collapse both to a single sidebar role in implementation.

8. **Listener** / generic **user** do not use this web sidebar (feat-0001).

### C. Minister and creator — shared studio nav (same use cases)

9. Ministers and creators see the **identical** **Main** navigation set: Get Started (when allowed), Dashboard (studio home), Sermons, Analytics, Bin, Profile. No extra creator-only or minister-only Main items unless added in a future change with explicit role gates.

10. With a resolved **studio code**, Main links navigate under `/studio/{code}/…`, not legacy `/dashboard` or bare `/sermons`.

11. **Dashboard** means studio home (`/studio/{code}`).

12. **Sermons**, **Analytics**, and **Bin** use studio-scoped paths for that code.

13. **Profile** opens `/profile` (not studio-prefixed).

14. **Get Started** appears for **both ministers and creators** while that user’s **portal onboarding is not complete**; it links to `/get-started` and **must not** appear after onboarding is completed for that persona.

15. **Get Started** does **not** appear for **admin** or **super-admin**, regardless of onboarding state on other personas.

16. When no studio code is cached yet, studio-scoped links must not navigate to `/studio/` without a code segment.

17. The **Admin** nav group is **never** visible to ministers or creators.

18. Empty nav groups (no visible items) are omitted entirely—no empty section headers.

19. Active item reflects the current URL, including nested studio paths.

20. **Community** and other disabled links stay hidden.

### D. Admin (platform admin, not super-admin)

21. **Admin** users see **only** the **Admin** nav group: **Users**, **Sermons**, and related `/admin/*` destinations.

22. **Admin** users **never** see the **Main** studio group (Dashboard, Sermons, Analytics, Bin, Profile under `/studio/{code}/…`) in the sidebar, including on `/admin/*` and on studio URLs.

23. **Admin** users **never** see **Get Started** (Behavior 15).

24. Admin home (`/admin`) remains reachable; copy may point users to Admin sidebar tasks.

### E. Super-admin

25. **Super-admin** users see **both** the **Admin** group (Users, Sermons) **and** the **Main** studio group (same items as minister/creator, with studio code resolution).

26. **Super-admin** users **never** see **Get Started** (Behavior 15).

27. On `/admin/*`, super-admin still sees **Admin** and **Main** (both groups available).

28. On studio routes (`/studio/{code}/…`), super-admin uses **Main** links with the same studio code rules as ministers/creators (Behaviors 10–13).

29. Super-admin may use **Admin** links from any dashboard route where the admin group is shown.

### F. Logout and user avatar (all roles)

30. Every signed-in user with the dashboard shell (minister, creator, admin, super-admin) sees the **user avatar** control in the top navigation when the top bar is visible.

31. The avatar menu provides account actions including **Logout** (and may include Profile, Settings, or similar—exact items may evolve).

32. **Logout** is also available from the sidebar **footer** (or equivalent persistent shell action) for **all** the same roles—not only ministers/creators.

33. **Logout** from either entry point clears the session and returns the user to login (feat-0001)—never `href="#"`.

34. Admin and super-admin have the same logout and avatar affordances as ministers and creators.

### G. Navigation and security

35. Sidebar links use canonical route constants (no legacy `/dashboard`, `/upload-sermon` in user-visible nav).

36. Sidebar links use **studio code**, not user id, in URLs (feat-0001).

37. Sidebar links do not bypass **AuthGate** (unauthorized when role disallows route).

### H. Interaction and accessibility

38. Collapsed sidebar shows tooltips on items.

39. Keyboard focus order works for sidebar links.

40. Active item is visually distinct expanded and collapsed.

41. Primary nav items are not placeholder `#` links (footer install hint may remain non-navigable if product keeps it).

### I. Search

42. Sidebar search follows the existing expand/focus pattern without unsolicited navigation.

**Extended contract:** searchable destinations and sermon lookup — [feat-0028 SIDEBAR_SEARCH_SPEC.md](../feat-0028/SIDEBAR_SEARCH_SPEC.md).

### J. Must not regress

43. Minister **and creator** studio links resolve via `studio.code` after login.

44. Active states for upload sub-routes and admin sub-routes.

45. Collapse persistence.

46. Sidebar visible when top nav hidden on sermon canvas.

47. `navdata` roles aligned with `INTERNAL_PORTAL_ROLES` / `ADMIN_PORTAL_ROLES`.

48. Sidebar only inside `<Router>`.

49. Creators and ministers always share the same visible Main items (except Get Started gated only by onboarding, not by role).

50. **Admin** never sees Main; **super-admin** always sees Main + Admin when both groups apply to their user type.

## Resolved product decisions

| Topic | Decision |
|-------|----------|
| Creator vs minister nav | **Same** Main nav items and ordering |
| Get Started | **Minister + creator** when onboarding incomplete; **never** admin/super-admin |
| Logout / avatar | **All** portal roles; avatar in top nav + logout in avatar menu and sidebar footer |
| Analytics / Bin | **Shared** by minister and creator (same as Main) |
| Admin vs super-admin sidebar | **Admin:** Admin group only (no Main). **Super-admin:** Admin + Main (both) |

## Related specs

- [feat-0001 PRODUCT](../feat-0001/PRODUCT.md)
- [feat-0001 TECH](../feat-0001/TECH.md)
