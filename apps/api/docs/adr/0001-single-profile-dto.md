# ADR 0001 - Single Profile DTO via Inheritance

- Status: Accepted
- Date: 2026-05-06

## Context

The `Profile` page on the web (Figma node `11745:106250`) and the Edit Profile dialog
(Figma nodes `11719:104736`, `11732:105889`) need a single contract that covers both
listener and minister users. The data is split across two collections in MongoDB
(`User` and `Minister`), and prior to this change there was no unified read/write
path - the web app was forced to call `/user/...` and `/minister/...` separately
and merge results client-side, leading to duplicated mappers, parallel form code,
and ambiguous "which endpoint owns this field?" decisions.

## Decision

Introduce a single canonical `ProfileDTO` modelled as a discriminated union:

```ts
type ProfileDTO = ListenerProfile | MinisterProfile;
//   MinisterProfile extends ListenerProfile (composition realised in the mapper)
```

Surface it through one endpoint family on the API:

- `GET /profile/me`
- `PUT /profile/me`

The new `apps/api/src/modules/users/profile/` module is the only place that knows
the data is split across `User` and `Minister`. It joins on read and fans out on
write. The mapper at `profile.mapper.ts` builds the base shape from the `User`
doc and layers minister fields on top when `userType === 'minister'`.

The same shape is mirrored on the web (`apps/web/src/app/profile/profile.types.ts`)
together with mappers `mapProfileToFormValues` / `mapFormValuesToUpdatePayload`,
giving the dialog one form, one validation pass, one save call.

## Consequences

Positive:

- One source of truth for profile data on both backend and web.
- Clear branching point (`isMinisterProfile`) for UI sections that only apply to
  ministers (Ministry Name, Location, Social handles, About section labelled
  per Figma).
- Image asset handling, ownership checks, and S3 cleanup live in one place
  (`profile.service.ts`) rather than being duplicated across user/minister
  controllers.
- The Edit Profile dialog can render both empty and populated states from the
  same component; the variant is implicit in field values.

Trade-offs / Follow-ups:

- The legacy `PUT /user/...` `editUser` controller still exists; it should be
  marked deprecated and progressively removed once no callers remain.
- `Minister.ministry` (legacy single-string field) is retained for backwards
  compatibility with existing search/discovery code; new writes should use
  `ministryName`. A future migration can backfill and drop `ministry`.
- We deferred the in-browser cropper, MSW handlers, optimistic concurrency
  (`If-Match`), and the username-availability probe. The DTO leaves room for
  these without breaking the contract (all new fields are optional).
