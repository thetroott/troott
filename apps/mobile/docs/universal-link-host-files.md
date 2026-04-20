# Universal Links and App Links (host files)

Copy these onto the **HTTPS origin** that matches `CLIENT_APP_URL` (or your chosen link host). Paths in `apple-app-site-association` must match routes your app handles (e.g. `/sermon/*`).

## Apple — `/.well-known/apple-app-site-association`

Serve **without** `.json` extension, `Content-Type: application/json`.

Replace `TEAMID` and verify `paths` against your Expo / Xcode associated domains.

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.dmlscript.troottclient",
        "paths": [ "/sermon/*", "/playlist/*", "/minister/*" ]
      }
    ]
  }
}
```

## Android — `/.well-known/assetlinks.json`

Replace `RELEASE_SHA256` with your **Play App Signing** or upload key cert fingerprint (colon-separated hex).

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.dmlscript.troottclient",
      "sha256_cert_fingerprints": ["RELEASE_SHA256"]
    }
  }
]
```

## Expo

Configure `associatedDomains` (iOS) and intent filters (Android) in `app.json` / `app.config` to match the same paths. See [Expo linking](https://docs.expo.dev/guides/deep-linking/) and [`specs/api/deep-links.md`](../../../specs/api/deep-links.md).

### `app.json` snippet (iOS)

Replace `links.example.com` with the **exact** host from `CLIENT_APP_URL` (no `https://` prefix in `associatedDomains`):

```json
{
  "expo": {
    "ios": {
      "associatedDomains": [
        "applinks:links.example.com"
      ]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "links.example.com",
              "pathPrefix": "/sermon"
            },
            {
              "scheme": "https",
              "host": "links.example.com",
              "pathPrefix": "/playlist"
            },
            {
              "scheme": "https",
              "host": "links.example.com",
              "pathPrefix": "/minister"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

Merge these keys into your existing `ios` / `android` objects rather than replacing them.
