# Google Play Store listing — Troott (Android)

Complete reference for publishing **Troott** on Google Play. Values are derived from `apps/mobile/app.json`, product specs, and marketing copy in the Troott monorepo. Review and adjust anything marked **TODO** before submission.

**Last synced with app config:** `version 00.01.00`, `package com.troott.app`, EAS project `@troott-app/troott`.

---

## 1. App identity (technical)

| Field | Value | Source |
| ----- | ----- | ------ |
| **App name (store listing)** | Troott | `expo.name` |
| **Android application ID** | `com.troott.app` | `expo.android.package` |
| **Default language** | English (United States) — **TODO:** confirm primary market (Nigeria / UK / global) | Play Console |
| **Version name** | `00.01.00` (user-facing; set in `app.json` → `expo.version`) | `app.json` |
| **Version code** | Managed by EAS (`appVersionSource: remote`, `autoIncrement: true` on production). Each Play upload must use a higher code than the last; check the build log or Play **App bundle explorer** before submitting. | `eas.json` |
| **Expo slug** | `troott` | `app.json` |
| **Deep link scheme** | `troottmobile://` | `expo.scheme` |
| **EAS owner** | `troott-app` | `app.json` |
| **EAS project ID** | `87856a53-43b2-47ef-9b14-e161d92372e5` | `app.json` |
| **Orientation** | Portrait | `app.json` |
| **Minimum Android SDK** | Set by Expo SDK 54 / `expo-build-properties` — verify in built `AndroidManifest` after EAS build | Build artifact |
| **Target SDK** | Same as above — must meet current Play policy at submission time | Build artifact |

### Build and submit commands

Run from **`apps/mobile`** (not monorepo root):

```bash
cd apps/mobile
eas build --platform android --profile production
eas submit --platform android --profile production
```

---

## 2. Store listing — copy (ready to paste)

### App name

```
Troott
```

Max 30 characters. Current name fits.

### Short description

Max **80 characters**. Suggested options (pick one):

**Option A (recommended):**
```
Stream sermons and teachings from your favourite ministers, ad-free.
```
(67 characters)

**Option B:**
```
Find, listen to, and share Christian sermons and teachings on the go.
```
(66 characters)

**Option C:**
```
Christian sermon streaming — discover ministers, playlists, and more.
```
(68 characters)

### Full description

Max **4000 characters**. Draft below (~1,450 characters — expand with screenshots callouts if needed):

```
Troott is the mobile home for sermons and Christian teachings you love — in one place, without distractions.

Whether you want to revisit a classic message or discover something new, Troott helps you find powerful audio from ministers you follow, organise your listening, and share encouragement with friends and family.

WHY TROOTT
• Discover sermons and teachings from ministers you care about
• Search by topic, minister, series, and title
• Personalised home and recommendations based on your interests
• Build playlists and save favourites to your library
• Share sermon links via copy, native share, and social apps
• Background audio playback — keep listening while you use other apps
• Dark, focused interface designed for long-form listening

LISTEN YOUR WAY
• Stream sermons with a full-featured audio player
• Queue tracks, shuffle, repeat, and sleep timer controls
• Continue where you left off across sessions
• Follow ministers and topics for a feed that grows with you

YOUR LIBRARY
• Organise content by playlists, sermons, series, and ministers
• Sort and filter to find what you need quickly
• Save sermons you want to hear again

ACCOUNT & PERSONALISATION
Create a free Troott account to sync your library, playlists, and preferences. Onboarding helps Troott learn your favourite ministers and topics so recommendations feel personal from day one.

PREMIUM (ROADMAP)
Troott is building premium plans with expanded catalogue access and an ad-free experience. Subscription management in the app is rolling out — check troott.com for the latest plans and pricing.

BUILT FOR LISTENERS
Troott is made for people who want to stay rooted in God’s Word through sermons and teachings — at home, commuting, or anywhere life takes you.

SUPPORT
Questions or feedback? Email hello@troott.com

Privacy policy: https://www.troott.com/privacy
Terms of use: https://www.troott.com/terms
Website: https://troott.com
```

### Promotional text (optional)

Max **170 characters**. Can be updated without a new release:

```
New on Troott: personalised discovery, playlists, and sharing. Stream sermons from ministers you follow — ad-free listening experience coming with Premium.
```

### Developer / brand positioning (internal — not a Play field)

From marketing site:

> Turning audio sermons into a tool for true discipleship. Made in Nigeria, crafted for the world.

Tagline (website hero):

> All the sermons and teachings you love, in one place.

Welcome screen (in-app):

> Experience sermons the way they were meant to be heard, ad-free.

---

## 3. Graphics and media assets

### App icon

| Asset | Spec | Project path |
| ----- | ---- | ------------- |
| **Hi-res icon** | 512 × 512 PNG, 32-bit, max 1024 KB | Export from `apps/mobile/assets/app-icon.png` |
| **Adaptive icon** | Foreground + background `#171717` | `app.json` → `android.adaptiveIcon` |

### Feature graphic

| Asset | Spec | Status |
| ----- | ---- | ------ |
| **Feature graphic** | 1024 × 500 PNG or JPEG | **TODO:** design (brand colours: teal `#08ffdb`, dark `#171717`) |

### Phone screenshots

| Type | Spec | Status |
| ---- | ---- | ------ |
| **Phone** | 2–8 screenshots; min 320 px short edge; max 3840 px long edge; 16:9 or 9:16 | **TODO:** capture from device/emulator |

**Suggested screenshot sequence:**

1. Welcome / value prop — “Experience sermons ad-free”
2. Home — personalised feed
3. Search — query and results
4. Minister profile
5. Full player with queue / controls
6. Library — playlists and categories
7. Share flow
8. Profile / notifications settings

### Tablet screenshots (optional)

7-inch and 10-inch tablet screenshots if you enable tablet support. `ios.supportsTablet` is true; verify Android tablet layout before claiming support.

### Promo video (optional)

YouTube URL — **TODO** if marketing provides one.

---

## 4. Categorisation

| Play Console field | Recommended value | Notes |
| ------------------ | ----------------- | ----- |
| **App category** | Music & Audio | Primary fit: sermon audio streaming |
| **Secondary category (optional)** | Lifestyle or Books & Reference | Alternative if “Music & Audio” feels too narrow |
| **Tags** | sermon, christian, gospel, preaching, audio, podcast, faith, bible, worship, ministry | Pick up to 5 tags Play allows in your region |

### Content rating (IARC questionnaire)

Complete the questionnaire in Play Console. Expected answers based on app behaviour:

| Topic | Expected answer | Rationale |
| ----- | --------------- | --------- |
| Violence | No | Religious audio content |
| Sexuality | No | Not applicable |
| Language | No / Infrequent | User-generated content minimal; sermon audio is moderated catalogue |
| Controlled substances | No | Not applicable |
| Gambling | No | Not applicable |
| User interaction | Yes | Accounts, sharing, optional social share |
| Shares location | No | No location permission in `app.json` |
| Shares personal info | Yes | Account email, profile, usage for recommendations |
| Digital purchases | Yes (if subscriptions launch) | Paystack-backed plans in API; in-app subscription UI marked “coming soon” |

**Likely rating:** Everyone / Teen (confirm via questionnaire).

### Target audience

| Field | Recommendation |
| ----- | -------------- |
| **Target age group** | 13+ or 18+ — **TODO:** legal review (religious content, accounts, payments) |
| **Appeals to children** | No — account required; no child-directed design |
| **Ads** | Free tier may include ads per product README — declare if ad SDK is enabled in production build **TODO: verify** |

---

## 5. Contact, legal, and policy URLs

| Field | URL / value |
| ----- | ----------- |
| **Developer name** | Troott Technologies |
| **Developer email (public)** | hello@troott.com |
| **Website** | https://troott.com |
| **Privacy policy URL** | https://www.troott.com/privacy |
| **Alternative privacy (Notion)** | https://troott.notion.site/Troott-Privacy-Policy-24bb2bbd63c7806382bcfffe3fe1a1bf |
| **Terms of use URL** | https://www.troott.com/terms |
| **Terms of sale** | Referenced in signup UI — **TODO:** confirm public URL |
| **Support email** | hello@troott.com (shown in-app: Help and feedback) |

**Action:** Ensure `https://www.troott.com/privacy` and `/terms` resolve publicly before submission (in-app About screen links here).

### Social profiles (marketing)

| Platform | URL |
| -------- | --- |
| X (Twitter) | https://x.com/thetroott |
| LinkedIn | https://www.linkedin.com/company/troott |

---

## 6. Pricing and distribution

| Field | Value |
| ----- | ----- |
| **Price** | Free (with optional in-app purchases / subscriptions) |
| **Countries** | **TODO:** list all target countries (default: all unless restricted) |
| **Contains ads** | **TODO:** confirm for v1.0.0 production build (product mentions free ad-supported plan) |
| **In-app products** | Subscription plans (Paystack in API) — declare when IAP is live in Play Console |
| **Financial features** | No (unless subscription billing is exposed in-app at launch) |

### Subscription disclosure (when live)

Product README describes:

- **Free:** ad-supported plan
- **Premium:** unlimited online/offline streaming, sermon reels, no commercial breaks

Until “Manage subscription” ships in-app, note in release notes that billing may be web-only or coming soon.

---

## 7. App features (for “App content” and store bullets)

### Core features (shipped or in app today)

- Email registration, login, password reset, email verification
- Onboarding: favourite ministers and topic interests
- Tab navigation: Home, Search, Library, Profile
- Sermon streaming with background audio (`@rntp/player`)
- Player: queue, shuffle, repeat, sleep timer
- Search: query, recent searches, topic browse, minister/series/sermon results
- Library: categories (All, Playlists, Sermon, Series, Minister), sorting, smart cards
- Playlists: create, add sermons, view playlist detail
- Favourites / likes (local + sync)
- Minister and series detail pages
- Share sermons: copy link, native share, Instagram-oriented flow
- Push and in-app notification preferences
- Profile: account, edit profile, photo picker, change password
- Account deletion (scheduled deletion via API)
- Deep links: `troottmobile://` scheme; universal links per `specs/api/deep-links.md`
- Google Cast support (`react-native-google-cast`) — **TODO:** verify enabled in production build

### Coming soon / partial (do not over-promise in store copy)

| Feature | Status in codebase |
| ------- | ------------------ |
| Manage subscription | Toast: “coming soon” |
| Your Recap | Toast: “coming soon” |
| Offline download | Action inventory: pipeline not fully wired |
| Help and feedback screen | Routes to email toast only |

---

## 8. Android permissions (declared + user-facing)

Declared in `app.json`:

| Permission | Why Troott requests it | User-facing explanation (for Data safety / permission rationale) |
| ---------- | ---------------------- | ---------------------------------------------------------------- |
| `CAMERA` | Profile photo capture via `expo-image-picker` | To take a profile photo for your Troott account |
| `RECORD_AUDIO` | Declared in manifest | **TODO:** confirm if still required; remove from build if unused |
| `CALL_PHONE` | Declared in manifest | **TODO:** confirm necessity — unusual for a streaming app; remove if accidental |
| `CALL_PRIVILEGED` | Declared in manifest | **TODO:** confirm necessity — likely should be removed if not used |
| Photos / media (runtime) | `expo-image-picker` photos permission | To choose a profile photo from your gallery |
| Notifications (runtime) | `expo-notifications` | To alert you about new sermons and activity from ministers you follow |
| Internet | Implicit | To stream sermons and sync your library |
| Foreground service / media playback | Audio player | To continue playback in the background |

**Pre-submission audit:** Run `eas build` and inspect merged `AndroidManifest.xml`. Remove unused dangerous permissions before first public release — Play reviewers flag unexplained `CALL_*` permissions.

### iOS-only permissions (reference for parity docs)

- Camera, microphone, photo library, background audio — same rationale as Android where applicable.

---

## 9. Data safety form (Google Play)

Use this as a worksheet when completing **Data safety** in Play Console. Align answers with your published privacy policy.

### Data collected (likely — verify against privacy policy)

| Data type | Collected | Shared | Purpose | Optional |
| --------- | --------- | ------ | ------- | -------- |
| Email address | Yes | No | Account, authentication | No |
| Name | Yes | No | Profile display | No |
| User IDs | Yes | No | Account, analytics | No |
| Photos | Yes | No | Profile avatar | Yes |
| App interactions | Yes | No | Recommendations, playback history | No |
| Crash logs | Yes | Yes (Bugsnag) | Stability | No |
| Device identifiers | Yes | Yes (Bugsnag) | Diagnostics | No |
| Purchase history | When IAP live | No | Subscription | No |

### Security practices

| Practice | Status |
| -------- | ------ |
| Data encrypted in transit | Yes (HTTPS to `api.troott.com`) |
| Data encrypted at rest | Server-side — per privacy policy |
| Users can request account deletion | Yes — in-app Delete account (`About Troott`) |
| Users can request data deletion | **TODO:** document process (email hello@troott.com) |

### Third-party SDKs (declare in Data safety)

| SDK | Purpose | Data |
| --- | ------- | ---- |
| **Bugsnag** (`@bugsnag/expo`) | Crash and error reporting | Device info, stack traces, session breadcrumbs |
| **Expo / React Native** | App framework | Standard device APIs |
| **Google Cast** | Cast to TV/speakers | **TODO:** confirm Cast SDK data collection |
| **Paystack** (via API, when billing live) | Payments | Payment tokens — not stored in app per `query-client` persister exclusions |

Auth tokens and payment info are excluded from React Query persistence (`auth`, `payment` keys).

---

## 10. Account requirements

| Requirement | Troott behaviour |
| ----------- | ---------------- |
| **Sign-in required** | Yes — no guest mode; catalogue requires authenticated session |
| **Account creation methods** | Email + password (registration, OTP verification) |
| **Account deletion** | In-app: About → Delete account |
| **Kids / Families policy** | Not designed for children under 13 — **TODO:** legal age gate |

Play Console **App access** section: provide test credentials for reviewers:

```
Email: [REVIEWER_TEST_EMAIL]     # TODO: create dedicated reviewer account
Password: [REVIEWER_TEST_PASSWORD]
```

Include steps: sign up → verify email (or pre-verified test account) → complete onboarding → play a sermon.

---

## 11. Content declarations

| Declaration | Answer |
| ----------- | ------ |
| **News app** | No |
| **COVID-19 contact tracing / status** | No |
| **Government app** | No |
| **User-generated content (UGC)** | Limited — listeners create playlists; sermon audio is publisher/minister catalogue |
| **UGC moderation** | Catalogue moderated at upload (minister studio); report path **TODO** if required for Play UGC policy |
| **Health app** | No |
| **Financial features** | Subscriptions when enabled |

---

## 12. Release notes (first production release)

**Suggested “What’s new” for v1.0.0:**

```
Welcome to Troott on Android.

• Stream sermons and teachings from ministers you follow
• Search and browse by topic, series, and minister
• Build playlists and save favourites to your library
• Background playback with queue, shuffle, and sleep timer
• Share messages with friends and family
• Personalised home based on your interests

We would love your feedback at hello@troott.com
```

---

## 13. Pre-launch checklist

### Store listing

- [ ] Short description (≤ 80 chars) finalised
- [ ] Full description proofread
- [ ] App icon 512×512 exported
- [ ] Feature graphic 1024×500 designed
- [ ] Minimum 2 phone screenshots (recommend 6–8)
- [ ] Privacy policy URL live and matches Data safety answers
- [ ] Terms URL live
- [ ] Support email monitored (`hello@troott.com`)

### Technical

- [ ] Production AAB built from `apps/mobile` (`eas build --platform android --profile production`)
- [ ] `com.troott.app` matches Play Console application ID
- [ ] Version code increments correctly (EAS remote)
- [ ] Signing key / Play App Signing configured in EAS
- [ ] Unused Android permissions removed (`CALL_PHONE`, `CALL_PRIVILEGED`, `RECORD_AUDIO` if not needed)
- [ ] `eas submit` tested or manual upload to internal testing track

### Policy

- [ ] Data safety form completed
- [ ] Content rating questionnaire completed
- [ ] Target audience and ads declaration accurate
- [ ] Reviewer test account documented in App access
- [ ] Account deletion flow tested end-to-end
- [ ] Encryption export compliance (US) — `ITSAppUsesNonExemptEncryption: false` on iOS; confirm Android equivalent if asked

### Optional but recommended

- [ ] Internal testing track → closed testing → production rollout
- [ ] Staged rollout percentage (e.g. 10% → 100%)
- [ ] LinkedIn / website updated with Play Store badge after approval

---

## 14. Known inconsistencies to resolve before launch

| Item | Current state | Action |
| ---- | ------------- | ------ |
| About screen version | Reads `Constants.expoConfig.version` | Keep in sync with `app.json` `expo.version` |
| Privacy URL | Website uses Notion link in footer; app uses `troott.com/privacy` | Ensure both resolve |
| Subscription UI | “Coming soon” toast | Do not claim full Premium checkout until live |
| Offline downloads | Not fully wired | Avoid “download for offline” in v1 copy unless shipped |
| EAS project history | Previously linked to `@troott` org project `48464c89-...` | Now `@troott-app/troott` — confirm credentials/signing continuity with team |

---

## 15. Quick reference — environment and API

| Service | Production URL |
| ------- | -------------- |
| API | https://api.troott.com |
| Marketing / legal | https://troott.com |
| Media CDN | https://storage.troott.com |
| Studio (ministers) | https://app.troott.com |

Mobile env var: `EXPO_PUBLIC_API_URL` (no `/api` suffix) — set in EAS **production** environment secrets.

---

## 16. Document maintenance

Update this file when you change:

- `apps/mobile/app.json` (name, package, version, permissions)
- Store copy or positioning on `troott.com`
- Privacy policy or terms URLs
- Subscription / ads / offline feature launch status
- Play Console category, tags, or Data safety answers

**Owner:** Mobile / growth team  
**Related docs:** `apps/mobile/README.md`, `specs/api/mobile-flow.md`, `apps/mobile/docs/mobile-action-inventory.md`
