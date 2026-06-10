# feat-0012: Tech — Centered story headline + audience tags

## Context

See [PRODUCT.md](./PRODUCT.md). **New** centered homepage section with **inline pill image + emoji** in H2 and **hashtag audience pills**.

**Pixel tables:** [Section shell](./PRODUCT.md#section-shell), [Headline](./PRODUCT.md#headline-h2--pixel-spec), [Pill image](./PRODUCT.md#inline-pill-image-in-headline), [Pills row](./PRODUCT.md#audience-pills-row).

---

## Objective

1. Add `_data/troott/audience-story.ts` with segment-based headline.
2. Implement **`AudienceStorySection`** + **`AudienceStoryHeadline`** (segment renderer).
3. Wire homepage **after `BenefitsSection`**, before `FeatureHighlightSection`.
4. Pixel QA @ 1440px against `./assets/centered-story-headline-reference.png` (layout; dark palette per [D5](./PRODUCT.md#d5--troott-dark-adaptation)).

---

## Tech stack

| Layer | Choice |
| ----- | ------ |
| Framework | Next.js App Router (`apps/website`) |
| Images | `next/image` for inline pill |
| Styling | Tailwind — dark-only ([feat-0001](../feat-0001/PRODUCT.md)) |
| Data | `_data/troott/audience-story.ts` |

---

## Commands

```bash
pnpm dev:website
pnpm --filter @troott/website build
pnpm --filter @troott/website lint
```

Manual QA: 1440px / 375px — headline wrap, pill alignment, pill row wrap, screen reader on H2.

---

## Project structure

```text
apps/website/
├── _data/troott/audience-story.ts              # NEW — segments + tags
├── public/images/audience-story-inline.jpg     # NEW — pill crop (or webp)
├── components/containers/audience-story/
│   ├── AudienceStorySection.tsx               # NEW — section shell
│   ├── AudienceStoryHeadline.tsx              # NEW — segment map → h2
│   ├── AudienceStoryTags.tsx                  # NEW — pill row
│   └── index.ts
└── app/page.tsx                                 # wire after BenefitsSection
```

**Minimum v1:** data file + `AudienceStorySection.tsx` (single file OK if < 120 lines).

---

## Data model

```ts
// _data/troott/audience-story.ts
export type HeadlineSegment =
  | { type: 'text'; value: string }
  | {
      type: 'image';
      src: string;
      alt: string;
      width?: number;
      height?: number;
    }
  | { type: 'emoji'; value: string };

export type AudienceStoryContent = {
  id: 'audience-story';
  headline: HeadlineSegment[];
  subtext: string;
  audienceTags: string[];
};

export const audienceStoryContent: AudienceStoryContent = {
  id: 'audience-story',
  headline: [
    { type: 'text', value: 'Stay rooted in ' },
    {
      type: 'image',
      src: '/images/audience-story-inline.jpg',
      alt: 'Listener using Troott on mobile',
      width: 112,
      height: 48,
    },
    {
      type: 'text',
      value:
        ' sermons with an app that keeps your ministers, playlists, ',
    },
    { type: 'emoji', value: '🎧' },
    { type: 'text', value: ' and daily listening simple to follow.' },
  ],
  subtext: "Used by listeners to grow in God's Word.",
  audienceTags: ['#Listeners', '#Students', '#Families', '#Small groups'],
};
```

---

## Component implementation

### Section shell

```tsx
<section
  id="audience-story"
  aria-labelledby="audience-story-heading"
  className="bg-background py-24 sm:py-32 lg:py-40"
>
  <div className="container mx-auto max-w-7xl px-4 md:px-6">
    <div className="mx-auto max-w-[720px] text-center">
      <AudienceStoryHeadline
        id="audience-story-heading"
        segments={content.headline}
      />
      <p className="mt-5 text-base leading-normal text-zinc-400 md:text-lg">
        {content.subtext}
      </p>
      <AudienceStoryTags tags={content.audienceTags} />
    </div>
  </div>
</section>
```

### Headline segment renderer

```tsx
// AudienceStoryHeadline.tsx
export function AudienceStoryHeadline({
  id,
  segments,
}: {
  id: string;
  segments: HeadlineSegment[];
}) {
  return (
    <h2
      id={id}
      className="text-[2.25rem] font-bold leading-[1.15] tracking-[-0.02em] text-white md:text-5xl lg:text-[3.5rem]"
    >
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={index}>{segment.value}</span>;
        }
        if (segment.type === 'emoji') {
          return (
            <span key={index} className="mx-1 inline align-middle" aria-hidden="true">
              {segment.value}
            </span>
          );
        }
        return (
          <span
            key={index}
            className="relative mx-1.5 inline-block h-10 w-[5.5rem] shrink-0 align-middle overflow-hidden rounded-full md:h-12 md:w-28"
          >
            <Image
              src={segment.src}
              alt={segment.alt}
              fill
              className="object-cover"
              sizes="112px"
            />
          </span>
        );
      })}
    </h2>
  );
}
```

**Keys:** Prefer stable keys from segment hash in production; index OK for static v1 data.

### Audience tags

```tsx
<ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5 md:gap-3" aria-label="Who uses Troott">
  {tags.map((tag) => (
    <li
      key={tag}
      className="rounded-full bg-[#262626] px-4 py-2 text-sm font-medium text-zinc-300"
    >
      {tag}
    </li>
  ))}
</ul>
```

Use `<ul>` / `<li>` for list semantics (static labels, not links).

---

## Pixel QA checklist (@ 1440px)

| Check | Expected |
| ----- | -------- |
| Section `padding-y` @ lg | **160px** |
| Content `max-width` | **720px** |
| H2 `font-size` @ lg | **56px** (`3.5rem`) |
| Pill image height @ md+ | **48px** |
| Subtext `margin-top` | **20px** |
| Tags `margin-top` | **32px** |
| Tag `font-size` | **14px** |
| Tag horizontal gap @ md+ | **12px** |

Screenshot diff against `./assets/centered-story-headline-reference.png` (layout only; colors per dark table).

---

## Homepage integration

```tsx
// app/page.tsx
import { AudienceStorySection } from '@/components/containers/audience-story';

<BenefitsSection />
<AudienceStorySection />
<FeatureHighlightSection />
```

---

## Accessibility

| Requirement | Implementation |
| ----------- | -------------- |
| One H2 | `audience-story-heading` |
| Inline image | Unique `alt` per [R2](./PRODUCT.md#r2--inline-image-asset) |
| Emoji | `aria-hidden` — meaning in surrounding text |
| Tags | `aria-label="Who uses Troott"` on list; tags are not interactive |

---

## Implementation checklist

| Step | Task |
| ---- | ---- |
| 1 | Add `_data/troott/audience-story.ts` |
| 2 | Add inline pill asset under `public/images/` |
| 3 | `AudienceStoryHeadline` segment renderer |
| 4 | `AudienceStorySection` + tags row |
| 5 | Wire `page.tsx` after `BenefitsSection` |
| 6 | Pixel QA 1440 / 375 |
| 7 | `pnpm --filter @troott/website build` |

---

## Testing

| Type | Coverage |
| ---- | -------- |
| Manual | Pill vertically centered with adjacent text @ md+ |
| Manual | Headline wraps to ~3–4 lines @ 720px without broken pill |
| Manual | Tags wrap on 375px without overflow |
| Manual | VoiceOver reads headline as one sentence with image alt |
| Build | website build passes |

---

## Rollback

Remove `AudienceStorySection` from `page.tsx` and delete `audience-story/` folder — no other sections depend on it.
