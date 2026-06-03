# feat-0023: Single sermon analytics (row menu + edit sidebar)

## Summary

Studio users view **per-sermon analytics** for a published (or playable) sermon from **My Sermons** and from the **Sermon details** edit sidebar. The experience reuses the studio **Analytics** shell at `/studio/{studioCode}/analytics` but scopes charts, KPIs, and tables to one `sermonId`.

Design reference: Figma **Single sermon analytics** and the existing **Sermon Analytics** overview tab.

## Consumer

Authenticated **minister** or **creator** with studio access.

## User stories

1. As a user on **My Sermons**, I want **Analytics** on a row’s three-dot menu so I can see how that sermon performed without hunting through the overview table.
2. As a user on **Sermon details** (`/sermons/:id/edit`), I want **Analytics** in the left sidebar so I can switch from editing metadata to performance data in one click (YouTube Studio pattern).
3. As a user on the **Analytics overview**, I want clicking a sermon row in the breakdown table to open that sermon’s analytics (not a broken detail URL).
4. As a user, I want date range and granularity controls consistent with the overview tab so comparisons feel familiar.

## Success criteria

- **Analytics** in `SermonContextMenu` navigates to a **sermon-scoped** analytics view with the correct `sermonId`.
- **Analytics** in `SermonEditSidebar` uses the **same URL** as the row menu (parity).
- Layout matches **My Sermons** / studio analytics (full-width `#2b2a2c` canvas, shared filter and card components).
- Loading, empty, and error states are explicit; draft or zero-play sermons show zeros, not a crash.
- **Bin** rows do not offer sermon analytics (restore to library first).

## Normative spec

See **[SERMON_ANALYTICS_SPEC.md](./SERMON_ANALYTICS_SPEC.md)**.

## Related

- Studio analytics overview — `/studio/{code}/analytics` (`Analytics.tsx`, `AnalyticsOverview.tsx`)
- [feat-0022](../feat-0022/SERMON_EDIT_SPEC.md) — sermon edit sidebar (`SermonEditSidebar`)
- [feat-0020](../feat-0020/SERMON_GET_INFO_SPEC.md) — read-only metadata (complements analytics)
- [feat-0019](../feat-0019/PRODUCT.md) — library + bin (no analytics in bin menu)
- Legacy doc (empty): [`specs/web/06 - analytics.md`](../../06%20-%20analytics.md) — superseded by this feature for sermon scope

## Design references (Figma)

| Screen | Figma node | Use |
| --- | --- | --- |
| Single sermon analytics | [10408:36417](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10408-36417) | Normative layout for sermon-scoped view |
| Analytics overview / shell | [9974:29757](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=9974-29757) | Header, tabs, filters, card grid (reuse on sermon tab) |
