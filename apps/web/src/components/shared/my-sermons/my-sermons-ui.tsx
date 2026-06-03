import { cn } from '@/lib/utils';

/**
 * My Sermons page shell — header, tabs, toolbar (`10148:31933`, `10148:31945`, `10148:31951`)
 * on layout [`10154:35083`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35083),
 * grid context [`10169:42706`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10169-42706).
 * Title leading mark: Figma **Component 4** on [`10148:31933`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10148-31933) — Iconify mic path (`viewBox="0 0 256 256"`), **20×20** via `SermonTitleMicGlyph`.
 * Audio glyph [`4902:7878`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4902-7878) — Iconify waveform path (`viewBox="0 0 56 56"`), rendered **34×34** with `currentColor` (see `SermonListAudioGlyph`).
 * Column **1200px**; horizontal inset **16px** (`7668 - 7652`); chrome stack **154px** (`56 + 42 + 56`).
 */
export const MY_SERMONS_PAGE = {
    /** Page background — Figma [`10154:35083`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35083) canvas `#2b2a2c` (`Frame 1618868833`). */
    pageBg: 'bg-[#2b2a2c]',
    /** Fill studio `main` and pass height to `contentStack` / region empty states (feat-0026). */
    pageRoot: 'flex min-h-0 flex-1 flex-col',
    /** Full width of `main` with **16px** horizontal inset (Figma gutter), no centered max-width rail. */
    mainColumn:
        'box-border flex min-h-0 w-full min-w-0 max-w-none flex-1 flex-col px-4 pb-2 pt-2',
    /** Header + tabs + toolbar — **154px** total; bottom stroke separates from table (`Frame 1618868833`). */
    chromeStack: 'w-full shrink-0 border-b border-[#545454]/50 bg-[#2b2a2c]',
    /** Table + pagination column (column flex; footer uses `contentWithFooter` + `contentScroll`). */
    contentStack: 'flex min-h-0 flex-1 flex-col',
    /** Fills space under chrome; pagination is last child (`shrink-0`). */
    contentWithFooter: 'flex min-h-0 flex-1 flex-col',
    /** Scrollable list/grid only — keeps pagination pinned to viewport bottom. */
    contentScroll: 'min-h-0 flex-1 overflow-auto',
    /** Title row — **56px** (`Frame 1618868817`). */
    headerRow: 'flex h-14 w-full items-center justify-between',
    /** Title + **Component 4** cluster; **8px** gap (`7696 − 7688`). */
    titleCluster: 'flex min-w-0 flex-1 items-center gap-2',
    /** **20×20** icon slot (`Component 4`). */
    titleIconWrap:
        'inline-flex h-5 w-5 shrink-0 items-center justify-center text-[#eaeaea]',
    title: 'font-matter-medium text-base leading-6 tracking-[0.16px] text-[#eaeaea]',
    /** Primary CTA — **32** tall, radius **6**, `#08ffdb` / `#1f2020` (`Button`). */
    createCta:
        'inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-md bg-[#08ffdb] px-4 font-matter-medium text-sm leading-5 tracking-[0.14px] text-[#1f2020] transition-[filter,opacity] hover:brightness-110 active:brightness-95 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/50',
    /** Tabs — **42px** row, bottom stroke `#545454` (`Frame 1618868806`). */
    tabStrip:
        'mt-0 flex h-[42px] w-full items-stretch border-b border-[#545454]',
    tabBtn: 'relative flex h-[42px] min-w-[62px] cursor-pointer items-center justify-center px-2 font-matter-medium text-sm leading-5 tracking-[0.14px] text-[#eaeaea] transition-colors hover:bg-white/[0.06] hover:text-[#eaeaea]',
    tabBtnActive:
        'after:pointer-events-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-t after:bg-[#eaeaea]',
    tabBtnInactive: 'text-[#eaeaea]/70 hover:text-[#eaeaea]',
    /** Toolbar — **56px** band (`Frame 1618868816`). */
    toolbarRow: 'mt-0 flex h-14 w-full items-center justify-between gap-4',
    toolbarLeft: 'flex min-w-0 flex-1 items-center gap-2',
    toolbarRight: 'flex shrink-0 items-center gap-2',
    /** Search field — max **190px** wide, grows on narrow viewports; radius **8**. */
    searchWrap:
        'relative h-8 w-full min-w-0 max-w-[190px] shrink-[1] basis-[min(100%,190px)]',
    searchIcon:
        'pointer-events-none absolute left-2 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#bdbdbd]',
    searchInput:
        'h-8 w-full cursor-text rounded-lg border border-[#545454]/50 bg-transparent py-0 pl-[34px] pr-3 font-matter text-sm leading-5 tracking-[0.14px] text-[#eaeaea] placeholder:text-[#bdbdbd] placeholder:opacity-100 focus-visible:border-[#545454] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#08ffdb]/40',
    /** Filters / Sort — **32** tall, radius **6**, fill `#2b2a2c`, label `#bdbdbd`. */
    pillBtn:
        'inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-transparent bg-[#2b2a2c] px-2 font-matter-medium text-sm leading-5 tracking-[0.14px] text-[#bdbdbd] transition-[color,background-color,border-color] hover:border-[#545454]/40 hover:bg-[#353437] hover:text-[#eaeaea] active:bg-[#3d3c3f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/30',
    pillBtnIcon: 'h-4 w-4 shrink-0 opacity-90',
    /** Grid / list segmented control — **54×30**, radius **7**, fill `#000` @ 93%, stroke `#545454` @ 50%. */
    viewToggle:
        'inline-flex h-[30px] w-[54px] shrink-0 items-center justify-center gap-0 rounded-[7px] border border-[#545454]/50 bg-black/90 p-[3px]',
    viewToggleBtn:
        'inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[5px] text-[#bdbdbd] transition-[color,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/30',
    viewToggleBtnActive:
        'bg-[#545454]/50 text-[#eaeaea] hover:bg-[#5c5c5e]/70 hover:text-[#eaeaea]',
    viewToggleBtnIdle: 'text-[#bdbdbd] hover:bg-white/10 hover:text-[#eaeaea]',
    /** Pagination — **65px**, fill `#333234`, top stroke (`Frame 1618868917`). */
    paginationBar:
        'flex h-[65px] w-full shrink-0 items-center gap-3 border-t border-[#545454]/50 bg-[#333234] pl-2 pr-4',
    paginationCluster: 'flex items-center gap-2',
    /** **32×32** icon host (INSTANCE chip in file). */
    paginationNavBtn:
        'inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded bg-[#333234] text-[#eaeaea] transition-colors hover:bg-white/10 active:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40',
    paginationRange:
        'font-matter text-sm font-normal leading-5 tracking-[0.14px] text-[#eaeaea]',
    pageSelect:
        'box-border h-[33px] min-w-[56px] cursor-pointer rounded border border-[#545454]/50 bg-[#333234] px-2 text-center font-matter-medium text-sm leading-5 tracking-[0.14px] text-[#eaeaea] transition-colors hover:border-[#6a6a6a] hover:bg-[#3a393c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/30',
} as const;

/**
 * My Sermons — list / table (studio dark).
 * Figma: table [`10154:35090`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35090),
 * variants [`10154:35083`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35083),
 * list row + duration under title [`10154:35082`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35082),
 * toolbar [`10148:31932`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10148-31932),
 * [`10148:31922`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10148-31922),
 * [`10148:31951`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10148-31951).
 */
export const MY_SERMONS_LIST = {
    /** Table block — flush with pagination; canvas `#2b2a2c` when horizontal scroll shows gutter (`Frame 1618869364`). */
    scrollWrap: 'w-full overflow-x-auto bg-[#2b2a2c]',
    table: 'w-full min-w-[1080px] table-fixed border-separate border-spacing-0 text-left',
    thead: 'border-b border-[#545454]/50 bg-[#333234]',
    /** Header row — height **46** (Figma `Frame 1618868828`). */
    theadRow:
        'h-[46px] [&>th]:h-[46px] [&>th]:align-middle [&>th]:whitespace-nowrap [&>th]:font-matter [&>th]:text-[12px] [&>th]:font-normal [&>th]:leading-[18px] [&>th]:text-[#bdbdbd]',
    thCell: 'box-border px-4 py-0 first:pl-4 last:pr-4',
    /** Date / status / visibility / stats — extra horizontal breathing room. */
    thCellMetric: 'px-5',
    thSortableInner: 'inline-flex items-center gap-2 whitespace-nowrap',
    /** Date column sort badge — 20×20 circle `#8f3628` + arrow (Figma `Frame 1618868830`). */
    thSortBadge:
        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8f3628] text-white',
    /**
     * Row default + hover — Figma [`10252:56164`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10252-56164) (`Property 1=Variant5`): fill `#545454` @ **50%** over list surface.
     */
    tbodyRow:
        'group/sermon-row box-border h-[64px] bg-[#333234] transition-[background-color] duration-150 hover:bg-[rgb(84_84_84/0.5)]',
    /** Hover-only quick actions (edit / link) — `Frame 1618869380`, **24×24**, radius **3**, gap **4**. */
    rowQuickActionsWrap:
        'flex shrink-0 items-center gap-1 opacity-0 pointer-events-none transition-opacity duration-150 group-hover/sermon-row:pointer-events-auto group-hover/sermon-row:opacity-100',
    rowQuickActionBtn:
        'inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-[3px] border border-[#545454] bg-[#2b2a2c] text-[#eaeaea] transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/40',
    tdCell:
        'box-border h-[64px] border-b border-[#545454]/50 px-4 py-0 align-middle whitespace-nowrap first:pl-4 last:pr-4',
    tdCellMetric: 'px-5',
    /** Sermon title column — only flexible column; allows truncate inside cell. */
    tdCellSermon: 'min-w-0 max-w-0',
    /** Native checkbox — **18×18**, radius **4**, stroke `#9d9d9d` (Component 89). */
    checkbox:
        'h-[18px] w-[18px] shrink-0 cursor-pointer rounded border border-[#9d9d9d] bg-[#242325] text-[#08ffdb] accent-[#08ffdb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#333234]',
    title: 'font-matter-medium text-[14px] leading-5 tracking-[0.14px] text-[#eaeaea]',
    /** Audio length under title — Matter 12/18 `#9d9d9d` ([`10154:35082`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10154-35082)). */
    duration:
        'mt-0.5 font-matter text-[12px] font-normal leading-[18px] tracking-[0.24px] text-[#9d9d9d] tabular-nums',
    date: 'font-matter-medium text-[14px] leading-5 tracking-[0.14px] text-[#eaeaea]',
    stat: 'font-matter-medium text-[14px] leading-5 tracking-[0.14px] text-[#eaeaea] tabular-nums',
    likesCell:
        'font-matter-medium text-[14px] leading-5 tracking-[0.14px] text-[#eaeaea]',
    /** Row kebab host — **46×46**, fill `#333234`, radius **4** (`Frame 1618869360`). */
    rowActionTrigger:
        'inline-flex h-[46px] w-[46px] shrink-0 cursor-pointer items-center justify-center rounded bg-[#333234] text-[#bdbdbd] transition-colors hover:bg-white/[0.06] hover:text-[#eaeaea] active:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/40',
    /** Wrapper inside last `td` — centers **46×46** kebab host in the **64px** row. */
    tdActionInner:
        'flex h-[64px] w-[46px] max-w-[46px] items-center justify-center',
    thCheckboxInner: 'flex h-[46px] w-full items-center justify-center',
    tdCheckboxInner: 'flex h-[64px] w-full items-center justify-center',
} as const;

/**
 * **Table** status pill (`Frame 1618869379` on `10154:35090` / `10154:35083`).
 * Not the same as grid **Component 94** — list uses filled pills + label colors from this frame.
 */
export function SermonTableStatusPill({
    status,
    className,
}: {
    status?: 'published' | 'draft';
    className?: string;
}) {
    const draft = status === 'draft';
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 font-matter-medium text-[12px] leading-[18px] tracking-[0.24px]',
                draft
                    ? 'bg-[#8f3628] text-[#fddcd8]'
                    : 'bg-[#253f56] text-[#d4e0f2]',
                className,
            )}
        >
            {draft ? 'Draft' : 'Published'}
        </span>
    );
}

/**
 * **Component 94** — grid card status (`10169:46093`).
 * Published: dot `#6f94b8`. Draft: dot `#fddcd8`.
 */
export function SermonStatusBadge({
    status,
    className,
}: {
    status?: 'published' | 'draft';
    className?: string;
}) {
    const draft = status === 'draft';
    return (
        <span
            className={cn(
                'inline-flex h-[22px] max-w-full shrink-0 items-center gap-1.5 rounded-md bg-[#333234] pl-2 pr-2.5 font-matter-medium text-[12px] leading-[18px] text-[#eaeaea] tracking-[0.02em]',
                className,
            )}
        >
            <span
                className={cn(
                    'h-2.5 w-2.5 shrink-0 rounded-full',
                    draft ? 'bg-[#fddcd8]' : 'bg-[#6f94b8]',
                )}
                aria-hidden
            />
            {draft ? 'Draft' : 'Published'}
        </span>
    );
}

/**
 * My Sermons — **grid** card (`Frame 1618869374` instance).
 * Figma: [`10169:46093`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10169-46093) — **280×328**, radius **16**, media **256** tall, footer **72** + top stroke `#545454`.
 */
export const MY_SERMONS_GRID = {
    wrap: 'w-full',
    grid: 'grid w-full grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    /** Card: 280×328, #2b2a2c, 16px radius (no outer stroke on component instance). */
    card: 'flex h-[328px] w-[280px] max-w-full flex-col overflow-hidden rounded-[16px] bg-neutral-900',
    /** Upper block 280×256 — same fill as card; three bands: 38 + flex + 40. */
    mediaStack: 'flex h-[256px] w-full shrink-0 flex-col bg-neutral-900',
    mediaHeader:
        'flex h-[38px] shrink-0 items-start justify-end px-3 pt-2 pb-0',
    mediaMain: 'flex min-h-0 flex-1 flex-col items-center justify-center px-3',
    /** 60×60, radius 20, fill #333234, stroke #545454 — waveform sits ~34×34 inside. */
    iconTile:
        'flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[20px] border border-[#545454] bg-[#333234]',
    mediaFooter:
        'flex h-[40px] shrink-0 items-center justify-end px-3 pb-2 pt-0',
    /** Duration chip — fill #2b2a2c, radius 4, Matter 14/20 #eaeaea (node `…45986`). */
    durationChip:
        'rounded bg-[#2b2a2c] px-2 py-1 font-matter-medium text-[14px] leading-5 tracking-[0.14px] text-[#eaeaea]',
    /** Footer: **72px** total (`pt-4` + title 20 + `mt-1` + date 18 + `pb-3.5` = 72). */
    body: 'box-border flex h-[72px] shrink-0 flex-row items-start gap-3 border-t border-[#545454] px-4 pb-3.5 pt-4',
    textCol: 'min-w-0 flex-1',
    cardTitle:
        'truncate font-matter-medium text-[14px] leading-5 tracking-[0.14px] text-[#eaeaea]',
    /** Secondary date — #9d9d9d Matter 12/18 (node `…46005`). */
    cardDate:
        'mt-1 font-matter text-[12px] leading-[18px] tracking-[0.02em] text-[#9d9d9d]',
    /** Kebab host — #252525, 24×24, radius 4 (`Frame 1618868820`). */
    gridMenuTrigger:
        'inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded bg-[#252525] text-[#eaeaea] transition-[background-color,opacity] hover:bg-[#323232] hover:opacity-100 active:bg-[#3a3a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/40',
} as const;

/** Iconify mic path (256×256 viewBox), scaled to **20×20** for page title. */
const SERMON_TITLE_MIC_D =
    'M168 20a68.08 68.08 0 0 0-68 68a67 67 0 0 0 .82 10.49l-70.48 96.1a11.94 11.94 0 0 0 1.2 15.58l14.29 14.3a11.95 11.95 0 0 0 15.58 1.19l96.11-70.48A68 68 0 1 0 168 20m60 68a59.7 59.7 0 0 1-14.87 39.47l-84.59-84.6A59.94 59.94 0 0 1 228 88M56.68 219.21a4 4 0 0 1-5.2-.4l-14.29-14.29a4 4 0 0 1-.4-5.2l66.46-90.62a68.31 68.31 0 0 0 44.05 44.05ZM108 88a59.77 59.77 0 0 1 14.87-39.47l84.6 84.6A60 60 0 0 1 108 88m-1.17 61.17a4 4 0 0 1 0 5.65l-8 8a4 4 0 1 1-5.65-5.65l8-8a4 4 0 0 1 5.66-.01Z';

/**
 * Title mic — Figma [`10148:31933`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10148-31933), same path as Iconify (**20×20**).
 */
export function SermonTitleMicGlyph({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            width={20}
            height={20}
            className={cn('block h-5 w-5 shrink-0', className)}
            aria-hidden
        >
            <path fill="currentColor" d={SERMON_TITLE_MIC_D} />
        </svg>
    );
}

/** Iconify waveform (56×56 viewBox), scaled to **34×34** for list/grid. */
const SERMON_LIST_AUDIO_WAVE_D =
    'M24.59 49.574c.96 0 1.664-.726 1.664-1.64V8.066c0-.914-.703-1.64-1.664-1.64c-.938 0-1.64.726-1.64 1.64v39.868c0 .914.702 1.64 1.64 1.64m13.64-4.687c.938 0 1.641-.75 1.641-1.664V12.777c0-.914-.703-1.664-1.64-1.664c-.938 0-1.665.75-1.665 1.664v30.446c0 .914.727 1.664 1.664 1.664M17.793 41.09c.938 0 1.64-.727 1.64-1.64v-22.9c0-.913-.703-1.64-1.64-1.64c-.961 0-1.664.727-1.664 1.64v22.9c0 .913.703 1.64 1.664 1.64m13.617-2.531c.938 0 1.664-.727 1.664-1.641V19.082c0-.914-.726-1.64-1.664-1.64s-1.64.726-1.64 1.64v17.836c0 .914.703 1.64 1.64 1.64m13.64-4.196c.938 0 1.641-.75 1.641-1.664V23.3c0-.914-.703-1.664-1.64-1.664a1.64 1.64 0 0 0-1.664 1.664v9.398a1.64 1.64 0 0 0 1.664 1.664m-34.077-1.851c.937 0 1.64-.727 1.64-1.64v-5.743c0-.914-.703-1.64-1.64-1.64c-.961 0-1.664.726-1.664 1.64v5.742c0 .914.703 1.64 1.664 1.64';

/**
 * Audio waveform — Figma [`4902:7878`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4902-7878), same path as Iconify (**34×34**).
 */
export function SermonListAudioGlyph({
    className,
    size = 'md',
}: {
    className?: string;
    /** `sm` — **16×16** list row (`Component 36` on [`10252:56164`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=10252-56164)); `md` — **34×34** grid / legacy list. */
    size?: 'sm' | 'md';
}) {
    const dim = size === 'sm' ? 'h-4 w-4' : 'h-[34px] w-[34px]';
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 56 56"
            width={size === 'sm' ? 16 : 34}
            height={size === 'sm' ? 16 : 34}
            className={cn(
                'shrink-0 text-[#bdbdbd] transition-colors group-hover/sermon-row:text-[#eaeaea]',
                dim,
                className,
            )}
            aria-hidden
        >
            <path fill="currentColor" d={SERMON_LIST_AUDIO_WAVE_D} />
        </svg>
    );
}
