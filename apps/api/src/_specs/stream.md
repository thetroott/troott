Why: Mostly data delivery, not CRUD.
Backend layers:
Controller ✅ (optional) – endpoint to get signed URLs / stream audio
Service ✅ – streaming logic, CDN integration, access checks
Model ❌ – usually no persistent DB (maybe a minimal table for file metadata / location), but audio lives in storage/CDN

The main job of streaming is delivering audio bytes.
Often, the client talks directly to a CDN or object storage (like S3, GCP Storage, or a streaming server).
The backend only generates signed URLs or checks access permissions.

So:

Controller optional because:
If you’re using a CDN with signed URLs, sometimes the URL is generated internally and sent via an existing user API (like /tracks/{id} in catalog), not a dedicated /stream controller.
If every track request is just a redirect to S3/CDN, you don’t need a full controller layer; the service can just generate the signed URL and the client uses it.
Service is required because you still need logic:
Validate user access
Select proper bitrate or format
Generate signed URLs
Maybe throttle streams
Model not required because:
You’re not storing audio in a DB.
Maybe a small table to map track IDs to storage paths, but that can be in catalog metadata.
