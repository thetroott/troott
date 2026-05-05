# Legacy styles (reference only)

The files in this folder are **archived copies** of the old `assets/styles/*.tsx` modules (removed from the app). They are not imported anywhere. Use them to see **what the UI used to express in StyleSheet** and how that maps to the current stack.

| Archive                            | Original role                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| [components.tsx](./components.tsx) | `componentStyles` – forms, auth copy, OAuth, OTP, error boundary                  |
| [custom.tsx](./custom.tsx)         | `customStyles` – welcome shell, generic container/logo/text, margin/gap utilities |
| [troott.tsx](./troott.tsx)         | `troottStyles` – thin auth horizontal margin wrapper                              |

---

## What to learn from the old implementation

### 1. Tokens were already centralized

Old styles pulled from **`theme`** (`theme.colors.*`, `theme.typography.*`, `theme.sizes.spacing.*`). That is still the source of truth for **JS-only** values (e.g. icon colors, animated colors). Visual layout and color on screen should use **NativeWind** + [`constants/theme`](../../../constants/theme.ts) alignment (teal primary, grey surfaces, Matter fonts via `Text`).

### 2. Layout patterns map to primitives, not one-off StyleSheets

| Old pattern                                   | Meaning                               | Replace with                                                 |
| --------------------------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| `row`, `rowContainer`, `inputRoot`            | `flexDirection: 'row'`, space-between | `HStack` from `@/components/shared` with `justify="between"` |
| `welcomeScreenContainer`, stacked auth fields | Column + gap                          | `VStack` / `ScreenView` + `gap-*` classes                    |
| `customStyles.mt*`, `customStyles.g*`         | Margin / gap utilities                | Tailwind `mt-*`, `gap-*` (prefer scale: 4, 8, 16, 24)        |
| `troottStyles.authContainer`                  | `marginHorizontal: sm`                | Screen-level `px-4` on `ScreenView` / auth stack             |

Avoid reintroducing **ad-hoc margin/gap StyleSheet dictionaries**; use Tailwind or shared layout components.

### 3. Component-owned styles live on the component

| Old `componentStyles` key                                 | Modern home                                                                                                    |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `textInputContainer`, `tlabel`, `tcontainer`, `tinput`, … | [`components/ui/input`](../../../components/ui/input.tsx), [`forminput`](../../../components/ui/forminput.tsx) |
| `button`, `buttonPrimary`, `buttonSecondary`, …           | [`components/ui/button`](../../../components/ui/button.tsx) (`primary` / `outline` / …)                        |
| `title`, `subText`, `termsSubText`, links                 | [`components/ui/text`](../../../components/ui/text.tsx) + `className`                                          |
| `otpcontainer`, `otpBox`                                  | OTP UI under `components/ui/`                                                                                  |
| `OrCongtainer`, `line`, `orText`                          | OAuth divider: flex row + border lines; do not copy `left: 165.5` – use centered label with horizontal flex    |
| `econtainer`, `ebutton`, …                                | [`Error`](../../../components/containers/shared/Error.tsx) / app error UI                                      |

### 4. Anti-patterns in the old file (do not replicate)

- **Fixed horizontal padding on buttons** (`paddingHorizontal: 130`) – breaks on narrow/wide devices; use `w-full` + consistent height.
- **Percentage widths** (`width: '95%'`) on inputs – prefer full width inside padded parent (`w-full`).
- **Absolute “Or” divider** with magic `left: 165.5` – not responsive; use flex-based dividers.
- **Duplicate button definitions** – primary teal appears in both `button` and `buttonPrimary`; single `Button` variant avoids drift.

### 5. Welcome / splash semantics

`customStyles.welcomeScreen*` described a centered logo + headline on dark grey (`grey[900]`). The current splash follows **Figma** (node 4081-19306): full-bleed hero **453/812** height, **37px** gap (scaled) below hero, logo **116×32**, copy Matter **20/24** `#e8e8e8`, **32px** to CTAs, buttons **48h** radius **4**, teal `#08FFDB` / outline `#F7F7F7`. Implementation uses **`theme.colors.grey[900]`** (`#171717`), `VStack`, and `ScrollView` on short viewports so layout does not clip like old fixed-percent patterns. See [`app/index.tsx`](../../../app/index.tsx). Old **110×50** logo was pre-Figma.

### 6. Color reminders (dark-only app)

Old auth assumed **white** titles on dark greys. Today the shell is **dark-only** (`bg-neutral-950`, neutral borders). Link colors (`blue[300]`, `teal[500]` for resend) still map to the same theme hues; prefer **Tailwind** (`text-teal-500`, `text-blue-400`) or `theme.colors` in JS when `className` is not available.

---

## Related docs

- [NativeWind migration plan](../nativewind-migration.md) – phased migration and rules
- [Figma / shell alignment](../../figma-troott-ui.md)

When migrating a remaining screen, grep this folder for a **similar name** (e.g. `termsSubText`), then implement the same **intent** with `Text` + `className` and shared layout, not by copying `StyleSheet.create` blocks.
