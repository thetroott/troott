# feat-0016: Minister/creator profile `banner` + `avatar` — CDN on GET

## Summary

Profile **cover** (`banner`) and **avatar** on minister/creator documents must be **stored as storage keys** on write and **returned as CDN HTTPS URLs** on every owner GET so the web portal can render them without client-side URL construction.

This is the **API normative contract** for the bug tracked in [feat-0033 web PRODUCT](../../web/feature/feat-0033/PRODUCT.md) (*Background image not visible on `/profile`*).

Supersedes the fix recommendations in [profile-image-display-spec.md](../../profile-image-display-spec.md) for `banner` / `avatar` (investigation doc remains as historical context).

Related: [feat-0008 CDN](../feat-0008/PRODUCT.md), [feat-0015 sermon cover split](../feat-0015/PRODUCT.md) (different fields; same `toStoragePublicUrl` helper).

---

## Problem

| Layer | Expected | Failure mode |
| ----- | -------- | ------------ |
| PUT `/minister` | Persist `banner: images/{uploadId}.ext` | OK today |
| GET `/minister` | `banner: https://storage.troott.com/images/…` | Bare key → web hero blank |
| POST `/storage/upload` | `ImageDTO.file` = CDN URL for edit preview | Raw S3 Location → 403 in browser |
| Redis cache | Mapped CDN URLs | Stale key-only payload |

---

## Field contract

| Field | Mongo (write via PUT) | GET response (owner + public mappers) |
| ----- | --------------------- | ------------------------------------- |
| `banner` | `s3Key` string (`images/…`) | CDN URL via `toStoragePublicUrl` |
| `avatar` | `s3Key` string | CDN URL via `toStoragePublicUrl` |
| `profile.ministryLogo` | `s3Key` string (if used) | CDN URL via `toStoragePublicUrl` |

**Do not** persist CDN URLs as the only source of truth without a restorable key (complicates migration). Accept legacy full URLs on read — pass through `toStoragePublicUrl`.

---

## Endpoints

| Method | Path | Cover-relevant behavior |
| ------ | ---- | ----------------------- |
| POST | `/api/v1/storage/upload` | Returns `{ s3Key, file }` where `file` is CDN |
| PUT | `/api/v1/minister` | Accepts `banner` / `avatar` as keys; response mapped |
| GET | `/api/v1/minister` | Owner doc; **must** map before JSON + cache |
| PUT/GET | `/api/v1/creator` | Mirror minister |

---

## Mapper requirements

Apply in:

- `ministerMapper.mapMinisterOwnerResponse` — owner GET/PUT response
- `ministerMapper.mapMinisterResponse` — public DTO
- `creatorMapper.mapCreatorOwnerResponse` — creator owner
- (future) public creator mapper

```ts
doc.banner = toStoragePublicUrl(doc.banner); // handles key, S3 URL, legacy CDN
doc.avatar = toStoragePublicUrl(doc.avatar);
```

**Never** return raw `*.s3.*.amazonaws.com` for browser-facing profile GET when `CLOUDFRONT_STORAGE_URL` is set ([feat-0008](../feat-0008/PRODUCT.md)).

---

## Cache

| Key | Rule |
| --- | ---- |
| `minister:profile:v2:${userId}` | Store mapped DTO only |
| Invalidation | Delete v1 + v2 on any PUT touching `banner` / `avatar` |

---

## Acceptance criteria

1. `PUT` with `banner: images/{id}.png` → Mongo stores key unchanged.
2. `GET /minister` → `banner` is HTTPS CDN; `curl -I` → 200.
3. Cached GET matches uncached mapped shape.
4. `POST /storage/upload` → `file` is CDN, not private S3 Location.
5. Web [feat-0033](../../web/feature/feat-0033/PRODUCT.md) hero AC passes without web URL helpers.

---

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | File list, tests, gaps |
| [feat-0033 web](../../web/feature/feat-0033/PRODUCT.md) | Figma + web hero |
| [profile-image-display-spec.md](../../profile-image-display-spec.md) | Original RC analysis |
