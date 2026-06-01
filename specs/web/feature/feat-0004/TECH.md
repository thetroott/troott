# feat-0004: Tech Spec — Minister/creator sidebar studio navigation

## Context

See [`PRODUCT.md`](./PRODUCT.md). Minister/creator **cannot route** when sidebar `href`s stay on legacy paths or when **studio code** is missing from storage. feat-0002 covered **which** groups show; feat-0004 covers **correct studio-scoped URLs**.

## Route source of truth

| Route | File | Path |
|-------|------|------|
| Studio shell | `studio.route.tsx` | `studio/:studioCode` + segments |
| Dashboard home | index under studio | `/studio/:studioCode` |
| Sermons | `PATH_SEG_SERMONS` | `/studio/:studioCode/sermons` |
| Analytics | `PATH_SEG_ANALYTICS` | `/studio/:studioCode/analytics` |
| Bin | `PATH_SEG_BIN` | `/studio/:studioCode/bin` |
| Profile | `app.route` / minister routes | `/profile` |
| Get started | `minister.route.tsx` | `/get-started` |

Constants: `apps/web/src/routes/paths.ts` — use these in navdata and resolvers, not ad hoc strings.

## Current implementation (audit)

| File | Role | Gap vs PRODUCT |
|------|------|----------------|
| [`navdata.tsx`](../../../apps/web/src/_data/navdata.tsx) | Declares Main items | Uses `/dashboard`, `/sermons`, `/analytics`, `/bin` (legacy) |
| [`studio-nav.util.ts`](../../../apps/web/src/utils/studio-nav.util.ts) | `resolveStudioNavUrl`, `getStoredStudioCode` | Only reads **localStorage**; no URL param; no disable when code missing |
| [`Sidebar.tsx`](../../../apps/web/src/components/shared/navigation/Sidebar.tsx) | Renders `Link to={resolveStudioNavUrl(item.url)}` | Does not pass route `studioCode`; no disabled state |
| [`DashboardLayout.tsx`](../../../apps/web/src/components/layouts/DashboardLayout.tsx) | `userRole` from cookie | OK for feat-0002; does not supply studio code |
| [`sessionState.tsx`](../../../apps/web/src/context/session/sessionState.tsx) | `storage.setStudioCode(sessionUser.studioCode)` on refresh | Runs **after** first sidebar paint possible |
| [`persistAuthFromResponse`](../../../apps/web/src/api/services/local-storage.ts) | Login/activate persist | Does **not** set `studioCode` from `user` (login returns `studioCode`) |
| [`useAuth.ts`](../../../apps/web/src/hooks/app/useAuth.ts) login | `persistAuthFromResponse` + `refreshSession` | Code may be unset until refresh completes |
| [`studio-portal.util.ts`](../../../apps/web/src/utils/studio-portal.util.ts) | Post-auth `navigateToStudioPortal` | Sets code when entering studio; sidebar on `/get-started` still broken |
| [`StudioPortal.tsx`](../../../apps/web/src/app/studio/StudioPortal.tsx) | Syncs code from loaded studio | OK when user is already on studio route |

### Symptom → cause

| Symptom | Likely cause |
|---------|----------------|
| Click Dashboard → `/dashboard` or 404 | No `studioCode` in storage; resolver returns raw legacy `url` |
| Click Sermons → `/sermons` not under studio | Same |
| Links work after visiting studio once | Code cached in localStorage after `StudioPortal` / session refresh |
| Wrong studio in links | Stale storage; URL `:studioCode` ignored |
| Minister just logged in, sidebar wrong | `user.studioCode` not written on login persist |

## Product rules (implementation)

| Rule | Target |
|------|--------|
| Code priority | URL `:studioCode` → `user.studioCode` → `useStudio()` / my-studio primary `studio.code` → localStorage |
| Primary studio | `MyStudioResponseDTO.studio` only until multi-studio picker; no arbitrary studio from a list |
| Nav output | `/studio/{code}/…` or disabled (Behavior 15) |
| Sermons active | `currentPath === href \|\| currentPath.startsWith(\`${href}/\`)` with `href` = `/studio/{code}/sermons` (upload wizard included) |
| Super-admin on `/admin/*` | Same rewrite for **Main** when code exists; disabled when not; **Admin** hrefs unchanged |
| Cache on login | Set `studioCode` from `data.user.studioCode` when present |
| navdata | Prefer `paths.ts` helpers (`studioSermonsListPath`, etc.) or stable logical keys |
| No new abstraction layer | Extend `resolveStudioNavUrl(code, url)` or inline in Sidebar with `useParams` + `useStudio` |

## Proposed code changes (minimal)

1. **`resolveStudioNavUrl`** — accept optional `studioCode` argument; default: read from `useParams().studioCode`, then `useStudio().studioCode`, then `getStoredStudioCode()`.

2. **`Sidebar.tsx`** — pass resolved code into resolver; if studio link and no code, render disabled button or `span` (no `Link` to legacy path).

3. **`persistAuthFromResponse` or `useAuth.login`** — after user object parsed, `if (user.studioCode) storage.setStudioCode(...)`.

4. **`navdata.tsx`** (optional cleanup) — set item urls to legacy keys only used by switch, or document segment constants; ensure switch cases match declared urls (`/sermons` ↔ `` `/${PATH_SEG_SERMONS}` ``).

5. **Active state** — prefix match on studio-scoped `href` (Behaviors 16–17). `Sidebar.tsx` already uses exact match + `startsWith(\`${href}/\`)`; ensure resolved `href` is never legacy `/sermons` when a code exists.

6. **Super-admin** — no special-case resolver on `/admin/*`; pass the same resolved code (storage/session when URL has no param). Platform **admin** role never renders Main (feat-0002).

No separate `sidebar-studio.util.ts` unless logic exceeds ~30 lines in `studio-nav.util.ts`.

## PRODUCT behavior mapping

| Behaviors | Action |
|-----------|--------|
| 1–6, 11–12 | `resolveStudioNavUrl` + code priority + primary studio |
| 7–10, 25–27 | feat-0002 unchanged |
| 13–14 | Get Started / Profile passthrough |
| 15 | Disabled Main items when no code |
| 16–17 | Sermons prefix active + `Link` |
| 18–21 | login persist + session refresh + post-auth |
| 22–24 | Super-admin Main on `/admin/*` (cached code + disabled fallback) |
| 28–31 | Regression checks |

## Testing and validation

| Case | Expected sidebar href (code = `ABC`) |
|------|--------------------------------------|
| On `/studio/ABC/sermons` | Dashboard → `/studio/ABC`; Sermons → `/studio/ABC/sermons` |
| On `/get-started`, code only in user/session | Same hrefs after hydrate; disabled before code |
| On `/get-started`, no code | Studio items disabled (or get-started), not `/dashboard` |
| Minister login, API `studioCode: ABC` | After redirect to studio, links use `ABC` |
| Creator login with studio | Same as minister |
| Reload `/studio/ABC/analytics` | Analytics active; links use `ABC` |
| On `/studio/ABC/sermons/upload/file` | **Sermons** active (prefix), not Dashboard |
| my-studio returns `studio.code: ABC`; user `studioCode: ABC` | Sidebar hrefs use `ABC` |
| Super-admin on `/admin/users`, storage has `ABC` | Main → `/studio/ABC/…`; Admin → `/admin/users` |
| Super-admin on `/admin/users`, no code | Main studio items disabled; Admin works |
| Platform admin on `/admin/users` | No Main group (feat-0002) |

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Manual: login as minister (`odamola@…` or test minister) → open Dashboard / Sermons from sidebar → URL must stay under `/studio/{code}/…`.

## Related

- [feat-0002 TECH](../feat-0002/TECH.md) — group visibility
- [feat-0001 TECH](../feat-0001/TECH.md) — `navigateToStudioPortal`, post-auth
- [`specs/auth/feature/feat-0003/PRODUCT.md`](../../auth/feature/feat-0003/PRODUCT.md) — admin login (different sidebar)
