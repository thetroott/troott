# UI Components

A collection of reusable UI components built using the design system, imported from Figma with high design fidelity.

## Available Components

### Button Component

A versatile button component with multiple states and smooth animations. Styled with Tailwind CSS classes.

**Quick Start:**

```tsx
import { Button } from '@/components/ui/button';

<Button onPress={() => console.log('Pressed')}>
  Button Text
</Button>
```

**Features:**
- 4 states: default, pressed, disabled, loading
- Smooth color transitions on press
- Animated 3-dot pulsating loading indicator
- Multiple sizes (sm, default, lg)
- 3 variants: primary (purple), secondary (orange), tertiary (text-only)
- Full theme support (uses design system colors)
- Uses design system tokens (no hardcoded values)

**Documentation:** See `/docs/BUTTON_COMPONENT.md` for complete documentation.

**Demo:** See `/components/button-demo.tsx` for usage examples.

### Input Component

A flexible, fully-featured text input component with support for labels, descriptions, icons, password strength indicators, and error states. Styled with Tailwind CSS classes.

**Quick Start:**

```tsx
import { Input } from '@/components/ui/input';

<Input
  label="Email"
  placeholder="Enter your email"
  description="We'll never share your email"
/>
```

**Features:**
- Label and description text
- Leading and trailing icons
- Password strength indicator (4 levels)
- Error and info states
- Focus and disabled states
- Full theme support (light/dark)
- Uses design system tokens (no hardcoded values)

**Documentation:** See `/docs/INPUT_COMPONENT.md` for complete documentation.

**Demo:** See `/components/input-demo.tsx` for usage examples.

### Selection Pill Components

Multi-selection pill components with animated icon transitions. Includes both individual SelectionPill and SelectionPillGroup for managing multiple selections. Styled with Tailwind CSS classes.

**Quick Start:**

```tsx
import { SelectionPillGroup } from '@/components/ui/selection-pill-group';

<SelectionPillGroup
  label="Select interests"
  options={[
    { label: 'Relationship Advice', value: 'relationships' },
    { label: 'Mental Health', value: 'mental-health' },
  ]}
  selectedValues={selected}
  onSelectionChange={setSelected}
/>
```

**Features:**
- Animated icon transition (add → checkmark)
- Icon background fill animation
- 360° rotation and scale effects
- Multi-selection support via SelectionPillGroup
- Disabled state support
- Full theme support (uses design system colors)
- Uses design system tokens (no hardcoded values)

**Documentation:** See `/docs/SELECTION_PILL_COMPONENT.md` for complete documentation.

**Demo:** See `/components/selection-pill-demo.tsx` for usage examples.

### Radio Button Components

Multi-choice radio button form components with label and description support. Includes both individual RadioButton and RadioGroup for managing selections. Styled with Tailwind CSS classes.

**Quick Start:**

```tsx
import { RadioGroup } from '@/components/ui/radio-group';

<RadioGroup
  label="Select an option"
  options={[
    { label: 'Option 1', value: 'opt1', description: 'First option' },
    { label: 'Option 2', value: 'opt2', description: 'Second option' },
  ]}
  value={value}
  onValueChange={setValue}
/>
```

**Features:**
- Label with optional description text
- Distinct selected/unselected visual states
- Smooth spring-based animations (background, text, radio indicator)
- RadioGroup for easy multi-option management
- Disabled state support
- Full theme support (uses design system colors)
- Uses design system tokens (no hardcoded values)

**Documentation:** See `/docs/RADIO_COMPONENT.md` for complete documentation.

**Demo:** See `/components/radio-demo.tsx` for usage examples.

### Switch Component

A smooth, animated toggle switch component with optional icon support. Styled with Tailwind CSS classes.

**Quick Start:**

```tsx
import { Switch } from '@/components/ui/switch';

<Switch value={enabled} onValueChange={setEnabled} />
```

**Features:**
- Smooth spring-based animation
- Optional icons for ON/OFF states (14x14)
- Disabled state support
- Full theme support (uses design system colors)
- Uses design system tokens (no hardcoded values)

**Documentation:** See `/docs/SWITCH_COMPONENT.md` for complete documentation.

**Demo:** See `/components/switch-demo.tsx` for usage examples.

### Tab Bar Component

A beautiful, animated bottom tab navigation component for Expo Router. Styled with Tailwind CSS classes.

**Quick Start:**

```tsx
import { Tabs } from 'expo-router';
import { TabBar } from '@/components/ui/tab-bar';

<Tabs tabBar={(props) => <TabBar {...props} />}>
  {/* Your tab screens */}
</Tabs>
```

**Features:**
- Animated selection with smooth transitions
- Slide animation (label slides out from icon to the right)
- Dynamic width (expands when selected to show label)
- Icon color transitions
- Label slides out/in with fade, size, and color animation
- Shadow effect matching Figma
- Expo Router compatible
- Uses design system tokens (no hardcoded values)

**Documentation:** See `/docs/TAB_BAR_COMPONENT.md` for complete documentation.

**Example:** See `/components/tab-bar-example-layout.tsx` for implementation example.

### Text Component

An extended Text component with typography variant support.

**Quick Start:**

```tsx
import { Text } from '@/components/ui/text';

<Text variant="h1">Main Heading</Text>
<Text variant="body1">Body text</Text>
```

**Features:**
- Typography variant support (h1-h4, body1-body2, caption, small, button variants)
- Theme-aware colors
- Tailwind className support
- Slot support for composition

---

## Imports

All UI components can be imported from the central export:

```tsx
import { Button, Input, RadioButton, RadioGroup, SelectionPill, SelectionPillGroup, Switch, TabBar, Text } from '@/components/ui';
```

Or individually:

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioButton } from '@/components/ui/radio-button';
import { RadioGroup } from '@/components/ui/radio-group';
import { SelectionPill } from '@/components/ui/selection-pill';
import { SelectionPillGroup } from '@/components/ui/selection-pill-group';
import { Switch } from '@/components/ui/switch';
import { TabBar } from '@/components/ui/tab-bar';
import { Text } from '@/components/ui/text';
```

## Design System Integration

All components use the design system tokens:

- **Colors:** `ColorPalette` and `Colors` from `@/constants/theme`
- **Typography:** `Typography` from `@/constants/theme`
- **Theme:** `useColorScheme` hook for automatic light/dark mode

No hardcoded values are used - everything is pulled from the design system.

## Styling Approach

All UI components follow a **Tailwind-first** approach:

- ✅ **Use `className` for static styles**: Layout, sizing, spacing, etc.
- ✅ **Use `style` prop for dynamic values**: Theme colors, computed values
- ✅ **Use `cn()` utility**: For conditional class composition
- ❌ **Avoid StyleSheet**: No `StyleSheet.create()` usage

**Example:**

```tsx
<View 
  className={cn(
    "flex-row items-center rounded-lg h-[50px] px-2.5",
    disabled && "opacity-50"
  )}
  style={{
    backgroundColor: theme.background,
    borderColor: isFocused ? theme.primary : 'transparent'
  }}
>
  {/* content */}
</View>
```

## Creating New Components

When creating new UI components:

1. Import from Figma (channel: `nr7n89vy`)
2. Map Figma values to design system tokens
3. Use existing colors and typography
4. Support light/dark themes
5. Use Tailwind classes for styling
6. Add TypeScript types
7. Create examples/demo
8. Document usage

## Examples

See the demo files for usage examples:

- `/components/button-demo.tsx` - Button component examples
- `/components/input-demo.tsx` - Input component examples
- `/components/radio-demo.tsx` - Radio button component examples
- `/components/selection-pill-demo.tsx` - Selection pill component examples
- `/components/switch-demo.tsx` - Switch component examples
- `/components/typography-demo.tsx` - Typography examples
- `/components/color-palette-demo.tsx` - Color usage examples

