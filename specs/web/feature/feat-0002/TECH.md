# feat-0002: Tech Spec — Web portal sidebar

## Context

See [`PRODUCT.md`](./PRODUCT.md). Anchors: [`navdata.tsx`](../../../apps/web/src/_data/navdata.tsx), [`Sidebar.tsx`](../../../apps/web/src/components/shared/navigation/Sidebar.tsx), [`DashboardLayout.tsx`](../../../apps/web/src/components/layouts/DashboardLayout.tsx), [`studio-nav.util.ts`](../../../apps/web/src/utils/studio-nav.util.ts), [`UserAvatar.tsx`](../../../apps/web/src/components/shared/navigation/UserAvatar.tsx), [`NavBar.tsx`](../../../apps/web/src/components/shared/navigation/NavBar.tsx).

## Product rules (implementation)

| Rule | Implementation note |
|------|---------------------|
| Minister = creator Main nav | Same `navItems.mainNav` items; filter by minister/creator role—no split trees |
| Get Started | Show for `MINISTER` and `CREATOR` when onboarding incomplete; **hide** for `admin` and `superadmin` |
| Get Started gate | Minister: `isMinisterOnboardingComplete`. Creator: creator onboarding completion (or shared `onboard.status`) |
| **Admin sidebar** | `userType === admin` → **Admin group only**; hide entire **Main** group |
| **Super-admin sidebar** | `userType === superadmin` → **Admin + Main** groups (both visible on `/admin/*` and studio routes) |
| Sidebar role prop | Pass **actual** cookie/session `userType` into `AppSidebar`; do **not** map all admin-class users to `UserType.ADMIN` in `sidebarRoleFromCookie()` |
| Logout + avatar all roles | Wire `UserAvatar` Logout → `useAuth().logout`; wire sidebar footer Logout; `NavBar` for all roles when top nav shown |

## PRODUCT behavior mapping

| Behaviors | Files / action |
|-----------|----------------|
| 9–13, 20, 43, 49 | `navdata` + `resolveStudioNavUrl`; minister/creator same filter |
| 14–15, 23, 26 | `Sidebar.tsx` item filter; hide Get Started for admin/super |
| 17 | Admin group only for admin + super roles in navdata |
| 18 | Skip groups with zero visible items |
| 21–24 | Admin: hide `mainNav` group in `Sidebar.tsx` when `userType === admin` |
| 25–29, 50 | Super: show `mainNav` + Admin groups when `userType === superadmin` |
| 30–34 | `UserAvatar.tsx`, `navFooterItems`, `useAuth.logout` |
| 35–37 | paths.ts constants; AuthGate unchanged |
| 48 | `AuthSessionRouting` in `App.tsx` inside `<Router>` |

### Visible groups (target)

| Role | Main (studio) | Get Started | Admin group | Avatar + logout |
|------|---------------|-------------|-------------|-----------------|
| Minister | Yes | If onboarding incomplete | No | Yes |
| Creator | Yes (same as minister) | If onboarding incomplete | No | Yes |
| **Admin** | **No** | **No** | **Yes** | Yes |
| **Super-admin** | **Yes** | **No** | **Yes** | Yes |

### Implemented

- [`normalizePortalUserType`](../../../apps/web/src/utils/roles.util.ts), [`sidebar-nav.util.ts`](../../../apps/web/src/utils/sidebar-nav.util.ts), [`portal-onboarding.util.ts`](../../../apps/web/src/utils/portal-onboarding.util.ts)
- [`DashboardLayout.tsx`](../../../apps/web/src/components/layouts/DashboardLayout.tsx) — `sidebarUserTypeFromCookie()`
- [`Sidebar.tsx`](../../../apps/web/src/components/shared/navigation/Sidebar.tsx) — group/item filters, footer logout
- [`UserAvatar.tsx`](../../../apps/web/src/components/shared/navigation/UserAvatar.tsx) — avatar logout

### Proposed code changes (done)

1. **`DashboardLayout.tsx`**: Pass `cookieService.getUserType()` normalized to `UserType` (or raw string) to `AppSidebar`—preserve `superadmin` vs `admin`.

2. **`Sidebar.tsx`**:
   - If effective type is **admin** (not super): show only groups with `ADMIN_PORTAL_ROLES` (Admin group); **exclude** Main (`mainNav` studio group).
   - If effective type is **superadmin**: show Admin group **and** Main group (filter Main items for minister/creator roles + onboarding for Get Started only on studio roles).
   - If minister/creator: Main only; no Admin group.
   - Drop Get Started for admin/super; drop Get Started when onboarding complete (minister + creator).
   - Omit empty groups.

3. **`navdata.tsx`**: Optional: tag Main group with studio-only roles; Admin group stays `ADMIN_PORTAL_ROLES`.

4. **`UserAvatar.tsx`** + **sidebar footer**: Wire Logout to `useAuth().logout`.

5. **Creator onboarding**: Align Get Started visibility with creators (Behavior 14).

## Testing and validation

| Case | Steps |
|------|--------|
| Minister incomplete onboarding | Get Started visible; complete → hidden |
| Creator incomplete onboarding | Same Main as minister; Get Started visible |
| **Admin** login | Sidebar: **Users, Sermons only**—no Dashboard/Sermons/Analytics under Main |
| **Super-admin** login | Sidebar: **Users, Sermons** and **Main** (Dashboard, Sermons, etc.) |
| Admin on `/admin/users` | Still no Main links |
| Super on `/admin/users` | Admin + Main both visible |
| Get Started | Never for admin or super-admin |
| Logout | All roles: avatar + footer → login |
| Studio code | Minister, creator, super-admin Main: `/studio/{code}` |

```bash
cd apps/web && pnpm exec tsc --noEmit
```

## Related

- [feat-0004 PRODUCT](./feat-0004/PRODUCT.md) — minister/creator sidebar studio-scoped links and routing
- [feat-0001 TECH](../feat-0001/TECH.md)
