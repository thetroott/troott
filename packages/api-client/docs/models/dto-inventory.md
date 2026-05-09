# DTO file inventory

Each row is a concrete path under `packages/api-client/src`. **Barrel** = re-exported from `packages/api-client/src/dto-index.ts` (therefore available from `@troott/api-client/dto` and from the root `export * from './dto-index'`).

| Source file | Barrel | Notes |
|-------------|--------|--------|
| `api/authentication/auth.dto.ts` | yes | `RegisterUserDTO`, `LoginDTO`, OTP/password flows, `LogoutDTO`. Uses `OtpType` from `utils/enums.ts`. |
| `api/users/user/user.dto.ts` | yes | `TroottUser` (+ default export). |
| `api/users/profile/profile.dto.ts` | yes | Discriminated union `ProfileDTO` (`kind: 'listener' \| 'minister'`). Comment references `apps/api` profile module. |
| `api/core/sermon/sermon.dto.ts` | yes | `SermonDTO`, `CreateSermonDTO`, `UpdateSermonDTO`, `GetSermonDTO`. |
| `api/core/discovery/discovery.dto.ts` | yes | `RailId`, `DiscoveryRailDTO`, `DiscoveryHomeDTO`, `MinisterCardDTO`, `SermonCardDTO` (imports `SermonDTO` from `../sermon/sermon.dto.ts`). |
| `api/payments/plan.dto.ts` | yes | `IPlanPricing`, `IPlanTrial`, `PlanDTO`. |
| `api/payments/subscription.dto.ts` | yes | `IBilling`, `IDebitCard`, `SubscriptionDTO`. |
| `api/payments/transaction.dto.ts` | yes | `TransactionDTO`. |
| `api/users/listener/listener.dto.ts` | **no** | File exists but is **empty**; add types here when defined, then append `export * from '...'` to `dto-index.ts`. |
| `api/users/minister/minster.dto.ts` | **no** | File exists but is **empty**; **filename typo:** `minster` vs `minister`. Same barrel rule as above when populated. |

## Verification

After adding or renaming DTO files:

1. Run `pnpm --filter @troott/api-client build` (or `tsc -p packages/api-client`) so `dist/*.d.ts` stays aligned with `exports` in `package.json`.
2. Grep for `*.dto.ts` under `packages/api-client/src/api` and compare to `dto-index.ts` re-export list.
