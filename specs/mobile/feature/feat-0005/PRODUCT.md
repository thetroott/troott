# feat-0005: Home tab and discovery rails

## Summary

The **Home** tab shows personalized rails (new sermons, ministers, topics, continue listening, etc.), pull-to-refresh, skeleton loading, and card interactions that lead to play, detail, or see-more lists. Complements [`specs/api/mobile-flow.md`](../../../api/mobile-flow.md) §4E and [`00 - home.md`](../../00%20-%20home.md).

## Problem

Home composes multiple hooks, seed/catalog data, and engine play entry points. Without spec linkage, new rails break loading/error patterns or bypass network checks.

## Non-goals

- Search tab (feat-0006).
- Full minister profile product (partially under `app/minister/*`).

## Consumer

Onboarded signed-in listeners.

## Behavior

1. First load shows **per-rail skeletons**; failed rail inline retry.
2. Empty personalized rails show headline + Browse/Search CTAs — no blank gaps.
3. **Pull-to-refresh** updates feed; offline banner when disconnected.
4. **Continue listening** row when `lastPlayed` or history exists (feat-0004).
5. Card tap: consistent play vs detail rule app-wide.
6. **See more** routes (`app/see-more/*`) extend a rail without losing tab context.
7. Session expired on Home → auth, not empty personalized shell.
8. Mini-player does not block Home scroll (feat-0003).

## Related docs

- [`TECH.md`](./TECH.md)
- Continue listening: [`02 - continue-listening.md`](../../02%20-%20continue-listening.md)
