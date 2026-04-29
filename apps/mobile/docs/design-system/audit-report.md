# Design system audit report (base @components/ui)

Figma: 9lFM6TncipSv0pNVGBWZwA. Channel: mehslzoh (or 7t5m5zh5). React Native (Expo), NativeWind, rn-primitives. Core primitives: Text, Layout (VStack, HStack, ScreenSection). Box is not used.

---

## a) Missing Primitives

| Figma element / screen                                         | Gap                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Slider** (Sleep Timer 2781:31995, Playing sermon 2781:27306) | No token-styled Slider in `components/ui`. App uses `@react-native-community/slider` directly in mini-player, sermon screen, scrubber. Add a `Slider` primitive that wraps the community slider and applies track/thumb tokens (e.g. `bg-muted`, `bg-primary`).             |
| **Layout in barrel**                                           | VStack, HStack, ScreenSection live in `components/ui/layout.tsx` and are documented as canonical but are **not** exported from `components/ui/index.ts`. They are re-exported via `components/shared` only. For a single source of truth, export Layout from the ui barrel. |
| **OTP input**                                                  | `otp-forminput`, `otp-input`, `otpinput` exist in ui folder but none are exported from `components/ui/index.ts`. Verification screen (Figma 1166:6102) is covered by usage but the primitive is not part of the canonical barrel.                                           |
| **Modal / BottomSheet**                                        | `modal.tsx`, `bottom-sheet-modal.tsx` exist but are not in `components/ui/index.ts`. Figma flows (e.g. Create playlist, Sharing) may need overlays; they are available by path but not as first-class primitives in the barrel.                                             |

All other Figma screens (Splash, Auth, Home, Playlist, Search, Library, Profile, Settings, Button set) have corresponding primitives: Button, Card, Text, Input, Label, Checkbox, Progress, Avatar, AlertDialog, TabBar, SelectionPill, etc.

---

## b) Violations / Inconsistencies

| Location                             | Issue                                                                                                                                                                                                                                                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **components/ui/dropdown.tsx**       | Hardcoded `#a1a1aa`, `fontFamily: 'Poppins'`, `fontSize: 14`, `borderRadius: 8`, `backgroundColor: 'white'`. Should use semantic tokens: `border-border`, `text-muted-foreground`, `bg-card` (or `bg-background`), Matter via theme/className, `rounded-md`/`rounded-sm`, and `theme.typography` or `text-sm`. |
| **components/ui/otp-input.tsx**      | `border-[#D1D5DB]` — use `border-border`.                                                                                                                                                                                                                                                                      |
| **components/ui/otpinput.tsx**       | `backgroundColor: "#007AFF"`, `borderRadius: 5` — use primary token and radius token (e.g. `rounded-sm`).                                                                                                                                                                                                      |
| **components/ui/selection-card.tsx** | `bg-white`, `#FFFFFF`, `#D1D5DB`, `borderRadius: 8` / `12`, `h-[100px]`. Should use `bg-card`, semantic colors, `rounded-md`/`rounded-lg`, and spacing tokens.                                                                                                                                                 |
| **components/ui/form-switch.tsx**    | `backgroundColor: "#ffffff"` — use semantic token (e.g. `bg-primary-foreground` or design token).                                                                                                                                                                                                              |
| **components/ui/bottom-sheet.tsx**   | `backgroundColor: 'rgba(0, 0, 0, 0.5)'`, `#ffffff`, `#6b7280`, `#d1d5db`, `shadowColor: '#000'`. Should use semantic overlay/card/neutral tokens.                                                                                                                                                              |
| **components/ui/tab-bar.tsx**        | `shadowColor: '#000'` — use token or design-system shadow if defined.                                                                                                                                                                                                                                          |
| **components/ui/toast.tsx**          | Hex colors for success/error/info/warning (`#16a34a`, `#dc2626`, etc.), `borderRadius: 16`, `padding: 16`. Should map to semantic tokens (e.g. `destructive`, `primary`, `success`) and token spacing/radius (`rounded-xl`, `p-4`).                                                                            |
| **components/ui/radio-button.tsx**   | `rgba(0,0,0,0)` / `rgba(237, 220, 241, 0.5)` gradient, `border-neutral-100`, `p-[14px]`. Prefer semantic border/background tokens and spacing token (e.g. `p-3.5` or scale).                                                                                                                                   |
| **components/ui/dropdown-menu.tsx**  | `bg-white`, `min-w-[180px]` — use `bg-card` and a width token if available.                                                                                                                                                                                                                                    |
| **components/ui/button.tsx**         | Secondary, tertiary, and error variants use `ColorPalette` (theme.ts) instead of `semanticColors` / Tailwind tokens; primary/outline/ghost are token-aligned. Inconsistent token source.                                                                                                                       |
| **components/ui/button.tsx**         | `min-h-[48px]` — matches Figma but is arbitrary; consider `min-h-12` (48px on 4px grid) for token consistency.                                                                                                                                                                                                 |
| **components/ui/switch.tsx**         | Raw dimensions `w-[42px] h-[24px]`, `w-[20px] h-[20px]`, `w-[14px] h-[14px]` — consider size tokens or a single size scale.                                                                                                                                                                                    |
| **components/ui/selection-pill.tsx** | `h-[44px]`, `rounded-[30px]` — consider spacing/radius tokens.                                                                                                                                                                                                                                                 |

Layout primitives (VStack, HStack, ScreenSection) use token-based gaps (`gap-2`–`gap-8`) and `px-4` for ScreenSection; no Box usage. Container/stacking behavior is correct.

---

## c) Font Audit

| Requirement                 | Status                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Single font family (Matter) | **Not fully applied.**                                                                                                                                                                                                                                                                                                                                                                   |
| **Deviations**              | **components/ui/dropdown.tsx**: `fontFamily: 'Poppins'` in four places (placeholderStyle, selectedTextStyle, inputSearchStyle, and inline `Text` style for renderItem). All other text in `components/ui` uses Matter via `theme.typography`, `Typography.*`, or `font-matter` (NativeWind). `constants/theme.ts` and `constants/typography.ts` define Matter only; no Poppins in theme. |

Typography scale (xs, sm, base, lg, xl, 2xl, etc.) is defined in normalized-scales.md; Text component supports variant/weight/size. Dropdown is the only primitive that forces a second font.

---

## d) Recommendations

1. **Barrel and Layout**  
   Export `VStack`, `HStack`, `ScreenSection` (and their types) from `components/ui/index.ts` so Layout is a first-class primitive and imports can use `@/components/ui` consistently.

2. **Slider**  
   Add a `Slider` primitive in `components/ui` that wraps `@react-native-community/slider` and applies track/thumb colors and sizes from the token system (e.g. `bg-muted`, `bg-primary`).

3. **Font**  
   Replace all `Poppins` usage in `dropdown.tsx` with Matter (e.g. `theme.typography.regular` / `body2` or `font-matter` + `text-sm`).

4. **Token migration**  
   Replace hardcoded colors and raw dimensions in dropdown, otp-input, otpinput, selection-card, form-switch, bottom-sheet, toast, radio-button, dropdown-menu with semantic tokens and spacing/radius scales from `tailwind-bridge` and `normalized-scales.md`.

5. **Button**  
   Either align secondary/tertiary/error to `semanticColors` (or Tailwind semantic names) for a single token source, or document that brand/secondary colors intentionally use `ColorPalette`.

6. **OTP and overlays**  
   Decide canonical OTP component (e.g. `otp-forminput`) and export it from `components/ui/index.ts`. Optionally export Modal/BottomSheet from the barrel for discoverability.

7. **Arbitrary values**  
   Where possible, replace arbitrary Tailwind values (e.g. `min-h-[48px]`, `h-[44px]`, `rounded-[30px]`) with theme or scale tokens (e.g. `min-h-12`, `rounded-full` or a pill radius token).

---

## e) Summary

| Question                                                                      | Answer  |
| ----------------------------------------------------------------------------- | ------- |
| Do all Figma-relevant primitives exist and follow the design system patterns? | **No.** |

-   **Missing:** Token-based Slider in ui; Layout and OTP not in ui barrel; Modal/BottomSheet not in barrel.
-   **Violations:** Dropdown uses Poppins and hardcoded colors/sizes; multiple ui components use hex, raw px, or non-token radius/padding; Button secondary/tertiary/error not on semantic tokens.
-   **Font:** Matter is the designated family; Dropdown is the only primitive using Poppins.
-   **Layout:** Layout (VStack, HStack, ScreenSection) is token-aligned and handles container/stacking; Box is correctly unused.

After applying the recommendations (Layout + Slider in barrel, Matter-only fonts, token migration for listed components, Button token alignment), the base `@components/ui` layer can be considered complete and consistent with the design system.
