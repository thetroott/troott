# feat-0035: Tech — `/get-troott` redirect handler

Paired with [website feat-0003 TECH](../../../website/feature/feat-0003/TECH.md).

## D1 — Implementation (binding)

| | Detail |
| --- | ------ |
| **Decision** | **v1:** `apps/web/public/get-troott.html` + hosting rule so **`GET /get-troott`** serves that file **without** loading the SPA router. |
| **Redirect** | Inline script reads `?package=` + optional UA; sets `window.location.replace(target)`. |
| **Follow-up** | Replace with **Coolify/Traefik/nginx `302`** when infra team adds redirect map (same URL matrix below). |
| **Why** | Vite SPA has no server routes; static redirect page ships fast; real 302 can follow without changing marketing URLs. |

**Coolify/nginx (follow-up snippet — illustrative):**

```nginx
location = /get-troott {
  # Prefer 302 map from env; until then alias get-troott.html
  try_files /get-troott.html =404;
}
```

## Canonical store URLs (binding)

Configured on **app host only** (env or config module — not `apps/website`):

| Env var | Value |
| ------- | ----- |
| `TROOTT_PLAY_STORE_URL` | `https://play.google.com/store/apps/details?id=com.troott.app` |
| `TROOTT_APP_STORE_URL` | `https://apps.apple.com/ng/app/troott/id1234567890` |
| `TROOTT_WEB_APP_URL` | `https://app.troott.com` |
| `TROOTT_DMG_URL` | *(empty v1)* — when set, `package=dmg` redirects here |
| `TROOTT_EXE_URL` | *(empty v1)* — when set, `package=exe` redirects here |

Update App Store path when Apple assigns the **production** app ID (replace `id1234567890` if needed).

## Redirect matrix (binding)

| `package` | Redirect target |
| ----------- | --------------- |
| `android` | `TROOTT_PLAY_STORE_URL` |
| `ios` | `TROOTT_APP_STORE_URL` |
| `web` | `TROOTT_WEB_APP_URL` |
| `dmg` | `TROOTT_DMG_URL` if set, else `TROOTT_WEB_APP_URL` |
| `exe` | `TROOTT_EXE_URL` if set, else `TROOTT_WEB_APP_URL` |
| *(omit)* + UA Android | Play Store |
| *(omit)* + UA iOS/iPad | App Store |
| *(omit)* + UA macOS | `dmg` row (web until DMG URL) |
| *(omit)* + UA Windows | `exe` row (web until EXE URL) |
| unknown | `TROOTT_WEB_APP_URL` |

## Files (v1)

```text
apps/web/
├── public/
│   └── get-troott.html          # redirect logic + optional manual hub links
└── (optional) src/config/
    └── get-troott-targets.ts    # shared URL constants for html build inject
```

## Manual QA

```bash
# After deploy — static page (200 + JS redirect) or 302 when nginx map live
curl -sI "https://app.troott.com/get-troott?package=android" | head -5
curl -sI "https://app.troott.com/get-troott?package=ios" | head -5
curl -sI "https://app.troott.com/get-troott?package=web" | head -5
curl -sI "https://app.troott.com/get-troott?package=dmg" | head -5
curl -sI "https://app.troott.com/get-troott?package=exe" | head -5
```

Open in browser: each param lands on Play, App Store, or web app.

## Tasks

- [ ] Add `public/get-troott.html` with package matrix
- [ ] Document Coolify static file / path rule for `/get-troott`
- [ ] Set env vars on production app host
- [ ] Verify with curl + real devices before enabling `NEXT_PUBLIC_GET_TROOTT_ENABLED=true` on website
