# Minister page content spec — `/minister`

**Route:** `apps/website/app/minister/page.tsx`  
**Audience:** Ministers, preachers, teachers, and ministry teams who publish sermons  
**Voice:** Simple, everyday conversational English. Talk like a helpful colleague, not a pitch deck.  
**Sources:** [`content.txt`](../../../../apps/website/_data/content.txt) (minister pain, piracy, distribution, discipleship), existing [`audience-landing.ts`](../../../../apps/website/_data/troott/audience-landing.ts), [feat-0015](../feat-0015/PRODUCT.md).

---

## Summary

The minister page is Troott’s **Studio landing**. It speaks to people who **preach, teach, and upload** — not people who listen.

Every block on the page should answer one question ministers actually ask:

> “Will this help me reach more people, protect my work, and make disciples — without me becoming a full-time content manager?”

**Do not reuse listener copy** (Discover, Listen anywhere, Share easily). Those jobs belong on `/listener`.

---

## Who this page is for

| Person | What they need |
| ------ | -------------- |
| **Senior pastor** | One trusted place for the church’s sermon library |
| **Traveling preacher** | Listeners can find and follow them after a conference |
| **Teaching pastor** | Series and topics stay organised, not buried in chat groups |
| **Ministry team** | Upload once; Troott handles processing and delivery |

---

## Positioning (from `content.txt`)

### The problem we name out loud

- Christian ministers lose sermons to **piracy** and **unmonetized sharing**.
- Most pastors give messages away **not because they want to**, but because there is **no good way to distribute** them.
- Sermons get **passed around with no credit**, or **buried on platforms** where nobody finds them.
- WhatsApp groups, YouTube, and random blogs are where people hunt today — **messy, untrusted, hard to search**.

### What Troott promises

- A **mobile-first home** for life-giving sermons and teachings.
- A **discipleship tool** — not just another upload folder.
- **Upload once, reach listeners everywhere** — Troott handles processing, hosting, and delivery.
- Early feedback: ministers see Troott as a way to **reach more listeners and protect their content**.

### Outcomes ministers care about

1. **More people hear the Gospel** from their voice — beyond Sunday morning.
2. **Their work is credited and findable** — not lost in forwarded voice notes.
3. **Less admin, more ministry** — upload, organise, publish; Troott runs the pipeline.
4. **Disciples, not just downloads** — listeners follow, save, and return.

---

## Jobs To Be Done (JTBD)

| When I… | I want to… | So I can… |
| ------- | ---------- | --------- |
| Finish preaching on Sunday | Upload the message quickly | People who missed church can still hear it |
| See my sermon in a WhatsApp group with no credit | Put my work in one official place | Listeners know where to find the real version |
| Grow beyond my local congregation | Share a profile and library link | Followers anywhere can subscribe to my voice |
| Manage years of teachings | Organise by series, date, and topic | Old messages stay as easy to find as new ones |
| Trust the platform with my audio | Know Troott processes and hosts properly | I focus on preaching, not file formats and hosting |

---

## Aha moments (what should “click” on this page)

| Moment | Copy direction |
| ------ | -------------- |
| **“That’s my problem”** | Name piracy and uncredited sharing in plain language — ministers have lived this. |
| **“I don’t need another social app”** | Troott is for sermons and discipleship, not algorithm noise. |
| **“Upload once is enough”** | Studio upload → Troott processes → listeners get it on mobile and web. |
| **“My people can actually find me”** | Public profile, follow, organised library — search by minister, series, topic. |
| **“This protects my work”** | Official home for messages; less random reposting without credit. |

---

## Page structure (top → bottom)

```text
/minister
├── 1. HeroSection              — minister hero + CTAs + hero visual
├── 2. Value props (3 cards)    — minister JTBD outcomes (NOT listener cards)
├── 3. WhyTroottTabsSection     — default tab: Studio; minister-first copy
├── 4. BenefitsSection          — minister variant (publish / protect / reach)
├── 5. ProductWorkflowsSection  — default tab: Studio; publish workflow story
├── 6. FaqsSection              — minister FAQ subset
└── (layout) Cross-link         — “Just want to listen?” → /listener
```

Global layout still renders **Footer** and **DownloadsSection** per site shell unless a later spec hides downloads on `/minister`.

---

## Section 1 — Hero

**Component:** `HeroSection`  
**Data:** `ministerHeroContent` in `@/_data/troott/audience-landing.ts`

### Metadata

| Field | Copy |
| ----- | ---- |
| `title` | `Ministers \| Publish and distribute your sermons` |
| `description` | `Upload sermons, manage your library, and help more people hear the Gospel. Troott Studio is built for ministers, preachers, and ministry teams.` |

### Hero copy

| Element | Copy |
| ------- | ---- |
| H1 line 1 | `Disciple more people` |
| H1 line 2 (muted) | `through your sermons.` |
| Subtext | `Most pastors give their sermons away because there is no easy way to share them. Troott is your home for life-giving messages — upload once, reach people who are already looking, and stop losing your work in random chats and reposts.` |
| Hero image | `/blocks/upload-list.svg` (or `/images/hero-minister.png` when photography is ready) |
| Image alt | `Troott Studio for ministers` |

### CTAs (same button pattern as home — order matters)

| Order | Style | Label | Target |
| ----- | ----- | ----- | ------ |
| 1 | Primary (filled) + upload icon | **Upload sermons** | `siteConfig.baseLinks.studio` (new tab) |
| 2 | Outline | **Request demo** | `siteConfig.baseLinks.requestDemo` when HTTP URL; else **Contact Sales** → `mailto:hello@troott.com` |

**JTBD:** Primary = “I want to publish now.” Secondary = “I want to talk to someone first.”

---

## Section 2 — Value props (3 cards)

**Component:** `AudienceLandingPage` value-props block only (`showHero={false}`)  
**Data:** `ministerLandingContent.valueProps` in `@/_data/troott/audience-landing.ts`

**Replace listener cards.** These are the minister equivalents:

| # | Title | Description | JTBD / outcome |
| - | ----- | ----------- | -------------- |
| 1 | **Stop losing your sermons** | Your messages should not live in WhatsApp forwards and random uploads. Troott gives every sermon a proper home — with your name, your ministry, and a link you can trust. | Protect work; end uncredited sharing |
| 2 | **Upload once, we handle the rest** | Upload audio from Studio. Troott processes it, hosts it, and delivers it to listeners on mobile and web. You preach. We take care of the tech. | Reduce admin; publish reliably |
| 3 | **Reach people who are ready to listen** | Listeners are already searching for voices they trust. Share your profile, build your library, and let hungry hearts follow you — without fighting an algorithm. | Grow reach; findable ministry |

### Section chrome

| Token | Value |
| ----- | ----- |
| Background | `bg-[#0d0d0d]` |
| Grid | 3 columns on `md+` |
| Card | `border border-white/10 rounded-xl p-6` |

### Cross-link (below cards)

| Copy | Link |
| ---- | ---- |
| Just want to listen? **Get Troott for listeners** | `/listener` |

---

## Section 3 — Why Troott (tabbed)

**Component:** `WhyTroottTabsSection`  
**Data:** minister variant — `ministerWhyTroottContent` (new export, do not mutate homepage default)

### Section header

| Element | Copy |
| ------- | ---- |
| Label | `// Why Troott` |
| Heading | `Publish with confidence.` |
| Heading muted | `Disciple at scale.` |
| **Default tab** | `studio` (not `listen`) |

### Tabs (minister page order — Studio first)

#### Tab 1 — Troott Studio (default)

| Field | Copy |
| ----- | ---- |
| Nav label | `Troott Studio` |
| Eyebrow | `Troott Studio` |
| Title | `Your sermon library, managed` |
| Description | `Upload audio, organise series, and keep every message in one place. Troott Studio is built for ministers who want to reach more people without turning into full-time content managers.` |
| CTA | **Upload sermons** → Studio |
| Image alt | `Troott Studio upload and library` |

#### Tab 2 — Reach listeners

| Field | Copy |
| ----- | ---- |
| Nav label | `Reach listeners` |
| Title | `People can finally find you` |
| Description | `Listeners follow ministers they trust. When your sermons are on Troott, people pick up where they left off, save teachings, and share them with family — with your name attached.` |
| CTA | **See the listener app** → `/listener` |

#### Tab 3 — Protect your work

| Field | Copy |
| ----- | ---- |
| Nav label | `Protect your work` |
| Title | `Less piracy. More credit.` |
| Description | `Sermons get passed around with no name and no link back to you. Troott gives your ministry an official home so listeners know where the real message lives.` |
| CTA | **Upload sermons** → Studio |

#### Tab 4 — For churches

| Field | Copy |
| ----- | ---- |
| Nav label | `For churches` |
| Title | `One library for your whole church` |
| Description | `Give every minister a home for their messages and every member one app to grow together. Keep your church teachings organised and easy to share.` |
| CTA | **Request demo** → `requestDemo` or mailto fallback |

**Hide or de-emphasise** pure listener tabs (“Get the app” as default story) on this page.

---

## Section 4 — Benefits grid

**Component:** `BenefitsSection`  
**Data:** `ministerBenefitsContent` (new export)

### Section header

| Element | Copy |
| ------- | ---- |
| Label | `// Benefits` |
| Heading | `Built for ministers` |
| Heading muted | `who want reach without the hassle.` |

### Six benefit cards (minister outcomes)

| ID | Title | Description |
| -- | ----- | ----------- |
| `publish` | **Publish from Studio** | Upload sermons from your browser. Draft, review, and publish when you are ready. |
| `pipeline` | **We process your audio** | Troott handles encoding and delivery. You do not need to think about file formats or hosting. |
| `library` | **Organise your whole catalogue** | Series, topics, dates — old sermons stay as easy to find as this Sunday’s message. |
| `profile` | **A public ministry profile** | One link for your church, conference, or online followers to find every teaching. |
| `protect` | **Your name stays on your work** | Official uploads mean less mystery forwarding and more credited sharing. |
| `disciple` | **Disciple, don’t just broadcast** | Listeners follow, save, and return. You are building people, not chasing views. |

**Do not use** listener benefits copy (“Listen in the background”, “Works on mobile and web” as primary framing) on this page.

---

## Section 5 — Product workflows

**Component:** `ProductWorkflowsSection`  
**Data:** `ministerProductWorkflowsContent` (new export)

### Section header

| Element | Copy |
| ------- | ---- |
| Label | `WHY TROOTT` |
| Heading | `From upload to listener.` |
| Subtitle | `A workflow that fits how ministers already work — preach, upload, reach.` |
| **Default tab** | `studio` |

Reuse tab **structure** from `why-troott.ts` but minister-first labels and descriptions (same four tabs as Section 3, aligned copy).

---

## Section 6 — FAQ

**Component:** `FaqsSection`  
**Data:** `ministerFaqsContent` (new export)

### Section header

| Element | Copy |
| ------- | ---- |
| Label | `// FAQ` |
| Heading | `Questions?` |
| Heading muted | `We've got answers.` |

### Minister FAQ items

| ID | Question | Answer |
| -- | -------- | ------ |
| `minister-cost` | I'm a minister. What does it cost to share my sermons on Troott? | Uploading your sermons is free. Troott exists to help you grow your reach and disciple more people. |
| `how-upload` | How do I upload a sermon? | Sign in to Troott Studio, upload your audio file, add your title and details, and publish. Troott processes the audio and makes it available to listeners on mobile and web. |
| `piracy` | My sermons get shared without credit. How does Troott help? | Troott gives your ministry an official home. Listeners follow you, find your catalogue, and share links that point back to your profile — not a random repost. |
| `who-listens` | Who will hear my sermons? | People who already listen to faith-based audio — and listeners searching for ministers they trust. You grow by being findable, shareable, and consistent. |
| `team` | Can my ministry team help me upload? | Studio is built for ministry teams. You can manage your library together so uploading does not fall on one person every week. |
| `listener-app` | Do my listeners need a separate app? | Yes — listeners use the Troott mobile app to follow you, save sermons, and listen. You publish from Studio; they listen from the app. |

**Omit** listener-only FAQs (phone storage, playlist limits for listeners, etc.) from this page.

---

## Content we must not use on `/minister`

| Listener copy (wrong page) | Why |
| -------------------------- | --- |
| Discover / Follow ministers | Listener job — finding others’ content |
| Listen anywhere / Stream on iOS | Listener job — consumption |
| Share easily / Send to small group | Listener job — sharing someone else’s sermon |
| Get Troott as primary hero CTA | Listener conversion — secondary cross-link only |
| “Ad-free listening” as lead benefit | Listener value prop |

---

## Data file map (implementation)

| Content key | File | Used by |
| ----------- | ---- | ------- |
| `ministerHeroContent` | `_data/troott/audience-landing.ts` | `HeroSection` |
| `ministerLandingContent.valueProps` | `_data/troott/audience-landing.ts` | Value props grid |
| `ministerWhyTroottContent` | `_data/troott/minister-why-troott.ts` (proposed) | `WhyTroottTabsSection` |
| `ministerBenefitsContent` | `_data/troott/minister-benefits.ts` (proposed) | `BenefitsSection` |
| `ministerProductWorkflowsContent` | `_data/troott/minister-why-troott.ts` | `ProductWorkflowsSection` |
| `ministerFaqsContent` | `_data/troott/minister-faqs.ts` (proposed) | `FaqsSection` |

Shared section components accept an optional `content` prop (or audience-specific wrapper) so homepage keeps listener-first defaults.

---

## Acceptance criteria

- [ ] `/minister` hero, value props, and cross-link use **minister copy only** — no listener Discover / Listen / Share cards.
- [ ] Value props reflect **JTBD outcomes**: protect work, upload once, reach ready listeners.
- [ ] Primary hero CTA is **Upload sermons** (Studio); secondary is **Request demo** or **Contact Sales** fallback.
- [ ] `WhyTroottTabsSection` and `ProductWorkflowsSection` default to **Studio** tab on `/minister`.
- [ ] `BenefitsSection` on `/minister` uses **minister benefits** — not listener “Listen anywhere” grid.
- [ ] FAQ on `/minister` shows **minister questions only**.
- [ ] Tone is **simple conversational English** throughout — no jargon, no enterprise filler.
- [ ] Copy traceable to pains and promises in `content.txt` (piracy, distribution, discipleship, upload once).

---

## Related

- [feat-0015 Audience landings](../feat-0015/PRODUCT.md) — route shell and v1 structure
- [feat-0014 Legal](../feat-0014/PRODUCT.md) — `/legal/minister`
- [`content.txt`](../../../../apps/website/_data/content.txt) — source pains and market context
