# Design system implementation steps

Based on [audit-report.md](./audit-report.md). Execute in order. Steps 1–5 address the audit; Step 6 is cleanup for consistency.

---

## Step 1: Canonical barrel exports

**Goal:** Single source of truth for all primitives via `@/components/ui`.

- Export **Layout** from `components/ui/index.ts`: `VStack`, `HStack`, `ScreenSection` and their prop types (`VStackProps`, `HStackProps`, `ScreenSectionProps`, `StackGap`).
- Export the **canonical OTP** component: choose one of `otp-forminput` | `otp-input` | `otpinput` (recommend `otp-forminput` if it is the one used on Verification) and add it to the barrel with its types.
- Optionally export **Modal** and **BottomSheet** (or `bottom-sheet-modal`) from `components/ui/index.ts` for discoverability.

**Done when:** Imports like `import { VStack, HStack, ScreenSection } from "@/components/ui"` and the chosen OTP from the barrel work; shared can re-export Layout from ui if desired.

---

## Step 2: Font enforcement (Matter only)

**Goal:** One font family (Matter) across all text primitives.

- In **components/ui/dropdown.tsx**, remove all `fontFamily: 'Poppins'` (placeholderStyle, selectedTextStyle, inputSearchStyle, and the inline `Text` in renderItem).
- Replace with Matter: use `theme.typography.regular` or `theme.typography.body2` (fontFamily + fontSize) from `@/constants/theme`, or use the `Text` component from `@/components/ui/text` with `variant="body2"` / `className="font-matter text-sm"` where a styled label is needed.
- Confirm no other file in `components/ui` references Poppins (grep for `Poppins`).

**Done when:** Only Matter is used for text in `components/ui`; dropdown matches other form primitives.

---

## Step 3: Slider primitive

**Goal:** Token-styled Slider in `components/ui` for Sleep Timer and playback (Figma nodes 2781:31995, 2781:27306).

- Add **components/ui/slider.tsx** that wraps `@react-native-community/slider`.
- Apply design tokens: track color from semantic tokens (e.g. `semanticColors.muted` or `bg-muted` via style), thumb/fill from primary (e.g. `semanticColors.primary`). Use `constants/tailwind-bridge.ts` (or theme) so colors stay aligned.
- Expose a simple API: `value`, `onValueChange`, `minimumValue`, `maximumValue`, optional `disabled`, and optional `className` or `trackStyle`/`thumbStyle` for overrides.
- Export Slider from `components/ui/index.ts`.
- Migrate at least one usage (e.g. mini-player or sermon scrubber) to the new primitive to validate.

**Done when:** Slider exists in the barrel and playback/Sleep Timer screens can use it with token-based styling.

---

## Step 4: Token migration (remove hardcoded values)

**Goal:** Replace hex, rgba, raw px, and non-token colors/radius/spacing in the listed primitives.


| File                   | Change                                                                                                                                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **dropdown.tsx**       | `#a1a1aa` -> `semanticColors.mutedForeground` or border/placeholder tokens; `backgroundColor: 'white'` -> `semanticColors.card` or `bg-card`; `borderRadius: 8` -> theme radius (e.g. `rounded-md`). Use theme.typography for font.     |
| **otp-input.tsx**      | `border-[#D1D5DB]` -> `border-border` (className) or semantic border token.                                                                                                                                                             |
| **otpinput.tsx**       | `#007AFF` -> primary token; `borderRadius: 5` -> `rounded-sm` or theme radius.                                                                                                                                                          |
| **selection-card.tsx** | `bg-white` -> `bg-card`; hex colors -> semantic (e.g. `semanticColors.foreground`, `semanticColors.card`); `borderRadius: 8/12` -> `rounded-md`/`rounded-lg`; `h-[100px]` -> token if available (e.g. `min-h-25` or keep with comment). |
| **form-switch.tsx**    | `#ffffff` -> semantic (e.g. `semanticColors.cardForeground` or primary-foreground).                                                                                                                                                     |
| **bottom-sheet.tsx**   | Overlay -> semantic overlay (e.g. `rgba(0,0,0,0.5)` from tokens or a single overlay color in tailwind-bridge); sheet background/thumb -> `bg-card` / semantic neutrals; `shadowColor` -> token or design-system shadow.                 |
| **tab-bar.tsx**        | `shadowColor: '#000'` -> token or remove if not in design system.                                                                                                                                                                       |
| **toast.tsx**          | Map success/error/info/warning hex to semantic tokens (`destructive`, `primary`, etc.); `borderRadius: 16`, `padding: 16` -> `rounded-xl`, `p-4`.                                                                                       |
| **radio-button.tsx**   | Gradient/border -> semantic border/background tokens; `p-[14px]` -> `p-3.5` or spacing token.                                                                                                                                           |
| **dropdown-menu.tsx**  | `bg-white` -> `bg-card`; `min-w-[180px]` -> keep or add a `minWidth` token if defined.                                                                                                                                                  |
| **button.tsx**         | Align secondary/tertiary/error to `semanticColors` (or document that they intentionally use `ColorPalette`).                                                                                                                            |


**Done when:** No hardcoded hex/rgba or raw Figma numbers for colors/radius in these files; they use `tailwind-bridge` / theme / Tailwind semantic classes.

---

## Step 5: Arbitrary values and documentation

**Goal:** Prefer scale tokens over arbitrary values; document any intentional exceptions.

- **Button:** Replace `min-h-[48px]` with `min-h-12` (48px on 4px grid) in sizeClasses if the theme extend defines `12` as 48px; otherwise leave and add a short comment that it matches Figma 48.
- **Switch:** Consider a single size variant (e.g. default) that uses theme spacing (e.g. `w-10`/`h-6` for track, `w-5`/`h-5` for thumb) instead of raw `w-[42px]` etc., or document the current px as the design-system size.
- **Selection-pill:** Consider `h-11` and `rounded-full` (or a pill radius token) instead of `h-[44px]` and `rounded-[30px]` if they match the scale.
- **Button variants:** If secondary/tertiary/error are left on `ColorPalette`, add a one-line comment in button.tsx (or in design-system README) that brand/secondary colors are intentionally from theme palette, not semantic tokens.

**Done when:** Arbitrary values are reduced or documented; design-system README (or audit-report) reflects any intentional deviations.

---

## Step 6: Clean up duplicate ui files

**Goal:** Remove duplicate copies in `components/ui` so the design system has one canonical Input and one Loader.

- `**input copy.tsx`** and `**loader copy.tsx**` in `components/ui` are duplicates of `input.tsx` and `loader.tsx`. The app imports `Input` from `@/components/ui/input`, `FormInput` from `@/components/ui/forminput`, and `Loader` from `@/components/ui/loader`; nothing imports the " copy" files.
- Grep the repo for any reference to `input copy` or `loader copy` (path or filename); if none, delete `components/ui/input copy.tsx` and `components/ui/loader copy.tsx`.
- If anything did import them, point those imports to the canonical `input` or `loader` and then delete the copy files.

**Done when:** Only `input.tsx` and `loader.tsx` exist in `components/ui`; no duplicate copies.

---

## Completion checklist

- Step 1: Layout + OTP (+ optional Modal/BottomSheet) exported from `components/ui/index.ts`.
- Step 2: Dropdown and entire `components/ui` use Matter only; no Poppins.
- Step 3: Slider primitive in ui with token styling; exported; at least one usage migrated.
- Step 4: All listed primitives use semantic tokens (no hardcoded hex/rgba/raw radius).
- Step 5: Button/Switch/Selection-pill use tokens or are documented; audit summary can be updated to “Yes.”
- Step 6: `input copy.tsx` and `loader copy.tsx` removed; no broken imports.

After all steps, re-run the audit structure (missing primitives, violations, font, recommendations, summary) to confirm the design system is complete and consistent.

