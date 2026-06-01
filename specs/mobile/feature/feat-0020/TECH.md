# feat-0020: Tech Spec — Invitation clients

## Context

See [`PRODUCT.md`](./PRODUCT.md).

## Mobile files (already present)

| File | Role |
| ---- | ---- |
| `apps/mobile/api/clients/invitation.ts` | Read-only invitation queries |
| `apps/mobile/api/clients/listener.ts` | `acceptListenerInvitation`, `revokeListenerInvitation`, invite CRUD |
| `apps/mobile/api/clients/troott.ts` | `this.invitation = new InvitationService()` |
| `apps/mobile/api/dtos/invitation.dto.ts` | Types aligned with API |
| `apps/mobile/api/config/path.ts` | `URL_INVITATION_*`, `URL_LISTENER_INVITE_*` |

## API routes (server)

| Method | Path | Mobile client |
| ------ | ---- | ------------- |
| GET | `/api/v1/invitation/id/:invitationId` | `invitation.getById` |
| GET | `/api/v1/invitation/inviter/:inviterId` | `invitation.getByInviter` |
| GET | `/api/v1/invitation/invitee` | `invitation.getByInvitee` |
| GET | `/api/v1/invitation/resource/:resourceId` | `invitation.getByResource` |
| POST | `/api/v1/listener/invite/accept` | `listener.acceptListenerInvitation` |

Router: `apps/api/src/routes/invitation.router.ts`, `listener.router.ts`.

## Wire plan (invite deep link — optional P1)

1. Parse pending invite from [deep-links](../../../api/deep-links.md) or auth query params in `SessionHydrator` / register form.
2. After successful login/register:

```ts
if (inviteToken && invitationId) {
  await api.listener.acceptListenerInvitation({ invitationId, token: inviteToken });
}
```

3. Invalidate `listenerKeys.current` and onboarding guards ([feat-0002](../feat-0002/TECH.md)).

## Hooks to add (only if deep link shipped)

| Hook | File |
| ---- | ---- |
| `useAcceptListenerInvitationMutation` | `api/hooks/app/useListener.ts` |

Do **not** add TanStack hooks for read-only `InvitationService` until a screen needs them.

## Creator profile 404 (related web error)

Terminal `Creator profile not found` at `creator.controller.ts:414` means JWT user has no **creator** row — expected for listener-only accounts hitting studio upload routes. Not fixed by this feat; web minister onboarding must call creator provision first ([feat-0005 web](../../../web/feature/feat-0005/PRODUCT.md)).

## Docs to update

- [ ] `apps/mobile/docs/mobile-action-api-matrix.md` — invitation / listener invite accept rows
- [ ] Cross-link from feat-0001 TECH if accept wired

## Checklist

- [ ] Document client-only status (this feat)
- [ ] Optional: accept mutation + register/deep-link integration
- [ ] No unused invitation list UI in listener app
