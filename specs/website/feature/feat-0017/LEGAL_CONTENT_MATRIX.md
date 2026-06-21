# feat-0017: Legal content matrix

Companion to [PRODUCT.md](./PRODUCT.md). Use this as the **authoring checklist** when expanding `apps/website/_data/legal/**`.

**Legend**

| Column | Meaning |
| ------ | ------- |
| **Section** | Scrollspy `id` / `navLabel` / `title` (proposed) |
| **Benchmark** | Reference policy section to match in depth (not wording) |
| **Troott content** | What copy must say — grounded in shipped product |
| **Phase** | `P1` = required for Phase 1; `P2` = optional standalone doc |

---

## Shared definitions (all documents)

Include once per document where relevant:

| Term | Definition for Troott copy |
| ---- | --------------------------- |
| **Troott** | Troott Technologies — operator of troott.com, Troott mobile app, Troott Studio |
| **Listener** | User of the Troott mobile app with a listener account |
| **Minister** | User of Troott Studio who uploads and publishes sermons |
| **Content** | Sermon audio, metadata, images, transcripts, share links |
| **Personal data** | Information relating to an identified or identifiable person |
| **Service** | Listener app or Studio, as context requires |

**Contact block (all docs):**

- Email: `hello@troott.com`
- Web: `https://troott.com`
- Studio: `https://app.troott.com`

---

## Listener — Privacy Policy

**Target:** 12–14 sections · Benchmarks: [Spotify Privacy](https://www.spotify.com/ng/legal/privacy-policy/), [Apple Privacy](https://www.apple.com/legal/privacy/en-ww/), [Apple Music privacy annex](https://www.apple.com/legal/privacy/data/en/apple-music/)

| # | Section `id` | `navLabel` | Benchmark anchor | Troott content (required) |
| - | ------------ | ---------- | ---------------- | ------------------------- |
| 1 | `overview` | Overview | Spotify “Introduction” | Who we are; scope = listener app + account; controller contact |
| 2 | `scope` | Scope | Apple “Personal data Apple collects” intro | What this policy covers / does not cover (website newsletter separate link) |
| 3 | `data-we-collect` | Data we collect | Spotify “Personal data we collect” | Account (`user.model`), listener profile (`listener.model`), listening history, playlists, likes, searches, interests, device/session (`playback-session.model`), payment tokens (Paystack) — **no precise location** |
| 4 | `sources` | Sources | Amazon “Sources of personal data” | Direct from user, OAuth (Google/Apple), automatic from app use, ministers (indirect — e.g. sermon metadata only) |
| 5 | `how-we-use` | How we use data | Spotify “How we use personal data” | Streaming, sync, recommendations, subscriptions, security, support, product improvement |
| 6 | `legal-bases` | Legal bases | GDPR summary in Spotify / Tally GDPR | Contract, legitimate interests, consent (marketing/push), legal obligation — brief; link to `/legal/listener/gdpr` |
| 7 | `sharing` | Sharing | Spotify “Sharing” | Processor list: AWS, MongoDB, Redis, Paystack, Bugsnag, PostHog (if enabled), OAuth providers, email — **no sale of personal data** |
| 8 | `automated-decisions` | Automated decisions | Spotify recommendations section | Recommendations / personalization — logic described at high level; no solely automated legal decisions |
| 9 | `retention` | Retention | Spotify “Retention” | Active account; post-deactivation (`isDeactivated`); backups; legal holds — **no hard-delete timeline unless implemented** |
| 10 | `security` | Security | Apple “Security” | Reasonable technical/organizational measures; no absolute guarantee |
| 11 | `international-transfers` | Transfers | Spotify “International transfers” | AWS / US analytics; safeguards (SCCs where applicable) — `<!-- LEGAL_REVIEW -->` |
| 12 | `your-rights` | Your rights | Spotify “Your rights” | Access, delete, correct, port, object, restrict — link GDPR page + email process |
| 13 | `children` | Children | Spotify “Children” | Minimum age `<!-- LEGAL_REVIEW -->`; no knowing collection from children under threshold |
| 14 | `changes` | Changes | Spotify “Changes” | How we notify; continued use; `lastUpdated` |
| 15 | `contact` | Contact | All references | `hello@troott.com`; supervisory authority pointer in GDPR doc |

---

## Listener — Terms of Use

**Target:** 14–16 sections · Benchmarks: [Spotify Terms](https://www.spotify.com/ng/legal/end-user-agreement/), [Apple Media Services Terms](https://www.apple.com/legal/internet-services/itunes/)

| # | Section `id` | `navLabel` | Benchmark anchor | Troott content (required) |
| - | ------------ | ---------- | ---------------- | ------------------------- |
| 1 | `acceptance` | Acceptance | Spotify “Binding contract” | Agreement by use; age; changes |
| 2 | `the-service` | The service | Spotify “Service” | Mobile streaming app; account required; no guest mode |
| 3 | `eligibility` | Eligibility | Tally eligibility | Age; jurisdiction; one account per person |
| 4 | `accounts` | Your account | Spotify “Account” | Registration accuracy; OAuth; credential security; `user.model` fields |
| 5 | `subscriptions` | Subscriptions | Spotify Premium / Apple subscriptions | Free vs paid; Paystack; renewal; cancellation; refunds via store/channel |
| 6 | `content-licence` | Content licence | Apple “Licensed content” | Limited personal non-commercial streaming licence; minister ownership |
| 7 | `restrictions` | Restrictions | Spotify “User guidelines” | No download/redistribute except permitted sharing; no circumvention; no unlawful use |
| 8 | `trust-and-safety` | Trust & safety | [WhatsApp Trust & Safety](https://whatsappbusiness.com/trust-and-safety/) | Prohibited conduct; hate, harassment, spam; reporting to `hello@troott.com` — **P1 fold-in** |
| 9 | `intellectual-property` | IP | [WhatsApp IP Policy](https://www.whatsapp.com/legal/ip-policy/) | Troott trademarks; respect minister copyright; takedown email process — **P1 fold-in** |
| 10 | `third-party` | Third parties | Spotify third-party | Ministers are third-party content providers; links out |
| 11 | `disclaimers` | Disclaimers | Spotify disclaimers | As-is service; sermon content not endorsed by Troott theologically |
| 12 | `liability` | Liability | Spotify limitation | Cap `<!-- LEGAL_REVIEW -->`; excluded damages |
| 13 | `indemnity` | Indemnity | Amazon / Spotify | User indemnifies for misuse (if counsel approves) |
| 14 | `termination` | Termination | Spotify termination | Suspension; `DELETE /user/deactivate` = deactivation not guaranteed erasure |
| 15 | `governing-law` | Governing law | Spotify / Tally | Venue and law `<!-- LEGAL_REVIEW -->` |
| 16 | `contact` | Contact | All | `hello@troott.com` |

---

## Listener — Cookies & Storage

**Target:** 6–8 sections · Benchmark: Spotify Cookie Policy

| # | Section `id` | `navLabel` | Benchmark anchor | Troott content (required) |
| - | ------------ | ---------- | ---------------- | ------------------------- |
| 1 | `overview` | Overview | Spotify cookie intro | Native app vs website; this doc covers both |
| 2 | `mobile-storage` | App storage | N/A (Spotify app) | Keychain/JWT (`secure-storage`); MMKV cache keys; not browser cookies |
| 3 | `website-cookies` | Website | Spotify cookie table | Vercel Analytics; MailerLite if user visits troott.com |
| 4 | `purposes` | Purposes | Spotify purposes | Auth, preferences, analytics, security |
| 5 | `third-parties` | Third parties | Spotify third-party | Vercel, MailerLite, OAuth on web login if any |
| 6 | `duration` | Duration | Spotify retention | Session vs persistent; MMKV/TTL where known |
| 7 | `managing` | Your choices | Spotify manage cookies | OS settings; logout; newsletter unsubscribe; link Privacy |
| 8 | `contact` | Contact | — | `hello@troott.com` |

---

## Listener — GDPR

**Target:** 8–10 sections · Benchmark: [Tally GDPR](https://tally.so/help/gdpr)

| # | Section `id` | `navLabel` | Benchmark anchor | Troott content (required) |
| - | ------------ | ---------- | ---------------- | ------------------------- |
| 1 | `controller` | Controller | Tally controller | Troott Technologies; contact |
| 2 | `scope` | Scope | Tally scope | EEA/UK residents; listener app processing |
| 3 | `lawful-bases` | Lawful bases | Tally lawful bases | Table: purpose → basis → data categories |
| 4 | `rights` | Your rights | Tally rights list | Arts. 15–22 summary in plain English |
| 5 | `exercise-rights` | Exercise rights | Tally how-to | Email `hello@troott.com`; identity verification; **no self-serve export API yet** |
| 6 | `response-times` | Response times | GDPR statutory | One month + extension disclaimer |
| 7 | `processors` | Processors | Tally subprocessors | Full processor table + purposes |
| 8 | `transfers` | Transfers | Tally transfers | US/AWS; safeguards |
| 9 | `complaints` | Complaints | Tally / GDPR Art. 77 | Supervisory authority; contact us first |
| 10 | `contact` | Contact | — | DPO if appointed `<!-- LEGAL_REVIEW -->` |

---

## Minister — Privacy Policy

**Target:** 14–16 sections · Benchmarks: [Amazon Music for Artists](https://www.amazon.com/gp/help/customer/display.html?nodeId=201380010) (creator), Apple Music annex pattern, Spotify Privacy

| # | Section `id` | `navLabel` | Benchmark anchor | Troott content (required) |
| - | ------------ | ---------- | ---------------- | ------------------------- |
| 1 | `overview` | Overview | Amazon artist privacy | Studio + minister account scope |
| 2 | `scope` | Scope | Apple annex split | Studio web app; uploads; separate from listener app privacy |
| 3 | `data-we-collect` | Data we collect | Amazon / minister model | User fields + `minister.model`: ministry profile, HQ, socials, sermon uploads, analytics aggregates |
| 4 | `identity-verification` | ID verification | WhatsApp Business verification | Government ID images (NIN, licence, passport); purpose; who accesses; retention post-verification |
| 5 | `sermon-data` | Sermon data | Amazon Music for Artists uploads | Audio files, metadata, processing pipeline, HLS storage (AWS) |
| 6 | `analytics` | Analytics | Creator analytics | Playback aggregates; what ministers see vs listener PII |
| 7 | `how-we-use` | How we use | Spotify purposes | Publish, transcode, deliver, verify, billing, support, improve Studio |
| 8 | `legal-bases` | Legal bases | Tally GDPR | Include explicit basis for ID docs — **LEGAL_REVIEW sensitive data** |
| 9 | `sharing` | Sharing | feat-0014 processor table | AWS, Paystack, PostHog/Sentry/Reo (prod), email |
| 10 | `retention` | Retention | Published sermon policy | **Published sermons non-deletion**; ID doc retention; deactivate behavior |
| 11 | `security` | Security | Apple security | Access controls; RBAC; admin access to verification docs |
| 12 | `international-transfers` | Transfers | Spotify transfers | Same as listener where shared infrastructure |
| 13 | `your-rights` | Your rights | GDPR | Link minister GDPR page |
| 14 | `teams` | Teams | Amazon account users | Team invites; roles (`permissions.json`); each member’s data |
| 15 | `changes` | Changes | — | Notification method |
| 16 | `contact` | Contact | — | `hello@troott.com` |

---

## Minister — Terms of Use

**Target:** 14–16 sections · Benchmarks: [Amazon Music for Artists ToS](https://artists.amazon.com/terms), [WhatsApp Business Terms](https://www.whatsapp.com/legal/business-terms), Tally Terms

| # | Section `id` | `navLabel` | Benchmark anchor | Troott content (required) |
| - | ------------ | ---------- | ---------------- | ------------------------- |
| 1 | `acceptance` | Acceptance | Amazon Artists | Studio at `app.troott.com`; binding agreement |
| 2 | `studio-service` | Studio service | Amazon upload terms | Upload, process, publish, analytics, share links |
| 3 | `eligibility` | Eligibility | WhatsApp Business | Minister/ministry representation; accurate info |
| 4 | `verification` | Verification | WhatsApp Business verification | ID verification requirement; refusal/suspension if failed |
| 5 | `your-content` | Your content | Amazon Music for Artists | Ownership; licence grant to Troott to host/distribute/stream |
| 6 | `content-standards` | Content standards | Trust & Safety | Christian teaching context; illegal content; copyright; hate |
| 7 | `published-sermons` | Published sermons | Troott policy | **Cannot delete published sermons** — cite studio policy |
| 8 | `teams` | Teams | SaaS team terms | Invites; responsibility for team actions; RBAC |
| 9 | `plans` | Plans & billing | Spotify / Paystack | Subscription plans; minister billing |
| 10 | `analytics` | Analytics | Amazon artist stats | Aggregated listener data; no raw PII export to ministers |
| 11 | `trust-and-safety` | Trust & safety | WhatsApp Trust & Safety | Enforcement; strikes; suspension |
| 12 | `intellectual-property` | IP | WhatsApp IP Policy | DMCA-style notice; counter-notice; Troott marks |
| 13 | `termination` | Termination | Tally termination | Deactivate; effect on published content |
| 14 | `disclaimers` | Disclaimers | — | Platform not liable for minister theology |
| 15 | `liability` | Liability | Tally cap | `<!-- LEGAL_REVIEW -->` |
| 16 | `contact` | Contact | — | `hello@troott.com` |

---

## Minister — Cookies

**Target:** 7–8 sections · Benchmark: Spotify Cookie Policy + feat-0014 Studio cookie keys

| # | Section `id` | `navLabel` | Benchmark anchor | Troott content (required) |
| - | ------------ | ---------- | ---------------- | ------------------------- |
| 1 | `overview` | Overview | Spotify | Studio is web — cookies apply |
| 2 | `essential` | Essential | Spotify strictly necessary | `token`, `userId`, `userType`, `userEmail`, `businessType`, `studioCode` (~24h) — **not httpOnly** |
| 3 | `preferences` | Preferences | — | `sidebar_state` (7d) |
| 4 | `analytics` | Analytics | Spotify analytics cookies | PostHog (prod); session recording disclaimer if enabled |
| 5 | `security` | Security | — | `x-hit` idempotency; purpose |
| 6 | `third-parties` | Third parties | Spotify | PostHog, Sentry, Reo, Vercel if applicable |
| 7 | `managing` | Managing | Spotify | Browser clear; logout; link Privacy |
| 8 | `contact` | Contact | — | `hello@troott.com` |

**Cookie table (include in `essential` or appendix section):**

| Name | Purpose | Duration | Essential |
| ---- | ------- | -------- | --------- |
| `token` | Authentication | ~24h | Yes |
| `userId` | Session identity | ~24h | Yes |
| `userType` | Role routing | ~24h | Yes |
| `userEmail` | Display / account | ~24h | Yes |
| `businessType` | Studio context | ~24h | Yes |
| `studioCode` | Studio portal | ~24h | Yes |
| `sidebar_state` | UI preference | 7d | No |

---

## Minister — GDPR

**Target:** 9–10 sections · Benchmark: Tally GDPR + minister-specific sensitive data

| # | Section `id` | `navLabel` | Benchmark anchor | Troott content (required) |
| - | ------------ | ---------- | ---------------- | ------------------------- |
| 1 | `controller` | Controller | Tally | Troott Technologies |
| 2 | `scope` | Scope | — | Ministers / Studio users in EEA/UK |
| 3 | `special-categories` | Sensitive data | GDPR Art. 9 | Government ID; explicit basis and safeguards |
| 4 | `lawful-bases` | Lawful bases | Tally table | Verification, publishing, billing, analytics |
| 5 | `rights` | Your rights | Tally | Full rights list |
| 6 | `exercise-rights` | Exercise rights | Tally | Email process; ID doc copy requests |
| 7 | `processors` | Processors | Tally | Extended list incl. Sentry, Reo |
| 8 | `transfers` | Transfers | — | AWS US |
| 9 | `complaints` | Complaints | — | Supervisory authority |
| 10 | `contact` | Contact | — | `hello@troott.com` |

---

## Phase 2 — Optional standalone documents

If Phase 2 routes are approved, extract **P1 fold-in** sections into dedicated pages.

### Trust & Safety (`trust-and-safety`) — P2

| Section `id` | Benchmark | Troott content |
| ------------ | --------- | -------------- |
| `principles` | WhatsApp Trust & Safety | Safety-first platform for Christian audio |
| `prohibited-content` | WhatsApp | Illegal, harmful, spam, impersonation |
| `minister-obligations` | WhatsApp Business | Accurate metadata; rights to publish |
| `listener-obligations` | Spotify guidelines | Personal use; no abuse of sharing |
| `enforcement` | WhatsApp | Warnings, suspension, termination |
| `appeals` | — | Email appeal process `<!-- LEGAL_REVIEW -->` |
| `contact` | — | `hello@troott.com` |

### Intellectual Property (`intellectual-property`) — P2

| Section `id` | Benchmark | Troott content |
| ------------ | --------- | -------------- |
| `troott-ip` | WhatsApp IP | Troott name, logo, UI |
| `minister-content` | Amazon Music for Artists | Ownership; licence to Troott |
| `listener-restrictions` | Apple licence | No unauthorised copying |
| `copyright-claims` | WhatsApp IP / DMCA | Notice requirements; agent email |
| `counter-notice` | DMCA | Counter-notification process |
| `repeat-infringer` | US DMCA | Policy `<!-- LEGAL_REVIEW if US -->` |
| `trademark` | WhatsApp IP | Minister name usage guidelines |
| `contact` | — | `hello@troott.com` |

### Report Abuse (`report-abuse`) — P2

| Section `id` | Benchmark | Troott content |
| ------------ | --------- | -------------- |
| `what-to-report` | Tally Report Abuse | Copyright, harassment, illegal content, impersonation |
| `how-to-report` | Tally | Email `hello@troott.com`; include URL/sermon ID |
| `what-we-do` | Tally | Review timeline; actions we may take |
| `emergency` | — | Not for emergencies — contact local authorities |
| `false-reports` | — | Misuse of reporting |
| `contact` | — | `hello@troott.com` |

---

## Hub pages — required blocks

### `/legal/listener` hub sections

| Section `id` | Content |
| ------------ | ------- |
| `welcome` | Who this pack is for; app + account |
| `documents` | Card per doc: Terms, Privacy, Cookies, GDPR (+ P2 docs if live) |
| `quick-links` | Most requested: Privacy, Terms, contact |
| `related` | Link to `/legal/minister` for Studio users |

### `/legal/minister` hub sections

| Section `id` | Content |
| ------------ | ------- |
| `welcome` | Studio publishers; verification mention |
| `documents` | Same four (+ P2) |
| `quick-links` | Privacy (ID section), Terms (content standards), contact |
| `related` | Link to `/legal/listener` for app users |

---

## Processor reference (copy once, sync with feat-0014)

Maintain identical processor descriptions across Privacy, GDPR, and Cookies where applicable:

| Processor | Data processed | Surfaces |
| --------- | -------------- | -------- |
| AWS S3 / CloudFront | Media, uploads, IDs | Mobile, Studio, API |
| MongoDB | Account, content metadata | API |
| Redis | Cache, sessions | API |
| Paystack | Payment tokens, billing | Mobile, Studio |
| Bugsnag | Crashes, user id | Mobile |
| PostHog | Usage events | Mobile (opt), Studio (prod) |
| Sentry | Errors | Studio (prod) |
| Reo | Observability | Studio (prod) |
| Vercel Analytics | Page views | Website |
| MailerLite | Email, name, consent | Website newsletter |
| Google / Apple / GitHub OAuth | Auth tokens, profile | Mobile, Studio |
| Email providers | Transactional email | API |

---

## Implementation checklist (engineering)

When content is expanded, verify:

- [ ] `LegalDocument.sections.length` meets minimums above
- [ ] Scrollspy nav scrolls correctly with 10+ sections (sticky offset)
- [ ] Internal links use `/legal/{audience}/{slug}#section-id` where deep-linking added
- [ ] `lastUpdated` ISO date updated on all touched files
- [ ] `sourceRefs` array updated per document
- [ ] Mobile About + Play Store listing URLs match ([feat-0014 D6](../feat-0014/PRODUCT.md#d6--legacy-url-redirects))
- [ ] API email templates use new Terms URL
- [ ] Newsletter modal privacy link → `/legal/listener/privacy-policy`

---

## Changelog

| Date | Change |
| ---- | ------ |
| 2026-06-02 | Initial matrix — feat-0017 created from Spotify, Tally, WhatsApp, Apple, Amazon benchmarks |
| 2026-06-02 | **Implemented** — Phase 1 content expanded in `apps/website/_data/legal/**` (8 documents + 2 hubs) |
