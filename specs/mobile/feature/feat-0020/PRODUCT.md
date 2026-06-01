# feat-0020: Invitation flows (client inventory)

## Summary

Document **invitation-related API clients** on mobile: what exists, who uses them, and what is **out of scope** for the listener app P0. No new UI in this feat unless product adds deep-link invite onboarding later.

Complements [feat-0001](../feat-0001/PRODUCT.md) (auth), [feat-0002](../feat-0002/PRODUCT.md) (onboarding).

## Why there is no full “invitation feature” spec yet

Mobile ships **`InvitationService`** and DTOs for **parity with the API client surface**, not because the listener app has invitation management screens. Invitations are primarily **studio / admin / minister** flows (web). The listener app only needs **accept** when joining via email invite.

## What exists on mobile today

| Client | Routes | Auth | Used by UI |
| ------ | ------ | ---- | ---------- |
| `api.invitation.*` | `GET /invitation/id/:id`, `/inviter/:id`, `/invitee`, `/resource/:id` | Yes | **Nothing** — client only on `troott` facade |
| `api.listener.acceptListenerInvitation` | `POST /listener/invite/accept` | Public (token in body) | **Not wired** — register/set-password flows should call when `inviteToken` present |
| `api.listener.revokeListenerInvitation` | `POST /listener/invite/revoke` | Yes | Admin/studio — not listener app |

DTOs: `apps/mobile/api/dtos/invitation.dto.ts`, `AcceptListenerInvitationDTO` in `listener.dto.ts`.

## Production recommendation

### Listener app (P0)

| Flow | Recommendation |
| ---- | -------------- |
| **Email invite → create account** | On register / set-password screen, if deep link or query carries `invitationId` + token, call **`POST /listener/invite/accept`** after auth succeeds; then continue normal listener onboarding ([feat-0002](../feat-0002/PRODUCT.md)). |
| **Pending invite list** | **Defer (P2).** `GET /invitation/invitee` is for inviter dashboards, not listener home. |
| **Invitation lookup by resource** | **Defer.** Studio/web only (`GET /invitation/resource/:resourceId`). |

### Web / studio (reference)

| Flow | Client |
| ---- | ------ |
| Minister/creator/admin invite cards | Web `InvitationAPI` + role-specific accept endpoints |
| Bulk listener invite | `POST /listener/invite/bulk` (minister/studio) |

### Do not build on mobile (non-goals)

- Invitation CRUD UI (create, resend, revoke lists).
- `InvitationService.getByInviter` unless building a creator mini-app inside listener shell.

## Screen / route map (when wired)

| Screen | Action | API |
| ------ | ------ | --- |
| Register / verify / set-password (invite deep link) | Accept invite after credentials valid | `POST /listener/invite/accept` |
| Auth success handler | Skip duplicate listener create if accept already provisioned profile | `GET /listener` |
| Profile / settings | No invitation management | — |

## Acceptance criteria (documentation + minimal wire)

1. This spec explains why `InvitationService` exists without a dedicated screen.
2. `mobile-action-api-matrix.md` rows for listener invite accept document **ready (client) / not wired (UI)**.
3. If product enables invite deep links: register path calls accept with token (tracked under feat-0001/0002, not a new product surface).

## Related docs

- [`TECH.md`](./TECH.md)
- [`specs/api/mobile-flow.md`](../../../api/mobile-flow.md)
- Web: [`specs/web/feature/feat-0005`](../../../web/feature/feat-0005/PRODUCT.md) (creator onboarding — source of creator 404 if profile missing)
