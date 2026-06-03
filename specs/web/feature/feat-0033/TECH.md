# feat-0033: Tech — Profile cover (`banner`) visibility

## Context

See [PRODUCT.md](./PRODUCT.md). Figma channel: `why2d1ga`. File `9lFM6TncipSv0pNVGBWZwA`.

---

## Field map (single source of truth)

| Layer | Cover field | Type | Display value |
| ----- | ----------- | ---- | ------------- |
| Figma Edit modal | Background image | image tile 441×180 | filled bitmap |
| `EditProfileDialog` | `values.coverImage` | `Asset \| null` | `ImageUploadTile` preview |
| `ProfileDTO` | `coverImage` | `Asset \| null` | hero via `profileImageSrc` |
| `UpdateMinisterDTO` / PUT body | `banner` | `string` | **`s3Key` only** on write |
| Mongo `IMinisterDoc` | `banner` | `string` | stored key or legacy URL |
| `MinisterResponseDTO.banner` on GET | `banner` | `string` | **CDN HTTPS URL** |

Creator: same mapping on `GET/PUT /creator`.

---

## Web code paths

### Read hero — `UserProfile.tsx`

```tsx
const coverUrl = profileImageSrc(profile.coverImage, { v: profile.updatedAt });
// coverUrl ? <img src={coverUrl} /> : gradient fallback
```

Requires `coverImage.url` from GET mapping.

### Profile DTO — `useProfile.ts`

```ts
coverImage: assetFromApiField(m.banner),
```

```ts
function assetFromApiField(stored: string | null | undefined): Asset | null {
  if (!stored) return null;
  if (stored.startsWith('http://') || stored.startsWith('https://')) {
    return { fileName: '', s3Key: '', url: stored };
  }
  return { fileName: ..., s3Key: stored }; // url omitted → hero blank
}
```

**Implication:** API **must** return HTTPS `banner` on GET. Bare keys always produce invisible hero.

### Edit upload — `ImageUploadTile.tsx`

- `POST /api/v1/storage/upload` via `api.storage.uploadImage`
- Preview: `Asset.url = ImageDTO.file` (must be CDN-loadable)
- Save: `assetToPutValue` sends `banner: asset.s3Key` on PUT

### Write mapping — `useProfile.ts`

```ts
if (payload.coverImage !== undefined) {
  body.banner = assetToPutValue(payload.coverImage);
}
```

---

## API code paths

### Upload — `storage.service.uploadFile`

Target (feat-0008):

```ts
return uploadFileToBucket(data, AWS_BUCKETS_STORAGE, {
  publicUrl: buildStoragePublicUrl,
});
// ImageDTO.file = CDN URL; s3Key = images/{uploadId}.ext
```

### Owner GET — `minister.service.getMinisterProfile`

```ts
result.data = await ministerMapper.mapMinisterOwnerResponse(minister);
```

`mapMinisterOwnerResponse` (`minister.mapper.ts`):

```ts
if (typeof doc.banner === 'string') {
  doc.banner = toStoragePublicUrl(doc.banner);
}
```

Same for `avatar`, `profile.ministryLogo`, verification docs.

### Cache — `minister.controller.getMinister`

- Key: `minister:profile:v2:${userId}` TTL 300s
- Must cache **post-mapper** payload only
- Invalidate on PUT: delete `minister:profile:*` and `minister:profile:v2:*`

### Public GET — `mapMinisterResponse`

Also maps `banner` / `avatar` via `toStoragePublicUrl` for catalog surfaces.

---

## Implementation checklist

| # | Task | Owner | File(s) | Status |
| - | ---- | ----- | ------- | ------ |
| 1 | Confirm `mapMinisterOwnerResponse` on every owner GET | API | `minister.service.ts`, `creator.service.ts` | Verify |
| 2 | Confirm `toStoragePublicUrl` on `banner`/`avatar` in all minister/creator mappers | API | `minister.mapper.ts`, `creator.mapper.ts` | Verify |
| 3 | Cache mapped DTO; bust v1 + v2 keys on PUT | API | `minister.controller.ts`, `creator.controller.ts` | Verify |
| 4 | `storage.uploadFile` returns CDN in `file` | API | `storage.service.ts` | feat-0008 |
| 5 | Do **not** add client URL builders | Web | `useProfile.ts`, `profile-page.util.ts` | Enforce |
| 6 | Hero uses `profileImageSrc(coverImage)` only | Web | `UserProfile.tsx` | Shipped |
| 7 | Edit tile uses `ImageDTO.file` for preview | Web | `ImageUploadTile.tsx` | Shipped |
| 8 | Unit test: `banner: 'images/x'` → GET DTO HTTPS | API | `test/unit/mappers/minister.mapper.test.ts` | Add |
| 9 | Integration: upload → PUT → GET → `^https://` | API | integration test | Add |
| 10 | CDN infra: `curl -I` on sample cover URL | Ops | [feat-0012](../../api/feature/feat-0012/PRODUCT.md) | Ops |

---

## Diagnosis runbook

| Check | Command / action | Pass |
| ----- | ---------------- | ---- |
| Upload response | Network: `POST /storage/upload` → `data.file`, `data.s3Key` | `file` is `https://storage.troott.com/…` |
| Mongo | `banner` field on minister doc | `images/file-image-…` |
| GET owner | `GET /minister` → `data.banner` | Starts with `https://`; not bare key |
| CDN object | `aws s3api head-object --bucket troott-storage --key images/…` | 200 |
| CDN edge | `curl -I "$bannerUrl"` | 200 + `content-type: image/*` |
| Web hero | `/profile` after save | `<img>` present; not gradient-only |
| Cache | After PUT, repeat GET | Updated URL (not stale key-only doc) |

If GET returns HTTPS but `curl -I` fails → **infra** ([feat-0012](../../api/feature/feat-0012/PRODUCT.md)), not React.

If GET returns bare `images/…` → **mapper/cache** bug (RC-1 / RC-2).

---

## Figma implementation notes

| Token | Figma | Code |
| ----- | ----- | ---- |
| Hero height | 368px (`11745:106757`) | `h-[368px]` in `UserProfile.tsx` |
| Cover upload height | 180px (`11732:105892`) | `h-[180px]` in `ImageUploadTile` cover variant |
| Cover upload width | 441px | `w-full` in modal (fluid) |
| Overlay | gradient + 30% black on image | `bg-gradient-to-t from-black/65 …` |
| Empty cover | dark gradient fill | `from-[#3d3a4f] via-[#2b2a2c] to-[#1c1c1e]` |

---

## Regression grep

```bash
rg 'coverImage|banner|assetFromApiField|profileImageSrc' apps/web/src
rg 'mapMinisterOwnerResponse|toStoragePublicUrl.*banner' apps/api/src
```

---

## Tests (minimum)

| Test | Assert |
| ---- | ------ |
| Mapper unit | `banner: 'images/foo.jpg'` + env → `https://storage.troott.com/images/foo.jpg` |
| Mapper unit | `banner: 'https://storage.troott.com/…'` → unchanged |
| Web unit | `assetFromApiField('https://…')` → `url` set |
| Web unit | `assetFromApiField('images/x')` → `url` undefined (documents API requirement) |
