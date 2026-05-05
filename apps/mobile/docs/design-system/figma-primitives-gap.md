# Figma nodes vs components/ui vs rn-primitives

Reference: [Figma document structure](./figma-styles.md) (Mobile Screens, channel `7t5m5zh5`), [rn-primitives](https://github.com/roninoss/rn-primitives).

## Figma nodes (screens / sections)

| Node / section                   | Id(s)                              | UI needs                        |
| -------------------------------- | ---------------------------------- | ------------------------------- |
| Splash Screen                    | 1166:6100, 4081:19306, 7070:20310  | Button, Text, layout            |
| Your Interests                   | 1166:6103, 9267:26419              | Selection (pills/chips), Button |
| Logging In                       | 1166:6099                          | Input, Button, Label, Link      |
| Forgotten Password               | 2300:8524                          | Input, Button, Label            |
| Create Account                   | 1166:6101                          | Input, Button, Label, Checkbox  |
| Verification                     | 1166:6102                          | OTP input, Button               |
| Home                             | 2781:24279                         | Card, list, tabs                |
| Playing / Pausing sermon         | 2781:27306, 2781:30872             | Progress, Slider, Button        |
| Sleep Timer                      | 2781:31995                         | Slider, Button                  |
| Profile                          | 4462:29795, 7968:21635             | Avatar, List, Button            |
| Ministers profile                | 7928:20594                         | Avatar, Card                    |
| Playlist + error states          | 2947:17156                         | List, Button, Alert-dialog?     |
| Sharing Sermon                   | 4430:44328                         | Share UI, Button                |
| Downloading                      | 2950:19554                         | Progress                        |
| Search, Library, Create playlist | 4827:13731, 7890:55400, 7384:55216 | Input, list, Button, Dialog?    |
| Button (component set)           | 7953:21955                         | Button (filled + outline)       |

## components/ui (current exports)

- Button, Card, Checkbox, Collapsible, Input, Loader, RadioButton, RadioGroup, SelectionPill, SelectionPillGroup, Switch, TabBar, Text.
- Also present (not all in index): Separator, Toast, Modal, BottomSheet, Dropdown, DropdownMenu, Portal, Layout (VStack, HStack, ScreenSection), Chip, Icon, etc.

## rn-primitives core (npm @rn-primitives/\*)

| Primitive     | In project  | components/ui                            |
| ------------- | ----------- | ---------------------------------------- |
| accordion     | No          | No                                       |
| alert-dialog  | No          | No                                       |
| aspect-ratio  | No          | No                                       |
| avatar        | No          | No                                       |
| checkbox      | No (custom) | Checkbox (custom)                        |
| collapsible   | No (custom) | Collapsible (custom)                     |
| context-menu  | No          | No                                       |
| dialog        | No          | Modal, BottomSheet (custom)              |
| dropdown-menu | No          | DropdownMenu (custom)                    |
| label         | No          | No                                       |
| progress      | No          | CircularProgress (custom), no linear     |
| radio-group   | No          | RadioGroup (custom)                      |
| select        | No          | Dropdown (custom)                        |
| separator     | Yes         | Separator (wrapper, not in index)        |
| slider        | No          | Uses @react-native-community/slider      |
| switch        | Yes         | Switch (custom), form-switch (primitive) |
| tabs          | No          | TabBar (custom)                          |
| toast         | Yes         | Toast (wrapper)                          |

## Gap: add to components/ui

| Primitive        | Reason                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- |
| **Label**        | Form a11y (Logging In, Create Account, Verification); links to Input/Checkbox via nativeID. |
| **Avatar**       | Profile, Ministers profile Figma screens.                                                   |
| **Progress**     | Linear progress for playback, Downloading screen; we have circular only.                    |
| **Alert-dialog** | Confirmations (delete playlist, logout, destructive actions).                               |

Separator already exists as a wrapper; add to `components/ui/index.ts` for canonical export.
