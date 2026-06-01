# feat-0005: Tech Spec — Home and discovery rails

## Context

See [`PRODUCT.md`](./PRODUCT.md).

### Routes and layout

| Concern | Path |
| ------- | ---- |
| Home tab | `app/(tabs)/home/index.tsx`, `_layout.tsx` |
| See more | `app/see-more/sermons-for-you.tsx`, `similar-ministers.tsx`, `minister-seemore.tsx` |

### Data and hooks

| Concern | Path |
| ------- | ---- |
| Home screen hook | `engine/hooks/useHomeScreen.tsx` |
| Catalog / sermons | `api/hooks/app/useDiscovery.ts`, `api/clients/sermon.ts` |
| Recommendations DTO | `api/dtos/recommendation.dto.ts` |

### UI modules

| Concern | Path |
| ------- | ---- |
| Home features | `components/features/home/*` — `new-sermon`, `similar-ministers`, see-more sections |
| Play from card | `components/features/search/sermon-card.tsx` (shared), `use-play-from-catalog-list` |

### PRODUCT mapping

| Behaviors | Implementation |
| --------- | -------------- |
| 1–3 | Home scroll + React Query hooks + refresh |
| 4 | `useLastPlayed`, `use-resume-last-played`, home sections |
| 5–6 | Card handlers + `see-more` routes |
| 7 | Auth guard + user context |
| 8 | Root mini-player layout rules |
