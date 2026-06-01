# feat-0009: Tech Spec — Profile, notifications, and account

## Context

See [`PRODUCT.md`](./PRODUCT.md).

### React context (feat-0011)

Profile reads **`userContext`** for identity; persisted UI prefs use **`lib/preferences/`**, not Context.

| Concern | Path |
| ------- | ---- |
| Slice contract | [`feat-0011/TECH.md`](../feat-0011/TECH.md) |
| State ownership | [`feat-0010/TECH.md`](../feat-0010/TECH.md) |
| Identity hook | `components/features/profile/use-profile-identity.ts` → `useContextType()` |
| Haptics pref | `lib/preferences/app.ts` |

### Routes

| Screen | Path |
| ------ | ---- |
| Profile tab | `app/(tabs)/profile/index.tsx` |
| User stack | `app/user/_layout.tsx` |
| Edit | `app/user/edit-profile.tsx`, `edit-profile-saved.tsx` |
| Photo | `app/user/photo-picker.tsx` |
| Notifications | `app/user/notifications.tsx` |
| About | `app/user/about-troott.tsx` |

### Components and hooks

| Concern | Path |
| ------- | ---- |
| Profile screens | `components/features/profile/*` |
| User client | `api/clients/user.ts` |
| Upload | `api/hooks/shared/useUploadPhoto.ts` |
| Settings store | `lib/preferences/app.ts` — haptics, metrics flags |
| Auth password | `useAuth` change password mutation |

### PRODUCT mapping

| Behaviors | Implementation |
| --------- | -------------- |
| 1–2 | `profile-edit-screen.tsx`, `photo-picker` routes |
| 3 | Onboarding components reused from settings entry |
| 4 | `notifications.tsx`, OS permission helpers (TBD) |
| 5–6 | `useAuth`, security forms |
| 7 | Account delete flow components (verify implementation) |
| 8 | `about-troott-screen.tsx` |
| 9 | `app/user/notifications.tsx` |

### Gaps

| Gap | Note |
| --- | ---- |
| Push permission unified strategy | Document choice in PRODUCT §4 |
| Biometrics | [`00 - security.md`](../../00%20-%20security.md) — verify wired |
