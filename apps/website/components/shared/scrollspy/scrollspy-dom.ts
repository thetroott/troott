export function getSiteHeaderScrollOffsetPx(): number {
    if (typeof document === 'undefined') return 88;

    const root = document.documentElement;
    const headerRaw =
        getComputedStyle(root).getPropertyValue('--site-header-height').trim() ||
        '4rem';

    const probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.height = headerRaw;
    document.body.appendChild(probe);
    const headerPx = probe.offsetHeight;
    document.body.removeChild(probe);

    const rootFontSize = parseFloat(getComputedStyle(root).fontSize) || 16;
    return headerPx + 1.5 * rootFontSize;
}

export function sectionDomId(prefix: string, id: string): string {
    return `${prefix}-${id}`;
}

/** Where a section "counts" as active — below sticky nav, in the reading band. */
export function getActivationLinePx(): number {
    const headerOffset = getSiteHeaderScrollOffsetPx();
    const readingBand = Math.min(window.innerHeight * 0.2, 160);
    return headerOffset + readingBand;
}
