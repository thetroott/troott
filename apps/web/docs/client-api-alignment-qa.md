# Client API alignment — QA checklist

Use after deploying aligned API + web/mobile and **clearing MongoDB** (no legacy documents).

## Prerequisites (ops)

- API process running with valid `.env` (MongoDB, Redis, AWS/S3 for sermon upload + HLS).
- Bull/workers processing `audio-metadata` and `audio-processing` jobs.
- Web dev server or production build pointed at the aligned API.

## Web smoke tests

1. Minister login → open studio → upload one audio sermon (`start-upload` once).
2. Confirm response includes `id` and `uploadRef` (or `item.itemId`).
3. My Sermons list shows draft row with duration when jobs complete.
4. Optional: cover image upload on publish uses `image-upload` + `imageUrl` / `image.item`.
5. Publish sermon with `MediaStatus.published` (not legacy processing status).
6. After HLS job, detail/list shows `playbackUrl` or `manifestUrl`.

## Mobile smoke tests

1. Clear app storage or reinstall (drops stale `lastPlayed.streamUrl`).
2. Browse catalog → play sermon → background and resume.
3. Add sermon to playlist (`itemType: sermon` in request body).
4. Optional: offline download plays from downloaded file URI.

## Validation commands

```bash
# No legacy field reads on client API paths
rg 'uploadSummary|sermonUrl|hlsMasterUrl|coverArt' apps/web/src apps/mobile --glob '*.{ts,tsx}'

# Typecheck
pnpm exec tsc --noEmit -p apps/api
pnpm exec tsc --noEmit -p apps/web
```

## Data reset

1. Drop/clear MongoDB collections (or full DB).
2. Restart API with `ENABLE_SEEDING=true` and confirm logs show **Free plan seeded successfully** (or **paystackPlanCodes repaired**) — not `Failed to seed free plan`.
3. In MongoDB, `plans` collection: document `code: plan-free-listener` has non-empty `paystackPlanCodes.*`.
4. Re-create test minister/user accounts.
4. Upload at least one sermon end-to-end before mobile playback QA.
