# Troott web routing

## Sources of truth

- Path strings: [`src/routes/paths.ts`](../src/routes/paths.ts)
- Route tables (`Array<IRoute>` with `path`, `element`, `isAuth`, `subroutes`): `app.route`, `dashboard.route` (DashboardLayout + minister + studio), `admin.route`
- Sidebar metadata only (not mounted): [`src/routes/sidebar.route.ts`](../src/routes/sidebar.route.ts) — consumed by app seed / context, not merged into `routes.tsx`
- Router: [`src/routes/routes.tsx`](../src/routes/routes.tsx) — `useRoutes` + `isAuth` gate (no separate AppRoutes / ProtectedRoute)
- Nav labels: [`src/_data/navdata.tsx`](../src/_data/navdata.tsx) — studio-scoped links use legacy keys (`/dashboard`, `/sermons`) resolved via [`studio-nav.util.ts`](../src/utils/studio-nav.util.ts)

## Role namespaces

| Role | Default entry | URL prefix |
|------|---------------|------------|
| Minister / Creator | Studio (`/studio/:studioCode`) | `STUDIO_CONTENT_ROLES` |
| Minister (incomplete KYC) | `/get-started` | `MINISTER` only |
| Admin / Super | `/admin/users` | `ADMIN_PORTAL_ROLES` |

Post-auth redirect: `redirectAfterAuth` on [`useAuth`](../src/hooks/app/useAuth.ts)

## Studio (YouTube-style)

`/studio/{studioCode}/sermons/upload/...` — not root `/upload-sermon` or `/dashboard`.

## Admin platform

`/admin/users`, `/admin/sermons`, `/admin/sermons/minister/:ministerId`

## Legacy URLs

Do not register `/activate`, `/peview`, `/dashboard`, `/upload-sermon`, `/my-sermon`, etc. Old bookmarks 404.
