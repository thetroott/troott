# feat-0028: Sidebar search — command palette

## Summary

Replace the placeholder **Quick Search** command dialog in the studio sidebar with a **Troott-native command palette** that lets signed-in portal users jump to pages, run common actions, and find sermons by title — without leaving the keyboard-first flow started by **⌘K** / **Ctrl+K**.

Today [`SearchForm`](../../../../apps/web/src/components/shared/dialog/Search.tsx) shows generic shadcn stubs (“New folder”, “Go to apps”) that do not match product routes, roles, or studio scoping.

## Problem

| Today | Gap |
| ----- | --- |
| Sidebar search opens `CommandDialog` | Items are template placeholders, not Troott destinations |
| Users navigate via sidebar only | No fast path to sermons, onboarding steps, or upload |
| My Sermons list has title filter (`q`) | Same search is not exposed globally from sidebar |
| [feat-0002](../feat-0002/PRODUCT.md) requires search affordance | Behavior beyond “open without unsolicited navigation” is undefined |

## Consumer

Authenticated portal roles on `apps/web`:

| Role | Palette scope |
| ---- | ------------- |
| **Minister / creator** | Main nav, actions, onboarding (when incomplete), sermon content |
| **Admin** | Admin nav only (no studio Main group) |
| **Super-admin** | Admin nav + Main nav + sermon content when studio context exists |

## User stories

1. As a **minister**, I press **⌘K** and type “sermons” to open My Sermons without clicking the sidebar.
2. As a **creator**, I type a sermon title and land on **Edit** using the correct draft vs published route ([feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md)).
3. As a user still in **Get Started**, I search “verify account” and jump to the KYC step.
4. As a **super-admin**, I search “users” and open `/admin/users`.
5. As a user with incomplete onboarding, I see studio destinations **disabled with a clear reason** instead of being dropped into a broken URL.

## Success criteria

- Normative inventory in **[SIDEBAR_SEARCH_SPEC.md](./SIDEBAR_SEARCH_SPEC.md)** lists every v1 searchable item, role gate, and destination.
- Static index mirrors sidebar visibility rules from [feat-0002](../feat-0002/PRODUCT.md).
- Sermon title search reuses minister list API (`q`) with debounced fetch.
- Selecting a result **navigates once** and **closes** the palette; opening the palette never navigates by itself ([feat-0002 § I](../feat-0002/PRODUCT.md)).
- Placeholder shadcn groups removed from production UI.

## Non-goals

- Full-text search across platform users or admin sermon catalog until admin list UIs and APIs are wired ([AdminUsers.tsx](../../../../apps/web/src/app/admin/AdminUsers.tsx) is stub).
- In-palette execution of modal-only sermon actions (Share, Rename, Move to trash) — v2.
- Listener app, public auth pages while signed in, or legacy denied paths (`paths.ts` `LEGACY_DENIED`).
- Series, Community, Comments, Playlists (commented or unshipped nav).
- **Install Troott on** footer CTA.
- Recent-search persistence and analytics instrumentation — v2.

## Normative spec

See **[SIDEBAR_SEARCH_SPEC.md](./SIDEBAR_SEARCH_SPEC.md)**.

## Related

- [feat-0002](../feat-0002/PRODUCT.md) — sidebar shell, search affordance, role matrix
- [feat-0010](../feat-0010/PRODUCT.md) — Get Started routes and hub items
- [feat-0011](../feat-0011/PRODUCT.md) — `/profile`
- [feat-0012](../feat-0012/PRODUCT.md) — `/settings`
- [feat-0017](../feat-0017/PRODUCT.md) — `/analytics`
- [feat-0019](../feat-0019/PRODUCT.md) — sermon library + bin
- [feat-0025](../feat-0025/SERMON_EDIT_ROUTING_SPEC.md) — draft → wizard, published → edit
- [feat-0023](../feat-0023/SERMON_ANALYTICS_SPEC.md) — per-sermon analytics route
