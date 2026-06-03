# feat-0024: Minister profile — data fetch and actions parity

## Summary

Studio ministers manage their **public identity** at `/profile`. This feature spec closes the gap between **Figma** (read view + edit modal) and **production behavior**: correct API data on every surface, working **Edit profile** / **Save Changes**, and wired **Recent sermons** / **See all**.

Broader profile UX, use cases, and account-settings split remain in [feat-0011](../feat-0011/PRODUCT.md). This doc is the **normative contract** for the three Figma frames the product team linked for profile parity.

**Local dev:** [http://localhost:5173/profile](http://localhost:5173/profile)

## Problem

The read page and edit dialog are largely built, but listeners would see incomplete or placeholder content:

| Surface | Figma | Shipped (`UserProfile.tsx` / hooks) |
| ------- | ----- | ----------------------------------- |
| Page title + subtitle | Yes | **Missing** |
| Hero audience line (`600K monthly audience • 10.5k Followers`) | Yes | **Missing** |
| Insight cards (3 of 4) | Real numbers | **`—` placeholders** (only Member Since uses `createdAt`) |
| Contact / Ministry / Social (read) | Yes | **Missing** (About + Recent sermons only) |
| Recent sermons rows + **See all** | Yes | Static empty copy |
| Edit modal fields | Yes | **Mostly wired** via `GET/PUT /minister` + storage upload |
| Email / phone in edit | Not in Figma modal | Correctly on **Settings**, read-only on profile |

## Goals

1. **Read view** matches Figma `11578:98647` / `11745:106250` for layout and data (empty vs populated cover are both supported).
2. **Edit modal** matches Figma `11732:105889`; save persists via existing minister/creator APIs.
3. Every **action** (Edit profile, Save, Cancel, See all, inline Edit profile in About) has defined behavior and API backing.
4. No mock data, no invented metrics — use API fields or documented empty states.

## Non-goals

- Listener web profile (UC-P09 in feat-0011).
- Editing **slug**, **email**, **phone**, or **password** on `/profile` (Settings / future slug UX).
- Public anonymous profile URLs.
- Sermon edit ([feat-0022](../feat-0022/SERMON_EDIT_SPEC.md)) — separate route.

## Figma references

| Artifact | Node | Link |
| -------- | ---- | ---- |
| Profile read (minimal hero) | `11578:98647` | [Figma](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=11578-98647) |
| Profile read (cover populated) | `11745:106250` | [Figma](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=11745-106250) |
| Edit Profile modal | `11732:105889` | [Figma](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=11732-105889) |

Screenshots: [`assets/README.md`](./assets/README.md) (export via pacepard-ui-agent).

## Definition of done

- [x] Page header (title + subtitle) rendered.
- [x] Hero shows `monthlyListeners` + follower count when API provides them; otherwise hidden.
- [x] Four insight cards use real aggregates or `—` while loading / when API omits values.
- [x] Left column: About, Contact, Ministry Details, Social Networks (read-only) per Figma.
- [x] Recent sermons: top 3 published rows; **See all** → studio My Sermons.
- [x] Edit profile: modal fields save via existing `PUT` (unchanged in this feat).
- [ ] Manual QA checklist in [PROFILE_DATA_ACTIONS_SPEC.md](./PROFILE_DATA_ACTIONS_SPEC.md) passes.

## Related specs

| Doc | Role |
| --- | ---- |
| [PROFILE_DATA_ACTIONS_SPEC.md](./PROFILE_DATA_ACTIONS_SPEC.md) | Field ↔ API matrix, actions, gaps, QA |
| [TECH.md](./TECH.md) | Files, hooks, phased implementation |
| [Profile cover visibility (feat-0033)](../feat-0033/PRODUCT.md) + [API feat-0016](../../api/feature/feat-0016/PRODUCT.md) | Why uploaded avatar/cover do not show after GET |
| [feat-0011 PRODUCT](../feat-0011/PRODUCT.md) | Historical UC index and portal-wide image rules |
| [feat-0012](../feat-0012/PRODUCT.md) | Account settings |
