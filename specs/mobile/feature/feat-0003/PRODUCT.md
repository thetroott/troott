# feat-0003: Mobile tab shell and navigation

## Summary

Fully onboarded listeners use a **four-tab** shell (Home, Search, Library, Profile) with custom tab bar, embedded full player on tab stacks, and root overlays (mini-player, share flow, toasts). Complements [`specs/api/mobile-flow.md`](../../../api/mobile-flow.md) §2 and Home shell sections in [`00 - home.md`](../../00%20-%20home.md).

## Problem

Navigation spans Expo Router groups, pathname-based mini-player hiding, player modal stacks, and deep link bootstrap. Unclear rules cause double full-player trees or mini-player on editor screens.

## Non-goals

- Web sidebar (feat-0002 web).
- Individual feature content (Home rails → feat-0005; Search → feat-0006).

## Consumer

Onboarded signed-in listeners.

## Behavior

1. Default tab after onboarding: **Home**.
2. Tabs: Home, Search, Library, Profile — labels visible on tab bar.
3. **Mini-player** visible when playback active and path not in hide-list (e.g. profile photo picker, edit profile).
4. **Full player** embedded in tabs shell when now-playing modal route not focused (single tree rule).
5. Root `app/_layout.tsx` initializes RNTP, network store sync, share overlay, query persist, deep link bootstrap.
6. Push navigation from tabs uses stack within each tab where configured.
7. Session loss while on tabs → sign-in; no stale personalized chrome.
8. `InternetConnectionWatcher` surfaces offline state globally.
9. Splash hides after fonts + player setup (or error path with retry policy).

## Related docs

- [`TECH.md`](./TECH.md)
- Player UI: [feat-0004](../feat-0004/PRODUCT.md)
