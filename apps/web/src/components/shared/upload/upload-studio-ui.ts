/**
 * Troott Studio upload modal — shared layout tokens from Figma
 * (4530:20801, 4530:21351, 4555:6094, 4558:8281) aligned with UploadEntryStepModal shell.
 */
export const UPLOAD_SHELL = {
    maxWidthClass: 'max-w-[827px]',
    widthClass: 'w-[min(827px,calc(100vw-2rem))]',
    minHeightClass: 'min-h-[min(620px,88vh)]',
    outerRadius: 'rounded-2xl',
    outerBg: 'bg-[#2b2a2c]',
    outerBorder: 'border border-[#545454]/50',
    headerMinH: 'min-h-[52px]',
    titleText: 'font-matter-medium text-[16px] leading-6 text-[#eaeaea] tracking-wide',
    /**
     * Tabs — Figma [`4558:8296`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4558-8296) vs shell [`4558:8282`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4558-8282):
     * **42px** tab column; **32px** inner row (`Frame 40448`) **top-aligned**; **`#eaeaea`**
     * shows as a **thin bar in the lower band** (42−32) below the pill, not a full-height stroke.
     * One leading icon per tab; **~6px** inset (`pl-1.5`), **~10px** before label (`gap-2.5`).
     */
    tabButtonBase:
        '-mb-px flex h-[42px] shrink-0 flex-col items-stretch bg-transparent px-1 transition-colors md:px-1.5',
    tabButtonInactive: 'text-[#bdbdbd] hover:text-[#eaeaea]/85',
    tabFlexGrowBeforeLine: 'min-h-0 flex-1',
    tabActiveLine: 'h-0.5 w-full shrink-0 rounded-full bg-[#eaeaea]',
    tabInactiveLine: 'h-0.5 w-full shrink-0 bg-transparent',
    tabInnerRow:
        'flex h-8 min-h-[32px] max-h-8 w-full min-w-0 shrink-0 items-center rounded-md pl-1.5 pr-2 font-matter-medium text-[14px] leading-5 tracking-wide gap-2.5',
    /**
     * Inactive only — optional inner chip (`Frame 40449` in Figma) for wider tabs.
     */
    tabInnerInactiveGhost: 'border border-transparent bg-transparent',
    tabInnerInactivePill: 'border border-transparent bg-[#242325]',
    /** Active inner chip — Figma `Frame 40448` on `4558:8298`. */
    tabInnerActive: 'border border-[#545454]/50 bg-[#545454]/50 text-[#eaeaea]',
    tabIcon: 'h-4 w-4 shrink-0 object-contain pointer-events-none',
    tabIconActive: 'opacity-100',
    tabIconInactive: 'opacity-90',
    divider: 'h-4 w-px shrink-0 bg-[#545454]/50',
    contentCard:
        'rounded-lg border border-[#707070] bg-[#333234] min-h-[min(337px,45vh)]',
    footerBg: 'bg-[#333234]',
    footerMinH: 'min-h-[48px]',
    /** Footer status strip on Details / Listener (Figma `4535:21468`, `4499:19755`). */
    footerStatusIcon: 'h-5 w-5 shrink-0 text-[#bdbdbd]',
    /**
     * [@iconify/react](https://iconify.design/) — footer leading upload glyph ([`4535:21472`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4535-21472)).
     * [Material Symbols — `upload-file-outline`](https://icon-sets.iconify.design/material-symbols/upload-file-outline/).
     */
    iconifyFooterUploadGlyph: 'material-symbols:upload-file-outline',
    /**
     * Iconify — success mark beside “Upload complete” ([`6147:67799`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6147-67799)).
     * [Material Symbols — `check-circle`](https://icon-sets.iconify.design/material-symbols/check-circle/).
     */
    iconifyFooterUploadSuccessGlyph: 'material-symbols:check-circle',
    /**
     * Details step — hint icon after “Title (required)” / “Description (required)”
     * ([`4506:21929`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4506-21929), [`4506:21913`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4506-21913)).
     * [Material Symbols — `info-outline`](https://icon-sets.iconify.design/material-symbols/info-outline/).
     */
    iconifyFieldLabelHintGlyph: 'material-symbols:info-outline',
    footerStatusText: 'min-w-0 truncate font-matter text-[13px] leading-5 text-[#eaeaea]',
    footerStatusMuted: 'font-matter text-[12px] leading-4 text-[#707070]',
    footerLinkField:
        'flex flex-1 items-center gap-2 rounded-md border border-[#545454]/60 bg-[#242325] px-3 py-2.5',
    primaryCta:
        'h-[34px] min-h-[34px] rounded-md bg-[#08ffdb] px-3 font-matter-medium text-[12px] leading-[18px] tracking-wide text-[#292929] shadow-none hover:bg-[#07e8c9]',
    ghostCta:
        'h-[26px] min-h-[26px] rounded-md border-0 bg-transparent px-2 font-matter-medium text-[12px] leading-[18px] tracking-wide text-[#eaeaea] hover:bg-white/5',
    /**
     * Bordered studio secondary — Cancel upload (progress) + Remove audio on complete.
     * Figma details / destructive-adjacent control [`4660:6496`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4660-6496).
     */
    studioOutlineCta:
        'h-[38px] min-w-[151px] rounded-md border border-[#707070] bg-transparent font-matter-medium text-[14px] leading-5 tracking-wide text-[#eaeaea] shadow-none hover:bg-white/5',
    studioOutlineCtaDisabled: 'pointer-events-none text-[#707070] opacity-80',
    progressTrack: 'h-1.5 w-full max-w-[394px] rounded-md bg-[#9d9d9d]',
    progressFill: 'h-full rounded-md bg-[#6f94b8] transition-[width] duration-300',
    mutedLabel: 'font-matter text-[14px] leading-5 text-[#bdbdbd] tracking-wide',
    mediumLabel: 'font-matter-medium text-[14px] leading-5 text-[#bdbdbd] tracking-wide',
} as const;

/**
 * Upload page **source** strip (Upload / Import / Create / …).
 * Figma: default row [`4286:11723`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4286-11723),
 * selected state [`4286:11725`](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=4286-11725).
 * Chips: **207×70** min, **8px** radius, **8px** icon–label gap, **16px** between chips, label **12 / 18** Matter Medium.
 */
export const UPLOAD_OPTIONS_BAR = {
    railBg: 'bg-[#171717]',
    railDivider: 'border-b border-[#545454]/50',
    /** Inner track — aligns with studio main `container` gutters. */
    inner: 'mx-auto w-full max-w-7xl px-4 py-3 md:px-6',
    chipRow:
        'scrollbar-none flex min-w-0 flex-nowrap items-stretch justify-start gap-4 overflow-x-auto md:justify-center',
    chipBase:
        'flex min-h-[70px] w-[207px] shrink-0 cursor-pointer flex-row items-center gap-2 rounded-lg border px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#08ffdb]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717] disabled:pointer-events-none disabled:opacity-50',
    chipInactive:
        'border-[#545454]/50 bg-[#1a1a1a] text-[#eaeaea] hover:bg-[#242325]',
    chipActive:
        'border-[#545454]/50 bg-white text-[#1a1a1a] hover:bg-white/90',
    label:
        'min-w-0 flex-1 font-matter-medium text-[12px] leading-[18px] tracking-wide whitespace-normal text-left line-clamp-2',
    labelInactive: 'text-[#eaeaea]',
    labelActive: 'text-[#1a1a1a]',
    icon: 'h-8 w-8 shrink-0 object-contain',
} as const;

export const UPLOAD_STEP_TABS = [
    {
        key: 'progress' as const,
        label: 'Uploads',
        iconSrc: '/images/assets/upload-progress.svg',
        /** Figma inactive “Details” style: transparent inner. */
        inactiveInner: 'ghost' as const,
    },
    {
        key: 'details' as const,
        label: 'Details',
        iconSrc: '/images/assets/details.svg',
        inactiveInner: 'ghost' as const,
    },
    {
        key: 'settings' as const,
        label: 'Listener settings',
        iconSrc: '/images/assets/listener.svg',
        /** Figma `Frame 40449`: fill `#2b2a2c` inner pill when not active. */
        inactiveInner: 'pill' as const,
    },
    {
        key: 'review' as const,
        label: 'Review & Submit',
        iconSrc: '/images/assets/review.svg',
        inactiveInner: 'pill' as const,
    },
] as const;
