/**
 * Sermon edit page layout — full-viewport “Sermon details” (feat-0022).
 * Reference: specs/web/feature/feat-0022/assets/reference-youtube-studio-video-details.png
 * Figma: `11574:98157`, `11578:98647`, `11574:98156`.
 */
export const SERMON_EDIT = {
    /** Fills studio main column beside persistent AppSidebar (feat-0034). */
    page: 'flex min-h-0 min-w-0 flex-1 flex-col bg-[#2b2a2c] text-[#eaeaea]',
    shell: 'flex min-h-0 min-w-0 flex-1',
    /** Left “Channel content” column — Figma `11574:98156`. */
    sidebar:
        'flex w-[240px] shrink-0 flex-col border-r border-[#545454]/50 bg-[#242325]',
    sidebarBack:
        'inline-flex items-center gap-2 px-4 py-3 font-matter text-sm text-[#bdbdbd] transition-colors hover:text-[#eaeaea]',
    sidebarPreview: 'border-b border-[#545454]/50 px-4 py-4',
    sidebarThumb:
        'mb-3 aspect-video w-full overflow-hidden rounded-md border border-[#545454]/50 bg-[#2b2a2c]',
    sidebarPreviewLabel:
        'font-matter text-xs leading-[18px] text-[#9d9d9d]',
    sidebarPreviewTitle:
        'line-clamp-2 font-matter-medium text-sm leading-5 text-[#eaeaea]',
    sidebarNav: 'flex min-h-0 flex-1 flex-col gap-0.5 px-2 py-3',
    sidebarNavItem:
        'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left font-matter text-sm leading-5 text-[#bdbdbd] transition-colors hover:bg-white/[0.06] hover:text-[#eaeaea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08ffdb]/40',
    sidebarNavItemActive:
        'bg-[#545454]/50 text-[#eaeaea] hover:bg-[#545454]/50 hover:text-[#eaeaea]',
    sidebarNavItemDisabled:
        'cursor-not-allowed opacity-45 hover:bg-transparent hover:text-[#bdbdbd]',
    sidebarNavIcon: 'inline-flex shrink-0 text-[#bdbdbd]',
    sidebarFooter:
        'mt-auto border-t border-[#545454]/50 px-2 py-3',
    sidebarFooterLink:
        'flex w-full items-center gap-3 rounded-sm px-3 py-2 font-matter text-sm text-[#bdbdbd] transition-colors hover:bg-white/[0.06] hover:text-[#eaeaea]',
    contentColumn: 'flex min-h-0 min-w-0 flex-1 flex-col',
    header:
        'sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[#545454]/50 bg-[#2b2a2c] px-4',
    headerTitle:
        'truncate font-matter-medium text-base leading-6 tracking-[0.16px]',
    headerActions: 'flex shrink-0 items-center gap-2',
    /** Scrollable body — full width of content column (same 16px inset as My Sermons). */
    main: 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden',
    mainInner:
        'box-border w-full min-w-0 max-w-none px-4 pb-6 pt-4',
    grid: 'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]',
    section:
        'rounded-lg border border-[#545454]/50 bg-[#333234]/40 p-4 sm:p-5',
    sectionTitle:
        'mb-4 font-matter-medium text-sm leading-5 tracking-[0.14px] text-[#eaeaea]',
    label: 'mb-1.5 block font-matter-medium text-xs leading-[18px] text-[#bdbdbd]',
    input:
        'h-10 w-full rounded-md border border-[#545454]/60 bg-[#242325] px-3 font-matter text-sm text-[#eaeaea] placeholder:text-[#707070] focus-visible:border-[#545454] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#08ffdb]/40',
    textarea:
        'min-h-[160px] w-full resize-y rounded-md border border-[#545454]/60 bg-[#242325] px-3 py-2 font-matter text-sm leading-5 text-[#eaeaea] placeholder:text-[#707070] focus-visible:border-[#545454] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#08ffdb]/40',
    sidebarCard:
        'rounded-lg border border-[#545454]/50 bg-[#333234] p-4 space-y-4',
    previewBox:
        'flex aspect-video w-full flex-col items-center justify-center rounded-md border border-[#545454]/50 bg-[#242325]',
    metaRow: 'flex flex-col gap-1',
    metaLabel: 'font-matter text-xs leading-[18px] text-[#9d9d9d]',
    metaValue:
        'font-matter text-sm leading-5 text-[#eaeaea] break-all',
    banner:
        'rounded-md border border-[#545454]/50 bg-[#333234] px-3 py-2 font-matter text-sm text-[#bdbdbd]',
    bannerWarn:
        'rounded-md border border-[#8f3628]/40 bg-[#8f3628]/15 px-3 py-2 font-matter text-sm text-[#fddcd8]',
    loadingShell:
        'flex min-h-0 flex-1 flex-col items-center justify-center gap-3 bg-[#2b2a2c] text-[#9d9d9d]',
} as const;
