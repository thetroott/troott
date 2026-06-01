# feat-0012: Tech Spec — Web portal settings (`/settings`)

## Context

See [`PRODUCT.md`](./PRODUCT.md). Implementation: `apps/web/src/app/settings/` + `components/features/settings/`.

---

## Routes

| Path | Component | Notes |
| ---- | ----------- | ----- |
| `settings` | `SettingsPage` | Account settings |

Register in `minister.route.tsx` alongside profile routes.

```ts
// paths.ts
export const PATH_SETTINGS = '/settings';
```

**Auth:** extend `canAccessReturnPath` and `isPassthroughNavUrl` for `/settings` (same as `/profile`).

---

## File map

| File | Role |
| ---- | ---- |
| `app/settings/SettingsPage.tsx` | Page shell + sections |
| `components/features/settings/AccountInformationSection.tsx` | Name/email form |
| `components/features/settings/UpdatePasswordSection.tsx` | Password card |
| `components/features/settings/DeleteAccountSection.tsx` | Deactivate + confirm |
| `components/features/settings/SettingsSectionCard.tsx` | Shared card wrapper |
| `hooks/app/useAccount.ts` | `useCurrentAccountQuery` (existing) |
| `hooks/app/useSettings.ts` | `useUpdateAccountMutation`, `useDeactivateAccountMutation` |
| `api/clients/user.ts` | `getCurrentAccount`, `updateProfile`, `deactivateAccount` |

---

## Data flow

```text
SettingsPage
├── useCurrentAccountQuery() → GET /user
├── AccountInformationSection → useUpdateAccountMutation → PUT /user
├── UpdatePasswordSection → useAuth().changePassword → POST /auth/change-password
│   └── on success → clearLocalAuth + navigate /login
└── DeleteAccountSection → useDeactivateAccountMutation → DELETE /user/deactivate
    └── on success → logout flow
```

After account update: `queryClient.invalidateQueries(accountQueryKeys.current())` + `refreshSession({ force: true })`.

---

## UI tokens

Reuse portal dark cards (feat-0011):

- Card: `rounded-xl border border-[#545454] bg-[#2b2a2c] p-6`
- Title: `text-lg font-semibold text-[#eaeaea]`
- Description: `text-sm text-[#bdbdbd]`
- Primary save: default `Button` or `#08ffdb` accent
- Destructive: `variant="destructive"`

---

## Implementation checklist

| # | Task | Status |
| - | ---- | ------ |
| 1 | Spec PRODUCT + TECH | Done |
| 2 | `PATH_SETTINGS` + route | Done |
| 3 | Sidebar + UserAvatar links | Done |
| 4 | Settings page + sections | Done |
| 5 | Account PUT + deactivate hooks | Done |
| 6 | Password logout-after-success | Done |
| 7 | Update `07 - settings.md` + README | Done |

---

## Cross-references

- [`07 - settings.md`](../../07%20-%20settings.md)
- [feat-0011](../feat-0011/TECH.md) — public profile vs account settings split
