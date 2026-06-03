/**
 * Studio empty-state layout — feat-0026.
 * Spec: specs/web/feature/feat-0026/EMPTY_STATE_LAYOUT_SPEC.md
 *
 * Empty copy is centered within page, region (contentStack), or panel boundaries.
 */
export const STUDIO_EMPTY_STATE = {
    inner: 'flex flex-col items-center justify-center gap-4 text-center',
    title: 'font-matter-medium text-lg leading-6 text-[#eaeaea]',
    description: 'max-w-sm font-matter text-sm leading-5 text-[#9d9d9d]',
    descriptionWide: 'max-w-md font-matter text-sm leading-5 text-[#9d9d9d]',
    /** Full main column — auth gates, full-page errors. */
    page: 'flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8',
    /** List/table zone under header + toolbar (My Sermons, Bin). */
    region: 'flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8',
    /** Card, chart, or tab panel. */
    panel:
        'flex min-h-[200px] flex-col items-center justify-center gap-4 p-8 text-center',
    panelTall:
        'flex min-h-[280px] flex-col items-center justify-center gap-4 p-8 text-center',
    /** Below a table header row (analytics breakdown helper). */
    panelCompact:
        'flex min-h-[120px] flex-col items-center justify-center gap-2 px-4 py-6 text-center',
    descriptionCompact:
        'max-w-sm text-center font-matter text-xs leading-5 text-[#bdbdbd]',
} as const;

export type StudioEmptyPlacement =
    | 'page'
    | 'region'
    | 'panel'
    | 'panelTall'
    | 'panelCompact';

export function studioEmptyPlacementClass(
    placement: StudioEmptyPlacement = 'region',
): string {
    switch (placement) {
        case 'page':
            return STUDIO_EMPTY_STATE.page;
        case 'panel':
            return STUDIO_EMPTY_STATE.panel;
        case 'panelTall':
            return STUDIO_EMPTY_STATE.panelTall;
        case 'panelCompact':
            return STUDIO_EMPTY_STATE.panelCompact;
        case 'region':
        default:
            return STUDIO_EMPTY_STATE.region;
    }
}
