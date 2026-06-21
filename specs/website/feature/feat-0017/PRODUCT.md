# feat-0017: Comprehensive legal content — benchmark spec

## Summary

Normative **content specification** for Troott’s on-site legal library at **`apps/website`** (`https://troott.com/legal`).

This spec defines **what** each legal document must say, **how complete** it must be, and **which benchmark policies** to use as coverage checklists. It builds on the route tree, UI, and scrollspy layout in [feat-0014](../feat-0014/PRODUCT.md) — it does **not** redefine components or URLs.

**Deliverable:** Expanded copy in `apps/website/_data/legal/{listener|minister}/` that is **comprehensive, Troott-accurate, and legally review-ready** — not placeholder stubs.

**Audience split (unchanged from feat-0014):**

| Audience | Product surface | Legal focus |
| -------- | --------------- | ----------- |
| **Listener** | Troott mobile app (`apps/mobile`) | Streaming, library, subscriptions, personal data |
| **Minister** | Troott Studio (`apps/web`) | Uploads, verification, sermon rights, team access, analytics |

---

## Problem

| Today | Gap |
| ----- | --- |
| feat-0014 ships **structure** (chooser, hub, 4 docs × 2 audiences, scrollspy) | Section outlines are **minimal** (4–8 sections each) |
| Current `_data/legal/**` files are **first drafts** grounded in code | Missing standard clauses found in mature consumer/streaming/creator platforms |
| No single **coverage matrix** for legal/compliance review | Writers and counsel lack a checklist tied to Spotify, Apple, WhatsApp-class policies |
| Trust & safety, IP, and abuse reporting are **implicit** in terms | WhatsApp / Tally benchmarks treat these as **first-class** topics |

**Goal:** One spec legal writers and engineers can follow to produce **comprehensive** Troott legal copy — deep enough for app-store review, GDPR inquiries, and minister onboarding — without over-promising relative to shipped code ([feat-0014 D8](../feat-0014/PRODUCT.md#d8--known-gaps-align-before-launch)).

---

## Reference benchmarks (read-only)

Use these as **coverage checklists**, not copy-paste sources. Adapt language to Troott’s actual products, jurisdictions, and processors.

### Streaming / consumer audio

| Reference | URL | Use for |
| --------- | --- | ------- |
| Spotify Privacy Policy | [spotify.com/ng/legal/privacy-policy](https://www.spotify.com/ng/legal/privacy-policy/) | Data categories, purposes, sharing, retention, rights, children, international transfers |
| Spotify Cookie Policy | Spotify Cookie Policy | Cookie types, third-party, duration, opt-out |
| Spotify Terms of Use | Terms and Conditions of Use - Spotify | Service description, accounts, subscriptions, content licence, conduct, termination, liability, dispute resolution |

### Forms / SaaS / GDPR ops

| Reference | URL | Use for |
| --------- | --- | ------- |
| Tally Terms | [tally.so terms](https://tally.so/terms) | SaaS acceptance, acceptable use, account termination, limitation of liability |
| Tally GDPR | [tally.so/help/gdpr](https://tally.so/help/gdpr) | Controller/processor roles, lawful bases, DSR workflow, subprocessors |
| Tally Report abuse | [tally.so/help/report-abuse](https://tally.so/help/report-abuse) | Abuse reporting channel, investigation, enforcement |

### Messaging / platform trust

| Reference | URL | Use for |
| --------- | --- | ------- |
| WhatsApp Business Terms | [whatsapp.com/legal/business-terms](https://www.whatsapp.com/legal/business-terms) | Business-user obligations, acceptable messaging, compliance |
| WhatsApp Trust & Safety | [whatsappbusiness.com/trust-and-safety](https://whatsappbusiness.com/trust-and-safety/) | Safety principles, prohibited content, enforcement |
| WhatsApp IP Policy | [whatsapp.com/legal/ip-policy](https://www.whatsapp.com/legal/ip-policy) | Copyright, trademark, takedown / counter-notice process |
| WhatsApp Legal hub | [whatsapp.com/legal](https://www.whatsapp.com/legal) | Information architecture — hub linking all policy types |

### Platform / media storefronts

| Reference | URL | Use for |
| --------- | --- | ------- |
| Apple Privacy | [apple.com/legal/privacy](https://www.apple.com/legal/privacy/en-ww/) | Privacy principles, data minimization, user controls |
| Apple Music privacy | [apple.com/legal/privacy/data/en/apple-music](https://www.apple.com/legal/privacy/data/en/apple-music/) | **Service-specific** privacy annex (model for listener vs minister split) |
| Apple Media Services Terms | [apple.com/legal/internet-services/itunes](https://www.apple.com/legal/internet-services/itunes/) | Digital content licence, subscription billing, regional terms |
| Amazon Privacy Notice | [amazon.com privacy help](https://www.amazon.com/gp/help/customer/display.html?nodeId=201380010) | Broad privacy categories, advertising, interest-based choices |
| Amazon Music for Artists ToS | Amazon Music for Artists Terms of Use | **Creator-side** terms — uploads, royalties, content standards, account standing |

---

## Scope

### In scope (Phase 1 — required)

Expand **all eight existing documents** (4 listener + 4 minister) to **comprehensive** section coverage per [LEGAL_CONTENT_MATRIX.md](./LEGAL_CONTENT_MATRIX.md):

| Route | Document |
| ----- | -------- |
| `/legal/listener/terms-of-use` | Listener Terms of Use |
| `/legal/listener/privacy-policy` | Listener Privacy Policy |
| `/legal/listener/cookies` | Listener Cookie & Storage Policy |
| `/legal/listener/gdpr` | Listener GDPR / Data Rights |
| `/legal/minister/terms-of-use` | Minister / Studio Terms of Use |
| `/legal/minister/privacy-policy` | Minister Privacy Policy |
| `/legal/minister/cookies` | Studio Cookie Policy |
| `/legal/minister/gdpr` | Minister GDPR / Data Rights |

Also update **hub pages** (`listener/hub.ts`, `minister/hub.ts`) to summarize each doc and link to new sections (WhatsApp Legal hub pattern).

### In scope (Phase 2 — recommended)

Add **three optional document types** per audience (new slugs — requires feat-0014 TECH extension):

| Proposed slug | Title | Benchmark | Primary audience |
| ------------- | ----- | --------- | ---------------- |
| `trust-and-safety` | Trust & Safety | WhatsApp Trust & Safety | Both (minister-heavy) |
| `intellectual-property` | Intellectual Property | WhatsApp IP Policy, Amazon Music for Artists | Minister primary; listener redistribution rules |
| `report-abuse` | Report Abuse | Tally Report Abuse | Both |

Phase 2 is **optional for v1 launch** if Phase 1 Terms + Privacy include consolidated Trust/IP/Abuse sections (see matrix **fold-in rules**).

### Out of scope

- Replacing qualified legal counsel — all copy ships with `<!-- LEGAL_REVIEW -->` flags where noted
- Privacy policy for **pacepard.com** or unrelated products
- Terms of Sale / payment-plan legal (track as separate product decision — [feat-0014 D8](../feat-0014/PRODUCT.md))
- Auto-generated policies from third-party generators without Troott-specific review

---

## Key decisions

| ID | Decision |
| -- | -------- |
| D1 | **feat-0014 routes and components are frozen** — this spec only expands `_data/legal/**` content and hub intros |
| D2 | **Minimum section count:** Privacy & Terms → **10–14 scrollspy sections** each; Cookies → **6–8**; GDPR → **8–10** |
| D3 | **Benchmark method:** For each Troott section, matrix lists **≥1 reference anchor**; writer verifies Troott equivalent exists or marks N/A with rationale |
| D4 | **Code truth rule:** Every factual claim must cite a `sourceRefs` entry (file path or spec) — same pattern as existing `_data/legal/listener/privacy-policy.ts` |
| D5 | **No over-promise:** Deactivation ≠ deletion; no instant data export; analytics lawful basis must match prod behavior ([feat-0014 D8](../feat-0014/PRODUCT.md#d8--known-gaps-align-before-launch)) |
| D6 | **Service annex pattern:** Listener Privacy = “Apple Music annex”; Minister Privacy = creator/studio annex — shared core + audience-specific sections |
| D7 | **Phase 1 fold-in:** Trust & Safety, IP, and Report Abuse content **must** appear somewhere in Phase 1 (typically Terms § Conduct, Privacy § Rights, Terms § Contact) even if Phase 2 routes are deferred |
| D8 | **Last updated:** ISO date in `lastUpdated` + human month in `headingMuted`; bump on every material legal change |
| D9 | **Contact:** `hello@troott.com` for legal/privacy/abuse until dedicated `privacy@` / `legal@` aliases exist |
| D10 | **Jurisdiction placeholder:** Governing law and venue sections ship with `<!-- LEGAL_REVIEW: Nigeria / UK / EU -->` until counsel confirms |

---

## Document inventory vs benchmarks

High-level mapping — full section lists in [LEGAL_CONTENT_MATRIX.md](./LEGAL_CONTENT_MATRIX.md).

| Troott document | Primary benchmarks | Comprehensive themes |
| --------------- | ------------------ | -------------------- |
| **Privacy Policy** | Spotify Privacy, Apple Privacy, Apple Music annex, Amazon Privacy | Categories, sources, purposes, legal bases, sharing/processors, retention, security, automated decisions, children, international transfers, changes, contact |
| **Terms of Use** | Spotify ToS, Apple Media Services, Amazon Music for Artists, Tally ToS | Acceptance, eligibility, service description, accounts, subscriptions, content licence (listen vs publish), user conduct, trust & safety, IP / DMCA, third-party links, disclaimers, liability cap, indemnity, termination, changes, governing law, contact |
| **Cookies** | Spotify Cookie Policy | What technologies apply (web cookies vs app storage), table of cookies/storage keys, purposes, durations, third parties, manage/opt-out |
| **GDPR** | Tally GDPR, Spotify Privacy (rights chapter) | Controller, DPO/contact, lawful bases table, rights list, how to exercise, timelines, processors/subprocessors, transfers, SCCs, complaints, automated decision-making |
| **Trust & Safety** (Phase 2) | WhatsApp Trust & Safety | Community standards, prohibited content, enforcement, appeals, minister content moderation |
| **Intellectual Property** (Phase 2) | WhatsApp IP, Amazon Music for Artists | Troott IP, user/minister content ownership, licence grant to Troott, listener restrictions, takedown notice, counter-notice, repeat infringer |
| **Report Abuse** (Phase 2) | Tally Report Abuse | What to report, how (email/form), what happens, emergency disclaimer |

---

## Content authoring workflow

```text
1. Read LEGAL_CONTENT_MATRIX.md section for target document
2. Gather facts from sourceRefs (feat-0014 D7 monorepo index + matrix Troott column)
3. Draft section body HTML in _data/legal/{audience}/{slug}.ts
4. Mark gaps: <!-- LEGAL_REVIEW: ... --> or <!-- PRODUCT_DECISION: ... -->
5. Cross-link other docs (relative hrefs: /legal/{audience}/...)
6. Legal counsel review → remove review flags → set lastUpdated
7. QA: scrollspy nav matches section ids; mobile flow; footer links
```

### `LegalSection` body rules (feat-0014 content model)

- Valid HTML fragments: `<p>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<a href="">`
- One **idea per section** — scrollspy `navLabel` ≤ 28 characters where possible
- Tables (cookie lists, lawful bases): use `<ul>` or HTML `<table>` if prose component supports it; else structured lists
- Define acronyms once per document (GDPR, EEA, DPA)

### Hub page updates

Each hub (`/legal/listener`, `/legal/minister`) must include:

1. **Intro** — who this legal pack is for (1–2 paragraphs)
2. **Document cards** — title, 1-sentence summary, link (mirror WhatsApp `/legal` hub)
3. **Quick links** — Privacy, Terms, Contact email
4. **Last reviewed** date aligned with most recent doc update

---

## Acceptance criteria

### Phase 1 (ship gate)

- [ ] All **8 documents** meet **minimum section counts** in [LEGAL_CONTENT_MATRIX.md](./LEGAL_CONTENT_MATRIX.md)
- [ ] Every section has unique `id`, `navLabel`, `title`, non-empty `body`
- [ ] **Trust & Safety**, **IP**, and **Report Abuse** themes present (folded into Terms/Privacy or standalone)
- [ ] All processor names match [feat-0014 processor table](../feat-0014/PRODUCT.md#third-party-processors-maintain-in-copy)
- [ ] No statement contradicts [feat-0014 D8 gaps](../feat-0014/PRODUCT.md#d8--known-gaps-align-before-launch) without explicit disclaimer
- [ ] `sourceRefs` on each document lists files used for factual claims
- [ ] Hub pages summarize all four docs per audience
- [ ] Mobile app + footer URLs point to on-site legal ([feat-0014 D6](../feat-0014/PRODUCT.md#d6--legacy-url-redirects))
- [ ] External legal review sign-off recorded (date + reviewer in commit message or `LEGAL_REVIEW.md` changelog)

### Phase 2 (optional)

- [ ] New slugs registered in `LegalDocSlug`, routes, doc switcher, footer
- [ ] Standalone Trust & Safety, IP, Report Abuse pages per audience
- [ ] Cross-links from Terms/Privacy to dedicated pages

---

## Dependencies

| Dependency | Role |
| ---------- | ---- |
| [feat-0014 PRODUCT](../feat-0014/PRODUCT.md) | Routes, UI, content types, processor list, code-source index |
| [feat-0014 TECH](../feat-0014/TECH.md) | `_data/legal/**` file layout, `LegalDocumentPage` |
| `apps/api` models & configs | Factual accuracy for data collected, retention, deactivate |
| `apps/mobile/docs/google-play-store-listing.md` | Play Store alignment |
| Legal counsel | Final approval — spec is not legal advice |

---

## Related files

| Path | Purpose |
| ---- | ------- |
| [LEGAL_CONTENT_MATRIX.md](./LEGAL_CONTENT_MATRIX.md) | Section-by-section outlines + benchmark mapping |
| `apps/website/_data/legal/**` | Implementation target |
| `specs/website/feature/feat-0014/PRODUCT.md` | UI + route normative spec |

---

## Open questions (resolve before legal review)

| # | Question | Owner |
| - | -------- | ----- |
| Q1 | Governing law: Nigeria only, or Nigeria + UK/EU addendum? | Legal |
| Q2 | Minimum age for listeners (13+ vs 16+ vs 18+)? | Legal + Product |
| Q3 | Dedicated `privacy@troott.com` / `abuse@troott.com` aliases? | Ops |
| Q4 | Phase 2 standalone Trust/IP/Abuse routes — yes/no for v1? | Product + Legal |
| Q5 | Terms of Sale — separate doc or fold into Terms § Subscriptions? | Product |
| Q6 | Cookie consent banner for Studio/website analytics — required before claiming “consent” basis? | Product + Legal |
