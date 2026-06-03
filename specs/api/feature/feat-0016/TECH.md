# feat-0016: Tech — Profile `banner` / `avatar` CDN on GET

## Context

See [PRODUCT.md](./PRODUCT.md). Web UX: [feat-0033 TECH](../../web/feature/feat-0033/TECH.md).

---

## Current implementation audit (2026-06)

| Component | Expected | Code location |
| --------- | -------- | ------------- |
| Owner GET maps banner | `toStoragePublicUrl` | `minister.mapper.ts` → `mapMinisterOwnerResponse` |
| Owner GET service | calls mapper | `minister.service.ts` → `getMinisterProfile` |
| PUT response mapped | same mapper | `updateMinisterProfile` return path |
| Cache | post-mapper value | `minister.controller.ts` → `getMinister` |
| Upload CDN `file` | `buildStoragePublicUrl` | `storage.service.ts` → `uploadFile` |
| Creator parity | same | `creator.mapper.ts`, `creator.service.ts` |

**If hero still blank after deploy:** run [feat-0033 diagnosis runbook](../../web/feature/feat-0033/TECH.md#diagnosis-runbook) — likely CDN infra (feat-0012) or stale Redis.

---

## Gaps to close

### G1 — Mapper coverage on all read paths

Confirm every minister/creator JSON path uses a mapper that CDN-resolves `banner` / `avatar`:

- [ ] `GET /minister` (owner)
- [ ] `PUT /minister` response body
- [ ] `GET /creator` (owner)
- [ ] Public minister profile (if exposed)
- [ ] Studio aggregates embedding minister avatar/banner

### G2 — Cache invalidation

On `PUT /minister` / `PUT /creator` that touches images:

```ts
await redisWrapper.deleteData(`minister:profile:${userId}`);
await redisWrapper.deleteData(`minister:profile:v2:${userId}`);
```

Verify no code path repopulates cache from unmapped Mongoose doc.

### G3 — Upload response

`ImageDTO.file` must remain CDN-shaped for Edit modal preview:

```ts
// storage.service.uploadFile
uploadFileToBucket(data, AWS_BUCKETS_STORAGE, { publicUrl: buildStoragePublicUrl });
```

Do **not** use `{ useS3Location: true }` for profile upload responses (preview is browser-facing).

Contrast [feat-0015](../feat-0015/PRODUCT.md): sermon `image.item` stores S3 Location; sermon **`imageUrl`** is CDN. Profile has only one display field (`banner` on GET).

### G4 — Tests

Add `apps/api/test/unit/mappers/minister.mapper.profile-images.test.ts`:

| Input `banner` | Output |
| -------------- | ------ |
| `images/file-image-x.png` | `https://storage.troott.com/images/file-image-x.png` |
| `https://troott-storage.s3…/images/x` | CDN URL |
| `''` / missing | unchanged / undefined |

### G5 — DTO documentation

Update JSDoc on `MinisterResponseDTO.banner`:

- GET: CDN HTTPS URL for display
- PUT body: storage `s3Key`

---

## Files

| File | Change |
| ---- | ------ |
| `apps/api/src/mappers/minister.mapper.ts` | Verify `mapMinisterOwnerResponse`, `mapMinisterResponse` |
| `apps/api/src/mappers/creator.mapper.ts` | Verify `mapCreatorOwnerResponse` |
| `apps/api/src/services/core/minister.service.ts` | Owner GET/PUT mapped |
| `apps/api/src/services/core/creator.service.ts` | Mirror |
| `apps/api/src/controllers/core/minister.controller.ts` | Cache + invalidation |
| `apps/api/src/services/storage.service.ts` | CDN `file` on upload |
| `apps/api/src/dtos/core/minister.dto.ts` | JSDoc |
| `apps/api/test/unit/mappers/` | New tests |

---

## Verification

```bash
# 1. Upload
curl -s -H "Authorization: Bearer $TOKEN" -F file=@cover.jpg \
  https://localhost:PORT/api/v1/storage/upload | jq '.data.file,.data.s3Key'

# 2. Save
curl -s -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"banner":"images/file-image-…"}' \
  https://localhost:PORT/api/v1/minister | jq '.data.banner'

# 3. GET must be HTTPS
curl -s -H "Authorization: Bearer $TOKEN" \
  https://localhost:PORT/api/v1/minister | jq '.data.banner'

# 4. CDN
curl -I "$(jq -r '.data.banner' <<<"$GET_JSON")"
```
